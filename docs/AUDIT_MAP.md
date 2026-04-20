# atlas.core — Canonical Audit Map

Generated: 2026-04-19
Status: Phase 1 complete — consolidation of route, data, and interaction audits.

## Summary

- **127 total routes**
- **43 v3 routes**, **72 v2 routes** (legacy inside v3 shell), **12 redirects/wrappers**
- **95+ interactive elements** audited
- **0 broken routes** (all nav targets resolve)
- **10 placeholder stubs** (toast "coming soon")
- **1 dead button** (ExerciseLibrary scope picker)
- **3 deceptive mock data surfaces** (CoachHome sparklines, ExerciseDetail muscles/cues)

---

## ROUTE AUDIT MAP

### Core App (V3AppShell — 5 main tabs)

| Route | Screen | Data | Interactions | Issues |
|-------|--------|------|-------------|--------|
| `/app/today` | V3Today→S2_Today_A | REAL: greeting, weather, last session, readiness. NULL: fuel, weight, coach tip (honest empty states) | 4 buttons: all WORKING | None |
| `/app/workouts` | V3Train→S24_Library | REAL: routines from listRoutines(). Loading=mock, empty=[] | 5 buttons: all WORKING | None |
| `/app/nutrition` | V3Eat→S4_Nutrition_A | REAL: meals/macros from useDailyStateV2() | 4 capture buttons: all WORKING | None |
| `/app/body` | V3Body→S14_Body_Dashboard | REAL: measurements, composition, trends from listMeasurements() | 2 buttons: all WORKING | Hero section sparse when few measurements |
| `/app/profile` | V3You→S33_Profile | REAL: name, stats, sessions, routines, measurements | 4 buttons: all WORKING | Hero card empty when no bio/goal set |

### Core App Sub-screens (inside V3AppShell)

| Route | Screen | Data | Status | Issues |
|-------|--------|------|--------|--------|
| `/app/settings` | V3Settings→S19_Settings | REAL: user info, tier | WORKING | Theme toggle works. Notifications = toast stub |
| `/app/coach` | V3CoachHome→S13_Coach_Brief | REAL: streak, meals, plan. MOCK: sparkline data [62,58,70...] | WORKING | Sparklines are hardcoded, not real trends |
| `/app/labs` | V3Labs→S15_Labs_Inbox | REAL: premium gate. MOCK: panels=[] | WORKING | No biomarker service wired |
| `/app/weekly` | V3WeeklyReview→S30_Weekly_Recap | MOCK: noData=true | WORKING | No data flow |
| `/app/notifications` | V3Notifications→S22_Notifications | MOCK: all content | WORKING | Pure mockup |
| `/app/routines/:id` | V3RoutineDetail→S25_Program_Detail | REAL: routine from listRoutines() | PARTIAL | Save button = toast stub |
| `/app/labs/biomarker/:id` | V3BiomarkerDetail→S16_Biomarker_Detail | MOCK: no real biomarker data | WORKING | Needs lab service |
| `/app/body/progress/photos` | V3ProgressPhotos→S18_Progress_Photos | MOCK: photos=[] | WORKING | No photo service |
| `/app/insights` | InsightsRoute (v2) | REAL: isPremium gate. MOCK: insights=[] | WORKING | v2 design |
| `/app/diary` | DiaryRoute (v2) | LOCAL: session-only entries | WORKING | v2 design, no persistence |
| `/app/today/focus` | FocusModeRoute (v2) | v2 | WORKING | v2 design |
| `/app/today/streaks` | StreaksDetailRoute (v2) | v2 | WORKING | v2 design |
| `/app/today/celebrate/:kind` | CelebrationsRoute (v2) | v2 | WORKING | v2 design |
| `/app/nutrition/diary` | FoodDiaryRoute (v2) | v2 | WORKING | v2 design |
| `/app/nutrition/targets` | MacroTargetsRoute (v2) | v2 | WORKING | v2 design |
| `/app/nutrition/water` | WaterLogRoute (v2) | v2 | WORKING | v2 design |
| `/app/nutrition/meal-plans` | MealPlansRoute (v2) | v2 | WORKING | v2 design |
| `/app/workouts/history` | WorkoutHistoryRoute (v2) | REAL: listRecentSessions() | WORKING | v2 design |
| `/app/workouts/:id` | WorkoutDetailRoute (v2) | MOCK: workout=null | WORKING | No session fetch |
| `/app/routines/presets` | RoutinePresetsRoute (v2) | v2 | WORKING | v2 design |
| `/app/routines/presets/:id` | RoutinePresetDetailRoute (v2) | v2 | WORKING | v2 design |
| `/app/body/composition` | BodyCompositionHistoryRoute (v2) | v2 | WORKING | v2 design |
| `/app/labs/history` | LabHistoryRoute (v2) | MOCK: exams=[] | WORKING | v2 design |
| `/app/labs/exam/:id` | LabExamDetailRoute (v2) | MOCK: exam=null | WORKING | v2 design |
| `/app/coach/insights/:id` | CoachInsightDetailRoute (v2) | MOCK: insight=null | WORKING | v2 design |
| `/app/profile/edit` | ProfileEditorRoute (v2) | REAL: user metadata | WORKING | v2 design |
| `/app/settings/account` | AccountSettingsRoute (v2) | REAL: user info | WORKING | v2 design, toasts for 2FA/email/sessions |
| `/app/settings/integrations` | IntegrationsRoute (v2) | MOCK: connections={} | WORKING | v2 design |
| `/app/settings/danger` | DangerZoneRoute (v2) | REAL: email | WORKING | v2 design |
| `/app/settings/diagnostics` | AppDiagnosticsRoute (v2) | REAL: system info | WORKING | v2 design, internal only |
| `/app/social` | SocialFeedRoute (v2) | MOCK: empty | WORKING | v2 design |
| `/app/social/friends` | FriendsRoute (v2) | MOCK: empty | WORKING | v2 design |
| `/app/social/follow` | FollowRoute (v2) | MOCK: empty | WORKING | v2 design |

