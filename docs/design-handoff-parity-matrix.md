# Design Handoff Parity Matrix

Audit date: 2026-04-24

## Scope

This compares the exported Claude Design handoff under:

- `/tmp/atlas-core-logo-handoff/atlas-core-logo/project/screens*.jsx`

against the current repo implementation under:

- `src/redesign/v3/screens/`
- `src/redesign/v3/routes/`
- `src/routes/app/`

## Method

- Count every `function S...()` screen in the handoff `screens*.jsx` files.
- Mark a screen as `Exact` when the same `S...` identifier exists in `src/redesign/v3/screens/`.
- Mark a screen as `Equivalent` when the repo appears to implement the same screen under a different component or route name.
- Mark a screen as `Missing` when no clear repo implementation was found.

Important: this is an inventory and naming audit, not a pixel-parity audit. `Exact` means the screen exists under the same exported ID, not that it has already been visually diffed against the handoff source.

## Summary

- Handoff screen functions found: `116`
- Exact `S...` matches in repo screens: `94`
- Renamed/equivalent implementations found in repo routes/components: `22`
- Still missing or not yet proven: `0`

## Exact Matches

These handoff screens exist in `src/redesign/v3/screens/` under the same exported `S...` ID.

`S1_Splash_A`, `S1_Splash_B`, `S3_Workout_A`, `S4_Nutrition_A`, `S5_Paywall_A`, `S5_Paywall_B`, `S6_Weight_A`, `S6_Weight_B`, `S7_Onboard_Identity`, `S8_Onboard_Goal`, `S9_Onboard_Activity`, `S10_Onboard_Plan`, `S11_Onboard_Permissions`, `S12_Coach_Chat`, `S13_Coach_Brief`, `S14_Body_Dashboard`, `S15_Labs_Inbox`, `S16_Biomarker_Detail`, `S17_Measurements_Entry`, `S18_Progress_Photos`, `S19_Settings`, `S20_PR_Gallery`, `S21_Share_Card`, `S22_Notifications`, `S23_Empty_States`, `S24_Library`, `S25_Program_Detail`, `S26_Calendar`, `S27_Exercise_Detail`, `S28_Crew`, `S29_Workout_Summary`, `S30_Weekly_Recap`, `S31_Sleep_Detail`, `S32_Capture`, `S33_Profile`, `S34_Watch`, `S35_Search`, `S36_Auth`, `S37_Inbox`, `S38_Food_Detail`, `S39_Recipe_Builder`, `S40_Billing`, `S41_Errors`, `S42_Web_Landing`, `S43_Protocols_Home`, `S44_Protocols_Empty_Locked`, `S45_Protocol_Detail`, `S46_Protocol_Form`, `S47_Substance_Picker`, `S48_Log_Dose`, `S49_Protocol_Timeline`, `S50_Today_Dose_Module`, `S51_Food_Diary`, `S52_Macro_Targets`, `S53_Water_Log`, `S54_Workout_History`, `S55_Workout_Detail`, `S56_Composition_History`, `S57_Coach_Insight`, `S58_Onboard_Workout`, `S59_Onboard_Habits`, `S60_Onboard_Constraints`, `S61_Onboard_Summary`, `S62_Onboard_Tour`, `S63_Account_Settings`, `S64_Integrations`, `S65_Danger_Zone`, `S66_Diagnostics`, `S67_Profile_Editor`, `S76_Public_Profile`, `S77_Lab_Upload`, `S78_Lab_Exam_Detail`, `S79_Lab_History`, `S80_Routine_Presets`, `S81_Routine_Preset_Detail`, `S82_Meal_Detail`, `S83_Offline`, `S84_Server_Error`, `S85_Maintenance`, `S86_Force_Update`

## Renamed Or Route-Level Equivalents

These do not exist under the same `S...` file name, but there is a clear repo implementation that appears to cover the same surface.

