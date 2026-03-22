import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/lib/ThemeContext';
import { SubscriptionProvider } from '@/lib/SubscriptionContext';
import { I18nProvider } from '@/lib/i18nContext';
import { DailyStoreProvider } from '@/store/dailyStore.jsx';
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
import AtlasAI from '@/pages/AtlasAI';
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
import Settings from '@/pages/Settings.jsx';
import BlogPost from '@/pages/blog/BlogPost.jsx';

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
    <Route path={ROUTES.help} element={<HelpCenter />} />
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
        <Route path={ROUTES.atlasAI} element={<AtlasAI />} />
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
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
