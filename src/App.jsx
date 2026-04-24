/**
 * Atlas Core — App.jsx (v2 clean slate)
 *
 * This file replaces the 713-line legacy App.jsx. The old one is preserved at
 * `src/App.legacy.jsx.bak` for rollback. Legacy page code (src/pages/*, the v1
 * redesign in src/redesign/screens/) is NOT yet deleted — it simply isn't
 * imported here anymore, so no "Alex Johnson" or mock data can leak into any
 * active route.
 *
 * Principles:
 *  - Providers identical to legacy (auth, theme, i18n, subscription, query, etc.)
 *  - Every active route points to a v2 screen OR to <ComingSoon /> — never to
 *    the old page components.
 *  - Auth flow: Welcome → Auth (sign in/up) → Onboarding flow → /app/today
 *  - Safe-area-aware throughout. No screen collides with iOS chrome.
 */

import React, { lazy, Suspense, useEffect, useState, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { toast } from 'sonner';

/**
 * todoToast — polite "coming soon" notification for wiring placeholders.
 * Used anywhere a route handler doesn't yet have a real service backing it.
 * Replaces browser `alert()` so the UI doesn't show ugly native dialogs.
 */
function todoToast(feature, t) {
  toast(`${feature} · ${t('appShell.comingSoon.status')}`, {
    description: t('common.comingSoonDescription'),
  });
}
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { DailyStoreProvider } from '@/store/dailyStore';
import { ThemeProvider, useTheme } from '@/lib/ThemeContext';
import { SubscriptionProvider } from '@/lib/SubscriptionContext';
import { I18nProvider, useT } from '@/lib/i18nContext';
import { GoogleReCaptchaProvider } from '@/lib/ReCaptchaContext';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabaseClient';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import ErrorBoundary from '@/components/ErrorBoundary';
import { trackPageView, initAnalytics } from '@/lib/analytics';
import { LEGACY_ROUTE_REDIRECTS } from '@/lib/routes';
import {
  connectProvider as integConnect,
  disconnectProvider as integDisconnect,
  refreshProvider as integRefresh,
  toastConnectResult as integToast,
} from '@/lib/integrationsService';
import { createMeasurement } from '@/services/bodyProgressService';
import { finalizeOnboarding } from '@/services/onboardingService';

// v3 screens and routes only — v2 design imports removed to ensure v3-first build.
// Onboarding v3 wrappers are imported from V3OnboardingRoutes (used below).
import {
  V3OnboardingIdentity,
  V3OnboardingGoal,
  V3OnboardingActivity,
  V3OnboardingPlan,
  V3OnboardingPermissions,
  V3OnboardingWorkout,
  V3OnboardingHabits,
  V3OnboardingConstraints,
  V3OnboardingSummary,
  V3OnboardingTour,
} from '@/redesign/v3/routes/V3OnboardingRoutes.jsx';
const V3RoutinePresets = lazy(() => import('@/redesign/v3/routes/V3RoutinePresets.jsx'));
const V3RoutinePresetDetail = lazy(() => import('@/redesign/v3/routes/V3RoutinePresetDetail.jsx'));
import {
  saveWorkoutSession,
  listWorkoutSessions,
  listRecentSessions,
  listSetsForExercise,
  getSetsForExercise,
  getPersonalBestForExercise,
  getPersonalBest,
  cloneRoutineFromPreset,
  listRoutines,
} from '@/lib/workoutsService';
// v3 design preview — paper+ink+amber screens translated from Claude Design.
// Lazy so the 35-screen gallery only loads when /v3 is visited.
const V3Gallery  = lazy(() => import('@/redesign/v3/gallery/V3Gallery.jsx'));
// v3 running app — bottom-tab shell + core-loop routes (today/train/eat/body/you)
const V3AppShell = lazy(() => import('@/redesign/v3/layouts/V3AppShell.jsx'));
// Platform gate — eagerly loaded so Category B fullscreen flows can be wrapped
// without adding suspense boundaries. Keeps public web as conversion/billing only.
import { PlatformGate } from '@/redesign/v3/lib/PlatformGate.jsx';
const V3Today    = lazy(() => import('@/redesign/v3/routes/V3Today.jsx'));
const V3Train    = lazy(() => import('@/redesign/v3/routes/V3Train.jsx'));
const V3Eat      = lazy(() => import('@/redesign/v3/routes/V3Eat.jsx'));
const V3Body     = lazy(() => import('@/redesign/v3/routes/V3Body.jsx'));
const V3You      = lazy(() => import('@/redesign/v3/routes/V3You.jsx'));
const V3Settings = lazy(() => import('@/redesign/v3/routes/V3Settings.jsx'));
const V3RoutineDetail = lazy(() => import('@/redesign/v3/routes/V3RoutineDetail.jsx'));
const V3CoachHome = lazy(() => import('@/redesign/v3/routes/V3CoachHome.jsx'));
const V3CoachChat = lazy(() => import('@/redesign/v3/routes/V3CoachChat.jsx'));
const V3ExerciseLibrary = lazy(() => import('@/redesign/v3/routes/V3ExerciseLibrary.jsx'));
const V3ExerciseDetail = lazy(() => import('@/redesign/v3/routes/V3ExerciseDetail.jsx'));
const V3Labs = lazy(() => import('@/redesign/v3/routes/V3Labs.jsx'));
const V3NutritionSearch = lazy(() => import('@/redesign/v3/routes/V3NutritionSearch.jsx'));
const V3Notifications = lazy(() => import('@/redesign/v3/routes/V3Notifications.jsx'));
const V3BiomarkerDetail = lazy(() => import('@/redesign/v3/routes/V3BiomarkerDetail.jsx'));
const V3ProgressPhotos = lazy(() => import('@/redesign/v3/routes/V3ProgressPhotos.jsx'));
const V3BodyPhotoCapture = lazy(() => import('@/redesign/v3/routes/V3BodyPhotoCapture.jsx'));
const V3PersonalRecords = lazy(() => import('@/redesign/v3/routes/V3PersonalRecords.jsx'));
const V3SharePR = lazy(() => import('@/redesign/v3/routes/V3SharePR.jsx'));
const V3WeeklyReview = lazy(() => import('@/redesign/v3/routes/V3WeeklyReview.jsx'));
const V3Welcome  = lazy(() => import('@/redesign/v3/routes/V3Welcome.jsx'));
const V3Manifesto = lazy(() => import('@/redesign/v3/routes/V3Manifesto.jsx'));
const V3AuthLogin = lazy(() => import('@/redesign/v3/routes/V3AuthLogin.jsx'));
const V3AuthSignup = lazy(() => import('@/redesign/v3/routes/V3AuthSignup.jsx'));
const V3ForgotPassword = lazy(() => import('@/redesign/v3/routes/V3ForgotPassword.jsx'));
const V3ResetPassword = lazy(() => import('@/redesign/v3/routes/V3ResetPassword.jsx'));
const V3AuthCallback = lazy(() => import('@/redesign/v3/routes/V3AuthCallback.jsx'));
const V3MagicLinkSent = lazy(() => import('@/redesign/v3/routes/V3MagicLinkSent.jsx'));
const V3Landing = lazy(() => import('@/redesign/v3/routes/V3Landing.jsx'));
// Eager import — used as Suspense fallback + pre-auth, must render synchronously
import V3LoadingSplash from '@/redesign/v3/routes/V3LoadingSplash.jsx';
const V3DownloadApp = lazy(() => import('@/redesign/v3/routes/V3DownloadApp.jsx'));
const V3WebAppEntry = lazy(() => import('@/redesign/v3/routes/V3WebAppEntry.jsx'));
const V3WebPurchaseSuccess = lazy(() => import('@/redesign/v3/routes/V3WebPurchaseSuccess.jsx'));
const V3MethodPage = lazy(() => import('@/redesign/v3/routes/V3MethodPage.jsx'));
const V3LabsPage = lazy(() => import('@/redesign/v3/routes/V3LabsPage.jsx'));
const V3PricingPage = lazy(() => import('@/redesign/v3/routes/V3PricingPage.jsx'));
const V3AppPage = lazy(() => import('@/redesign/v3/routes/V3AppPage.jsx'));
const V3WorkoutSummary = lazy(() => import('@/redesign/v3/routes/V3WorkoutSummary.jsx'));
const V3SleepDetail = lazy(() => import('@/redesign/v3/routes/V3SleepDetail.jsx'));
const V3Capture = lazy(() => import('@/redesign/v3/routes/V3Capture.jsx'));
const V3Inbox = lazy(() => import('@/redesign/v3/routes/V3Inbox.jsx'));
const V3FoodDetail = lazy(() => import('@/redesign/v3/routes/V3FoodDetail.jsx'));
const V3Calendar = lazy(() => import('@/redesign/v3/routes/V3Calendar.jsx'));
const V3Crew = lazy(() => import('@/redesign/v3/routes/V3Crew.jsx'));
const V3RecipeBuilder = lazy(() => import('@/redesign/v3/routes/V3RecipeBuilder.jsx'));
const V3Watch = lazy(() => import('@/redesign/v3/routes/V3Watch.jsx'));
const V3Protocols = lazy(() => import('@/redesign/v3/routes/V3Protocols.jsx'));
const V3ProtocolsEmpty = lazy(() => import('@/redesign/v3/routes/V3ProtocolsEmpty.jsx'));
const V3ProtocolDetail = lazy(() => import('@/redesign/v3/routes/V3ProtocolDetail.jsx'));
const V3ProtocolForm = lazy(() => import('@/redesign/v3/routes/V3ProtocolForm.jsx'));
const V3SubstancePicker = lazy(() => import('@/redesign/v3/routes/V3SubstancePicker.jsx'));
const V3LogDose = lazy(() => import('@/redesign/v3/routes/V3LogDose.jsx'));
const V3ProtocolTimeline = lazy(() => import('@/redesign/v3/routes/V3ProtocolTimeline.jsx'));
const V3TodayDose = lazy(() => import('@/redesign/v3/routes/V3TodayDose.jsx'));
const V3MobilePaywall = lazy(() => import('@/redesign/v3/routes/V3MobilePaywall.jsx'));
const V3PRMoment = lazy(() => import('@/redesign/v3/routes/V3PRMoment.jsx'));
const V3WeightTrend = lazy(() => import('@/redesign/v3/routes/V3WeightTrend.jsx'));
const V3EmptyStates = lazy(() => import('@/redesign/v3/routes/V3EmptyStates.jsx'));
const V3Errors = lazy(() => import('@/redesign/v3/routes/V3Errors.jsx'));
const V3FoodDiary = lazy(() => import('@/redesign/v3/routes/V3FoodDiary.jsx'));
const V3MacroTargets = lazy(() => import('@/redesign/v3/routes/V3MacroTargets.jsx'));
const V3WaterLog = lazy(() => import('@/redesign/v3/routes/V3WaterLog.jsx'));
const V3WorkoutHistory = lazy(() => import('@/redesign/v3/routes/V3WorkoutHistory.jsx'));
const V3WorkoutDetail = lazy(() => import('@/redesign/v3/routes/V3WorkoutDetail.jsx'));
const V3ActiveWorkout = lazy(() => import('@/redesign/v3/routes/V3ActiveWorkout.jsx'));
const V3CompositionHistory = lazy(() => import('@/redesign/v3/routes/V3CompositionHistory.jsx'));
const V3CoachInsight = lazy(() => import('@/redesign/v3/routes/V3CoachInsight.jsx'));
const V3AccountSettings = lazy(() => import('@/redesign/v3/routes/V3AccountSettings.jsx'));
const V3Integrations = lazy(() => import('@/redesign/v3/routes/V3Integrations.jsx'));
const V3DangerZone = lazy(() => import('@/redesign/v3/routes/V3DangerZone.jsx'));
const V3Diagnostics = lazy(() => import('@/redesign/v3/routes/V3Diagnostics.jsx'));
const V3ProfileEditor = lazy(() => import('@/redesign/v3/routes/V3ProfileEditor.jsx'));
const V3MealPlans = lazy(() => import('@/redesign/v3/routes/V3MealPlans.jsx'));
const V3SocialFeed = lazy(() => import('@/redesign/v3/routes/V3SocialFeed.jsx'));
const V3Friends = lazy(() => import('@/redesign/v3/routes/V3Friends.jsx'));
const V3Follow = lazy(() => import('@/redesign/v3/routes/V3Follow.jsx'));
const V3Insights = lazy(() => import('@/redesign/v3/routes/V3Insights.jsx'));
const V3FocusMode = lazy(() => import('@/redesign/v3/routes/V3FocusMode.jsx'));
const V3Streaks = lazy(() => import('@/redesign/v3/routes/V3Streaks.jsx'));
const V3Celebrations = lazy(() => import('@/redesign/v3/routes/V3Celebrations.jsx'));
const V3PublicProfile = lazy(() => import('@/redesign/v3/routes/V3PublicProfile.jsx'));
const V3Terms = lazy(() => import('@/redesign/v3/routes/V3Terms.jsx'));
const V3Privacy = lazy(() => import('@/redesign/v3/routes/V3Privacy.jsx'));
const V3Paywall = lazy(() => import('@/redesign/v3/routes/V3Paywall.jsx'));
const V3AccountHub = lazy(() => import('@/redesign/v3/routes/V3AccountHub.jsx'));
const V3NotFound = lazy(() => import('@/redesign/v3/routes/V3NotFound.jsx'));
const V3DataExport = lazy(() => import('@/redesign/v3/routes/V3DataExport.jsx'));
const V3BillingHistory = lazy(() => import('@/redesign/v3/routes/V3BillingHistory.jsx'));
const V3SubscriptionManage = lazy(() => import('@/redesign/v3/routes/V3SubscriptionManage.jsx'));
const V3MealDetail = lazy(() => import('@/redesign/v3/routes/V3MealDetail.jsx'));
const V3Offline = lazy(() => import('@/redesign/v3/routes/V3Offline.jsx'));
const V3Maintenance = lazy(() => import('@/redesign/v3/routes/V3Maintenance.jsx'));
const V3ForceUpdate = lazy(() => import('@/redesign/v3/routes/V3ForceUpdate.jsx'));
const V3ServerError = lazy(() => import('@/redesign/v3/routes/V3ServerError.jsx'));
const _V3LabExamDetail = lazy(() => import('@/redesign/v3/routes/V3LabExamDetail.jsx'));
const _V3LabHistory    = lazy(() => import('@/redesign/v3/routes/V3LabHistory.jsx'));
const _V3LabUpload     = lazy(() => import('@/redesign/v3/routes/V3LabUpload.jsx'));
// v2 screen imports removed. Use v3 route wrappers and services only.
import SmartOnboarding        from '@/components/onboarding/SmartOnboarding.jsx';
import S6_Weight_B            from '@/redesign/v3/screens/S6_Weight_B.jsx';
import S17_Measurements_Entry from '@/redesign/v3/screens/S17_Measurements_Entry.jsx';
import S5_Paywall_A           from '@/redesign/v3/screens/S5_Paywall_A.jsx';
import { supabase as supabaseClient } from '@/lib/supabaseClient';
import {
  // v3 nutrition services will be used; keep alias names for compatibility
  getEntriesForDate         as nutritionGetEntries,
  addEntry                  as nutritionAddEntry,
  addEntries                as nutritionAddEntries,
  subscribe                 as nutritionSubscribe,
} from '@/lib/nutritionStore';
import { WEBAPP_DANGER, WEBAPP_PAYWALL } from '@/lib/platformRoutes';

// ─── ComingSoon stub (no v2 equivalent; keeps /help and fallback routes alive) ─
function ComingSoon({ routeName, onGoHome, onBack }) {
  const t = useT();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: '24px', gap: 16 }}>
      <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{routeName}</p>
      <p style={{ fontSize: 15, opacity: 0.6, margin: 0 }}>{t('appShell.comingSoon.status')}</p>
      <button onClick={onGoHome || onBack || (() => window.history.back())} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#e8b500', fontWeight: 600, cursor: 'pointer' }}>{t('appShell.comingSoon.back')}</button>
    </div>
  );
}

