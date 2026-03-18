import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/lib/ThemeContext';
import { SubscriptionProvider } from '@/lib/SubscriptionContext';
import { I18nProvider } from '@/lib/i18nContext';
import { LEGACY_ROUTE_REDIRECTS, ROLE_HOME, ROUTES } from '@/lib/routes';

// Pages
import Landing from '@/pages/Landing.jsx';
import Onboarding from '@/pages/Onboarding';
import Today from '@/pages/Today';
import Nutrition from '@/pages/Nutrition';
import Workouts from '@/pages/Workouts';
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
import Diary from '@/pages/Diary';
import ProgressPhotos from '@/pages/ProgressPhotos';
import Social from '@/pages/Social';
import MyPrescribedDiet from '@/pages/MyPrescribedDiet';
import Pricing from '@/pages/Pricing';
import MyPrescribedWorkout from '@/pages/MyPrescribedWorkout';
import CoachDashboard from '@/pages/coach/CoachDashboard';
import CoachStudents from '@/pages/coach/CoachStudents';
import CoachStudentProfile from '@/pages/coach/CoachStudentProfile';
import CoachPrescribeWorkout from '@/pages/coach/CoachPrescribeWorkout';
import ClinicianDashboard from '@/pages/clinician/ClinicianDashboardProfessional';
import ClinicianPatients from '@/pages/clinician/ClinicianPatients';
import ClinicianPatientProfile from '@/pages/clinician/ClinicianPatientProfile';
import NutritionistDashboard from '@/pages/nutritionist/NutritionistDashboard.jsx';
import NutritionistClients from '@/pages/nutritionist/NutritionistClients.jsx';
import NutritionistClientProfile from '@/pages/nutritionist/NutritionistClientProfile.jsx';
import NutritionistPrescribeDiet from '@/pages/nutritionist/NutritionistPrescribeDiet';
import Auth from '@/pages/Auth.jsx';
import Insights from '@/pages/Insights';
import Exercises from '@/pages/Exercises';
import ExerciseDetail from '@/pages/ExerciseDetail';
import Progress from '@/pages/Progress';
import HelpCenter from '@/pages/HelpCenter';
import UseCase from '@/pages/UseCase';
import GettingStartedGuide from '@/pages/guides/GettingStartedGuide';
import GitHubPRTracker from '@/pages/GitHubPRTracker';
import WorkoutLoggingGuide from '@/pages/guides/WorkoutLoggingGuide';
import PlanVsExecutionGuide from '@/pages/guides/PlanVsExecutionGuide';

// Layout
import AppLayout from '@/components/layout/AppLayout.jsx';

console.log("FORCE REBUILD 123");