### Fullscreen Routes (no shell)

| Route | Screen | Data | Status | Issues |
|-------|--------|------|--------|--------|
| `/app/nutrition/search` | V3NutritionSearch→S35_Search | MOCK: food database | WORKING | Mock food data |
| `/app/nutrition/food/new` | CustomFoodRoute (v2) | USER input | WORKING | v2 design |
| `/app/nutrition/food/:id` | FoodDetailRoute (v2) | USER input + nutritionStore | WORKING | v2 design |
| `/app/nutrition/meal/:id` | MealDetailRoute (v2) | v2 | WORKING | v2 design |
| `/app/nutrition/photo` | PhotoScanRoute (v2) | CAMERA permission | WORKING | v2 design |
| `/app/nutrition/photo/confirm` | PhotoScanConfirmRoute (v2) | AI parse or photo | WORKING | v2 design |
| `/app/nutrition/voice` | VoiceLogRoute (v2) | MICROPHONE | WORKING | v2 design |
| `/app/workouts/active` | ActiveWorkoutRoute (v2) | USER input, saveWorkoutSession() | WORKING | v2 design |
| `/app/workouts/manual-plan` | ManualWorkoutPlanRoute (v2) | USER input | WORKING | v2 design |
| `/app/exercises` | V3ExerciseLibrary→S35_Search | MOCK: DEMO_EXERCISES | WORKING | 1 dead button (scope picker) |
| `/app/exercises/:id` | V3ExerciseDetail→S27_Exercise_Detail | REAL: history, PR. MOCK: cues, muscles | PARTIAL | 2 toast stubs |
| `/app/coach/chat` | V3CoachChat→S12_Coach_Chat | MOCK: messages | PARTIAL | Send=toast, menu=toast |
| `/app/body/weight` | WeightEntryRoute (v2) | USER input | WORKING | v2 design, no persist |
| `/app/body/checkin` | BodyCheckInRoute (v2) | USER input | WORKING | v2 design, no persist |
| `/app/body/measurements` | MeasurementsRoute (v2) | v2 | WORKING | v2 design |
| `/app/body/compare` | ProgressComparisonRoute (v2) | v2 | WORKING | v2 design |
| `/app/labs/upload` | LabUploadRoute (v2) | FILE input | WORKING | v2 design, no real parsing |
| `/app/social/share` | ShareWorkoutRoute (v2) | v2 | WORKING | v2 design |

