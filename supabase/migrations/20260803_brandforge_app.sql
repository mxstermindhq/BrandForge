-- BrandForge App — chat-first workspace
-- Phase 1: data model, auth, RLS (fresh project, additive, nothing here depends on legacy tables)

-- ---------------------------------------------------------------
-- users (extends auth.users; auto-provisioned on signup)
-- ---------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'client'
    check (role in ('client', 'operator', 'founder')),
  name text not null default '',
  avatar_url text,
  email text
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (id, role, name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'client'),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1), 'New User'),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------
-- operator_profiles
-- ---------------------------------------------------------------
create table if not exists public.operator_profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  specialty text not null
    check (specialty in ('designer', 'developer', 'marketer', 'reverse_engineer')),
  bio text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- tickets
-- ---------------------------------------------------------------
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users (id) on delete cascade,
  operator_id uuid references public.users (id) on delete set null,
  status text not null default 'intake'
    check (status in ('intake', 'quoted', 'accepted', 'active', 'completed', 'cancelled')),
  project_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  sender_type text not null
    check (sender_type in ('client', 'operator', 'ai', 'founder')),
  sender_id uuid references public.users (id) on delete set null,
  content text not null default '',
  mentioned_model text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- ai_invocations (billing surface — every AI mention is logged here)
-- ---------------------------------------------------------------
create table if not exists public.ai_invocations (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages (id) on delete cascade,
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  model text not null,
  tokens_used integer not null default 0,
  cost_estimate numeric(12, 6) not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- escrow_ledger (status may only be changed by founder — enforced in RLS)
-- ---------------------------------------------------------------
create table if not exists public.escrow_ledger (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  line_item text not null
    check (line_item in ('match_fee', 'initiation', 'completion')),
  amount numeric(12, 2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'released')),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users (id) on delete set null
);

-- ---------------------------------------------------------------
-- tasks (kanban)
-- ---------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  title text not null default '',
  tag text,
  "column" text not null default 'backlog'
    check ("column" in ('backlog', 'in_progress', 'review', 'done')),
  position integer not null default 0,
  assignee_id uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- roadmap_milestones
-- ---------------------------------------------------------------
create table if not exists public.roadmap_milestones (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  label text not null default '',
  date date,
  status text not null default 'upcoming'
    check (status in ('done', 'current', 'upcoming')),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- helper: can a user access a ticket? (client / assigned operator / founder)
-- ---------------------------------------------------------------
create or replace function public.can_access_ticket(t uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.tickets tk
    join public.users u on u.id = auth.uid()
    where tk.id = t
      and (
        u.role = 'founder'
        or tk.client_id = auth.uid()
        or tk.operator_id = auth.uid()
      )
  );
$$;

-- security definer so policy evaluation never re-enters RLS on public.users
create or replace function public.is_founder()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'founder');
$$;

-- messages: stamp the real sender, and never let a browser client forge AI rows
create or replace function public.set_message_sender()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.sender_type = 'ai' then
    if auth.uid() is not null then
      raise exception 'only the server may post AI messages';
    end if;
    new.sender_id := null;
  else
    new.sender_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_messages_sender on public.messages;
create trigger trg_messages_sender
  before insert on public.messages
  for each row execute function public.set_message_sender();

-- ---------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------
alter table public.users enable row level security;
alter table public.operator_profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.messages enable row level security;
alter table public.ai_invocations enable row level security;
alter table public.escrow_ledger enable row level security;
alter table public.tasks enable row level security;
alter table public.roadmap_milestones enable row level security;

-- users: own row, ticket participants, or founder
create policy users_select_participant_or_own
  on public.users for select
  using (
    id = auth.uid()
    or public.is_founder()
    or exists (
      select 1 from public.tickets t
      where (t.client_id = public.users.id or t.operator_id = public.users.id)
        and public.can_access_ticket(t.id)
    )
  );

-- operator_profiles: same scope as users (profile is public to ticket participants + founder)
create policy operator_profiles_select_scoped
  on public.operator_profiles for select
  using (
    user_id = auth.uid()
    or public.is_founder()
    or exists (
      select 1 from public.tickets t
      where (t.client_id = public.operator_profiles.user_id or t.operator_id = public.operator_profiles.user_id)
        and public.can_access_ticket(t.id)
    )
  );

