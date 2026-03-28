import React, { lazy, Suspense, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { DailyStoreProvider } from '@/store/dailyStore';
import { ThemeProvider } from '@/lib/ThemeContext';
import { SubscriptionProvider } from '@/lib/SubscriptionContext';
import { I18nProvider } from '@/lib/i18nContext';
import { GoogleReCaptchaProvider } from '@/lib/ReCaptchaContext';
import { LEGACY_ROUTE_REDIRECTS, ROUTES } from '@/lib/routes';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { useReferralTracking, captureReferralParams } from '@/hooks/useReferralTracking';
import { Capacitor } from '@capacitor/core';
import AppLayout from '@/components/layout/AppLayout.jsx';
import RouteGuard from '@/components/rbac/RouteGuard';
import ErrorBoundary from '@/components/ErrorBoundary';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// ─── Lazy Pages ──────────────────────────────────────────────────────────────
const Landing = lazy(() => import('@/pages/Landing.jsx'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const Today = lazy(() => import('@/pages/Today'));
const Nutrition = lazy(() => import('@/pages/Nutrition'));
const WorkoutsV2 = lazy(() => import('@/pages/WorkoutsV2'));
const Routines = lazy(() => import('@/pages/Routines'));
const Protocols = lazy(() => import('@/pages/Protocols'));
const Measurements = lazy(() => import('@/pages/Measurements'));
const LabExams = lazy(() => import('@/pages/LabExams'));
const Profile = lazy(() => import('@/pages/Profile'));
const Goals = lazy(() => import('@/pages/Goals'));
const BodyProfile = lazy(() => import('@/pages/BodyProfile'));
const Account = lazy(() => import('@/pages/Account'));
const Export = lazy(() => import('@/pages/Export'));
const AdminPanel = lazy(() => import('@/pages/AdminPanel'));
const AdminUserProfile = lazy(() => import('@/pages/admin/AdminUserProfile'));
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
const Auth = lazy(() => import('@/pages/Auth.jsx'));
const Insights = lazy(() => import('@/pages/Insights'));
const BlockReview = lazy(() => import('@/pages/BlockReview'));
const Exercises = lazy(() => import('@/pages/Exercises'));
const ExerciseDetail = lazy(() => import('@/pages/ExerciseDetail'));
const Progress = lazy(() => import('@/pages/Progress'));
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
const WelcomeScreen = lazy(() => import('@/pages/WelcomeScreen'));
const EmailAuth = lazy(() => import('@/pages/EmailAuth'));
const SocialAuth = lazy(() => import('@/pages/SocialAuth'));
const AppleAuth = lazy(() => import('@/pages/AppleAuth'));
const PermissionsScreen = lazy(() => import('@/pages/PermissionsScreen'));

// Pre-Paywall Screens
const GoalSelection = lazy(() => import('@/pages/GoalSelection'));
const PreferencesScreen = lazy(() => import('@/pages/PreferencesScreen'));
const SetupInput = lazy(() => import('@/pages/SetupInput'));
const ValueCreation = lazy(() => import('@/pages/ValueCreation'));
const PreviewResult = lazy(() => import('@/pages/PreviewResult'));
const PrePaywallReveal = lazy(() => import('@/pages/PrePaywallReveal'));

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

const RequireAuthenticatedApp = () => {
  const { authError, isAuthenticated, authState, user } = useAuth();
  const location = useLocation();

  if (authState === 'loading') {
    return <FullScreenSpinner />;
  }

  if (authError?.type === 'user_not_registered') return <UserNotRegisteredError />;
  if (authError?.type === 'missing_config') return <MissingConfigScreen />;
  if (!isAuthenticated) {
    const nextUrl = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/auth?mode=login&next=${encodeURIComponent(nextUrl)}`} replace />;
  }

  // Admins go straight to the admin panel — they have no use for Today/Social/etc.
  const isAdmin = user?.atlas_role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/AdminPanel');
  if (isAdmin && !isAdminRoute) {
    return <Navigate to={ROUTES.admin} replace />;
  }

  return <Outlet />;
};

const AppRoutes = () => (
  <Suspense fallback={<FullScreenSpinner />}>
    <Routes>
      <Route path={ROUTES.home} element={<Landing />} />
      <Route path={ROUTES.blog} element={<BlogIndex />} />
      <Route path={`${ROUTES.blog}/:slug`} element={<BlogPost />} />
      <Route path={ROUTES.auth} element={<Auth />} />
      <Route path={ROUTES.signup} element={<Auth />} />
      <Route path={ROUTES.login} element={<Auth />} />
      <Route path={ROUTES.pricing} element={<Pricing />} />
      <Route path={ROUTES.help} element={<HelpCenter />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/update-password" element={<UpdatePassword />} />

      {/* Entry & Onboarding */}
      <Route path="/splash" element={<SplashScreen />} />
      <Route path="/welcome" element={<WelcomeScreen />} />
      <Route path="/auth/email" element={<EmailAuth />} />
      <Route path="/auth/social" element={<SocialAuth />} />
      <Route path="/auth/apple" element={<AppleAuth />} />
      <Route path="/permissions" element={<PermissionsScreen />} />

      {/* Pre-Paywall */}
      <Route path="/onboarding/goal-selection" element={<GoalSelection />} />
      <Route path="/onboarding/preferences" element={<PreferencesScreen />} />
      <Route path="/onboarding/setup-input" element={<SetupInput />} />
      <Route path="/onboarding/value-creation" element={<ValueCreation />} />
      <Route path="/onboarding/preview-result" element={<PreviewResult />} />
      <Route path="/onboarding/pre-paywall" element={<PrePaywallReveal />} />

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
      <Route path="/waitlist" element={<Waitlist />} />
      <Route path="/welcome-back" element={<Reactivation />} />

      {/* Viral loop */}
      <Route path="/start" element={<StoryLanding />} />
      <Route path="/share-target" element={<ShareTarget />} />

      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/invite" element={<InviteAccept />} />

      <Route path="/use-case/:role" element={<UseCase />} />
      <Route path="/guides/getting-started" element={<GettingStartedGuide />} />
      <Route path="/guides/workout-logging" element={<WorkoutLoggingGuide />} />
      <Route path="/guides/plan-vs-execution" element={<PlanVsExecutionGuide />} />
      <Route path="/guides/ai-workout-generation" element={<AIWorkoutGenerationGuide />} />
      <Route path="/guides/ai-plan-building" element={<AIPlanBuildingGuide />} />
      <Route path="/guides/adjusting-plans" element={<AdjustingPlansGuide />} />
      <Route path="/guides/ai-vs-manual" element={<AIVsManualGuide />} />
      <Route path="/guides/progress-photos" element={<ProgressPhotosGuide />} />
      <Route path="/guides/export-reports" element={<ExportReportsGuide />} />
      <Route path="/guides/nutrition-tracking" element={<NutritionTrackingGuide />} />
      <Route path="/guides/mobile-workouts" element={<MobileWorkoutsGuide />} />
      <Route path="/guides/account-settings" element={<AccountSettingsGuide />} />
      <Route path="/guides/coach-management" element={<CoachManagementGuide />} />
      {LEGACY_ROUTE_REDIRECTS.map(([from, to]) => (
        <Route
          key={from}
          caseSensitive
          path={from}
          element={<Navigate to={to} replace />}
        />
      ))}

      <Route element={<RequireAuthenticatedApp />}>
        <Route path={ROUTES.onboarding} element={<Onboarding />} />
        <Route path={ROUTES.bodyCheckpointNew} element={<NewCheckpointPage />} />

        <Route element={<AppLayout />}>
          <Route path={ROUTES.today} element={<Today />} />
          <Route path={ROUTES.nutrition} element={<Nutrition />} />
          <Route path={ROUTES.workouts} element={<WorkoutsV2 />} />
          <Route path={ROUTES.routines} element={<Routines />} />
          <Route path={ROUTES.protocols} element={<Protocols />} />
          <Route path={ROUTES.measurements} element={<Measurements />} />
          <Route path={ROUTES.labExams} element={<LabExams />} />
          <Route path={ROUTES.progressReview} element={<Insights />} />
          <Route path={ROUTES.insights} element={<Insights />} />
          <Route path={ROUTES.blockReview} element={<BlockReview />} />
          <Route path={ROUTES.exercises} element={<Exercises />} />
          <Route path="/exercise/:id" element={<ExerciseDetail />} />
          <Route path={ROUTES.progress} element={<Progress />} />
          <Route path={ROUTES.body} element={<Body />} />
          <Route path={ROUTES.progressPhotos} element={<ProgressPhotos />} />
          <Route path={ROUTES.profile} element={<Profile />} />
          <Route path={ROUTES.goals} element={<Goals />} />
          <Route path={ROUTES.bodyProfile} element={<BodyProfile />} />
          <Route path={ROUTES.account} element={<Account />} />
          <Route path={ROUTES.settings} element={<Settings />} />
          <Route path={ROUTES.export} element={<Export />} />
          <Route path={ROUTES.myDiet} element={<MyDiet />} />
          <Route path={ROUTES.myWorkout} element={<MyWorkout />} />
          <Route path={ROUTES.manualWorkout} element={<ManualWorkoutPlan />} />
          <Route path={ROUTES.diary} element={<Diary />} />
          <Route path={ROUTES.social} element={<Social />} />
          <Route path={ROUTES.prescribedDiet} element={<MyPrescribedDiet />} />
          <Route path={ROUTES.prescribedWorkout} element={<MyPrescribedWorkout />} />
          <Route path={ROUTES.coachDashboard} element={<RouteGuard roles={['coach', 'admin']}><CoachDashboard /></RouteGuard>} />
          <Route path={ROUTES.coachStudents} element={<RouteGuard roles={['coach', 'admin']}><CoachStudents /></RouteGuard>} />
          <Route path="/coach/student/:id" element={<RouteGuard roles={['coach', 'admin']}><CoachStudentProfile /></RouteGuard>} />
          <Route path="/coach/prescribe-workout/:studentId" element={<RouteGuard roles={['coach', 'admin']}><CoachPrescribeWorkout /></RouteGuard>} />
          <Route path={ROUTES.nutritionistDashboard} element={<RouteGuard roles={['nutritionist', 'admin']}><NutritionistDashboard /></RouteGuard>} />
          <Route path={ROUTES.nutritionistClients} element={<RouteGuard roles={['nutritionist', 'admin']}><NutritionistClients /></RouteGuard>} />
          <Route path="/nutritionist/client/:id" element={<RouteGuard roles={['nutritionist', 'admin']}><NutritionistClientProfile /></RouteGuard>} />
          <Route path="/nutritionist/prescribe-diet/:clientId" element={<RouteGuard roles={['nutritionist', 'admin']}><NutritionistPrescribeDiet /></RouteGuard>} />
          <Route path={ROUTES.clinicianDashboard} element={<RouteGuard roles={['clinician', 'admin']}><ClinicianDashboard /></RouteGuard>} />
          <Route path={ROUTES.clinicianPatients} element={<RouteGuard roles={['clinician', 'admin']}><ClinicianPatients /></RouteGuard>} />
          <Route path="/clinician/patient/:id" element={<RouteGuard roles={['clinician', 'admin']}><ClinicianPatientProfile /></RouteGuard>} />

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

      {/* Admin panel */}
      <Route element={<RequireAuthenticatedApp />}>
        <Route path={ROUTES.admin} element={<RouteGuard roles={['admin']}><AdminPanel /></RouteGuard>} />
        <Route path="/AdminPanel/user/:userId" element={<RouteGuard roles={['admin']}><AdminUserProfile /></RouteGuard>} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  </Suspense>
);

const AuthenticatedApp = () => {
  const { isAuthenticated, user } = useAuth();

  React.useEffect(() => {
    captureReferralParams();
  }, []);

  useReferralTracking(user);

  return (
    <>
      <AppRoutes />
      {isAuthenticated && <OnboardingTour />}
    </>
  );
};

function App() {
  // Clear chunk-reload guard on every clean boot so future stale-chunk errors
  // can still trigger a reload (avoids permanent loop suppression).
  React.useEffect(() => {
    sessionStorage.removeItem('atlas_chunk_reload');
  }, []);

  // Handle deep link callbacks for native OAuth (atlascore://auth/callback)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener;
    (async () => {
      const { App: CapApp } = await import('@capacitor/app');
      const { supabase } = await import('@/lib/supabaseClient');
      const { Browser } = await import('@capacitor/browser');

      listener = await CapApp.addListener('appUrlOpen', async ({ url }) => {
        if (!url.includes('atlascore://auth/callback')) return;
        await Browser.close();

        // Extract code or tokens from the URL
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
      });
    })();

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
                  <Toaster />
                  <Sonner richColors position="top-right" />
                  <Analytics />
                  <SpeedInsights />
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
