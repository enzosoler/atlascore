-- ============================================================================
-- Security Helper Functions
-- ============================================================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has active access (active, granted, or trialing)
CREATE OR REPLACE FUNCTION public.has_active_access(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE subscriptions.user_id = user_id
    AND status IN ('active', 'granted', 'trialing')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's active subscription
CREATE OR REPLACE FUNCTION public.get_active_subscription(user_id UUID)
RETURNS TABLE (
  id UUID,
  tier TEXT,
  status TEXT,
  trial_ends_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    subscriptions.id,
    subscriptions.tier,
    subscriptions.status,
    subscriptions.trial_ends_at
  FROM public.subscriptions
  WHERE subscriptions.user_id = user_id
  AND status IN ('active', 'granted', 'trialing')
  ORDER BY subscriptions.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get trial days remaining
CREATE OR REPLACE FUNCTION public.get_trial_days_remaining(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  trial_end TIMESTAMP WITH TIME ZONE;
  days_remaining INTEGER;
BEGIN
  SELECT subscriptions.trial_ends_at INTO trial_end
  FROM public.subscriptions
  WHERE subscriptions.user_id = user_id
  AND status = 'trialing'
  LIMIT 1;

  IF trial_end IS NULL THEN
    RETURN 0;
  END IF;

  days_remaining := CEIL(EXTRACT(EPOCH FROM (trial_end - NOW())) / 86400);
  RETURN GREATEST(0, days_remaining);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DONE
-- ============================================================================
