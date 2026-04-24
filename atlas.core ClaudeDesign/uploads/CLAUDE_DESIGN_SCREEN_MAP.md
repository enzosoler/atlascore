# Atlas Core Screen Map

Purpose: give Claude Designer a concrete rebuild checklist from the current repo, not from memory.

## Source Of Truth Files

- Active router: [src/App.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/App.jsx)
- Canonical route ids and planned states: [src/redesign/registry/screen-registry.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/registry/screen-registry.js)
- Older registry draft: [src/lib/navigation/screen-registry.ts](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/navigation/screen-registry.ts)
- Legacy redesign registry: [src/redesign/registry/route-config.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/registry/route-config.js)
- Claude Design `v3` gallery + routes: [src/redesign/v3](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3)

## 1. Active Mounted Screens In The Current App

These are the routes actually mounted right now from `src/App.jsx`.

### Public / Marketing

- `/` and `/landing` -> `Landing` -> [src/redesign/v2/marketing/Landing.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/marketing/Landing.jsx)
  Function: marketing home / primary acquisition page.
- `/pricing` -> `Pricing` -> [src/redesign/v2/marketing/Pricing.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/marketing/Pricing.jsx)
  Function: pricing and upgrade framing.
- `/terms` -> `Terms` -> [src/redesign/v2/marketing/Terms.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/marketing/Terms.jsx)
  Function: terms of service.
- `/privacy` -> `Privacy` -> [src/redesign/v2/marketing/Privacy.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/marketing/Privacy.jsx)
  Function: privacy policy.

### Auth

- `/welcome` -> `WelcomeRoute` wrapper -> [src/redesign/v2/auth/Welcome.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/auth/Welcome.jsx)
  Function: pre-auth intro / choose sign in or sign up.
- `/auth/login` -> `Login` -> [src/redesign/v2/auth/Login.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/auth/Login.jsx)
  Function: sign in.
- `/auth/signup` -> `Signup` -> [src/redesign/v2/auth/Signup.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/auth/Signup.jsx)
  Function: create account.
- `/auth/forgot` -> `ForgotPassword` -> [src/redesign/v2/auth/ForgotPassword.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/auth/ForgotPassword.jsx)
  Function: password reset request.
- `/auth/reset` -> `ResetPassword` -> [src/redesign/v2/auth/ResetPassword.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/auth/ResetPassword.jsx)
  Function: set new password.
- `/auth/magic` -> `MagicLinkSent` -> [src/redesign/v2/auth/MagicLinkSent.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/auth/MagicLinkSent.jsx)
  Function: email-magic-link confirmation state.
- `/auth/callback` -> `ComingSoonNav("Authenticating")`
  Function: temporary auth callback placeholder.

### Onboarding

- `/onboarding` -> `OnboardingRoot` -> [src/redesign/v2/onboarding/OnboardingRoot.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/onboarding/OnboardingRoot.jsx)
- `/onboarding/goal` -> `OnboardingGoal` -> [src/redesign/v2/onboarding/OnboardingGoal.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/onboarding/OnboardingGoal.jsx)
- `/onboarding/activity` -> `OnboardingActivity` -> [src/redesign/v2/onboarding/OnboardingActivity.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/onboarding/OnboardingActivity.jsx)
- `/onboarding/stats` -> `OnboardingStats` -> [src/redesign/v2/onboarding/OnboardingStats.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/onboarding/OnboardingStats.jsx)
- `/onboarding/diet` -> `OnboardingDiet` -> [src/redesign/v2/onboarding/OnboardingDiet.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/onboarding/OnboardingDiet.jsx)
- `/onboarding/workout` -> `OnboardingWorkout` -> [src/redesign/v2/onboarding/OnboardingWorkout.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/onboarding/OnboardingWorkout.jsx)
- `/onboarding/habits` -> `OnboardingHabits` -> [src/redesign/v2/onboarding/OnboardingHabits.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/onboarding/OnboardingHabits.jsx)
- `/onboarding/constraints` -> `OnboardingConstraints` -> [src/redesign/v2/onboarding/OnboardingConstraints.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/onboarding/OnboardingConstraints.jsx)
- `/onboarding/summary` -> `OnboardingSummary` -> [src/redesign/v2/onboarding/OnboardingSummary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/onboarding/OnboardingSummary.jsx)
- `/onboarding/paywall` -> `OnboardingPaywall` -> [src/redesign/v2/onboarding/OnboardingPaywall.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/onboarding/OnboardingPaywall.jsx)
- `/onboarding/tour` -> `OnboardingTour` -> [src/redesign/v2/onboarding/OnboardingTour.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/onboarding/OnboardingTour.jsx)
- `/onboarding/smart` -> `SmartOnboarding` -> [src/redesign/v2/onboarding/SmartOnboarding.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/onboarding/SmartOnboarding.jsx)

### App Core

