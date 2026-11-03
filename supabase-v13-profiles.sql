-- PixelPilot V13 profiles: execute once in Supabase SQL Editor. Existing subscriptions untouched.
create table if not exists public.pixelpilot_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique,
 display_name text not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint username_format check (username ~ '^[a-z][a-z0-9_]{2,23}$'),
 constraint display_name_length check (char_length(trim(display_name)) between 2 and 48)
);
alter table public.pixelpilot_profiles enable row level security;
revoke all on public.pixelpilot_profiles from anon;
grant select, insert, update on public.pixelpilot_profiles to authenticated;
drop policy if exists "Creators view own profile" on public.pixelpilot_profiles;
create policy "Creators view own profile" on public.pixelpilot_profiles for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "Creators create own profile" on public.pixelpilot_profiles;
create policy "Creators create own profile" on public.pixelpilot_profiles for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "Creators edit own profile" on public.pixelpilot_profiles;
create policy "Creators edit own profile" on public.pixelpilot_profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
-- Username uniqueness enforced by database unique constraint. No public profile listing.
