-- Per-user read cursor for legacy deal threads (unified_chat_participants already has last_read_at).
alter table public.conversation_participants
  add column if not exists last_read_at timestamptz;

comment on column public.conversation_participants.last_read_at is
  'Updated when the participant opens the thread or sends a message; used for hub unread.';
