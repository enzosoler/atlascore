/**
 * emailService.js — Atlas Core Email Trigger System
 *
 * Client-side interface for all transactional email types.
 * The Resend API key lives only in Supabase secrets — it never reaches the browser.
 *
 * Architecture:
 *   Frontend → supabase.functions.invoke('send-email') → Resend → User inbox
 *   Frontend → supabase.functions.invoke('send-password-reset') → Resend → User inbox
 *
 * All helpers are fire-and-forget (never throw, never block UI flows).
 * Email output is always English.
 *
 * Usage:
 *   import { email } from '@/lib/emailService';
 *   email.welcome({ email, firstName });
 *   email.passwordReset({ email });
 *   email.paymentSuccess({ email, firstName, planName, amount });
 *   email.milestone({ email, firstName, milestoneKey: 'first_workout' });
 */

import { supabase } from '@/lib/supabaseClient';
import { detectPreferredLocale } from '@/i18n/runtime';

const APP_URL = import.meta.env.VITE_APP_URL || 'https://atlascore.app';

// ─── Language Helper ────────────────────────────────────────────────────────

/**
 * Normalize any locale input to the single language the email system accepts.
 */
function normaliseLang(lang) {
  return 'en';
}

function detectBrowserLang() {
  return detectPreferredLocale?.() || navigator.language || 'en';
}

// ─── Core Dispatcher ────────────────────────────────────────────────────────

/**
 * Invoke the send-email edge function.
 * Always fire-and-forget — never throws, never blocks the caller.
 *
 * @param {object} opts
 * @param {string} opts.type       - Email type (see EmailType in send-email/index.ts)
 * @param {string} opts.to         - Recipient email address
 * @param {string} [opts.language] - Ignored; email output is always English
 * @param {string} [opts.userId]   - Supabase user ID (for audit log)
 * @param {object} [opts.payload]  - Type-specific payload
 */
function dispatch({ type, to, language, userId, payload = {} }) {
  if (!to) {
    console.warn(`[emailService] dispatch(${type}): recipient email is required`);
    return;
  }

  const lang = normaliseLang(language);

  supabase.functions
    .invoke('send-email', {
      body: { type, to, language: lang, userId, payload: { ...payload, appUrl: APP_URL } },
    })
    .then(({ data, error }) => {
      if (error) {
        console.warn(`[emailService] ${type} → ${to}: ${error.message}`);
      } else {
        console.log(`[emailService] ✓ ${type} → ${to} (id: ${data?.id})`);
      }
    })
    .catch((err) => {
      console.warn(`[emailService] ${type} → ${to}: network error`, err?.message || err);
    });
}

// ─── Password Reset (separate edge function) ─────────────────────────────────

/**
 * Trigger a branded password reset email.
 * Calls send-password-reset which generates the Supabase link and sends via Resend.
 * Returns a promise that resolves when the request is sent (not when email arrives).
 *
 * @param {object} params
 * @param {string} params.email    - User email address
 * @param {string} [params.language] - Ignored; email output is always English
 * @returns {Promise<void>}
 */
