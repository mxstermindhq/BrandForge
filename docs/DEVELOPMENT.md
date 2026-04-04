# Development Guide

## Architecture (current repo)

```
Browser                              Node (server.js)
───────                              ────────────────
mxstermind.html                      Static files
production-layer.js  ──fetch──►     /api/*  →  platform-repository.js
auth-client.js  (Supabase Auth)     auth-service.js (JWT from Bearer token)
@supabase/supabase-js (browser)     @supabase/supabase-js (service role, server)
Supabase Realtime (client)          notify-email.js (Resend, after notification row insert)
```

**Auth:** Sign-in/up runs in the browser via Supabase; authenticated `fetch` sends `Authorization: Bearer <session.access_token>`. The Node app validates the JWT and enforces ownership in `platform-repository.js` (service role must not bypass these checks in new code).

**Note:** Separate `wallet-service.js`, `ai-service.js`, `notification-service.js` modules are **not** present in this tree; logic lives in `platform-repository.js` + `server.js` routes unless/until those services are added.

---

## Database Schema (Full)

Core tables — see `supabase/schema.sql` for full DDL.

### Identity & Network
```sql
profiles              -- master user record, mx_score, tier, wallet_balance
user_settings         -- notification prefs, privacy, plan
follows               -- follower/following graph
endorsements          -- skill endorsements from past clients
feed_events           -- activity feed (project completed, badge earned, etc.)
```

### Marketplace
```sql
service_packages      -- services listed by specialists
project_requests      -- briefs posted by clients
bids                  -- proposals on requests or services
projects              -- live project rooms (created on bid accept)
milestones            -- per-project task board (todo/in_progress/review/done)
reviews               -- post-project ratings, both directions
disputes              -- flagged projects awaiting admin resolution
squads                -- human + AI squad definitions
squad_members         -- human members of a squad
retainers             -- monthly subscription relationships
```

### Workspace
```sql
unified_chats         -- negotiation threads (service or request context)
unified_messages      -- messages in unified chats
unified_chat_participants
project_chats         -- project room threads (created on bid accept)
project_messages
project_files         -- attachments per project
mx_docs               -- collaborative documents
```

### AI Layer
```sql
agent_runs            -- mx Agent task history
research_threads      -- Deep Research sessions
research_citations    -- sources per research thread
image_generations     -- mx Image generation history
ai_models             -- available model config (returned by /api/ai-models)
```

### Economy
```sql
transactions          -- all money movement (bid accept, payout, fee, reward)
wallet_events         -- credit/debit log per user
leaderboard_seasons   -- season definitions, reward pools
season_credits        -- per-user credits per season
```

### Platform
```sql
notifications         -- in-app notification queue
platform_state        -- singleton config row
feature_flags         -- per-feature on/off with targeting
admin_log             -- audit trail for admin actions
```

**RLS:** Enabled on all tables. Node server uses service role but still enforces ownership in repository layer — never trust role alone.

**Indexes required:**
```sql
-- Add to schema.sql
CREATE INDEX ON projects(client_id, status);
CREATE INDEX ON projects(specialist_id, status);
CREATE INDEX ON bids(request_id, status);
CREATE INDEX ON unified_messages(chat_id, created_at);
CREATE INDEX ON project_messages(project_id, created_at);
CREATE INDEX ON notifications(user_id, is_read, created_at);
CREATE INDEX ON season_credits(season_id, credits DESC);
CREATE INDEX ON feed_events(user_id, created_at DESC);
```

---

## API reference — **implemented** (`server.js`)

Auth is primarily **client-side Supabase**; the server exposes:

