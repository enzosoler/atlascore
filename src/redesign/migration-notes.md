# Atlas Core — Redesign Migration Notes

This file maps existing legacy components to their canonical redesign
targets. The rule: **one redesigned surface per concept**. When you migrate,
swap the legacy file's imports to the canonical target and delete the legacy
copy.

## Auth / Onboarding

| Legacy                                  | Canonical target                               |
| --------------------------------------- | ---------------------------------------------- |
| `src/pages/Auth.jsx`                    | `redesign/screens/auth/Auth.jsx`               |
| `src/pages/AuthV2.jsx`                  | `redesign/screens/auth/Auth.jsx`               |
| `src/pages/Welcome.jsx`                 | `redesign/screens/auth/Welcome.jsx`            |
| `src/pages/Splash.jsx`                  | `redesign/screens/auth/Welcome.jsx` (tweaked)  |
| Any `Onboarding*.jsx` variants          | `redesign/screens/onboarding/OnboardingFlow.jsx` |

## Today / Dashboard

| Legacy                                  | Canonical target                               |
| --------------------------------------- | ---------------------------------------------- |
| `src/pages/Today.jsx`                   | `redesign/screens/today/Today.jsx`             |
| `src/pages/TodayV2.jsx`                 | `redesign/screens/today/Today.jsx`             |
| `src/pages/Dashboard.jsx`               | `redesign/screens/today/Today.jsx`             |
| `AppLayoutV2` shell                     | `redesign/layouts/AppShell.jsx`                |

## Nutrition

| Legacy                                  | Canonical target                               |
| --------------------------------------- | ---------------------------------------------- |
| `src/pages/Nutrition.jsx`               | `redesign/screens/nutrition/NutritionToday.jsx`|
| `src/pages/NutritionRedesigned.jsx`     | `redesign/screens/nutrition/NutritionToday.jsx`|
| `src/pages/MyDiet.jsx`                  | `redesign/screens/nutrition/NutritionOther.jsx#MyDiet` |

## Workouts

| Legacy                                  | Canonical target                               |
| --------------------------------------- | ---------------------------------------------- |
| `src/pages/Workouts.jsx`                | `redesign/screens/workouts/WorkoutsHome.jsx`   |
| `src/pages/WorkoutsV2.jsx`              | `redesign/screens/workouts/WorkoutsHome.jsx`   |
| `src/pages/TrainV2.jsx`                 | `redesign/screens/workouts/WorkoutsHome.jsx`   |
| `src/pages/MyWorkout.jsx`               | `redesign/screens/workouts/WorkoutsOther.jsx#MyWorkout` |

## Body / Progress

| Legacy                                  | Canonical target                               |
| --------------------------------------- | ---------------------------------------------- |
| `src/pages/Body.jsx`                    | `redesign/screens/body/BodyOverview.jsx`       |
| `src/pages/Progress.jsx`                | `redesign/screens/body/BodyOther.jsx#Progress` |
| `src/pages/ProgressV2.jsx`              | `redesign/screens/body/BodyOther.jsx#Progress` |
| `src/pages/ProgressPhotos.jsx`          | `redesign/screens/body/BodyOther.jsx#ProgressPhotos` |
| `src/pages/ProgressPhotosV2.jsx`        | `redesign/screens/body/BodyOther.jsx#ProgressPhotos` |

## Profile / Settings

| Legacy                                  | Canonical target                               |
| --------------------------------------- | ---------------------------------------------- |
| `src/pages/Profile.jsx`                 | `redesign/screens/settings/SettingsScreens.jsx#Profile` |
| `src/pages/ProfileV2.jsx`               | same                                           |
| `src/pages/Account.jsx`                 | `SettingsScreens.jsx#AccountSettings`          |

## Tokens / Shared

| Legacy                                  | Canonical target                               |
| --------------------------------------- | ---------------------------------------------- |
| Ad-hoc Tailwind classes                 | Use `tokens/tailwind.preset.js` + `rd-*` class aliases |
| `atlas-*` radius tokens                 | Mirrored in `rd-card`, `rd-control`, `rd-sheet` |
| Bespoke card styles                     | `ui/Card.jsx`                                  |

## Rollout recipe

1. Drop the redesign CSS variables: `import './redesign/tokens/theme.css'` at the top of `src/main.jsx`.
2. Merge the Tailwind preset: `presets: [require('./src/redesign/tokens/tailwind.preset')]` in `tailwind.config.js`.
3. Behind a feature flag (e.g. PostHog `redesign_enabled`), mount redesigned
   routes from `redesign/registry/route-config.js`. Keep the legacy router as
   fallback until parity is reached.
4. Ship domain-by-domain: `today → nutrition → workouts → body → labs → coach → settings → billing → social → admin`.
5. Delete each row in this table as it lands. Done when the file is empty.

## Known caveats preserved intentionally

- **Offline:** redesign does not assume robust offline sync. Every list uses
  standard loading → empty → error states; when offline, fall back to
  `OfflineState`.
- **i18n:** partial. `Language` settings flags Portuguese as `Partial`.
- **Billing:** web uses Stripe; native uses RevenueCat. `PlatformBillingNotice`
  renders the honest difference.
- **Android RevenueCat:** if incomplete, gate the RevenueCat entry with a
  feature flag and fall back to `RestorePurchases` with an explanatory notice.
- **AI logic:** coach surfaces are presented as server-backed. Keep client-side
  AI behind a flag; the `CoachLowConfidence` and `ExplainabilityCard` modules
  exist to make uncertainty explicit.
