# atlas.core — Operational Backlog

Standing order: autonomous engineer keeps this file current. Pull the next
highest-leverage item when no urgent bug is active. Add new findings as they
surface.

Legend
------
- `[ ]` open · `[~]` in progress · `[x]` shipped · `[!]` blocked

## 0. Broken / bug-fix queue

- `[x]` Onboarding funnel disconnected at step 5 — V3OnboardingPermissions
  skipped straight to /app/today, orphaning steps 6-10. FIXED: d28a0e5.
- `[x]` 216 source files missing from git — Vercel deploy failed with ENOENT
  on integrationsService.js, workoutsService.js, dailySystem.js. FIXED: 81917e1.
- `[x]` Duplicate exports in v2 ExerciseLibrary — dead import from nonexistent
  shared/exerciseCatalog. FIXED.
- `[!]` #8 Active Workout v2 screen outdated & broken — waiting on a canvas
  design for the execution flow. Design-lane blocked.
- `[ ]` V3ProgressPhotos.jsx:14 — body photo tap toasts "coming soon" instead
  of routing to a dedicated capture screen. Needs a body-photo route or a
  clean gate that makes the limitation explicit.
- `[x]` Fullscreen flows platform gate — already wrapped with PlatformGate
  (wiring AI added it). Verified in App.jsx lines 948-968.
- `[ ]` Xcode Cloud: verify Build 21 clears App Store validation after alpha
  strip. If a new ITMS rejection arrives, fix immediately.

## 1. Activation / core-value surfaces

- `[ ]` V3Today — 18 hardcoded English strings bypass i18n (flagged in the
  pt-BR audit). Move to `en.json` + add `pt-BR.json` entries. Primary daily
  screen, pt-BR users hit this first.
- `[ ]` Login / signup — make sure the email-first flow, magic link, and
  Apple/Google handoff all work on public-web frame (not just phone frame).
  Validate after the recent V3StandaloneLayout split.
- `[ ]` Welcome → onboarding → paywall funnel — measure drop-off. Verify
  every step renders in both locales and doesn't flash the wrong layout on
  slow connections.

## 2. Conversion / retention

- `[ ]` V3Paywall — 14 hardcoded English strings (PLANS copy, toasts, nav).
  Move to i18n so Portuguese paywall actually reads in Portuguese.
- `[ ]` V3SubscriptionManage — hardcoded "email support@useatlascore.com"
  toast + "Get the app" nav link. i18n-wire both.
- `[ ]` V3CoachChat — 5 hardcoded toast messages. i18n-wire.

## 3. Reliability / edge cases

- `[ ]` useDailyStateV2 — confirm it handles the Supabase race where a
  brand-new user has no `workout_plans` row yet. Library should render
  empty-but-inviting, not crash.
- `[ ]` PhotoScan web path — if getUserMedia fails (blocked permission) the
  shutter still calls onCapture with dataUrl=null. Route handler needs to
  branch on null and show an error state instead of navigating to confirm.
- `[ ]` Food search — empty query flash. Already handled, but validate
  debounce cancellation on rapid typing.

## 4. Performance

- `[ ]` Main bundle is 1.9MB (538kB gzipped). Identify heaviest dependencies,
  dynamic-import what's not on the critical path.
- `[ ]` PWA precache is 3.8MB. Trim any legacy/pages assets that aren't
  imported anywhere.

## 5. Code quality / cleanup

- `[ ]` src/pages/ — 124 files / ~1.5MB of dead code from v1 era. Zero
  imports from App.jsx. Separate cleanup task; verify no lazy-import paths
  reference it before deleting.
- `[ ]` V3Settings — drop the unused `useSubscription` import + sanity-check
  every row key has a routeMap entry or an explicit handler.
- `[ ]` App.jsx is 1600+ lines. Many Route wrappers could be extracted to
  their own files in src/redesign/v3/routes/.

## 6. Polish / design consistency

- `[ ]` DailyCheckinGate — 6 hardcoded English strings. Minor in scope,
  noticeable for PT users.
- `[ ]` V3MagicLinkSent — 2 hardcoded strings.
- `[ ]` V3ExerciseDetail — "Favoriting coming soon" toast copy in English.

## 7. Infra / ops

- `[ ]` Vercel production branch — manually confirm it's now set to `main`
  in the project settings. Current deploys go through `vercel --prod` CLI,
  which works but the dashboard should show main as the production branch.
- `[ ]` Xcode Cloud — consider adding a pre-archive script that runs
  `sips -g hasAlpha` on 1024.png to catch the ITMS-90717 alpha issue before
  upload. One-line `test` gate.

## 8. Intelligence visibility

- `[ ]` Today readiness — current "Readiness · {level}" labels are English
  constants. Make readiness band labels (green / amber / red) localized AND
  bias the copy toward CLAUDE.md §6: predict / recommend / explain
  cause-effect.
- `[ ]` Coach insight cards — confirm each shows state + insight + action +
  trajectory per CLAUDE.md §5, not just a one-liner.

## 9. Discovered during execution

- `[ ]` Onboarding steps 1-5 (v3) have NO data persistence — user choices are
  local React state, lost when navigating between steps. V2 steps 6-10 use
  useOnboardingFlow() with shared state. V3 needs the same or similar pattern.
- `[ ]` Onboarding step 1 Identity — age (32) and height (5'11") are hardcoded
  display values, not editable inputs. User can only pick sex.
- `[ ]` Onboarding step 4 Plan — calorie/macro targets are hardcoded (2380 kcal,
  186P/286C/79F). Should compute from steps 1-3 input.
- `[ ]` 19 v2 production routes have no canvas design — see PRODUCT_AUDIT.md.
- `[ ]` V3 gallery footer says "35 screens" but there are now 50+.
- `[ ]` Exercise catalog is duplicated: v2/workouts/ExerciseLibrary.jsx (332
  exercises) AND v3/lib/exerciseCatalog.js (same data). V2 file should
  re-export from v3 lib to single-source it.
