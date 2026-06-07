#!/usr/bin/env node
/**
 * Apply supabase/schema.sql via Supabase Management API (database/query).
 * Requires SUPABASE_ACCESS_TOKEN (personal access token from supabase.com/dashboard/account/tokens).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF?.trim() || "wrmibhymtxnntixzbxsx";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN?.trim();

if (!TOKEN) {
  console.error("Set SUPABASE_ACCESS_TOKEN (Supabase personal access token)");
  process.exit(1);
}

const raw = readFileSync(join(__dirname, "../supabase/schema.sql"), "utf8");

/** Split SQL into statements without breaking dollar-quoted function bodies. */
function splitSqlStatements(sql) {
  const statements = [];
  let current = "";
  let dollarTag = null;
  const lines = sql.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!dollarTag && trimmed.startsWith("--")) continue;

    if (!dollarTag) {
      const open = line.match(/\$([A-Za-z0-9_]*)\$/);
      if (open) dollarTag = open[0];
    } else if (line.includes(dollarTag)) {
      dollarTag = null;
    }

    current += `${line}\n`;

    if (!dollarTag && trimmed.endsWith(";")) {
      const stmt = current.replace(/^--[^\n]*\n?/gm, "").trim();
      if (stmt) statements.push(stmt);
      current = "";
    }
  }

  const tail = current.replace(/^--[^\n]*\n?/gm, "").trim();
  if (tail) statements.push(tail);
  return statements;
}

const policyGuard = `DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_select_own') THEN
    CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_update_own') THEN
    CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'credits_select_own') THEN
    CREATE POLICY credits_select_own ON public.credits FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'transactions_select_own') THEN
    CREATE POLICY transactions_select_own ON public.transactions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'campaigns_all_own') THEN
    CREATE POLICY campaigns_all_own ON public.campaigns FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'leads_all_own') THEN
    CREATE POLICY leads_all_own ON public.leads FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;`;

async function runQuery(query, label) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${label} failed (${res.status}): ${text}`);
  }
  console.log(`OK: ${label}`);
}

const statements = splitSqlStatements(raw).filter((s) => !s.startsWith("CREATE POLICY "));
statements.push(policyGuard);

for (const [i, stmt] of statements.entries()) {
  const label = stmt.slice(0, 60).replace(/\s+/g, " ");
  await runQuery(stmt, `[${i + 1}/${statements.length}] ${label}`);
}

console.log("Schema applied successfully.");