### Web Account Management (standalone, no phone frame)

| Route | Screen | Data | Status | Issues |
|-------|--------|------|--------|--------|
| `/app/account` | V3AccountHub | REAL: user, subscription | WORKING | None |
| `/app/billing` | V3SubscriptionManage | REAL: subscription | WORKING | Cancel = toast on web |
| `/app/billing/plans` | V3Paywall | STATIC: plan prices | WORKING | Web checkout = toast stub |
| `/app/billing/invoices` | V3BillingHistory | PLACEHOLDER: empty | WORKING | No invoice service |
| `/app/export` | V3DataExport | PLACEHOLDER | WORKING | Export buttons = toast stubs |

### Marketing (public web)

| Route | Screen | Status |
|-------|--------|--------|
| `/` | RootRoute (native→app, web→landing) | WORKING |
| `/landing` | V3Landing→S42_Web_Landing | WORKING |
| `/the-app` | V3AppPage | WORKING |
| `/method` | V3MethodPage | WORKING |
| `/labs` | V3LabsPage | WORKING |
| `/pricing` | V3PricingPage | WORKING |
| `/terms` | V3Terms | WORKING |
| `/privacy` | V3Privacy | WORKING |
| `/download-app` | V3DownloadApp | WORKING |
| `/faq` | V3PricingPage (alias) | WORKING |
| `/webapp` | V3WebAppEntry | WORKING |
| `/webapp/success` | V3WebPurchaseSuccess | WORKING |

### Auth + Onboarding

| Route | Screen | Status |
|-------|--------|--------|
| `/welcome` | V3Welcome→S1_Splash_A | WORKING |
| `/welcome/manifesto` | V3Manifesto→S1_Splash_B | WORKING |
| `/auth/login` | V3AuthLogin→S36_Auth | WORKING |
| `/auth/signup` | V3AuthSignup→S36_Auth | WORKING |
| `/auth/forgot` | V3ForgotPassword | WORKING |
| `/auth/reset` | V3ResetPassword | WORKING |
| `/auth/magic` | V3MagicLinkSent | WORKING |
| `/auth/callback` | V3AuthCallback | WORKING |
| `/onboarding` (5 v3 steps) | V3OnboardingIdentity→Permissions | WORKING |
| `/onboarding` (6 v2 steps) | OnboardingWorkout→Tour | WORKING (v2 design) |

### System

| Route | Screen | Status |
|-------|--------|--------|
| `/404` | V3NotFound | WORKING |
| `/500` | ServerErrorRoute (v2) | WORKING |
| `/maintenance` | MaintenanceRoute (v2) | WORKING |
| `/force-update` | ForceUpdateRoute (v2) | WORKING |
| `/app/offline` | OfflineRoute (v2) | WORKING |
| `*` (catch-all) | V3NotFound | WORKING |

---

## ISSUES REQUIRING FIXES

### CRASH BLOCKERS (app won't run)
None.

### FUNCTIONAL BLOCKERS (feature claims capability but fails its job)
1. **V3Paywall web checkout** — "Get Pro" button calls create-checkout edge function that doesn't exist → toast fallback. A user trying to pay on web CANNOT pay. BLOCKER for web billing.
2. **V3DataExport** — "Download JSON" and "Download CSV" buttons both toast. The page exists, the user navigates there, but NOTHING exports. BLOCKER for export feature.
3. **V3CoachChat composer** — send button toasts. The screen presents a chat UI but CANNOT send messages. BLOCKER for coach feature.

### TRUST BLOCKERS (UI presents fake information as real)
4. **V3CoachHome sparklines** — hardcoded arrays [62,58,70...87] and [62,64,66...72] rendered as data visualizations. User sees "trends" that are invented.
5. **V3ExerciseDetail muscle engagement** — static [92,82,72,62] presented as muscle activation percentages. Fake precision.
6. **V3ExerciseDetail form cues** — hardcoded tips by exercise name, presented as if personalized or database-sourced.

