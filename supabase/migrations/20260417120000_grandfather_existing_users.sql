-- Grandfather all users created before the paywall launch date.
-- These users get permanent free access (pro_entitlement.grandfathered = true).
-- The useEntitlement hook checks this flag and bypasses the paywall.

UPDATE profiles
SET profile_data = COALESCE(profile_data, '{}'::jsonb) || jsonb_build_object(
  'pro_entitlement', jsonb_build_object(
    'grandfathered', true,
    'tier', 'legacy_free',
    'granted_at', now()::text,
    'reason', 'Pre-paywall user grandfathered on 2026-04-17'
  )
)
WHERE created_at < '2026-04-17T00:00:00Z'
  AND (
    profile_data IS NULL
    OR profile_data->'pro_entitlement' IS NULL
    OR (profile_data->'pro_entitlement'->>'grandfathered')::boolean IS NOT TRUE
  );