```
GET  /api/auth/config
GET  /api/auth/me
GET  /api/bootstrap
GET  /api/marketplace-stats
PUT  /api/settings
PUT  /api/profile
POST /api/profile/avatar              JSON body: { dataUrl } → Storage `avatars`
POST /api/reviews
POST /api/requests
PUT  /api/requests/:id
DELETE /api/requests/:id
POST /api/services
PUT|PATCH /api/services/:id
DELETE /api/services/:id
POST /api/services/:id/cover          JSON body: { dataUrl } → `service-covers`
POST /api/bids
GET  /api/requests/:id/bids
POST /api/bids/:id/accept
POST /api/bids/:id/reject
POST /api/agent-runs
POST /api/chat/start
GET  /api/chat/:conversationId
POST /api/chat/files                  Legacy conversation file upload
POST /api/chat/messages               Legacy conversation message
POST /api/chat/:id/leave
POST /api/chat/legacy/clear
POST /api/research              Creates run; with LLM keys configured, generates memo into results.body
GET  /api/research/:id
POST /api/research/:id/artifacts
GET  /api/chats
POST /api/chats
GET  /api/chats/:id
POST /api/chats/:id/messages
POST /api/chats/:id/files             Unified chat file upload
POST /api/chats/:id/typing
POST /api/chats/:id/leave
GET  /api/projects/:id
PUT  /api/projects/:id/status
PUT  /api/projects/:id/milestones
POST /api/projects/:id/chat           Ensure/open legacy project conversation
POST /api/projects/:id/agent-runs
POST /api/projects/:id/deliverables
GET  /api/projects/:id/analytics
GET  /api/projects/:id/review-eligibility
GET  /api/analytics/dashboard
GET  /api/notifications
PUT  /api/notifications/read-all
PUT  /api/notifications/:id/read
GET  /api/portfolios
POST /api/portfolios
GET  /api/portfolios/:id
GET  /api/profiles/:username/public
GET  /api/ai-models
GET  /api/ai/status                 Non-secret: whether chat / image LLM is configured + active provider id
POST /api/ai/chat                   mx Agent (JSON body: mode, messages) — requires a configured LLM key (see AI env)
POST /api/ai/image                  DALL·E 3 (JSON body: prompt) — AI_IMAGE_KEY or OPENAI_API_KEY / OpenAI-style legacy key
GET  /api/requests/:id/matches      Owner-only specialist suggestions
PATCH /api/agent-runs/:id          Merge AI milestone text into run (e.g. aiAssistantReply)
```

Public catalog, requests list, and signed-in “mine” lists are driven mainly by **`GET /api/bootstrap`** payload (not separate `/api/services` HTTP routes in this server).

**AI env:** Configure **at least one** of `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `MISTRAL_API_KEY`, `TOGETHER_API_KEY`, `XAI_API_KEY`, `GEMINI_API_KEY` / `GOOGLE_AI_API_KEY`, or legacy **`AI_API_KEY`**. Set **`AI_PROVIDER`** when several are present. **`AI_MODEL`** overrides the default model for that provider. **`AI_OPENAI_BASE_URL`** customizes the OpenAI-compatible endpoint for `AI_PROVIDER=openai`.

---

## API reference — **planned / not in this server**

Roadmap targets such as **squads, retainers, wallet, streaming `/api/ai/chat`, admin APIs, dedicated `/api/leaderboard`**, and some CRUD niceties (e.g. follow/unfollow, feed) are **not** routed in `server.js` yet. See [ROADMAP.md](ROADMAP.md) Phase 2+.

---

## mx Score Algorithm

Computed nightly via cron. Stored on `profiles.mx_score`.

```javascript
mx_score = (
  (jobs_completed   * 10)  +   // volume
  (avg_rating       * 20)  +   // quality (0–100)
  (bid_win_rate     * 5)   +   // effectiveness
  (on_time_rate     * 15)  +   // reliability
  (network_invites  * 3)   +   // growth contribution
  (endorsements     * 2)       // peer validation
)

// Tier thresholds
Challenger:  0–99
Rival:       100–299
Duelist:     300–599
Gladiator:   600–999
Undisputed:  1000+
```

Season credits use the same inputs but reset per season. USDT reward pool distributed proportionally to top 100 credit holders at season end.

---

## Real-time (Supabase Realtime)

Subscribe on client bootstrap:

```javascript
// Notifications
supabase.channel('notifications')
  .on('postgres_changes', { event: 'INSERT', table: 'notifications',
      filter: `user_id=eq.${userId}` }, handleNotification)
  .subscribe()