### INTERACTION BLOCKERS (buttons/controls that lie)
7. **V3ExerciseLibrary scope picker** — `onPickScope()` handler does nothing. Button is visible and clickable but dead.
8. **V3CoachChat menu** — "Coach actions coming soon" toast on a visible menu button.
9. **V3CoachChat suggestions** — suggestion chips toast their label instead of doing anything.
10. **V3ExerciseDetail save** — "Save exercise coming soon" toast.
11. **V3ExerciseDetail history** — "Detailed history coming soon" toast.
12. **V3RoutineDetail save** — "Save routine changes coming soon" toast.
13. **V3Settings notifications** — "notifications coming soon" toast.

### DESIGN DEBT (functional but wrong visual system)
14. **72 routes** still render v2 components (dark/cyan/glass) inside v3 shell (paper/ink/amber).

### MIGRATION DEBT
15. **v2 onboarding steps 6-10** — still use old design system.
16. **System screens** (500, maintenance, force-update, offline) — still v2 design.

### i18n DEBT
17. **All user-facing strings** are hardcoded English. No translation system exists. No i18n architecture.

---

## FIX TRACKING

| # | Issue | Level | Status | Fixed | Verified |
|---|-------|-------|--------|-------|----------|
| 1 | Web checkout toast stub | FUNCTIONAL | fixed | Button says "get the app to subscribe", navigates /download-app | verified (build+sync) |
| 2 | Data export toast stub | FUNCTIONAL | fixed | Buttons disabled, "Available soon", opacity 0.5 | verified (build+sync) |
| 3 | Coach chat composer dead | FUNCTIONAL | fixed | Composer disabled, placeholder "Coach AI is being connected..." | verified (build+sync) |
| 4 | CoachHome fake sparklines | TRUST | fixed | Replaced with null, sparklines hidden when no real data | verified (build+sync) |
| 5 | ExerciseDetail fake muscles | TRUST | fixed | Returns null, muscle section hidden | verified (build+sync) |
| 6 | ExerciseDetail fake cues | TRUST | fixed | Header→"General form tips", note "Based on common movement patterns" | verified (build+sync) |
| 7 | ExerciseLibrary dead scope button | INTERACTION | fixed | Scope chips now filter exercises (All/Compound/Isolation/Machine/Bodyweight) | verified (build+sync) |
| 8 | CoachChat dead menu button | INTERACTION | fixed | Menu button hidden (onOpenMenu=undefined, conditional render) | verified (build+sync) |
| 9 | CoachChat dead suggestions | INTERACTION | fixed | Each chip has specific action (navigate or honest toast) | verified (build+sync) |
| 10 | ExerciseDetail save stub | INTERACTION | fixed | Toast→"Favoriting exercises is coming soon" | verified (build+sync) |
| 11 | ExerciseDetail history stub | INTERACTION | fixed | Toast→"Full history view coming soon", button dimmed to 0.45 | verified (build+sync) |
| 12 | RoutineDetail save stub | INTERACTION | fixed | Save button hidden (onSave=undefined, conditional render) | verified (build+sync) |
| 13 | Settings notifications stub | INTERACTION | fixed | Row muted at 0.45 opacity, "Coming soon", click suppressed | verified (build+sync) |
| 14 | 72 v2 design routes | DESIGN | unresolved | Requires screen-by-screen v3 redesign. Not blocking functionality. | - |
| 15 | v2 onboarding steps | MIGRATION | unresolved | Steps 6-10 use v2 design. Functional but visually inconsistent. | - |
| 16 | v2 system screens | MIGRATION | unresolved | 500/maintenance/offline use v2. Rarely seen, low priority. | - |
| 17 | All strings hardcoded | i18n | unresolved | No translation system exists. Requires architectural decision. | - |

---

## PHASE 1.5 VALIDATION CHECKLIST

- [x] All 127 routes mapped
- [x] Every mounted screen accounted for
- [x] No orphan screens found (all files referenced in routes)
- [x] Platform classification for every route
- [x] Every data surface traced to source
- [x] Every interactive element checked
- [x] Mock vs real clearly labeled
- [x] All navigation targets verified against route table

**Inventory is COMPLETE. Ready for Phase 2.**
