import type {
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
  UserCreateInput,
} from "@/types";
import { D1_BATCH_SIZE } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────────────────────
// All queries use prepared statements with bound parameters. User-supplied data
// is NEVER interpolated into SQL strings. Column names used in ORDER BY are
// whitelisted, never taken raw from the request.
// ─────────────────────────────────────────────────────────────────────────────

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

// ── Users ──────────────────────────────────────────────────────────────────
export async function getUserById(
  db: D1Database,
  id: string,
): Promise<User | null> {
  return db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<User>();
}

export async function getUserByEmail(
  db: D1Database,
  email: string,
): Promise<User | null> {
  return db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(email.trim().toLowerCase())
    .first<User>();
}

export async function createUser(
  db: D1Database,
  input: UserCreateInput & { password_hash: string; is_admin?: boolean },
): Promise<User> {
  const id = crypto.randomUUID();
  const email = input.email.trim().toLowerCase();
  const isAdmin = input.is_admin ? 1 : 0;
  await db
    .prepare(
      "INSERT INTO users (id, email, name, password_hash, is_admin) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(id, email, input.name.trim(), input.password_hash, isAdmin)
    .run();

  // Credits row with welcome bonus is created by the caller (register route) so
  // the balance value stays in one place; here we just create the user.
  const user = await getUserById(db, id);
  if (!user) throw new Error("Failed to create user");
  return user;
}

// ── Credits ──────────────────────────────────────────────────────────────────
export async function ensureCreditRow(
  db: D1Database,
  userId: string,
  initialBalance = 0,
): Promise<void> {
  const existing = await db
    .prepare("SELECT id FROM credits WHERE user_id = ?")
    .bind(userId)
    .first<{ id: string }>();
  if (existing) return;
  await db
    .prepare(
      "INSERT INTO credits (id, user_id, balance, lifetime_purchased) VALUES (?, ?, ?, 0)",
    )
    .bind(crypto.randomUUID(), userId, initialBalance)
    .run();
}

export async function getCreditBalance(
  db: D1Database,
  userId: string,
): Promise<CreditBalance> {
  const row = await db
    .prepare("SELECT * FROM credits WHERE user_id = ?")
    .bind(userId)
    .first<CreditBalance>();
  if (row) return row;
  await ensureCreditRow(db, userId, 0);
  const created = await db
    .prepare("SELECT * FROM credits WHERE user_id = ?")
    .bind(userId)
    .first<CreditBalance>();
  if (!created) throw new Error("Failed to read credit balance");
  return created;
}

/** Atomic conditional deduction. Returns false if balance is insufficient. */
export async function deductCredits(
  db: D1Database,
  userId: string,
  amount: number,
): Promise<boolean> {
  if (amount <= 0) return true;
  const res = await db
    .prepare(
      "UPDATE credits SET balance = balance - ?, updated_at = ? WHERE user_id = ? AND balance >= ?",
    )
    .bind(amount, nowIso(), userId, amount)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function addCredits(
  db: D1Database,
  userId: string,
  amount: number,
  countAsPurchased = false,
): Promise<void> {
  await ensureCreditRow(db, userId, 0);
  if (countAsPurchased) {
    await db
      .prepare(
        "UPDATE credits SET balance = balance + ?, lifetime_purchased = lifetime_purchased + ?, updated_at = ? WHERE user_id = ?",
      )
      .bind(amount, amount, nowIso(), userId)
      .run();
  } else {
    await db
      .prepare(
        "UPDATE credits SET balance = balance + ?, updated_at = ? WHERE user_id = ?",
      )
      .bind(amount, nowIso(), userId)
      .run();
  }
}

// ── Campaigns ──────────────────────────────────────────────────────────────────
export async function createCampaign(
  db: D1Database,
  input: CampaignCreateInput,
): Promise<Campaign> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO campaigns
        (id, user_id, name, type, product_name, product_description,
         target_description, price_point, location, quantity_requested,
         platforms, enrich, status, credits_used, cursor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued', ?, 0)`,
    )
    .bind(
      id,
      input.user_id,
      input.name,
      input.type,
      input.product_name,
      input.product_description ?? null,
      input.target_description,
      input.price_point,
      input.location ?? null,
      input.quantity_requested,
      JSON.stringify(input.platforms),
      input.enrich ? 1 : 0,
      input.credits_used,
    )
    .run();
  const campaign = await getCampaignById(db, id);
  if (!campaign) throw new Error("Failed to create campaign");
  return campaign;
}

export async function getCampaignById(
  db: D1Database,
  id: string,
): Promise<Campaign | null> {
  return db
    .prepare("SELECT * FROM campaigns WHERE id = ?")
    .bind(id)
    .first<Campaign>();
}

export async function getCampaignsByUser(
  db: D1Database,
  userId: string,
  page: number,
  limit: number,
  status?: string,
): Promise<PaginatedResponse<Campaign>> {
  const p = clampPage(page);
  const l = clampLimit(limit);
  const offset = (p - 1) * l;

  const where = status
    ? "WHERE user_id = ? AND status = ?"
    : "WHERE user_id = ?";
  const whereBinds = status ? [userId, status] : [userId];

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS c FROM campaigns ${where}`)
    .bind(...whereBinds)
    .first<{ c: number }>();
  const total = countRow?.c ?? 0;

  const { results } = await db
    .prepare(
      `SELECT * FROM campaigns ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
    .bind(...whereBinds, l, offset)
    .all<Campaign>();

  return {
    items: results ?? [],
    total,
    page: p,
    totalPages: Math.max(1, Math.ceil(total / l)),
    limit: l,
  };
}

export async function updateCampaignStatus(
  db: D1Database,
  id: string,
  update: CampaignUpdate,
): Promise<void> {
  const sets: string[] = [];
  const binds: unknown[] = [];
  if (update.status !== undefined) {
    sets.push("status = ?");
    binds.push(update.status);
  }
  if (update.quantity_delivered !== undefined) {
    sets.push("quantity_delivered = ?");
    binds.push(update.quantity_delivered);
  }
  if (update.credits_used !== undefined) {
    sets.push("credits_used = ?");
    binds.push(update.credits_used);
  }
  if (update.cursor !== undefined) {
    sets.push("cursor = ?");
    binds.push(update.cursor);
  }
  if (update.error_message !== undefined) {
    sets.push("error_message = ?");
    binds.push(update.error_message);
  }
  if (update.completed_at !== undefined) {
    sets.push("completed_at = ?");
    binds.push(update.completed_at);
  }
  sets.push("updated_at = ?");
  binds.push(nowIso());

  if (sets.length === 1) return; // only updated_at — nothing meaningful
  binds.push(id);
  await db
    .prepare(`UPDATE campaigns SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...binds)
    .run();
}

export async function getCampaignLeadBreakdown(
  db: D1Database,
  campaignId: string,
): Promise<CampaignLeadBreakdown> {
  const row = await db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_c,
         SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) AS contacted_c,
         SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) AS qualified_c,
         SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_c
       FROM leads WHERE campaign_id = ?`,
    )
    .bind(campaignId)
    .first<{
      total: number;
      new_c: number;
      contacted_c: number;
      qualified_c: number;
      rejected_c: number;
    }>();
  return {
    total: row?.total ?? 0,
    new: row?.new_c ?? 0,
    contacted: row?.contacted_c ?? 0,
    qualified: row?.qualified_c ?? 0,
    rejected: row?.rejected_c ?? 0,
  };
}

// ── Leads ──────────────────────────────────────────────────────────────────
function leadInsertStatement(
  db: D1Database,
  lead: LeadCreateInput,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO leads
        (id, campaign_id, user_id, platform_source, company_name, contact_name,
         email, phone, website, linkedin_url, instagram_url, reddit_username,
         tiktok_handle, twitter_handle, youtube_channel, location, niche,
         score, fit_label, estimated_size, likely_needs, pitch_angle,
         red_flags, raw_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      lead.campaign_id,
      lead.user_id,
      lead.platform_source,
      lead.company_name ?? null,
      lead.contact_name ?? null,
      lead.email ?? null,
      lead.phone ?? null,
      lead.website ?? null,
      lead.linkedin_url ?? null,
      lead.instagram_url ?? null,
      lead.reddit_username ?? null,
      lead.tiktok_handle ?? null,
      lead.twitter_handle ?? null,
      lead.youtube_channel ?? null,
      lead.location ?? null,
      lead.niche ?? null,
      lead.score ?? 0,
      lead.fit_label ?? null,
      lead.estimated_size ?? null,
      lead.likely_needs ? JSON.stringify(lead.likely_needs) : null,
      lead.pitch_angle ?? null,
      lead.red_flags ? JSON.stringify(lead.red_flags) : null,
      lead.raw_data ?? null,
    );
}

/** Batch insert in chunks of D1_BATCH_SIZE. Returns count inserted. */
export async function createLeadsBatch(
  db: D1Database,
  leads: LeadCreateInput[],
): Promise<number> {
  if (leads.length === 0) return 0;
  let inserted = 0;
  for (let i = 0; i < leads.length; i += D1_BATCH_SIZE) {
    const chunk = leads.slice(i, i + D1_BATCH_SIZE);
    const statements = chunk.map((lead) => leadInsertStatement(db, lead));
    await db.batch(statements);
    inserted += chunk.length;
  }
  return inserted;
}

const LEAD_SORT_COLUMNS: Record<string, string> = {
  score: "leads.score",
  created_at: "leads.created_at",
  company_name: "leads.company_name",
};

function buildLeadQuery(
  scope: { userId: string; campaignId?: string },
  filters: LeadFilters,
): { where: string; binds: unknown[]; needsJoin: boolean } {
  const clauses: string[] = ["leads.user_id = ?"];
  const binds: unknown[] = [scope.userId];
  let needsJoin = false;

  const campaignId = scope.campaignId ?? filters.campaignId;
  if (campaignId) {
    clauses.push("leads.campaign_id = ?");
    binds.push(campaignId);
  }
  if (filters.status) {
    clauses.push("leads.status = ?");
    binds.push(filters.status);
  }
  if (filters.platform) {
    clauses.push("leads.platform_source = ?");
    binds.push(filters.platform);
  }
  if (typeof filters.minScore === "number") {
    clauses.push("leads.score >= ?");
    binds.push(filters.minScore);
  }
  if (filters.type) {
    needsJoin = true;
    clauses.push("campaigns.type = ?");
    binds.push(filters.type);
  }
  if (filters.q) {
    const like = `%${filters.q.trim()}%`;
    clauses.push(
      "(leads.company_name LIKE ? OR leads.email LIKE ? OR leads.niche LIKE ? OR leads.pitch_angle LIKE ?)",
    );
    binds.push(like, like, like, like);
  }
  return { where: clauses.join(" AND "), binds, needsJoin };
}

async function queryLeads(
  db: D1Database,
  scope: { userId: string; campaignId?: string },
  filters: LeadFilters,
  page: number,
  limit: number,
): Promise<PaginatedResponse<Lead>> {
  const p = clampPage(page);
  const l = clampLimit(limit);
  const offset = (p - 1) * l;

  const { where, binds, needsJoin } = buildLeadQuery(scope, filters);
  const join = needsJoin
    ? "JOIN campaigns ON campaigns.id = leads.campaign_id"
    : "";

  const sortCol = LEAD_SORT_COLUMNS[filters.sortBy ?? "created_at"] ?? "leads.created_at";
  const sortDir = filters.sortDir === "asc" ? "ASC" : "DESC";

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS c FROM leads ${join} WHERE ${where}`)
    .bind(...binds)
    .first<{ c: number }>();
  const total = countRow?.c ?? 0;

  const { results } = await db
    .prepare(
      `SELECT leads.* FROM leads ${join} WHERE ${where} ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`,
    )
    .bind(...binds, l, offset)
    .all<Lead>();

  return {
    items: results ?? [],
    total,
    page: p,
    totalPages: Math.max(1, Math.ceil(total / l)),
    limit: l,
  };
}

export async function getLeadsByCampaign(
  db: D1Database,
  campaignId: string,
  userId: string,
  filters: LeadFilters,
  page: number,
  limit: number,
): Promise<PaginatedResponse<Lead>> {
  return queryLeads(db, { userId, campaignId }, filters, page, limit);
}

export async function getLeadsByUser(
  db: D1Database,
  userId: string,
  filters: LeadFilters,
  page: number,
  limit: number,
): Promise<PaginatedResponse<Lead>> {
  return queryLeads(db, { userId }, filters, page, limit);
}

export async function getLeadById(
  db: D1Database,
  id: string,
): Promise<Lead | null> {
  return db.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first<Lead>();
}

export async function updateLead(
  db: D1Database,
  id: string,
  userId: string,
  patch: LeadPatch,
): Promise<Lead | null> {
  const sets: string[] = [];
  const binds: unknown[] = [];
  if (patch.status !== undefined) {
    sets.push("status = ?");
    binds.push(patch.status);
  }
  if (patch.notes !== undefined) {
    sets.push("notes = ?");
    binds.push(patch.notes);
  }
  if (sets.length === 0) return getLeadById(db, id);
  sets.push("updated_at = ?");
  binds.push(nowIso());
  binds.push(id, userId);
  await db
    .prepare(`UPDATE leads SET ${sets.join(", ")} WHERE id = ? AND user_id = ?`)
    .bind(...binds)
    .run();
  return getLeadById(db, id);
}

export async function getLeadStats(
  db: D1Database,
  userId: string,
): Promise<LeadStats> {
  const row = await db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN campaigns.type = 'b2b' THEN 1 ELSE 0 END) AS b2b,
         SUM(CASE WHEN campaigns.type = 'b2c' THEN 1 ELSE 0 END) AS b2c,
         SUM(CASE WHEN leads.status = 'new' THEN 1 ELSE 0 END) AS new_c,
         SUM(CASE WHEN leads.status = 'contacted' THEN 1 ELSE 0 END) AS contacted_c,
         SUM(CASE WHEN leads.status = 'qualified' THEN 1 ELSE 0 END) AS qualified_c,
         SUM(CASE WHEN leads.status = 'rejected' THEN 1 ELSE 0 END) AS rejected_c,
         SUM(CASE WHEN leads.score >= 70 THEN 1 ELSE 0 END) AS hot,
         SUM(CASE WHEN leads.email IS NOT NULL AND leads.email <> '' THEN 1 ELSE 0 END) AS with_email,
         AVG(leads.score) AS avg_score
       FROM leads
       JOIN campaigns ON campaigns.id = leads.campaign_id
       WHERE leads.user_id = ?`,
    )
    .bind(userId)
    .first<{
      total: number;
      b2b: number;
      b2c: number;
      new_c: number;
      contacted_c: number;
      qualified_c: number;
      rejected_c: number;
      hot: number;
      with_email: number;
      avg_score: number | null;
    }>();
  return {
    total: row?.total ?? 0,
    b2b: row?.b2b ?? 0,
    b2c: row?.b2c ?? 0,
    new: row?.new_c ?? 0,
    contacted: row?.contacted_c ?? 0,
    qualified: row?.qualified_c ?? 0,
    rejected: row?.rejected_c ?? 0,
    hot: row?.hot ?? 0,
    withEmail: row?.with_email ?? 0,
    avgScore: Math.round(row?.avg_score ?? 0),
  };
}

