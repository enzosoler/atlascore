# 03 · Wiring Notes

**What this is:** per-screen map of what each interactive element does,
which data source feeds the screen, and which events it emits.

Read this when you're wiring up a single screen and need to know:
1. What data to fetch (`reads`)
2. What to do on tap/submit (`actions`)
3. What events propagate (`emits`)

Use with `00-screen-map.md` (navigation) and `01-data-model.md` (types).
Cross-refs to §X.Y point to `02-features.md`.

---

## Conventions
- `reads` — queries the screen subscribes to on mount
- `actions` — `elementName → handler(args) → [Feature ref]`
- `emits` — domain events written for other screens/services
- Unless noted, back/close buttons pop the nav stack; that's implicit.

---

## Core loop

### S1a · Welcome
- **reads** — none; uses static copy.
- **actions** — `signIn → route /login` · `getStarted → route /signup` · `whatIsThis → route /about` (S1b)

### S1b · Manifesto
- Static page. Back button only.

### S2 · Today
- **reads** — `Readiness(today)`, `PlannedSession(today)`, `MealLog(today)` totals, `Weight(latest)`, `CoachThread.unread`, `BodyCheckin(today)`
- **actions**
  - `readinessRing → expand tooltip` (shows inputs from Readiness.inputs)
  - `sessionCard → route /workout/:plannedId` (starts S3; creates LoggedSession if not exists) [§C1]
  - `fuelTile → route /fuel` (S51)
  - `weightTile → route /weight` (S6)
  - `coachStrip → route /coach` (S97) or `/coach/brief` if brief unread
  - `checkInPrompt → open S100 modal` (if `BodyCheckin(today)` missing)
- **emits** — `today.viewed` (telemetry)

### S3 · Active workout
- **reads** — `LoggedSession(:id)`, `Exercise` catalog for current lift, last-set-of-same-exercise for prefill
- **actions**
  - `logSet(reps, weight, rpe?) → writeSet + runPRCheck` [§C2, §C5]
  - `restTimer → countdown, chime on 0` (default 120s)
  - `swapExercise → open picker from Exercise.siblings` [§C8]
  - `focus → route /workout/:id/focus` (S93) [§C3]
  - `finish → setEndedAt + compute summary → route /workouts/:id/summary` [§C4]
  - `addExercise → exercise picker → append to session`
- **emits** — `set.logged`, `session.pr_detected` (→ triggers S95), `session.completed`

### S4 / S51 · Fuel / diary
- **reads** — `MealLog(today)`, `NutritionTargets`, `WaterLog(today)`
- **actions**
  - `captureStrip → (scan|photo|voice|again) → open S32 mode=X` [§D5]
  - `mealRow.add → open S98 search` [§D4]
  - `mealRow.itemTap → route /fuel/log/:id` (S38)
  - `targetsTile → route /fuel/targets` (S52)
  - `waterTile → route /fuel/water` (S53)
- **emits** — `meal.logged` (on confirm)

### S5a/b · Paywall
- **reads** — `Entitlements`, Stripe price list
- **actions**
  - `selectPlan → Stripe checkout → on success: update Entitlements → back to origin`
  - `restore → restorePurchases()` (App Store flow)
  - `close → back` (logs `paywall.dismissed` with source)

### S6 · Weight
- **reads** — `Weight[last 90d]`, computed 7d moving avg
- **actions**
  - `+button → open S6b or S101` (user pref)
  - `rangeToggle → refetch`
  - `compare → route /weight/compare` (S102)

### S6b · Weight entry (keypad)
- **actions** — `save(value) → writeWeight → close` [§E1]

---

## Onboarding

### S7–S11 (happy path)
Each step: `reads` current Profile draft from local state; `actions` = `back · continue(validate)` only; on S11 `skip` also exits to `/today`.

### S58–S61 (extended)
Same pattern; S59 gates Continue until ≥3 habits selected [§B2].

### S62 · Tour
- 4 overlays on `/today`; persisted step index in local storage; `skip → set tourSeen=true`.

### S72 · Returning user
- **reads** — prior `LoggedSession[last]`, `Program(active)`
- **actions** — `resumeProgram → set program status=active → /today` · `reassess → route /onboard/2` (skip identity)