- `/app/today` -> `Today` -> [src/redesign/v2/today/Today.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/today/Today.jsx)
  Function: primary daily dashboard.
- `/app/weekly` -> `WeeklyReview` -> [src/redesign/v2/today/WeeklyReview.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/today/WeeklyReview.jsx)
  Function: weekly review summary.
- `/app/insights` -> `InsightsScreen` -> [src/redesign/v2/today/Insights.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/today/Insights.jsx)
  Function: premium insights.
- `/app/diary` -> `Diary` -> [src/redesign/v2/today/Diary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/today/Diary.jsx)
  Function: cross-domain timeline / daily log.
- `/app/today/focus` -> `FocusModeRoute` -> [src/redesign/v2/today/FocusMode.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/today/FocusMode.jsx)
- `/app/today/streaks` -> `StreaksDetailRoute` -> [src/redesign/v2/today/StreaksDetail.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/today/StreaksDetail.jsx)
- `/app/today/celebrate/:kind` -> `CelebrationsRoute` -> [src/redesign/v2/today/Celebrations.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/today/Celebrations.jsx)
- `/app/plan` -> `AppPlaceholder("Plan")`

### Nutrition

- `/app/nutrition` -> `NutritionToday` -> [src/redesign/v2/nutrition/NutritionToday.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/nutrition/NutritionToday.jsx)
- `/app/nutrition/diary` -> `FoodDiaryRoute` -> [src/redesign/v2/nutrition/FoodDiary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/nutrition/FoodDiary.jsx)
- `/app/nutrition/targets` -> `MacroTargetsRoute` -> [src/redesign/v2/nutrition/MacroTargets.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/nutrition/MacroTargets.jsx)
- `/app/nutrition/water` -> `WaterLogRoute` -> [src/redesign/v2/nutrition/WaterLog.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/nutrition/WaterLog.jsx)
- `/app/nutrition/meal-plans` -> `MealPlansRoute` -> [src/redesign/v2/nutrition/MealPlans.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/nutrition/MealPlans.jsx)
- `/app/nutrition/search` -> `FoodSearch` -> [src/redesign/v2/nutrition/FoodSearch.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/nutrition/FoodSearch.jsx)
- `/app/nutrition/food/new` -> `CustomFoodRoute` -> [src/redesign/v2/nutrition/CustomFood.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/nutrition/CustomFood.jsx)
- `/app/nutrition/food/:id` -> `FoodDetail` -> [src/redesign/v2/nutrition/FoodDetail.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/nutrition/FoodDetail.jsx)
- `/app/nutrition/meal/:id` -> `MealDetailRoute` -> [src/redesign/v2/nutrition/MealDetail.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/nutrition/MealDetail.jsx)
- `/app/nutrition/photo` -> `PhotoScan` -> [src/redesign/v2/nutrition/PhotoScan.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/nutrition/PhotoScan.jsx)
- `/app/nutrition/photo/confirm` -> `PhotoScanConfirm` -> [src/redesign/v2/nutrition/PhotoScanConfirm.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/nutrition/PhotoScanConfirm.jsx)
- `/app/nutrition/voice` -> `VoiceLog` -> [src/redesign/v2/nutrition/VoiceLog.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/nutrition/VoiceLog.jsx)

### Workouts / Training

- `/app/workouts` -> `WorkoutsHome` -> [src/redesign/v2/workouts/WorkoutsHome.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/workouts/WorkoutsHome.jsx)
- `/app/workouts/history` -> `WorkoutHistory` -> [src/redesign/v2/workouts/WorkoutHistory.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/workouts/WorkoutHistory.jsx)
- `/app/workouts/:id` -> `WorkoutDetail` -> [src/redesign/v2/workouts/WorkoutDetail.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/workouts/WorkoutDetail.jsx)
- `/app/workouts/active` -> `ActiveWorkout` -> [src/redesign/v2/workouts/ActiveWorkout.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/workouts/ActiveWorkout.jsx)
- `/app/workouts/manual-plan` and `/app/workouts/plan-builder` -> `ManualWorkoutPlan` -> [src/redesign/v2/workouts/ManualWorkoutPlan.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/workouts/ManualWorkoutPlan.jsx)
- `/app/routines` -> `Routines` -> [src/redesign/v2/workouts/Routines.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/workouts/Routines.jsx)
- `/app/routines/presets` -> `RoutinePresetsRoute` -> [src/redesign/v2/workouts/RoutinePresets.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/workouts/RoutinePresets.jsx)
- `/app/routines/presets/:id` -> `RoutinePresetDetailRoute` -> [src/redesign/v2/workouts/RoutinePresetDetail.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/workouts/RoutinePresetDetail.jsx)
- `/app/routines/:id` -> `RoutineDetailRoute`
- `/app/exercises` -> `ExerciseLibrary` -> [src/redesign/v2/workouts/ExerciseLibrary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/workouts/ExerciseLibrary.jsx)
- `/app/exercises/:id` -> `ExerciseDetail` -> [src/redesign/v2/workouts/ExerciseDetail.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/workouts/ExerciseDetail.jsx)
- `/app/protocols` and `/app/protocols/*` -> placeholders today.

