-- ============================================================================
-- Atlas Core — Fix email_events RLS circular dependency
-- Use the SECURITY DEFINER is_admin() function instead of a subquery
-- that re-reads profiles, which can cause infinite recursion.
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all email events" ON public.email_events;

CREATE POLICY "Admins can view all email events"
ON public.email_events FOR SELECT
TO authenticated
USING (public.is_admin());
