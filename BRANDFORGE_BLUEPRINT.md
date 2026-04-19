# BrandForge Platform Blueprint
## Technical Architecture & System Design

---

## 1. SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BRANDFORGE PLATFORM                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │   Mobile     │  │   API        │  │   Admin      │     │
│  │   (Next.js)  │  │   (Future)   │  │   (REST)     │  │   Dashboard  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │                 │              │
│         └─────────────────┴─────────────────┴─────────────────┘              │
│                                    │                                         │
│                              ┌─────┴─────┐                                   │
│                              │   Node.js   │                                   │
│                              │   Server    │                                   │
│                              │  (server.js)│                                   │
│                              └─────┬─────┘                                   │
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐              │
│         │                        │                        │              │
│    ┌────┴────┐            ┌─────┴─────┐            ┌─────┴─────┐          │
│    │Supabase │            │  AI Layer  │            │  External  │          │
│    │(Postgres│            │            │            │  Services  │          │
│    │ + Auth) │            │ • OpenAI   │            │ • Stripe   │          │
│    └─────────┘            │ • Claude   │            │ • NowPayments│         │
│                           │ • Agents   │            │ • Email    │          │
│                           └────────────┘            └────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DATABASE SCHEMA (Core Tables)

### User & Identity Layer
```sql
profiles
├── id (uuid, PK)
├── user_id (uuid, FK auth.users)
├── username (text, unique)
├── full_name (text)
├── avatar_url (text)
├── bio (text)
├── headline (text)
├── role (text: client|seller|hybrid)
├── skills (text[])
├── reputation (numeric)
├── rating_avg (numeric)
├── rating_count (int)
├── completed_projects_count (int)
├── top_member (boolean)
├── onboarding_completed_at (timestamp)
├── created_at, updated_at
└── settings (jsonb)

user_settings
├── user_id (uuid, PK)
├── theme (text)
├── notifications_enabled (boolean)
├── email_preferences (jsonb)
└── feed_preferences (jsonb)

social_connections
├── id (uuid, PK)
├── user_id (uuid, FK profiles)
├── provider (text)
├── provider_user_id (text)
├── access_token (encrypted)
└── created_at
```

### Marketplace Layer
```sql
service_packages
├── id (uuid, PK)
├── owner_id (uuid, FK profiles)
├── title (text)
├── slug (text, unique)
├── description (text)
├── category (text)
├── base_price (numeric)
├── delivery_days (int)
├── delivery_mode (text: ai_only|hybrid|white_glove)
├── revisions (int)
├── status (text: draft|published|archived)
├── metadata (jsonb: {rating, sales, coverUrl})
├── view_count (int)
└── created_at, updated_at

project_requests
├── id (uuid, PK)
├── owner_id (uuid, FK profiles)
├── title (text)
├── description (text)
├── category (text)
├── budget_min, budget_max (numeric)
├── due_date (date)
├── tags (text[])
├── status (text: open|closed|awarded)
└── created_at, updated_at

bids
├── id (uuid, PK)
├── request_id (uuid, FK project_requests)
├── bidder_id (uuid, FK profiles)
├── amount (numeric)
├── proposal (text)
├── delivery_days (int)
├── status (text: pending|accepted|rejected)
└── created_at
```

### Communication Layer
```sql
unified_chats
├── id (uuid, PK)
├── title (text)
├── type (text: dm|group|project|ai)
├── context_type (text: service|request|project|none)
├── context_id (uuid)
├── status (text: active|archived)
├── created_by (uuid, FK profiles)
└── created_at

unified_chat_members
├── chat_id (uuid, FK unified_chats)
├── user_id (uuid, FK profiles)
├── role (text: owner|admin|member)
├── last_read_at (timestamp)
├── history_visible_from (timestamp)
└── joined_at

unified_messages
├── id (uuid, PK)
├── chat_id (uuid, FK unified_chats)
├── sender_id (uuid, FK profiles, nullable for AI)
├── content (text)
├── content_type (text: text|file|embed|system)
├── embed_type (text: deal_win|deal_loss|offer|counter_offer|service_bid)
├── embed_data (jsonb)
├── file_url (text)
├── file_name (text)
├── file_size (int)
├── reply_to_id (uuid, self-referential)
├── edited_at (timestamp)
└── created_at

chat_pins
├── chat_id (uuid, FK unified_chats)
├── message_id (uuid, FK unified_messages)
├── pinned_by (uuid, FK profiles)
└── pinned_at (timestamp)
```

