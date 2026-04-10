-- Persisted pins per deal thread (unified or legacy), Discord-style.

create table if not exists public.chat_message_pins (
  id uuid primary key default gen_random_uuid(),
  unified_chat_id uuid references public.unified_chats(id) on delete cascade,
  unified_message_id uuid references public.unified_messages(id) on delete cascade,
  legacy_conversation_id uuid references public.conversations(id) on delete cascade,
  legacy_message_id uuid references public.messages(id) on delete cascade,
  pinned_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint chat_message_pins_one_thread_chk check (
    (
      unified_chat_id is not null
      and unified_message_id is not null
      and legacy_conversation_id is null
      and legacy_message_id is null
    )
    or (
      unified_chat_id is null
      and unified_message_id is null
      and legacy_conversation_id is not null
      and legacy_message_id is not null
    )
  )
);

create unique index if not exists chat_message_pins_unified_unique
  on public.chat_message_pins (unified_chat_id, unified_message_id)
  where unified_chat_id is not null;

create unique index if not exists chat_message_pins_legacy_unique
  on public.chat_message_pins (legacy_conversation_id, legacy_message_id)
  where legacy_conversation_id is not null;

create index if not exists chat_message_pins_unified_chat_idx
  on public.chat_message_pins (unified_chat_id, created_at desc)
  where unified_chat_id is not null;

create index if not exists chat_message_pins_legacy_conv_idx
  on public.chat_message_pins (legacy_conversation_id, created_at desc)
  where legacy_conversation_id is not null;

comment on table public.chat_message_pins is 'Pinned messages for deal threads; max enforced in API.';
