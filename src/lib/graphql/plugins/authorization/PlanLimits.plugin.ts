import { EXPORTABLE } from "graphile-export";
import { GraphQLError } from "graphql";
import { sideEffectWithPgClient } from "postgraphile/@dataplan/pg";
import { context, sideEffect } from "postgraphile/grafast";
import { wrapPlans } from "postgraphile/utils";

import { hasRoomFor, resolveLimits } from "lib/entitlements";

import type { LimitKey } from "lib/entitlements";
import type { PgClient, PgExecutor } from "postgraphile/@dataplan/pg";
import type { FieldArgs, Step } from "postgraphile/grafast";
import type { PlanWrapperFn } from "postgraphile/utils";

/**
 * Minimal shape of the CRUD mutation payload plan (`object({ result: $mutation })`)
 * and the underlying insert/update step the written row's columns are read from
 */
interface MutationStep {
  resource: { executor: PgExecutor };
  get: (attr: string) => Step;
}
interface PayloadStep {
  get: (key: "result") => MutationStep;
}

type Query = (
  text: string,
  values: unknown[],
) => Promise<readonly Record<string, number>[]>;

/** The request's database pool, which autocommits each statement */
interface Db {
  $client: {
    query: (
      text: string,
      values: unknown[],
    ) => Promise<{ rows: Record<string, number>[] }>;
  };
}

/** One limited count: how to measure it, and how to undo an over-limit write */
interface LimitedCount {
  key: LimitKey;
  /**
   * Advisory lock that serializes writes to this count in one workspace. Every
   * path that adds to the count takes the same lock (convertQuoteToInvoice
   * takes the invoice one), so no two of them re-count at once
   */
  lockKey: (organizationId: string) => string;
  /** Current usage, before the write */
  count: (query: Query, organizationId: string) => Promise<number>;
  /** Usage after the write, recording it where the count needs a record */
  record: (
    query: Query,
    organizationId: string,
    rowId: string,
  ) => Promise<number>;
  /** Remove a just-created row that pushed the count over the limit */
  undo: (query: Query, organizationId: string, rowId: string) => Promise<void>;
}

const MONTH_START =
  "date_trunc('month', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'";

/**
 * Contacts: every person in the workspace counts, internal or external, so the
 * cap cannot be bypassed by marking contacts internal
 */
const CONTACTS: LimitedCount = {
  key: "max_contacts",
  lockKey: (organizationId) => `contact_created:${organizationId}`,
  count: async (query, organizationId) =>
    (
      await query(
        "SELECT count(*)::int AS n FROM person WHERE organization_id = $1",
        [organizationId],
      )
    )[0]?.n ?? 0,
  record: async (query, organizationId) =>
    (
      await query(
        "SELECT count(*)::int AS n FROM person WHERE organization_id = $1",
        [organizationId],
      )
    )[0]?.n ?? 0,
  undo: async (query, _organizationId, rowId) => {
    await query("DELETE FROM person WHERE id = $1", [rowId]);
  },
};

/**
 * Monthly invoices count creations in the calendar month (UTC) from the usage
 * ledger, so deleting an invoice does not free a slot. Invoices created before
 * the ledger existed are covered by also counting the month's live invoices.
 * Every create is recorded, limited or not, so usage stays accurate across an
 * upgrade or downgrade
 */
export const usedInvoices = async (query: Query, organizationId: string) => {
  const row = (
    await query(
      `SELECT
         (SELECT count(*)::int FROM usage_event
           WHERE organization_id = $1
             AND metric = 'invoice_created'
             AND created_at >= ${MONTH_START}) AS events,
         (SELECT count(*)::int FROM invoice
           WHERE organization_id = $1
             AND created_at >= ${MONTH_START}) AS live`,
      [organizationId],
    )
  )[0];

  return Math.max(row?.events ?? 0, row?.live ?? 0);
};

const MONTHLY_INVOICES: LimitedCount = {
  key: "max_invoices_per_month",
  lockKey: (organizationId) => `invoice_created:${organizationId}`,
  count: usedInvoices,
  record: async (query, organizationId) => {
    await query(
      "INSERT INTO usage_event (organization_id, metric) VALUES ($1, 'invoice_created')",
      [organizationId],
    );

    return usedInvoices(query, organizationId);
  },
  undo: async (query, organizationId, rowId) => {
    await query(
      `DELETE FROM usage_event WHERE id = (
         SELECT id FROM usage_event
          WHERE organization_id = $1 AND metric = 'invoice_created'
          ORDER BY created_at DESC LIMIT 1
       )`,
      [organizationId],
    );
    await query("DELETE FROM invoice WHERE id = $1", [rowId]);
  },
};

export const limitReached = (key: LimitKey, limit: number) => {
  const messages: Partial<Record<LimitKey, string>> = {
    max_contacts: `Your plan includes up to ${limit} contacts. Upgrade your plan to add more`,
    max_invoices_per_month: `Your plan includes ${limit} invoices per month. Upgrade your plan to create more`,
  };

  return new GraphQLError(
    messages[key] ?? "Plan limit reached. Upgrade your plan to add more",
    { extensions: { code: "PLAN_LIMIT_REACHED", limit: key } },
  );
};