### Project & Deal Layer
```sql
projects
├── id (uuid, PK)
├── title (text)
├── client_id (uuid, FK profiles)
├── owner_id (uuid, FK profiles) - seller
├── status (text: draft|active|delivered|review|completed|disputed)
├── final_price (numeric)
├── currency (text)
├── start_date (date)
├── due_date (date)
├── completed_at (timestamp)
├── brief (text)
├── deliverables (jsonb)
├── milestones (jsonb)
├── linked_chat_id (uuid, FK unified_chats)
├── linked_contract_id (uuid, FK contracts)
└── created_at, updated_at

contracts
├── id (uuid, PK)
├── project_id (uuid, FK projects)
├── client_id (uuid, FK profiles)
├── seller_id (uuid, FK profiles)
├── unified_chat_id (uuid, nullable)
├── legacy_conversation_id (uuid, nullable)
├── title (text)
├── body (text)
├── amount_usd (numeric)
├── status (text: draft|sent|signed|revision_requested|cancelled|disputed)
├── client_signed_at (timestamp)
├── seller_signed_at (timestamp)
├── revision_note (text)
├── payments_locked (boolean)
├── crypto_order_id (text)
└── created_at, updated_at

deliverables
├── id (uuid, PK)
├── project_id (uuid, FK projects)
├── submitted_by (uuid, FK profiles)
├── title (text)
├── description (text)
├── file_url (text)
├── status (text: pending|approved|rejected)
└── created_at
```

### Economic Layer
```sql
currency_balances
├── user_id (uuid, FK profiles, PK)
├── honor (int)
├── reputation (int)
├── locked_honor (int)
└── updated_at

currency_transactions
├── id (uuid, PK)
├── user_id (uuid, FK profiles)
├── type (text: earn|spend|lock|unlock|transfer)
├── amount (int)
├── honor_change (int)
├── reputation_change (int)
├── reason (text)
├── reference_table (text)
├── reference_id (uuid)
└── created_at

user_ratings
├── id (uuid, PK)
├── user_id (uuid, FK profiles)
├── rank (int)
├── tier (text)
├── xp (int)
├── deal_wins (int)
├── deal_losses (int)
├── total_gmv (numeric)
└── updated_at
```

### AI & Agent Layer
```sql
agent_runs
├── id (uuid, PK)
├── user_id (uuid, FK profiles)
├── agent_type (text: research|writer|designer|coder)
├── status (text: running|completed|failed)
├── input (jsonb)
├── output (jsonb)
├── credits_used (int)
└── created_at, completed_at

research_runs
├── id (uuid, PK)
├── user_id (uuid, FK profiles)
├── topic (text)
├── depth (text: quick|standard|deep)
├── status (text)
├── findings (text)
├── sources (jsonb)
├── artifacts (jsonb)
└── created_at

ai_conversations
├── id (uuid, PK)
├── user_id (uuid, FK profiles)
├── model (text: gpt-4|claude-opus-4|gemini-flash)
├── agent_used (text, nullable)
├── messages (jsonb[])
└── created_at, updated_at
```

### Squad Layer
```sql
squads
├── id (uuid, PK)
├── name (text)
├── slug (text, unique)
├── description (text)
├── avatar_url (text)
├── owner_id (uuid, FK profiles)
├── status (text: active|inactive)
└── created_at

squad_members
├── squad_id (uuid, FK squads)
├── user_id (uuid, FK profiles)
├── member_type (text: human|agent)
├── role (text: owner|admin|member)
├── status (text: active|inactive|pending)
└── joined_at
```

---

## 3. API ARCHITECTURE

### REST Endpoints Structure
```
/api/health                    → System health check
/api/auth/*                    → Authentication
/api/bootstrap                 → Initial app data
/api/settings                  → User settings
/api/profile                   → Profile management
/api/profiles/*                → Public profile ops

/api/services                  → CRUD service packages
/api/requests                  → CRUD project requests
/api/bids                      → Bid operations
/api/deals/*                   → Deal flow (counter-offers, lock)

/api/chat                      → Unified chat list
/api/chat/:id                  → Chat details
/api/chat/:id/messages         → Paginated messages
/api/chat/:id/files            → File uploads
/api/chat/:id/pins             → Message pinning
/api/chat/:id/invite           → Add participants
/api/chat/:id/leave            → Leave chat

/api/projects                  → Project list
/api/projects/:id              → Project workspace
/api/projects/:id/contracts    → Contract management
/api/projects/:id/deliverables  → Deliverable submission
/api/projects/:id/milestones   → Milestone updates
/api/projects/:id/chat          → Project-scoped chat

/api/contracts/:id/*           → Contract operations
/api/bids/:id/*                → Bid operations (checkout, accept)

/api/ai/*                      → AI endpoints
/api/agent-runs                → Agent execution
/api/research                  → Research jobs

/api/notifications             → User notifications
/api/portfolios                → User portfolios
/api/analytics/*               → Dashboard analytics
/api/admin/*                   → Admin operations

/api/stats/network             → Live network stats
/api/activity/recent           → Recent activity feed
/api/marketplace/*             → Marketplace operations
```

