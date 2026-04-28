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

import React, { lazy, Suspense, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { DailyStoreProvider } from '@/store/dailyStore';
import { ThemeProvider } from '@/lib/ThemeContext';
import { SubscriptionProvider } from '@/lib/SubscriptionContext';
import { I18nProvider, useT } from '@/lib/i18nContext';
import { GoogleReCaptchaProvider } from '@/lib/ReCaptchaContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabaseClient';
import { Browser } from '@capacitor/browser';
import ErrorBoundary from '@/components/ErrorBoundary';
import { trackPageView, initAnalytics } from '@/lib/analytics';
import { LEGACY_ROUTE_REDIRECTS } from '@/lib/routes';

const lazyOnboardingRoute = (name) =>
  lazy(() =>
    import('@/redesign/v3/routes/V3OnboardingRoutes.jsx').then((module) => ({
      default: module[name],
    }))
  );

// v3 screens and routes only — v2 design imports removed to ensure v3-first build.
const V3RoutinePresets = lazy(() => import('@/redesign/v3/routes/V3RoutinePresets.jsx'));
const V3RoutinePresetDetail = lazy(() => import('@/redesign/v3/routes/V3RoutinePresetDetail.jsx'));
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
const V3OnboardingIdentity = lazyOnboardingRoute('V3OnboardingIdentity');
const V3OnboardingDietPreferences = lazyOnboardingRoute('V3OnboardingDietPreferences');
const V3OnboardingGoal = lazyOnboardingRoute('V3OnboardingGoal');
const V3OnboardingActivity = lazyOnboardingRoute('V3OnboardingActivity');
const V3OnboardingPlan = lazyOnboardingRoute('V3OnboardingPlan');
const V3OnboardingPermissions = lazyOnboardingRoute('V3OnboardingPermissions');
const V3OnboardingWorkout = lazyOnboardingRoute('V3OnboardingWorkout');
const V3OnboardingHabits = lazyOnboardingRoute('V3OnboardingHabits');
const V3OnboardingConstraints = lazyOnboardingRoute('V3OnboardingConstraints');
const V3OnboardingSummary = lazyOnboardingRoute('V3OnboardingSummary');
const V3OnboardingCoachMatch = lazyOnboardingRoute('V3OnboardingCoachMatch');
const V3OnboardingTour = lazyOnboardingRoute('V3OnboardingTour');
const V3LabExamDetail = lazy(() => import('@/redesign/v3/routes/V3LabExamDetail.jsx'));
const V3LabHistory = lazy(() => import('@/redesign/v3/routes/V3LabHistory.jsx'));
const V3LabUpload = lazy(() => import('@/redesign/v3/routes/V3LabUpload.jsx'));
const SmartOnboarding = lazy(() => import('@/components/onboarding/SmartOnboarding.jsx'));
const WeightEntryRoute = lazy(() => import('@/routes/app/WeightEntryRoute.jsx'));
const MeasurementsRoute = lazy(() => import('@/routes/app/MeasurementsRoute.jsx'));
const BodyCheckInRoute = lazy(() => import('@/routes/app/BodyCheckInRoute.jsx'));

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

/**
 * NativeRootRedirect — on native (Capacitor), redirect / to the app.
 * On web, show the marketing landing page.
 */
function RootRoute() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.onboarding_completed ? '/app/today' : '/onboarding'} replace />;
  }
  if (Capacitor.isNativePlatform()) {
    return <Navigate to="/welcome" replace />;
  }
  return <V3Landing />;
}

