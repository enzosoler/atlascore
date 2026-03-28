-- ─── ai_recommendations ──────────────────────────────────────────────────────
--
-- Two row types live in this table:
--
--   type = 'daily_context'
--     The cached full engine output for today (briefing + alerts + recs bundle).
--     One per user per day. Expires after 4 hours, triggering a fresh engine call.
--     recommendation column contains: { briefing, alerts, recommendations }
--
--   type = 'rec_outcome'
--     Written by the client when a user follows or dismisses an individual rec.
--     Engine reads these on next call to avoid repeating dismissed suggestions.
--     recommendation column contains: { id, type, title, ... }
--     status = 'followed' | 'dismissed' | 'ignored'
--
-- This design lets us:
--   1. Cache the expensive engine output (avoid calling LLM on every page load)
--   2. Track individual recommendation outcomes for the learning loop
--   3. Keep everything in one table with simple RLS
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.ai_recommendations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,

  -- 'daily_context' | 'rec_outcome'
  type        text not null,

  -- For daily_context: full engine output { briefing, alerts, recommendations }
  -- For rec_outcome:   individual rec { id, type, title, reason, confidence, ... }
  recommendation jsonb not null,

  -- Snapshot of user behavior that drove this output (kept for debugging/auditing).
  -- Not sent to the model — only used internally.
  context_snapshot jsonb,

  -- Lifecycle status
  -- daily_context rows: 'pending' (active) → 'expired' (TTL elapsed)
  -- rec_outcome rows:   'followed' | 'dismissed' | 'ignored'
  status text not null default 'pending'
    constraint ai_recommendations_status_check
    check (status in ('pending', 'followed', 'dismissed', 'ignored', 'expired')),

  -- Outcome recorded after the fact (e.g. did user actually log the meal?)
  outcome jsonb,

  -- Model/engine metadata
  confidence      numeric(4, 3) check (confidence between 0 and 1),
  engine_version  text not null default '1.0',

  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '4 hours'),
  acted_at    timestamptz
);

-- Index: fetch active daily_context for today
create index on public.ai_recommendations (user_id, type, expires_at desc);

-- Index: fetch recent rec outcomes (for learning loop)
create index on public.ai_recommendations (user_id, type, status, created_at desc);

-- RLS
alter table public.ai_recommendations enable row level security;

create policy "ai_recommendations: user reads own rows"
  on public.ai_recommendations
  for select
  using (auth.uid() = user_id);

-- Client writes rec_outcome rows (follow/dismiss actions from Today page)
create policy "ai_recommendations: user inserts rec_outcome"
  on public.ai_recommendations
  for insert
  with check (
    auth.uid() = user_id
    and type = 'rec_outcome'
    and status in ('followed', 'dismissed')
  );

-- Comment: daily_context rows inserted by edge function via service role (RLS bypassed)

comment on table public.ai_recommendations is
  'AI engine output cache (daily_context) + individual recommendation outcomes (rec_outcome).';
comment on column public.ai_recommendations.type is
  'daily_context = cached engine bundle. rec_outcome = user follow/dismiss event.';
comment on column public.ai_recommendations.expires_at is
  'daily_context rows expire after 4h, triggering fresh engine call on next Today load.';
comment on column public.ai_recommendations.context_snapshot is
  'Input data snapshot for debugging. Never sent to LLM after generation.';
