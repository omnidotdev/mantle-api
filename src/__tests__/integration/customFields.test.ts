import { describe, expect, test } from "bun:test";

import { setupTestContext } from "test/setup/testContext";

const ORG = "org-custom-fields";
const owner = { id: "user-cf-owner", name: "Owner" };
const member = { id: "user-cf-member", name: "Member" };

const CREATE_FIELD = /* GraphQL */ `
  mutation CreateCustomField($input: CreateCustomFieldInput!) {
    createCustomField(input: $input) {
      customField {
        rowId
        options
      }
    }
  }
`;

const UPDATE_FIELD = /* GraphQL */ `
  mutation UpdateCustomField($input: UpdateCustomFieldInput!) {
    updateCustomField(input: $input) {
      customField {
        rowId
      }
    }
  }
`;

const DELETE_FIELD = /* GraphQL */ `
  mutation DeleteCustomField($input: DeleteCustomFieldInput!) {
    deleteCustomField(input: $input) {
      customField {
        rowId
      }
    }
  }
`;

const CREATE_PERSON = /* GraphQL */ `
  mutation CreatePerson($input: CreatePersonInput!) {
    createPerson(input: $input) {
      person {
        rowId
        customFields
      }
    }
  }
`;

const UPDATE_PERSON = /* GraphQL */ `
  mutation UpdatePerson($input: UpdatePersonInput!) {
    updatePerson(input: $input) {
      person {
        rowId
        customFields
      }
    }
  }
`;

const OPTIONS = [
  { id: "lead", label: "Lead" },
  { id: "qualified", label: "Qualified" },
  { id: "customer", label: "Customer" },
];

describe("custom fields", () => {
  const ctx = setupTestContext();

  const asOwner = () => ctx.graphqlAs(owner, [ORG], ["owner"]);
  const asMember = () => ctx.graphqlAs(member, [ORG], ["member"]);

  const createStage = async () => {
    const res = await asOwner().execute<{
      createCustomField: { customField: { rowId: string } };
    }>(CREATE_FIELD, {
      input: {
        customField: {
          organizationId: ORG,
          entity: "person",
          label: "Qualification",
          type: "select",
          options: OPTIONS,
        },
      },
    });
    expect(res.errors).toBeUndefined();
    return res.data!.createCustomField.customField.rowId;
  };

  const createPerson = async (customFields: Record<string, unknown>) =>
    asMember().execute<{
      createPerson: { person: { rowId: string; customFields: unknown } };
    }>(CREATE_PERSON, {
      input: {
        person: {
          organizationId: ORG,
          firstName: "Sam",
          lastName: "Whitaker",
          customFields,
        },
      },
    });

  const storedValues = async (personId: string) =>
    (
      await ctx.pool.query<{ custom_fields: Record<string, unknown> }>(
        "select custom_fields from person where id = $1",
        [personId],
      )
    ).rows[0]!.custom_fields;

  test("an owner defines a field and a member fills it in", async () => {
    const stage = await createStage();

    const res = await createPerson({ [stage]: "qualified" });
    expect(res.errors).toBeUndefined();
    expect(res.data?.createPerson.person.customFields).toEqual({
      [stage]: "qualified",
    });
  });

  test("a member cannot define fields", async () => {
    const res = await asMember().execute<{
      createCustomField: { customField: { rowId: string } } | null;
    }>(CREATE_FIELD, {
      input: {
        customField: {
          organizationId: ORG,
          entity: "person",
          label: "Budget",
          type: "number",
        },
      },
    });
    expect(res.errors).toBeDefined();
    expect(res.data?.createCustomField ?? null).toBeNull();
  });

  test("refuses a value that is not one of the options", async () => {
    const stage = await createStage();

    const res = await createPerson({ [stage]: "partner" });
    expect(res.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");
  });

  test("refuses a select field without options", async () => {
    const res = await asOwner().execute(CREATE_FIELD, {
      input: {
        customField: {
          organizationId: ORG,
          entity: "person",
          label: "Stage",
          type: "select",
          options: [],
        },
      },
    });
    expect(res.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");
  });

  test("removing an option clears it from records", async () => {
    const stage = await createStage();
    const person = (await createPerson({ [stage]: "lead" })).data!.createPerson
      .person.rowId;

    const res = await asOwner().execute(UPDATE_FIELD, {
      input: { rowId: stage, patch: { options: OPTIONS.slice(1) } },
    });
    expect(res.errors).toBeUndefined();
    expect(await storedValues(person)).toEqual({});

    // The record saves again without the removed choice
    const update = await asMember().execute(UPDATE_PERSON, {
      input: { rowId: person, patch: { customFields: { [stage]: "customer" } } },
    });
    expect(update.errors).toBeUndefined();
  });

  test("deleting a field clears its values from records", async () => {
    const stage = await createStage();
    const person = (await createPerson({ [stage]: "customer" })).data!
      .createPerson.person.rowId;

    const res = await asOwner().execute(DELETE_FIELD, {
      input: { rowId: stage },
    });
    expect(res.errors).toBeUndefined();
    expect(await storedValues(person)).toEqual({});
  });

  test("another workspace's field cannot be used", async () => {
    const stage = await createStage();

    const res = await ctx
      .graphqlAs({ id: "user-other", name: "Other" }, ["org-other"], ["owner"])
      .execute(CREATE_PERSON, {
        input: {
          person: {
            organizationId: "org-other",
            firstName: "A",
            lastName: "B",
            customFields: { [stage]: "lead" },
          },
        },
      });
    expect(res.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");
  });
});
