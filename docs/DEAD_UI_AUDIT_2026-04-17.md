# Atlas Core — Dead UI Audit

**Date:** 2026-04-17
**Scope:** Every route, interactive element, and component in `src/`

---

## TL;DR

- **~25 routed screens are pure UI mockups** with hardcoded fake data and dead buttons
- **29 interactive elements** have no handler or stub handlers
- **48 components** are never imported (dead code)
- **12 pages** are never routed
- **~11,500 lines of confirmed dead code** (12% of codebase)
- **No NFT screen exists** — the "Proof Cards" in Social are PNG image generators for Instagram sharing, not blockchain anything

---

## Dead Buttons and Stub Handlers

| File | Line | Current Behavior | What User Sees |
|------|------|-----------------|----------------|
| `src/pages/MessagesChat.jsx` | 87 | `<button>` no onClick | Phone icon in chat, does nothing |
| `src/pages/MessagesChat.jsx` | 88 | `<button>` no onClick | Video icon in chat, does nothing |
| `src/pages/MessagesChat.jsx` | 89 | `<button>` no onClick | "..." menu in chat, does nothing |
| `src/pages/MessagesChat.jsx` | 111 | `<button>` no onClick | Paperclip attachment, does nothing |
| `src/pages/MessagesChat.jsx` | 112 | `<button>` no onClick | Emoji picker, does nothing |
| `src/pages/MessagesChat.jsx` | 119 | `<button>` no onClick, no form | Send button, does nothing |
| `src/pages/ExploreScreen.jsx` | 61 | `<button>` no onClick | Filter icon, does nothing |
| `src/pages/ExploreScreen.jsx` | 73-94 | `<button>` no onClick | Trending items, taps do nothing |
| `src/pages/ExploreScreen.jsx` | 106-112 | `<button>` no onClick | "Recently Added" items, dead |
| `src/pages/UserContent.jsx` | 64 | `<button>` no onClick | Like button on posts, dead |
| `src/pages/UserContent.jsx` | 68 | `<button>` no onClick | Comment button on posts, dead |
| `src/pages/CreationFlow.jsx` | 158 | onClick → `navigate('/today')` | "Create" button looks like it saves a workout — it doesn't |
| `src/pages/SearchResults.jsx` | 21-23 | `setHasSearched(true)` only | Search always shows same 3 hardcoded results |
| `src/pages/ThemeScreen.jsx` | 34 | `setActiveTheme` local state only | Theme picker appears to work but never persists or applies |
| `src/pages/LanguageScreen.jsx` | — | Local state only | Language picker doesn't connect to i18nContext |
| `src/pages/DataExport.jsx` | — | `setTimeout` fake progress | "Download File" button does nothing |
| `src/pages/NotificationsScreen.jsx` | — | Hardcoded list | "Mark all read" and delete do nothing |
| `src/pages/RateApp.jsx` | — | Local state only | Submit never sends feedback anywhere |
| `src/pages/ContactSupport.jsx` | — | Local state flip | "Send Message" just shows "Message Sent!" locally |
| `src/pages/ReportProblem.jsx` | — | No submit handler | Bug report form goes nowhere |
| `src/pages/ManageConsent.jsx` | — | No persist | "Save Preferences" button is cosmetic |
| `src/pages/PrivacyScreen.jsx` | — | Local state only | 2FA, visibility, data sharing toggles are cosmetic |
| `src/pages/NutritionistPrescribeDiet.jsx` | 41, 49 | `queryFn: async () => null`, `mutationFn: async () => ({})` | Diet form appears functional, saves nothing |
| `src/pages/ExerciseDetail.jsx` | 118, 129 | Query returns null, mutation is local-only | Favorite toggle resets on reload |
| `src/pages/Workouts.jsx` | 892 | `setLoggedWorkouts(filter(...))` local only | Delete workout disappears then reappears on reload |
| `src/pages/LabExams.jsx` | 629 | `toast.info('coming soon')` | "Enter markers manually" — honestly flagged |
| `src/pages/LabExams.jsx` | 704 | `toast.info('coming soon')` | "Ask AI" — honestly flagged |
| `src/pages/DiscountScreen.jsx` | — | Clipboard copy + navigate | Discount codes (SAVE50, ANNUAL30, WELCOME20) are fake |
| `src/pages/SubscriptionTier.jsx` | — | "Contact Us" → `/contact` | Routes to 404 |

