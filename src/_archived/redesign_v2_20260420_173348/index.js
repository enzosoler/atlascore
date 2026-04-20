/**
 * Atlas Core — Redesign v2 barrel export
 *
 * Liquid Glass primitives + screens. Every screen respects:
 *  - iOS safe-area-inset (top + bottom + left + right)
 *  - Real auth context (NEVER mock users)
 *  - Atlas palette (obsidian + cyan + violet + gold + status)
 *  - Reduced-motion preferences
 *
 * Import examples:
 *   import { Splash, Welcome, Today } from '@/redesign/v2';
 *   import { OnboardingGoal, OnboardingStats } from '@/redesign/v2';
 */

// Primitives
export * from './lib/glass';

// Auth
export { default as Splash }              from './auth/Splash';
export { default as Welcome }             from './auth/Welcome';
export { default as Login }               from './auth/Login';
export { default as Signup }              from './auth/Signup';
export { default as ForgotPassword }      from './auth/ForgotPassword';
export { default as ResetPassword }       from './auth/ResetPassword';
export { default as MagicLinkSent }       from './auth/MagicLinkSent';

// Onboarding
export { default as OnboardingShell }       from './onboarding/OnboardingShell';
export { default as OnboardingRoot }        from './onboarding/OnboardingRoot';
export { default as OnboardingGoal }        from './onboarding/OnboardingGoal';
export { default as OnboardingActivity }    from './onboarding/OnboardingActivity';
export { default as OnboardingStats }       from './onboarding/OnboardingStats';
export { default as OnboardingDiet }        from './onboarding/OnboardingDiet';
export { default as OnboardingWorkout }     from './onboarding/OnboardingWorkout';
export { default as OnboardingHabits }      from './onboarding/OnboardingHabits';
export { default as OnboardingConstraints } from './onboarding/OnboardingConstraints';
export { default as OnboardingSummary }     from './onboarding/OnboardingSummary';
export { default as OnboardingPaywall }     from './onboarding/OnboardingPaywall';
export { default as OnboardingTour }        from './onboarding/OnboardingTour';
export { default as SmartOnboarding }       from './onboarding/SmartOnboarding';

// Today
export { default as Today }                 from './today/Today';
export { default as WeeklyReview }          from './today/WeeklyReview';
export { default as Insights }              from './today/Insights';
export { default as Diary }                 from './today/Diary';
export { default as FocusMode }             from './today/FocusMode';
export { FocusModeRoute }                   from './today/FocusMode';
export { default as StreaksDetail }         from './today/StreaksDetail';
export { StreaksDetailRoute }               from './today/StreaksDetail';
export { default as Celebrations }          from './today/Celebrations';
export { CelebrationsRoute }                from './today/Celebrations';

// Nutrition
export { default as NutritionToday }        from './nutrition/NutritionToday';
export { default as FoodSearch }            from './nutrition/FoodSearch';
export { default as FoodDetail }            from './nutrition/FoodDetail';
export { default as PhotoScan }             from './nutrition/PhotoScan';
export { default as PhotoScanConfirm }      from './nutrition/PhotoScanConfirm';
export { default as VoiceLog }              from './nutrition/VoiceLog';
export { default as FoodDiary }             from './nutrition/FoodDiary';
export { FoodDiaryRoute }                   from './nutrition/FoodDiary';
export { default as MacroTargets }          from './nutrition/MacroTargets';
export { MacroTargetsRoute }                from './nutrition/MacroTargets';
export { default as WaterLog }              from './nutrition/WaterLog';
export { WaterLogRoute }                    from './nutrition/WaterLog';
export { default as MealPlans }             from './nutrition/MealPlans';
export { MealPlansRoute }                   from './nutrition/MealPlans';
export { default as MealDetail }            from './nutrition/MealDetail';
export { MealDetailRoute }                  from './nutrition/MealDetail';
export { default as CustomFood }            from './nutrition/CustomFood';
export { CustomFoodRoute }                  from './nutrition/CustomFood';

// Workouts
export { default as WorkoutsHome }          from './workouts/WorkoutsHome';
export { default as ActiveWorkout }         from './workouts/ActiveWorkout';
export { default as ExerciseLibrary }       from './workouts/ExerciseLibrary';
export { default as ExerciseDetail }        from './workouts/ExerciseDetail';
export { ExerciseDetailRoute }              from './workouts/ExerciseDetail';
export { default as WorkoutDetail }         from './workouts/WorkoutDetail';
export { default as Routines }              from './workouts/Routines';
export { default as WorkoutHistory }        from './workouts/WorkoutHistory';
export { default as ManualWorkoutPlan }     from './workouts/ManualWorkoutPlan';
export { default as RoutinePresets }        from './workouts/RoutinePresets';
export { RoutinePresetsRoute }              from './workouts/RoutinePresets';
export { default as RoutinePresetDetail }   from './workouts/RoutinePresetDetail';
export { RoutinePresetDetailRoute }         from './workouts/RoutinePresetDetail';

