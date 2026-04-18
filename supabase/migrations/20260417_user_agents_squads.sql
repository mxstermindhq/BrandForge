-- User Agents and Squads System
-- Free users: 1 agent, can join squads but not create
-- Paid users: 3 agents, can create squads

-- User-created agents (simpler than agency infrastructure)
create table if not exists public.user_agents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name varchar(255) not null,
  description text,
  icon varchar(50) not null default 'smart_toy',
  category varchar(50) not null default 'general',
  capabilities text[] not null default '{}',
  status varchar(20) not null default 'active' check (status in ('active', 'idle', 'busy', 'archived')),
  projects_completed int not null default 0,
  rating numeric(2,1) not null default 5.0,
  config_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Squads (teams of users + their agents)
create table if not exists public.squads (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  description text,
  icon varchar(50) not null default 'groups',
  owner_id uuid not null references public.profiles (id) on delete cascade,
  status varchar(20) not null default 'active' check (status in ('active', 'inactive', 'disbanded')),
  projects_active int not null default 0,
  projects_completed int not null default 0,
  win_rate int not null default 0 check (win_rate >= 0 and win_rate <= 100),
  max_members int not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Squad members (users or agents)
create table if not exists public.squad_members (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squads (id) on delete cascade,
  member_type varchar(20) not null check (member_type in ('human', 'agent')),
  member_id uuid not null references public.profiles (id) on delete cascade,
  agent_id uuid references public.user_agents (id) on delete set null,
  role varchar(100) not null default 'Member',
  status varchar(20) not null default 'active' check (status in ('active', 'inactive', 'removed')),
  joined_at timestamptz not null default now(),
  unique(squad_id, member_id, agent_id)
);

-- Squad invitations
create table if not exists public.squad_invitations (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squads (id) on delete cascade,
  invited_by uuid not null references public.profiles (id) on delete cascade,
  invited_user_id uuid references public.profiles (id) on delete cascade,
  invited_email varchar(255),
  status varchar(20) not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

-- Indexes
create index if not exists user_agents_owner_idx on public.user_agents (owner_id);
create index if not exists user_agents_status_idx on public.user_agents (owner_id, status);
create index if not exists squads_owner_idx on public.squads (owner_id);
create index if not exists squads_status_idx on public.squads (status);
create index if not exists squad_members_squad_idx on public.squad_members (squad_id);
create index if not exists squad_members_user_idx on public.squad_members (member_id);

-- RLS Policies
alter table public.user_agents enable row level security;
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;
alter table public.squad_invitations enable row level security;

-- User Agents: users can manage their own agents
 drop policy if exists user_agents_select on public.user_agents;
create policy user_agents_select on public.user_agents
  for select using (owner_id = auth.uid());

drop policy if exists user_agents_mutate on public.user_agents;
create policy user_agents_mutate on public.user_agents
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Squads: visible to members or public active squads
drop policy if exists squads_select on public.squads;
create policy squads_select on public.squads
  for select using (
    status = 'active' or 
    owner_id = auth.uid() or
    exists (
      select 1 from public.squad_members sm 
      where sm.squad_id = squads.id and sm.member_id = auth.uid() and sm.status = 'active'
    )
  );

drop policy if exists squads_mutate on public.squads;
create policy squads_mutate on public.squads
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Squad Members: visible to squad members
drop policy if exists squad_members_select on public.squad_members;
create policy squad_members_select on public.squad_members
  for select using (
    exists (
      select 1 from public.squads s
      where s.id = squad_members.squad_id 
      and (s.status = 'active' or s.owner_id = auth.uid())
    ) or
    member_id = auth.uid()
  );

drop policy if exists squad_members_mutate on public.squad_members;
create policy squad_members_mutate on public.squad_members
  for all using (
    exists (
      select 1 from public.squads s
      where s.id = squad_members.squad_id and s.owner_id = auth.uid()
    )
  );

-- Invitations: visible to invited user or squad owner
drop policy if exists squad_invitations_select on public.squad_invitations;
create policy squad_invitations_select on public.squad_invitations
  for select using (
    invited_user_id = auth.uid() or
    exists (
      select 1 from public.squads s
      where s.id = squad_invitations.squad_id and s.owner_id = auth.uid()
    )
  );

-- Function to count user's active agents
create or replace function public.count_user_agents(user_uuid uuid)
returns int
language sql
security definer
stable
as $$
  select count(*)::int from public.user_agents 
  where owner_id = user_uuid and status in ('active', 'idle', 'busy');
$$;

-- Function to count user's squads (owned or member)
create or replace function public.count_user_squads(user_uuid uuid)
returns int
language sql
security definer
stable
as $$
  select count(distinct squad_id)::int from public.squad_members 
  where member_id = user_uuid and status = 'active';
$$;

-- Function to check if user can create squad (paid tier)
create or replace function public.can_create_squad(user_uuid uuid)
returns boolean
language plpgsql
security definer
stable
as $$
declare
  plan_tier varchar(50);
begin
  -- Get user's plan tier
  select coalesce(
    (select us.settings->>'plan_tier' from public.user_settings us where us.user_id = user_uuid),
    'free'
  ) into plan_tier;
  
  -- Free users cannot create squads (only join)
  -- Paid users can create
  return plan_tier != 'free';
end;
$$;
