import "server-only";

import { CuratedOperatorSchema, type CuratedOperator } from "@/lib/schemas/operator.schema";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function baseHeaders() {
  if (!SUPABASE_ANON) return null;
  return {
    apikey: SUPABASE_ANON,
    Authorization: `Bearer ${SUPABASE_ANON}`,
    "Content-Type": "application/json",
  };
}

function mapDbRow(row: Record<string, unknown>): CuratedOperator {
  return CuratedOperatorSchema.parse({
    username: row.username,
    name: row.name,
    role: row.role,
    yearsExp: row.years_exp,
    availability: row.availability,
    amanahScore: row.amanah_score,
    completionRate: row.completion_rate,
    bio: row.bio,
    bestResult: row.best_result,
    wontTakeOn: row.wont_take_on,
    startingPrice: row.starting_price,
    pricingModel: row.pricing_model,
    skills: row.skills,
    idealClient: row.ideal_client,
    workStyle: row.work_style,
    typicalTimeline: row.typical_timeline,
    proofLink: row.proof_link,
    faq: row.faq,
    isVerified: row.is_verified,
    layoutSpan: row.layout_span,
    displayOrder: row.display_order,
  });
}

export async function getCuratedOperators(): Promise<CuratedOperator[]> {
  if (!SUPABASE_URL) return [];
  const headers = baseHeaders();
  if (!headers) return [];

  const url = `${SUPABASE_URL}/rest/v1/curated_operators?select=*&order=display_order.asc`;
  const res = await fetch(url, {
    headers,
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    console.error("getCuratedOperators: fetch failed", res.status);
    return [];
  }

  const rows = (await res.json().catch(() => [])) as Array<Record<string, unknown>>;
  const valid: CuratedOperator[] = [];
  for (const row of rows) {
    try {
      valid.push(mapDbRow(row));
    } catch (err) {
      console.error("getCuratedOperators: schema error", err);
    }
  }
  return valid;
}

export async function getCuratedOperatorByUsername(username: string): Promise<CuratedOperator | null> {
  if (!SUPABASE_URL) return null;
  const headers = baseHeaders();
  if (!headers) return null;

  const slug = encodeURIComponent(String(username || "").trim().toLowerCase().replace(/^@+/, ""));
  const url = `${SUPABASE_URL}/rest/v1/curated_operators?select=*&username=eq.${slug}&limit=1`;
  const res = await fetch(url, {
    headers,
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    console.error("getCuratedOperatorByUsername: fetch failed", res.status);
    return null;
  }

  const rows = (await res.json().catch(() => [])) as Array<Record<string, unknown>>;
  const row = rows[0];
  if (!row) return null;

  try {
    return mapDbRow(row);
  } catch (err) {
    console.error("getCuratedOperatorByUsername: schema error", err);
    return null;
  }
}
