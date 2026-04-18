-- Agency AI agent infrastructure (distinct from public.agent_runs = project AI studio runs)
-- FKs use public.profiles(id), aligned with the rest of the schema.

create table if not exists public.agent_infra_templates (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.profiles (id) on delete set null,
  is_platform_template boolean not null default false,
  name varchar(255) not null,
  description text,
  category varchar(100) not null,
  config_json jsonb not null default '{}'::jsonb,
  icon varchar(50) not null default 'smart_toy',
  price_monthly integer not null,
  is_public boolean not null default false,
  sales_count integer not null default 0,
  avg_roi_generated integer not null default 0,
  rating numeric(2,1) not null default 5.0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agent_infra_templates_owner_chk check (agency_id is not null or is_platform_template = true)
);

create table if not exists public.agent_infra_deployments (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.agent_infra_templates (id) on delete cascade,
  agency_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  custom_config_json jsonb not null default '{}'::jsonb,
  status varchar(50) not null default 'active',
  monthly_price integer not null,
  stripe_subscription_id text,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_infra_execution_runs (
  id uuid primary key default gen_random_uuid(),
  deployment_id uuid not null references public.agent_infra_deployments (id) on delete cascade,
  trigger_type varchar(50) not null,
  input_data jsonb,
  output_data jsonb,
  tokens_used integer not null default 0,
  cost_usd numeric(12,6) not null default 0,
  status varchar(50) not null default 'running',
  error_message text,
  execution_time_ms integer,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.agent_infra_roi (
  id uuid primary key default gen_random_uuid(),
  deployment_id uuid not null references public.agent_infra_deployments (id) on delete cascade,
  metric_type varchar(50) not null,
  value numeric(12,2) not null,
  period_start date not null,
  period_end date not null,
  data_source varchar(100),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_infra_workflows (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.profiles (id) on delete cascade,
  name varchar(255) not null,
  description text,
  nodes_json jsonb not null default '[]'::jsonb,
  edges_json jsonb not null default '[]'::jsonb,
  status varchar(50) not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_infra_templates_agency_idx on public.agent_infra_templates (agency_id);
create index if not exists agent_infra_templates_public_cat_idx
  on public.agent_infra_templates (category) where is_public = true;
create index if not exists agent_infra_deployments_agency_idx on public.agent_infra_deployments (agency_id);
create index if not exists agent_infra_deployments_client_idx on public.agent_infra_deployments (client_id);
create index if not exists agent_infra_exec_runs_dep_idx
  on public.agent_infra_execution_runs (deployment_id, created_at desc);
create index if not exists agent_infra_roi_dep_idx on public.agent_infra_roi (deployment_id, period_end desc);

alter table public.agent_infra_templates enable row level security;
alter table public.agent_infra_deployments enable row level security;
alter table public.agent_infra_execution_runs enable row level security;
alter table public.agent_infra_roi enable row level security;
alter table public.agent_infra_workflows enable row level security;

drop policy if exists agent_infra_templates_select on public.agent_infra_templates;
create policy agent_infra_templates_select on public.agent_infra_templates
  for select using (is_public = true or agency_id = auth.uid());

drop policy if exists agent_infra_templates_mutate on public.agent_infra_templates;
create policy agent_infra_templates_mutate on public.agent_infra_templates
  for all using (agency_id = auth.uid() and agency_id is not null)
  with check (agency_id = auth.uid() and agency_id is not null);

drop policy if exists agent_infra_deployments_select on public.agent_infra_deployments;
create policy agent_infra_deployments_select on public.agent_infra_deployments
  for select using (agency_id = auth.uid() or client_id = auth.uid());

drop policy if exists agent_infra_deployments_mutate on public.agent_infra_deployments;
create policy agent_infra_deployments_mutate on public.agent_infra_deployments
  for all using (agency_id = auth.uid())
  with check (agency_id = auth.uid());

drop policy if exists agent_infra_exec_runs_select on public.agent_infra_execution_runs;
create policy agent_infra_exec_runs_select on public.agent_infra_execution_runs
  for select using (
    exists (
      select 1 from public.agent_infra_deployments d
      where d.id = agent_infra_execution_runs.deployment_id
        and (d.agency_id = auth.uid() or d.client_id = auth.uid())
    )
  );

drop policy if exists agent_infra_roi_select on public.agent_infra_roi;
create policy agent_infra_roi_select on public.agent_infra_roi
  for select using (
    exists (
      select 1 from public.agent_infra_deployments d
      where d.id = agent_infra_roi.deployment_id
        and (d.agency_id = auth.uid() or d.client_id = auth.uid())
    )
  );

drop policy if exists agent_infra_workflows_all on public.agent_infra_workflows;
create policy agent_infra_workflows_all on public.agent_infra_workflows
  for all using (agency_id = auth.uid())
  with check (agency_id = auth.uid());

-- Inserts/updates to execution_runs and ROI are intended via service role (Node API / cron), not anon clients.

create or replace function public.get_agent_infra_stats(deployment_uuid uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'total_runs', coalesce((
      select count(*)::int from public.agent_infra_execution_runs
      where deployment_id = deployment_uuid
    ), 0),
    'successful_runs', coalesce((
      select count(*)::int from public.agent_infra_execution_runs
      where deployment_id = deployment_uuid and status = 'completed'
    ), 0),
    'failed_runs', coalesce((
      select count(*)::int from public.agent_infra_execution_runs
      where deployment_id = deployment_uuid and status = 'failed'
    ), 0),
    'avg_execution_time', (
      select avg(execution_time_ms)::numeric from public.agent_infra_execution_runs
      where deployment_id = deployment_uuid and status = 'completed'
    ),
    'total_cost', coalesce((
      select sum(cost_usd) from public.agent_infra_execution_runs
      where deployment_id = deployment_uuid
    ), 0),
    'roi_30d', coalesce((
      select sum(value) from public.agent_infra_roi
      where deployment_id = deployment_uuid and period_end >= (now() - interval '30 days')::date
    ), 0)
  ) into result;
  return result;
end;
$$;

-- Seed public marketplace templates (platform-owned, idempotent)
insert into public.agent_infra_templates (
  agency_id, is_platform_template, name, description, category, config_json, icon, price_monthly, is_public, sales_count, avg_roi_generated, rating
)
select null, true, 'SEO Content Agent',
  'Autonomous SEO agent that researches competitors, drafts optimized content, and can publish to your CMS when connected.',
  'seo',
  '{
    "frequency": "daily",
    "competitor_urls": [],
    "target_keywords": [],
    "tone": "professional",
    "word_count": 1500,
    "wordpress_url": null,
    "auto_publish": false,
    "human_approval": true
  }'::jsonb,
  'search', 300000, true, 0, 0, 5.0
where not exists (
  select 1 from public.agent_infra_templates t where t.is_platform_template and t.name = 'SEO Content Agent'
);

insert into public.agent_infra_templates (
  agency_id, is_platform_template, name, description, category, config_json, icon, price_monthly, is_public, sales_count, avg_roi_generated, rating
)
select null, true, 'Content Refresh Agent',
  'Finds declining pages and proposes refreshes to recover rankings.',
  'seo',
  '{
    "frequency": "weekly",
    "decline_threshold": -15,
    "refresh_strategy": "expand_and_update",
    "preserve_url_structure": true
  }'::jsonb,
  'autorenew', 200000, true, 0, 0, 5.0
where not exists (
  select 1 from public.agent_infra_templates t where t.is_platform_template and t.name = 'Content Refresh Agent'
);
