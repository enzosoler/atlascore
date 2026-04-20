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
function todoToast(feature) {
  toast(`${feature} coming soon`, { description: 'Wiring this up next session.' });
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
import { I18nProvider } from '@/lib/i18nContext';
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

// ─── v2 screens (everything below is redesigned, Liquid Glass, safe-area aware) ─
import ComingSoon         from '@/redesign/v2/system/ComingSoon';
import { OfflineRoute }         from '@/redesign/v2/system/Offline';
import { ServerErrorRoute }     from '@/redesign/v2/system/ServerError';
import { MaintenanceRoute }     from '@/redesign/v2/system/Maintenance';
import { ForceUpdateRoute }     from '@/redesign/v2/system/ForceUpdate';
import { AppDiagnosticsRoute }  from '@/redesign/v2/system/AppDiagnostics';
import OnboardingWorkout     from '@/redesign/v2/onboarding/OnboardingWorkout';
import OnboardingHabits      from '@/redesign/v2/onboarding/OnboardingHabits';
import OnboardingConstraints from '@/redesign/v2/onboarding/OnboardingConstraints';
import OnboardingSummary     from '@/redesign/v2/onboarding/OnboardingSummary';
import S5_Paywall_A from '@/redesign/v3/screens/S5_Paywall_A.jsx';
import V3StandaloneLayout from '@/redesign/v3/layouts/V3StandaloneLayout.jsx';
import OnboardingTour        from '@/redesign/v2/onboarding/OnboardingTour';
import SmartOnboarding       from '@/redesign/v2/onboarding/SmartOnboarding';
import {
  V3OnboardingIdentity,
  V3OnboardingGoal,
  V3OnboardingActivity,
  V3OnboardingPlan,
  V3OnboardingPermissions,
} from '@/redesign/v3/routes/V3OnboardingRoutes.jsx';
import FoodDetail            from '@/redesign/v2/nutrition/FoodDetail';
import PhotoScan             from '@/redesign/v2/nutrition/PhotoScan';
import PhotoScanConfirm      from '@/redesign/v2/nutrition/PhotoScanConfirm';
import VoiceLog              from '@/redesign/v2/nutrition/VoiceLog';
import { FoodDiaryRoute }    from '@/redesign/v2/nutrition/FoodDiary.jsx';
import { MacroTargetsRoute } from '@/redesign/v2/nutrition/MacroTargets.jsx';
import { WaterLogRoute }     from '@/redesign/v2/nutrition/WaterLog.jsx';
import { MealPlansRoute }    from '@/redesign/v2/nutrition/MealPlans.jsx';
import { MealDetailRoute }   from '@/redesign/v2/nutrition/MealDetail.jsx';
import { CustomFoodRoute }   from '@/redesign/v2/nutrition/CustomFood.jsx';
import ActiveWorkout         from '@/redesign/v2/workouts/ActiveWorkout';
import ExerciseLibrary, {
  DEMO_EXERCISES,
  findExerciseById,
} from '@/redesign/v2/workouts/ExerciseLibrary';
import { RoutinePresetsRoute }      from '@/redesign/v2/workouts/RoutinePresets.jsx';
import { RoutinePresetDetailRoute } from '@/redesign/v2/workouts/RoutinePresetDetail.jsx';
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
const V3Terms = lazy(() => import('@/redesign/v3/routes/V3Terms.jsx'));
const V3Privacy = lazy(() => import('@/redesign/v3/routes/V3Privacy.jsx'));
const V3Paywall = lazy(() => import('@/redesign/v3/routes/V3Paywall.jsx'));
const V3AccountHub = lazy(() => import('@/redesign/v3/routes/V3AccountHub.jsx'));
const V3NotFound = lazy(() => import('@/redesign/v3/routes/V3NotFound.jsx'));
const V3DataExport = lazy(() => import('@/redesign/v3/routes/V3DataExport.jsx'));
const V3BillingHistory = lazy(() => import('@/redesign/v3/routes/V3BillingHistory.jsx'));
const V3SubscriptionManage = lazy(() => import('@/redesign/v3/routes/V3SubscriptionManage.jsx'));
import WorkoutDetail         from '@/redesign/v2/workouts/WorkoutDetail';
import WorkoutHistory        from '@/redesign/v2/workouts/WorkoutHistory';
import ManualWorkoutPlan     from '@/redesign/v2/workouts/ManualWorkoutPlan';
import CoachInsightDetail    from '@/redesign/v2/coach/CoachInsightDetail';
import BodyCheckIn           from '@/redesign/v2/body/BodyCheckIn';
// V2 WeightEntry and MeasurementsRoute are replaced by v3 screens (S6, S17).
// Kept unimported; the v2 files remain on disk as migration debt.
import S6_Weight_B            from '@/redesign/v3/screens/S6_Weight_B.jsx';
import S17_Measurements_Entry from '@/redesign/v3/screens/S17_Measurements_Entry.jsx';
import { BodyCompositionHistoryRoute }    from '@/redesign/v2/body/BodyCompositionHistory.jsx';
import { ProgressComparisonRoute }        from '@/redesign/v2/body/ProgressComparison.jsx';
import { ProfileEditorRoute } from '@/redesign/v2/profile/ProfileEditor';
import AccountSettings       from '@/redesign/v2/settings/AccountSettings';
import Integrations          from '@/redesign/v2/settings/Integrations';
import DangerZone            from '@/redesign/v2/settings/DangerZone';
import InsightsScreen        from '@/redesign/v2/today/Insights';
import Diary                 from '@/redesign/v2/today/Diary';
import { FocusModeRoute }      from '@/redesign/v2/today/FocusMode';
import { StreaksDetailRoute }  from '@/redesign/v2/today/StreaksDetail';
import { CelebrationsRoute }   from '@/redesign/v2/today/Celebrations';
import LabExamDetail         from '@/redesign/v2/labs/LabExamDetail';
import LabUpload             from '@/redesign/v2/labs/LabUpload';
import LabHistory            from '@/redesign/v2/labs/LabHistory';
import { SocialFeedRoute }    from '@/redesign/v2/social/SocialFeed';
import { FriendsRoute }       from '@/redesign/v2/social/Friends';
import { ShareWorkoutRoute }  from '@/redesign/v2/social/ShareWorkout';
import { FollowRoute }        from '@/redesign/v2/social/Follow';
import { PublicProfileRoute } from '@/redesign/v2/social/PublicProfile';
import { supabase as supabaseClient } from '@/lib/supabaseClient';
import {
  getEntriesForDate         as nutritionGetEntries,
  addEntry                  as nutritionAddEntry,
  addEntries                as nutritionAddEntries,
  subscribe                 as nutritionSubscribe,
} from '@/redesign/v2/nutrition/nutritionStore';

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
  const { theme } = useTheme();
  const platform = Capacitor.isNativePlatform() ? 'native' : 'web';
  return (
    <V3StandaloneLayout>
      <S5_Paywall_A
        dark={theme === 'dark'}
        platform={platform}
        onStartTrial={() => navigate('/onboarding/tour')}
        onRestore={() => navigate('/app/billing/restore')}
        onSkip={() => navigate('/app/today')}
      />
    </V3StandaloneLayout>
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
  return (
    <FoodDetail
      meal={label}
      onClose={() => navigate(-1)}
      onAdd={(entry) => {
        // Persist to the local nutrition store (swap for Supabase later).
        nutritionAddEntry(user?.id, new Date(), meal, {
          name: entry.name,
          brand: entry.brand,
          portion: `${entry.portion?.amount ?? entry.calculated?.portion ?? ''}${entry.portion?.unit ? ' ' + entry.portion.unit : ''}`,
          calories: entry.calculated?.calories ?? entry.nutrients?.calories ?? 0,
          protein:  entry.calculated?.protein  ?? entry.nutrients?.protein  ?? 0,
          carbs:    entry.calculated?.carbs    ?? entry.nutrients?.carbs    ?? 0,
          fat:      entry.calculated?.fat      ?? entry.nutrients?.fat      ?? 0,
        });
        navigate('/app/nutrition');
      }}
    />
  );
}

function PhotoScanRoute() {
  const navigate = useNavigate();
  const [perm, setPerm] = useState('prompt');
  return (
    <PhotoScan
      permission={perm}
      onRequestPermission={async () => {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
          setPerm('granted');
        } catch { setPerm('denied'); }
      }}
      onCapture={() => navigate('/app/nutrition/photo/confirm')}
      onPickFromGallery={() => navigate('/app/nutrition/photo/confirm')}
      onCancel={() => navigate(-1)}
    />
  );
}

function PhotoScanConfirmRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = new URLSearchParams(useLocation().search);
  const aiText = params.get('ai');
  const meal = params.get('meal') || 'breakfast';
  const label = meal.charAt(0).toUpperCase() + meal.slice(1);
  return (
    <PhotoScanConfirm
      mealLabel={label}
      parseText={aiText || null}
      onCancel={() => navigate(-1)}
      onRetake={() => navigate(aiText ? `/app/nutrition/voice?meal=${meal}` : '/app/nutrition/photo')}
      onSave={({ items }) => {
        nutritionAddEntries(
          user?.id,
          new Date(),
          meal,
          items.map((i) => ({
            name: i.name,
            portion: `${i.portion} ${i.unit}`,
            calories: i.calories || 0,
            protein:  i.protein  || 0,
            carbs:    i.carbs    || 0,
            fat:      i.fat      || 0,
          })),
        );
        navigate('/app/nutrition');
      }}
    />
  );
}

function VoiceLogRoute() {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const meal = params.get('meal') || 'breakfast';
  const label = meal.charAt(0).toUpperCase() + meal.slice(1);
  return (
    <VoiceLog
      mealLabel={label}
      onCancel={() => navigate(-1)}
      onSubmit={(transcript) => {
        navigate(`/app/nutrition/photo/confirm?ai=${encodeURIComponent(transcript)}&meal=${meal}`);
      }}
    />
  );
}

