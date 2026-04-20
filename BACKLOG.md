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

- `[x]` V3Today — all strings wired via today.* keys. 6ed6f2d
- `[ ]` Login / signup — make sure the email-first flow, magic link, and
  Apple/Google handoff all work on public-web frame (not just phone frame).
  Validate after the recent V3StandaloneLayout split.
- `[ ]` Welcome → onboarding → paywall funnel — measure drop-off. Verify
  every step renders in both locales and doesn't flash the wrong layout on
  slow connections.

## 2. Conversion / retention

- `[x]` V3Paywall — 14 hardcoded English strings wired via t(). a9bc389
- `[x]` V3SubscriptionManage — cancel toast + "Get the app" nav link wired via t(). 7dbc1d1
- `[x]` V3CoachChat — 5 hardcoded toast messages + placeholder wired via t(). 7dbc1d1

## 3. Reliability / edge cases

- `[x]` useDailyStateV2 — verified safe: maybeSingle() returns null (not error) for missing workout_plans, plan derived value guards on !rawPlan, all queries wrapped in sq().
- `[x]` PhotoScan web path — App.jsx onCapture now guards on null dataUrl; no-op if capture failed instead of navigating to confirm.
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
- `[x]` V3Settings — useSubscription import already absent; verified clean.
- `[ ]` App.jsx is 1600+ lines. Many Route wrappers could be extracted to
  their own files in src/redesign/v3/routes/.

## 6. Polish / design consistency

- `[x]` DailyCheckinGate — 20+ strings fully wired via checkin.* keys. f1d21ef
- `[x]` V3MagicLinkSent — all visible strings wired via magicLink.* keys. f1d21ef
- `[x]` V3ExerciseDetail — favoriting + history toasts wired. f1d21ef

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

## Design-shells to harden

Full audit 2026-04-19. PROD=real inputs+real onSave, SEMI=some state
but incomplete, SHELL=display-only/hardcoded.

PROD (confirmed production-interactive after 2026-04-19 re-audit):
- S2_Today_A, S3_Workout_A, S4_Nutrition_A (bug fixed), S6_Weight_B,
  S7_Onboard_Identity, S8_Onboard_Goal, S9_Onboard_Activity,
  S12_Coach_Chat, S14_Body_Dashboard, S17_Measurements_Entry,
  S22_Notifications (wired this session), S24_Library,
  S35_Search, S36_Auth (wired this session), S38_Food_Detail,
  S39_Recipe_Builder, S41_Errors (wired this session),
  S44_Protocols_Empty_Locked, S46_Protocol_Form, S48_Log_Dose

STILL SHELL (lower priority — detail/secondary screens):
- `[ ]` S32_Capture — mode switcher only; capture is native-dependent (Capacitor)
- `[ ]` S5_Paywall_A — plan toggle works; onStartTrial(planId) already correct
- S1_Splash_A/B, S10_Onboard_Plan, S11_Onboard_Permissions,
  S13_Coach_Brief, S15_Labs_Inbox, S16_Biomarker_Detail,
  S18_Progress_Photos, S19_Settings, S20_PR_Gallery,
  S21_Share_Card, S25_Program_Detail, S26_Calendar,
  S27_Exercise_Detail, S28_Crew, S29_Workout_Summary,
  S30_Weekly_Recap, S31_Sleep_Detail, S33_Profile,
  S34_Watch, S37_Inbox, S40_Billing, S42_Web_Landing,
  S43, S45, S47, S49, S50, S5_Paywall_B, S6_Weight_A

## Handoffs (design → engineering)

- `[x]` V3Settings.jsx — "Manage subscription" on native should call
  presentCustomerCenter() instead of navigating to /app/billing.
  DONE: f807a43 (engineering implemented before lane split).
- `[x]` V3AppShell.jsx + V3StandaloneLayout.jsx — data-v3 attr added to all root container divs. 7dbc1d1

## Recent ships

- f1d21ef feat(i18n): wire DailyCheckinGate, V3MagicLinkSent, V3ExerciseDetail
- 7dbc1d1 feat(i18n): wire V3CoachChat+V3SubscriptionManage toasts; data-v3 layout roots
- f225ae5 fix(design): S4_Nutrition_A — missing ACChip import + arguments[0] bug
- cba0676 feat(design): S41_Errors — selectable conflict cards, typed payloads
- 1862772 feat(design): S22_Notifications — onToggle/onOpen/onMarkAllRead contract
- e48866e feat(design): S36_Auth — onSubmit emits {email,password,mode} + &apos; fix
- a9bc389 feat(i18n): wire V3Paywall + add shared webNav keys
- 6ed6f2d feat(i18n): wire V3Today through useT()
- dc4eb1b fix(#1): remove blue focus rectangle on login/signup inputs
- 8942bfd fix(#4): Body page hero card colors now theme-aware
- f807a43 fix(#3): Manage Subscription opens native RevenueCat on mobile
- 23f43e2 feat(onboarding): swap paywall to v3 paper+ink+amber design
- 343aabc feat(onboarding): Plan preview computes real targets
- 533839a/1dc1307 feat(onboarding): interactive Identity + shared state
- 375b42e chore: delete 162 dead files from src/pages/
- d28a0e5 fix(critical): reconnect onboarding funnel step 5→6

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
- `[x]` Exercise catalog deduplication: v2/workouts/ExerciseLibrary.jsx now imports DEMO_EXERCISES from v3/lib/exerciseCatalog.js. File shrank 371 lines.
