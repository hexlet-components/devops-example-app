import { readFileSync } from "node:fs";
import pg from "pg";

export const createDatabase = (env = process.env) => {
  if (!env.PGHOST) {
    return null;
  }
  if (env.PGPASSWORD && env.PGPASSWORD_FILE) {
    throw new Error("Use either PGPASSWORD or PGPASSWORD_FILE");
  }
  const password = env.PGPASSWORD_FILE
    ? readFileSync(env.PGPASSWORD_FILE, "utf8").trimEnd()
    : env.PGPASSWORD;
  const pool = new pg.Pool({
    host: env.PGHOST,
    port: Number(env.PGPORT || 5432),
    user: env.PGUSER || "course",
    database: env.PGDATABASE || "course",
    password,
    max: 4,
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 1000,
    query_timeout: 2000,
  });
  pool.on("error", (error) => {
    console.error(JSON.stringify({ event: "database_error", code: error.code }));
  });
  return pool;
};

export const requireDatabase = () => {
  const pool = createDatabase();
  if (!pool) {
    throw new Error("PGHOST is required for this command");
  }
  return pool;
};
