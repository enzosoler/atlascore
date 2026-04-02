-- ============================================================================
-- Atlas Core — Admin Console Schema Requirements
-- Run this in your Supabase SQL editor (Project → SQL Editor → New query).
-- ============================================================================

-- ─── 1. admin_audit_logs table ──────────────────────────────────────────────
-- Stores every admin action with actor, target, type, and before/after values.

create table if not exists public.admin_audit_logs (
  id               uuid primary key default gen_random_uuid(),
  actor_id         uuid not null references auth.users(id) on delete cascade,
  target_user_id   uuid references auth.users(id) on delete set null,
  action_type      text not null,
  action_detail    jsonb default '{}'::jsonb,
  old_value        jsonb,
  new_value        jsonb,
  created_at       timestamptz not null default now()
);

-- Index for fast lookups per actor and per target user
create index if not exists admin_audit_logs_actor_idx  on public.admin_audit_logs (actor_id, created_at desc);
create index if not exists admin_audit_logs_target_idx on public.admin_audit_logs (target_user_id, created_at desc);

-- ─── RLS: only admins can read/insert audit logs ────────────────────────────
alter table public.admin_audit_logs enable row level security;

-- Read: admin only
create policy "admin_audit_logs_select" on public.admin_audit_logs
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Insert: admin only, actor must be the authenticated user
create policy "admin_audit_logs_insert" on public.admin_audit_logs
  for insert
  with check (
    actor_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── 2. profiles — optional columns ─────────────────────────────────────────
-- These columns unlock suspend/unsuspend and onboarding reset in the admin console.
-- Add only the ones you do not already have.

-- Suspend flag
alter table public.profiles
  add column if not exists is_suspended boolean not null default false;

-- Onboarding reset (if you track onboarding on the profiles row rather than
-- auth.users user_metadata)
alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

-- ─── 3. profiles — RLS for admin reads ──────────────────────────────────────
-- Admins must be able to SELECT all profiles (not just their own).
-- Check your existing policies; add one like the following if missing:

-- drop policy if exists "admin_profiles_select_all" on public.profiles;
-- create policy "admin_profiles_select_all" on public.profiles
--   for select
--   using (
--     id = auth.uid()
--     or exists (
--       select 1 from public.profiles p2
--       where p2.id = auth.uid() and p2.role = 'admin'
--     )
--   );

-- ─── 4. subscriptions — RLS for admin reads ─────────────────────────────────
-- Admins must be able to SELECT all subscriptions.
-- Check your existing policies; add one like the following if missing:

-- drop policy if exists "admin_subscriptions_select_all" on public.subscriptions;
-- create policy "admin_subscriptions_select_all" on public.subscriptions
--   for select
--   using (
--     user_id = auth.uid()
--     or exists (
--       select 1 from public.profiles
--       where id = auth.uid() and role = 'admin'
--     )
--   );

-- ─── 5. Why the nested-join error occurred ───────────────────────────────────
-- The original query used:
--   .from('profiles').select('id, role, subscriptions:subscriptions(...)')
--
-- PostgREST auto-join requires an explicit FK from subscriptions.user_id → profiles.id
-- in the schema cache.  The FK actually points to auth.users.id, not profiles.id,
-- so the join always failed.
--
-- FIX applied in adminService.js:
--   Two separate queries (profiles, then subscriptions by user_id list)
--   merged client-side on the shared UUID.
--   No schema change required for this fix.
-- ============================================================================
