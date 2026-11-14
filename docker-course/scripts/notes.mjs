import { requireDatabase } from "../lib/database.mjs";

let database;
try {
  const [action, ...words] = process.argv.slice(2);
  const text = words.join(" ").trim();
  if (!["read", "write"].includes(action) || (action === "write" && !text)) {
    throw new Error("Usage: node scripts/notes.mjs read | write TEXT");
  }
  database = requireDatabase();
  if (action === "write") {
    const result = await database.query("INSERT INTO notes (text) VALUES ($1) RETURNING id, text", [
      text,
    ]);
    console.log(JSON.stringify(result.rows[0]));
  } else {
    const result = await database.query("SELECT id, text FROM notes ORDER BY id");
    console.log(JSON.stringify(result.rows));
  }
} catch (error) {
  console.error(JSON.stringify({ event: "notes_failed", code: error.code || error.message }));
  process.exitCode = 1;
} finally {
  if (database) {
    await database.end();
  }
}