---

## 4. COMPONENT ARCHITECTURE

### Frontend Structure
```
web/src/
├── app/
│   ├── (landing)/              # Public pages
│   │   ├── page.tsx            # Homepage
│   │   ├── _components/        # Landing components
│   │   │   ├── LiveStats.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── HeroSection.tsx
│   │
│   ├── (main)/                 # Authenticated pages
│   │   ├── page.tsx            # Dashboard
│   │   ├── chat/               # Chat hub
│   │   ├── chat/[id]/          # Single chat thread
│   │   ├── services/           # Marketplace services
│   │   ├── requests/           # Project requests
│   │   ├── profile/            # User profile
│   │   ├── settings/           # User settings
│   │   ├── _components/        # Shared main components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MarketplacePreview.tsx
│   │
│   ├── api/                    # Next.js API routes (if any)
│   └── layout.tsx              # Root layout
│
├── components/
│   ├── ai/                     # AI components
│   │   ├── AIChatbox.tsx       # AI chat interface
│   │   ├── AgentSelector.tsx
│   │   └── ResearchPanel.tsx
│   │
│   ├── chat/                   # Chat components
│   │   ├── ChatMessage.tsx
│   │   ├── ChatComposer.tsx
│   │   └── ChatEmbeds.tsx      # Deal embeds
│   │
│   ├── marketplace/            # Marketplace components
│   │   ├── ServiceCard.tsx
│   │   ├── RequestCard.tsx
│   │   └── BidForm.tsx
│   │
│   ├── ui/                     # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   │
│   └── leaderboard/              # Leaderboard components
│       ├── WoWRankingSystem.tsx
│       └── HonorDisplay.tsx
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useBootstrap.ts
│   └── useRealtime.ts
│
├── lib/                        # Utilities
│   ├── api.ts                  # API client
│   ├── supabase/               # Supabase clients
│   └── utils.ts
│
├── providers/                  # Context providers
│   ├── AuthProvider.tsx
│   └── ThemeProvider.tsx
│
└── types/                      # TypeScript types
    ├── index.ts
    └── api.ts
```

### Key Component Patterns

```typescript
// Compound Component Pattern for Chat
<ChatContainer>
  <ChatHeader 
    title={chat.title}
    onToggleHistory={() => setShowHistory(!showHistory)}
  />
  {showHistory && <ChatHistory messages={messages} />}
  <ChatMessageList messages={messages} />
  <ChatComposer 
    onSend={handleSend}
    onFileUpload={handleUpload}
  />
</ChatContainer>

// Render Props for Embeds
<MessageEmbed 
  type="deal_win"
  data={embedData}
  renderActions={(data) => (
    <Button onClick={() => acceptDeal(data.id)}>
      Accept
    </Button>
  )}
/>
```

---

## 5. REAL-TIME ARCHITECTURE

### Supabase Realtime Setup
```javascript
// Channel subscriptions
const channels = [
  // Chat messages
  supabase
    .channel('chat-messages')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'unified_messages' },
      (payload) => handleNewMessage(payload.new)
    )
    .subscribe(),
  
  // User presence
  supabase
    .channel('presence')
    .on('presence', { event: 'sync' }, () => {
      const state = supabase.getPresenceState();
      updateOnlineUsers(state);
    })
    .subscribe(),
  
  // Notifications
  supabase
    .channel(`user-notifications:${userId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => showNotification(payload.new)
    )
    .subscribe()
];
```

### Optimistic Updates Pattern
```typescript
// 1. Update UI immediately
setMessages(prev => [...prev, optimisticMessage]);

// 2. Send to server
const saved = await api.post('/api/chat/messages', message);

