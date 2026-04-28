import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AI_CONSENT_PREFIX = 'atlas.ai_consent';

/**
 * Shared hook for AI feature consent gate.
 *
 * Checks localStorage for a user-scoped key and mirrors consent into
 * profiles.profile_data.ai_consents so edge functions can enforce it.
 * - `consented` — true once the user has granted consent (persists across sessions)
 * - `grant`     — call to record consent and allow through
 *
 * Used by V3CoachChat, V3Capture (food-vision), and V3LabUpload (lab-parse).
 */
export function useAIConsent({ userId = null, kind = 'general', provider = 'third-party AI provider' } = {}) {
  const storageKey = useMemo(
    () => `${AI_CONSENT_PREFIX}.${kind}.${userId || 'anonymous'}`,
    [kind, userId],
  );

  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    let cancelled = false;

    async function loadConsent() {
      try {
        const localValue = localStorage.getItem(storageKey) === '1';
        if (!cancelled && localValue) setConsented(true);

        if (!userId) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('profile_data')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.warn('[useAIConsent] consent lookup failed', error.message);
          return;
        }

        const accepted = Boolean(data?.profile_data?.ai_consents?.[kind]?.accepted_at);
        if (!cancelled && accepted) {
          localStorage.setItem(storageKey, '1');
          setConsented(true);
        }
      } catch {
        // Keep the default blocked state when storage or profile reads fail.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(Boolean(userId));
    loadConsent();
    return () => { cancelled = true; };
  }, [kind, storageKey, userId]);

  const grant = useCallback(async () => {
    const acceptedAt = new Date().toISOString();
    try { localStorage.setItem(storageKey, '1'); } catch { /* noop */ }
    setConsented(true);

    if (!userId) return;

    const { data, error: readError } = await supabase
      .from('profiles')
      .select('profile_data')
      .eq('id', userId)
      .maybeSingle();

    if (readError) {
      setConsented(false);
      throw readError;
    }

    const profileData = data?.profile_data && typeof data.profile_data === 'object'
      ? data.profile_data
      : {};
    const nextProfileData = {
      ...profileData,
      ai_consents: {
        ...(profileData.ai_consents || {}),
        [kind]: {
          accepted_at: acceptedAt,
          provider,
          version: '2026-04-28',
        },
      },
    };

    const { error: writeError } = await supabase
      .from('profiles')
      .update({ profile_data: nextProfileData })
      .eq('id', userId);

    if (writeError) {
      setConsented(false);
      try { localStorage.removeItem(storageKey); } catch { /* noop */ }
      throw writeError;
    }
  }, [kind, provider, storageKey, userId]);

  return { consented, grant, loading };
}
