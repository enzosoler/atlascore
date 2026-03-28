import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';
import PublicSiteShell from '@/components/public/PublicSiteShell';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18nContext';

/**
 * UpdatePassword - Page for updating password after reset link
 * Handles the password reset flow from Supabase email link
 */
export default function UpdatePassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = useT();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'ready' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if we have a session (user clicked the reset link)
    const verifySession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          setStatus('ready');
        } else {
          // No session - maybe the link expired or is invalid
          setStatus('error');
          setErrorMessage(t('updatePassword.errorLinkExpired'));
        }
      } catch (error) {
        console.error('Session verification error:', error);
        setStatus('error');
        setErrorMessage(t('updatePassword.errorVerifySession'));
      }
    };

    verifySession();
  }, []);

  const validatePassword = () => {
    if (password.length < 6) {
      setErrorMessage(t('updatePassword.errorTooShort'));
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t('updatePassword.errorNoMatch'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    setStatus('submitting');
    setErrorMessage('');
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) throw error;
      
      setStatus('success');
      // Redirect after showing success message
      setTimeout(() => {
        navigate(`${ROUTES.auth}?mode=login`, { replace: true });
      }, 3000);
    } catch (error) {
      console.error('Password update error:', error);
      setStatus('ready');
      setErrorMessage(error.message || t('updatePassword.errorUpdateFailed'));
    }
  };

  const handleRequestNewLink = () => {
    navigate(`${ROUTES.auth}?mode=login`, { replace: true });
  };

  if (status === 'verifying') {
    return (
      <PublicSiteShell compactNav showFooter={false} actions={null}>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="w-full max-w-md text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.1)]">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--brand))]" />
            </div>
            <h1 className="text-xl font-semibold text-[hsl(var(--fg))]">
              {t('updatePassword.verifyingTitle')}
            </h1>
            <p className="text-sm text-[hsl(var(--fg-2))]">
              {t('updatePassword.verifyingDesc')}
            </p>
          </div>
        </div>
      </PublicSiteShell>
    );
  }

  if (status === 'error') {
    return (
      <PublicSiteShell compactNav showFooter={false} actions={null}>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="w-full max-w-md text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-[hsl(var(--fg))]">
              {t('updatePassword.linkExpiredTitle')}
            </h1>
            <p className="text-sm text-[hsl(var(--fg-2))]">
              {errorMessage}
            </p>
            <Button onClick={handleRequestNewLink} className="mt-4">
              {t('updatePassword.requestNewLink')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </PublicSiteShell>
    );
  }

  if (status === 'success') {
    return (
      <PublicSiteShell compactNav showFooter={false} actions={null}>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="w-full max-w-md text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold text-[hsl(var(--fg))]">
              {t('updatePassword.successTitle')}
            </h1>
            <p className="text-sm text-[hsl(var(--fg-2))]">
              {t('updatePassword.successDesc')}
            </p>
          </div>
        </div>
      </PublicSiteShell>
    );
  }

  return (
    <PublicSiteShell compactNav showFooter={false} actions={null}>
      <section className="mx-auto max-w-md px-5 py-10 lg:py-16">
        <div className="atlas-public-panel px-6 py-6 lg:px-7 lg:py-7">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-[1.7rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
              {t('updatePassword.title')}
            </h1>
            <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              {t('updatePassword.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[hsl(var(--fg))]"
              >
                {t('updatePassword.newPasswordLabel')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('updatePassword.newPasswordPlaceholder')}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 pr-10 text-[15px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:border-[hsl(var(--brand)/0.42)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand)/0.12)]"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[hsl(var(--fg))]"
              >
                {t('updatePassword.confirmPasswordLabel')}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('updatePassword.confirmPasswordPlaceholder')}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 pr-10 text-[15px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:border-[hsl(var(--brand)/0.42)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand)/0.12)]"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="atlas-banner px-4 py-3.5 text-[12px]" data-tone="error">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-[12px]"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('updatePassword.updating')}
                </>
              ) : (
                <>
                  {t('updatePassword.submitBtn')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </section>
    </PublicSiteShell>
  );
}