### Body / Measurements / Progress

- `/app/body` -> `BodyOverview` -> [src/redesign/v2/body/BodyOverview.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/body/BodyOverview.jsx)
- `/app/body/progress/photos` -> `ProgressPhotos` -> [src/redesign/v2/body/ProgressPhotos.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/body/ProgressPhotos.jsx)
- `/app/body/composition` -> `BodyCompositionHistoryRoute` -> [src/redesign/v2/body/BodyCompositionHistory.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/body/BodyCompositionHistory.jsx)
- `/app/body/weight` -> `WeightEntry` -> [src/redesign/v2/body/WeightEntry.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/body/WeightEntry.jsx)
- `/app/body/checkin` -> `BodyCheckIn` -> [src/redesign/v2/body/BodyCheckIn.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/body/BodyCheckIn.jsx)
- `/app/body/measurements` -> `MeasurementsRoute` -> [src/redesign/v2/body/Measurements.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/body/Measurements.jsx)
- `/app/body/compare` -> `ProgressComparisonRoute` -> [src/redesign/v2/body/ProgressComparison.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/body/ProgressComparison.jsx)

### Labs

- `/app/labs` -> `LabsOverview` -> [src/redesign/v2/labs/LabsOverview.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/labs/LabsOverview.jsx)
- `/app/labs/history` -> `LabHistory` -> [src/redesign/v2/labs/LabHistory.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/labs/LabHistory.jsx)
- `/app/labs/exam/:id` -> `LabExamDetail` -> [src/redesign/v2/labs/LabExamDetail.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/labs/LabExamDetail.jsx)
- `/app/labs/biomarker/:id` -> `BiomarkerDetail` -> [src/redesign/v2/labs/BiomarkerDetail.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/labs/BiomarkerDetail.jsx)
- `/app/labs/upload` -> `LabUpload` -> [src/redesign/v2/labs/LabUpload.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/labs/LabUpload.jsx)

### Coach / AI

- `/app/coach` -> `CoachHome` -> [src/redesign/v2/coach/CoachHome.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/coach/CoachHome.jsx)
- `/app/coach/chat` -> `CoachChat` -> [src/redesign/v2/coach/CoachChat.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/coach/CoachChat.jsx)
- `/app/coach/insights/:id` -> `CoachInsightDetail` -> [src/redesign/v2/coach/CoachInsightDetail.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/coach/CoachInsightDetail.jsx)

### Profile / Settings / Billing / Social

- `/app/profile` -> `Profile` -> [src/redesign/v2/profile/Profile.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/profile/Profile.jsx)
- `/app/profile/edit` -> `ProfileEditorRoute` -> [src/redesign/v2/profile/ProfileEditor.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/profile/ProfileEditor.jsx)
- `/app/settings` -> `SettingsHub` -> [src/redesign/v2/settings/SettingsHub.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/settings/SettingsHub.jsx)
- `/app/settings/account` -> `AccountSettings` -> [src/redesign/v2/settings/AccountSettings.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/settings/AccountSettings.jsx)
- `/app/settings/integrations` -> `Integrations` -> [src/redesign/v2/settings/Integrations.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/settings/Integrations.jsx)
- `/app/settings/danger` -> `DangerZone` -> [src/redesign/v2/settings/DangerZone.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/settings/DangerZone.jsx)
- `/app/settings/diagnostics` -> `AppDiagnosticsRoute` -> [src/redesign/v2/system/AppDiagnostics.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/system/AppDiagnostics.jsx)
- `/app/billing` -> `SubscriptionSettingsRoute` -> [src/redesign/v2/billing/SubscriptionSettings.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/billing/SubscriptionSettings.jsx)
- `/app/billing/paywall` and `/app/billing/plans` -> `PaywallRoute` -> [src/redesign/v2/billing/Paywall.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/billing/Paywall.jsx)
- `/app/billing/invoices` -> `BillingHistoryRoute` -> [src/redesign/v2/billing/BillingHistory.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/billing/BillingHistory.jsx)
- `/app/billing/cancel` -> `CancelFlowRoute` -> [src/redesign/v2/billing/CancelFlow.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/billing/CancelFlow.jsx)
- `/app/social` -> `SocialFeedRoute` -> [src/redesign/v2/social/SocialFeed.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/social/SocialFeed.jsx)
- `/app/social/friends` -> `FriendsRoute` -> [src/redesign/v2/social/Friends.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/social/Friends.jsx)
- `/app/social/follow` -> `FollowRoute` -> [src/redesign/v2/social/Follow.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/social/Follow.jsx)
- `/app/u/:username` -> `PublicProfileRoute` -> [src/redesign/v2/social/PublicProfile.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/social/PublicProfile.jsx)
- `/app/social/share` -> `ShareWorkoutRoute` -> [src/redesign/v2/social/ShareWorkout.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/social/ShareWorkout.jsx)