### S73 · Import
- **actions** — `source → selectImportSource(x)` (populates live matrix) · `continue → enqueue ImportJob → /onboard/2` · `startFresh → /onboard/2`
- **emits** — `import.requested`

### S74 · Invite
- **reads** — Invite by `:code` (inviter user's public profile + PRs)
- **actions** — `acceptInvite → claimInvite(code) → /signup` (prefills referral flag)

### S75 · Sponsored
- **reads** — Sponsor by code
- **actions** — `enroll → POST /enroll with code → /onboard/1` (Entitlements set)

---

## Training

### S93 · Focus mode
- **reads** — current `Set` + next `ProgramLift`
- **actions** — `−weight / +reps / log → mutate draft set, then save on log`
- `keepAwake` on; exit on swipe-down or "done" [§C3]

### S24 / S80 · Library / presets
- **reads** — `Program[filtered]`
- **actions** — `card → route /program/:id`

### S25 / S81 · Program detail
- **actions**
  - `commit → generatePlannedSessions(startDate) → route /plan` [§C7]
  - `preview → route /exercise/:id` per-lift

### S26 · Calendar
- **reads** — `PlannedSession[month]`
- **actions**
  - `day tap → expand session list` · `day long-press → reschedule/skip/swap sheet`
  - `upcoming row → route /workout/:id`

### S27 · Exercise detail
- **reads** — `Exercise`, `Set[this exerciseId, last 18mo]` → chart 1RM/e1RM trend
- **actions** — `swap → picker(Exercise.siblings)` [§C8] · `add to session → route /workout/active`

### S28 · Crew
- **reads** — `CrewStat[thisWeek]`
- **actions** — `row tap → route /p/:handle` (S76) if they've opted public; else show name only

### S29 · Workout summary
- **reads** — `LoggedSession(:id)` + PR rows created in this session
- **actions** — `share → open S21 share sheet` · `whatsNext → route /plan next session`

### S54 · History
- **reads** — `LoggedSession[last 30d]` grouped by ISO week
- **actions** — `row → /workouts/:id` (S55)

### S55 · Workout detail
- Read-only view of LoggedSession. Per-lift set tables. PR badges inline.

---

## Nutrition

### S38 · Food detail
- **reads** — `MealLog(:id)` with items
- **actions** — `editItem → inline edit, recompute totals` · `save → writeMealLog(updates)` · `duplicate → clone log` [§D1]

### S82 · Meal detail
- Same as S38 for Recipe-sourced meals.

### S39 · Recipe builder
- **reads** — draft `Recipe` (local state until save)
- **actions** — `+item → search (S98)` · `save → writeRecipe` · `template → set isTemplate` · `share → share sheet`

### S98 · Nutrition search
- **reads** — query → `/foods/search?q=`
- **actions** — `result tap → log-to-meal sheet (slot + grams) → writeMealLog`

### S52 · Macro targets
- **actions** — `slider(kcal) → live recompute split` · `save → writeNutritionTargets` · `resetToDerived → clear override` [§D2]

### S53 · Water
- **actions** — `quick-add tile → writeWaterLog.entry(ml)` [§D3]

### S99 · Meal plans
- **actions** — `applyPlan → prefill tomorrow's MealLog slots from template recipes` [§D7]

### S32 · Capture (3 modes)
- **reads** — camera/mic permissions
- **actions**
  - **barcode**: `onScan(code) → lookup Food → confirm card → writeMealLog`
  - **photo**: `onShutter → ML detect → candidate pins → user confirm → writeMealLog`
  - **voice**: `onStopRecord → ASR+NER → item list → user confirm → writeMealLog`
- **emits** — `capture.logged(source)`

---

## Body & biology

### S14 · Body dashboard
- **reads** — `Weight[latest]`, `Composition[latest]`, `Measurement[latest]`, `LabPanel[flagged]`
- **actions** — tile taps route to trend (S56), measurements (S17), labs (S15)

### S15 · Labs inbox
- **reads** — `LabPanel[all]`
- **actions** — panel tap → route `/labs/panel/:id` (shows marker list) · marker tap → S16/S78

### S16 / S78 · Marker detail
- **reads** — `LabMarker(:id)`, history of same code across panels
- **actions** — `coachNote → route /coach/chat?prefill=apob`

### S77 · Lab upload
- **actions** — `dropFile / takePhoto / requestPanel → start upload → parse markers → review sheet → writeLabPanel` [§E5]

### S79 · Lab history
- **actions** — `panel.compareHandle → enter compare mode → pick 2 → diff view`

### S17 · Measurements
- **actions** — `save(site, valueCm) → writeMeasurement` [§E2]

### S18 · Progress photos
- **reads** — `ProgressPhoto[all, onDevice]`
- **actions** — `+ → route /body/photos/capture` (S107) · `hero.date picker → update compare range`

### S107 · Photo capture
- **actions** — `shutter(angle) → save local → advance angle` · `finish → writeProgressPhoto[]` (`onDevice=true` unless user opts in)

### S56 · Composition history
- Read-only trend; range picker only.

### S100 · Check-in
- **actions** — per-question chip select → `save → writeBodyCheckin` [§E7] · `dismiss` closes without writing

### S101 · Weight ruler
- Drag-ruler input → `save → writeWeight`

### S102 · Weight compare
- **reads** — two date ranges → overlay chart
- **actions** — `rangePicker[a|b] → refetch` · `share → composite image`

---

## Protocols

### S43 · Home
- **reads** — `Protocol[status=active]`, today's scheduled doses (derived), `DoseLog[last 30d]`
- **actions**
  - `doseRow.check → open S48 log sheet (mode=taken)` · `doseRow.skip → S48 mode=skipped` · `doseRow.edit → S48 mode=adjusted`
  - `+ → route /protocols/new` (S46)
  - `protocolRow → route /protocols/:id` (S45)

### S44 · Empty / locked
- Empty: `quickStart(template) → prefill S46 with template values`
- Locked: `upgrade → route /upgrade`

### S45 · Protocol detail
- **reads** — `Protocol(:id)`, `DoseLog[this protocol, 90d]`
- **actions** — `edit → /protocols/:id/edit` · `pause → setStatus(paused)` · `end → setStatus(ended) + endedAt`

### S46 · Protocol form
- **actions**
  - `substance → open S47 picker` · `cadence → inline picker` · `cycle → toggle + conflict check` [§F1]
  - `save → writeProtocol + generate schedule`

### S47 · Substance picker
- **reads** — Substance catalog (search indexed)
- **actions** — `result → return to S46 with substanceId` · `customSubstance → route form to create (admin-gated)`

### S48 · Log dose
- **actions**
  - mode=taken: `save(time, site, notes) → writeDoseLog(status=taken)` [§F2]
  - mode=skipped: `save(reason) → writeDoseLog(status=skipped)`
  - mode=adjusted: `save(newDose, reason) → writeDoseLog(status=adjusted)`
- Offline: queue locally, mark pending; sync on reconnect.

### S49 · Timeline
- Read-only. Range picker 30/60/90d.

### S50 · All-complete
- Shown when today's doses all logged. `nextTomorrow → route /protocols` preview mode.

---

## Coach

### S12 · Chat
- **reads** — `CoachThread`
- **actions** — `send(text) → append user msg → streaming coach response` · `cardTap → route per CoachCard.kind` [§G2]

### S13 · Brief
- **reads** — `Brief(today)`
- **actions** — `move.tap → route to that surface`

### S57 · Insight detail
- **reads** — `Insight(:id)` + supporting data referenced in factors
- **actions** — `applyToPlan → write plan changes → back with toast` [§G3] · `dismiss → mark readAt`

### S96 · Insights digest
- **reads** — `Insight[week, unread first]`
- **actions** — item tap → S57

### S97 · Coach home
- **reads** — `Brief(today)`, `Insight[unread]`, `CoachThread[active]`
- **actions** — `quickReply chip → send as user msg` · `watching list → route to referenced entity`

---

## Settings

### S104 · Account hub
- Static list → routes to S63, S64, S22, S105, S106, S65, S67, S66.

### S63 · Settings
- Grouped rows; each row routes to a sub-screen.

### S64 · Integrations
- **reads** — `Integration[]`
- **actions** — `connect → OAuth → writeIntegration(connected)` · `disconnect → revoke` · `scopes → toggle per-scope`

### S22 · Notifications
- **reads** — `NotificationPref`
- **actions** — toggle → `writeNotificationPref(patch)` [§I3]

### S105 · Subscription
- **reads** — `Subscription`, `PaymentMethod`
- **actions** — `changePlan → Stripe` · `cancel → confirm → retentionOffer → setCancelAtPeriodEnd` [§I6]

### S106 · Data export
- **actions** — `export(format, categories) → enqueue job → show "we'll email"` [§I7]

### S65 · Danger zone
- **actions** — `pause → Subscription.status=paused` · `reset → soft-delete logs` · `delete → requires S106 first, then soft-delete User` [§I8]

### S66 · Diagnostics
- **reads** — runtime checks (API ping, permissions, clock skew, version)
- **actions** — `copyReport → clipboard(JSON)`

### S67 · Profile editor
- **actions** — `save(handle, displayName, avatar, publicProfile) → writeProfile` (validates handle uniqueness server-side)

### S20 · PR gallery
- **reads** — `PR[all]` filterable by family.

### S21 · PR share card
- **actions** — `saveImage → rasterize + save to Photos` · `share → OS share sheet`

### S33 · Profile (own view)
- Read-only rendering of public-facing fields as seen by crew.

### S76 · Public profile
- Same, rendered at `/p/:handle` — accessible without auth if user opts in.

---

## Platform / states

### S37 · Inbox
- **reads** — `Signal[merged from Insight + plan + labs + crew + billing]`
- **actions** — row CTA → route to source

### S35 · Search
- **reads** — query → multi-index search
- **actions** — result tap → route per result kind

### S83 / S83b · Offline
- No reads. `retry → ping → close if back online`

### S84 / S84b · Server error
- **reads** — incident ID from response header
- **actions** — `retry` auto every 15s (countdown) · `support → mailto` with incident ID

### S85 / S85b · Maintenance
- **reads** — `/status` endpoint → ETA + subsystems
- **actions** — `notifyMe → subscribe(email)`

### S86 · Force update
- **actions** — `update → open App Store link`

### S103 · 404
- **actions** — suggestion links route to named destinations

### S94 · Ledger
- **reads** — combined adherence rows for 53 weeks
- **actions** — day tap → day detail (what was logged that day)

### S95 · PR celebration
- Shown once per PR. `share → S21` · `close → dismiss`

### S34 · Watch
- **reads** — active LoggedSession mirror
- **actions** — logs from watch flow into pending-confirm list on phone

---

## Coach-side (web)

### S68 · Roster
- **reads** — `CoachAssignment[]` + per-athlete summary (readiness today, 7d spark, flag, tonnage, adherence)
- **actions** — `row tap → /:handle` (S69) · `filter/sort → local` · `flag click → acknowledge`

### S69 · Client detail
- **reads** — full athlete profile (scopes granted), last 21d HRV, recent sessions, labs
- **actions** — `message → composer` · `intervene → /:handle/intervention` (S71)

### S70 · Queue
- **reads** — `CoachThread[tagged]`
- **actions** — thread select → context+quote+AI draft → `send(edited) → writeCoachMessage(source=human)`

### S71 · Intervention
- 3-step form local state; `send → writeIntervention + writeCoachMessage + optionally writePlannedSession patches` [§K4]

---

## Global events (produced by actions above; consumed by analytics, coach service, notif service)

| Event | Producers | Consumers |
|---|---|---|
| `set.logged` | S3, S34, S93 | PR service, Coach (for brief) |
| `session.completed` | S3 finish | Summary, Coach, Crew stats |
| `session.pr_detected` | C5 | S95, S21, push notif, Coach flag |
| `meal.logged` | S32, S38, S98, S39 | Targets tracking, Coach |
| `protocol.dose_logged` | S48 | Adherence roll-up, Coach |
| `lab.panel_uploaded` | S77 | Coach review queue, Insight service |
| `insight.published` | Coach service | S96, S37, push notif |
| `billing.plan_changed` | S105, S40 | Entitlements, gating |
| `onboarding.completed` | S11 or S61 | Unblocks routes |
| `invite.claimed` | S74 | Rewards service |

Every event carries `{ userId, at: ISO, ...payload }`. Consumer design is up to the build; the contract is that screens named as producers must emit, and screens named as consumers must subscribe.
