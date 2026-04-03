-- Referral tracking: stores who referred whom
create table if not exists public.referrals (
  id           uuid primary key default gen_random_uuid(),
  referrer_id  uuid not null references auth.users(id) on delete cascade,
  referred_id  uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  constraint referrals_unique_pair unique (referrer_id, referred_id),
  constraint referrals_no_self check (referrer_id <> referred_id)
);

-- Index for counting referrals by referrer
create index if not exists idx_referrals_referrer on public.referrals (referrer_id);

-- RLS
alter table public.referrals enable row level security;

-- Users can read their own referrals (where they are the referrer)
create policy "Users can read own referrals"
  on public.referrals for select
  using (referrer_id = auth.uid());

-- Insert is done via the backend/hook after signup, so allow insert
-- only when the referred_id matches the authenticated user (the new signup)
create policy "New user can record own referral"
  on public.referrals for insert
  with check (referred_id = auth.uid());