### System / Error / Utilities

- `/app/offline` -> `OfflineRoute` -> [src/redesign/v2/system/Offline.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/system/Offline.jsx)
- `/maintenance` -> `MaintenanceRoute` -> [src/redesign/v2/system/Maintenance.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/system/Maintenance.jsx)
- `/force-update` -> `ForceUpdateRoute` -> [src/redesign/v2/system/ForceUpdate.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/system/ForceUpdate.jsx)
- `/500` -> `ServerErrorRoute` -> [src/redesign/v2/system/ServerError.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/system/ServerError.jsx)
- `/404` and `*` -> `NotFoundRoute` -> [src/redesign/v2/system/NotFound.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v2/system/NotFound.jsx)
- `/admin/*`, `/pro/*`, `/blog/*`, `/guides/*`, `/help` fallback placeholders -> `ComingSoonNav`

## 2. Active Claude-Design `v3` Screens

These are the paper/ink/amber screens translated from the Claude Design bundle.

- Gallery route: `/v3` -> [src/redesign/v3/gallery/V3Gallery.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/gallery/V3Gallery.jsx)
- Running app shell: `/app/v3/*` -> [src/redesign/v3/layouts/V3AppShell.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/layouts/V3AppShell.jsx)

Mounted `v3` app tabs:

- `/app/v3/today` -> [src/redesign/v3/routes/V3Today.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3Today.jsx)
- `/app/v3/train` -> [src/redesign/v3/routes/V3Train.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3Train.jsx)
- `/app/v3/eat` -> [src/redesign/v3/routes/V3Eat.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3Eat.jsx)
- `/app/v3/body` -> [src/redesign/v3/routes/V3Body.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3Body.jsx)
- `/app/v3/you` -> [src/redesign/v3/routes/V3You.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3You.jsx)

All translated `v3` design screens:

- `S1_Splash_A`, `S1_Splash_B`
- `S2_Today_A`
- `S3_Workout_A`
- `S4_Nutrition_A`
- `S5_Paywall_A`, `S5_Paywall_B`
- `S6_Weight_A`, `S6_Weight_B`
- `S7_Onboard_Identity`
- `S8_Onboard_Goal`
- `S9_Onboard_Activity`
- `S10_Onboard_Plan`
- `S11_Onboard_Permissions`
- `S12_Coach_Chat`
- `S13_Coach_Brief`
- `S14_Body_Dashboard`
- `S15_Labs_Inbox`
- `S16_Biomarker_Detail`
- `S17_Measurements_Entry`
- `S18_Progress_Photos`
- `S19_Settings`
- `S20_PR_Gallery`
- `S21_Share_Card`
- `S22_Notifications`
- `S23_Empty_States`
- `S24_Library`
- `S25_Program_Detail`
- `S26_Calendar`
- `S27_Exercise_Detail`
- `S28_Crew`
- `S29_Workout_Summary`
- `S30_Weekly_Recap`
- `S31_Sleep_Detail`
- `S32_Capture`
- `S33_Profile`
- `S34_Watch`
- `S35_Search`

Files live in [src/redesign/v3/screens](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/screens).

## 3. Canonical Screen Checklist For Redesign Work

If Claude Designer is rebuilding the product screen by screen, use [src/redesign/registry/screen-registry.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/registry/screen-registry.js) as the canonical checklist.

Canonical domains in that file:

- Marketing: `Landing`, `Pricing`, `Waitlist`, `BlogIndex`, `BlogPost`, `GuidesIndex`, `GuideDetail`, `UseCasePage`, `HelpCenter`, `Privacy`, `Terms`, `InviteAccept`
- Auth: `Splash`, `Welcome`, `Auth`, `Login`, `Signup`, `AuthCallback`, `ForgotPassword`, `ResetPassword`, `MagicLinkSent`, `Logout`
- Onboarding: `OnboardingRoot`, `OnboardingGoal`, `OnboardingActivity`, `OnboardingStats`, `OnboardingDiet`, `OnboardingWorkout`, `OnboardingHabits`, `OnboardingConstraints`, `OnboardingSummary`, `OnboardingPaywall`, `OnboardingTour`, `SmartOnboarding`
- Today: `Today`, `WeeklyReview`, `Insights`, `Diary`, `BlockReview`, `Plan`, `DecisionEngine`
- Nutrition: `NutritionToday`, `NutritionHistory`, `MacroTargets`, `MealPlan`, `MyDiet`, `PrescribedDiet`, `FoodSearch`, `FoodDetail`, `RecipeDetail`, `RecipeLibrary`, `BarcodeScan`, `PhotoScan`, `PhotoScanConfirm`
- Workouts: `WorkoutsHome`, `WorkoutLibrary`, `WorkoutDetail`, `ActiveWorkout`, `WorkoutHistory`, `MyWorkout`, `PrescribedWorkout`, `ManualWorkoutPlan`, `PlanBuilderWizard`, `Routines`, `RoutineDetail`, `Protocols`, `ProtocolDetail`, `ProtocolForm`, `ExerciseLibrary`, `ExerciseDetail`
- Body: `BodyOverview`, `BodyProfile`, `WeightEntry`, `BodyComposition`, `Measurements`, `Progress`, `ProgressPhotos`, `ProgressPhotoView`, `BodyCheckIn`
- Labs: `LabsOverview`, `LabExamDetail`, `BiomarkerDetail`, `LabUpload`, `LabHistory`
- Coach: `CoachHome`, `CoachChat`, `CoachInsightDetail`
- Profile/Settings: `Profile`, `ProfileEdit`, `SettingsHub`, `AccountSettings`, `NotificationSettings`, `PrivacySettings`, `AppearanceSettings`, `Integrations`, `LanguageSettings`, `DataExport`, `DangerZone`
- Billing: `BillingOverview`, `Checkout`, `PlanPicker`, `TrialStart`, `TrialExplain`, `DiscountOffer`, `RestorePurchases`, `ManageSubscription`, `CancelFlow`, `UpgradePrompt`
- Social: `SocialHome`, `ShareComposer`, `CreatorDashboard`, `CreatorCode`, `Referrals`
- Admin/Pro: `AdminHome`, `AdminUsers`, `AdminSubscriptions`, `AdminAudit`, `AdminFeatureFlags`, `AdminAnalytics`, `AdminSettings`, `CoachProDashboard`, `NutritionistDashboard`, `ClinicianDashboard`, `ProClientList`, `ProClientDetail`
- System/Dev: `NotFound`, `ServerError`, `Offline`, `Maintenance`, `PermissionNotifications`, `PermissionCamera`, `PermissionHealth`, `Styleguide`, `TokenGallery`, `ComponentGallery`

## 4. State Screens Claude Must Not Forget

These appear either as dedicated routes or as required states in the registry.

- Splash / launch: `Splash`, `S1_Splash_A`, `S1_Splash_B`
- Loading: [src/pages/LoadingState.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/LoadingState.jsx), [src/components/ui/LoadingState.tsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/ui/LoadingState.tsx)
- Empty state: [src/pages/EmptyState.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/EmptyState.jsx), [src/components/ui/EmptyState.tsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/ui/EmptyState.tsx), `S23_Empty_States`
- Error state: [src/pages/ErrorState.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/ErrorState.jsx), [src/components/ui/ErrorState.tsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/ui/ErrorState.tsx), `NotFound`, `ServerError`
- Offline: [src/pages/OfflineState.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/OfflineState.jsx), `OfflineRoute`
- Permissions: [src/pages/PermissionsScreen.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/PermissionsScreen.jsx), `PermissionNotifications`, `PermissionCamera`, `PermissionHealth`
- No results / search empty: [src/pages/NoResults.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/NoResults.jsx), [src/pages/SearchResults.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/SearchResults.jsx), `FoodSearch`, `S35_Search`
- Welcome / onboarding entry: [src/pages/WelcomeScreen.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/WelcomeScreen.jsx), [src/pages/WelcomeOnboarding.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/WelcomeOnboarding.jsx)

## 5. Overlay / Modal / Sheet Inventory

Canonical overlay checklist from `screen-registry.js`:

- `AuthModal`
- `QuickLogSheet`
- `MealEditSheet`
- `PortionEditorSheet`
- `FoodSearchSheet`
- `PhotoScanSheet`
- `BarcodeScanSheet`
- `QuickWorkoutModal`
- `WorkoutGuardSheet`
- `ShareWorkoutSheet`
- `PlanBuilderWizard`
- `BodyCheckinSheet`
- `WeeklyCheckinModal`
- `CoachChatSheet`
- `AIGenerationWizard`
- `PaywallTrigger`
- `SubscriptionManagerSheet`
- `InviteModal`
- `CreatorCodeModal`
- `ShareFlowSheet`
- `EnhancedShareModal`
- `ImageCropperModal`
- `SupportWidget`
- `OnboardingTourSheet`
- `StartFreshModal`
- `UnsavedChangesDialog`
- `ConfirmDestructiveDialog`

Actual overlay/component files live mainly in [src/components](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components).

## 6. Component Inventory By Domain

This section is grouped by folder so the inventory stays usable. Each line lists the files in that family, what they do, and what screens they usually attach to.

### Global / App Shell

- [src/components/app](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/app)
  Files: `AppBootstrap`, `AppShell`, `DailyCheckinGate`, `MobileFormLayout`, `ResponsiveModal`
  Function: global app bootstrapping, shell layout, cross-route gating, mobile modal patterns.
  Attached to: app-wide routing and all authed surfaces.