// ─── Analytics pageviews ─────────────────────────────────────────────────────
function usePageViewTracking() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
}

// ─── Onboarding flow — shared local state across all 10 steps ────────────────
const ONBOARDING_ORDER = [
  '/onboarding',
  '/onboarding/goal',
  '/onboarding/activity',
  '/onboarding/stats',
  '/onboarding/diet',
  '/onboarding/workout',
  '/onboarding/habits',
  '/onboarding/constraints',
  '/onboarding/summary',
  '/onboarding/paywall',
];

function useOnboardingFlow() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const location = useLocation();
  const idx = ONBOARDING_ORDER.indexOf(location.pathname);
  const prev = idx > 0 ? ONBOARDING_ORDER[idx - 1] : null;
  const next = idx >= 0 && idx < ONBOARDING_ORDER.length - 1 ? ONBOARDING_ORDER[idx + 1] : '/app/today';
  return {
    answers,
    setKey: (k, v) => setAnswers((s) => ({ ...s, [k]: v })),
    onBack: () => (prev ? navigate(prev) : navigate(-1)),
    onContinue: () => navigate(next),
  };
}

// ─── Connected screens ───────────────────────────────────────────────────────
function OnboardingWorkoutRoute() {
  const { answers, setKey, onBack, onContinue } = useOnboardingFlow();
  return (
    <OnboardingWorkout
      value={answers.workout}
      onChange={(v) => setKey('workout', v)}
      onBack={onBack}
      onContinue={onContinue}
    />
  );
}
function OnboardingHabitsRoute() {
  const { answers, setKey, onBack, onContinue } = useOnboardingFlow();
  return (
    <OnboardingHabits
      value={answers.habits}
      onChange={(v) => setKey('habits', v)}
      onBack={onBack}
      onContinue={onContinue}
    />
  );
}
function OnboardingConstraintsRoute() {
  const { answers, setKey, onBack, onContinue } = useOnboardingFlow();
  return (
    <OnboardingConstraints
      value={answers.constraints}
      onChange={(v) => setKey('constraints', v)}
      onBack={onBack}
      onContinue={onContinue}
    />
  );
}
function OnboardingSummaryRoute() {
  const { onBack, onContinue } = useOnboardingFlow();
  return <OnboardingSummary onBack={onBack} onContinue={onContinue} />;
}
function OnboardingPaywallRoute() {
  const navigate = useNavigate();
  const t = useT();
  const { theme } = useTheme();
  const platform = Capacitor.isNativePlatform() ? 'native' : 'web';
  const { user } = useAuth();

  async function completeAndGo(nextPath) {
    if (!user?.id) {
      toast.error(t('onboarding.paywall.mustBeSignedIn'));
      return;
    }

    try {
      await finalizeOnboarding(user.id);
      await queryClientInstance.invalidateQueries();
      navigate(nextPath);
    } catch (error) {
      console.error('[OnboardingPaywallRoute] finalize failed', error);
      toast.error(t('onboarding.paywall.finishFailed'), {
        description: error?.message || t('common.tryAgain'),
      });
    }
  }

  return (
    <S5_Paywall_A
      dark={theme === 'dark'}
      platform={platform}
      onStartTrial={() => completeAndGo('/webapp/billing/paywall')}
      onRestore={() => completeAndGo('/webapp/billing/paywall')}
      onSkip={() => completeAndGo('/app/today')}
    />
  );
}
function OnboardingTourRoute() {
  const navigate = useNavigate();
  return <OnboardingTour onFinish={() => navigate('/app/today')} />;
}

