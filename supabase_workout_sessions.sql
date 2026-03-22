-- ============================================================
-- Atlas Core — workout_sessions table
-- Run in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/<your-project>/sql/new
--
-- NOTE: The app currently stores workout sessions in the Base44
-- backend (base44.entities.Workout). This table is provided as
-- a future-proof Supabase fallback and for analytics queries.
-- It mirrors the structure produced by WorkoutExecutionScreen.
-- ============================================================

CREATE TABLE IF NOT EXISTS workout_sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session identity
  name                text NOT NULL DEFAULT 'Workout Session',
  date                date NOT NULL DEFAULT CURRENT_DATE,
  status              text NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  -- Link back to the plan that originated this session (nullable for free-form)
  plan_id             uuid REFERENCES workout_plans(id) ON DELETE SET NULL,
  plan_day_index      integer,

  -- The original exercise list (set at session start from plan or user selection)
  exercises           jsonb DEFAULT '[]'::jsonb,

  -- Execution results written on completion by WorkoutExecutionScreen
  -- Structure: [{ name, target_sets, target_reps, sets_completed: [{set_number,
  --   target_reps, target_weight, reps_actual, load_actual, rir}] }]
  exercises_completed jsonb DEFAULT '[]'::jsonb,

  -- Aggregated metrics (filled by WorkoutExecutionScreen on completion)
  volume_load         numeric(10, 1),        -- total kg moved (reps × weight)
  duration_minutes    integer,               -- wall-clock minutes

  -- Timestamps
  created_at          timestamptz NOT NULL DEFAULT now(),
  completed_at        timestamptz
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS workout_sessions_user_date
  ON workout_sessions (user_id, date DESC);

CREATE INDEX IF NOT EXISTS workout_sessions_user_status
  ON workout_sessions (user_id, status);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workout_sessions_select_own" ON workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_insert_own" ON workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_update_own" ON workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_delete_own" ON workout_sessions;

CREATE POLICY "workout_sessions_select_own"
  ON workout_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "workout_sessions_insert_own"
  ON workout_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_sessions_update_own"
  ON workout_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_sessions_delete_own"
  ON workout_sessions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ── Verification ──────────────────────────────────────────────────────────────

SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'workout_sessions'
ORDER BY policyname;
