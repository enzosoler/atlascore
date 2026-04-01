-- ============================================================================
-- SECURITY FIX: Enable RLS on all public tables + drop exposed auth.users view
-- Triggered by Supabase security alert (30 Mar 2026)
-- ============================================================================

-- ─── 1. Drop the view that exposes auth.users data ──────────────────────────
DROP VIEW IF EXISTS user_admin_summary;

-- ─── 2. Recreate user_admin_summary using profiles (no auth.users access) ───
CREATE OR REPLACE VIEW user_admin_summary AS
SELECT
  p.id,
  p.email,
  p.full_name,
  p.created_at,
  p.updated_at,
  CASE
    WHEN p.is_suspended = true THEN 'suspended'
    ELSE 'active'
  END AS account_status,
  p.role,
  p.onboarding_completed
FROM profiles p;

-- ─── 3. Enable RLS on ALL public tables that are missing it ─────────────────
-- ALTER TABLE IF EXISTS safely skips tables that don't exist in production yet

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coach_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.food_nutrition_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lab_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.professional_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workout_nutrition_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.beta_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_spending_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_usage_quotas ENABLE ROW LEVEL SECURITY;

-- ─── 4. RLS Policies ────────────────────────────────────────────────────────
-- All policy creation is wrapped in table existence checks so this migration
-- works regardless of which tables have been created in production.

DO $$
DECLARE
  _tbl text;