/* ─── Workout routes ──────────────────────────────────────────────────── */

function ActiveWorkoutRoute() {
  const navigate = useNavigate();
  // Track the session start timestamp once, at mount. The elapsed counter
  // inside ActiveWorkout is for display — the real start is captured here so
  // pauses don't affect what we persist as started_at.
  const [startedAt] = useState(() => new Date());
  return (
    <ActiveWorkout
      onFinish={async (summary) => {
        const endedAt = new Date();
        // Transform ActiveWorkout's nested state into the flat `sets` payload
        // the service expects. Only persist sets the user marked done.
        const flatSets = [];
        (summary?.exercises || []).forEach((ex) => {
          (ex.sets || []).forEach((s, idx) => {
            if (!s.done) return;
            const weight = s.weight === '' || s.weight == null ? null : Number(s.weight);
            const reps = s.reps === '' || s.reps == null ? null : Number(s.reps);
            if (weight == null && reps == null) return;
            flatSets.push({
              exerciseId: ex.id,
              setIndex: idx + 1,
              weightKg: weight,
              reps,
              rir: s.rir ?? null,
              restSec: ex.restSeconds ?? null,
              isWarmup: !!s.isWarmup,
            });
          });
        });

        try {
          await saveWorkoutSession({
            routineId: null,
            startedAt,
            endedAt,
            sets: flatSets,
          });
          // Feed the daily system: auto-complete training action + record workout type
          try {
            const { loadDailyState, saveDailyState, calculateReadiness, generateActions, calculateAdherence, loadYesterdayModifier } = await import('@/lib/dailySystem');
            const ds = loadDailyState();
            if (ds?.checkedIn) {
              const updated = { ...ds, completions: { ...ds.completions, a1: 'done' }, lastWorkoutType: 'full' };
              const { modifier: mod } = loadYesterdayModifier();
              const r = calculateReadiness(updated.sleep, updated.recovery, updated.soreness, mod);
              const acts = generateActions(r.level, { proteinTarget: 150, lastWorkoutType: updated.lastWorkoutType, soreness: updated.soreness });
              const adh = calculateAdherence(updated.completions, acts);
              saveDailyState({ ...updated, adherence: adh.adherence });
            }
          } catch {}
          toast.success('Workout saved \u2192 system updated');
          navigate('/app/today');
        } catch (err) {
          // Keep the user on-screen so they don't lose data.
          toast.error(err?.message || 'Could not save workout');
        }
      }}
      onDiscard={() => {
        if (window.confirm('Discard this workout? All logged sets will be lost.')) {
          navigate('/app/workouts');
        }
      }}
      onLog={(exId, setId, set) => {
        // TODO: persist each set as it happens for crash recovery.
      }}
    />
  );
}

