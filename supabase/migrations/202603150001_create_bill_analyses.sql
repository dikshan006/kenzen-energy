create extension if not exists pgcrypto;

create table if not exists public.bill_analyses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  total_bill numeric not null,
  kwh_usage numeric not null,
  demand_charge numeric,
  peak_demand_kw numeric,
  peak_hours text,
  estimated_waste_range text not null,
  main_cost_driver text not null,
  recommendations jsonb not null default '[]'::jsonb,
  raw_bill_text text not null
);

create index if not exists bill_analyses_created_at_idx
  on public.bill_analyses (created_at desc);