/* ─── Nutrition routes ────────────────────────────────────────────────── */

function FoodDetailRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = new URLSearchParams(useLocation().search);
  const meal = params.get('meal') || 'breakfast';
  const label = meal.charAt(0).toUpperCase() + meal.slice(1);
  return <V3FoodDetail />;
}

function PhotoScanRoute() {
  const navigate = useNavigate();
  const [perm, setPerm] = useState('prompt');
  return <V3Capture />;
}

function PhotoScanConfirmRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = new URLSearchParams(useLocation().search);
  const aiText = params.get('ai');
  const meal = params.get('meal') || 'breakfast';
  const label = meal.charAt(0).toUpperCase() + meal.slice(1);
  return <V3Capture />;
}

function VoiceLogRoute() {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const meal = params.get('meal') || 'breakfast';
  const label = meal.charAt(0).toUpperCase() + meal.slice(1);
  return <V3Capture />;
}

/* ─── Workout routes ──────────────────────────────────────────────────── */

function ActiveWorkoutRoute() {
  return <V3ActiveWorkout />;
}

function ManualWorkoutPlanRoute() {
  return <V3RoutinePresets />;
}

function WorkoutDetailRoute() {
  return <V3WorkoutDetail />;
}

function RoutineDetailRoute() {
  return <V3WorkoutDetail />;
}

