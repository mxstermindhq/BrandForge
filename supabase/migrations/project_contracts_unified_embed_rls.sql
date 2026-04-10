-- Project contracts (chat-linked), contract escrow intents (NOWPayments order_id CT-…), embed messages, RLS for realtime.
-- After apply: in Supabase Dashboard → Database → Replication, add table `unified_messages` to `supabase_realtime` publication (if not listed).

create table if not exists public.project_contracts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  unified_chat_id uuid references public.unified_chats(id) on delete set null,
  legacy_conversation_id uuid references public.conversations(id) on delete set null,
  client_id uuid not null references public.profiles(id) on delete restrict,
  provider_id uuid not null references public.profiles(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'draft' check (status in (
    'draft',
    'sent',
    'revision_requested',
    'fully_accepted',
    'awaiting_funds',
    'funds_held',
    'released',
    'cancelled'
  )),
  title text not null,
  body text not null default '',
  amount_usd numeric(12,2) not null check (amount_usd >= 0),
  client_signed_at timestamptz,
  provider_signed_at timestamptz,
  revision_note text,
  revision_requested_by uuid references public.profiles(id) on delete set null,
  payout_address text,
  fund_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_contracts_one_thread_chk check (
    (unified_chat_id is not null and legacy_conversation_id is null)
    or (unified_chat_id is null and legacy_conversation_id is not null)
  )
);

create index if not exists project_contracts_project_idx on public.project_contracts (project_id);
create index if not exists project_contracts_chat_idx on public.project_contracts (unified_chat_id);
create index if not exists project_contracts_conv_idx on public.project_contracts (legacy_conversation_id);

create table if not exists public.contract_payment_intents (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.project_contracts(id) on delete cascade,
  payer_id uuid not null references public.profiles(id) on delete cascade,
  reference text not null unique,
  amount_usd numeric(12,2) not null,
  quote_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'cancelled')),
  paid_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  nowpayments_invoice_id text
);

create index if not exists contract_payment_intents_contract_idx on public.contract_payment_intents (contract_id, status);
create index if not exists contract_payment_intents_ref_idx on public.contract_payment_intents (reference);

alter table public.unified_messages drop constraint if exists unified_messages_content_type_check;
alter table public.unified_messages add constraint unified_messages_content_type_check
  check (content_type in ('text', 'image', 'file', 'voice', 'embed'));

alter table public.unified_messages enable row level security;

drop policy if exists unified_messages_select_participant on public.unified_messages;
create policy unified_messages_select_participant on public.unified_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.unified_chat_participants p
      where p.chat_id = unified_messages.chat_id
        and p.user_id = (select auth.uid())
        and coalesce(p.is_deleted, false) = false
    )
  );