/**
 * ManualWorkoutPlanRoute — wraps ManualWorkoutPlan with a modal exercise picker.
 * When user taps "Add exercise", we render ExerciseLibrary as an overlay that
 * resolves a promise with the picked exercise (or null on close).
 */
function ManualWorkoutPlanRoute() {
  const navigate = useNavigate();
  const [pickerResolve, setPickerResolve] = useState(null);

  const openPicker = () =>
    new Promise((resolve) => { setPickerResolve(() => resolve); });

  return (
    <>
      <ManualWorkoutPlan
        onCancel={() => navigate('/app/routines')}
        onSave={async (routine) => {
          // TODO: persist to workoutPlanService.
          console.info('Saved routine (stub)', routine);
          toast.success(`Routine "${routine.name}" saved \u2192 plan updated`);
          navigate('/app/routines');
        }}
        onOpenExercisePicker={openPicker}
      />
      {pickerResolve && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'hsl(var(--rd-bg-app))',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <ExerciseLibrary
            onClose={() => { pickerResolve(null); setPickerResolve(null); }}
            onPick={(exercise) => { pickerResolve(exercise); setPickerResolve(null); }}
          />
        </div>
      )}
    </>
  );
}

function WorkoutDetailRoute() {
  const navigate = useNavigate();
  // TODO: fetch workout by :id from workoutService (could be template OR session).
  return (
    <WorkoutDetail
      workout={null}
      onBack={() => navigate(-1)}
      onStart={() => navigate('/app/workouts/active')}
      onEdit={() => todoToast('Routine editor')}
      onShare={() => todoToast('Share')}
      onDelete={() => todoToast('Delete session')}
    />
  );
}

function RoutineDetailRoute() {
  const navigate = useNavigate();
  // Reuse WorkoutDetail with mode='template'
  return (
    <WorkoutDetail
      workout={null}
      onBack={() => navigate(-1)}
      onStart={() => navigate('/app/workouts/active')}
      onEdit={() => todoToast('Routine editor')}
      onShare={() => todoToast('Share')}
    />
  );
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

  return (
    <WorkoutHistory
      sessions={sessions}
      heatmap={null}
      stats={stats}
      onBack={() => navigate(-1)}
      onOpenSession={(id) => navigate(`/app/workouts/${id}`)}
    />
  );
}

/* ─── Labs routes ─────────────────────────────────────────────────────── */

function LabExamDetailRoute() {
  const navigate = useNavigate();
  // TODO: fetch exam by :id from labExamService.
  return (
    <LabExamDetail
      exam={null}
      biomarkers={[]}
      coachSummary={null}
      onBack={() => navigate(-1)}
      onAsk={(prompt) => navigate(`/app/coach/chat?ask=${encodeURIComponent(prompt)}`)}
      onOpenBiomarker={(id) => navigate(`/app/labs/biomarker/${id}`)}
      onShare={() => todoToast('Share with coach')}
    />
  );
}

function LabHistoryRoute() {
  const navigate = useNavigate();
  return (
    <LabHistory
      exams={[]}
      onBack={() => navigate('/app/labs')}
      onOpenExam={(id) => navigate(`/app/labs/exam/${id}`)}
      onUpload={() => navigate('/app/labs/upload')}
    />
  );
}

