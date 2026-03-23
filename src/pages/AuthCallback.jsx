import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';
import PublicSiteShell from '@/components/public/PublicSiteShell';

/**
 * AuthCallback - Handles OAuth callback from Google/Supabase
 * Processes the auth code and redirects appropriately
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase handles the OAuth callback automatically via the hash params
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user) {
          setStatus('success');
          // Small delay to show success state before redirect
          setTimeout(() => {
            navigate(ROUTES.today, { replace: true });
          }, 1500);
        } else {
          // Check for hash-based tokens (PKCE flow)
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
              setTimeout(() => {
                navigate(ROUTES.today, { replace: true });
              }, 1500);
              return;
            }
          }
          
          throw new Error('No session found. Please try signing in again.');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Authentication failed. Please try again.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

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
                Completing sign in...
              </h1>
              <p className="text-sm text-[hsl(var(--fg-2))]">
                Please wait while we verify your credentials.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-xl font-semibold text-[hsl(var(--fg))]">
                Sign in successful!
              </h1>
              <p className="text-sm text-[hsl(var(--fg-2))]">
                Redirecting you to your dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-xl font-semibold text-[hsl(var(--fg))]">
                Sign in failed
              </h1>
              <p className="text-sm text-[hsl(var(--fg-2))]">
                {errorMessage}
              </p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center justify-center rounded-lg bg-[hsl(var(--brand))] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(var(--brand)/0.9)] transition-colors"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </PublicSiteShell>
  );
}
