import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { DailyStoreProvider } from '@/store/dailyStore';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/lib/ThemeContext';
import { SubscriptionProvider } from '@/lib/SubscriptionContext';
import { I18nProvider } from '@/lib/i18nContext';
import { GoogleReCaptchaProvider } from '@/lib/ReCaptchaContext';
import { LEGACY_ROUTE_REDIRECTS, ROUTES } from '@/lib/routes';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';

// Pages
import Landing from '@/pages/Landing.jsx';
import Onboarding from '@/pages/Onboarding';
import Today from '@/pages/Today';
import Nutrition from '@/pages/Nutrition';
import WorkoutsV2 from '@/pages/WorkoutsV2';
import Routines from '@/pages/Routines';
import Protocols from '@/pages/Protocols';
import Measurements from '@/pages/Measurements';
import LabExams from '@/pages/LabExams';
import Profile from '@/pages/Profile';
import Export from '@/pages/Export';
import AdminPanel from '@/pages/AdminPanel';
import MyDiet from '@/pages/MyDiet';
import MyWorkout from '@/pages/MyWorkout';
import ManualWorkoutPlan from '@/pages/ManualWorkoutPlan';
import Diary from '@/pages/Diary';
import ProgressPhotos from '@/pages/ProgressPhotos';
import Social from '@/pages/Social';
import MyPrescribedDiet from '@/pages/MyPrescribedDiet';
import Pricing from '@/pages/Pricing.jsx';
import MyPrescribedWorkout from '@/pages/MyPrescribedWorkout';
import CoachDashboard from '@/pages/coach/CoachDashboard';
import CoachStudents from '@/pages/coach/CoachStudents';
import CoachStudentProfile from '@/pages/coach/CoachStudentProfile';
import CoachPrescribeWorkout from '@/pages/coach/CoachPrescribeWorkout';
import ClinicianDashboard from '@/pages/clinician/ClinicianDashboard';
import ClinicianPatients from '@/pages/clinician/ClinicianPatients';
import ClinicianPatientProfile from '@/pages/clinician/ClinicianPatientProfile';
import NutritionistDashboard from '@/pages/nutritionist/NutritionistDashboard.jsx';
import NutritionistClients from '@/pages/nutritionist/NutritionistClients.jsx';
import NutritionistClientProfile from '@/pages/nutritionist/NutritionistClientProfile.jsx';
import NutritionistPrescribeDiet from '@/pages/nutritionist/NutritionistPrescribeDiet';
import Auth from '@/pages/Auth.jsx';
import Insights from '@/pages/Insights';
import BlockReview from '@/pages/BlockReview';
import Exercises from '@/pages/Exercises';
import ExerciseDetail from '@/pages/ExerciseDetail';
import Progress from '@/pages/Progress';
import Body from '@/pages/Body';
import HelpCenter from '@/pages/HelpCenter.jsx';
import UseCase from '@/pages/UseCase';
import GettingStartedGuide from '@/pages/guides/GettingStartedGuide';
import GitHubPRTracker from '@/pages/GitHubPRTracker';
import WorkoutLoggingGuide from '@/pages/guides/WorkoutLoggingGuide';
import PlanVsExecutionGuide from '@/pages/guides/PlanVsExecutionGuide';
import BlogIndex from '@/pages/blog/BlogIndex.jsx';
import BlogPost from '@/pages/blog/BlogPost.jsx';
import Settings from '@/pages/Settings.jsx';
import AuthCallback from '@/pages/AuthCallback';
import UpdatePassword from '@/pages/UpdatePassword';

// Entry & Onboarding Screens
import SplashScreen from '@/pages/SplashScreen';
import WelcomeScreen from '@/pages/WelcomeScreen';
import EmailAuth from '@/pages/EmailAuth';
import SocialAuth from '@/pages/SocialAuth';
import AppleAuth from '@/pages/AppleAuth';
import PermissionsScreen from '@/pages/PermissionsScreen';

// Pre-Paywall Screens
import GoalSelection from '@/pages/GoalSelection';
import PreferencesScreen from '@/pages/PreferencesScreen';
import SetupInput from '@/pages/SetupInput';
import ValueCreation from '@/pages/ValueCreation';
import PreviewResult from '@/pages/PreviewResult';
import PrePaywallReveal from '@/pages/PrePaywallReveal';

// Monetization Screens
import UpgradePrompts from '@/pages/UpgradePrompts';
import BillingManagement from '@/pages/BillingManagement';
import RestorePurchases from '@/pages/RestorePurchases';
import TrialStart from '@/pages/TrialStart';
import TrialExplanation from '@/pages/TrialExplanation';
import DiscountScreen from '@/pages/DiscountScreen';

// Core App Shell Screens
import NotificationsScreen from '@/pages/NotificationsScreen';
import ActivityScreen from '@/pages/ActivityScreen';
import ExploreScreen from '@/pages/ExploreScreen';
import CreateAction from '@/pages/CreateAction';

// Core Functional Screens
import FeedList from '@/pages/FeedList';
import DetailView from '@/pages/DetailView';
import CreationFlow from '@/pages/CreationFlow';
import SearchResults from '@/pages/SearchResults';

// Engagement Screens
import SavedFavorites from '@/pages/SavedFavorites';
import MessagesChat from '@/pages/MessagesChat';
import StreaksMilestones from '@/pages/StreaksMilestones';

