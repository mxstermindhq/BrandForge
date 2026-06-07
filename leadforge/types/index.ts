// ─────────────────────────────────────────────────────────────────────────────
// LeadForge type contract.
// Every function parameter and return value across the codebase references these.
// No inline entity types elsewhere.
// ─────────────────────────────────────────────────────────────────────────────

// ── Generic API envelopes ───────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// ── Users / auth ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

/** Safe-to-send-to-client user shape (no password hash). */
export interface UserPublic {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
}

/** JWT/KV session payload. */
export interface UserSession {
  userId: string;
  email: string;
  isAdmin: boolean;
  issuedAt: number;
}

export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
}

// ── Credits / transactions ────────────────────────────────────────────────────
export interface CreditBalance {
  id: string;
  user_id: string;
  balance: number;
  lifetime_purchased: number;
  updated_at: string;
}

export type TransactionStatus = "pending" | "complete" | "failed";

export interface Transaction {
  id: string;
  user_id: string;
  amount_cents: number;
  credits_purchased: number;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  status: TransactionStatus;
  created_at: string;
}

export interface TransactionCreateInput {
  user_id: string;
  amount_cents: number;
  credits_purchased: number;
  stripe_session_id: string | null;
  stripe_payment_intent?: string | null;
  status?: TransactionStatus;
}

// ── Campaigns ──────────────────────────────────────────────────────────────────
export type CampaignType = "b2b" | "b2c";

export type CampaignStatus =
  | "queued"
  | "running"
  | "complete"
  | "failed"
  | "paused"
  | "cancelled";

export interface ExtractedPersona {
  titles: string[];
  industries: string[];
  locations: string[];
  company_sizes: string[];
  pain_points: string[];
  keywords: string[];
  budget_signal: string;
  b2b: boolean;
  suggested_channels: string[];
  product_context: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  field: "titles" | "industries" | "locations" | "pain_points" | "product_context" | "company_sizes";
  options?: string[];
  placeholder?: string;
}

export interface SearchIntentAnalysis {
  persona: ExtractedPersona;
  confidence: number;
  intent_summary: string;
  clarifying_questions: ClarifyingQuestion[];
  ready_to_search: boolean;
  /** Primary query preview per channel (for UI transparency). */
  search_preview: Record<string, string>;
}

export type StreamEventType =
  | "persona"
  | "channel_start"
  | "lead"
  | "channel_done"
  | "done"
  | "error"
  | "status"
  | "campaign"
  | "channel_error"
  | "heartbeat"
  | "intent";

export interface StreamEvent {
  type: StreamEventType;
  data: unknown;
}

export interface ChannelStartEvent {
  channel: string;
  query: string;
}