BEGIN

  -- ── profiles ──────────────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_own') THEN
      CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own') THEN
      CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own') THEN
      CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_admin_all') THEN
      CREATE POLICY profiles_admin_all ON public.profiles FOR ALL USING (public.is_admin());
    END IF;
  END IF;

  -- ── subscriptions ─────────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'subscriptions_select_own') THEN
      CREATE POLICY subscriptions_select_own ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'subscriptions_admin_all') THEN
      CREATE POLICY subscriptions_admin_all ON public.subscriptions FOR ALL USING (public.is_admin());
    END IF;
  END IF;

  -- ── coach_messages ────────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coach_messages') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coach_messages' AND policyname = 'coach_messages_select_own') THEN
      CREATE POLICY coach_messages_select_own ON public.coach_messages FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coach_messages' AND policyname = 'coach_messages_insert_own') THEN
      CREATE POLICY coach_messages_insert_own ON public.coach_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coach_messages' AND policyname = 'coach_messages_admin_all') THEN
      CREATE POLICY coach_messages_admin_all ON public.coach_messages FOR ALL USING (public.is_admin());
    END IF;
  END IF;

  -- ── coach_memory ──────────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coach_memory') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coach_memory' AND policyname = 'coach_memory_select_own') THEN
      CREATE POLICY coach_memory_select_own ON public.coach_memory FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coach_memory' AND policyname = 'coach_memory_admin_all') THEN
      CREATE POLICY coach_memory_admin_all ON public.coach_memory FOR ALL USING (public.is_admin());
    END IF;
  END IF;

  -- ── lab_exams ─────────────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lab_exams') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lab_exams' AND policyname = 'lab_exams_select_own') THEN
      CREATE POLICY lab_exams_select_own ON public.lab_exams FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lab_exams' AND policyname = 'lab_exams_insert_own') THEN
      CREATE POLICY lab_exams_insert_own ON public.lab_exams FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lab_exams' AND policyname = 'lab_exams_update_own') THEN
      CREATE POLICY lab_exams_update_own ON public.lab_exams FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lab_exams' AND policyname = 'lab_exams_delete_own') THEN
      CREATE POLICY lab_exams_delete_own ON public.lab_exams FOR DELETE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lab_exams' AND policyname = 'lab_exams_admin_all') THEN
      CREATE POLICY lab_exams_admin_all ON public.lab_exams FOR ALL USING (public.is_admin());
    END IF;
  END IF;

  -- ── progress_photos ───────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'progress_photos') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'progress_photos_select_own') THEN
      CREATE POLICY progress_photos_select_own ON public.progress_photos FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'progress_photos_insert_own') THEN
      CREATE POLICY progress_photos_insert_own ON public.progress_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'progress_photos_update_own') THEN
      CREATE POLICY progress_photos_update_own ON public.progress_photos FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'progress_photos_delete_own') THEN
      CREATE POLICY progress_photos_delete_own ON public.progress_photos FOR DELETE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'progress_photos_admin_all') THEN
      CREATE POLICY progress_photos_admin_all ON public.progress_photos FOR ALL USING (public.is_admin());
    END IF;
  END IF;

  -- ── error_logs ────────────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'error_logs') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'error_logs' AND policyname = 'error_logs_insert_authenticated') THEN
      CREATE POLICY error_logs_insert_authenticated ON public.error_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'error_logs' AND policyname = 'error_logs_admin_all') THEN
      CREATE POLICY error_logs_admin_all ON public.error_logs FOR ALL USING (public.is_admin());
    END IF;
  END IF;

  -- ── support_requests ──────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'support_requests') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_requests' AND policyname = 'support_requests_insert_authenticated') THEN
      CREATE POLICY support_requests_insert_authenticated ON public.support_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_requests' AND policyname = 'support_requests_select_own') THEN
      CREATE POLICY support_requests_select_own ON public.support_requests FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_requests' AND policyname = 'support_requests_admin_all') THEN
      CREATE POLICY support_requests_admin_all ON public.support_requests FOR ALL USING (public.is_admin());
    END IF;
  END IF;

  -- ── professional_links ────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'professional_links') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professional_links' AND policyname = 'professional_links_select_own') THEN
      CREATE POLICY professional_links_select_own ON public.professional_links FOR SELECT USING (auth.uid() = professional_id OR auth.uid() = client_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professional_links' AND policyname = 'professional_links_insert_professional') THEN
      CREATE POLICY professional_links_insert_professional ON public.professional_links FOR INSERT WITH CHECK (auth.uid() = professional_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professional_links' AND policyname = 'professional_links_update_own') THEN
      CREATE POLICY professional_links_update_own ON public.professional_links FOR UPDATE USING (auth.uid() = professional_id OR auth.uid() = client_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'professional_links' AND policyname = 'professional_links_admin_all') THEN
      CREATE POLICY professional_links_admin_all ON public.professional_links FOR ALL USING (public.is_admin());
    END IF;
  END IF;

  -- ── beta_invites ──────────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'beta_invites') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beta_invites' AND policyname = 'beta_invites_admin_all') THEN
      CREATE POLICY beta_invites_admin_all ON public.beta_invites FOR ALL USING (public.is_admin());
    END IF;
  END IF;

  -- ── email_events ──────────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_events') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_events' AND policyname = 'email_events_select_own') THEN
      CREATE POLICY email_events_select_own ON public.email_events FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_events' AND policyname = 'email_events_admin_all') THEN
      CREATE POLICY email_events_admin_all ON public.email_events FOR ALL USING (public.is_admin());
    END IF;
  END IF;

  -- ── stripe_webhook_events (service_role + admin only) ─────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stripe_webhook_events') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stripe_webhook_events' AND policyname = 'stripe_webhook_events_service_only') THEN
      CREATE POLICY stripe_webhook_events_service_only ON public.stripe_webhook_events FOR ALL TO service_role USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stripe_webhook_events' AND policyname = 'stripe_webhook_events_admin_select') THEN
      CREATE POLICY stripe_webhook_events_admin_select ON public.stripe_webhook_events FOR SELECT USING (public.is_admin());
    END IF;
  END IF;

  -- ── food_nutrition_cache ──────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'food_nutrition_cache') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'food_nutrition_cache' AND policyname = 'food_cache_authenticated') THEN
      CREATE POLICY food_cache_authenticated ON public.food_nutrition_cache FOR ALL USING (auth.role() = 'authenticated');
    END IF;
  END IF;

  -- ── workout_nutrition_cache ───────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workout_nutrition_cache') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_nutrition_cache' AND policyname = 'workout_cache_authenticated') THEN
      CREATE POLICY workout_cache_authenticated ON public.workout_nutrition_cache FOR ALL USING (auth.role() = 'authenticated');
    END IF;
  END IF;

  -- ── ai_spending_config ────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_spending_config') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_spending_config' AND policyname = 'ai_spending_config_admin_all') THEN
      CREATE POLICY ai_spending_config_admin_all ON public.ai_spending_config FOR ALL USING (public.is_admin());
    END IF;
  END IF;

  -- ── ai_usage_log ──────────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_usage_log') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_usage_log' AND policyname = 'ai_usage_log_select_own') THEN
      CREATE POLICY ai_usage_log_select_own ON public.ai_usage_log FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_usage_log' AND policyname = 'ai_usage_log_admin_all') THEN
      CREATE POLICY ai_usage_log_admin_all ON public.ai_usage_log FOR ALL USING (public.is_admin());
    END IF;
  END IF;

  -- ── ai_usage_quotas ───────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_usage_quotas') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_usage_quotas' AND policyname = 'ai_usage_quotas_select_own') THEN
      CREATE POLICY ai_usage_quotas_select_own ON public.ai_usage_quotas FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_usage_quotas' AND policyname = 'ai_usage_quotas_admin_all') THEN
      CREATE POLICY ai_usage_quotas_admin_all ON public.ai_usage_quotas FOR ALL USING (public.is_admin());
    END IF;
  END IF;

END $$;

-- ─── 5. Drop and recreate professional_link_details if it exists ────────────
DROP VIEW IF EXISTS professional_link_details;

-- Only recreate if professional_links table exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'professional_links') THEN
    CREATE OR REPLACE VIEW professional_link_details AS
    SELECT
      pl.id,
      pl.professional_id,
      pl.client_id,
      pl.role AS link_role,
      pl.status,
      pl.created_at,
      pp.full_name AS professional_name,
      pp.email AS professional_email,
      cp.full_name AS client_name,
      cp.email AS client_email
    FROM professional_links pl
    LEFT JOIN profiles pp ON pp.id = pl.professional_id
    LEFT JOIN profiles cp ON cp.id = pl.client_id;
  END IF;
END $$;
