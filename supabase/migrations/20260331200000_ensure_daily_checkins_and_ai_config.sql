-- ============================================================================
-- Ensure daily_checkins table exists + seed ai_spending_config row
-- (Fixes 404 on daily_checkins and 503 on ai-decision-engine)
-- ============================================================================

-- ─── daily_checkins ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        date NOT NULL,
  mood        integer CHECK (mood BETWEEN 1 AND 5),
  energy      integer CHECK (energy BETWEEN 1 AND 5),
  sleep_hours numeric(4,1),
  hydration_liters numeric(4,2),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'daily_checkins' AND policyname = 'Users manage own checkins'
  ) THEN
    CREATE POLICY "Users manage own checkins"
      ON public.daily_checkins FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date
  ON public.daily_checkins(user_id, date DESC);

-- ─── progress_photos ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url  text NOT NULL,
  date       date NOT NULL DEFAULT CURRENT_DATE,
  category   text DEFAULT 'front',
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'Users manage own photos'
  ) THEN
    CREATE POLICY "Users manage own photos"
      ON public.progress_photos FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date
  ON public.progress_photos(user_id, date DESC);

-- ─── ai_spending_config: ensure row with id=1 exists ────────────────────────
INSERT INTO public.ai_spending_config (id, kill_switch, monthly_cap_usd, daily_cap_usd, free_chat_calls_per_day, pro_chat_calls_per_day, premium_chat_calls_per_day)
VALUES (1, false, 100.00, 15.00, 5, 50, 200)
ON CONFLICT (id) DO NOTHING;