async function sendPasswordReset({ email, language } = {}) {
  if (!email) {
    console.warn('[emailService] sendPasswordReset: email is required');
    return;
  }

  const lang = normaliseLang(language);

  try {
    const { error } = await supabase.functions.invoke('send-password-reset', {
      body: { email, language: lang },
    });
    if (error) throw error;
  } catch (edgeFnError) {
    // Edge Function unreachable (cold start, deploy lag, network) — fall back to
    // Supabase's built-in password reset which always works.
    console.warn('[emailService] Edge Function failed, falling back to native reset:', edgeFnError.message);
    const { error: nativeError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${APP_URL}/auth/reset`,
    });
    if (nativeError) {
      console.warn('[emailService] sendPasswordReset native fallback error:', nativeError.message);
      throw nativeError;
    }
  }
}

// ─── Milestone Helper ────────────────────────────────────────────────────────

/**
 * Valid milestone keys for the milestone email type.
 */
export const MILESTONE_KEYS = /** @type {const} */ ({
  FIRST_WORKOUT: 'first_workout',
  WORKOUTS_5:    'workouts_5',
  WORKOUTS_10:   'workouts_10',
  STREAK_7:      'streak_7',
  STREAK_14:     'streak_14',
  STREAK_30:     'streak_30',
});

// ─── Named Triggers ─────────────────────────────────────────────────────────
//
// Use these in your app code:
//   import { email } from '@/lib/emailService';
//   email.welcome({ email: user.email, firstName: 'Alex', language: 'en' });
//

export const email = {

  /**
 * Welcome email — sent after signup.
 * Usually triggered from AuthContext.signUp() or the canonical auth-webhook path.
   */
  welcome({ email: to, firstName, language, userId } = {}) {
    dispatch({ type: 'welcome', to, language, userId, payload: { firstName } });
  },

  /**
   * Email confirmation — send the branded link to confirm signup.
   * Requires confirmUrl (generated by supabase.auth.admin.generateLink on backend).
   */
  confirmEmail({ email: to, firstName, confirmUrl, language, userId } = {}) {
    dispatch({ type: 'confirm_email', to, language, userId, payload: { firstName, confirmUrl } });
  },

  /**
   * Password reset — triggers the backend to generate + send the reset link.
   * Returns a promise (unlike all other helpers which are fire-and-forget).
   */
  passwordReset({ email: to, language } = {}) {
    return sendPasswordReset({ email: to, language });
  },

  /**
   * Trial started — sent when the 7-day trial begins (usually on signup).
   */
  trialStarted({ email: to, firstName, trialDaysLeft = 7, language, userId } = {}) {
    dispatch({ type: 'trial_started', to, language, userId, payload: { firstName, trialDaysLeft } });
  },

  /**
   * Trial ending — sent ~48h before the trial expires (automated via send-scheduled-emails).
   */
  trialEnding({ email: to, firstName, trialDaysLeft = 2, trialEndsAt, language, userId } = {}) {
    dispatch({ type: 'trial_ending', to, language, userId, payload: { firstName, trialDaysLeft, trialEndsAt } });
  },

  /**
   * Trial expired — sent when trial period ends without upgrade.
   */
  trialExpired({ email: to, firstName, language, userId } = {}) {
    dispatch({ type: 'trial_expired', to, language, userId, payload: { firstName } });
  },

  /**
   * Payment success — sent after a successful charge.
   * @param {object} params
   * @param {string} [params.planName]   - e.g. 'Pro'
   * @param {string} [params.amount]     - e.g. '$19.99'
   * @param {string} [params.invoiceUrl] - Link to invoice PDF
   */
  paymentSuccess({ email: to, firstName, planName, amount, invoiceUrl, language, userId } = {}) {
    dispatch({ type: 'payment_success', to, language, userId, payload: { firstName, planName, amount, invoiceUrl } });
  },

  /**
   * Payment failed — sent when a charge fails.
   */
  paymentFailed({ email: to, firstName, language, userId } = {}) {
    dispatch({ type: 'payment_failed', to, language, userId, payload: { firstName } });
  },

  /**
   * Inactivity nudge — sent after 3–5 days of no app activity.
   * Automated via send-scheduled-emails; can also be manually triggered.
   */
  inactivityNudge({ email: to, firstName, lastActivityDays = 4, language, userId } = {}) {
    dispatch({ type: 'inactivity_nudge', to, language, userId, payload: { firstName, lastActivityDays } });
  },

  /**
   * Weekly progress report — sent every Monday.
   * @param {object} params
   * @param {number} [params.weekWorkouts]      - Workouts logged in the past 7 days
   * @param {number} [params.weekNutritionDays] - Days with nutrition logged
   * @param {number} [params.weightChange]      - Weight delta in kg (positive or negative)
   * @param {number} [params.currentStreak]     - Current activity streak in days
   */
  weeklyReport({ email: to, firstName, weekWorkouts, weekNutritionDays, weightChange, currentStreak, language, userId } = {}) {
    dispatch({
      type: 'weekly_report',
      to,
      language,
      userId,
      payload: { firstName, weekWorkouts, weekNutritionDays, weightChange, currentStreak },
    });
  },

  /**
   * Milestone email — sent when a user achieves a notable fitness milestone.
   * @param {object} params
   * @param {keyof MILESTONE_KEYS} params.milestoneKey - Use MILESTONE_KEYS constants
   */
  milestone({ email: to, firstName, milestoneKey, language, userId } = {}) {
    dispatch({ type: 'milestone', to, language, userId, payload: { firstName, milestoneKey } });
  },
};

// ─── Event Trigger System ────────────────────────────────────────────────────
//
// Call these from your app events so email triggers stay consistent across
// multiple call sites (auth, billing, workout completion, etc.)
//

export const emailEvents = {

  /**
   * Fired once after a user successfully signs up.
   * The auth-webhook path handles this automatically on the backend.
   * Call this from AuthContext.signUp() as a belt-and-suspenders fallback.
   */
  onSignup({ user }) {
    if (!user?.email) return;
    // The backend webhook handles welcome + confirm + trial_started.
    // This is a no-op if the webhook is configured — safe to call regardless.
    console.log('[emailEvents] onSignup: backend webhook handles email sending');
  },

  /**
   * Fired after a user completes their first workout.
   */
  onFirstWorkout({ user }) {
    if (!user?.email) return;
    email.milestone({
      email: user.email,
      firstName: user.full_name?.split(' ')[0],
      milestoneKey: MILESTONE_KEYS.FIRST_WORKOUT,
      language: normaliseLang(user.language || user.user_metadata?.language),
      userId: user.id,
    });
  },

  /**
   * Fired when a user reaches a workout count milestone (5, 10, etc).
   */
  onWorkoutCountMilestone({ user, totalWorkouts }) {
    if (!user?.email) return;

    const keyMap = {
      5: MILESTONE_KEYS.WORKOUTS_5,
      10: MILESTONE_KEYS.WORKOUTS_10,
    };

    const milestoneKey = keyMap[totalWorkouts];
    if (!milestoneKey) return;

    email.milestone({
      email: user.email,
      firstName: user.full_name?.split(' ')[0],
      milestoneKey,
      language: normaliseLang(user.language || user.user_metadata?.language),
      userId: user.id,
    });
  },

  /**
   * Fired when a user reaches a consecutive-day streak milestone.
   */
  onStreakMilestone({ user, streakDays }) {
    if (!user?.email) return;

    const keyMap = {
      7: MILESTONE_KEYS.STREAK_7,
      14: MILESTONE_KEYS.STREAK_14,
      30: MILESTONE_KEYS.STREAK_30,
    };

    const milestoneKey = keyMap[streakDays];
    if (!milestoneKey) return;

    email.milestone({
      email: user.email,
      firstName: user.full_name?.split(' ')[0],
      milestoneKey,
      language: normaliseLang(user.language || user.user_metadata?.language),
      userId: user.id,
    });
  },

  /**
   * Fired after Stripe confirms a payment (webhook → edge function → this).
   */
  onPaymentSuccess({ user, planName, amount, invoiceUrl }) {
    if (!user?.email) return;
    email.paymentSuccess({
      email: user.email,
      firstName: user.full_name?.split(' ')[0],
      planName,
      amount,
      invoiceUrl,
      language: normaliseLang(user.language || user.user_metadata?.language),
      userId: user.id,
    });
  },

  /**
   * Fired when Stripe reports a failed payment.
   */
  onPaymentFailed({ user }) {
    if (!user?.email) return;
    email.paymentFailed({
      email: user.email,
      firstName: user.full_name?.split(' ')[0],
      language: normaliseLang(user.language || user.user_metadata?.language),
      userId: user.id,
    });
  },
};

// ─── Legacy Compat ───────────────────────────────────────────────────────────
// Preserves compatibility with any existing callers of sendWelcomeEmailAsync

/**
 * @deprecated Use email.welcome() instead.
 */
export function sendWelcomeEmailAsync({ email: to, firstName, language } = {}) {
  console.warn('[emailService] sendWelcomeEmailAsync is deprecated — use email.welcome() instead');
  email.welcome({ email: to, firstName, language });
}
