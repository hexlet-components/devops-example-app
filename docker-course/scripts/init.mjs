import { requireDatabase } from "../lib/database.mjs";

let database;
try {
  database = requireDatabase();
  await database.query(
    "CREATE TABLE IF NOT EXISTS notes (id SERIAL PRIMARY KEY, text TEXT NOT NULL)",
  );
  console.log("Schema ready");
} catch (error) {
  console.error(
    JSON.stringify({ event: "initialization_failed", code: error.code || error.message }),
  );
  process.exitCode = 1;
} finally {
  if (database) {
    await database.end();
  }
}