function WorkoutHistoryRoute() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await listRecentSessions({ limit: 50 });
        if (cancelled) return;
        const projected = (rows || []).map((s) => {
          const sets = Array.isArray(s.sets) ? s.sets : [];
          const exerciseIds = new Set(sets.map((x) => x.exercise_id).filter(Boolean));
          return {
            id: s.id,
            name: 'Workout',
            at: s.started_at || s.created_at,
            duration: s.duration_sec != null ? Math.round(s.duration_sec / 60) : null,
            volume: s.total_volume_kg != null ? Number(s.total_volume_kg) : null,
            exerciseCount: exerciseIds.size,
            prCount: 0,
          };
        });
        setSessions(projected);
        // Lightweight stats strip computed from the fetched page.
        if (projected.length > 0) {
          const totalVolume = projected.reduce((sum, s) => sum + (s.volume || 0), 0);
          // Rough per-week average: sessions in the range divided by weeks spanned.
          const first = new Date(projected[projected.length - 1].at).getTime();
          const last = new Date(projected[0].at).getTime();
          const weeks = Math.max(1, (last - first) / (7 * 86400000));
          setStats({
            totalSessions: projected.length,
            totalVolumeKg: totalVolume,
            avgPerWeek: projected.length / weeks,
          });
        } else {
          setStats(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return <V3WorkoutHistory />;
}

/* ─── Labs routes ─────────────────────────────────────────────────────── */

function V3LabExamDetail() {
  return <_V3LabExamDetail />;
}

function V3LabHistory() {
  return <_V3LabHistory />;
}

function V3LabUpload() {
  return <_V3LabUpload />;
}

/* ─── Today expansions routes ─────────────────────────────────────────── */

function InsightsRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tier = user?.user_metadata?.tier;
  const isPremium = tier === 'Premium' || tier === 'Pro' || user?.atlas_role === 'admin';
  return (
    <InsightsScreen
      isPremium={isPremium}
      insights={[]}
      onUpgrade={() => navigate(WEBAPP_PAYWALL)}
      onOpenInsight={(id) => navigate(`/app/coach/insights/${id}`)}
      onAsk={(text) => navigate(`/app/coach/chat?ask=${encodeURIComponent(text)}`)}
      onBack={() => navigate('/app/today')}
    />
  );
}

function DiaryRoute() {
  const navigate = useNavigate();
  // TODO: wire to a diary service (Supabase table `diary_entries`).
  // For now, local session-only store so the UI is testable.
  const [entries, setEntries] = React.useState([]);
  return (
    <Diary
      entries={entries}
      suggestedPrompt={null}
      onSave={({ text, mood }) => {
        setEntries((list) => [
          { id: `e_${Date.now()}`, at: new Date().toISOString(), text, mood, metrics: null },
          ...list,
        ]);
      }}
      onOpenEntry={(id) => console.log('Open entry', id)}
    />
  );
}