// ─── Route table ─────────────────────────────────────────────────────────────
function AppRoutes() {
  usePageViewTracking();
  const { user, isLoadingAuth } = useAuth();
  usePushNotifications();

  if (isLoadingAuth) {
    return <V3LoadingSplash phase="boot" />;
  }

  const isAuthed = !!user;
  const hasCompletedOnboarding = !!user?.onboarding_completed;
  const postAuthRoute = hasCompletedOnboarding ? '/app/today' : '/onboarding';

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
        <Route path="/webapp" element={isAuthed ? <Navigate to={postAuthRoute} replace /> : <V3WebAppEntry />} />
        <Route path="/webapp/account" element={isAuthed ? (hasCompletedOnboarding ? <V3AccountHub /> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/export" element={isAuthed ? (hasCompletedOnboarding ? <V3DataExport /> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/billing" element={isAuthed ? (hasCompletedOnboarding ? <V3SubscriptionManage /> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/billing/manage" element={isAuthed ? (hasCompletedOnboarding ? <V3SubscriptionManage /> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/billing/plans" element={isAuthed ? (hasCompletedOnboarding ? <V3Paywall /> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/billing/paywall" element={isAuthed ? (hasCompletedOnboarding ? <V3Paywall /> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/billing/invoices" element={isAuthed ? (hasCompletedOnboarding ? <V3BillingHistory /> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/settings" element={isAuthed ? (hasCompletedOnboarding ? <V3AccountSettings /> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/settings/danger" element={isAuthed ? (hasCompletedOnboarding ? <V3DangerZone /> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/webapp/settings/diagnostics" element={isAuthed ? (hasCompletedOnboarding ? <V3Diagnostics /> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />

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
        <Route path="/app/nutrition/search" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3NutritionSearch /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/food/new" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3FoodDetail /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/food/:id" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3FoodDetail /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/meal/:id" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3MealDetail /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/photo" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3Capture /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/photo/confirm" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3Capture /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/nutrition/voice" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3Capture /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/workouts/active" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3ActiveWorkout /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/workouts/manual-plan" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3RoutinePresets /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/exercises" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3ExerciseLibrary /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/exercises/:id" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3ExerciseDetail /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/coach/chat" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3CoachChat /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/body/weight" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><WeightEntryRoute /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/body/checkin" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><BodyCheckInRoute /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/body/measurements" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><MeasurementsRoute /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/body/compare" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3Body /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/labs/upload" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3LabUpload /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />
        <Route path="/app/social/share" element={isAuthed ? (hasCompletedOnboarding ? <PlatformGate><V3SharePR /></PlatformGate> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />} />

        {/* ── v3 live app core (mounted on the real athlete routes) ───── */}
        <Route
          path="/app"
          element={isAuthed ? (hasCompletedOnboarding ? <V3AppShell /> : <Navigate to="/onboarding" replace />) : <Navigate to="/auth/login" replace />}
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
        </Route>

        {/* ── Marketing (public web) — root is now the landing page ── */}
        <Route path="/"        element={<RootRoute />} />
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="/download-app" element={<V3DownloadApp />} />
        <Route path="/webapp/success" element={<V3WebPurchaseSuccess />} />
        <Route path="/the-app" element={<Navigate to="/#what-it-does" replace />} />
        <Route path="/method"  element={<V3MethodPage />} />
        <Route path="/labs"    element={<Navigate to="/science" replace />} />
        <Route path="/science" element={<V3LabsPage />} />
        <Route path="/pricing" element={<V3PricingPage />} />
        <Route path="/terms"   element={<V3Terms />} />
        <Route path="/privacy" element={<V3Privacy />} />
        <Route path="/faq"     element={<V3PricingPage />} />

        {/* ── Welcome (auth-flow entry, kept for the mobile app) ────── */}
        <Route path="/welcome" element={isAuthed ? <Navigate to={postAuthRoute} replace /> : <V3Welcome />} />
        <Route path="/welcome/manifesto" element={isAuthed ? <Navigate to={postAuthRoute} replace /> : <V3Manifesto />} />

        {/* ── Auth ────────────────────────────────────────────────── */}
        <Route path="/auth"          element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login"    element={isAuthed ? <Navigate to={postAuthRoute} replace /> : <V3AuthLogin />} />
        <Route path="/auth/signup"   element={isAuthed ? <Navigate to={postAuthRoute} replace /> : <V3AuthSignup />} />
        <Route path="/auth/forgot"   element={isAuthed ? <Navigate to={postAuthRoute} replace /> : <V3ForgotPassword />} />
        <Route path="/auth/reset"    element={<V3ResetPassword />} />
        <Route path="/auth/update-password" element={<Navigate to="/auth/reset" replace />} />
        <Route path="/auth/magic"    element={isAuthed ? <Navigate to={postAuthRoute} replace /> : <V3MagicLinkSent />} />
        <Route path="/auth/callback" element={<V3AuthCallback />} />

        {/* ── Onboarding ─────────────────────────────────────────── */}
        <Route path="/onboarding" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <V3OnboardingIdentity />) : <Navigate to="/auth/signup" replace />} />
        <Route path="/onboarding/nutrition" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <V3OnboardingDietPreferences />) : <Navigate to="/auth/signup" replace />} />
        <Route path="/onboarding/goal" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <V3OnboardingGoal />) : <Navigate to="/auth/signup" replace />} />
        <Route path="/onboarding/activity" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <V3OnboardingActivity />) : <Navigate to="/auth/signup" replace />} />
        <Route path="/onboarding/stats" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <V3OnboardingPlan />) : <Navigate to="/auth/signup" replace />} />
        <Route path="/onboarding/diet" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <V3OnboardingPermissions />) : <Navigate to="/auth/signup" replace />} />
        <Route path="/onboarding/workout" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <V3OnboardingWorkout />) : <Navigate to="/auth/signup" replace />} />
        <Route path="/onboarding/habits" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <V3OnboardingHabits />) : <Navigate to="/auth/signup" replace />} />
        <Route path="/onboarding/constraints" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <V3OnboardingConstraints />) : <Navigate to="/auth/signup" replace />} />
        <Route path="/onboarding/summary" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <V3OnboardingSummary />) : <Navigate to="/auth/signup" replace />} />
        <Route path="/onboarding/coach-match" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <V3OnboardingCoachMatch />) : <Navigate to="/auth/signup" replace />} />
        <Route path="/onboarding/paywall" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <Navigate to="/onboarding/tour" replace />) : <Navigate to="/auth/signup" replace />} />
        <Route path="/onboarding/tour" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <V3OnboardingTour />) : <Navigate to="/auth/signup" replace />} />
        <Route path="/onboarding/smart" element={isAuthed ? (hasCompletedOnboarding ? <Navigate to="/app/today" replace /> : <SmartOnboarding onContinue={() => {}} />) : <Navigate to="/auth/signup" replace />} />

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
  const shouldRenderVercelTelemetry =
    !Capacitor.isNativePlatform()
    && typeof window !== 'undefined'
    && !['localhost', '127.0.0.1'].includes(window.location.hostname);

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
    let disposed = false;

    import('@capacitor/app')
      .then(({ App }) => App.addListener('appUrlOpen', async ({ url }) => {
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
      }))
      .then((handle) => {
        if (disposed) {
          handle.remove();
          return;
        }
        listener = handle;
      })
      .catch(() => null);

    return () => {
      disposed = true;
      listener?.remove();
    };
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
                  {shouldRenderVercelTelemetry && <Analytics />}
                  {shouldRenderVercelTelemetry && <SpeedInsights />}
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
