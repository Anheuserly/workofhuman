import { Pool, QueryResult, QueryResultRow } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:AnheVps2022@vps.amcmep.in:5432/workofhuman";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 2000,
      connectionTimeoutMillis: 4000,
    });

    pool.on("error", (err) => {
      console.error("[PostgreSQL Pool Error]:", err.message);
      // Discard broken pool so the next query initializes a fresh connection
      try {
        pool?.end().catch(() => {});
      } catch {
        // ignore
      }
      pool = null;
    });
  }
  return pool;
}

export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<R>> {
  try {
    const p = getPool();
    return await p.query<R>(text, params);
  } catch (err) {
    // If connection was dropped or timed out, reset pool and retry once
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("Connection terminated") ||
      msg.includes("timeout") ||
      msg.includes("closed") ||
      msg.includes("ECONNRESET")
    ) {
      console.warn("[PostgreSQL query retry after error]:", msg);
      try {
        await pool?.end().catch(() => {});
      } catch {
        // ignore
      }
      pool = null;
      const freshPool = getPool();
      return await freshPool.query<R>(text, params);
    }
    throw err;
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
