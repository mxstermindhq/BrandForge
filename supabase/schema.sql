create extension if not exists pgcrypto;

create table if not exists public.platform_state (
  state_key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists platform_state_updated_at_idx
  on public.platform_state (updated_at desc);

create table if not exists public.profiles (
  id uuid primary key,
  role text not null check (role in ('client', 'specialist', 'affiliate', 'admin', 'enterprise')),
  username text unique,
  full_name text,
  avatar_url text,
  headline text,
  bio text,
  skills text[] not null default '{}',
  availability text not null default 'available' check (availability in ('available', 'busy', 'unavailable')),
  timezone text,
  company_name text,
  is_verified boolean not null default false,
  is_public boolean not null default true,
  reputation numeric default 0,
  vouches numeric default 0,
  threads numeric default 0,
  posts numeric default 0,
  likes numeric default 0,
  credits numeric default 0,
  years_of_service integer default 0,
  staff_team boolean default false,
  top_member boolean default false,
  rating_avg numeric(2,1),
  rating_count integer not null default 0,
  completed_projects_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Post-project reviews (1:1 reviewer → reviewee per project)
create table if not exists public.project_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  body text not null check (char_length(trim(body)) >= 20),
  created_at timestamptz not null default now(),
  unique(project_id, reviewer_id)
);

create index if not exists project_reviews_reviewee_idx
  on public.project_reviews (reviewee_id, created_at desc);

create index if not exists project_reviews_project_idx
  on public.project_reviews (project_id);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  notification_settings jsonb not null default '{}'::jsonb,
  ai_settings jsonb not null default '{}'::jsonb,
  privacy_settings jsonb not null default '{}'::jsonb,
  billing_settings jsonb not null default '{}'::jsonb,
  security_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_packages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text unique,
  category text not null,
  description text not null,
  delivery_mode text not null check (delivery_mode in ('ai_only', 'hybrid', 'white_glove')),
  base_price numeric(12,2) not null,
  delivery_days integer not null,
  revisions integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_packages_owner_idx
  on public.service_packages (owner_id);

create index if not exists service_packages_status_idx
  on public.service_packages (status);

create table if not exists public.project_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text,
  budget_min numeric(12,2),
  budget_max numeric(12,2),
  due_date date,
  status text not null default 'open' check (status in ('open', 'review', 'awarded', 'closed')),
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_requests_owner_idx
  on public.project_requests (owner_id);

create index if not exists project_requests_status_idx
  on public.project_requests (status);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.project_requests(id) on delete cascade,
  bidder_id uuid not null references public.profiles(id) on delete cascade,
  price numeric(12,2) not null,
  delivery_days integer,
  proposal text not null,
  status text not null default 'submitted' check (status in ('submitted', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
  ai_assisted boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bids_request_idx
  on public.bids (request_id);

create index if not exists bids_bidder_idx
  on public.bids (bidder_id);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  subject text,
  context_type text not null check (context_type in ('direct', 'request', 'service_package', 'project', 'agent_run')),
  context_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_type text not null check (sender_type in ('user', 'ai', 'system')),
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at asc);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.project_requests(id) on delete set null,
  accepted_bid_id uuid references public.bids(id) on delete set null,
  client_id uuid not null references public.profiles(id) on delete restrict,
  owner_id uuid references public.profiles(id) on delete set null,
  title text not null,
  status text not null default 'active' check (status in ('active', 'review', 'delivered', 'completed', 'cancelled', 'disputed')),
  delivery_mode text not null check (delivery_mode in ('ai_only', 'hybrid', 'white_glove')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  initiated_by uuid references public.profiles(id) on delete set null,
  model text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'needs_human', 'completed', 'failed')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_runs_project_idx
  on public.agent_runs (project_id);

create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  type text not null check (type in ('concept', 'draft', 'revision', 'final', 'asset')),
  title text not null,
  content jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'reviewed', 'approved', 'rejected')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deliverables_project_idx
  on public.deliverables (project_id);

create index if not exists deliverables_status_idx
  on public.deliverables (status);

create table if not exists public.research_runs (
  id uuid primary key default gen_random_uuid(),
  initiated_by uuid not null references public.profiles(id) on delete restrict,
  topic text not null,
  mode text not null default 'Quick' check (mode in ('Quick', 'Deep', 'Custom')),
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  query jsonb not null default '{}'::jsonb,
  results jsonb not null default '{}'::jsonb,
  artifacts jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists research_runs_initiated_by_idx
  on public.research_runs (initiated_by);

create index if not exists research_runs_status_idx
  on public.research_runs (status);

create table if not exists public.research_artifacts (
  id uuid primary key default gen_random_uuid(),
  research_run_id uuid not null references public.research_runs(id) on delete cascade,
  type text not null check (type in ('competitor_analysis', 'market_scan', 'trend_report', 'white_space', 'recommendation', 'asset')),
  title text not null,
  content jsonb not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists research_artifacts_research_run_id_idx
  on public.research_artifacts (research_run_id);

create index if not exists research_artifacts_type_idx
  on public.research_artifacts (type);

create table if not exists public.project_metrics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  metric_type text not null check (metric_type in ('turnaround_time', 'cost_efficiency', 'quality_score', 'client_satisfaction', 'revision_count')),
  value numeric not null,
  unit text not null default 'numeric',
  metadata jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now()
);

create index if not exists project_metrics_project_id_idx
  on public.project_metrics (project_id);

create index if not exists project_metrics_type_idx
  on public.project_metrics (metric_type);

create table if not exists public.workflow_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  agent_run_id uuid references public.agent_runs(id) on delete cascade,
  research_run_id uuid references public.research_runs(id) on delete cascade,
  event_type text not null check (event_type in ('project_created', 'bid_accepted', 'agent_started', 'agent_completed', 'deliverable_created', 'deliverable_approved', 'status_changed', 'message_sent')),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_type text not null check (actor_type in ('user', 'agent', 'system')),
  details jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null default now()
);

create index if not exists workflow_events_project_id_idx
  on public.workflow_events (project_id);

create index if not exists workflow_events_timestamp_idx
  on public.workflow_events (timestamp desc);

create index if not exists workflow_events_type_idx
  on public.workflow_events (event_type);

-- Unified Chat System
create table if not exists public.unified_chats (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('human', 'ai')),
  title text not null,
  subtitle text,
  avatar_url text,
  metadata jsonb not null default '{}'::jsonb,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists unified_chats_type_idx
  on public.unified_chats (type);

create index if not exists unified_chats_last_message_idx
  on public.unified_chats (last_message_at desc);

create table if not exists public.unified_chat_participants (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.unified_chats(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  ai_model text,
  role text not null default 'participant' check (role in ('participant', 'owner', 'ai')),
  last_read_at timestamptz,
  is_deleted boolean default false,
  created_at timestamptz not null default now(),
  unique(chat_id, user_id),
  unique(chat_id, ai_model)
);

create index if not exists unified_chat_participants_chat_idx
  on public.unified_chat_participants (chat_id);

create index if not exists unified_chat_participants_user_idx
  on public.unified_chat_participants (user_id);

create table if not exists public.unified_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.unified_chats(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  ai_model text,
  sender_type text not null check (sender_type in ('user', 'ai', 'system')),
  content text not null,
  content_type text not null default 'text' check (content_type in ('text', 'image', 'file', 'voice')),
  file_url text,
  file_name text,
  file_size integer,
  voice_duration integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists unified_messages_chat_idx
  on public.unified_messages (chat_id);

create index if not exists unified_messages_created_idx
  on public.unified_messages (created_at desc);

-- Notifications System
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in (
    'message',
    'profile_view',
    'service_inquiry',
    'request_inquiry',
    'project_update',
    'system',
    'bid_submitted',
    'bid_outcome',
    'review_received',
    'leaderboard_shift',
    'reward'
  )),
  title text not null,
  message text not null,
  related_id uuid,
  related_type text,
  is_read boolean default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id);

create index if not exists notifications_unread_idx
  on public.notifications (user_id, is_read);

create index if not exists notifications_created_idx
  on public.notifications (created_at desc);

-- Portfolio System
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  tags text[] not null default '{}',
  images text[] not null default '{}',
  project_url text,
  client_name text,
  completion_date date,
  featured boolean default false,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolios_owner_idx
  on public.portfolios (owner_id);

create index if not exists portfolios_featured_idx
  on public.portfolios (featured);

create index if not exists portfolios_status_idx
  on public.portfolios (status);

-- AI Models for multi-model chat
create table if not exists public.ai_models (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  provider text not null,
  model_id text not null,
  description text,
  max_tokens integer,
  supports_vision boolean default false,
  supports_files boolean default false,
  supports_voice boolean default false,
  free_quota integer default 0,
  paid_quota integer default 0,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

create index if not exists ai_models_active_idx
  on public.ai_models (is_active, sort_order);

-- Existing database migrations (run what you need):
-- alter table public.projects drop constraint if exists projects_status_check;
-- alter table public.projects add constraint projects_status_check
--     check (status in ('active', 'review', 'delivered', 'completed', 'cancelled', 'disputed'));
-- alter table public.profiles add column if not exists skills text[] not null default '{}';
-- alter table public.profiles add column if not exists availability text not null default 'available';
-- alter table public.profiles add constraint profiles_availability_check
--   check (availability in ('available', 'busy', 'unavailable'));
-- alter table public.profiles add column if not exists rating_avg numeric(2,1);
-- alter table public.profiles add column if not exists rating_count integer not null default 0;
-- alter table public.profiles add column if not exists completed_projects_count integer not null default 0;
-- Notifications: drop and recreate type check if extending enum:
-- alter table public.notifications drop constraint if exists notifications_type_check;
-- alter table public.notifications add constraint notifications_type_check check (type in (
--   'message','profile_view','service_inquiry','request_inquiry','project_update','system',
--   'bid_submitted','bid_outcome','review_received','leaderboard_shift','reward'));

-- Supabase Realtime: add notifications so the client can subscribe to INSERTs (Dashboard → Database → Publications):
-- alter publication supabase_realtime add table public.notifications;

-- Storage: public bucket for service listing cover images (same policies pattern as `avatars`):
-- create bucket "service-covers" as public; allow authenticated upload to own folder if using RLS policies.

-- Chat attachments (unified_messages file_url):
-- create bucket "chat-files" as public (or signed URLs + private bucket later).

-- Realtime: instant unified chat delivery (Dashboard → Database → Publications):
-- alter publication supabase_realtime add table public.unified_messages;
