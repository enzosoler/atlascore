# Platform Ownership

atlas.core is split into two separate products with hard route ownership.

## Mobile App

These screens belong to the mobile app only:

- `V3Today`
- `V3WeeklyReview`
- `V3Train`
- `V3RoutineDetail`
- `V3RoutinePresets`
- `V3RoutinePresetDetail`
- `V3WorkoutHistory`
- `V3WorkoutDetail`
- `V3ActiveWorkout`
- `V3PersonalRecords`
- `V3WorkoutSummary`
- `V3Calendar`
- `V3Eat`
- `V3NutritionSearch`
- `V3FoodDetail`
- `V3MealDetail`
- `V3Capture`
- `V3RecipeBuilder`
- `V3FoodDiary`
- `V3MacroTargets`
- `V3WaterLog`
- `V3MealPlans`
- `V3Body`
- `S6_Weight_B`
- `S17_Measurements_Entry`
- `V3CompositionHistory`
- `V3ProgressPhotos`
- `V3BodyPhotoCapture`
- `V3WeightTrend`
- `V3Labs`
- `V3LabUpload`
- `V3LabHistory`
- `V3LabExamDetail`
- `V3BiomarkerDetail`
- `V3CoachHome`
- `V3CoachChat`
- `V3CoachInsight`
- `V3Insights`
- `V3You`
- `V3ProfileEditor`
- `V3Settings`
- `V3Integrations`
- `V3Notifications`
- `V3SocialFeed`
- `V3Friends`
- `V3Follow`
- `V3Crew`
- `V3Inbox`
- `V3SleepDetail`
- `V3Watch`
- `V3Protocols`
- `V3ProtocolsEmpty`
- `V3ProtocolForm`
- `V3SubstancePicker`
- `V3LogDose`
- `V3ProtocolTimeline`
- `V3TodayDose`
- `V3ProtocolDetail`
- `V3MobilePaywall`
- `V3PRMoment`
- `V3FocusMode`
- `V3Streaks`
- `V3Celebrations`
- `V3PublicProfile`
- `V3Offline`

## Desktop / Webapp

These screens belong to the desktop webapp only:

- `V3WebAppEntry`
- `V3AccountHub`
- `V3SubscriptionManage`
- `V3Paywall`
- `V3BillingHistory`
- `V3DataExport`
- `V3AccountSettings`
- `V3DangerZone`
- `V3Diagnostics`
- `V3WebPurchaseSuccess`

## Removed From Mobile

These surfaces no longer belong to `/app/*`:

- `/app/account`
- `/app/export`
- `/app/billing`
- `/app/billing/manage`
- `/app/billing/plans`
- `/app/billing/paywall`
- `/app/billing/invoices`
- `/app/settings/account`
- `/app/settings/danger`
- `/app/settings/diagnostics`
- `V3Billing`

## Removed From Desktop

These surfaces must not appear inside `/webapp/*`:

- Today
- workout execution
- food logging
- body check-ins
- coach flow
- progress photos
- nutrition capture
- protocol loop screens

## Route Structure

- Mobile execution product: `/app/*`
- Desktop utility product: `/webapp/*`
- Legacy mixed desktop paths under `/app/account`, `/app/billing`, `/app/export`, and desktop settings routes now redirect to `/webapp/*`