/* ─── Profile + Settings routes ───────────────────────────────────────── */

function buildRealUser(authUser) {
  if (!authUser) return null;
  const meta = authUser.user_metadata || {};
  // Prefer explicit first_name/last_name (set by ProfileEditor) over the
  // legacy single `full_name` field. Never fabricate "A" / "User".
  const first = (meta.first_name || '').trim();
  const last  = (meta.last_name  || '').trim();
  const derivedName =
    [first, last].filter(Boolean).join(' ')
    || authUser.full_name
    || (authUser.email ? authUser.email.split('@')[0] : '');
  return {
    name: derivedName,
    firstName: first || null,
    lastName:  last  || null,
    email: authUser.email || '',
    avatar: meta.avatar_url || null,
    bio: meta.bio || '',
    location: meta.location || '',
    memberSince: authUser.raw_user?.created_at || null,
    tier: meta.tier || (authUser.atlas_role === 'coach' ? 'Coach' : authUser.atlas_role === 'admin' ? 'Admin' : 'Free'),
    twoFactorEnabled: !!authUser.raw_user?.factors?.length,
    providers: (authUser.raw_user?.identities || [])
      .map((i) => i.provider)
      .filter((p) => p && p !== 'email'),
  };
}

/**
 * Derive Profile's `physical` prop from real `user_metadata` keys written by
 * the ProfileEditor. Returns null only if the user has set NOTHING — that way
 * partial info still renders (e.g., height set but weight not yet logged).
 *
 * Source-of-truth keys (see /docs/BACKEND_TODO.md "Profile / user_metadata"):
 *   height_cm        → physical.heightCm
 *   date_of_birth    → physical.ageYears (computed)
 *   weight_kg / bf_pct / lean_mass_kg currently live in body_weight_log
 *   table (not user_metadata) — null here until that table is wired.
 */
function buildPhysicalFromMetadata(meta) {
  if (!meta) return null;
  const heightCm = typeof meta.height_cm === 'number' ? meta.height_cm : null;
  let ageYears = null;
  if (meta.date_of_birth) {
    try {
      const dob = new Date(meta.date_of_birth);
      if (!Number.isNaN(dob.getTime())) {
        const ms = Date.now() - dob.getTime();
        ageYears = Math.floor(ms / (365.25 * 24 * 3600 * 1000));
      }
    } catch {}
  }
  if (heightCm == null && ageYears == null) return null;
  return { heightCm, ageYears, weightKg: null, bodyFatPct: null, leanMassKg: null };
}

const GOAL_LABELS = {
  strength:    'Build strength',
  hypertrophy: 'Build muscle',
  endurance:   'Improve endurance',
  weight_loss: 'Lose weight',
  health:      'Improve health',
  general:     'General fitness',
};

function buildGoalFromMetadata(meta) {
  if (!meta?.primary_goal) return null;
  return { primary: GOAL_LABELS[meta.primary_goal] || meta.primary_goal };
}

function AccountSettingsRoute() {
  const navigate = useNavigate();
  const t = useT();
  const { user } = useAuth();
  const realUser = buildRealUser(user);
  return (
    <AccountSettings
      user={realUser}
      onBack={() => navigate('/app/settings')}
      onChangeEmail={() => todoToast(t('accountSettingsPage.actions.changeEmail'), t)}
      onChangePassword={() => todoToast(t('accountSettingsPage.actions.resetPassword'), t)}
      onEnable2FA={() => todoToast(t('accountSettingsPage.rows.twoFactor'), t)}
      onManageSessions={() => todoToast(t('accountSettingsPage.rows.sessions'), t)}
      onUnlinkProvider={(p) => todoToast(`${t('accountSettingsPage.actions.disconnect')} ${p}`, t)}
      onDeleteAccount={() => navigate(WEBAPP_DANGER)}
    />
  );
}

function IntegrationsRoute() {
  const navigate = useNavigate();
  // TODO: fetch real connection status from Supabase `user_integrations` table.
  const platform = Capacitor.isNativePlatform() ? Capacitor.getPlatform() : 'web';
  return (
    <Integrations
      connections={{}}
      platform={platform}
      onBack={() => navigate('/app/settings')}
      onConnect={async (id) => { integToast(id, await integConnect(id)); }}
      onDisconnect={async (id) => { integToast(id, await integDisconnect(id)); }}
      onRefresh={async (id) => { integToast(id, await integRefresh(id)); }}
    />
  );
}

function DangerZoneRoute() {
  const navigate = useNavigate();
  const t = useT();
  const { user, logout } = useAuth();
  return (
    <DangerZone
      userEmail={user?.email || ''}
      onBack={() => navigate('/app/settings')}
      onExportData={() => todoToast(t('dangerZone.export.action'), t)}
      onResetData={async () => {
        // TODO: invoke reset-user-data edge function
        await new Promise((r) => setTimeout(r, 600));
        toast.success(t('dangerZone.toasts.resetSuccess'));
        navigate('/app/today');
      }}
      onDeleteAccount={async () => {
        // TODO: invoke admin-delete-user for self, then logout
        await new Promise((r) => setTimeout(r, 800));
        try { await logout?.(); } catch {}
        navigate('/', { replace: true });
      }}
    />
  );
}

/* ─── Body routes ─────────────────────────────────────────────────────── */

function WeightEntryRoute() {
  const navigate = useNavigate();
  const t = useT();
  const { theme } = useTheme();
  const { user } = useAuth();
  return (
    <S6_Weight_B
      dark={theme === 'dark'}
      onBack={() => navigate(-1)}
      onSave={async (entry) => {
        try {
          await createMeasurement(user.id, {
            weight: entry.weight,
            date: entry.when || new Date().toISOString(),
          });
          toast.success(t('body.routeToasts.weightLoggedTitle'), {
            description: t('body.routeToasts.weightLoggedBody'),
            action: {
              label: t('body.routeToasts.viewHistory'),
              onClick: () => navigate('/app/body/composition'),
            },
          });
          navigate('/app/body');
        } catch (err) {
          toast.error(t('body.routeToasts.weightSaveFailed'), {
            description: err?.message || t('common.tryAgain'),
          });
        }
      }}
      onViewHistory={() => navigate('/app/body/composition')}
    />
  );
}