/**
 * Before the write: resolve the target workspace's limit and refuse when it
 * is already reached. Returns the limit for the check after the write, or null
 * when none applies (a trusted service, a workspace the caller does not belong
 * to, which the mutation guard refuses anyway, or an unlimited plan)
 */
const precheck = async (
  limited: LimitedCount,
  db: Db,
  organizationIds: unknown,
  organizationId: unknown,
): Promise<number | null> => {
  if (!Array.isArray(organizationIds) || organizationIds.includes("*"))
    return null;
  if (
    typeof organizationId !== "string" ||
    !organizationIds.includes(organizationId)
  )
    return null;

  const { limits } = await resolveLimits(organizationId);
  const limit = limits[limited.key];
  if (limit < 0) return null;

  const query: Query = async (text, values) =>
    (await db.$client.query(text, values)).rows;
  if (!hasRoomFor(limit, await limited.count(query, organizationId)))
    throw limitReached(limited.key, limit);

  return limit;
};

/**
 * After the write: record it and re-count. Concurrent writes can all pass the
 * precheck (each counts before any of them inserts), so the re-count is what
 * holds the limit.
 *
 * The insert has already committed in its own transaction; this runs in
 * another. A per-workspace, per-limit advisory lock serializes the re-counts,
 * so each sees every row committed before it, and a write whose re-count
 * exceeds the limit is undone in this same transaction. The callback returns
 * the refused limit instead of throwing: a throw here rolls this transaction
 * back, undo included, leaving the over-limit row in place. `refuse` reports
 * it afterwards. Under contention this can refuse a write that would have
 * fit, never admit one that does not
 */
const postcheck =
  (limited: LimitedCount) =>
  async (
    pgClient: PgClient,
    input: { rowId: unknown; organizationId: unknown; limit: unknown },
  ): Promise<number | null> => {
    const { rowId, organizationId, limit } = input;
    if (typeof rowId !== "string" || typeof organizationId !== "string")
      return null;

    const query: Query = async (text, values) =>
      (await pgClient.query<Record<string, number>>({ text, values })).rows;
    await query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      limited.lockKey(organizationId),
    ]);
    const used = await limited.record(query, organizationId, rowId);

    if (typeof limit === "number" && used > limit) {
      await limited.undo(query, organizationId, rowId);
      return limit;
    }

    return null;
  };

/** Fail the mutation when the post-check undid the write */
const refuse =
  (limited: LimitedCount) =>
  (refusedLimit: unknown): void => {
    if (typeof refusedLimit === "number")
      throw limitReached(limited.key, refusedLimit);
  };

/**
 * Wrap a create so the plan limit is checked before the write and again after
 * it. Updates never add to a count: a record's workspace cannot change
 * (OrgMutationGuardPlugin)
 */
const withLimit = (limited: LimitedCount, inputPath: string[]): PlanWrapperFn =>
  EXPORTABLE(
    (
      context,
      sideEffect,
      sideEffectWithPgClient,
      precheck,
      postcheck,
      refuse,
      limited,
      inputPath,
    ): PlanWrapperFn =>
      (plan, _, fieldArgs: FieldArgs) => {
        const $values = fieldArgs.getRaw(inputPath);
        const $organizationIds = context().get("organizationIds");
        const $db = context().get("db");

        const $limit = sideEffect(
          [$values, $organizationIds, $db],
          ([values, organizationIds, db]) =>
            precheck(
              limited,
              db as Db,
              organizationIds,
              (values as Record<string, unknown> | null)?.organizationId,
            ),
        );

        const $payload = plan();
        if (!$payload) return $payload;
        const $mutation = ($payload as unknown as PayloadStep).get("result");

        const $refused = sideEffectWithPgClient(
          $mutation.resource.executor,
          {
            rowId: $mutation.get("id"),
            organizationId: $mutation.get("organization_id"),
            limit: $limit,
          },
          postcheck(limited),
        );
        sideEffect($refused, refuse(limited));

        return $payload;
      },
    [
      context,
      sideEffect,
      sideEffectWithPgClient,
      precheck,
      postcheck,
      refuse,
      limited,
      inputPath,
    ],
  );

/**
 * Enforce the Mantle plan limits from Aether (see lib/entitlements) on every
 * GraphQL path that adds to a limited count:
 *
 * - `max_contacts`: creating a person
 * - `max_invoices_per_month`: creating an invoice (converting a quote into an
 *   invoice counts too; convertQuoteToInvoice checks it in its own transaction)
 *
 * Limits only ever gate new records: edits within a workspace, deletes and
 * reads are never blocked by a plan or a billing outage. Workspace seats are
 * unlimited on every tier (members are managed in the Omni account hub)
 */
const PlanLimitsPlugin = wrapPlans({
  Mutation: {
    createPerson: withLimit(CONTACTS, ["input", "person"]),
    createInvoice: withLimit(MONTHLY_INVOICES, ["input", "invoice"]),
  },
});

export default PlanLimitsPlugin;