// ── Transactions ────────────────────────────────────────────────────────────
export async function createTransaction(
  db: D1Database,
  input: TransactionCreateInput,
): Promise<Transaction> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO transactions
        (id, user_id, amount_cents, credits_purchased, stripe_session_id,
         stripe_payment_intent, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.user_id,
      input.amount_cents,
      input.credits_purchased,
      input.stripe_session_id ?? null,
      input.stripe_payment_intent ?? null,
      input.status ?? "pending",
    )
    .run();
  const tx = await db
    .prepare("SELECT * FROM transactions WHERE id = ?")
    .bind(id)
    .first<Transaction>();
  if (!tx) throw new Error("Failed to create transaction");
  return tx;
}

export async function getTransactionByStripeSession(
  db: D1Database,
  sessionId: string,
): Promise<Transaction | null> {
  return db
    .prepare("SELECT * FROM transactions WHERE stripe_session_id = ?")
    .bind(sessionId)
    .first<Transaction>();
}

export async function updateTransaction(
  db: D1Database,
  id: string,
  patch: { status?: string; stripe_payment_intent?: string | null },
): Promise<void> {
  const sets: string[] = [];
  const binds: unknown[] = [];
  if (patch.status !== undefined) {
    sets.push("status = ?");
    binds.push(patch.status);
  }
  if (patch.stripe_payment_intent !== undefined) {
    sets.push("stripe_payment_intent = ?");
    binds.push(patch.stripe_payment_intent);
  }
  if (sets.length === 0) return;
  binds.push(id);
  await db
    .prepare(`UPDATE transactions SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...binds)
    .run();
}

export async function getRecentTransactions(
  db: D1Database,
  userId: string,
  limit = 10,
): Promise<Transaction[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
    )
    .bind(userId, clampLimit(limit, 50))
    .all<Transaction>();
  return results ?? [];
}