- [src/components/layout](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/layout)
  Files: `AppLayout`, `AppLayoutV2`, `usePrimaryRouteScrollReset`, `usePrimaryRouteScrollReset 2`
  Function: app navigation chrome and scroll-reset behavior.
  Attached to: legacy and v2 app shells.

- [src/components/shared](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/shared)
  Files: `AdherenceComparison`, `AppContainer`, `DataState`, `ImageCropper`, `InviteModal`, `MobileSheet`, `PendingInvites`, `ProfessionalLinks`, `ProfessionalUI`, `SetupGeneratingScreen`, `StablePage`, `SupportWidget`, `ThemeToggleButton`, `TrialBanner`
  Function: shared framing, reusable modal/sheet patterns, support, state wrappers.
  Attached to: many routes across app, settings, onboarding, social, profile.

- [src/components/ui](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/ui)
  Files: typed atoms `AppContainer`, `Badge`, `BugFixesV2`, `Button`, `Card`, `EmptyState`, `ErrorState`, `Input`, `LoadingState`, `PageHeader`, `PremiumDetailsV2`, `Section`, `Select`, `Skeleton`; primitive set `accordion`, `alert-dialog`, `alert`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input-otp`, `input`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `toggle-group`, `toggle`, `tooltip`, `use-toast`
  Function: design-system primitives and reusable UI atoms.
  Attached to: effectively everywhere.

### Today / Dashboard

- [src/components/today](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today)
  Files: `AICoachBriefing`, `AIRecommendations`, `AdherenceScore`, `AlertsSection`, `DailyHeroCard`, `Day1Banner`, `MacroRing`, `MetricCardsRow`, `MilestoneCard`, `ProgressReviewCard`, `ProgressSnapshot`, `QuickActions`, `QuickCheckin`, `ReadinessRow`, `SubscriptionBanner`, `TodayMobileUI`, `TodayNutrition`, `TodayPlanSection`, `TodayWorkout`, `WeeklyCheckinModal`, `WeeklyReview`, `WeeklySummary`
  Function: cards and composites for `Today`, weekly recap, quick actions, daily status, hero sections.
  Attached to: `TodayV2`, `src/redesign/v2/today/Today.jsx`, weekly review surfaces.

- [src/components/dashboard](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/dashboard)
  Files: `DecisionEngineDashboard`, `NutritionCard`, `ProtocolCard`, `TimelineCard`, `WorkoutCard`
  Function: dashboard widgets and decision-engine summaries.
  Attached to: dashboard/today/admin and insights surfaces.

### Nutrition

- [src/components/nutrition](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/nutrition)
  Files: `AIFoodInput`, `AINutritionSuggestions`, `FoodCameraScanner`, `FoodPickerSheet`, `FoodSearch`, `MacroProgressBar`, `ManualFoodEntry`, `MealCard`, `MealEditModal`, `MealTimeline`, `NutritionComparison`, `NutritionHeroCard`, `NutritionModeSelector`, `NutritionQuickActions`, `NutritionTrackerV2`, `QuickLogSheet`, `QuickMealLog`, `QuickMealSheet`
  Function: nutrition capture, search, scan, meal editing, macro display, quick-log flows.
  Attached to: `Nutrition.jsx`, `NutritionToday`, `TodayV2`, diary and AI nutrition flows.

### Workouts / Exercises / Routines

- [src/components/workouts](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/workouts)
  Files: `AIWorkoutInput`, `ExerciseAutocomplete`, `ExerciseDetail`, `ExerciseSearch`, `PlanBuilderWizard`, `QuickWorkoutCreate`, `QuickWorkoutModal`, `RestTimer`, `ShareWorkoutModal`, `WorkoutComparison`, `WorkoutExecution`, `WorkoutExecutionScreen`, `WorkoutGuardSheet`
  Function: workout builder, live execution, rest timing, sharing, exercise search/detail.
  Attached to: workout home, active workout, plan builder, exercise detail, premium gates.

- [src/components/exercises](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/exercises)
  Files: `ExerciseCard`, `ExerciseMedia`
  Function: exercise catalog presentation.
  Attached to: exercise library and detail.

- [src/components/routines](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/routines)
  Files: `RoutineCard`, `RoutineForm`
  Function: routine list cards and routine editing.
  Attached to: routines screens.

### Body / Progress / Measurements

- [src/components/body](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/body)
  Files: `BodyCheckinSheet`, `BodyCheckinSheetV2`
  Function: body check-in modal flows.
  Attached to: today weekly prompts and body tracking screens.

- [src/components/measurements](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/measurements)
  Files: `MeasurementInsights`
  Function: rules-based measurement summary.
  Attached to: measurements and body progress surfaces.

- [src/components/progress](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/progress)
  Files: `ChartCard`, `ProgressPhotoCarousel`
  Function: charts and progress-photo carousels.
  Attached to: progress / body / photos routes.

### Coach / AI

- [src/components/ai](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/ai)
  Files: `AIGenerateWizard`, `AIMealSuggestion`, `AIMeasurementProjection`, `AIProgressAnalysis`, `AITodayInsight`, `AITodayInsightV2`, `AIWorkoutSuggestion`, `CoachChatSheet`, `CoachChatSheetV2`, `CoachChatTrigger`, `MessageBubble`
  Function: AI assist surfaces, suggestion cards, coach chat UI.
  Attached to: today, nutrition, body, coach home/chat.

- [src/components/coach](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/coach)
  Files: `CoachAdherenceScore`, `CoachStudentAdherence`, `StudentProgressMetrics`, `WorkoutComparisonCard`
  Function: coach-facing analytics and athlete summaries.
  Attached to: coach / pro dashboards.

### Profile / Settings / Account

- [src/components/profile](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/profile)
  Files: `AccountTab`, `AchievementsSection`, `BodyBiometricsTab`, `FitnessSetupTab`, `PreferencesTab`, `ProfileFormField`
  Function: profile editing tabs and profile-specific widgets.
  Attached to: `ProfileEdit.jsx`, `ProfileV2`, account/profile routes.

- [src/components/checkin](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/checkin)
  Files: `CheckinHistory`, `CheckinPrompt`, `StreakBadge`
  Function: check-in history and streak UI.
  Attached to: today and body flows.

- [src/components/system](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/system)
  Files: `MilestoneSystem`, `StartFreshModal`
  Function: achievements/milestones and dangerous reset flows.
  Attached to: settings, today, social share logic.

### Billing / Entitlements / Pricing

- [src/components/entitlements](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/entitlements)
  Files: `PaywallTrigger`, `TrialExpiredUpgrade`, `UpgradeGate`
  Function: gating and upgrade prompts.
  Attached to: billing and locked premium actions.

- [src/components/pricing](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/pricing)
  Files: `RegionSelector`
  Function: region-aware pricing switcher.
  Attached to: pricing and checkout surfaces.

### Social / Affiliate / Public

- [src/components/social](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/social)
  Files: `EnhancedShareModal`, `ShareFlow`, `ShareableProofCards`, `StreakShareCard`
  Function: share cards, referral/share flows, social proof exports.
  Attached to: social feed, post-workout share, streak milestones.

- [src/components/affiliate](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/affiliate)
  Files: `CreatorCodeModal`, `CreatorDashboard`
  Function: creator/affiliate surfaces.
  Attached to: creator and social monetization flows.

- [src/components/public](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/public)
  Files: `PublicMetadata`, `PublicSiteShell`
  Function: public-site shell and metadata.
  Attached to: marketing routes.

### Admin / Pro / Professional

- [src/components/admin](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/admin)
  Files: `AdminFunnelBar`, `AdminLayout`, `AdminLayoutV2`, `AdminSparkline`, `ImpersonationBanner`, `SubscriptionManager`
  Function: admin analytics, impersonation, subscription management.
  Attached to: `/admin` surfaces.

- [src/components/nutritionist](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/nutritionist)
  Files: `ClientListWithAdherence`, `ClientPdfExport`, `DietPlanVsExecution`, `NutritionistAlertsPanel`, `NutritionistClientAdherence`
  Function: nutritionist dashboard and client reporting.
  Attached to: `/pro/nutritionist`, nutritionist client profiles.

- [src/components/protocols](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/protocols)
  Files: `AIInsightsBanner`, `AdherenceWidget`, `CadenceScheduleView`, `LogDoseForm`, `ProtocolCard`, `ProtocolForm`, `ProtocolTimeline`, `QuickAddTemplates`, `SubstancePicker`, `TodayDoseSection`
  Function: protocols logging and adherence.
  Attached to: protocol screens and related dashboards.

- [src/components/content](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/content)
  Files: `BlogPostCTA`, `BlogPostLayout`, `GuideCard`, `TestimonialsSection`
  Function: marketing/blog content blocks.
  Attached to: public content pages.

- [src/components/github](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/github)
  Files: `PRCard`, `PRStats`
  Function: GitHub/admin reporting widgets.
  Attached to: admin/internal surfaces.

### Auth / Routing / RBAC / Misc

- [src/components/auth](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/auth)
  Files: `GoogleSignInButton`
  Function: social login CTA.
  Attached to: auth screens.

- [src/components/rbac](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/rbac)
  Files: `RoleGate`, `RouteGuard`
  Function: permission/role gating.
  Attached to: protected routes and role-based surfaces.

- [src/components/routing](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/routing)
  Files: `WebOnlyRoute`
  Function: web-only route guard.
  Attached to: route layer.

- Root misc components:
  - [src/components/AtlasCoreLogoSVG.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/AtlasCoreLogoSVG.jsx)
  - [src/components/EntitlementGate.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/EntitlementGate.jsx)
  - [src/components/ErrorBoundary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/ErrorBoundary.jsx)
  - [src/components/LocaleSwitcher.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/LocaleSwitcher.jsx)
  - [src/components/NavigationV2.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/NavigationV2.jsx)
  - [src/components/UserNotRegisteredError.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/UserNotRegisteredError.jsx)
  Function: app-wide support pieces.

## 7. Legacy Page Inventory Still In Repo

These files still exist under [src/pages](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages). Many are legacy, experiments, or alternate implementations, but Claude should know they exist so it does not accidentally miss a surface:

- Account/account-adjacent: `Account`, `Account-Redesigned`, `AccountStatus`, `DeleteAccount`, `ConnectedServices`, `NotificationSettings`, `Settings`, `Integrations`, `PrivacyScreen`, `PrivacyPolicy`, `ThemeScreen`, `LanguageScreen`
- Auth/onboarding: `AppleAuth`, `Auth`, `Auth-Redesigned`, `AuthV2`, `AuthCallback`, `EmailAuth`, `InviteAccept`, `ManageConsent`, `Onboarding`, `OnboardingV2`, `SplashScreen`, `SuccessConfirm`, `UpdatePassword`, `WelcomeOnboarding`, `WelcomeScreen`
- Today/dashboard: `Dashboard`, `ActivityScreen`, `ExploreScreen`, `FeedList`, `MessagesChat`, `NotificationsScreen`, `TodayV2`, `TodayV2-Redesigned`, `TrainV2`
- Nutrition: `Nutrition`, `Nutrition-Redesigned`, `Diary`, `MyDiet`, `MyPrescribedDiet`
- Workouts: `Workout`, `Workouts`, `WorkoutsV2`, `WorkoutsV2-Redesigned`, `ManualWorkoutPlan`, `MyWorkout`, `MyPrescribedWorkout`, `Exercises`, `ExerciseDetail`, `Routines`, `Protocols`, `ProtocolDetail`, `ProtocolFormPage`
- Body/progress/labs: `Body`, `BodyProfile`, `Measurements`, `Progress`, `ProgressV2`, `ProgressPhotos`, `ProgressPhotosV2`, `LabExams`
- Billing/paywall: `BillingManagement`, `Checkout`, `DiscountScreen`, `Pricing`, `Reactivation`, `RestorePurchases`, `SubscriptionTier`, `TrialExplanation`, `TrialStart`, `UpgradePrompts`
- Social/public/misc: `Achievements`, `Changelog`, `ContactSupport`, `CreateAction`, `CreationFlow`, `DataExport`, `DemoHome`, `DetailView`, `Export`, `Goals`, `HelpCenter`, `Insights`, `Landing`, `Leaderboard`, `NoResults`, `OfflineState`, `PermissionDenied`, `PermissionsScreen`, `Plan`, `RateApp`, `Referral`, `ReportProblem`, `SavedFavorites`, `SearchResults`, `ShareTarget`, `SharedWorkout`, `Social`, `SocialAuth`, `StoryLanding`, `StreaksMilestones`, `TermsOfService`, `TermsPrivacy`, `Tutorial`, `UseCase`, `UserContent`, `Waitlist`, `EmptyState`, `ErrorState`, `LoadingState`

## 8. Legacy Redesign Inventory Still In Repo

These older redesign files exist even if they are not the active router target:

- [src/redesign/screens](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/screens)
  Domains/files:
  - `admin/AdminScreens`
  - `auth/Auth`, `auth/Welcome`
  - `billing/BillingScreens`, `billing/OnboardingPaywall`
  - `body/BodyOther`, `body/BodyOverview`
  - `coach/CoachChat`, `coach/CoachOther`
  - `labs/Labs`
  - `marketing/Landing`, `marketing/MarketingOther`, `marketing/Pricing`
  - `nutrition/NutritionOther`, `nutrition/NutritionToday`
  - `onboarding/OnboardingFlow`
  - `settings/SettingsScreens`
  - `social/SocialScreens`
  - `system/SystemScreens`
  - `today/Today`, `today/TodayOther`
  - `workouts/ActiveWorkout`, `workouts/WorkoutsHome`, `workouts/WorkoutsOther`

- [src/redesign/modules](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/modules)
  Files: `auth-onboarding`, `billing`, `body`, `coach`, `labs`, `nutrition`, `settings-social-admin`, `today`, `workouts`
  Function: domain-level composition maps for the earlier redesign attempt.

## 9. Recommended Claude Designer Prompting Strategy

If you want Claude Designer to rebuild safely:

1. Treat `src/redesign/registry/screen-registry.js` as the canonical screen checklist.
2. Treat `src/App.jsx` as the canonical “actually mounted today” list.
3. Rebuild every screen with these state variants when declared: `loading`, `skeleton`, `empty`, `populated`, `error`, `locked`, `offline`, `permission-request`, `permission-denied`, `no-results`.
4. Use the component families above as required attachment points, not optional inspiration.
5. Call out whether each redesign target is:
   - `active-v2`
   - `active-v3`
   - `legacy-page`
   - `legacy-redesign`

