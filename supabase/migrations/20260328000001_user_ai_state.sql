-- ─── user_ai_state ───────────────────────────────────────────────────────────
--
-- One row per user. Updated incrementally by the ai-decision-engine on each
-- call — never fully rebuilt from scratch.
--
-- Purpose:
--   Layer 2 of the AI architecture: structured per-user memory that the engine
--   reads as context before calling the model. Avoids sending raw query results
--   to the LLM every time — instead, the engine maintains a compact state object.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.user_ai_state (
  user_id uuid primary key references auth.users on delete cascade,

  -- Compact plain-text profile summary injected into every prompt.
  -- E.g. "28yo male, 82kg, goal: muscle gain, training 4x/week, protein target 160g"
  -- Regenerated when profile_data changes (detected by hash), not on every call.
  profile_summary text,

  -- Rolling 7-day adherence scores (0.0–1.0).
  -- { "nutrition": 0.72, "workouts": 0.85, "measurements": 0.40 }
  -- Updated on every engine call via weighted average, not full recompute.
  adherence_patterns jsonb not null default '{"nutrition": 0, "workouts": 0, "measurements": 0}',

  -- Cumulative outcome counters across all recommendation history.
  -- { "followed": 12, "dismissed": 4, "ignored": 8 }
  -- Incremented (never reset) so the engine knows how responsive the user is.
  feedback_signals jsonb not null default '{"followed": 0, "dismissed": 0, "ignored": 0}',

  -- IDs of the last 5 recommendation types suggested to avoid repetition.
  -- E.g. ["nutrition", "workout", "nutrition", "habit", "recovery"]
  last_recommendation_ids jsonb not null default '[]',

  created_at    timestamptz not null default now(),
  last_updated_at timestamptz not null default now()
);

-- RLS: users read their own row (engine uses service role, bypasses RLS)
alter table public.user_ai_state enable row level security;

create policy "user_ai_state: user reads own row"
  on public.user_ai_state
  for select
  using (auth.uid() = user_id);

-- Comment: INSERT/UPDATE done by edge function via service role key (RLS bypassed)

comment on table public.user_ai_state is
  'Per-user AI coaching state. One row per user, updated incrementally by ai-decision-engine.';
comment on column public.user_ai_state.adherence_patterns is
  'Rolling 7-day adherence 0–1 per domain. Updated via weighted avg, not full recompute.';
comment on column public.user_ai_state.feedback_signals is
  'Cumulative rec outcomes. Used to calibrate how aggressively to suggest.';
comment on column public.user_ai_state.last_recommendation_ids is
  'Last 5 rec types suggested. Engine avoids immediate repetition.';