| Handoff screen | Repo equivalent | Evidence |
| --- | --- | --- |
| `S2_Today_B` | `V3Today` | [src/redesign/v3/routes/V3Today.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3Today.jsx) |
| `S87_Login` | `V3AuthLogin` | [src/redesign/v3/routes/V3AuthLogin.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthLogin.jsx) |
| `S88_Magic_Link_Sent` | `V3MagicLinkSent` | [src/redesign/v3/routes/V3MagicLinkSent.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3MagicLinkSent.jsx) |
| `S89_Magic_Callback` | `V3AuthCallback` | [src/redesign/v3/routes/V3AuthCallback.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthCallback.jsx) |
| `S90_Signup` | `V3AuthSignup` | [src/redesign/v3/routes/V3AuthSignup.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthSignup.jsx) |
| `S91_Forgot` | `V3ForgotPassword` | [src/redesign/v3/routes/V3ForgotPassword.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3ForgotPassword.jsx) |
| `S92_Reset` | `V3ResetPassword` | [src/redesign/v3/routes/V3ResetPassword.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3ResetPassword.jsx) |
| `S93_Focus_Mode` | `S73_Focus_Mode` / `V3FocusMode` | [src/redesign/v3/screens/S73_Focus_Mode.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/screens/S73_Focus_Mode.jsx), [src/redesign/v3/routes/V3FocusMode.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3FocusMode.jsx) |
| `S94_Streak_Ledger` | `S74_Streaks` / `V3Streaks` | [src/redesign/v3/screens/S74_Streaks.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/screens/S74_Streaks.jsx), [src/redesign/v3/routes/V3Streaks.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3Streaks.jsx) |
| `S95_Celebrations` | `S75_Celebrations` / `V3Celebrations` | [src/redesign/v3/screens/S75_Celebrations.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/screens/S75_Celebrations.jsx), [src/redesign/v3/routes/V3Celebrations.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3Celebrations.jsx) |
| `S96_Insights_Digest` | `S72_Insights` / `V3Insights` | [src/redesign/v3/screens/S72_Insights.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/screens/S72_Insights.jsx), [src/redesign/v3/routes/V3Insights.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3Insights.jsx) |
| `S97_Coach_Home` | `V3CoachHome` | [src/redesign/v3/routes/V3CoachHome.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3CoachHome.jsx) |
| `S98_Nutrition_Search` | `V3NutritionSearch` | [src/redesign/v3/routes/V3NutritionSearch.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3NutritionSearch.jsx) |
| `S99_Meal_Plans` | `S68_Meal_Plans` / `V3MealPlans` | [src/redesign/v3/screens/S68_Meal_Plans.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/screens/S68_Meal_Plans.jsx), [src/redesign/v3/routes/V3MealPlans.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3MealPlans.jsx) |
| `S100_Body_Checkin` | `BodyCheckInRoute` | [src/routes/app/BodyCheckInRoute.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/routes/app/BodyCheckInRoute.jsx) |
| `S101_Weight_Entry_Slider` | `WeightEntryRoute` | [src/routes/app/WeightEntryRoute.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/routes/app/WeightEntryRoute.jsx) |
| `S102_Weight_Trend_Compare` | `V3WeightTrend` | [src/redesign/v3/routes/V3WeightTrend.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3WeightTrend.jsx) |
| `S103_NotFound` | `V3NotFound` | [src/redesign/v3/routes/V3NotFound.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3NotFound.jsx) |
| `S104_Account_Hub` | `V3AccountHub` | [src/redesign/v3/routes/V3AccountHub.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AccountHub.jsx) |
| `S105_Subscription_Manage` | `V3SubscriptionManage` | [src/redesign/v3/routes/V3SubscriptionManage.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3SubscriptionManage.jsx) |
| `S106_Data_Export` | `V3DataExport` | [src/redesign/v3/routes/V3DataExport.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3DataExport.jsx) |
| `S107_Progress_Photo_Capture` | `V3BodyPhotoCapture` | [src/redesign/v3/routes/V3BodyPhotoCapture.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3BodyPhotoCapture.jsx) |

## Missing Or Not Yet Proven

None at the inventory level as of this pass.

## Notes

- The current [src/redesign/v3/gallery/V3Gallery.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/gallery/V3Gallery.jsx) still represents the original 50-screen gallery, not the full 116-screen handoff inventory.
- This audit now reaches full inventory coverage by combining exact `S...` screen components with renamed route-level equivalents.
- Some repo surfaces have clearly evolved beyond the handoff naming scheme. Those are marked as `Equivalent`, not `Exact`, on purpose.
- The next strict step would be a visual/code parity pass per row, especially for the `Equivalent` bucket.