function MeasurementsRoute() {
  const navigate = useNavigate();
  const t = useT();
  const { theme } = useTheme();
  const { user } = useAuth();
  return (
    <S17_Measurements_Entry
      dark={theme === 'dark'}
      onClose={() => navigate(-1)}
      onSave={async (measurements) => {
        try {
          await createMeasurement(user.id, measurements);
          toast.success(t('body.routeToasts.measurementsSaved'));
          navigate('/app/body');
        } catch (err) {
          toast.error(t('body.routeToasts.measurementsSaveFailed'), {
            description: err?.message || t('common.tryAgain'),
          });
        }
      }}
    />
  );
}

function BodyCheckInRoute() {
  return <Navigate to="/app/body/measurements" replace />;
}

/* ─── Coach routes ────────────────────────────────────────────────────── */

function CoachInsightDetailRoute() {
  const navigate = useNavigate();
  // TODO: fetch the real insight by :id from an insight service. Until then,
  // we pass `null` explicitly so the screen renders its honest empty state
  // instead of a fabricated "HRV rebounded" demo.
  return (
    <CoachInsightDetail
      insight={null}
      onBack={() => navigate(-1)}
      onAsk={(prompt) => navigate(`/app/coach/chat?ask=${encodeURIComponent(prompt)}`)}
      onNavigate={(route) => route && navigate(route)}
    />
  );
}

/**
 * AppPlaceholder — used for every /app/* route not yet redesigned.
 * Renders inside <AppShell /> so top bar + bottom nav stay consistent.
 */
function AppPlaceholder({ name }) {
  const navigate = useNavigate();
  return (
    <ComingSoon
      routeName={name}
      onGoHome={() => navigate('/app/today')}
      onBack={() => navigate(-1)}
    />
  );
}

/**
 * NativeRootRedirect — on native (Capacitor), redirect / to the app.
 * On web, show the marketing landing page.
 */
function RootRoute() {
  const { user } = useAuth();
  if (Capacitor.isNativePlatform()) {
    return <Navigate to={user ? '/app/today' : '/welcome'} replace />;
  }
  return <V3Landing />;
}

