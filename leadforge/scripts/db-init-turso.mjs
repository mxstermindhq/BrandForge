/**
 * Push schema.sql to a Turso database.
 * Usage: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/db-init-turso.mjs
 */
import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
if (!url || !authToken) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN");
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(path.join(here, "..", "schema.sql"), "utf8");
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

const client = createClient({ url, authToken });
for (const sql of statements) {
  await client.execute(sql);
  console.log("OK:", sql.slice(0, 60).replace(/\s+/g, " ") + "...");
}
console.log(`Schema applied (${statements.length} statements).`);
