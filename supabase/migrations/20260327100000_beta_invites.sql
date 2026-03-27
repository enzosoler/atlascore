-- ============================================================================
-- Atlas Core — Beta invite system
-- ============================================================================

-- 1. Create beta_invites table
CREATE TABLE IF NOT EXISTS public.beta_invites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL,
  token        TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role         TEXT NOT NULL DEFAULT 'beta_tester',
  tier         TEXT NOT NULL DEFAULT 'internal',
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  notes        TEXT,
  redeemed_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at  TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_invites_email   ON public.beta_invites(email);
CREATE INDEX IF NOT EXISTS idx_beta_invites_token   ON public.beta_invites(token);
CREATE INDEX IF NOT EXISTS idx_beta_invites_status  ON public.beta_invites(status);

ALTER TABLE public.beta_invites ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage beta invites"
ON public.beta_invites FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Service role full access (for edge functions)
CREATE POLICY "Service role can manage beta invites"
ON public.beta_invites FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

GRANT ALL ON public.beta_invites TO service_role;
GRANT SELECT ON public.beta_invites TO authenticated;

-- 2. Add beta_tester to valid roles in profiles
-- (drop and recreate the check constraint to include the new role)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'user', 'athlete', 'admin', 'coach', 'nutritionist',
    'clinician', 'doctor', 'beta_tester'
  ));

COMMENT ON TABLE public.beta_invites IS 'Invitations sent to external users for beta testing access';
COMMENT ON COLUMN public.beta_invites.token IS 'Secure random hex token embedded in the invite URL';
COMMENT ON COLUMN public.beta_invites.role IS 'Profile role assigned on redemption (default: beta_tester)';
COMMENT ON COLUMN public.beta_invites.tier IS 'Subscription tier granted on redemption (default: internal)';
