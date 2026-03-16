alter table public.bill_analyses
  add column if not exists savings_actions jsonb not null default '[]'::jsonb,
  add column if not exists parsed_fields jsonb not null default '{}'::jsonb,
  add column if not exists laundromat_profile jsonb not null default '{}'::jsonb,
  add column if not exists benchmark_summary jsonb not null default '{}'::jsonb;
