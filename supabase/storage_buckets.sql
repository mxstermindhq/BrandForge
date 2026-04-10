-- Fix "Bucket not found" when uploading avatars, service covers, or chat files.
-- Run once: Supabase Dashboard → SQL → New query → Run.
-- Or create manually: Dashboard → Storage → New bucket → id must match exactly (avatars, service-covers, chat-files) → enable Public.

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('service-covers', 'service-covers', true),
  ('chat-files', 'chat-files', true)
on conflict (id) do nothing;
