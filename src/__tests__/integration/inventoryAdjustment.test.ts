import { describe, expect, test } from "bun:test";

import { setupTestContext } from "test/setup/testContext";

/**
 * Recording an inventory adjustment moves the product's on-hand quantity in
 * the same transaction (it used to only add a history row), deleting one
 * reverses it, and neither works across workspaces
 */

const ORG_A = "org-stock-a";
const ORG_B = "org-stock-b";
const memberA = { id: "user-a", name: "A" };
const memberB = { id: "user-b", name: "B" };

const CREATE = /* GraphQL */ `
  mutation ($input: CreateInventoryAdjustmentInput!) {
    createInventoryAdjustment(input: $input) {
      inventoryAdjustment { rowId quantityChange }
    }
  }
`;

describe("inventory adjustments", () => {
  const ctx = setupTestContext();

  const seedProduct = async (quantity: number) =>
    (
      await ctx.pool.query<{ id: string }>(
        "insert into product (organization_id, name, current_quantity) values ($1, 'Widget', $2) returning id",
        [ORG_A, quantity],
      )
    ).rows[0]!.id;

  const quantity = async (productId: string) =>
    (
      await ctx.pool.query(
        "select current_quantity as q from product where id = $1",
        [productId],
      )
    ).rows[0]?.q as number;

  const adjust = (
    client: ReturnType<typeof ctx.graphqlAs>,
    productId: string,
    quantityChange: number,
  ) =>
    client.execute<{
      createInventoryAdjustment: { inventoryAdjustment: { rowId: string } };
    }>(CREATE, {
      input: {
        inventoryAdjustment: { productId, quantityChange, reason: "count" },
      },
    });

  test("an adjustment moves the product's stock, and deleting it reverses the move", async () => {
    const productId = await seedProduct(10);
    const asA = ctx.graphqlAs(memberA, [ORG_A]);

    const restock = await adjust(asA, productId, 5);
    expect(restock.errors).toBeUndefined();
    expect(await quantity(productId)).toBe(15);

    const sale = await adjust(asA, productId, -3);
    expect(sale.errors).toBeUndefined();
    expect(await quantity(productId)).toBe(12);

    const removed = await asA.execute(
      /* GraphQL */ `
        mutation ($input: DeleteInventoryAdjustmentInput!) {
          deleteInventoryAdjustment(input: $input) { clientMutationId }
        }
      `,
      {
        input: {
          rowId:
            restock.data?.createInventoryAdjustment.inventoryAdjustment.rowId,
        },
      },
    );
    expect(removed.errors).toBeUndefined();
    expect(await quantity(productId)).toBe(7);
  });

  test("a product with no recorded quantity starts from zero", async () => {
    const productId = (
      await ctx.pool.query<{ id: string }>(
        "insert into product (organization_id, name, current_quantity) values ($1, 'Blank', null) returning id",
        [ORG_A],
      )
    ).rows[0]!.id;

    await adjust(ctx.graphqlAs(memberA, [ORG_A]), productId, 4);
    expect(await quantity(productId)).toBe(4);
  });

  test("another workspace cannot move a product's stock", async () => {
    const productId = await seedProduct(10);

    const result = await adjust(ctx.graphqlAs(memberB, [ORG_B]), productId, -10);
    expect(result.errors).toBeDefined();
    expect(await quantity(productId)).toBe(10);
  });

  test("an adjustment's product and quantity cannot be edited after the fact", async () => {
    const productId = await seedProduct(10);
    const asA = ctx.graphqlAs(memberA, [ORG_A]);
    const created = await adjust(asA, productId, 2);

    const edit = await asA.execute(
      /* GraphQL */ `
        mutation ($input: UpdateInventoryAdjustmentInput!) {
          updateInventoryAdjustment(input: $input) { clientMutationId }
        }
      `,
      {
        input: {
          rowId:
            created.data?.createInventoryAdjustment.inventoryAdjustment.rowId,
          patch: { quantityChange: 100 },
        },
      },
    );
    expect(edit.errors).toBeDefined();
    expect(await quantity(productId)).toBe(12);
  });
});