---

## Mislabeled Screens and Routes

| Route | Label Shown | What It Actually Does | Issue |
|-------|-------------|----------------------|-------|
| `/Today` | "Today" | Renders `DecisionEngineDashboard`, not `TodayV2` | `Today` lazy import (line 50) is dead code — never rendered |
| `/Workouts` | "Train" | Renders `TrainV2` (via `WorkoutsV2`) | Route says "Workouts", nav says "Train", old `Workouts.jsx` is dead |
| `/feed` | "Discover" (heading) | FeedList with hardcoded items | Heading/route mismatch |
| `/streaks` | "Progress" (heading) | StreaksMilestones with hardcoded data | Collides with real `/Progress` route |
| `/settings/theme` | "Appearance" | Local state only, doesn't use ThemeContext | Duplicates sidebar theme toggle, but broken |
| `/settings/language` | "Language" | Local state only, doesn't use i18nContext | Duplicates sidebar language switcher, but broken |
| `/settings/export` | "Export Data" | Fake progress bar, no real export | `/Export` route has the real export page |
| `/legal` | "Legal" | Stub terms/privacy text | Real pages at `/privacy` and `/terms` |

### Screens That Are Pure Mockups (hardcoded data, no backend)

| Route | Page |
|-------|------|
| `/activity` | ActivityScreen — fake activity items |
| `/explore` | ExploreScreen — fake trending, dead buttons |
| `/feed` | FeedList — hardcoded feed items |
| `/detail/:id` | DetailView — always shows same workout |
| `/create-new` | CreationFlow — "Create" doesn't save |
| `/search` | SearchResults — hardcoded results |
| `/saved` | SavedFavorites — hardcoded, dead share/delete |
| `/messages` | MessagesChat — full chat UI, zero backend |
| `/streaks` | StreaksMilestones — hardcoded streak=12 |
| `/profile/content` | UserContent — hardcoded posts |
| `/calendar` | Calendar — hardcoded events on days 5,10,15,20 |
| `/achievements` | Achievements — hardcoded progress bars |
| `/leaderboard` | Leaderboard — fake users |
| `/changelog` | Changelog — fictional v2.5.0 from "Jan 2024" |
| `/rate` | RateApp — submit goes nowhere |
| `/support/contact` | ContactSupport — form goes nowhere |
| `/report` | ReportProblem — form goes nowhere |
| `/consent` | ManageConsent — toggles are cosmetic |
| `/notifications` | NotificationsScreen — hardcoded list |
| `/discounts` | DiscountScreen — fake codes |

---

## Unused Components Worth Deleting

### Dead Components (never imported) — 48 files, ~5,200 lines

