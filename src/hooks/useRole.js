import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const ATLAS_ROLES = new Set([
  'visitor',
  'athlete',
  'coach',
  'nutritionist',
  'clinician',
  'admin',
]);

function normalizeValue(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function normalizeAtlasRole(role, fallback = null) {
  const normalizedRole = normalizeValue(role);
  if (ATLAS_ROLES.has(normalizedRole)) {
    return normalizedRole;
  }

  const normalizedFallback = normalizeValue(fallback);
  if (ATLAS_ROLES.has(normalizedFallback)) {
    return normalizedFallback;
  }

  return fallback === null ? null : 'athlete';
}

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

  return normalizeAtlasRole(data?.role, fallbackRole || 'athlete');
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
