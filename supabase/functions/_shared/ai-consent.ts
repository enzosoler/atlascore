type ConsentRecord = {
  accepted_at?: string;
  provider?: string;
};

type ProfileConsentData = {
  ai_consents?: Record<string, ConsentRecord>;
};

export type AiConsentKind = 'food_vision' | 'lab_pdf';

export async function hasUserAiConsent(
  adminClient: {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{ data?: { profile_data?: ProfileConsentData } | null; error?: { code?: string; message?: string } | null }>;
        };
      };
    };
  },
  userId: string,
  kind: AiConsentKind,
): Promise<boolean> {
  const { data, error } = await adminClient
    .from('profiles')
    .select('profile_data')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[ai-consent] profile lookup failed', { code: error.code });
    return false;
  }

  const consent = data?.profile_data?.ai_consents?.[kind];
  return Boolean(consent?.accepted_at);
}