const AuthenticatedApp = () => {
  const { authError, user, isAuthenticated, authState } = useAuth();
  const location = useLocation();

  const needsLogin = authError?.type === 'auth_required';

  if (authState === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[hsl(var(--bg))]">
        <div className="w-8 h-8 border-[3px] border-[hsl(var(--border))] border-t-[hsl(var(--primary))] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') return <UserNotRegisteredError />;
  if (authError?.type === 'missing_config') {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg))] flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-2xl border border-[hsl(var(--border-h))] bg-[hsl(var(--card))] p-6 space-y-4">
          <div>
            <p className="text-[20px] font-semibold text-[hsl(var(--fg))]">Configuração do Base44 ausente</p>
            <p className="mt-2 text-[14px] text-[hsl(var(--fg-2))]">
              A área logada depende das variáveis <code>VITE_BASE44_APP_ID</code> e <code>VITE_BASE44_APP_BASE_URL</code>.
              Sem isso, autenticação, queries e páginas internas não conseguem carregar.
            </p>
          </div>

          <div className="rounded-xl bg-[hsl(var(--shell))] p-4 text-[13px] text-[hsl(var(--fg))]">
            <p className="font-medium mb-2">Crie um arquivo <code>.env.local</code> na raiz com:</p>
            <pre className="whitespace-pre-wrap break-all text-[12px] leading-6">
{`VITE_BASE44_APP_ID=seu_app_id
VITE_BASE44_APP_BASE_URL=https://seu-backend.base44.app`}
            </pre>
          </div>

          <p className="text-[13px] text-[hsl(var(--fg-2))]">
            Existe um modelo em <code>.env.example</code>. Depois de preencher, reinicie o <code>npm run dev</code>.
          </p>
        </div>
      </div>
    );
  }
  if (needsLogin) {
    const nextUrl = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;

    if (location.pathname !== '/auth') {
      return (
        <Navigate
          to={`/auth?mode=login&next=${encodeURIComponent(nextUrl)}`}
          replace
        />
      );
    }

    return <Auth />;
  }

  const homeRoute = isAuthenticated && user
    ? (ROLE_HOME[user.atlas_role] || ROUTES.today)
    : ROUTES.home;

  return (
    <Routes>
      {/* Root redirect — role-aware */}
      <Route path="/" element={<Navigate to={homeRoute} replace />} />
      <Route path={ROUTES.home} element={<Landing />} />
      <Route path={ROUTES.auth} element={<Auth />} />
      <Route path={ROUTES.signup} element={<Auth />} />
      <Route path={ROUTES.login} element={<Auth />} />
      <Route path={ROUTES.onboarding} element={<Onboarding />} />
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

      {/* App (with sidebar layout) */}
      <Route element={<AppLayout />}>
        <Route path={ROUTES.today} element={<Today />} />
        <Route path={ROUTES.nutrition} element={<Nutrition />} />
        <Route path={ROUTES.workouts} element={<Workouts />} />
        <Route path={ROUTES.routines} element={<Routines />} />
        <Route path={ROUTES.protocols} element={<Protocols />} />
        <Route path={ROUTES.measurements} element={<Measurements />} />
        <Route path={ROUTES.labExams} element={<LabExams />} />
        <Route path={ROUTES.atlasAI} element={<AtlasAI />} />
        <Route path={ROUTES.insights} element={<Insights />} />
        <Route path={ROUTES.exercises} element={<Exercises />} />
        <Route path="/exercise/:id" element={<ExerciseDetail />} />
        <Route path={ROUTES.progress} element={<Progress />} />
        <Route path={ROUTES.profile} element={<Profile />} />
        <Route path={ROUTES.export} element={<Export />} />
        <Route path={ROUTES.admin} element={<AdminPanel />} />
        <Route path={ROUTES.myDiet} element={<MyDiet />} />
        <Route path={ROUTES.myWorkout} element={<MyWorkout />} />
        <Route path={ROUTES.diary} element={<Diary />} />
        <Route path={ROUTES.progressPhotos} element={<ProgressPhotos />} />
        <Route path={ROUTES.social} element={<Social />} />
        <Route path={ROUTES.prescribedDiet} element={<MyPrescribedDiet />} />
        <Route path={ROUTES.pricing} element={<Pricing />} />
        <Route path={ROUTES.prescribedWorkout} element={<MyPrescribedWorkout />} />
        <Route path={ROUTES.coachDashboard} element={<CoachDashboard />} />
        <Route path={ROUTES.coachStudents} element={<CoachStudents />} />
        <Route path="/coach/student/:id" element={<CoachStudentProfile />} />
        <Route path="/coach/prescribe-workout/:studentId" element={<CoachPrescribeWorkout />} />
        <Route path={ROUTES.nutritionistDashboard} element={<NutritionistDashboard />} />
        <Route path={ROUTES.nutritionistClients} element={<NutritionistClients />} />
        <Route path="/nutritionist/client/:id" element={<NutritionistClientProfile />} />
        <Route path="/nutritionist/prescribe-diet/:clientId" element={<NutritionistPrescribeDiet />} />
        <Route path={ROUTES.clinicianDashboard} element={<ClinicianDashboard />} />
        <Route path={ROUTES.clinicianPatients} element={<ClinicianPatients />} />
        <Route path="/clinician/patient/:id" element={<ClinicianPatientProfile />} />
        <Route path={ROUTES.githubPRs} element={<GitHubPRTracker />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
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
                <Router>
                  <AuthenticatedApp />
                </Router>
                <Toaster />
              </SubscriptionProvider>
            </QueryClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
