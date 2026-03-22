# atlas.core Design Handoff Implementation

## Short implementation plan
1. Audit the handoff files in `design/` and extract tokens, shared component patterns, navigation structure, and screen inventory.
2. Align the app shell with the atlas.core system: dark-first tokens, updated card/control radii, athlete mobile tab labels, and shared workspace primitives.
3. Implement reusable UI first, then translate the screen families into the existing route structure instead of importing the static HTML galleries.
4. Verify the integrated build and document the remaining route/state assumptions where the mockups describe states rather than separate destinations.

## Implemented code changes

### Theme, shell, and shared primitives
- `src/index.css`
  - Updated theme tokens toward the handoff palette and radius system.
- `src/lib/ThemeContext.jsx`
  - Keeps dark mode as the default app theme.
- `src/components/shared/AppContainer.jsx`
  - Re-skinned the app container, cards, page headers, and mobile tab bar around the atlas.core dark system.
- `src/components/layout/AppLayout.jsx`
  - Updated athlete mobile tabs to `Today / Train / Nutrition / Body / More`.
  - Kept role-aware shells and mobile/desktop navigation intact.
- `src/components/shared/ProfessionalUI.jsx`
  - Added reusable professional workspace primitives for coach, nutritionist, clinician, and admin screens.
- `src/components/shared/InviteModal.jsx`
  - Refreshed invite flow styling to match the new system.

### Core athlete flows
- `src/pages/Auth.jsx`
- `src/pages/Onboarding.jsx`
- `src/components/today/TodayMobileUI.jsx`
- `src/components/today/WeeklyCheckinModal.jsx`
- `src/pages/WorkoutsV2.jsx`
- `src/components/workouts/WorkoutExecutionScreen.jsx`
- `src/components/workouts/ExerciseSearch.jsx`
- `src/pages/Routines.jsx`
- `src/components/routines/RoutineCard.jsx`
- `src/components/routines/RoutineForm.jsx`
- `src/pages/MyDiet.jsx`
- `src/pages/MyWorkout.jsx`
- `src/pages/ManualWorkoutPlan.jsx`

### Exercises, body, insights, and AI
- `src/components/ai/MessageBubble.jsx`
- `src/components/exercises/ExerciseCard.jsx`
- `src/pages/AtlasAI.jsx`
- `src/pages/BlockReview.jsx`
- `src/pages/Body.jsx`
- `src/pages/Diary.jsx`
- `src/pages/ExerciseDetail.jsx`
- `src/pages/Exercises.jsx`
- `src/pages/Insights.jsx`
- `src/pages/Measurements.jsx`
- `src/pages/Progress.jsx`
- `src/pages/ProgressPhotos.jsx`

### Profile, roles, admin, and system states
- `src/components/ErrorBoundary.jsx`
- `src/lib/PageNotFound.jsx`
- `src/pages/Settings.jsx`
- `src/pages/Export.jsx`
- `src/pages/Social.jsx`
- `src/pages/AdminPanel.jsx`
- `src/pages/coach/CoachDashboard.jsx`
- `src/pages/coach/CoachStudents.jsx`
- `src/pages/nutritionist/NutritionistDashboard.jsx`
- `src/pages/nutritionist/NutritionistClients.jsx`
- `src/pages/nutritionist/NutritionistPrescribeDiet.jsx`
- `src/pages/clinician/ClinicianDashboard.jsx`
- `src/pages/clinician/ClinicianPatients.jsx`

## Screen-to-route/component mapping

