import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminStats,
  AdminUserRow,
  Campaign,
  CampaignCreateInput,
  CampaignLeadBreakdown,
  CampaignUpdate,
  CreditBalance,
  Lead,
  LeadCreateInput,
  LeadFilters,
  LeadPatch,
  LeadStats,
  PaginatedResponse,
  Transaction,
  TransactionCreateInput,
  User,
} from "@/types";
import { D1_BATCH_SIZE } from "@/lib/constants";

export type Db = SupabaseClient;

function nowIso(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function clampPage(page: number): number {
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function clampLimit(limit: number, max = 100): number {
  if (!Number.isFinite(limit) || limit <= 0) return 20;
  return Math.min(Math.floor(limit), max);
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    is_admin: Boolean(row.is_admin),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function mapCampaign(row: Record<string, unknown>): Campaign {
  const platforms = row.platforms;
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    name: String(row.name),
    type: row.type as Campaign["type"],
    product_name: String(row.product_name),
    product_description: (row.product_description as string | null) ?? null,
    target_description: String(row.target_description),
    price_point: String(row.price_point),
    location: (row.location as string | null) ?? null,
    quantity_requested: Number(row.quantity_requested),
    quantity_delivered: Number(row.quantity_delivered ?? 0),
    platforms: Array.isArray(platforms) ? JSON.stringify(platforms) : String(platforms ?? "[]"),
    enrich: row.enrich ? 1 : 0,
    status: row.status as Campaign["status"],
    credits_used: Number(row.credits_used ?? 0),
    cursor: Number(row.cursor ?? 0),
    error_message: (row.error_message as string | null) ?? null,
    created_at: String(row.created_at),
    completed_at: (row.completed_at as string | null) ?? null,
    updated_at: String(row.updated_at),
  };
}

function mapLead(row: Record<string, unknown>): Lead {
  return row as unknown as Lead;
}

// ── Users / profiles ─────────────────────────────────────────────────────────
export async function getUserById(db: Db, id: string): Promise<User | null> {
  const { data } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  return data ? mapUser(data) : null;
}

export async function getUserByEmail(db: Db, email: string): Promise<User | null> {
  const { data } = await db
    .from("profiles")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  return data ? mapUser(data) : null;
}

export async function createProfile(
  db: Db,
  input: { id: string; email: string; name: string; is_admin?: boolean },
): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const { data, error } = await db
    .from("profiles")
    .insert({
      id: input.id,
      email,
      name: input.name.trim(),
      is_admin: Boolean(input.is_admin),
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create profile");
  return mapUser(data);
}

/** @deprecated use createProfile — kept for call-site compatibility during migration. */
export const createUser = createProfile;

// ── Credits ──────────────────────────────────────────────────────────────────
export async function ensureCreditRow(
  db: Db,
  userId: string,
  initialBalance = 0,
): Promise<void> {
  const { data } = await db.from("credits").select("id").eq("user_id", userId).maybeSingle();
  if (data) return;
  const { error } = await db.from("credits").insert({
    user_id: userId,
    balance: initialBalance,
    lifetime_purchased: 0,
  });
  if (error) throw new Error(error.message);
}

export async function getCreditBalance(db: Db, userId: string): Promise<CreditBalance> {
  const { data } = await db.from("credits").select("*").eq("user_id", userId).maybeSingle();
  if (data) return data as CreditBalance;
  await ensureCreditRow(db, userId, 0);
  const { data: created } = await db.from("credits").select("*").eq("user_id", userId).single();
  if (!created) throw new Error("Failed to read credit balance");
  return created as CreditBalance;
}

export async function deductCredits(db: Db, userId: string, amount: number): Promise<boolean> {
  const { data, error } = await db.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: amount,
  });
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function addCredits(
  db: Db,
  userId: string,
  amount: number,
  countAsPurchased = false,
): Promise<void> {
  await ensureCreditRow(db, userId, 0);
  const balance = await getCreditBalance(db, userId);
  const patch: Record<string, unknown> = {
    balance: balance.balance + amount,
    updated_at: new Date().toISOString(),
  };
  if (countAsPurchased) {
    patch.lifetime_purchased = balance.lifetime_purchased + amount;
  }
  const { error } = await db.from("credits").update(patch).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ── Campaigns ────────────────────────────────────────────────────────────────
export async function createCampaign(db: Db, input: CampaignCreateInput): Promise<Campaign> {
  const { data, error } = await db
    .from("campaigns")
    .insert({
      user_id: input.user_id,
      name: input.name,
      type: input.type,
      product_name: input.product_name,
      product_description: input.product_description ?? null,
      target_description: input.target_description,
      price_point: input.price_point,
      location: input.location ?? null,
      quantity_requested: input.quantity_requested,
      platforms: input.platforms,
      enrich: input.enrich,
      status: "queued",
      credits_used: input.credits_used,
      cursor: 0,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create campaign");
  return mapCampaign(data);
}

export async function getCampaignById(db: Db, id: string): Promise<Campaign | null> {
  const { data } = await db.from("campaigns").select("*").eq("id", id).maybeSingle();
  return data ? mapCampaign(data) : null;
}

export async function getCampaignsByUser(
  db: Db,
  userId: string,
  page: number,
  limit: number,
  status?: string,
): Promise<PaginatedResponse<Campaign>> {
  const p = clampPage(page);
  const l = clampLimit(limit);
  const from = (p - 1) * l;
  const to = from + l - 1;

  let query = db
    .from("campaigns")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);
  const total = count ?? 0;
  return {
    items: (data ?? []).map(mapCampaign),
    total,
    page: p,
    totalPages: Math.max(1, Math.ceil(total / l)),
    limit: l,
  };
}

export async function updateCampaignStatus(
  db: Db,
  id: string,
  update: CampaignUpdate,
): Promise<void> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (update.status !== undefined) patch.status = update.status;
  if (update.quantity_delivered !== undefined) patch.quantity_delivered = update.quantity_delivered;
  if (update.credits_used !== undefined) patch.credits_used = update.credits_used;
  if (update.cursor !== undefined) patch.cursor = update.cursor;
  if (update.error_message !== undefined) patch.error_message = update.error_message;
  if (update.completed_at !== undefined) patch.completed_at = update.completed_at;

  const { error } = await db.from("campaigns").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getCampaignLeadBreakdown(
  db: Db,
  campaignId: string,
): Promise<CampaignLeadBreakdown> {
  const { data, error } = await db.from("leads").select("status").eq("campaign_id", campaignId);
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  return {
    total: rows.length,
    new: rows.filter((r) => r.status === "new").length,
    contacted: rows.filter((r) => r.status === "contacted").length,
    qualified: rows.filter((r) => r.status === "qualified").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };
}

// ── Leads ────────────────────────────────────────────────────────────────────
function leadRow(lead: LeadCreateInput): Record<string, unknown> {
  return {
    campaign_id: lead.campaign_id,
    user_id: lead.user_id,
    platform_source: lead.platform_source,
    company_name: lead.company_name ?? null,
    contact_name: lead.contact_name ?? null,
    email: lead.email ?? null,
    phone: lead.phone ?? null,
    website: lead.website ?? null,
    linkedin_url: lead.linkedin_url ?? null,
    instagram_url: lead.instagram_url ?? null,
    reddit_username: lead.reddit_username ?? null,
    tiktok_handle: lead.tiktok_handle ?? null,
    twitter_handle: lead.twitter_handle ?? null,
    youtube_channel: lead.youtube_channel ?? null,
    location: lead.location ?? null,
    niche: lead.niche ?? null,
    score: lead.score ?? 0,
    fit_label: lead.fit_label ?? null,
    estimated_size: lead.estimated_size ?? null,
    likely_needs: lead.likely_needs ? JSON.stringify(lead.likely_needs) : null,
    pitch_angle: lead.pitch_angle ?? null,
    red_flags: lead.red_flags ? JSON.stringify(lead.red_flags) : null,
    raw_data: lead.raw_data ?? null,
  };
}

export async function createLeadsBatch(db: Db, leads: LeadCreateInput[]): Promise<number> {
  if (leads.length === 0) return 0;
  let inserted = 0;
  for (let i = 0; i < leads.length; i += D1_BATCH_SIZE) {
    const chunk = leads.slice(i, i + D1_BATCH_SIZE).map(leadRow);
    const { error } = await db.from("leads").insert(chunk);
    if (error) throw new Error(error.message);
    inserted += chunk.length;
  }
  return inserted;
}

async function queryLeads(
  db: Db,
  scope: { userId: string; campaignId?: string },
  filters: LeadFilters,
  page: number,
  limit: number,
): Promise<PaginatedResponse<Lead>> {
  const p = clampPage(page);
  const l = clampLimit(limit);
  const from = (p - 1) * l;
  const to = from + l - 1;

  const sortCol =
    filters.sortBy === "score" || filters.sortBy === "company_name"
      ? filters.sortBy
      : "created_at";
  const ascending = filters.sortDir === "asc";

  let query = db.from("leads").select("*", { count: "exact" }).eq("user_id", scope.userId);

  const campaignId = scope.campaignId ?? filters.campaignId;
  if (campaignId) query = query.eq("campaign_id", campaignId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.platform) query = query.eq("platform_source", filters.platform);
  if (typeof filters.minScore === "number") query = query.gte("score", filters.minScore);
  if (filters.q?.trim()) {
    const q = filters.q.trim();
    query = query.or(
      `company_name.ilike.%${q}%,email.ilike.%${q}%,niche.ilike.%${q}%,pitch_angle.ilike.%${q}%`,
    );
  }

  const { data: rawData, count, error } = await query
    .order(sortCol, { ascending })
    .range(from, to);
  if (error) throw new Error(error.message);

  let rows = (rawData ?? []) as Record<string, unknown>[];
  if (filters.type) {
    const { data: campaigns } = await db
      .from("campaigns")
      .select("id, type")
      .eq("user_id", scope.userId)
      .eq("type", filters.type);
    const allowed = new Set((campaigns ?? []).map((c) => c.id as string));
    rows = rows.filter((r) => allowed.has(String(r.campaign_id)));
  }

  const total = filters.type ? rows.length : (count ?? 0);
  return {
    items: rows.map(mapLead),
    total,
    page: p,
    totalPages: Math.max(1, Math.ceil(total / l)),
    limit: l,
  };
}

export async function getLeadsByCampaign(
  db: Db,
  campaignId: string,
  userId: string,
  filters: LeadFilters,
  page: number,
  limit: number,
): Promise<PaginatedResponse<Lead>> {
  return queryLeads(db, { userId, campaignId }, filters, page, limit);
}

export async function getLeadsByUser(
  db: Db,
  userId: string,
  filters: LeadFilters,
  page: number,
  limit: number,
): Promise<PaginatedResponse<Lead>> {
  return queryLeads(db, { userId }, filters, page, limit);
}

export async function getLeadById(db: Db, id: string): Promise<Lead | null> {
  const { data } = await db.from("leads").select("*").eq("id", id).maybeSingle();
  return data ? mapLead(data) : null;
}

export async function updateLead(
  db: Db,
  id: string,
  userId: string,
  patch: LeadPatch,
): Promise<Lead | null> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.notes !== undefined) update.notes = patch.notes;
  if (Object.keys(update).length === 1) return getLeadById(db, id);

  const { error } = await db.from("leads").update(update).eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return getLeadById(db, id);
}

export async function getLeadStats(db: Db, userId: string): Promise<LeadStats> {
  const { data, error } = await db
    .from("leads")
    .select("status, score, email, campaigns(type)")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const scores = rows.map((r) => Number(r.score ?? 0));
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  return {
    total: rows.length,
    b2b: rows.filter((r) => (r.campaigns as { type?: string } | null)?.type === "b2b").length,
    b2c: rows.filter((r) => (r.campaigns as { type?: string } | null)?.type === "b2c").length,
    new: rows.filter((r) => r.status === "new").length,
    contacted: rows.filter((r) => r.status === "contacted").length,
    qualified: rows.filter((r) => r.status === "qualified").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    hot: rows.filter((r) => Number(r.score) >= 70).length,
    withEmail: rows.filter((r) => r.email).length,
    avgScore: Math.round(avg),
  };
}

// ── Transactions ─────────────────────────────────────────────────────────────
export async function createTransaction(
  db: Db,
  input: TransactionCreateInput,
): Promise<Transaction> {
  const { data, error } = await db
    .from("transactions")
    .insert({
      user_id: input.user_id,
      amount_cents: input.amount_cents,
      credits_purchased: input.credits_purchased,
      stripe_session_id: input.stripe_session_id ?? null,
      stripe_payment_intent: input.stripe_payment_intent ?? null,
      status: input.status ?? "pending",
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create transaction");
  return data as Transaction;
}

export async function getTransactionByStripeSession(
  db: Db,
  sessionId: string,
): Promise<Transaction | null> {
  const { data } = await db
    .from("transactions")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  return data ? (data as Transaction) : null;
}

export async function updateTransaction(
  db: Db,
  id: string,
  patch: { status?: string; stripe_payment_intent?: string | null },
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.stripe_payment_intent !== undefined) {
    update.stripe_payment_intent = patch.stripe_payment_intent;
  }
  if (Object.keys(update).length === 0) return;
  const { error } = await db.from("transactions").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getRecentTransactions(
  db: Db,
  userId: string,
  limit = 10,
): Promise<Transaction[]> {
  const { data, error } = await db
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(clampLimit(limit, 50));
  if (error) throw new Error(error.message);
  return (data ?? []) as Transaction[];
}

// ── Admin helpers ────────────────────────────────────────────────────────────
export async function getAdminStats(db: Db): Promise<AdminStats> {
  const [users, campaigns, leads, transactions, campaignRows, todayLeads] = await Promise.all([
    db.from("profiles").select("*", { count: "exact", head: true }),
    db.from("campaigns").select("*", { count: "exact", head: true }),
    db.from("leads").select("*", { count: "exact", head: true }),
    db.from("transactions").select("amount_cents").eq("status", "complete"),
    db.from("campaigns").select("quantity_requested, quantity_delivered, status"),
    db
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date().toISOString().slice(0, 10)),
  ]);

  const revenue =
    (transactions.data ?? []).reduce((sum, t) => sum + Number(t.amount_cents ?? 0), 0) ?? 0;
  const completionRows = (campaignRows.data ?? []).filter((c) =>
    ["complete", "running", "failed"].includes(String(c.status)),
  );
  const avgCompletion =
    completionRows.length === 0
      ? 0
      : completionRows.reduce((sum, c) => {
          const req = Number(c.quantity_requested);
          const del = Number(c.quantity_delivered);
          return sum + (req > 0 ? del / req : 0);
        }, 0) / completionRows.length;

  return {
    totalUsers: users.count ?? 0,
    totalCampaigns: campaigns.count ?? 0,
    totalLeads: leads.count ?? 0,
    totalRevenueCents: revenue,
    avgCompletionRate: Math.min(1, Math.max(0, avgCompletion)),
    leadsDeliveredToday: todayLeads.count ?? 0,
  };
}

export async function getAdminUsers(
  db: Db,
  page: number,
  limit: number,
): Promise<PaginatedResponse<AdminUserRow>> {
  const p = clampPage(page);
  const l = clampLimit(limit);
  const from = (p - 1) * l;
  const to = from + l - 1;

  const { data: profiles, count, error } = await db
    .from("profiles")
    .select("id, email, name, is_admin, created_at, credits(balance, lifetime_purchased)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);

  const items: AdminUserRow[] = [];
  for (const row of profiles ?? []) {
    const credits = Array.isArray(row.credits) ? row.credits[0] : row.credits;
    const { count: campaignCount } = await db
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("user_id", row.id);
    items.push({
      id: row.id,
      email: row.email,
      name: row.name,
      is_admin: Boolean(row.is_admin),
      balance: credits?.balance ?? 0,
      lifetime_purchased: credits?.lifetime_purchased ?? 0,
      campaign_count: campaignCount ?? 0,
      created_at: row.created_at,
    });
  }

  const total = count ?? 0;
  return { items, total, page: p, totalPages: Math.max(1, Math.ceil(total / l)), limit: l };
}

export async function getAdminCampaigns(
  db: Db,
  page: number,
  limit: number,
  status?: string | null,
): Promise<PaginatedResponse<Campaign>> {
  const p = clampPage(page);
  const l = clampLimit(limit);
  const from = (p - 1) * l;
  const to = from + l - 1;

  let query = db.from("campaigns").select("*", { count: "exact" }).order("created_at", {
    ascending: false,
  });
  if (status) query = query.eq("status", status);

  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);
  const total = count ?? 0;
  return {
    items: (data ?? []).map(mapCampaign),
    total,
    page: p,
    totalPages: Math.max(1, Math.ceil(total / l)),
    limit: l,
  };
}