// 3. Replace optimistic with real
setMessages(prev => 
  prev.map(m => m.id === optimisticId ? saved : m)
);
```

---

## 6. AI INTEGRATION ARCHITECTURE

### AI Model Router
```typescript
const AI_MODELS = {
  'claude-opus-4': {
    provider: 'anthropic',
    maxTokens: 4096,
    bestFor: ['complex_reasoning', 'code', 'analysis'],
  },
  'gpt-4o': {
    provider: 'openai',
    maxTokens: 4096,
    bestFor: ['general_chat', 'creativity', 'summarization'],
  },
  'gemini-flash': {
    provider: 'google',
    maxTokens: 8192,
    bestFor: ['long_context', 'quick_responses'],
  },
};

// Route based on message content
function selectModel(message: string, history: Message[]): string {
  if (containsCodeRequest(message)) return 'claude-opus-4';
  if (isSimpleQuestion(message)) return 'gemini-flash';
  return 'gpt-4o';
}
```

### Agent System
```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  systemPrompt: string;
  tools: Tool[];
}

const AGENTS: Agent[] = [
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Deep research on any topic',
    systemPrompt: 'You are a research analyst...',
    tools: [webSearchTool, summarizeTool],
  },
  {
    id: 'writer',
    name: 'Proposal Writer',
    description: 'Write winning proposals',
    systemPrompt: 'You are a proposal writer...',
    tools: [templateTool, pricingTool],
  },
  // ... more agents
];
```

---

## 7. SECURITY ARCHITECTURE

### Authentication Flow
```
1. User signs in via Supabase Auth
2. Server validates JWT
3. Profile bootstrap if new user
4. Presence tracking starts
5. Real-time subscriptions established
```

### Authorization Layers
```typescript
// Row Level Security (RLS) Policies

// Profiles: Users can only update their own
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (user_id = auth.uid());

// Messages: Only chat members can see messages
CREATE POLICY "Chat members can view messages"
  ON unified_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM unified_chat_members
      WHERE chat_id = unified_messages.chat_id
      AND user_id = auth.uid()
    )
  );

// Projects: Only participants can access
CREATE POLICY "Project participants can view"
  ON projects FOR SELECT
  USING (
    client_id = auth.uid() OR 
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = projects.id
      AND user_id = auth.uid()
    )
  );
```

### Data Validation
```typescript
// Zod schemas for all inputs
const BidSchema = z.object({
  requestId: z.string().uuid(),
  amount: z.number().positive().max(100000),
  proposal: z.string().min(10).max(5000),
  deliveryDays: z.number().int().positive().max(365),
});

// Sanitization
const sanitizeHtml = (input: string) => 
  DOMPurify.sanitize(input, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong'] });
```

---

## 8. SCALING CONSIDERATIONS

### Database
- Use connection pooling (PgBouncer)
- Read replicas for analytics queries
- Partition large tables (messages by date)
- Index strategy on foreign keys

### Caching Strategy
```
L1: React Query cache (client-side)
L2: Redis (frequently accessed: profiles, stats)
L3: CDN (static assets, avatars)
L4: Database (source of truth)
```

### File Storage
- Supabase Storage for files
- CDN for fast delivery
- Virus scanning on upload
- File type validation

---

## 9. MONITORING & OBSERVABILITY

### Key Metrics
```typescript
// Business metrics
- daily_active_users
- deals_closed_per_day
- gmv_per_day
- conversion_funnel

// Technical metrics
- api_response_time_p95
- error_rate
- realtime_connection_count
- database_query_time

// AI metrics
- ai_requests_per_day
- token_usage_per_model
- agent_completion_rate
- cost_per_ai_interaction
```

### Logging
```typescript
// Structured logging
logger.info({
  event: 'deal_locked',
  dealId: deal.id,
  buyerId: deal.client_id,
  sellerId: deal.owner_id,
  amount: deal.amount,
  duration_ms: Date.now() - startTime,
});
```

---

## 10. DEPLOYMENT ARCHITECTURE

### Production Setup
```
┌─────────────────────────────────────────┐
│              CDN (Vercel)                │
│         Static assets + Edge             │
└─────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────┐
│         Vercel (Next.js Frontend)       │
│         Serverless Functions             │
└─────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────┐
│     Node.js API Server (Railway/ECS)    │
│         WebSocket + REST API            │
└─────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────┐
│    Supabase (Postgres + Auth + Realtime)│
│         Managed Database                 │
└─────────────────────────────────────────┘
```

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NOWPAYMENTS_API_KEY=

# App
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=
JWT_SECRET=
```

---

*Blueprint Version: 1.0*
*Last Updated: April 19, 2026*
