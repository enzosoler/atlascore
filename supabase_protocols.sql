-- ============================================================
-- Atlas Core — Protocols table + RLS
-- Run this once in Supabase → SQL Editor (or via supabase db push)
-- ============================================================

create table if not exists public.protocols (
  -- Primary key
  id             uuid          primary key default gen_random_uuid(),

  -- Owner — links to auth.users; cascade deletes when user is removed
  user_id        uuid          not null references auth.users(id) on delete cascade,

  -- Identity
  substance_name text          not null default '',
  name           text          not null default '',
  category       text          not null default 'supplement'
                               check (category in (
                                 'supplement','medication','hormone',
                                 'peptide','ancillary','other'
                               )),

  -- Dosing
  dose           text          not null default '',
  unit           text          not null default '',

  -- Schedule
  frequency      text          not null default '',
  schedule       text          not null default '',

  -- Timeline
  start_date     date          not null,
  end_date       date,                       -- null = not finished

  -- Status  (active=true → active | active=false + no end_date → paused | end_date set → finished)
  active         boolean       not null default true,

  -- Notes
  notes          text          not null default '',

  -- Timestamps
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists protocols_user_id_idx
  on public.protocols (user_id);

create index if not exists protocols_user_start_date_idx
  on public.protocols (user_id, start_date desc);

-- ── Row-Level Security ────────────────────────────────────────────────────────
alter table public.protocols enable row level security;

-- SELECT: users see only their own rows
create policy "protocols_select_own"
  on public.protocols
  for select
  using (auth.uid() = user_id);

-- INSERT: users can only create rows for themselves
create policy "protocols_insert_own"
  on public.protocols
  for insert
  with check (auth.uid() = user_id);

-- UPDATE: users can only update their own rows
create policy "protocols_update_own"
  on public.protocols
  for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: users can only delete their own rows
create policy "protocols_delete_own"
  on public.protocols
  for delete
  using (auth.uid() = user_id);

-- ── updated_at trigger ────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists protocols_set_updated_at on public.protocols;

create trigger protocols_set_updated_at
  before update on public.protocols
  for each row
  execute function public.set_updated_at();
