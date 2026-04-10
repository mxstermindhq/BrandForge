-- Run in Supabase SQL Editor when you see:
--   "violates check constraint projects_status_check" (e.g. status disputed)
--   "violates check constraint notifications_type_check"
--
-- Safe to re-run: drops named constraints and re-adds with full app-supported values.

-- Projects: include disputed (and full lifecycle)
alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects
  add constraint projects_status_check
  check (status in ('active', 'review', 'delivered', 'completed', 'cancelled', 'disputed'));

-- Notifications: full type enum used by the Node API
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check
  check (type in (
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
  ));
