-- Allow authenticated users to read ai_spending_config (needed by edge functions using user-scoped client)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_spending_config' AND policyname = 'Anyone can read ai_spending_config'
  ) THEN
    CREATE POLICY "Anyone can read ai_spending_config"
      ON public.ai_spending_config FOR SELECT
      USING (true);
  END IF;
END $$;
