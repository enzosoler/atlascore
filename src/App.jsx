import React, { lazy, Suspense, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster as Sonner } from '@/components/ui/sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { DailyStoreProvider } from '@/store/dailyStore';
import { ThemeProvider } from '@/lib/ThemeContext';
import { SubscriptionProvider } from '@/lib/SubscriptionContext';
import { I18nProvider, useT } from '@/lib/i18nContext';
import { GoogleReCaptchaProvider } from '@/lib/ReCaptchaContext';
import { LEGACY_ROUTE_REDIRECTS, ROUTES, ROLE_HOME } from '@/lib/routes';
import { shouldMountProRoutes } from '@/lib/privateBeta';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { useReferralTracking, captureReferralParams } from '@/hooks/useReferralTracking';
import { initAnalytics, trackPageView, identifyUser as identifyAnalyticsUser, resetAnalyticsUser } from '@/lib/analytics';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabaseClient';
import { initRevenueCat, identifyUser, logOutRevenueCat } from '@/lib/revenueCat';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { SplashScreen as CapSplash } from '@capacitor/splash-screen';
import AppLayout from '@/components/layout/AppLayout.jsx';
import AppBootstrap from '@/components/app/AppBootstrap';
import RouteGuard from '@/components/rbac/RouteGuard';
import { WebOnlyRoute } from '@/components/routing/WebOnlyRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import EntitlementGate from '@/components/EntitlementGate';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { AuthGateProvider } from '@/hooks/useAuthGate';
import { hasSeenWelcome } from '@/pages/WelcomeOnboarding';

// ─── Analytics: track page views on every route change ───────────────────────
function usePageViewTracking() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
}

