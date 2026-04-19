# Atlas Core — Redesign System

A parallel, non-destructive UI/UX redesign tree for Atlas Core.

**Nothing in this folder overrides existing app code.** Import selectively from
`src/redesign/*` to preview or migrate screen-by-screen.

## Philosophy

- **Dark & premium.** Obsidian (`#05070A`) base, cyan (`#00FFFF`) accent, restrained
  chroma, strong spacing rhythm, subtle elevation, confident typography.
- **Systems first.** Tokens → primitives → layouts → modules → screens → overlays.
  No one-off styling drift.
- **Architectural honesty.** Stripe on web, RevenueCat on mobile. Entitlement
  gating, role gating, and platform gating are first-class. Offline is best-effort,
  not faked. i18n is partial, not pretended-complete.
- **Reference-driven, not clone-driven.** Duolingo / Linear / Cal AI / Noom for
  onboarding. Whoop / Apple Fitness / Strava for dashboard. MyFitnessPal /
  MacroFactor / Cal AI for nutrition. Hevy / Fitbod / Strong for workouts.
  Function Health for labs. ChatGPT / Whoop / Oura for coach. Linear / Things 3 /
  iOS Settings for settings. Strava / Spotify Wrapped for share.

## Folder shape

```
src/redesign/
├── registry/              Screen + route registry (canonical targets, legacy aliases)
├── tokens/                Design tokens, theme CSS, Tailwind preset
├── lib/                   cn, mock data, state helpers, formatters
├── ui/                    Atomic primitives (Button, Card, Sheet, etc.)
├── layouts/               App shells + navigation
├── modules/               Shared feature modules (composed building blocks)
├── screens/               Route-level compositions
├── overlays/              Dialogs, sheets, wizards, full-screen modals
├── coverage-summary.md    What's covered, what's stubbed
└── migration-notes.md     Legacy → canonical mapping
```

## Rollout plan

1. Land tokens + primitives + layouts behind a feature flag.
2. Swap screens one domain at a time: auth → onboarding → today → nutrition → workouts → body → labs → coach → settings → billing → social → admin.
3. Retire legacy `*V2` / `*-redesigned` duplicates per `migration-notes.md`.

## Visual language quick reference

| Surface      | Background          | Border            | Text primary | Accent            |
| ------------ | ------------------- | ----------------- | ------------ | ----------------- |
| App canvas   | `#05070A`           | —                 | `#F5F7FA`    | —                 |
| Card         | `#0B0F15`           | `rgba(255,255,255,.06)` | `#F5F7FA` | —                 |
| Elevated    | `#11161F`           | `rgba(255,255,255,.08)` | `#F5F7FA` | —                 |
| Accent       | —                   | —                 | `#05070A`    | `#00FFFF`         |
| Premium      | —                   | `#C9A96A` on gold | —            | `#C9A96A`         |
| AI insight   | `rgba(139,92,246,.10)` | `rgba(139,92,246,.24)` | `#F5F7FA` | `#8B5CF6`    |

See `tokens/theme.css` for full variable map.
