import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Valid Atlas roles.
 * 'user' is mapped to 'athlete' for backward compatibility (legacy role name).
 */
const ATLAS_ROLES = new Set([
  'visitor',
  'athlete',
  'user',
  'coach',
  'nutritionist',
  'clinician',
  'admin',
]);

/** Canonical mapping — 'user' is treated as 'athlete' everywhere. */
const ROLE_ALIASES = {
  user: 'athlete',
};

function normalizeValue(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function normalizeAtlasRole(role, fallback = null) {
  const normalizedRole = normalizeValue(role);

  if (ATLAS_ROLES.has(normalizedRole)) {
    return ROLE_ALIASES[normalizedRole] || normalizedRole;
  }

  const normalizedFallback = normalizeValue(fallback);
  if (ATLAS_ROLES.has(normalizedFallback)) {
    return ROLE_ALIASES[normalizedFallback] || normalizedFallback;
  }

  return fallback === null ? null : 'athlete';
}

/**
 * Fetch the authoritative role from the `profiles` table.
 * The DB role is the single source of truth — metadata is only a fallback
 * when the profile row doesn't exist yet (e.g. brand-new sign-up).
 */
export async function fetchProfileRole(userId, fallbackRole = 'athlete') {
  if (!userId) {
    return normalizeAtlasRole(fallbackRole, 'athlete');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Failed to load profile role:', error.message);
    return normalizeAtlasRole(fallbackRole, 'athlete');
  }

  // If we got a profile row, its role is authoritative — do NOT fall back to metadata.
  if (data?.role != null) {
    return normalizeAtlasRole(data.role, 'athlete');
  }

  // No profile row yet — use metadata as temporary fallback.
  return normalizeAtlasRole(fallbackRole, 'athlete');
}

export function useRole(user) {
  const explicitRole = normalizeAtlasRole(user?.atlas_role ?? user?.role, null);
  const fallbackRole = user ? normalizeAtlasRole(user?.atlas_role ?? user?.role, 'athlete') : null;
  const [role, setRole] = useState(fallbackRole);
  const [loading, setLoading] = useState(Boolean(user?.id) && !explicitRole);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const nextExplicitRole = normalizeAtlasRole(user?.atlas_role ?? user?.role, null);
    const nextFallbackRole = normalizeAtlasRole(user?.atlas_role ?? user?.role, 'athlete');

    if (nextExplicitRole) {
      setRole(nextExplicitRole);
      setLoading(false);
      return;
    }

    setRole(nextFallbackRole);
    setLoading(true);
  }, [user?.id, user?.atlas_role, user?.role]);

  useEffect(() => {
    let cancelled = false;

    if (!user?.id) {
      return () => {
        cancelled = true;
      };
    }

    async function loadRole() {
      const nextRole = await fetchProfileRole(
        user.id,
        normalizeAtlasRole(user?.atlas_role ?? user?.role, 'athlete')
      );

      if (cancelled) {
        return;
      }

      setRole(nextRole);
      setLoading(false);
    }

    void loadRole();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return { role, loading };
}
