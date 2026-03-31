import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES, ROLE_HOME } from '@/lib/routes';
import PublicSiteShell from '@/components/public/PublicSiteShell';
import { useI18n } from '@/lib/i18nContext';

async function resolvePostAuthRoute(userId) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed, role')
      .eq('id', userId)
      .maybeSingle();
    if (data?.onboarding_completed) {
      return ROLE_HOME[data.role] || ROUTES.today;
    }
  } catch {
    // On error, default to onboarding — safe fallback
  }
  return ROUTES.onboarding;
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [status, setStatus] = useState('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session?.user) {
          setStatus('success');
          const destination = await resolvePostAuthRoute(session.user.id);
          setTimeout(() => navigate(destination, { replace: true }), 1500);
        } else {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken) {
            const { data, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (setSessionError) throw setSessionError;

            if (data.session?.user) {
              setStatus('success');
              const destination = await resolvePostAuthRoute(data.session.user.id);
              setTimeout(() => navigate(destination, { replace: true }), 1500);
              return;
            }
          }

          throw new Error(t('auth.callback.noSession'));
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setErrorMessage(error.message || t('auth.callback.genericError'));
      }
    };

    handleAuthCallback();
  }, [navigate, t]);

  const handleRetry = () => {
    navigate(`${ROUTES.auth}?mode=login`, { replace: true });
  };

  return (
    <PublicSiteShell compactNav showFooter={false} actions={null}>
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          {status === 'processing' && (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.1)]">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--brand))]" />
              </div>
              <h1 className="text-xl font-semibold text-[hsl(var(--fg))]">
                {t('auth.callback.completing')}
              </h1>
              <p className="text-sm text-[hsl(var(--fg-2))]">
                {t('auth.callback.verifying')}
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--ok)/0.1)]">
                <CheckCircle2 className="h-8 w-8 text-[hsl(var(--ok))]" />
              </div>
              <h1 className="text-xl font-semibold text-[hsl(var(--fg))]">
                {t('auth.callback.success')}
              </h1>
              <p className="text-sm text-[hsl(var(--fg-2))]">
                {t('auth.callback.redirecting')}
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--err)/0.1)]">
                <AlertCircle className="h-8 w-8 text-[hsl(var(--err))]" />
              </div>
              <h1 className="text-xl font-semibold text-[hsl(var(--fg))]">
                {t('auth.callback.failed')}
              </h1>
              <p className="text-sm text-[hsl(var(--fg-2))]">
                {errorMessage}
              </p>
              <button
                onClick={handleRetry}
                className="atlas-button atlas-button-primary h-10 px-5 rounded-xl text-sm"
              >
                {t('auth.callback.backToSignIn')}
              </button>
            </div>
          )}
        </div>
      </div>
    </PublicSiteShell>
  );
}
