/**
 * useReferralTracking
 *
 * Captures referral attribution data from URL query parameters when a new user
 * lands on the app via a shared Instagram Story card link.
 *
 * Expected URL pattern:
 *   https://useatlascore.com/?ref=story&card=nutrition
 *
 * The hook:
 *   1. Reads `ref` and `card` from the URL on mount
 *   2. Persists them in sessionStorage so they survive the auth redirect
 *   3. After authentication, writes the attribution to user_metadata via Supabase
 *
 * This data feeds into the "hear_about_us" remarketing pipeline already set up
 * in the Onboarding flow and can be used for cohort analysis.
 */

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const STORAGE_KEY = 'atlas_referral';

/**
 * Capture referral params from the current URL and persist to sessionStorage.
 * Call this early (e.g., in Landing or App root) so the data survives redirects.
 */
export function captureReferralParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const card = params.get('card');

    if (ref) {
      const data = {
        ref,
        card: card || null,
        landed_at: new Date().toISOString(),
        landing_url: window.location.href,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    // sessionStorage may be unavailable in some contexts
  }
}

/**
 * Retrieve stored referral data (returns null if none).
 */
export function getStoredReferral() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear stored referral data after it has been persisted to the backend.
 */
export function clearStoredReferral() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

/**
 * Hook: call in an authenticated context to flush referral data to user_metadata.
 * This writes once and clears the sessionStorage entry.
 */
export function useReferralTracking(user) {
  useEffect(() => {
    if (!user?.id) return;

    const referral = getStoredReferral();
    if (!referral) return;

    // Write attribution to user metadata (non-blocking)
    supabase.auth
      .updateUser({
        data: {
          referral_source: referral.ref,
          referral_card: referral.card,
          referral_landed_at: referral.landed_at,
          // Also set hear_about_us if not already set (feeds existing remarketing)
          hear_about_us: referral.ref === 'story' ? 'instagram' : referral.ref,
        },
      })
      .then(() => {
        clearStoredReferral();
      })
      .catch((err) => {
        console.warn('Failed to persist referral data:', err);
      });
  }, [user?.id]);
}

export default useReferralTracking;
