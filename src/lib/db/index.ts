import { Client, QueryResult, QueryResultRow } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:AnheVps2022@vps.amcmep.in:5432/workofhuman";

export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<R>> {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    return await client.query<R>(text, params);
  } finally {
    try {
      await client.end().catch(() => {});
    } catch {
      // ignore
    }
  }
}

export async function checkDatabaseConnection(): Promise<{ ok: boolean; error?: string; database?: string }> {
  try {
    const res = await query("SELECT current_database() as db, current_schema() as schema, NOW() as now;");
    return { ok: true, database: res.rows[0]?.db };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: errorMsg };
  }
}
