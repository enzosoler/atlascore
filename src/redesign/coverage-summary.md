# Atlas Core — Redesign Coverage Summary

Generated as a parallel tree at `src/redesign/`. Nothing overrides existing
app code. Turn it on domain-by-domain per `migration-notes.md`.

## Numbers at a glance

- **Files generated:** 60
- **Routes in registry:** 94 (core app) + 27 overlays = 121 surfaces
- **Primitives:** 24 (Button, IconButton, Input, Textarea, SearchInput, Card, CardHeader/Body/Footer, MetricCard, Badge, StatPill, Chip, ProgressBar, RingProgress, Sheet, Dialog, FullScreenModal, Tabs, SegmentedControl, Skeleton, LoadingState, EmptyState, ErrorState, LockedState, OfflineState, PermissionRequest, NoResults, Avatar, Divider, SectionHeader, PageHeader, AppContainer, ListRow, KeyValueRow, Switch, Checkbox, StickyActionBar, Toast)
- **Layout shells:** 8 (App, Auth, Onboarding, Marketing, Detail, Settings, Admin, FullScreen)
- **Shared feature modules:** 9 domain files (today, nutrition, workouts, body, labs, coach, auth-onboarding, billing, settings/social/admin)
- **Overlays:** 26 (dialogs, sheets, wizards, full-screen modals, support widget)
- **Dark & premium token map:** complete (color, type, spacing, radius, shadow, motion, chart, health, AI, premium, status)

## Domain status

| Domain       | Shared modules | Priority screens          | Remaining screens | Overlays | Legacy mapped |
| ------------ | --------------: | ------------------------- | -----------------: | --------: | -------------: |
| Marketing    | ✓              | Landing, Pricing          | 8 (blog, guides, help, privacy, terms, waitlist, invite, use-case) | — | n/a |
| Auth         | ✓              | Auth, Login, Signup, Welcome | 5 (callback, magic, forgot, reset, logout) | AuthModal | ✓ |
| Onboarding   | ✓              | OnboardingFlow (10 steps) | +tour              | OnboardingTourSheet | ✓ |
| Today        | ✓              | Today                     | 6 (WeeklyReview, Insights, Diary, BlockReview, Plan, DecisionEngine) | WeeklyCheckinModal | ✓ |
| Nutrition    | ✓              | NutritionToday            | 9 (history, targets, meal plan, my-diet, prescribed, food search, food detail, recipe lib/detail, photo/barcode/confirm) | QuickLogSheet, MealEditSheet, PortionEditorSheet, FoodSearchSheet, PhotoScanSheet, BarcodeScanSheet | ✓ |
| Workouts     | ✓              | WorkoutsHome, ActiveWorkout | 11 (library, detail, history, exercises, exercise detail, routines, protocols, protocol detail/form, my workout, prescribed, manual plan, plan builder) | QuickWorkoutModal, WorkoutGuardSheet, ShareWorkoutSheet, PlanBuilderWizard | ✓ |
| Body         | ✓              | BodyOverview              | 7 (weight, composition, profile, measurements, progress, photos, photo view, check-in) | BodyCheckinSheet, ImageCropperModal | ✓ |
| Labs         | ✓              | LabsOverview              | 4 (exam, biomarker, upload, history) | — | — |
| Coach        | ✓              | CoachChat                 | 2 (home, insight detail) | CoachChatSheet, AIGenerationWizard | — |
| Profile/Settings | ✓          | SettingsHub               | 9 (account, notifications, privacy, appearance, integrations, language, data, danger, profile/edit) | — | ✓ |
| Billing      | ✓              | OnboardingPaywall         | 9 (overview, plan picker, trial start/explain, discount, restore, manage, cancel, upgrade, checkout) | PaywallTrigger, SubscriptionManagerSheet, CancelSaveOfferModal | — |
| Social       | ✓              | —                         | 5 (home, composer, creator, code, referrals) | InviteModal, CreatorCodeModal, ShareFlowSheet, EnhancedShareModal | — |
| Admin        | ✓              | —                         | 10 (overview, users, subs, audit, flags, analytics, settings, coach/nutritionist/clinician dashboards) | — | — |
| System       | —              | NotFound, ServerError, Offline, Maintenance, Permissions × 3, Styleguide × 3 | — | UnsavedChangesDialog, ConfirmDestructiveDialog, SupportWidget, StartFreshModal | — |