// Coach
export { default as CoachHome }             from './coach/CoachHome';
export { default as CoachChat }             from './coach/CoachChat';
export { default as CoachInsightDetail }    from './coach/CoachInsightDetail';

// Body
export { default as BodyOverview }               from './body/BodyOverview';
export { default as WeightEntry }                from './body/WeightEntry';
export { default as ProgressPhotos }             from './body/ProgressPhotos';
export { default as BodyCheckIn }                from './body/BodyCheckIn';
export { default as Measurements }               from './body/Measurements';
export { MeasurementsRoute }                     from './body/Measurements';
export { default as BodyCompositionHistory }     from './body/BodyCompositionHistory';
export { BodyCompositionHistoryRoute }           from './body/BodyCompositionHistory';
export { default as ProgressComparison }         from './body/ProgressComparison';
export { ProgressComparisonRoute }               from './body/ProgressComparison';

// Social (post-launch scaffold — empty-state UI, backend pending)
export { default as SocialFeed }            from './social/SocialFeed';
export { SocialFeedRoute }                  from './social/SocialFeed';
export { default as Friends }               from './social/Friends';
export { FriendsRoute }                     from './social/Friends';
export { default as ShareWorkout }          from './social/ShareWorkout';
export { ShareWorkoutRoute }                from './social/ShareWorkout';
export { default as Follow }                from './social/Follow';
export { FollowRoute }                      from './social/Follow';
export { default as PublicProfile }         from './social/PublicProfile';
export { PublicProfileRoute }               from './social/PublicProfile';

// Profile + Settings
export { default as Profile }               from './profile/Profile';
export { default as ProfileEditor }         from './profile/ProfileEditor';
export { ProfileEditorRoute }               from './profile/ProfileEditor';
export { default as SettingsHub }           from './settings/SettingsHub';
export { default as AccountSettings }       from './settings/AccountSettings';
export { default as Integrations }          from './settings/Integrations';
export { default as DangerZone }            from './settings/DangerZone';

// Labs
export { default as LabsOverview }          from './labs/LabsOverview';
export { default as LabExamDetail }         from './labs/LabExamDetail';
export { default as BiomarkerDetail }       from './labs/BiomarkerDetail';
export { default as LabUpload }             from './labs/LabUpload';
export { default as LabHistory }            from './labs/LabHistory';

// System
export { default as ComingSoon }            from './system/ComingSoon';
export { default as NotFound }              from './system/NotFound';
export { NotFoundRoute }                    from './system/NotFound';
export { default as Offline }               from './system/Offline';
export { OfflineRoute }                     from './system/Offline';
export { default as ServerError }           from './system/ServerError';
export { ServerErrorRoute }                 from './system/ServerError';
export { default as Maintenance }           from './system/Maintenance';
export { MaintenanceRoute }                 from './system/Maintenance';
export { default as ForceUpdate }           from './system/ForceUpdate';
export { ForceUpdateRoute }                 from './system/ForceUpdate';
export { default as AppDiagnostics }        from './system/AppDiagnostics';
export { AppDiagnosticsRoute }              from './system/AppDiagnostics';

// Layouts
export { default as AppShell }              from './layouts/AppShell';
export { default as AuthShell }             from './layouts/AuthShell';

// Marketing (public pages)
export { default as MarketingShell }        from './marketing/MarketingShell';
export { default as Landing }               from './marketing/Landing';
export { default as Pricing }               from './marketing/Pricing';
export { default as Terms }                 from './marketing/Terms';
export { default as Privacy }               from './marketing/Privacy';

// Billing
export { default as Paywall }               from './billing/Paywall';
export { PaywallRoute }                     from './billing/Paywall';
export { default as SubscriptionSettings }  from './billing/SubscriptionSettings';
export { SubscriptionSettingsRoute }        from './billing/SubscriptionSettings';
export { default as BillingHistory }        from './billing/BillingHistory';
export { BillingHistoryRoute }              from './billing/BillingHistory';
export { default as CancelFlow }            from './billing/CancelFlow';
export { CancelFlowRoute }                  from './billing/CancelFlow';
