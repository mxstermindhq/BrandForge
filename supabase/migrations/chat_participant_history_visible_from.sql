-- Scoped message history per participant (invite: "since join" vs full thread).
alter table public.conversation_participants
  add column if not exists history_visible_from timestamptz;

comment on column public.conversation_participants.history_visible_from is
  'Only messages with created_at >= this time are visible; NULL = full history.';

alter table public.unified_chat_participants
  add column if not exists history_visible_from timestamptz;

comment on column public.unified_chat_participants.history_visible_from is
  'Only unified_messages with created_at >= this time are visible; NULL = full history.';

-- Client/Realtime SELECT must match server filtering (see platform-repository getUnifiedChat).
drop policy if exists unified_messages_select_participant on public.unified_messages;
create policy unified_messages_select_participant on public.unified_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.unified_chat_participants p
      where p.chat_id = unified_messages.chat_id
        and p.user_id = (select auth.uid())
        and coalesce(p.is_deleted, false) = false
        and (
          p.history_visible_from is null
          or unified_messages.created_at >= p.history_visible_from
        )
    )
  );
