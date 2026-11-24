import { pgPool } from "lib/db/db";

/** Run one parameterized statement, returning its rows */
export type Query = <Row = Record<string, unknown>>(
  text: string,
  values?: unknown[],
) => Promise<Row[]>;

/**
 * Run `fn` in one transaction on a dedicated pooled connection, committing
 * when it resolves and rolling back when it throws
 */
export const withTransaction = async <T>(
  fn: (query: Query) => Promise<T>,
): Promise<T> => {
  const client = await pgPool.connect();
  const query: Query = async <Row>(text: string, values: unknown[] = []) =>
    (await client.query(text, values)).rows as Row[];

  try {
    await client.query("BEGIN");
    const result = await fn(query);
    await client.query("COMMIT");

    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
};