-- tickets: client sees own; operator sees assigned; founder sees all
create policy tickets_select_scoped
  on public.tickets for select
  using (
    client_id = auth.uid()
    or operator_id = auth.uid()
    or public.is_founder()
  );

create policy tickets_insert_client
  on public.tickets for insert
  with check (client_id = auth.uid());

create policy tickets_insert_founder
  on public.tickets for insert
  with check (public.is_founder());

create policy tickets_update_founder
  on public.tickets for update
  using (public.is_founder())
  with check (public.is_founder());

-- messages: party on the ticket may read; party on the ticket may write (AI rows are inserted by the server via service role)
create policy messages_select_scoped
  on public.messages for select
  using (public.can_access_ticket(ticket_id));

create policy messages_insert_scoped
  on public.messages for insert
  with check (public.can_access_ticket(ticket_id));

-- ai_invocations: readable by ticket parties; only service role (server) writes
create policy ai_invocations_select_scoped
  on public.ai_invocations for select
  using (public.can_access_ticket(ticket_id));

-- escrow_ledger: readable by ticket parties; status changes founder-only
create policy escrow_ledger_select_scoped
  on public.escrow_ledger for select
  using (public.can_access_ticket(ticket_id));

create policy escrow_ledger_insert_founder
  on public.escrow_ledger for insert
  with check (public.is_founder());

create policy escrow_ledger_update_founder_only
  on public.escrow_ledger for update
  using (public.is_founder())
  with check (public.is_founder());

-- tasks: ticket parties read; ticket parties write (kanban moves)
create policy tasks_select_scoped
  on public.tasks for select
  using (public.can_access_ticket(ticket_id));

create policy tasks_insert_scoped
  on public.tasks for insert
  with check (public.can_access_ticket(ticket_id));

create policy tasks_update_scoped
  on public.tasks for update
  using (public.can_access_ticket(ticket_id))
  with check (public.can_access_ticket(ticket_id));

create policy tasks_delete_scoped
  on public.tasks for delete
  using (public.can_access_ticket(ticket_id));

-- roadmap_milestones: visible to ticket parties; editable by founder + assigned operator only
create policy roadmap_milestones_select_scoped
  on public.roadmap_milestones for select
  using (public.can_access_ticket(ticket_id));

create policy roadmap_milestones_insert_scoped
  on public.roadmap_milestones for insert
  with check (
    public.is_founder()
    or exists (select 1 from public.tickets t where t.id = ticket_id and t.operator_id = auth.uid())
  );

create policy roadmap_milestones_update_scoped
  on public.roadmap_milestones for update
  using (
    public.is_founder()
    or exists (select 1 from public.tickets t where t.id = ticket_id and t.operator_id = auth.uid())
  )
  with check (
    public.is_founder()
    or exists (select 1 from public.tickets t where t.id = ticket_id and t.operator_id = auth.uid())
  );

create policy roadmap_milestones_delete_scoped
  on public.roadmap_milestones for delete
  using (
    public.is_founder()
    or exists (select 1 from public.tickets t where t.id = ticket_id and t.operator_id = auth.uid())
  );

-- ---------------------------------------------------------------
-- Realtime: messages + tickets flow through Supabase Realtime
-- ---------------------------------------------------------------
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.tickets;
alter table public.messages replica identity full;
alter table public.tickets replica identity full;

-- ---------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------
create index if not exists idx_tickets_client on public.tickets (client_id);
create index if not exists idx_tickets_operator on public.tickets (operator_id);
create index if not exists idx_messages_ticket on public.messages (ticket_id, created_at);
create index if not exists idx_messages_sender on public.messages (sender_id);
create index if not exists idx_ai_invocations_ticket on public.ai_invocations (ticket_id);
create index if not exists idx_escrow_ticket on public.escrow_ledger (ticket_id);
create index if not exists idx_tasks_ticket on public.tasks (ticket_id, "column", position);
create index if not exists idx_roadmap_ticket on public.roadmap_milestones (ticket_id, position);
