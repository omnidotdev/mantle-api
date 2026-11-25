import { EXPORTABLE } from "graphile-export";
import { GraphQLError } from "graphql";
import { sideEffectWithPgClient } from "postgraphile/@dataplan/pg";
import { constant } from "postgraphile/grafast";
import { wrapPlans } from "postgraphile/utils";

import {
  customFieldDefinitionError,
  customFieldValuesError,
} from "lib/customFields";

import type { CustomFieldDefinition } from "lib/customFields";
import type { PgClient, PgExecutor } from "postgraphile/@dataplan/pg";
import type { FieldArgs, Step } from "postgraphile/grafast";
import type { PlanWrapperFn } from "postgraphile/utils";

interface MutationStep {
  get: (attr: string) => Step;
}
interface PayloadStep {
  get: (key: "result") => MutationStep;
}

/** Tables that hold custom field values, by the entity their fields name */
const RECORD_TABLES = { person: "person", company: "company" } as const;

type RecordEntity = keyof typeof RECORD_TABLES;

const badInput = EXPORTABLE(
  (GraphQLError) =>
    (message: string, field: string): GraphQLError =>
      new GraphQLError(message, {
        extensions: { code: "BAD_USER_INPUT", field },
      }),
  [GraphQLError],
);

/** Refuse a field definition with an unknown type or entity, or bad options */
const assertDefinition = EXPORTABLE(
  (customFieldDefinitionError, badInput) =>
    async (
      pgClient: PgClient,
      input: { values: unknown; rowId: unknown },
    ): Promise<void> => {
      const values = input.values as Record<string, unknown> | null;
      if (!values || typeof values !== "object") return;

      // An options-only patch is checked against the field's stored type
      let type = values.type;
      if (type === undefined && typeof input.rowId === "string") {
        const { rows } = await pgClient.query<{ type: string }>({
          text: "SELECT type FROM custom_field WHERE id = $1",
          values: [input.rowId],
        });
        type = rows[0]?.type;
      }

      const error = customFieldDefinitionError({
        entity: values.entity,
        type,
        label: values.label,
        options: values.options,
      });
      if (error) throw badInput(error, "customField");
    },
  [customFieldDefinitionError, badInput],
);

/**
 * Refuse a person or company write whose custom field values do not fit the
 * workspace's fields for that record type
 */
const assertValues = EXPORTABLE(
  (customFieldValuesError, badInput) =>
    async (
      pgClient: PgClient,
      input: {
        entity: string;
        table: string;
        values: unknown;
        rowId: unknown;
      },
    ): Promise<void> => {
      const values = input.values as Record<string, unknown> | null;
      if (!values || typeof values !== "object") return;
      if (!("customFields" in values)) return;

      // A create names its workspace; an update keeps the row's
      let organizationId = values.organizationId;
      if (
        typeof organizationId !== "string" &&
        typeof input.rowId === "string"
      ) {
        const { rows } = await pgClient.query<{ organization_id: string }>({
          text: `SELECT organization_id FROM ${input.table} WHERE id = $1`,
          values: [input.rowId],
        });
        organizationId = rows[0]?.organization_id;
      }
      // A missing row falls through to the mutation's own not-found result
      if (typeof organizationId !== "string") return;

      const { rows: definitions } = await pgClient.query<CustomFieldDefinition>(
        {
          text: "SELECT id, type, options FROM custom_field WHERE organization_id = $1 AND entity = $2",
          values: [organizationId, input.entity],
        },
      );

      const error = customFieldValuesError(values.customFields, definitions);
      if (error) throw badInput(error, "customFields");
    },
  [customFieldValuesError, badInput],
);

/**
 * After a field's options change: clear values that point at an option the
 * field no longer has, so no record is left holding a choice that is gone
 * (and failing validation on its next save)
 */