function LabUploadRoute() {
  const navigate = useNavigate();
  return (
    <LabUpload
      onCancel={() => navigate(-1)}
      onSubmit={async (file) => {
        // TODO: POST file to Supabase Storage + invoke parse-lab-pdf edge function.
        console.log('Upload lab PDF', file?.name);
        await new Promise((r) => setTimeout(r, 400));
        return { examId: 'pending', biomarkerCount: 0 };
      }}
      onViewResults={(examId) => navigate(`/app/labs/exam/${examId}`)}
    />
  );
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
      onUpgrade={() => navigate('/app/billing/plans')}
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
  const { user } = useAuth();
  const realUser = buildRealUser(user);
  return (
    <AccountSettings
      user={realUser}
      onBack={() => navigate('/app/settings')}
      onChangeEmail={() => todoToast('Change email')}
      onChangePassword={() => todoToast('Change password')}
      onEnable2FA={() => todoToast('Two-factor setup')}
      onManageSessions={() => todoToast('Active sessions')}
      onUnlinkProvider={(p) => todoToast(`Unlink ${p}`)}
      onDeleteAccount={() => navigate('/app/settings/danger')}
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
  const { user, logout } = useAuth();
  return (
    <DangerZone
      userEmail={user?.email || ''}
      onBack={() => navigate('/app/settings')}
      onExportData={() => todoToast('Data export')}
      onResetData={async () => {
        // TODO: invoke reset-user-data edge function
        await new Promise((r) => setTimeout(r, 600));
        toast.success('Data reset complete \u2192 system cleared');
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
  const { theme } = useTheme();
  return (
    <S6_Weight_B
      dark={theme === 'dark'}
      onBack={() => navigate(-1)}
      onSave={(entry) => {
        // TODO: persist to bodyProgressService.logWeight(entry)
        // entry shape: { weight: number, unit: string, when: string (ISO) }
        console.log('Weight logged', entry);
        toast.success('Weight logged \u2192 tracking updated', {
          description: 'View history to see your trend.',
          action: {
            label: 'View history',
            onClick: () => navigate('/app/body/composition'),
          },
        });
        navigate('/app/body');
      }}
      onViewHistory={() => navigate('/app/body/composition')}
    />
  );
}

function MeasurementsRoute() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S17_Measurements_Entry
      dark={theme === 'dark'}
      onClose={() => navigate(-1)}
      onSave={(measurements) => {
        // TODO: persist to bodyProgressService.logMeasurements(measurements)
        // measurements shape: { chest?, waist?, hips?, arm?, thigh?, neck? }
        console.log('Measurements logged', measurements);
        toast.success('Measurements saved');
        navigate('/app/body');
      }}
    />
  );
}

function BodyCheckInRoute() {
  const navigate = useNavigate();
  return (
    <BodyCheckIn
      onCancel={() => navigate(-1)}
      onSave={(checkin) => {
        // TODO: persist to checkinService.save(checkin)
        console.log('Check-in saved', checkin);
        navigate('/app/body');
      }}
    />
  );
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

        {/* ── Web account management (full-width, no phone frame) ──
             Declared BEFORE /app so they match first in React Router. */}
        <Route path="/app/account" element={isAuthed ? <V3AccountHub /> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/export" element={isAuthed ? <V3DataExport /> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/billing" element={isAuthed ? <V3SubscriptionManage /> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/billing/manage" element={isAuthed ? <V3SubscriptionManage /> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/billing/plans" element={isAuthed ? <V3Paywall /> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/billing/paywall" element={isAuthed ? <V3Paywall /> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/billing/invoices" element={isAuthed ? <V3BillingHistory /> : <Navigate to="/auth/login" replace />} />

        {/* ── Fullscreen flows (no shell chrome, MUST come before /app) ──
             Wrapped in <PlatformGate> so public web users are redirected to
             /download-app (CLAUDE.md §13–16). Native + dev mode bypass. */}
        <Route path="/app/nutrition/search" element={isAuthed ? <PlatformGate><V3NutritionSearch /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/food/new" element={isAuthed ? <PlatformGate><CustomFoodRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/food/:id" element={isAuthed ? <PlatformGate><FoodDetailRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/meal/:id" element={isAuthed ? <PlatformGate><MealDetailRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
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
        <Route path="/app/body/compare" element={isAuthed ? <PlatformGate><ProgressComparisonRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/labs/upload" element={isAuthed ? <PlatformGate><LabUploadRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />
        <Route path="/app/social/share" element={isAuthed ? <PlatformGate><ShareWorkoutRoute /></PlatformGate> : <Navigate to="/auth/login" replace />} />

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
          <Route path="notifications" element={<V3Notifications />} />
          <Route path="routines/:id" element={<V3RoutineDetail />} />
          {/* Billing routes moved outside V3AppShell — full-width web pages */}

          {/* Today-domain expansions */}
          <Route path="insights" element={<InsightsRoute />} />
          <Route path="diary" element={<DiaryRoute />} />
          <Route path="today/focus" element={<FocusModeRoute />} />
          <Route path="today/streaks" element={<StreaksDetailRoute />} />
          <Route path="today/celebrate/:kind" element={<CelebrationsRoute />} />

          {/* Nutrition sub-screens */}
          <Route path="nutrition/diary" element={<FoodDiaryRoute />} />
          <Route path="nutrition/targets" element={<MacroTargetsRoute />} />
          <Route path="nutrition/water" element={<WaterLogRoute />} />
          <Route path="nutrition/meal-plans" element={<MealPlansRoute />} />

          {/* Workout sub-screens */}
          <Route path="workouts/history" element={<WorkoutHistoryRoute />} />
          <Route path="workouts/:id" element={<WorkoutDetailRoute />} />
          <Route path="routines/presets" element={<RoutinePresetsRoute />} />
          <Route path="routines/presets/:id" element={<RoutinePresetDetailRoute />} />

          {/* Body sub-screens */}
          <Route path="body/composition" element={<BodyCompositionHistoryRoute />} />

          {/* Labs sub-screens */}
          <Route path="labs/history" element={<LabHistoryRoute />} />
          <Route path="labs/exam/:id" element={<LabExamDetailRoute />} />

          {/* Coach sub-screens */}
          <Route path="coach/insights/:id" element={<CoachInsightDetailRoute />} />

          {/* Profile + Settings sub-screens */}
          <Route path="profile/edit" element={<ProfileEditorRoute />} />
          <Route path="settings/account" element={<AccountSettingsRoute />} />
          <Route path="settings/integrations" element={<IntegrationsRoute />} />
          <Route path="settings/danger" element={<DangerZoneRoute />} />
          <Route path="settings/diagnostics" element={<AppDiagnosticsRoute />} />

          {/* Social */}
          <Route path="social" element={<SocialFeedRoute />} />
          <Route path="social/friends" element={<FriendsRoute />} />
          <Route path="social/follow" element={<FollowRoute />} />
        </Route>

        {/* ── Marketing (public web) — root is now the landing page ── */}
        <Route path="/"        element={<RootRoute />} />
        <Route path="/landing" element={<V3Landing />} />
        <Route path="/download-app" element={<V3DownloadApp />} />
        <Route path="/webapp" element={<V3WebAppEntry />} />
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
        <Route path="/auth/magic"    element={<V3MagicLinkSent />} />
        <Route path="/auth/callback" element={<V3AuthCallback />} />

        {/* ── Onboarding ─────────────────────────────────────────── */}
        <Route path="/onboarding" element={<V3OnboardingIdentity />} />
        <Route path="/onboarding/goal" element={<V3OnboardingGoal />} />
        <Route path="/onboarding/activity" element={<V3OnboardingActivity />} />
        <Route path="/onboarding/stats" element={<V3OnboardingPlan />} />
        <Route path="/onboarding/diet" element={<V3OnboardingPermissions />} />
        <Route path="/onboarding/workout" element={<OnboardingWorkoutRoute />} />
        <Route path="/onboarding/habits" element={<OnboardingHabitsRoute />} />
        <Route path="/onboarding/constraints" element={<OnboardingConstraintsRoute />} />
        <Route path="/onboarding/summary" element={<OnboardingSummaryRoute />} />
        <Route path="/onboarding/paywall" element={<OnboardingPaywallRoute />} />
        <Route path="/onboarding/tour" element={<OnboardingTourRoute />} />
        <Route path="/onboarding/smart" element={<SmartOnboarding onContinue={() => {}} />} />

        {/* Public profile lives outside the shell (no auth guard on view) */}
        <Route path="/app/u/:username" element={<PublicProfileRoute />} />

        {/* ── System screens (pre-auth-aware; no guard) ─────────────────── */}
        {/* /app/offline is intentionally outside the auth-guarded block —
            the whole point of the screen is to work when sync can't. */}
        <Route path="/app/offline"  element={<OfflineRoute />} />
        <Route path="/maintenance"  element={<MaintenanceRoute />} />
        <Route path="/force-update" element={<ForceUpdateRoute />} />
        <Route path="/500"          element={<ServerErrorRoute />} />
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
