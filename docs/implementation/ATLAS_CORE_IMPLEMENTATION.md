# atlas.core Design Handoff Implementation

## Short implementation plan

1. Audit the handoff files and normalize them into production concerns: tokens, primitives, routes, and screen states.
2. Apply the atlas.core visual system to the shared shell first: theme tokens, cards, page headers, tab bar, and professional workspace scaffolds.
3. Rebuild high-reuse UI primitives before touching feature screens so the handoff becomes app code rather than copied mockups.
4. Implement feature families in parallel and map mock screens into canonical routes, tabs, sheets, and inline states.
5. Run a consistency pass, preserve existing app logic, and document the remaining assumptions where the mockups were intentionally more detailed than the live route model.

## What changed

### Design system and shell

- Dark-first atlas.core tokens were aligned in [src/index.css](/Users/enzosoler/Documents/atlas.core/src/index.css).
- Shared layout primitives were updated in [src/components/shared/AppContainer.jsx](/Users/enzosoler/Documents/atlas.core/src/components/shared/AppContainer.jsx).
- Professional dashboard/list building blocks were added in [src/components/shared/ProfessionalUI.jsx](/Users/enzosoler/Documents/atlas.core/src/components/shared/ProfessionalUI.jsx).
- The mobile tab shell now follows `Today / Train / Nutrition / Body / More` in [src/components/layout/AppLayout.jsx](/Users/enzosoler/Documents/atlas.core/src/components/layout/AppLayout.jsx) and [src/lib/rbac.js](/Users/enzosoler/Documents/atlas.core/src/lib/rbac.js).
- Legacy body redirects now preserve the correct embedded tab state in [src/lib/routes.js](/Users/enzosoler/Documents/atlas.core/src/lib/routes.js).

### Shared components and cross-cutting states

- Invite, upgrade, trial, support, error, and not-found surfaces were restyled to match the handoff:
  - [src/components/shared/InviteModal.jsx](/Users/enzosoler/Documents/atlas.core/src/components/shared/InviteModal.jsx)
  - [src/components/entitlements/UpgradeGate.jsx](/Users/enzosoler/Documents/atlas.core/src/components/entitlements/UpgradeGate.jsx)
  - [src/components/entitlements/TrialExpiredUpgrade.jsx](/Users/enzosoler/Documents/atlas.core/src/components/entitlements/TrialExpiredUpgrade.jsx)
  - [src/components/ErrorBoundary.jsx](/Users/enzosoler/Documents/atlas.core/src/components/ErrorBoundary.jsx)
  - [src/lib/PageNotFound.jsx](/Users/enzosoler/Documents/atlas.core/src/lib/PageNotFound.jsx)

### Feature families implemented from the handoff

- Public/auth/onboarding:
  - [src/pages/Auth.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/Auth.jsx)
  - [src/pages/Onboarding.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/Onboarding.jsx)
- Today and workout/nutrition core flows:
  - [src/components/today/TodayMobileUI.jsx](/Users/enzosoler/Documents/atlas.core/src/components/today/TodayMobileUI.jsx)
  - [src/components/today/WeeklyCheckinModal.jsx](/Users/enzosoler/Documents/atlas.core/src/components/today/WeeklyCheckinModal.jsx)
  - [src/pages/WorkoutsV2.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/WorkoutsV2.jsx)
  - [src/components/workouts/WorkoutExecutionScreen.jsx](/Users/enzosoler/Documents/atlas.core/src/components/workouts/WorkoutExecutionScreen.jsx)
  - [src/components/workouts/ExerciseSearch.jsx](/Users/enzosoler/Documents/atlas.core/src/components/workouts/ExerciseSearch.jsx)
  - [src/pages/Routines.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/Routines.jsx)
  - [src/components/routines/RoutineCard.jsx](/Users/enzosoler/Documents/atlas.core/src/components/routines/RoutineCard.jsx)
  - [src/components/routines/RoutineForm.jsx](/Users/enzosoler/Documents/atlas.core/src/components/routines/RoutineForm.jsx)
  - [src/pages/MyDiet.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/MyDiet.jsx)
  - [src/pages/MyWorkout.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/MyWorkout.jsx)
  - [src/pages/ManualWorkoutPlan.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/ManualWorkoutPlan.jsx)
- Exercises/body/insights/AI:
  - [src/pages/Body.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/Body.jsx)
  - [src/pages/Progress.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/Progress.jsx)
  - [src/pages/Measurements.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/Measurements.jsx)
  - [src/pages/ProgressPhotos.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/ProgressPhotos.jsx)
  - [src/pages/Exercises.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/Exercises.jsx)
  - [src/pages/ExerciseDetail.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/ExerciseDetail.jsx)
  - [src/components/exercises/ExerciseCard.jsx](/Users/enzosoler/Documents/atlas.core/src/components/exercises/ExerciseCard.jsx)
  - [src/pages/Insights.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/Insights.jsx)
  - [src/pages/BlockReview.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/BlockReview.jsx)
  - [src/pages/Diary.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/Diary.jsx)
  - [src/pages/AtlasAI.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/AtlasAI.jsx)
  - [src/components/ai/MessageBubble.jsx](/Users/enzosoler/Documents/atlas.core/src/components/ai/MessageBubble.jsx)