export interface ChannelDoneEvent {
  channel: string;
  found: number;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  type: CampaignType;
  product_name: string;
  product_description: string | null;
  target_description: string;
  price_point: string;
  location: string | null;
  quantity_requested: number;
  quantity_delivered: number;
  /** JSON-encoded string[] of platform ids in the DB. */
  platforms: string;
  enrich: number; // 0 | 1
  status: CampaignStatus;
  credits_used: number;
  cursor: number;
  error_message: string | null;
  persona_text: string | null;
  /** JSON object in the DB. */
  extracted_persona: string | null;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

/** Campaign with platforms decoded for client consumption. */
export interface CampaignView extends Omit<Campaign, "platforms" | "enrich"> {
  platforms: string[];
  enrich: boolean;
}

export interface CampaignCreateInput {
  user_id: string;
  name: string;
  type: CampaignType;
  product_name: string;
  product_description?: string | null;
  target_description: string;
  price_point: string;
  location?: string | null;
  quantity_requested: number;
  platforms: string[];
  enrich: boolean;
  credits_used: number;
  status?: CampaignStatus;
  persona_text?: string | null;
  extracted_persona?: ExtractedPersona | null;
}

/** Fields the queue consumer may patch on a campaign. */
export interface CampaignUpdate {
  status?: CampaignStatus;
  quantity_delivered?: number;
  credits_used?: number;
  cursor?: number;
  error_message?: string | null;
  completed_at?: string | null;
}

export interface CampaignStatusView {
  status: CampaignStatus;
  quantity_delivered: number;
  quantity_requested: number;
  error_message: string | null;
}

export interface CampaignLeadBreakdown {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  rejected: number;
}

/** Message placed on CAMPAIGN_QUEUE. `cursor` enables chunked continuation. */
export interface CampaignQueueMessage {
  campaignId: string;
  userId: string;
  /** Continuation offset; absent/0 on first dispatch. */
  cursor?: number;
}

// ── Leads ────────────────────────────────────────────────────────────────────
export type LeadStatus = "new" | "contacted" | "qualified" | "rejected";
export type FitLabel = "Hot" | "Warm" | "Cold";
export type EstimatedSize = "solo" | "small" | "medium" | "enterprise";

export interface Lead {
  id: string;
  campaign_id: string;
  user_id: string;
  platform_source: string;
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  reddit_username: string | null;
  tiktok_handle: string | null;
  twitter_handle: string | null;
  youtube_channel: string | null;
  location: string | null;
  niche: string | null;
  status: LeadStatus;
  score: number;
  fit_label: string | null;
  estimated_size: string | null;
  /** JSON-encoded string[] in the DB. */
  likely_needs: string | null;
  pitch_angle: string | null;
  score_reason: string | null;
  /** JSON-encoded string[] in the DB. */
  fit_tags: string | null;
  likely_pain: string | null;
  best_contact_channel: string | null;
  location_guess: string | null;
  /** JSON-encoded string[] in the DB. */
  red_flags: string | null;
  /** JSON-encoded RawScrapedResult/ExtractedLeadData in the DB. */
  raw_data: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Lead shape streamed to the search UI (parsed tags + aliases). */
export interface StreamLead extends Omit<Lead, "fit_tags"> {
  platform: string;
  name: string;
  title: string;
  company: string;
  url: string;
  fit_tags: string[];
}

export interface LeadCreateInput {
  campaign_id: string;
  user_id: string;
  platform_source: string;
  company_name?: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  instagram_url?: string | null;
  reddit_username?: string | null;
  tiktok_handle?: string | null;
  twitter_handle?: string | null;
  youtube_channel?: string | null;
  location?: string | null;
  niche?: string | null;
  score?: number;
  fit_label?: string | null;
  estimated_size?: string | null;
  likely_needs?: string[] | null;
  pitch_angle?: string | null;
  score_reason?: string | null;
  fit_tags?: string[] | null;
  likely_pain?: string | null;
  best_contact_channel?: string | null;
  location_guess?: string | null;
  red_flags?: string[] | null;
  raw_data?: string | null;
}

export interface LeadPatch {
  status?: LeadStatus;
  notes?: string;
}

export interface LeadFilters {
  campaignId?: string;
  type?: CampaignType;
  status?: LeadStatus;
  platform?: string;
  q?: string;
  minScore?: number;
  sortBy?: "score" | "created_at" | "company_name";
  sortDir?: "asc" | "desc";
}

export interface LeadStats {
  total: number;
  b2b: number;
  b2c: number;
  new: number;
  contacted: number;
  qualified: number;
  rejected: number;
  hot: number; // score >= 70
  withEmail: number;
  avgScore: number;
}

// ── Scraper outputs ────────────────────────────────────────────────────────────
/** Unified multi-channel scraper output (Apollo / Apify / Serper). */
export interface RawScrapedLead {
  name: string;
  title: string;
  company: string;
  email: string;
  social_links: Record<string, string>;
  raw_bio_text: string;
  platform: string;
}

/** Structured query blueprint extracted from a campaign persona. */
export interface ScraperBlueprint {
  industry: string;
  location: string;
  keywords: string[];
  titles: string[];
  pain_points: string[];
}

export interface ScraperEnvKeys {
  apolloApiKey?: string;
  apifyApiKey?: string;
  apifyUserId?: string;
  searchProvider?: string;
  serperApiKey?: string;
  googleCseKey?: string;
  googleCseCx?: string;
}

export interface RawScrapedResult {
  url: string;
  title: string;
  snippet: string;
  emailsInSnippet: string[];
  platform: string;
}

export interface ExtractedLeadData {
  url: string;
  company_name: string | null;
  contact_name: string | null;
  emails: string[];
  phone: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  twitter_handle: string | null;
  reddit_username: string | null;
  youtube_channel: string | null;
  tiktok_handle: string | null;
  platform: string;
  snippet: string | null;
}

export interface BuildQueryParams {
  type: CampaignType;
  niche: string;
  location?: string | null;
  platform: string;
  productDescription: string;
  targetDescription: string;
}

// ── Gemini enrichment ──────────────────────────────────────────────────────────
export interface GeminiEnrichmentOutput {
  score: number; // 0-100
  company_name: string;
  contact_name: string | null;
  email: string | null;
  estimated_size: EstimatedSize;
  fit_label: FitLabel;
  likely_needs: string[]; // max 3
  pitch_angle: string;
  red_flags: string[]; // empty if none
}

export interface PersonaEnrichmentOutput {
  score: number;
  score_reason: string;
  fit_tags: string[];
  pitch_angle: string;
  likely_pain: string;
  best_contact_channel: string;
  estimated_company_size: string;
  location_guess: string;
  email_guess: string;
  contact_name: string;
  company_name: string;
}

export interface EnrichedLeadAIOutput {
  clean_company_name: string;
  suitability_score: number;
  fit_reasoning: string;
  pain_point: string;
  pitch_angle: string;
}

export interface ProductContext {
  type: CampaignType;
  product_name: string;
  product_description: string | null;
  target_description: string;
  price_point: string;
}

export interface ColdEmailOutput {
  subject: string;
  body: string;
}

// ── Platforms / packs / constants ───────────────────────────────────────────────
export interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
  b2b: boolean;
  b2c: boolean;
  creditCost: number; // multiplier per lead
  quality: number; // 1-5 stars
}

export interface PricePack {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  stripePriceId: string;
}

// ── Stripe ───────────────────────────────────────────────────────────────────
export interface StripeCheckoutMetadata {
  userId: string;
  packId: string;
  // Stripe metadata is an open string map; index signature satisfies MetadataParam.
  [key: string]: string;
}

// ── Admin ──────────────────────────────────────────────────────────────────────
export interface AdminUserRow extends UserPublic {
  balance: number;
  lifetime_purchased: number;
  campaign_count: number;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCampaigns: number;
  totalLeads: number;
  totalRevenueCents: number;
  avgCompletionRate: number; // 0-1
  leadsDeliveredToday: number;
}

export interface AdminCreditInput {
  userId: string;
  amount: number;
  note?: string;
}