// ─── Route table ─────────────────────────────────────────────────────────────
function AppRoutes() {
  usePageViewTracking();
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <V3LoadingSplash phase="boot" />;
  }

  const isAuthed = !!user;

  return (
    <Suspense fallback={<V3LoadingSplash phase="syncing" />}>
      <Routes>
        {/* ── v3 design preview (gallery of all 35 paper+ink+amber screens) ── */}
        <Route path="/v3"      element={<V3Gallery />} />
        <Route path="/v3/*"    element={<V3Gallery />} />

        {/* ── v3 gallery preview (legacy sidecar namespace kept for review) ── */}
        <Route path="/app/v3" element={<V3AppShell />}>
          <Route index           element={<Navigate to="today" replace />} />
          <Route path="today"    element={<V3Today />} />
          <Route path="train"    element={<V3Train />} />
          <Route path="eat"      element={<V3Eat />} />
          <Route path="body"     element={<V3Body />} />
          <Route path="you"      element={<V3You />} />
          <Route path="*"        element={<Navigate to="today" replace />} />
        </Route>

        {/* ── Desktop/webapp utility surface (full-width, no phone frame) ── */}
        <Route path="/webapp" element={<V3WebAppEntry />} />
        <Route path="/webapp/account" element={isAuthed ? <V3AccountHub /> : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/export" element={isAuthed ? <V3DataExport /> : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/billing" element={isAuthed ? <V3SubscriptionManage /> : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/billing/manage" element={isAuthed ? <V3SubscriptionManage /> : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/billing/plans" element={isAuthed ? <V3Paywall /> : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/billing/paywall" element={isAuthed ? <V3Paywall /> : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/billing/invoices" element={isAuthed ? <V3BillingHistory /> : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/settings" element={isAuthed ? <V3AccountSettings /> : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/settings/danger" element={isAuthed ? <V3DangerZone /> : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/settings/diagnostics" element={isAuthed ? <V3Diagnostics /> : <Navigate to="/auth/login" replace />} />

        {/* Legacy mixed paths now redirect into the desktop utility surface. */}
        <Route path="/app/account" element={<Navigate to="/webapp/account" replace />} />
        <Route path="/app/export" element={<Navigate to="/webapp/export" replace />} />
        <Route path="/app/billing" element={<Navigate to="/webapp/billing" replace />} />
        <Route path="/app/billing/manage" element={<Navigate to="/webapp/billing/manage" replace />} />
        <Route path="/app/billing/plans" element={<Navigate to="/webapp/billing/plans" replace />} />
        <Route path="/app/billing/paywall" element={<Navigate to="/webapp/billing/paywall" replace />} />
        <Route path="/app/billing/invoices" element={<Navigate to="/webapp/billing/invoices" replace />} />
        <Route path="/app/settings/account" element={<Navigate to="/webapp/settings" replace />} />
        <Route path="/app/settings/danger" element={<Navigate to="/webapp/settings/danger" replace />} />
        <Route path="/app/settings/diagnostics" element={<Navigate to="/webapp/settings/diagnostics" replace />} />

        {/* ── Fullscreen flows (no shell chrome, MUST come before /app) ──
             Wrapped in <PlatformGate> so public web users are redirected to
             /download-app (CLAUDE.md §13–16). Native + dev mode bypass. */}
        <Route path="/app/nutrition/search" element={isAuthed ? <PlatformGate><V3NutritionSearch /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/food/new" element={isAuthed ? <PlatformGate><V3FoodDetail /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/food/:id" element={isAuthed ? <PlatformGate><FoodDetailRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/meal/:id" element={isAuthed ? <PlatformGate><V3MealDetail /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/photo" element={isAuthed ? <PlatformGate><PhotoScanRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/photo/confirm" element={isAuthed ? <PlatformGate><PhotoScanConfirmRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/voice" element={isAuthed ? <PlatformGate><VoiceLogRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/workouts/active" element={isAuthed ? <PlatformGate><ActiveWorkoutRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/workouts/manual-plan" element={isAuthed ? <PlatformGate><ManualWorkoutPlanRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/exercises" element={isAuthed ? <PlatformGate><V3ExerciseLibrary /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/exercises/:id" element={isAuthed ? <PlatformGate><V3ExerciseDetail /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/coach/chat" element={isAuthed ? <PlatformGate><V3CoachChat /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/body/weight" element={isAuthed ? <PlatformGate><WeightEntryRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/body/checkin" element={isAuthed ? <PlatformGate><BodyCheckInRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/body/measurements" element={isAuthed ? <PlatformGate><MeasurementsRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/body/compare" element={isAuthed ? <PlatformGate><V3Body /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/labs/upload" element={isAuthed ? <PlatformGate><V3LabUpload /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/social/share" element={isAuthed ? <PlatformGate><V3SharePR /></PlatformGate> : <Navigate to="/auth/login" replace />} />

        {/* ── v3 live app core (mounted on the real athlete routes) ───── */}
        <Route
          path="/app"
          element={isAuthed ? <V3AppShell /> : <Navigate to="/auth/login" replace />}
        >
          <Route index element={<Navigate to="/app/today" replace />} />
          <Route path="today" element={<V3Today />} />
          <Route path="weekly" element={<V3WeeklyReview />} />
          <Route path="workouts" element={<V3Train />} />
          <Route path="routines" element={<V3Train />} />
          <Route path="nutrition" element={<V3Eat />} />
          <Route path="body" element={<V3Body />} />
          <Route path="profile" element={<V3You />} />
          <Route path="settings" element={<V3Settings />} />
          <Route path="coach" element={<V3CoachHome />} />
          <Route path="labs" element={<V3Labs />} />
          <Route path="labs/biomarker/:id" element={<V3BiomarkerDetail />} />
          <Route path="body/progress/photos" element={<V3ProgressPhotos />} />
          <Route path="body/progress/photos/capture" element={<V3BodyPhotoCapture />} />
          <Route path="notifications" element={<V3Notifications />} />
          <Route path="routines/:id" element={<V3RoutineDetail />} />
          {/* Billing routes moved outside V3AppShell — full-width web pages */}

          {/* Today-domain expansions */}
          <Route path="insights" element={<V3Insights />} />
          <Route path="diary" element={<V3FoodDiary />} />
          <Route path="today/focus" element={<V3FocusMode />} />
          <Route path="today/streaks" element={<V3Streaks />} />
          <Route path="today/celebrate/:kind" element={<V3Celebrations />} />

          {/* Nutrition sub-screens */}
          <Route path="nutrition/diary" element={<V3FoodDiary />} />
          <Route path="nutrition/targets" element={<V3MacroTargets />} />
          <Route path="nutrition/water" element={<V3WaterLog />} />
          <Route path="nutrition/meal-plans" element={<V3MealPlans />} />

          {/* Workout sub-screens */}
          <Route path="workouts/history" element={<V3WorkoutHistory />} />
          <Route path="workouts/:id" element={<V3WorkoutDetail />} />
          <Route path="workouts/records" element={<V3PersonalRecords />} />
          <Route path="workouts/share" element={<V3SharePR />} />
          <Route path="routines/presets" element={<V3RoutinePresets />} />
          <Route path="routines/presets/:id" element={<V3RoutinePresetDetail />} />

          {/* Body sub-screens */}
          <Route path="body/composition" element={<V3CompositionHistory />} />

          {/* Labs sub-screens */}
          <Route path="labs/history" element={<V3LabHistory />} />
          <Route path="labs/exam/:id" element={<V3LabExamDetail />} />

          {/* Coach sub-screens */}
          <Route path="coach/insights/:id" element={<V3CoachInsight />} />

          {/* Profile + Settings sub-screens */}
          <Route path="profile/edit" element={<V3ProfileEditor />} />
          <Route path="settings/integrations" element={<V3Integrations />} />

          {/* Social */}
          <Route path="social" element={<V3SocialFeed />} />
          <Route path="social/friends" element={<V3Friends />} />
          <Route path="social/follow" element={<V3Follow />} />

          {/* Workout sub-screens */}
          <Route path="workouts/summary" element={<V3WorkoutSummary />} />
          <Route path="workouts/calendar" element={<V3Calendar />} />

          {/* Nutrition sub-screens */}
          <Route path="nutrition/food" element={<V3FoodDetail />} />
          <Route path="nutrition/capture" element={<V3Capture />} />
          <Route path="nutrition/recipes/new" element={<V3RecipeBuilder />} />

          {/* Body sub-screens */}
          <Route path="sleep" element={<V3SleepDetail />} />
          <Route path="watch" element={<V3Watch />} />

          {/* Crew + Inbox */}
          <Route path="crew" element={<V3Crew />} />
          <Route path="inbox" element={<V3Inbox />} />

          {/* Protocols module */}
          <Route path="protocols" element={<V3Protocols />} />
          <Route path="protocols/empty" element={<V3ProtocolsEmpty />} />
          <Route path="protocols/new" element={<V3ProtocolForm />} />
          <Route path="protocols/substances" element={<V3SubstancePicker />} />
          <Route path="protocols/log" element={<V3LogDose />} />
          <Route path="protocols/timeline" element={<V3ProtocolTimeline />} />
          <Route path="protocols/today" element={<V3TodayDose />} />
          <Route path="protocols/:id" element={<V3ProtocolDetail />} />

          {/* Paywall + Weight + Utility */}
          <Route path="paywall" element={<V3MobilePaywall />} />
          <Route path="pr-moment" element={<V3PRMoment />} />
          <Route path="body/weight/trend" element={<V3WeightTrend />} />
          <Route path="empty-states" element={<V3EmptyStates />} />
          <Route path="errors" element={<V3Errors />} />
        </Route>

        {/* ── Marketing (public web) — root is now the landing page ── */}
        <Route path="/"        element={<RootRoute />} />
        <Route path="/landing" element={<V3Landing />} />
        <Route path="/download-app" element={<V3DownloadApp />} />
        <Route path="/webapp/success" element={<V3WebPurchaseSuccess />} />
        <Route path="/the-app" element={<V3AppPage />} />
        <Route path="/method"  element={<V3MethodPage />} />
        <Route path="/labs"    element={<V3LabsPage />} />
        <Route path="/pricing" element={<V3PricingPage />} />
        <Route path="/terms"   element={<V3Terms />} />
        <Route path="/privacy" element={<V3Privacy />} />
        <Route path="/faq"     element={<V3PricingPage />} />

        {/* ── Welcome (auth-flow entry, kept for the mobile app) ────── */}
        <Route path="/welcome" element={<V3Welcome />} />
        <Route path="/welcome/manifesto" element={<V3Manifesto />} />

        {/* ── Auth ────────────────────────────────────────────────── */}
        <Route path="/auth"          element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login"    element={<V3AuthLogin />} />
        <Route path="/auth/signup"   element={<V3AuthSignup />} />
        <Route path="/auth/forgot"   element={<V3ForgotPassword />} />
        <Route path="/auth/reset"    element={<V3ResetPassword />} />
        <Route path="/auth/update-password" element={<Navigate to="/auth/reset" replace />} />
        <Route path="/auth/magic"    element={<V3MagicLinkSent />} />
        <Route path="/auth/callback" element={<V3AuthCallback />} />

        {/* ── Onboarding ─────────────────────────────────────────── */}
        <Route path="/onboarding" element={<V3OnboardingIdentity />} />
        <Route path="/onboarding/goal" element={<V3OnboardingGoal />} />
        <Route path="/onboarding/activity" element={<V3OnboardingActivity />} />
        <Route path="/onboarding/stats" element={<V3OnboardingPlan />} />
        <Route path="/onboarding/diet" element={<V3OnboardingPermissions />} />
        <Route path="/onboarding/workout" element={<V3OnboardingWorkout />} />
        <Route path="/onboarding/habits" element={<V3OnboardingHabits />} />
        <Route path="/onboarding/constraints" element={<V3OnboardingConstraints />} />
        <Route path="/onboarding/summary" element={<V3OnboardingSummary />} />
        <Route path="/onboarding/paywall" element={<OnboardingPaywallRoute />} />
        <Route path="/onboarding/tour" element={<V3OnboardingTour />} />
        <Route path="/onboarding/smart" element={<SmartOnboarding onContinue={() => {}} />} />

        {/* Public profile lives outside the shell (no auth guard on view) */}
        <Route path="/app/u/:username" element={<V3PublicProfile />} />

        {/* ── System screens (pre-auth-aware; no guard) ─────────────────── */}
        {/* /app/offline is intentionally outside the auth-guarded block —
            the whole point of the screen is to work when sync can't. */}
        <Route path="/app/offline"  element={<V3Offline />} />
        <Route path="/maintenance"  element={<V3Maintenance />} />
        <Route path="/force-update" element={<V3ForceUpdate />} />
        <Route path="/500"          element={<V3ServerError />} />
        <Route path="/404"          element={<V3NotFound />} />

        {/* ── Legacy route redirects — keep old bookmarks/deep-links working ── */}
        {LEGACY_ROUTE_REDIRECTS.map(([from, to]) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}

        {/* ── Help (still referenced from marketing footer) ──────── */}
        <Route path="/help"     element={<ComingSoonNav name="Help center" />} />

        {/* ── 404 catch-all — MUST be the last route ───────────────── */}
        <Route path="*" element={<V3NotFound />} />
      </Routes>
    </Suspense>
  );
}

/** ComingSoon wrapper that injects nav handlers for public/standalone routes. */
function ComingSoonNav({ name }) {
  const navigate = useNavigate();
  return (
    <ComingSoon
      routeName={name}
      onGoHome={() => navigate('/')}
      onBack={() => navigate(-1)}
    />
  );
}

// ─── Provider tree (preserved from legacy App.jsx) ───────────────────────────
function App() {
  // Clear chunk-reload guard on every clean boot.
  React.useEffect(() => {
    try { sessionStorage.removeItem('atlas_chunk_reload'); } catch {}
  }, []);

  // Initialize analytics once at boot.
  React.useEffect(() => {
    try { initAnalytics(); } catch (e) { /* non-fatal */ }
  }, []);

  // Native OAuth deep-link (atlascore://auth/callback)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let listener;
    CapApp.addListener('appUrlOpen', async ({ url }) => {
      if (!url.includes('atlascore://auth/callback')) return;
      try { await Browser.close(); } catch {}
      const urlObj = new URL(url.replace('atlascore://', 'https://x.com/'));
      const code = urlObj.searchParams.get('code');
      const hashParams = new URLSearchParams(urlObj.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      } else if (accessToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
    }).then((h) => { listener = h; });
    return () => { listener?.remove(); };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <GoogleReCaptchaProvider>
            <QueryClientProvider client={queryClientInstance}>
              <SubscriptionProvider>
                <DailyStoreProvider>
                  <Router basename={import.meta.env.BASE_URL}>
                    <I18nProvider>
                      <AppRoutes />
                    </I18nProvider>
                  </Router>
                  <Sonner />
                  {!Capacitor.isNativePlatform() && <Analytics />}
                  {!Capacitor.isNativePlatform() && <SpeedInsights />}
                </DailyStoreProvider>
              </SubscriptionProvider>
            </QueryClientProvider>
          </GoogleReCaptchaProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