| Screen family | Route(s) in app | Main implementation entrypoints |
| --- | --- | --- |
| Public, onboarding, auth | `/auth`, `/login`, `/signup`, `/Onboarding`, `/Pricing` | `src/pages/Auth.jsx`, `src/pages/Onboarding.jsx`, `src/pages/Pricing.jsx` |
| Today / dashboard | `/Today` | `src/pages/Today.jsx`, `src/components/today/TodayMobileUI.jsx`, `src/components/today/WeeklyCheckinModal.jsx` |
| Nutrition logging | `/Nutrition` | `src/pages/Nutrition.jsx` |
| My Diet / prescribed diet | `/my-diet`, `/prescribed-diet` | `src/pages/MyDiet.jsx`, `src/pages/MyPrescribedDiet.jsx` |
| Workout planning / routines | `/Workouts`, `/Routines`, `/manual-workout`, `/my-workout`, `/prescribed-workout` | `src/pages/WorkoutsV2.jsx`, `src/pages/Routines.jsx`, `src/pages/ManualWorkoutPlan.jsx`, `src/pages/MyWorkout.jsx`, `src/pages/MyPrescribedWorkout.jsx` |
| Workout execution | state inside `/Workouts` | `src/components/workouts/WorkoutExecutionScreen.jsx` |
| Exercise library / detail | `/Exercises`, `/exercise/:id` | `src/pages/Exercises.jsx`, `src/pages/ExerciseDetail.jsx`, `src/components/exercises/ExerciseCard.jsx` |
| Body / progress / measurements / photos | `/body`, legacy aliases `/Progress`, `/Measurements`, `/progress-photos` | `src/pages/Body.jsx`, `src/pages/Progress.jsx`, `src/pages/Measurements.jsx`, `src/pages/ProgressPhotos.jsx` |
| Protocols / labs | `/Protocols`, `/LabExams` | `src/pages/Protocols.jsx`, `src/pages/LabExams.jsx` |
| Insights / block review / diary | `/Insights`, `/block-review`, `/diary` | `src/pages/Insights.jsx`, `src/pages/BlockReview.jsx`, `src/pages/Diary.jsx` |
| Atlas AI | `/AtlasAI` | `src/pages/AtlasAI.jsx`, `src/components/ai/MessageBubble.jsx` |
| Profile / settings / export / social | `/Profile`, `/Settings`, `/Export`, `/social` | `src/pages/Profile.jsx`, `src/pages/Settings.jsx`, `src/pages/Export.jsx`, `src/pages/Social.jsx` |
| Coach role | `/coach-dashboard`, `/coach/students`, `/coach/student/:id`, `/coach/prescribe-workout/:studentId` | `src/pages/coach/CoachDashboard.jsx`, `src/pages/coach/CoachStudents.jsx`, `src/pages/coach/CoachStudentProfile.jsx`, `src/pages/coach/CoachPrescribeWorkout.jsx` |
| Nutritionist role | `/nutritionist-dashboard`, `/nutritionist/clients`, `/nutritionist/client/:id`, `/nutritionist/prescribe-diet/:clientId` | `src/pages/nutritionist/NutritionistDashboard.jsx`, `src/pages/nutritionist/NutritionistClients.jsx`, `src/pages/nutritionist/NutritionistClientProfile.jsx`, `src/pages/nutritionist/NutritionistPrescribeDiet.jsx` |
| Clinician role | `/clinician-dashboard`, `/clinician/patients`, `/clinician/patient/:id` | `src/pages/clinician/ClinicianDashboardProfessional.jsx`, `src/pages/clinician/ClinicianPatients.jsx`, `src/pages/clinician/ClinicianPatientProfile.jsx` |
| Admin / pricing / help / system states | `/AdminPanel`, `/Pricing`, `/help`, `*` | `src/pages/AdminPanel.jsx`, `src/pages/Pricing.jsx`, `src/pages/HelpCenter.jsx`, `src/lib/PageNotFound.jsx`, `src/components/ErrorBoundary.jsx` |

## Assumptions and implementation notes
- The handoff describes a screen inventory, not 130 separate production routes. Most numbered mockups were implemented as route states, tabs, cards, sheets, dialogs, or inline banners inside existing feature pages.
- The current app architecture already had stable route entrypoints. The implementation preserves that structure and translates the handoff into the existing React Router layout instead of replacing it with static HTML galleries.
- Dark mode is the default experience. Light mode still exists because it is already part of app settings and current product behavior.
- The body area is moving toward `/body` as the canonical hub. Older routes are still supported through legacy redirects.
- Workout execution remains an immersive state inside `src/pages/WorkoutsV2.jsx`. The handoff suggests a dedicated full-screen execution route, but that was not introduced in this pass.
- Atlas AI currently remains a single route. The handoff implies a conversation list plus thread-style navigation; a dedicated conversation route can be added later without reworking the visual system.
- Notification center, account-linking invite screens, and subscription-success return routing are not introduced as new top-level routes in this pass. The styling groundwork and related surfaces are in place, but those route additions remain future integration work.

## Subagent ownership
- Design System Agent
  - Audited `design/index.html` and the four gallery files.
  - Extracted tokens, spacing, radii, shared patterns, and theme mismatches.
- Navigation + Architecture Agent
  - Audited the current route tree and proposed the route/state mapping used in this implementation note.
- Shared Components Agent
  - Drove the shared atlas.core shell direction through the updated token layer and reusable primitives.
- Feature Agent A
  - Implemented auth, onboarding, today, workout planning, workout execution, routines, My Diet, My Workout, and manual builder updates.
- Feature Agent B
  - Implemented exercises, body hub, progress tracking, insights, diary, and Atlas AI updates.
- Feature Agent C/D
  - Implemented settings, export, social, professional role dashboards/lists, admin, and system fallback screens.
- QA / Consistency pass
  - Final integrated build verification completed with `npm run build`.

## Verification
- `npm run build`
  - Passes.
  - Remaining note: Vite reports a large bundle-size warning on the main JS chunk, but the production build completes successfully.