const pruneRemovedOptions = EXPORTABLE(
  (RECORD_TABLES) =>
    async (pgClient: PgClient, fieldId: unknown): Promise<void> => {
      if (typeof fieldId !== "string") return;

      const { rows } = await pgClient.query<{
        entity: string;
        type: string;
        options: { id: string }[];
      }>({
        text: "SELECT entity, type, options FROM custom_field WHERE id = $1",
        values: [fieldId],
      });
      const field = rows[0];
      if (!field) return;

      const table = RECORD_TABLES[field.entity as RecordEntity];
      if (!table) return;
      const ids = (field.options ?? []).map((option) => option.id);

      if (field.type === "select") {
        await pgClient.query({
          text: `UPDATE ${table}
                    SET custom_fields = custom_fields - $1::text
                  WHERE custom_fields ? $1::text
                    AND jsonb_typeof(custom_fields -> $1::text) = 'string'
                    AND NOT (custom_fields ->> $1::text = ANY($2::text[]))`,
          values: [fieldId, ids],
        });
      } else if (field.type === "multi_select") {
        await pgClient.query({
          text: `UPDATE ${table}
                    SET custom_fields = jsonb_set(
                          custom_fields,
                          ARRAY[$1::text],
                          coalesce(
                            (SELECT jsonb_agg(v)
                               FROM jsonb_array_elements_text(custom_fields -> $1::text) v
                              WHERE v = ANY($2::text[])),
                            '[]'::jsonb))
                  WHERE custom_fields ? $1::text
                    AND jsonb_typeof(custom_fields -> $1::text) = 'array'`,
          values: [fieldId, ids],
        });
      }
    },
  [RECORD_TABLES],
);

/** After a field is deleted: drop its values from every record */
const pruneDeletedField = EXPORTABLE(
  (RECORD_TABLES) =>
    async (pgClient: PgClient, fieldId: unknown): Promise<void> => {
      if (typeof fieldId !== "string") return;

      for (const table of Object.values(RECORD_TABLES)) {
        await pgClient.query({
          text: `UPDATE ${table} SET custom_fields = custom_fields - $1::text WHERE custom_fields ? $1::text`,
          values: [fieldId],
        });
      }
    },
  [RECORD_TABLES],
);

/**
 * Custom fields: validate definitions and record values server-side, and keep
 * stored values in step with their field. Definition writes are limited to
 * workspace owners and admins by the mutation guard (`custom_field` is an
 * admin table); any member can fill in values. A field's entity and type are
 * set once (hideInternalData), so stored values never change meaning. Every
 * step runs in the mutation's own transaction
 */
const CustomFieldsPlugin = wrapPlans((build) => {
  const pgExecutor = build.pgExecutor as PgExecutor;

  const definition =
    (op: "create" | "update"): PlanWrapperFn =>
    (plan, _$source, fieldArgs: FieldArgs) => {
      sideEffectWithPgClient(
        pgExecutor,
        {
          values: fieldArgs.getRaw(
            op === "create" ? ["input", "customField"] : ["input", "patch"],
          ),
          rowId:
            op === "create"
              ? constant(null)
              : fieldArgs.getRaw(["input", "rowId"]),
        },
        assertDefinition,
      );

      const $payload = plan();
      if (op === "update") {
        const $mutation = ($payload as unknown as PayloadStep).get("result");
        sideEffectWithPgClient(
          pgExecutor,
          $mutation.get("id"),
          pruneRemovedOptions,
        );
      }

      return $payload;
    };

  const record =
    (entity: RecordEntity, op: "create" | "update"): PlanWrapperFn =>
    (plan, _$source, fieldArgs: FieldArgs) => {
      sideEffectWithPgClient(
        pgExecutor,
        {
          entity: constant(entity),
          table: constant(RECORD_TABLES[entity]),
          values: fieldArgs.getRaw(
            op === "create" ? ["input", entity] : ["input", "patch"],
          ),
          rowId:
            op === "create"
              ? constant(null)
              : fieldArgs.getRaw(["input", "rowId"]),
        },
        assertValues,
      );

      return plan();
    };

  return {
    Mutation: {
      createCustomField: definition("create"),
      updateCustomField: definition("update"),
      deleteCustomField: (plan) => {
        const $payload = plan();
        const $mutation = ($payload as unknown as PayloadStep).get("result");
        sideEffectWithPgClient(
          pgExecutor,
          $mutation.get("id"),
          pruneDeletedField,
        );

        return $payload;
      },
      createPerson: record("person", "create"),
      updatePerson: record("person", "update"),
      createCompany: record("company", "create"),
      updateCompany: record("company", "update"),
    },
  };
});

export default CustomFieldsPlugin;