- Profile/settings/export/social/professional/admin:
  - [src/pages/Settings.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/Settings.jsx)
  - [src/pages/Export.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/Export.jsx)
  - [src/pages/Social.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/Social.jsx)
  - [src/pages/AdminPanel.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/AdminPanel.jsx)
  - [src/pages/coach/CoachDashboard.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/coach/CoachDashboard.jsx)
  - [src/pages/coach/CoachStudents.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/coach/CoachStudents.jsx)
  - [src/pages/nutritionist/NutritionistDashboard.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/nutritionist/NutritionistDashboard.jsx)
  - [src/pages/nutritionist/NutritionistClients.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/nutritionist/NutritionistClients.jsx)
  - [src/pages/nutritionist/NutritionistPrescribeDiet.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/nutritionist/NutritionistPrescribeDiet.jsx)
  - [src/pages/clinician/ClinicianDashboard.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/clinician/ClinicianDashboard.jsx)
  - [src/pages/clinician/ClinicianPatients.jsx](/Users/enzosoler/Documents/atlas.core/src/pages/clinician/ClinicianPatients.jsx)

## Screen-to-route/component mapping

| Screen family | Canonical route(s) | Main entrypoints | Notes |
|---|---|---|---|
| Public / auth / onboarding | `/auth`, `/login`, `/signup`, `/Onboarding`, `/Pricing` | `Auth.jsx`, `Onboarding.jsx`, `Pricing.jsx` | Multiple mock screens are implemented as auth states and onboarding steps rather than separate routes. |
| Today / dashboard | `/Today` | `Today.jsx`, `components/today/*` | Weekly check-in is a sheet/modal state; trial is an inline banner state. |
| Nutrition | `/Nutrition`, `/my-diet`, `/prescribed-diet` | `Nutrition.jsx`, `MyDiet.jsx`, `MyPrescribedDiet.jsx` | Daily logging and diet-plan views are split into canonical logging vs plan screens. |
| Workout planning / routines | `/Workouts`, `/Routines`, `/manual-workout`, `/my-workout`, `/prescribed-workout` | `WorkoutsV2.jsx`, `Routines.jsx`, `ManualWorkoutPlan.jsx`, `MyWorkout.jsx`, `MyPrescribedWorkout.jsx` | Create-plan and exercise-search states live inside the route surface instead of becoming new top-level URLs. |
| Workout execution | `/Workouts` with immersive execution state | `WorkoutsV2.jsx`, `WorkoutExecutionScreen.jsx` | The handoff execution flow is implemented in-app, but still route-embedded rather than moved to a dedicated execution URL. |
| Exercise library | `/Exercises`, `/exercise/:id` | `Exercises.jsx`, `ExerciseDetail.jsx` | Search, favorites, recents, and active filters are handled as in-route state variants. |
| Body / progress tracking | `/body` | `Body.jsx`, `Progress.jsx`, `Measurements.jsx`, `ProgressPhotos.jsx` | `/body?tab=measurements` and `/body?tab=photos` are now the intended embedded destinations for former standalone routes. |
| Labs / protocols | `/LabExams`, `/Protocols` | `LabExams.jsx`, `Protocols.jsx` | Existing clinical flows remain route-based and can continue to use sheets/dialogs for create/edit states. |
| Insights / diary / Atlas AI | `/Insights`, `/block-review`, `/diary`, `/AtlasAI` | `Insights.jsx`, `BlockReview.jsx`, `Diary.jsx`, `AtlasAI.jsx` | The chat list and chat view are implemented inside the Atlas AI surface rather than with per-thread routes. |
| Profile / settings / export / social | `/Profile`, `/Settings`, `/Export`, `/social` | `Profile.jsx`, `Settings.jsx`, `Export.jsx`, `Social.jsx` | Reset, logout, and generation states remain dialogs or inline states. |
| Coach / nutritionist / clinician | Existing role routes under `/coach/*`, `/nutritionist/*`, `/clinician/*` | Role dashboards and list/detail pages under `src/pages/coach`, `src/pages/nutritionist`, `src/pages/clinician` | Invite remains modal-driven through shared professional UI. |
| Admin / pricing / help / system states | `/AdminPanel`, `/Pricing`, `/help`, `/guides/*` | `AdminPanel.jsx`, `Pricing.jsx`, `HelpCenter.jsx`, guide pages, `PageNotFound.jsx`, `ErrorBoundary.jsx` | Admin tabs are implemented inside the admin surface instead of as separate routes. |

## Assumptions and implementation risks

- The 130 mock screens were treated as a state inventory, not as 130 production routes.
- Existing data flows, auth behavior, and role gating were preserved unless the handoff clearly implied a better shared pattern.
- `/body` is now the intended athlete body hub. Older measurement and progress-photo paths are treated as legacy entry points that redirect into the correct body tab.
- Workout execution is visually implemented, but it still lives inside the workouts route. A dedicated execution route would be the cleanest next architectural step if resumable sessions or deep links become important.
- Atlas AI is visually aligned with the handoff, but it still uses a single route. A conversation route such as `/AtlasAI/:conversationId` would improve native back-stack behavior later.
- Notification center, invite deep-link landing, and subscription success remain better represented as future route additions than forced one-off pages inside this pass.

## Subagent ownership summary

- Design System Agent: audited the handoff tokens, component patterns, spacing/radius rules, and the gaps in the existing visual layer.
- Navigation + Architecture Agent: normalized the mock screens into a production route/module model and identified where the mockups should become tabs, sheets, dialogs, or route states.
- Shared Components Agent: updated shared shell primitives and the common dark atlas.core styling layer used across features.
- Feature Agent A: implemented public/auth/onboarding, today, workout planning, workout execution, routines, and diet/workout plan screens.
- Feature Agent B: implemented exercises, body tracking, progress/measurements/photos, insights, diary, and Atlas AI surfaces.
- Feature Agent C/D: implemented settings, export, social, role dashboards/lists, admin surfaces, invite UI, and system fallback states.
- Main integration pass: merged shell/navigation adjustments, fixed legacy body redirects, ran the build, and documented the final route/component mapping.

## Verification

- `npm run build`
- Result: success on March 22, 2026, with a pre-existing Vite large-chunk warning only.