## State coverage

Every screen compositing a list, form, or fetched data uses one of:
`LoadingState`, `Skeleton`, `EmptyState`, `ErrorState`, `LockedState`,
`OfflineState`, `PermissionRequest`, `NoResults`. Labels and actions are
wired to the surrounding domain. Premium screens (MealPlan, Insights, Labs*)
render `LockedState` when `locked === true`.

## Responsive matrix

| Shell       | Mobile (<768)               | Tablet (768-1023)          | Desktop (≥1024)                                 |
| ----------- | --------------------------- | --------------------------- | ------------------------------------------------ |
| AppShell    | Bottom nav, stacked         | Bottom nav, wider padding   | Sidebar + max-w-1200 content + optional aside    |
| AuthShell   | Single column               | Single column               | Two-column with hero                             |
| Onboarding  | Full-bleed progress         | Same                        | Same, centered 560px column                      |
| Marketing   | Stacked                     | Responsive grid             | Full hero + 4-column grid                        |
| Detail      | Sticky back, sticky footer  | Same                        | Max-w-720 centered                               |
| Settings    | Single column               | Single column               | Left rail + content split                        |
| Admin       | Hidden sidebar              | Hidden sidebar              | Fixed sidebar, max-w-1400 content                |

## Legacy normalization

See `migration-notes.md` — 19 legacy files mapped to canonical redesign
targets across Auth, Today, Nutrition, Workouts, Body, Profile, Account.

## Preserved architectural constraints

- **Stripe on web / RevenueCat on native** — `PlatformBillingNotice` renders
  the difference honestly; `RestorePurchases` flagged `native-only`.
- **HealthKit optional** — Integrations tile + `PermissionHealth` screen.
  HealthKit sync is *surface*, not assumed-connected.
- **Offline is best-effort** — `OfflineState` component surfaced across screens;
  no fake offline sync.
- **i18n partial** — `LanguageSettings` marks PT-BR as `Partial`.
- **AI transparency** — `CoachLowConfidence`, `ExplainabilityCard`,
  `PhotoScanConfirm` (Cal AI) all demand confidence/edit/confirm before save.
- **Entitlement gating** — screens like `MealPlan`, `Insights`, `Labs*`,
  `PlanBuilderWizard` accept `locked` / `access: 'premium'` and render
  `LockedState`.
- **Role gating** — admin + pro surfaces wired to `requireRole:<role>` in
  `route-config.js`.
- **localStorage** — not used anywhere in redesign. Data flow is prop-in so
  real stores (`dailyStore`, `nutritionService`, `workoutService`) can own
  persistence.

## Unresolved assumptions flagged for you

1. **Real icon set.** Redesign uses minimal inline SVGs + a couple of emoji
   placeholders (🔥, ✨, 🔎). Swap to Lucide across `ui/Misc.jsx`,
   `layouts/nav.jsx`, and modules — the import is already in `package.json`.
2. **Chart library.** `TrendChart` is a hand-rolled SVG that handles weight
   trend + moving average well. Swap to Recharts (already installed) if you
   need zoom, axis tooltips, or multi-series.
3. **Routing.** `route-config.js` emits declarative guards. Wire into your
   real router (likely `src/App.jsx`) behind a feature flag.
4. **Real data source.** All screens consume `mock-data.js`. Replace with
   your stores/services domain-by-domain.
5. **Dark theme only.** Light theme variables exist in `theme.css` but are
   untested at the component level — review before shipping a light toggle.
6. **Copy localization.** Copy is English. When i18n moves past "partial",
   extract strings into the existing i18n pipeline.

## How to turn it on locally

```js
// src/main.jsx  (add two lines — nothing else)
import './redesign/tokens/theme.css';

// tailwind.config.js  (merge preset)
module.exports = {
  presets: [require('./src/redesign/tokens/tailwind.preset')],
  // ...your existing config
};
```

Then, in any route, render a redesigned screen:

```jsx
import { Today } from './redesign/screens';
export default function Page() { return <Today />; }
```