// ─── Lazy Pages ──────────────────────────────────────────────────────────────
const Landing = lazy(() => import('@/pages/Landing.jsx'));
const WelcomeOnboarding = lazy(() => import('@/pages/WelcomeOnboarding'));
const DemoHome = lazy(() => import('@/pages/DemoHome'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const OnboardingV2 = lazy(() => import('@/pages/OnboardingV2'));
const Today = lazy(() => import('@/pages/TodayV2'));
const Nutrition = lazy(() => import('@/pages/Nutrition'));
const WorkoutsV2 = lazy(() => import('@/pages/TrainV2'));
const Routines = lazy(() => import('@/pages/Routines'));
const Protocols = lazy(() => import('@/pages/Protocols'));
const ProtocolDetail = lazy(() => import('@/pages/ProtocolDetail'));
const ProtocolFormPage = lazy(() => import('@/pages/ProtocolFormPage'));
const Measurements = lazy(() => import('@/pages/Measurements'));
const LabExams = lazy(() => import('@/pages/LabExams'));
const Profile = lazy(() => import('@/pages/Profile'));
const Goals = lazy(() => import('@/pages/Goals'));
const BodyProfile = lazy(() => import('@/pages/BodyProfile'));
const ProfileEdit = lazy(() => import('@/pages/ProfileEdit'));
const Account = lazy(() => import('@/pages/Account'));
const NotificationSettings = lazy(() => import('@/pages/NotificationSettings'));
const Export = lazy(() => import('@/pages/Export'));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminUserProfile = lazy(() => import('@/pages/admin/AdminUserProfile'));
const AdminAISystem = lazy(() => import('@/pages/admin/AdminAISystem'));
const AdminLogs = lazy(() => import('@/pages/admin/AdminLogs'));
const AdminSubscriptions = lazy(() => import('@/pages/admin/AdminSubscriptions'));
const AdminRoles = lazy(() => import('@/pages/admin/AdminRoles'));
const AdminInvites = lazy(() => import('@/pages/admin/AdminInvites'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const ModerationConsole = lazy(() => import('@/pages/admin/ModerationConsole'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminWaitlist = lazy(() => import('@/pages/admin/AdminWaitlist'));
const AdminInfluencers = lazy(() => import('@/pages/admin/AdminInfluencers'));
const AdminImpersonation = lazy(() => import('@/pages/admin/AdminImpersonation'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const MyDiet = lazy(() => import('@/pages/MyDiet'));
const MyWorkout = lazy(() => import('@/pages/MyWorkout'));
const ManualWorkoutPlan = lazy(() => import('@/pages/ManualWorkoutPlan'));
const Diary = lazy(() => import('@/pages/Diary'));
const ProgressPhotos = lazy(() => import('@/pages/ProgressPhotos'));
const Social = lazy(() => import('@/pages/Social'));
const MyPrescribedDiet = lazy(() => import('@/pages/MyPrescribedDiet'));
const Pricing = lazy(() => import('@/pages/Pricing.jsx'));
const InviteAccept = lazy(() => import('@/pages/InviteAccept'));
const MyPrescribedWorkout = lazy(() => import('@/pages/MyPrescribedWorkout'));
const CoachDashboard = lazy(() => import('@/pages/coach/CoachDashboard'));
const CoachStudents = lazy(() => import('@/pages/coach/CoachStudents'));
const CoachStudentProfile = lazy(() => import('@/pages/coach/CoachStudentProfile'));
const CoachPrescribeWorkout = lazy(() => import('@/pages/coach/CoachPrescribeWorkout'));
const ClinicianDashboard = lazy(() => import('@/pages/clinician/ClinicianDashboard'));
const ClinicianPatients = lazy(() => import('@/pages/clinician/ClinicianPatients'));
const ClinicianPatientProfile = lazy(() => import('@/pages/clinician/ClinicianPatientProfile'));
const NutritionistDashboard = lazy(() => import('@/pages/nutritionist/NutritionistDashboard.jsx'));
const NutritionistClients = lazy(() => import('@/pages/nutritionist/NutritionistClients.jsx'));
const NutritionistClientProfile = lazy(() => import('@/pages/nutritionist/NutritionistClientProfile.jsx'));
const NutritionistPrescribeDiet = lazy(() => import('@/pages/nutritionist/NutritionistPrescribeDiet'));
const SmartOnboarding = lazy(() => import('@/components/onboarding/SmartOnboarding'));
const DecisionEngineDashboard = lazy(() => import('@/components/dashboard/DecisionEngineDashboard'));
const ShareableProofCards = lazy(() => import('@/components/social/ShareableProofCards'));
const CreatorDashboard = lazy(() => import('@/components/affiliate/CreatorDashboard'));
const StartFreshModal = lazy(() => import('@/components/system/StartFreshModal'));
const NutritionModeSelector = lazy(() => import('@/components/nutrition/NutritionModeSelector'));
const MilestoneSystem = lazy(() => import('@/components/system/MilestoneSystem'));
const Auth = lazy(() => import('@/pages/Auth.jsx'));
const Insights = lazy(() => import('@/pages/Insights'));
const BlockReview = lazy(() => import('@/pages/BlockReview'));
const Exercises = lazy(() => import('@/pages/Exercises'));
const ExerciseDetail = lazy(() => import('@/pages/ExerciseDetail'));
const Progress = lazy(() => import('@/pages/Progress'));
const Plan = lazy(() => import('@/pages/Plan'));
const Body = lazy(() => import('@/pages/Body'));
const NewCheckpointPage = lazy(() => import('@/pages/body/NewCheckpointPage'));
const HelpCenter = lazy(() => import('@/pages/HelpCenter.jsx'));
const UseCase = lazy(() => import('@/pages/UseCase'));
const GettingStartedGuide = lazy(() => import('@/pages/guides/GettingStartedGuide'));
const WorkoutLoggingGuide = lazy(() => import('@/pages/guides/WorkoutLoggingGuide'));
const PlanVsExecutionGuide = lazy(() => import('@/pages/guides/PlanVsExecutionGuide'));
const AIWorkoutGenerationGuide = lazy(() => import('@/pages/guides/AIWorkoutGenerationGuide'));
const AIPlanBuildingGuide = lazy(() => import('@/pages/guides/AIPlanBuildingGuide'));
const AdjustingPlansGuide = lazy(() => import('@/pages/guides/AdjustingPlansGuide'));
const AIVsManualGuide = lazy(() => import('@/pages/guides/AIVsManualGuide'));
const ProgressPhotosGuide = lazy(() => import('@/pages/guides/ProgressPhotosGuide'));
const ExportReportsGuide = lazy(() => import('@/pages/guides/ExportReportsGuide'));
const NutritionTrackingGuide = lazy(() => import('@/pages/guides/NutritionTrackingGuide'));
const MobileWorkoutsGuide = lazy(() => import('@/pages/guides/MobileWorkoutsGuide'));
const AccountSettingsGuide = lazy(() => import('@/pages/guides/AccountSettingsGuide'));
const CoachManagementGuide = lazy(() => import('@/pages/guides/CoachManagementGuide'));
const BlogIndex = lazy(() => import('@/pages/blog/BlogIndex.jsx'));
const BlogPost = lazy(() => import('@/pages/blog/BlogPost.jsx'));
const Settings = lazy(() => import('@/pages/Settings.jsx'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const UpdatePassword = lazy(() => import('@/pages/UpdatePassword'));
const PageNotFound = lazy(() => import('./lib/PageNotFound'));

// Entry & Onboarding Screens
const SplashScreen = lazy(() => import('@/pages/SplashScreen'));

// Dev-only: Design System Styleguide
const StyleguidePage = import.meta.env.DEV ? lazy(() => import('@/pages/styleguide/StyleguidePage')) : null;

// Monetization Screens
const UpgradePrompts = lazy(() => import('@/pages/UpgradePrompts'));
const BillingManagement = lazy(() => import('@/pages/BillingManagement'));
const RestorePurchases = lazy(() => import('@/pages/RestorePurchases'));
const TrialStart = lazy(() => import('@/pages/TrialStart'));
const TrialExplanation = lazy(() => import('@/pages/TrialExplanation'));
const DiscountScreen = lazy(() => import('@/pages/DiscountScreen'));

// Core App Shell Screens
const NotificationsScreen = lazy(() => import('@/pages/NotificationsScreen'));
const ActivityScreen = lazy(() => import('@/pages/ActivityScreen'));
const ExploreScreen = lazy(() => import('@/pages/ExploreScreen'));
const CreateAction = lazy(() => import('@/pages/CreateAction'));

// Core Functional Screens
const FeedList = lazy(() => import('@/pages/FeedList'));
const DetailView = lazy(() => import('@/pages/DetailView'));
const CreationFlow = lazy(() => import('@/pages/CreationFlow'));
const SearchResults = lazy(() => import('@/pages/SearchResults'));

// Engagement Screens
const SavedFavorites = lazy(() => import('@/pages/SavedFavorites'));
const MessagesChat = lazy(() => import('@/pages/MessagesChat'));
const StreaksMilestones = lazy(() => import('@/pages/StreaksMilestones'));

// Profile Extension Screens
const UserContent = lazy(() => import('@/pages/UserContent'));
const AccountStatus = lazy(() => import('@/pages/AccountStatus'));
const SubscriptionTier = lazy(() => import('@/pages/SubscriptionTier'));
const ConnectedServices = lazy(() => import('@/pages/ConnectedServices'));

// Settings Extension Screens
const PrivacyScreen = lazy(() => import('@/pages/PrivacyScreen'));
const ThemeScreen = lazy(() => import('@/pages/ThemeScreen'));
const LanguageScreen = lazy(() => import('@/pages/LanguageScreen'));
const DataExport = lazy(() => import('@/pages/DataExport'));
const DeleteAccount = lazy(() => import('@/pages/DeleteAccount'));

// Support Screens
const ContactSupport = lazy(() => import('@/pages/ContactSupport'));
const TermsPrivacy = lazy(() => import('@/pages/TermsPrivacy'));
const ReportProblem = lazy(() => import('@/pages/ReportProblem'));
const ManageConsent = lazy(() => import('@/pages/ManageConsent'));

// Nice-to-have Screens
const Referral = lazy(() => import('@/pages/Referral'));
const Achievements = lazy(() => import('@/pages/Achievements'));
const Tutorial = lazy(() => import('@/pages/Tutorial'));
const Changelog = lazy(() => import('@/pages/Changelog'));
const RateApp = lazy(() => import('@/pages/RateApp'));
const Calendar = lazy(() => import('@/pages/Calendar'));
const Leaderboard = lazy(() => import('@/pages/Leaderboard'));
const Integrations = lazy(() => import('@/pages/Integrations'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Waitlist = lazy(() => import('@/pages/Waitlist'));
const Reactivation = lazy(() => import('@/pages/Reactivation'));
const StoryLanding = lazy(() => import('@/pages/StoryLanding'));
const ShareTarget = lazy(() => import('@/pages/ShareTarget'));
const SharedWorkout = lazy(() => import('@/pages/SharedWorkout'));

// ─── Shared Spinner ──────────────────────────────────────────────────────────
const FullScreenSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[hsl(var(--bg))]">
    <div className="w-8 h-8 border-[3px] border-[hsl(var(--border))] border-t-[hsl(var(--primary))] rounded-full animate-spin"></div>
  </div>
);

const MissingConfigScreen = () => (
  <div className="min-h-screen bg-[hsl(var(--bg))] flex items-center justify-center p-6">
    <div className="max-w-xl w-full rounded-2xl border border-[hsl(var(--border-h))] bg-[hsl(var(--card))] p-6 space-y-4">
      <div>
        <p className="text-[20px] font-semibold text-[hsl(var(--fg))]">Configuration missing</p>
        <p className="mt-2 text-[14px] text-[hsl(var(--fg-2))]">
          The authenticated app depends on environment variables to connect to the backend.
          Without them, authentication, queries, and internal routes cannot load.
        </p>
      </div>

      <div className="rounded-xl bg-[hsl(var(--shell))] p-4 text-[13px] text-[hsl(var(--fg))]">
        <p className="font-medium mb-2">Create a <code>.env.local</code> file at the project root with the required variables.</p>
      </div>

      <p className="text-[13px] text-[hsl(var(--fg-2))]">
        A template already exists in <code>.env.example</code>. After filling it in, restart <code>npm run dev</code>.
      </p>
    </div>
  </div>
);

const ProfileFetchErrorScreen = () => {
  const { revalidateSession, logout } = useAuth();
  const [retrying, setRetrying] = React.useState(false);

  const t = useT();

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await revalidateSession();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--accent-primary)/0.08),transparent_30%),linear-gradient(180deg,hsl(var(--sys-bg))_0%,hsl(var(--sys-bg2))_100%)] px-4 py-12">
      <div className="w-full max-w-md rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-8 shadow-[var(--shadow-md)]">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-[hsl(var(--warn)/0.18)] bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mt-4 mb-2 text-2xl font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">{t('auth.profileError.title')}</h1>
          <p className="mb-6 text-[15px] text-[hsl(var(--fg-2))]">{t('auth.profileError.message')}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="w-full rounded-[14px] bg-[hsl(var(--primary))] px-5 py-3 text-[15px] font-semibold text-[hsl(var(--primary-fg))] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {retrying ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {t('auth.profileError.tryAgain')}
                </span>
              ) : t('auth.profileError.tryAgain')}
            </button>
            <button
              onClick={logout}
              className="w-full rounded-[14px] border border-[hsl(var(--border))] bg-transparent px-5 py-3 text-[15px] font-medium text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--fill)/0.5)]"
            >
              {t('auth.profileError.signOut')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RequireAuthenticatedApp = () => {
  const { authError, isAuthenticated, authState, user } = useAuth();
  const location = useLocation();

  if (authState === 'loading') {
    return <AppBootstrap />;
  }

  if (authError?.type === 'user_not_registered') return <UserNotRegisteredError />;
  if (authError?.type === 'missing_config') return <MissingConfigScreen />;

  if (authState === 'error') return <ProfileFetchErrorScreen />;

  if (!isAuthenticated) {
    // New users → onboarding V2 (public, no auth needed)
    // On native: route to onboarding flow directly
    // On web: for deep-linked protected routes, redirect to auth; otherwise onboarding
    if (Capacitor.isNativePlatform()) {
      return <Navigate to="/onboarding" replace />;
    }
    // If the user is trying to access a specific deep link, send to auth with redirect
    const isDeepLink = location.pathname !== '/' && location.pathname !== ROUTES.today;
    if (isDeepLink) {
      const nextUrl = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
      return <Navigate to={`/auth?mode=login&next=${encodeURIComponent(nextUrl)}`} replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  // Onboarding Guard: Single source of truth is profiles.onboarding_completed.
  // We sync local storage to match DB state to prevent inconsistencies.
  const isOnboardingRoute = location.pathname === ROUTES.onboarding || location.pathname === '/onboarding';
  const dbOnboarded = user?.onboarding_completed === true;
  const localOnboardingDone = localStorage.getItem(`onboarding_done_${user?.id}`) === 'true';
  
  // Sync local storage with database state
  if (dbOnboarded && !localOnboardingDone && user?.id) {
    localStorage.setItem(`onboarding_done_${user.id}`, 'true');
  } else if (!dbOnboarded && localOnboardingDone && user?.id) {
    localStorage.removeItem(`onboarding_done_${user.id}`);
  }
  
  const isActuallyOnboarded = dbOnboarded; // Database is source of truth

  console.log('[AuthGuard]', { path: location.pathname, dbOnboarded, localOnboardingDone, result: isActuallyOnboarded });
  if (!isActuallyOnboarded && !isOnboardingRoute) {
    console.log('[AuthGuard] Redirecting to onboarding:', { userId: user?.id, route: location.pathname });
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  if (isActuallyOnboarded && isOnboardingRoute) {
    console.log('[AuthGuard] Onboarding complete, moving to app');
    return <Navigate to={ROLE_HOME[user?.atlas_role] || ROUTES.today} replace />;
  }

  // Admin Auto-Redirect (Web only) — only when pro routes are enabled
  if (shouldMountProRoutes()) {
    const isAdmin = user?.atlas_role === 'admin';
    const isAdminRoute = location.pathname.startsWith('/AdminPanel');
    const skipAdmin = new URLSearchParams(location.search).get('skip_admin') === '1';
    if (isAdmin && !isAdminRoute && !skipAdmin && !Capacitor.isNativePlatform()) {
      return <Navigate to={ROUTES.admin} replace />;
    }
  }

  return <Outlet />;
};

const AppRoutes = () => (
  <Suspense fallback={<FullScreenSpinner />}>
    <Routes>
      {/* Web-only: marketing & content */}
      <Route path={ROUTES.home} element={<WebOnlyRoute><Landing /></WebOnlyRoute>} />
      <Route path={ROUTES.blog} element={<WebOnlyRoute fallback="/Today"><BlogIndex /></WebOnlyRoute>} />
      <Route path={`${ROUTES.blog}/:slug`} element={<WebOnlyRoute fallback="/Today"><BlogPost /></WebOnlyRoute>} />
      <Route path={ROUTES.pricing} element={<WebOnlyRoute fallback="/upgrade"><Pricing /></WebOnlyRoute>} />
      <Route path={ROUTES.help} element={<WebOnlyRoute fallback="/Today"><HelpCenter /></WebOnlyRoute>} />
      {/* Welcome & Demo (unauthenticated value-preview) */}
      <Route path={ROUTES.welcome} element={<WelcomeOnboarding />} />
      <Route path={ROUTES.demoHome} element={<DemoHome />} />

      {/* Shared auth */}
      <Route path={ROUTES.auth} element={<AuthRedesigned />} />
      <Route path={ROUTES.signup} element={<AuthRedesigned />} />
      <Route path={ROUTES.login} element={<AuthRedesigned />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/update-password" element={<UpdatePassword />} />

      {/* Entry & Onboarding */}
      <Route path="/onboarding-smart" element={<SmartOnboarding />} />
      <Route path="/onboarding" element={<OnboardingV2 />} />
      <Route path="/splash" element={<SplashScreen />} />

      {/* Dev-only: Design System Styleguide */}
      {import.meta.env.DEV && StyleguidePage && (
        <Route path="/styleguide" element={<StyleguidePage />} />
      )}

      {/* Monetization */}
      <Route path="/upgrade" element={<UpgradePrompts />} />
      <Route path="/billing" element={<BillingManagement />} />
      <Route path="/restore-purchases" element={<RestorePurchases />} />
      <Route path="/trial" element={<TrialStart />} />
      <Route path="/trial-info" element={<TrialExplanation />} />
      <Route path="/discounts" element={<DiscountScreen />} />
      <Route path="/checkout" element={<Checkout />} />

      {/* Core App Shell */}
      <Route path="/notifications" element={<NotificationsScreen />} />
      <Route path="/activity" element={<ActivityScreen />} />
      <Route path="/explore" element={<ExploreScreen />} />
      <Route path="/create" element={<CreateAction />} />

      {/* Core Functional */}
      <Route path="/feed" element={<FeedList />} />
      <Route path="/detail/:id" element={<DetailView />} />
      <Route path="/create-new" element={<CreationFlow />} />
      <Route path="/search" element={<SearchResults />} />

      {/* Engagement */}
      <Route path="/saved" element={<SavedFavorites />} />
      <Route path="/messages" element={<MessagesChat />} />
      <Route path="/streaks" element={<StreaksMilestones />} />

      {/* Support */}
      <Route path="/support/contact" element={<ContactSupport />} />
      <Route path="/legal" element={<TermsPrivacy />} />
      <Route path="/report" element={<ReportProblem />} />
      <Route path="/consent" element={<ManageConsent />} />

      {/* Nice-to-have */}
      <Route path="/referral" element={<Referral />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/tutorial" element={<Tutorial />} />
      <Route path="/changelog" element={<Changelog />} />
      <Route path="/rate" element={<RateApp />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/waitlist" element={<WebOnlyRoute fallback="/Today"><Waitlist /></WebOnlyRoute>} />
      <Route path="/welcome-back" element={<Reactivation />} />

      {/* Viral loop */}
      <Route path="/start" element={<StoryLanding />} />
      <Route path="/share-target" element={<ShareTarget />} />
      <Route path="/shared/workout/:token" element={<SharedWorkout />} />

      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/invite" element={<InviteAccept />} />

      {/* Web-only: use-cases and guides */}
      <Route path="/use-case/:role" element={<WebOnlyRoute fallback="/Today"><UseCase /></WebOnlyRoute>} />
      <Route path="/guides/getting-started" element={<WebOnlyRoute fallback="/Today"><GettingStartedGuide /></WebOnlyRoute>} />
      <Route path="/guides/workout-logging" element={<WebOnlyRoute fallback="/Today"><WorkoutLoggingGuide /></WebOnlyRoute>} />
      <Route path="/guides/plan-vs-execution" element={<WebOnlyRoute fallback="/Today"><PlanVsExecutionGuide /></WebOnlyRoute>} />
      <Route path="/guides/ai-workout-generation" element={<WebOnlyRoute fallback="/Today"><AIWorkoutGenerationGuide /></WebOnlyRoute>} />
      <Route path="/guides/ai-plan-building" element={<WebOnlyRoute fallback="/Today"><AIPlanBuildingGuide /></WebOnlyRoute>} />
      <Route path="/guides/adjusting-plans" element={<WebOnlyRoute fallback="/Today"><AdjustingPlansGuide /></WebOnlyRoute>} />
      <Route path="/guides/ai-vs-manual" element={<WebOnlyRoute fallback="/Today"><AIVsManualGuide /></WebOnlyRoute>} />
      <Route path="/guides/progress-photos" element={<WebOnlyRoute fallback="/Today"><ProgressPhotosGuide /></WebOnlyRoute>} />
      <Route path="/guides/export-reports" element={<WebOnlyRoute fallback="/Today"><ExportReportsGuide /></WebOnlyRoute>} />
      <Route path="/guides/nutrition-tracking" element={<WebOnlyRoute fallback="/Today"><NutritionTrackingGuide /></WebOnlyRoute>} />
      <Route path="/guides/mobile-workouts" element={<WebOnlyRoute fallback="/Today"><MobileWorkoutsGuide /></WebOnlyRoute>} />
      <Route path="/guides/account-settings" element={<WebOnlyRoute fallback="/Today"><AccountSettingsGuide /></WebOnlyRoute>} />
      <Route path="/guides/coach-management" element={<WebOnlyRoute fallback="/Today"><CoachManagementGuide /></WebOnlyRoute>} />
      {LEGACY_ROUTE_REDIRECTS.map(([from, to]) => (
        <Route
          key={from}
          caseSensitive
          path={from}
          element={<Navigate to={to} replace />}
        />
      ))}

      <Route element={<RequireAuthenticatedApp />}>
        <Route path={ROUTES.bodyCheckpointNew} element={<NewCheckpointPage />} />

        <Route element={<AppLayout />}>
          {/* Premium content — hard-gated behind EntitlementGate */}
          <Route path={ROUTES.today} element={<EntitlementGate><Today /></EntitlementGate>} />
          <Route path={ROUTES.nutrition} element={<EntitlementGate><NutritionRedesigned /></EntitlementGate>} />
          <Route path={ROUTES.workouts} element={<EntitlementGate><WorkoutsV2 /></EntitlementGate>} />
          <Route path={ROUTES.routines} element={<EntitlementGate><Routines /></EntitlementGate>} />
          <Route path={ROUTES.protocols} element={<EntitlementGate><Protocols /></EntitlementGate>} />
          <Route path={ROUTES.protocolNew} element={<EntitlementGate><ProtocolFormPage /></EntitlementGate>} />
          <Route path={ROUTES.protocolEdit} element={<EntitlementGate><ProtocolFormPage /></EntitlementGate>} />
          <Route path={ROUTES.protocolDetail} element={<EntitlementGate><ProtocolDetail /></EntitlementGate>} />
          <Route path={ROUTES.measurements} element={<EntitlementGate><Measurements /></EntitlementGate>} />
          <Route path={ROUTES.labExams} element={<EntitlementGate><LabExams /></EntitlementGate>} />
          <Route path={ROUTES.progressReview} element={<EntitlementGate><Insights /></EntitlementGate>} />
          <Route path={ROUTES.insights} element={<EntitlementGate><Insights /></EntitlementGate>} />
          <Route path={ROUTES.blockReview} element={<EntitlementGate><BlockReview /></EntitlementGate>} />
          <Route path={ROUTES.exercises} element={<EntitlementGate><Exercises /></EntitlementGate>} />
          <Route path="/exercise/:id" element={<EntitlementGate><ExerciseDetail /></EntitlementGate>} />
          <Route path={ROUTES.progress} element={<EntitlementGate><Progress /></EntitlementGate>} />
          <Route path={ROUTES.plan} element={<EntitlementGate><Plan /></EntitlementGate>} />
          <Route path={ROUTES.body} element={<EntitlementGate><Body /></EntitlementGate>} />
          <Route path={ROUTES.progressPhotos} element={<EntitlementGate><ProgressPhotos /></EntitlementGate>} />
          <Route path={ROUTES.myDiet} element={<EntitlementGate><MyDiet /></EntitlementGate>} />
          <Route path={ROUTES.myWorkout} element={<EntitlementGate><MyWorkout /></EntitlementGate>} />
          <Route path={ROUTES.manualWorkout} element={<EntitlementGate><ManualWorkoutPlan /></EntitlementGate>} />
          <Route path={ROUTES.diary} element={<EntitlementGate><Diary /></EntitlementGate>} />
          <Route path={ROUTES.prescribedDiet} element={<EntitlementGate><MyPrescribedDiet /></EntitlementGate>} />
          <Route path={ROUTES.prescribedWorkout} element={<EntitlementGate><MyPrescribedWorkout /></EntitlementGate>} />

          {/* Accessible without subscription — profile, settings, account, social */}
          <Route path={ROUTES.profile} element={<Profile />} />
          <Route path={ROUTES.profileEdit} element={<ProfileEdit />} />
          <Route path={ROUTES.bodyProfile} element={<BodyProfile />} />
          <Route path={ROUTES.settings} element={<Settings />} />
          <Route path={ROUTES.notificationSettings} element={<NotificationSettings />} />
          <Route path={ROUTES.account} element={<AccountRedesigned />} />
          <Route path={ROUTES.social} element={<Social />} />
          {/* Professional dashboards — gated behind private beta flag.
              Routes are only mounted when VITE_ENABLE_PRO_ROUTES=true (internal/staging).
              In public builds these routes simply don't exist, so users can't land here. */}
          {shouldMountProRoutes() && (
            <>
              <Route path={ROUTES.coachDashboard} element={<WebOnlyRoute fallback="/Today"><RouteGuard roles={['coach', 'admin']}><CoachDashboard /></RouteGuard></WebOnlyRoute>} />
              <Route path={ROUTES.coachStudents} element={<WebOnlyRoute fallback="/Today"><RouteGuard roles={['coach', 'admin']}><CoachStudents /></RouteGuard></WebOnlyRoute>} />
              <Route path="/coach/student/:id" element={<WebOnlyRoute fallback="/Today"><RouteGuard roles={['coach', 'admin']}><CoachStudentProfile /></RouteGuard></WebOnlyRoute>} />
              <Route path="/coach/prescribe-workout/:studentId" element={<WebOnlyRoute fallback="/Today"><RouteGuard roles={['coach', 'admin']}><CoachPrescribeWorkout /></RouteGuard></WebOnlyRoute>} />
              <Route path={ROUTES.nutritionistDashboard} element={<WebOnlyRoute fallback="/Today"><RouteGuard roles={['nutritionist', 'admin']}><NutritionistDashboard /></RouteGuard></WebOnlyRoute>} />
              <Route path={ROUTES.nutritionistClients} element={<WebOnlyRoute fallback="/Today"><RouteGuard roles={['nutritionist', 'admin']}><NutritionistClients /></RouteGuard></WebOnlyRoute>} />
              <Route path="/nutritionist/client/:id" element={<WebOnlyRoute fallback="/Today"><RouteGuard roles={['nutritionist', 'admin']}><NutritionistClientProfile /></RouteGuard></WebOnlyRoute>} />
              <Route path="/nutritionist/prescribe-diet/:clientId" element={<WebOnlyRoute fallback="/Today"><RouteGuard roles={['nutritionist', 'admin']}><NutritionistPrescribeDiet /></RouteGuard></WebOnlyRoute>} />
              <Route path={ROUTES.clinicianDashboard} element={<WebOnlyRoute fallback="/Today"><RouteGuard roles={['clinician', 'admin']}><ClinicianDashboard /></RouteGuard></WebOnlyRoute>} />
              <Route path={ROUTES.clinicianPatients} element={<WebOnlyRoute fallback="/Today"><RouteGuard roles={['clinician', 'admin']}><ClinicianPatients /></RouteGuard></WebOnlyRoute>} />
              <Route path="/clinician/patient/:id" element={<WebOnlyRoute fallback="/Today"><RouteGuard roles={['clinician', 'admin']}><ClinicianPatientProfile /></RouteGuard></WebOnlyRoute>} />
            </>
          )}

          {/* Profile Extension */}
          <Route path="/profile/content" element={<UserContent />} />
          <Route path="/account-status" element={<AccountStatus />} />
          <Route path="/subscription" element={<SubscriptionTier />} />
          <Route path="/connected-services" element={<ConnectedServices />} />

          {/* Settings Extension */}
          <Route path="/settings/privacy" element={<PrivacyScreen />} />
          <Route path="/settings/theme" element={<ThemeScreen />} />
          <Route path="/settings/language" element={<LanguageScreen />} />
          <Route path="/settings/export" element={<DataExport />} />
          <Route path="/settings/delete-account" element={<DeleteAccount />} />
        </Route>
      </Route>

      {/* Admin panel — gated behind private beta flag (same as professional routes) */}
      {shouldMountProRoutes() && (
        <Route element={<RequireAuthenticatedApp />}>
          <Route path={ROUTES.admin} element={<WebOnlyRoute fallback="/Today"><RouteGuard roles={['admin']}><AdminLayout /></RouteGuard></WebOnlyRoute>}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:userId" element={<AdminUserProfile />} />
            <Route path="ai-system" element={<AdminAISystem />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="invites" element={<AdminInvites />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="moderation" element={<ModerationConsole />} />
            <Route path="waitlist" element={<AdminWaitlist />} />
            <Route path="influencers" element={<AdminInfluencers />} />
          </Route>
          <Route path={`${ROUTES.admin}/view-as/:userId`} element={<WebOnlyRoute fallback="/Today"><RouteGuard roles={['admin']}><AdminImpersonation /></RouteGuard></WebOnlyRoute>} />
        </Route>
      )}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  </Suspense>
);

const AuthenticatedApp = () => {
  const { isAuthenticated, user, authState } = useAuth();

  React.useEffect(() => {
    captureReferralParams();
    initRevenueCat();
  }, []);

  // Analytics identity sync
  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      identifyAnalyticsUser(user.id, {
        email: user.email,
        plan: user.subscription_tier,
        role: user.atlas_role,
      });
    }
  }, [isAuthenticated, user?.id, user?.subscription_tier]);

  // Sync RevenueCat identity with Supabase user
  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      identifyUser(user.id);
    }
  }, [isAuthenticated, user?.id]);

  useReferralTracking(user);
  usePushNotifications();
  usePageViewTracking();

  // Hide native splash as soon as auth resolves — fires regardless of which route is active.
  // Previously this was in RequireAuthenticatedApp, which is only mounted on authenticated
  // routes. Unauthenticated users routed to /welcome never triggered it.
  useEffect(() => {
    if (authState !== 'loading' && Capacitor.isNativePlatform()) {
      const t = setTimeout(() => CapSplash.hide({ fadeOutDuration: 300 }), 150);
      return () => clearTimeout(t);
    }
  }, [authState]);

  return (
    <AuthGateProvider>
      <AppRoutes />
      {isAuthenticated && user?.onboarding_completed && <OnboardingTour />}
    </AuthGateProvider>
  );
};

function App() {
  // Clear chunk-reload guard on every clean boot so future stale-chunk errors
  // can still trigger a reload (avoids permanent loop suppression).
  React.useEffect(() => {
    sessionStorage.removeItem('atlas_chunk_reload');
  }, []);

  // Initialize all analytics providers (PostHog, Meta Pixel, GA4) once at boot.
  React.useEffect(() => {
    initAnalytics();
  }, []);

  // Handle deep link callbacks for native OAuth (atlascore://auth/callback)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener;

    CapApp.addListener('appUrlOpen', async ({ url }) => {
      if (!url.includes('atlascore://auth/callback')) return;
      await Browser.close();

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
    }).then(h => { listener = h; });

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
                      <AuthenticatedApp />
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
