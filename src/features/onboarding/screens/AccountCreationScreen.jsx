import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useOnboarding } from '../OnboardingContext';
import { useAuth } from '@/lib/AuthContext';
import { signInWithGoogle } from '@/lib/googleSignIn';
import { supabase } from '@/lib/supabaseClient';
import { saveLocalProfile } from '@/lib/profileUtils';
import { trackOnboardingCompleted } from '@/lib/analytics';
import { trackProductEvent } from '@/lib/productEvents';
import { ROUTES, ROLE_HOME } from '@/lib/routes';

/**
 * AccountCreationScreen — the real auth + data persistence screen.
 *
 * After the user creates an account (email, Google, or Apple),
 * we flush all quiz answers to Supabase and navigate to /Today.
 */
export default function AccountCreationScreen() {
  const { answers, getProfilePayload, clearDraft } = useOnboarding();
  const { signUp, revalidateSession } = useAuth();
  const navigate = useNavigate();

  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Persist quiz data after account creation ──────────────────────────────
  const persistAndFinish = useCallback(async (userId) => {
    try {
      // 1. Mark onboarding complete
      await supabase.from('profiles').upsert({
        id: userId,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      // 2. Save profile data (all quiz answers + computed targets)
      const payload = getProfilePayload();
      await saveLocalProfile({ id: userId }, null, payload);

      // 3. Insert first measurement
      const weight = Number(answers.current_weight);
      if (weight > 0) {
        const today = new Date().toISOString().split('T')[0];
        await supabase.from('measurements').insert({
          user_id: userId,
          date: today,
          weight,
        }).then(() => {});
      }

      // 4. Store remarketing
      if (answers.hear_about_us) {
        await supabase.auth.updateUser({ data: { hear_about_us: answers.hear_about_us } });
      }

      // 5. Analytics
      trackOnboardingCompleted({ goals: answers.health_goals, version: 2 });
      trackProductEvent(userId, 'onboarding_completed', {
        goals: answers.health_goals,
        biggest_blocker: answers.biggest_blocker,
        version: 2,
      });

      // 6. Clear draft + set guard
      clearDraft();
      localStorage.setItem(`onboarding_done_${userId}`, 'true');

      // 7. Revalidate and navigate
      await revalidateSession?.();
      navigate(ROUTES.today, { replace: true });
    } catch (err) {
      console.error('[AccountCreation] persist failed:', err);
      setError('Account created but setup failed. Please try logging in.');
      setLoading(false);
    }
  }, [answers, getProfilePayload, clearDraft, navigate, revalidateSession]);

  // ── Email signup ──────────────────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signUp(email, password, { full_name: '' });
      if (result?.needsEmailConfirmation) {
        setError('Check your email to confirm your account, then come back.');
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await persistAndFinish(user.id);
    } catch (err) {
      setError(err?.message || 'Signup failed. Try a different email.');
      setLoading(false);
    }
  };

  // ── Google signup ─────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      // Google OAuth will redirect away; quiz state is in localStorage draft.
      // On return, AuthCallback → revalidateSession → RequireAuthenticatedApp
      // will see onboarding_completed=false and redirect to /onboarding.
      // OnboardingContext restores from draft and detects auth → persists.
      await signInWithGoogle();
    } catch (err) {
      setError(err?.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  // ── Apple signup (same OAuth pattern as Google) ───────────────────────────
  const handleApple = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthErr) throw oauthErr;
    } catch (err) {
      setError(err?.message || 'Apple sign-in failed.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <motion.div
        className="flex w-full max-w-[340px] flex-col items-center"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className="mb-2 text-center text-[26px] font-bold leading-[1.15] tracking-[-0.03em] text-[hsl(var(--fg))]">
          Save your plan.
        </h1>
        <p className="mb-8 text-center text-[15px] leading-relaxed text-[hsl(var(--fg-2))]">
          So you don't lose it if you switch phones.
        </p>

        {error && (
          <div className="mb-4 w-full rounded-[12px] border border-[hsl(var(--err)/0.3)] bg-[hsl(var(--err)/0.06)] px-4 py-3 text-[13px] text-[hsl(var(--err))]">
            {error}
          </div>
        )}

        <div className="flex w-full flex-col gap-3">
          {/* Apple */}
          <button
            type="button"
            onClick={handleApple}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.6)] py-3.5 text-[15px] font-semibold text-[hsl(var(--fg))] transition-opacity active:opacity-80 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.17 4.36 9.86 8.7 9.6c1.26.06 2.14.7 2.88.74.99-.2 1.94-.77 3-.66 1.28.14 2.24.67 2.87 1.63-2.63 1.57-2 5 .88 5.96-.68 1.7-1.56 3.38-3.28 5.01zM12.57 9.5C12.4 7.73 13.84 6.26 15.5 6.1c.24 2-1.83 3.5-2.93 3.4z" />
              </svg>
            )}
            Continue with Apple
          </button>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.6)] py-3.5 text-[15px] font-semibold text-[hsl(var(--fg))] transition-opacity active:opacity-80 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Email */}
          {!showEmail ? (
            <button
              type="button"
              onClick={() => setShowEmail(true)}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.6)] py-3.5 text-[15px] font-semibold text-[hsl(var(--fg))] transition-opacity active:opacity-80 disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 6L2 7" />
              </svg>
              Use email
            </button>
          ) : (
            <motion.form
              onSubmit={handleEmailSubmit}
              className="flex w-full flex-col gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                autoComplete="email"
                className="w-full rounded-[12px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.6)] px-4 py-3 text-[15px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] outline-none transition-colors focus:border-[hsl(var(--brand))]"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (6+ characters)"
                required
                autoComplete="new-password"
                minLength={6}
                className="w-full rounded-[12px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.6)] px-4 py-3 text-[15px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] outline-none transition-colors focus:border-[hsl(var(--brand))]"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create account
              </button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
