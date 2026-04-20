# V3 Hardening Ledger

This is the explicit punch list for v3 surfaces that are mounted or mountable but still weaker than the legacy implementation in data depth, interaction depth, or route coverage.

## Mounted But Still Weaker

- `src/redesign/v3/routes/V3Today.jsx`
  Still falls back to mock/filler sections for fuel, weight, and coach content when real services are not wired.

- `src/redesign/v3/routes/V3Train.jsx`
  Core library shell is v3, but active workout, manual plan builder, exercise library, and most deeper training routes still go to legacy screens.

- `src/redesign/v3/routes/V3Eat.jsx`
  Macro/day shell is v3, but search, photo capture, voice logging, and diary remain older screens.

- `src/redesign/v3/routes/V3Body.jsx`
  Main body dashboard is v3, but measurements entry, labs, and deeper body/history flows still need v3 replacements.

- `src/redesign/v3/routes/V3You.jsx`
  Real data is wired, but some sections still rely on honest fallback rows when the user has sparse data.

- `src/redesign/v3/routes/V3Settings.jsx`
  New shell is mounted, but downstream settings detail screens still route into older implementations.

- `src/redesign/v3/routes/V3RoutineDetail.jsx`
  New shell is mounted, but this is still behaviorally lighter than the old detail flow and uses simplified mapping from the routine model.

- `src/redesign/v3/routes/V3CoachHome.jsx`
  New shell is mounted with real app-context signals, and the brief is intentionally lighter than a fully wired coaching backend.

- `src/redesign/v3/routes/V3CoachChat.jsx`
  New chat shell is mounted, but message history, composer send, and action menu are still placeholder-level interactions rather than a fully wired coach thread.

- `src/redesign/v3/routes/V3Labs.jsx`
  New overview shell is mounted with honest premium/empty behavior, but history, upload parsing, exams, and biomarker detail still route through older implementations.

- `src/redesign/v3/routes/V3BiomarkerDetail.jsx`
  New shell is mounted with an honest no-data state, but real biomarker readings, range logic, and longitudinal interpretation still depend on the lab parsing/data layer that is not wired yet.

- `src/redesign/v3/routes/V3ProgressPhotos.jsx`
  New shell is mounted with an honest empty state, but the real photo archive, compare slider backed by user assets, and photo detail route are not wired yet.

- `src/redesign/v3/routes/V3Notifications.jsx`
  New shell is mounted, but notification preferences are still local UI state only and not yet persisted to the real notification settings backend.

- `src/redesign/v3/routes/V3AuthSignup.jsx`
  New design is mounted, but the signup flow is still intentionally minimal compared with the fuller legacy account-creation form.

- `src/redesign/v3/routes/V3NutritionSearch.jsx`
  New search shell is mounted, but food selection, meal insertion, and result ranking are still placeholder interactions rather than the full nutrition search workflow.

## Not Yet Replaced

- Active workout route
  `/app/workouts/active`

- Coach home and chat stack
  `/app/coach/insights/:id`

- Nutrition capture/search stack
  `/app/nutrition/photo`
  `/app/nutrition/photo/confirm`
  `/app/nutrition/voice`
  `/app/nutrition/diary`

- Training depth routes
  `/app/exercises`
  `/app/exercises/:id`
  `/app/workouts/manual-plan`
  `/app/routines/presets`
  `/app/routines/presets/:id`

- Body/labs depth routes
  `/app/body/measurements`
  `/app/body/composition`
  `/app/labs/history`
  `/app/labs/exam/:id`

## Rule For Replacement

- Do not replace a legacy route with a v3 route if the v3 version is materially weaker in real user behavior.
- If a route is replaced anyway because the design shell is critical, log the missing capability here immediately.
- Clear an item from this file only when the v3 version matches or exceeds the legacy route in real behavior.
