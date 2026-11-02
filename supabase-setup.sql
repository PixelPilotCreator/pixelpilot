-- Run in Supabase SQL Editor. Do NOT put the service-role key in public files.
create table if not exists public.pixelpilot_subscriptions (
 user_id uuid primary key references auth.users(id) on delete cascade,
 stripe_customer_id text not null,
 stripe_subscription_id text not null unique,
 plan text not null check (plan in ('creator','pro','studio')),
 status text not null,
 current_period_end timestamptz,
 cancel_at_period_end boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.pixelpilot_subscriptions enable row level security;
-- No public policies: only trusted server-side service role may read/write.
create unique index if not exists pixelpilot_customer_unique on public.pixelpilot_subscriptions(stripe_customer_id);
