import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:AnheVps2022@vps.amcmep.in:5432/workofhuman";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 6000,
    });

    pool.on("connect", (client: PoolClient) => {
      // Ensure all queries check workofhuman schema first, then public
      client.query("SET search_path TO workofhuman, public;").catch(() => {});
    });

    pool.on("error", (err) => {
      console.error("[PostgreSQL Pool Error]:", err.message);
    });
  }
  return pool;
}

export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<R>> {
  const p = getPool();
  return p.query<R>(text, params);
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