// Project chat
supabase.channel(`project:${projectId}`)
  .on('postgres_changes', { event: 'INSERT', table: 'project_messages',
      filter: `project_id=eq.${projectId}` }, handleMessage)
  .subscribe()

// Presence (typing indicators)
supabase.channel(`presence:${chatId}`)
  .on('presence', { event: 'sync' }, handlePresence)
  .track({ user_id: userId, typing: false })
  .subscribe()
```

---

## AI Integration

### mx Agent
- Model: Claude claude-sonnet-4-20250514 (primary), fallback to GPT-4o
- Streaming via SSE on `/api/ai/chat`
- Every response tagged `source: 'ai'` — client renders "AI suggestion" label
- Human must confirm before any AI output is sent to another user

### Image Generation
- Primary: Replicate (SDXL or Flux)
- Fallback: fal.ai
- Output stored in Supabase Storage `mx-images` bucket
- Watermarked with creator's mx username

### Deep Research
- Perplexity API or Claude with web search tool
- Results saved to `research_threads` table
- Exportable to mx Docs

---

## File Storage (Supabase Storage)

Buckets **used by this codebase today:**

| Bucket | Contents | Notes |
|--------|----------|--------|
| `avatars` | Profile photos | `POST /api/profile/avatar` |
| `service-covers` | Service listing covers | `POST /api/services/:id/cover` |
| `chat-files` | Attachments in unified + legacy chat | `POST /api/chats/:id/files`, `POST /api/chat/files` |

Create these as **public** buckets in the Supabase dashboard if uploads fail. Additional buckets (`portfolio`, `project-files`, `mx-images`, etc.) are roadmap-aligned, not all wired yet.

---

## Client Routing

- Hash routing: `nav('profiles' | 'services' | 'requests' | 'projects' | 'leaderboard' | 'wallet' | 'workspace' | 'admin')`
- Deep links: `#service=<id>`, `#request=<id>`, `#project=<id>`, `#profile=<username>`
- Onboarding gate: new users without `profile.onboarding_complete` are redirected to `/onboarding`

---

## Onboarding Flow

```
Step 1: Role → buyer | specialist | both
Step 2: Profile basics (avatar, name, bio, skills)
Step 3: First action nudge
  buyer      → "Post your first request"
  specialist → "List your first service"
Step 4: 3 tooltip tour of key surfaces
Set: profiles.onboarding_complete = true
```

---

## Feature Flags

All new features ship behind a flag. Toggle in admin panel or directly in `feature_flags` table.

```
mx_agent_chat        — AI chat assistant
mx_image_gen         — Image generation suite
mx_video_gen         — Video generation (later)
deep_research        — Deep Research feature
squads               — Outcome Squad system
retainers            — Monthly retainer billing
wallet_withdrawals   — Real USDT payouts
leaderboard_rewards  — Season reward distribution
feed                 — Activity feed + follow system
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm start` | Production server |
| `npm run score:update` | Recalculate all mx scores (cron) |
| `npm run season:close` | End season, distribute rewards |
| `npm run db:migrate` | Apply schema migrations |
| `npm run audit` | npm audit + security check |

---

## Security Rules (Non-Negotiable)

- Rate limit: auth 10/min, bids 20/min, messages 60/min, AI 30/min — per user IP
- CORS: locked to known origins in production
- All JSON bodies: type-validated, max-length enforced, enums checked
- File uploads: content-type sniffed server-side, never trust extension only
- Service role key: server only, never in client bundle
- Webhook signatures: verified before processing (Stripe)
- AI API keys: budget alerts set on provider dashboards
- No PII in logs
- Audit log on: project creation, payments, disputes, admin actions
- SQL: parameterized queries only via Supabase client (no raw string concat)