-- Run once in Supabase SQL Editor. Preserve existing subscriptions.
alter table public.pixelpilot_subscriptions add column if not exists current_period_start timestamptz;
-- Existing subscriptions get a start date on the next Stripe webhook sync.
-- Do not grant public read/write policies on this table.