// Profile Extension Screens
import UserContent from '@/pages/UserContent';
import AccountStatus from '@/pages/AccountStatus';
import SubscriptionTier from '@/pages/SubscriptionTier';
import ConnectedServices from '@/pages/ConnectedServices';

// Settings Extension Screens
import PrivacyScreen from '@/pages/PrivacyScreen';
import ThemeScreen from '@/pages/ThemeScreen';
import LanguageScreen from '@/pages/LanguageScreen';
import DataExport from '@/pages/DataExport';
import DeleteAccount from '@/pages/DeleteAccount';

// Support Screens
import ContactSupport from '@/pages/ContactSupport';
import TermsPrivacy from '@/pages/TermsPrivacy';
import ReportProblem from '@/pages/ReportProblem';
import ManageConsent from '@/pages/ManageConsent';

// Nice-to-have Screens
import Referral from '@/pages/Referral';
import Achievements from '@/pages/Achievements';
import Tutorial from '@/pages/Tutorial';
import Changelog from '@/pages/Changelog';
import RateApp from '@/pages/RateApp';
import Calendar from '@/pages/Calendar';
import Leaderboard from '@/pages/Leaderboard';
import Integrations from '@/pages/Integrations';
import Checkout from '@/pages/Checkout';
import Waitlist from '@/pages/Waitlist';
import Reactivation from '@/pages/Reactivation';

// Layout
import AppLayout from '@/components/layout/AppLayout.jsx';
import RouteGuard from '@/components/rbac/RouteGuard';

const FullScreenSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[hsl(var(--bg))]">
    <div className="w-8 h-8 border-[3px] border-[hsl(var(--border))] border-t-[hsl(var(--primary))] rounded-full animate-spin"></div>
  </div>
);

const MissingConfigScreen = () => (
  <div className="min-h-screen bg-[hsl(var(--bg))] flex items-center justify-center p-6">
    <div className="max-w-xl w-full rounded-2xl border border-[hsl(var(--border-h))] bg-[hsl(var(--card))] p-6 space-y-4">
      <div>
        <p className="text-[20px] font-semibold text-[hsl(var(--fg))]">Base44 configuration missing</p>
        <p className="mt-2 text-[14px] text-[hsl(var(--fg-2))]">
          The authenticated app depends on the <code>VITE_BASE44_APP_ID</code> and <code>VITE_BASE44_APP_BASE_URL</code> variables.
          Without them, authentication, queries, and internal routes cannot load.
        </p>
      </div>

      <div className="rounded-xl bg-[hsl(var(--shell))] p-4 text-[13px] text-[hsl(var(--fg))]">
        <p className="font-medium mb-2">Create a <code>.env.local</code> file at the project root with:</p>
        <pre className="whitespace-pre-wrap break-all text-[12px] leading-6">
{`VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-backend.base44.app`}
        </pre>
      </div>

      <p className="text-[13px] text-[hsl(var(--fg-2))]">
        A template already exists in <code>.env.example</code>. After filling it in, restart <code>npm run dev</code>.
      </p>
    </div>
  </div>
);

const RequireAuthenticatedApp = () => {
  const { authError, isAuthenticated, authState } = useAuth();
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

  return <Outlet />;
};

const AppRoutes = () => (
  <Routes>
    <Route path={ROUTES.home} element={<Landing />} />
    <Route path={ROUTES.blog} element={<BlogIndex />} />
    <Route path={`${ROUTES.blog}/:slug`} element={<BlogPost />} />
    <Route path={ROUTES.auth} element={<Auth />} />
    <Route path={ROUTES.signup} element={<Auth />} />
    <Route path={ROUTES.login} element={<Auth />} />
    <Route path={ROUTES.pricing} element={<Pricing />} />
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

    <Route path="/use-case/:role" element={<UseCase />} />
    <Route path="/guides/getting-started" element={<GettingStartedGuide />} />
    <Route path="/guides/workout-logging" element={<WorkoutLoggingGuide />} />
    <Route path="/guides/plan-vs-execution" element={<PlanVsExecutionGuide />} />
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
        <Route path={ROUTES.profile} element={<Profile />} />
        <Route path={ROUTES.settings} element={<Settings />} />
        <Route path={ROUTES.export} element={<Export />} />
        <Route path={ROUTES.myDiet} element={<MyDiet />} />
        <Route path={ROUTES.myWorkout} element={<MyWorkout />} />
        <Route path={ROUTES.manualWorkout} element={<ManualWorkoutPlan />} />
        <Route path={ROUTES.diary} element={<Diary />} />
        <Route path={ROUTES.progressPhotos} element={<ProgressPhotos />} />
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
        <Route path={ROUTES.admin} element={<RouteGuard roles={['admin']}><AdminPanel /></RouteGuard>} />
        <Route path={ROUTES.githubPRs} element={<GitHubPRTracker />} />

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

    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

const AuthenticatedApp = () => {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <AppRoutes />
      {isAuthenticated && <OnboardingTour />}
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <GoogleReCaptchaProvider>
              <QueryClientProvider client={queryClientInstance}>
                <SubscriptionProvider>
                  <DailyStoreProvider>
                    <Router>
                      <AuthenticatedApp />
                    </Router>
                    <Toaster />
                  </DailyStoreProvider>
                </SubscriptionProvider>
              </QueryClientProvider>
            </GoogleReCaptchaProvider>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