**components/social/**
- EnhancedShareModal.jsx (480 lines)

**components/admin/**
- SubscriptionManager.jsx (348 lines)

**components/nutrition/**
- MealEditModal.jsx (288 lines)
- QuickMealLog.jsx (111 lines)
- NutritionHeroCard.jsx (107 lines)
- MealTimeline.jsx (103 lines)
- NutritionComparison.jsx (100 lines)
- AINutritionSuggestions.jsx, ManualFoodEntry.jsx, AIMealSuggestion.jsx

**components/ai/**
- AIGenerateWizard.jsx (242 lines)
- AIProgressAnalysis.jsx, AITodayInsight.jsx, AIMeasurementProjection.jsx, AICoachBriefing.jsx, AIWorkoutSuggestion.jsx

**components/today/**
- WeeklyCheckinModal.jsx (240 lines)
- TodayPlanSection.jsx (185 lines)
- ReadinessRow.jsx (126 lines)
- AIRecommendations.jsx (112 lines)

**components/coach/**
- StudentProgressMetrics.jsx (227 lines)
- CoachAdherenceScore.jsx

**components/progress/**
- ProgressPhotoCarousel.jsx (191 lines)
- ProgressSnapshot.jsx, ProgressReviewCard.jsx

**components/profile/**
- AchievementsSection.jsx (188 lines)

**components/workouts/**
- QuickWorkoutCreate.jsx (154 lines)
- WorkoutComparison.jsx, WorkoutComparisonCard.jsx, WorkoutGuardSheet.jsx

**components/shared/**
- ProfessionalLinks.jsx (105 lines)
- SetupGeneratingScreen.jsx (100 lines)

**components/content/**
- TestimonialsSection.jsx (116 lines)

**components/checkin/** — entire directory dead
- CheckinPrompt.jsx, StreakBadge.jsx, CheckinHistory.jsx

**components/github/** — entire directory dead
- PRCard.jsx, PRStats.jsx

**Misc dead:** WeeklySummary, QuickCheckin, SubscriptionBanner, NutritionQuickActions, MacroProgressBar, MacroRing, LocaleSwitcher, AlertsSection, TrialExpiredUpgrade

### Dead Pages — 12 files, ~870 lines

- admin/AdminErrors.jsx (178), admin/AdminAuditLog.jsx (69)
- clinician/ClinicianDashboardProfessional.jsx (177)
- PermissionsScreen.jsx (159), WelcomeScreen.jsx (93)
- NoResults.jsx (60), SuccessConfirm.jsx (39), PermissionDenied.jsx (37), OfflineState.jsx (31)
- SocialAuth.jsx (8), EmailAuth.jsx (8), AppleAuth.jsx (8)

### Dead Screens/Hooks — ~1,400 lines

- screens/BodyScreens.jsx (1,225 lines — largest dead file)
- hooks/useRoleAndSubscription.js (107)
- hooks/useWatchConnectivity.js (49)
- hooks/usePaywallAnalytics.js (32)

### Dead Services/Libs — ~780 lines

- services/aiInsightsService.js (239)
- lib/measurementCheckpoint 2.js (131 — macOS Finder duplicate)
- lib/i18n-strict.js (124), lib/i18n-original.js (77)
- lib/localizationService.js (73)
- services/widgetService.js (72), services/foodApi.js (35), services/fatsecretService.js (28)
- components/layout/usePrimaryRouteScrollReset 2.js (131 — macOS duplicate)

### Dead shadcn/ui Components — ~3,150 lines

34 of ~45 installed shadcn components are never used. The toast system (toast.jsx + toaster.jsx + use-toast.jsx = 298 lines) is fully dead — app uses `sonner` instead. Sidebar component alone is 626 dead lines.

---

## Prioritized Fix List — Top 5 (User Notices in <10 Seconds)

| # | Issue | Why First | Effort |
|---|-------|-----------|--------|
| 1 | **CreationFlow "Create" button saves nothing** | User fills a workout form, taps Create, data vanishes. Broken core flow. | Wire mutation to Supabase or remove the route. |
| 2 | **NutritionistPrescribeDiet is a no-op** | Coach fills entire diet form for a client, taps Prescribe, gets success toast, nothing saved. Trust-destroying. | Wire mutation or gate behind "coming soon". |
| 3 | **MessagesChat is a full fake chat** | 6 dead buttons, hardcoded conversations. If reachable from nav, users will try to chat. | Remove from routing or add a "coming soon" gate. |
| 4 | **ExploreScreen / SearchResults are dead** | Tapping any trending item or search result leads to nothing or a 404. If reachable, users bounce. | Remove from nav or gate. |
| 5 | **ThemeScreen / LanguageScreen don't persist** | User changes theme or language in Settings, it reverts on next visit. Silent broken promise. | Wire to ThemeContext / i18nContext or remove the routes. |

---

## NFT Finding

**No NFT screen exists anywhere in the codebase.** Searched for `NFT`, `nft`, `Nft`, `collectible`, `token`, `mint` across all of `src/`. Only legitimate hits: push notification tokens, OAuth tokens, CSS design tokens, shared workout tokens, i18n template tokens. The "Proof Cards" feature in Social generates shareable PNG images for Instagram — not blockchain anything.
