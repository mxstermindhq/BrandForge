/**
 * Human-readable map of the BrandForge JSON API (Node server, default :3000).
 * Keep in sync with server.js routeApi when you add routes.
 */

export type ApiEndpoint = {
  method: string;
  path: string;
  auth: "public" | "bearer" | "optional" | "server";
  summary: string;
};

export type ApiSection = {
  title: string;
  description?: string;
  endpoints: ApiEndpoint[];
};

export const API_REFERENCE: ApiSection[] = [
  {
    title: "Overview",
    description:
      "All endpoints accept and return JSON unless noted. Authenticated calls use Authorization: Bearer <access_token> from Supabase Auth. The web app reads base URL from NEXT_PUBLIC_API_URL (falls back to http://127.0.0.1:3000).",
    endpoints: [],
  },
  {
    title: "Auth & session",
    endpoints: [
      { method: "GET", path: "/api/auth/config", auth: "public", summary: "OAuth / auth configuration hints." },
      { method: "GET", path: "/api/auth/me", auth: "bearer", summary: "Current user profile stub for the SPA." },
    ],
  },
  {
    title: "Bootstrap & discovery",
    endpoints: [
      { method: "GET", path: "/api/bootstrap", auth: "optional", summary: "Initial app payload: settings, services, requests, chats, projects, stats." },
      { method: "GET", path: "/api/search?q=&limit=", auth: "optional", summary: "Marketplace text search (ILIKE) over published services, marketplace-ready member profiles, open requests; honors MARKETPLACE_HONOR_WEEK. Min query length 2." },
      { method: "GET", path: "/api/marketplace-stats", auth: "public", summary: "Aggregate marketplace numbers." },
      { method: "GET", path: "/api/profiles/username-available?username=", auth: "public", summary: "Check username availability." },
      { method: "GET", path: "/api/profiles/:username/public", auth: "optional", summary: "Public profile with dealWins/dealLosses (contract outcomes)." },
      { method: "POST", path: "/api/profiles/:username/vouch", auth: "bearer", summary: "Retired — returns 410; use contract escrow outcomes for credibility." },
      { method: "DELETE", path: "/api/profiles/:username/vouch", auth: "bearer", summary: "Retired — returns 410." },
    ],
  },
  {
    title: "Home & discovery",
    endpoints: [
      { method: "GET", path: "/api/home/stats", auth: "optional", summary: "Public dashboard: totals, latest members/services/requests." },
    ],
  },
  {
    title: "Requests & bids",
    endpoints: [
      { method: "POST", path: "/api/requests", auth: "bearer", summary: "Create project request (title, desc, budget, …)." },
      { method: "GET", path: "/api/requests/:id", auth: "optional", summary: "Single request for the brief page." },
      { method: "PUT", path: "/api/requests/:id", auth: "bearer", summary: "Update request (owner)." },
      { method: "DELETE", path: "/api/requests/:id", auth: "bearer", summary: "Close request (owner)." },
      { method: "GET", path: "/api/requests/:id/bids", auth: "bearer", summary: "List bids for a request." },
      { method: "GET", path: "/api/requests/:id/matches", auth: "bearer", summary: "Suggested members for the brief." },
      { method: "POST", path: "/api/bids", auth: "bearer", summary: "Submit bid (requestId, price, proposal)." },
      { method: "GET", path: "/api/bids/:id/payment-quote", auth: "bearer", summary: "Escrow quote for a bid." },
      { method: "POST", path: "/api/bids/:id/checkout-session", auth: "bearer", summary: "Stripe checkout for bid acceptance." },
      { method: "POST", path: "/api/bids/:id/crypto-intent", auth: "bearer", summary: "Crypto payment intent (optional NOWPayments checkoutLink)." },
      { method: "POST", path: "/api/plans/crypto-intent", auth: "bearer", summary: "NOWPayments checkout for subscription (body: tierId, billingPeriod)." },
      { method: "POST", path: "/api/bids/:id/crypto-confirm", auth: "bearer", summary: "Confirm crypto payment." },
      { method: "POST", path: "/api/nowpayments/ipn", auth: "server", summary: "NOWPayments IPN (HMAC, no user JWT)." },
      { method: "POST", path: "/api/bids/:id/accept", auth: "bearer", summary: "Accept bid (client)." },
      { method: "POST", path: "/api/bids/:id/reject", auth: "bearer", summary: "Reject bid." },
    ],
  },
  {
    title: "Services",
    endpoints: [
      { method: "POST", path: "/api/services", auth: "bearer", summary: "Publish service package." },
      { method: "GET", path: "/api/services/:id", auth: "optional", summary: "Published service detail." },
      {
        method: "POST",
        path: "/api/services/:id/bid",
        auth: "bearer",
        summary: "Submit service package bid (price, proposal, optional deliveryDays); opens legacy thread with service_bid embed.",
      },
      {
        method: "POST",
        path: "/api/services/:id/accept-deal",
        auth: "bearer",
        summary:
          "Lock service deal (conversationId, counterProposerId, agreedPrice, optional deliveryDays): creates project, deal_win embed, enables contract in thread.",
      },
      { method: "PUT", path: "/api/services/:id", auth: "bearer", summary: "Update listing (owner)." },
      { method: "DELETE", path: "/api/services/:id", auth: "bearer", summary: "Archive listing." },
      { method: "POST", path: "/api/services/:id/cover", auth: "bearer", summary: "Upload cover image (dataUrl)." },
    ],
  },
  {
    title: "Chat",
    endpoints: [
      {
        method: "POST",
        path: "/api/deals/counter-offer",
        auth: "bearer",
        summary:
          "Post deal_counter_offer embed: basis request_bid (counterToBidId) or service_offer (serviceId, counterToProposerId); conversationId, price, proposal, optional deliveryDays.",
      },
      { method: "POST", path: "/api/chat/start", auth: "bearer", summary: "Open conversation (e.g. servicePackageId)." },
      {
        method: "GET",
        path: "/api/chat/:conversationId",
        auth: "bearer",
        summary:
          "Thread with messages (default latest 50). Query: before=<messageId>&limit=50 for older pages; messageWindow.hasMoreOlder; membership.historyVisibleFrom when scoped; pins[] for pinned messages.",
      },
      {
        method: "POST",
        path: "/api/chat/:threadId/invite",
        auth: "bearer",
        summary:
          "Add a human participant: JSON { inviteeUserId?: uuid, username?: string, email?: string, invite?: shorthand, history?: \"since_join\" | \"full\" }; unified + legacy. Notifies invitee. Run migration lookup_user_id_by_email for efficient email resolution.",
      },
      {
        method: "POST",
        path: "/api/chat/:threadId/pins",
        auth: "bearer",
        summary: "Pin message: JSON { messageId }. Max 25/thread. activeChat.pins on GET.",
      },
      {
        method: "DELETE",
        path: "/api/chat/:threadId/pins/:messageId",
        auth: "bearer",
        summary: "Unpin message (alias /api/chats/…).",
      },
      {
        method: "POST",
        path: "/api/chat/:legacyConversationId/start-project",
        auth: "bearer",
        summary:
          "Create a projects row from a legacy deal thread (context request or service_package), link the thread, enable contracts + escrow path.",
      },
      { method: "POST", path: "/api/chat/messages", auth: "bearer", summary: "Send message (conversationId, text)." },
      { method: "POST", path: "/api/chat/files", auth: "bearer", summary: "Upload attachment." },
      { method: "GET", path: "/api/chat", auth: "bearer", summary: "List unified chats (alias of legacy /api/chats)." },
      { method: "POST", path: "/api/chat", auth: "bearer", summary: "Create unified chat." },
      { method: "GET", path: "/api/chats", auth: "bearer", summary: "List chats (deprecated; use GET /api/chat)." },
      { method: "POST", path: "/api/chats", auth: "bearer", summary: "Create chat (deprecated; use POST /api/chat)." },
      { method: "GET", path: "/api/chats/:id", auth: "bearer", summary: "Chat detail + presence." },
      { method: "POST", path: "/api/chat/:id/messages", auth: "bearer", summary: "Send in unified chat." },
      { method: "POST", path: "/api/chat/:id/files", auth: "bearer", summary: "Unified chat file upload." },
      { method: "POST", path: "/api/chat/:id/typing", auth: "bearer", summary: "Typing indicator." },
      {
        method: "POST",
        path: "/api/chat/:id/leave",
        auth: "bearer",
        summary: "Leave chat: tries legacy conversation first in router; unified rooms also POST here (see server ordering).",
      },
      { method: "POST", path: "/api/chats/:id/messages", auth: "bearer", summary: "Deprecated; use POST /api/chat/:id/messages." },
      { method: "POST", path: "/api/chats/:id/files", auth: "bearer", summary: "Deprecated; use POST /api/chat/:id/files." },
      { method: "POST", path: "/api/chats/:id/typing", auth: "bearer", summary: "Deprecated." },
      { method: "POST", path: "/api/chats/:id/leave", auth: "bearer", summary: "Deprecated." },
    ],
  },
  {
    title: "Projects & delivery",
    endpoints: [
      { method: "GET", path: "/api/projects/:id", auth: "bearer", summary: "Project workspace payload." },
      { method: "POST", path: "/api/projects/:id/thread-link", auth: "bearer", summary: "Link unified chat or legacy conversation (body: unifiedChatId | legacyConversationId)." },
      { method: "GET", path: "/api/projects/:id/contracts", auth: "bearer", summary: "List project contracts." },
      { method: "POST", path: "/api/projects/:id/contracts", auth: "bearer", summary: "Create draft contract (unifiedChatId XOR legacyConversationId, title, body, amountUsd)." },
      { method: "GET", path: "/api/contracts/:id", auth: "bearer", summary: "Contract detail for parties." },
      { method: "PATCH", path: "/api/contracts/:id/draft", auth: "bearer", summary: "Edit draft / revision terms." },
      { method: "POST", path: "/api/contracts/:id/send", auth: "bearer", summary: "Send for signatures." },
      { method: "POST", path: "/api/contracts/:id/sign", auth: "bearer", summary: "Party approves terms." },
      { method: "POST", path: "/api/contracts/:id/revision", auth: "bearer", summary: "Request edits (body.note)." },
      { method: "POST", path: "/api/contracts/:id/cancel", auth: "bearer", summary: "Cancel before funds locked." },
      { method: "POST", path: "/api/contracts/:id/crypto-intent", auth: "bearer", summary: "Client NOWPayments checkout; order_id CT-…" },
      { method: "POST", path: "/api/admin/contracts/:id/release-funds", auth: "bearer", summary: "Admin marks payout approved (held → released)." },
      { method: "PUT", path: "/api/projects/:id/workspace", auth: "bearer", summary: "Update workspace state." },
      { method: "PUT", path: "/api/projects/:id/milestones", auth: "bearer", summary: "Milestone updates." },
      { method: "PUT", path: "/api/projects/:id/status", auth: "bearer", summary: "Status transition." },
      { method: "POST", path: "/api/projects/:id/chat", auth: "bearer", summary: "Project-scoped chat action." },
      { method: "POST", path: "/api/projects/:id/agent-runs", auth: "bearer", summary: "Start agent run." },
      { method: "POST", path: "/api/projects/:id/deliverables", auth: "bearer", summary: "Submit deliverable." },
      { method: "GET", path: "/api/projects/:id/review-eligibility", auth: "bearer", summary: "Review window eligibility." },
      { method: "GET", path: "/api/projects/:id/analytics", auth: "bearer", summary: "Project analytics." },
    ],
  },
  {
    title: "Account",
    endpoints: [
      { method: "PUT", path: "/api/settings", auth: "bearer", summary: "User settings / feed preferences." },
      { method: "PUT", path: "/api/profile", auth: "bearer", summary: "Update profile fields." },
      { method: "POST", path: "/api/profile/avatar", auth: "bearer", summary: "Avatar upload." },
      { method: "POST", path: "/api/profile/kyc/submit", auth: "bearer", summary: "Submit KYC." },
      { method: "POST", path: "/api/account/delete", auth: "bearer", summary: "Request account deletion." },
      { method: "POST", path: "/api/onboarding/complete", auth: "bearer", summary: "Legacy: full wizard completion (prefer Settings save; see profile onboarding_completed_at)." },
    ],
  },
  {
    title: "Notifications & portfolios",
    endpoints: [
      { method: "GET", path: "/api/notifications", auth: "bearer", summary: "List notifications." },
      { method: "PUT", path: "/api/notifications/:id/read", auth: "bearer", summary: "Mark read." },
      { method: "PUT", path: "/api/notifications/read-all", auth: "bearer", summary: "Mark all read." },
      { method: "DELETE", path: "/api/notifications", auth: "bearer", summary: "Clear notifications." },
      { method: "GET", path: "/api/portfolios", auth: "bearer", summary: "List portfolios." },
      { method: "POST", path: "/api/portfolios", auth: "bearer", summary: "Create portfolio." },
      { method: "GET", path: "/api/portfolios/:id", auth: "bearer", summary: "Portfolio detail." },
    ],
  },
  {
    title: "AI & agent",
    endpoints: [
      { method: "GET", path: "/api/ai-models", auth: "bearer", summary: "Available models." },
      { method: "GET", path: "/api/ai/status", auth: "bearer", summary: "AI service status." },
      { method: "POST", path: "/api/ai/chat", auth: "bearer", summary: "AI chat completion." },
      { method: "POST", path: "/api/ai/image", auth: "bearer", summary: "Image generation." },
      { method: "POST", path: "/api/agent-runs", auth: "bearer", summary: "Create agent run." },
      { method: "PATCH", path: "/api/agent-runs/:id", auth: "bearer", summary: "Update run." },
      { method: "POST", path: "/api/research", auth: "bearer", summary: "Start research job." },
      { method: "GET", path: "/api/research/:id", auth: "bearer", summary: "Research status." },
      { method: "POST", path: "/api/research/:id/artifacts", auth: "bearer", summary: "Attach artifacts." },
    ],
  },
  {
    title: "Stripe & admin",
    endpoints: [
      { method: "POST", path: "/api/stripe/webhook", auth: "public", summary: "Stripe webhook (signature required)." },
      { method: "GET", path: "/api/stripe/checkout-status", auth: "optional", summary: "Checkout session status." },
      { method: "POST", path: "/api/reviews", auth: "bearer", summary: "Submit project review." },
      { method: "GET", path: "/api/analytics/dashboard", auth: "bearer", summary: "Dashboard analytics." },
      { method: "POST", path: "/api/admin/kyc/review", auth: "bearer", summary: "Admin KYC decision." },
      { method: "GET", path: "/api/admin/disputes", auth: "bearer", summary: "Admin disputes list." },
      { method: "GET", path: "/api/admin/audit-log", auth: "bearer", summary: "Audit log." },
      { method: "POST", path: "/api/admin/projects/:id/dispute-resolve", auth: "bearer", summary: "Resolve dispute." },
    ],
  },
  {
    title: "Social connections",
    endpoints: [
      { method: "GET", path: "/api/social-connections", auth: "bearer", summary: "Linked social accounts." },
      { method: "DELETE", path: "/api/social-connections/:provider", auth: "bearer", summary: "Disconnect provider." },
      { method: "POST", path: "/api/social/oauth/start", auth: "bearer", summary: "Begin OAuth." },
      { method: "GET", path: "/api/social/oauth/callback", auth: "public", summary: "OAuth callback." },
    ],
  },
];
