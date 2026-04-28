# 02 · Features

**What this is:** every feature the app ships with, written as testable
behaviors. If a PR satisfies the "Then" clauses, the feature is done.

Format: `Given` context → `When` action → `Then` result.
Numbered for cross-ref. `ref` = which screen(s) exercise the feature.

---

## A · Authentication

### A1 · Passwordless sign-in (ref S87, S88, S89)
- **Given** a user with `email` that exists → **When** they submit email on S87 → **Then** a 6-digit code is generated, stored hashed, and emailed within 5s.
- **Given** a pending code → **When** user enters it on S88 within 10 min → **Then** S89 shows, session is created, user lands on `/today` (or `/onboard/1` if not onboarded).
- **Given** a code → **After** 10 min OR 5 wrong attempts → **Then** code invalidates; S88 shows "resend" with 30s cool-down.
- **Given** a new email → **When** submitted on S87 → **Then** flow forks to S90 signup (same code mechanism).

### A2 · Forgot / locked out (ref S91)
- **Given** a user can't receive email → **When** they tap "can't get in" on S88 → **Then** S91 offers SMS (if phone on file), Apple ID (if linked), or support-mail (always).
- No password reset flow exists; don't build one.

### A3 · Change email (ref S92)
- Requires re-verify on **both** old and new email before the change commits. Store as two-step workflow with a `pendingEmail` field on User.

### A4 · Sessions
- Sessions are 30 days; refreshed on every API call. Device listed in S64 integrations view (TBD section) with revoke action.

---

## B · Onboarding

### B1 · Happy-path onboarding (ref S7–S11)
- **Given** a fresh signup → **Then** routes are blocked until onboarding completes.
- S7 validates: age ≥ 13, height 90–250 cm.
- S8 requires exactly one goal.
- S9 requires one activity level (1–5).
- S10 shows derived targets; user may override kcal ± 30% before continuing.
- S11 permissions are **all optional**; "skip" exits onboarding and lands on `/today`.

### B2 · Extended onboarding (ref S58–S61)
- Only runs if entry channel = Signup (not Import, Sponsored, Invite).
- S58: frequency 1–7, style picker.
- S59: **must select ≥ 3 habits** before Continue enables.
- S60: all fields optional.
- S61: read-only review; Confirm writes Profile + Entitlements.

### B3 · Tour (ref S62)
- 4-step overlay on `/today`. Dismissible at any point. Sets `Profile.tourSeen = true`; never shown again.

### B4 · Alternate entry (ref S72–S75)
- **Returning** (S72): email matches a canceled account → skip identity/goal, show archive summary, two CTAs — "resume program" or "reassess" (runs B1 from S8).
- **Import** (S73): selected source writes a pending `ImportJob`; background worker fills MealLog/LoggedSession. User still completes B1/B2 — import data just preloads.
- **Invite** (S74): deep link carries `code`. Claim creates Invite row, auto-crews both users once invitee onboards. Rewards applied to Subscription.
- **Sponsored** (S75): sponsor code → Entitlements.plan = "sponsored", coach + labs + protocols all enabled. Privacy pledge stored as audit entry: sponsor only receives `enrollmentStatus`.

---

## C · Training

### C1 · Start session (ref S3)
- **Given** a PlannedSession today → **Then** S2 "today's session" CTA opens S3 with lifts prefilled.
- **Given** no planned session → **Then** S3 starts empty; user picks exercises inline.
- Creates a LoggedSession with `startedAt = now()`.

### C2 · Log a set (ref S3, S93)
- Minimum fields: `reps`, `weight`. RPE optional.
- Writes Set with `orderInSession` monotonically; triggers PR check (C5).
- Rest timer auto-starts on save; default 120s, editable per-exercise.

### C3 · Focus mode (ref S93)
- Inverted fullscreen; screen lock prevented (`keepAwake`).
- Timer ring animates; taps on the 3-button bar = [−weight] [+reps] [log].
- Exits on "done" → back to S3 row view.

### C4 · Finish session (ref S29)
- **When** user taps Finish → **Then** `endedAt = now()`, summary computed (volume, tonnage, new PRs), S29 shown.
- If a new PR exists → S95 modal plays over S29 once, before user sees S29 proper.
- Volume compare: this session vs 12-week avg for that program day.

### C5 · PR detection (ref S20, S95)
- On each Set write, compute: 1RM (if reps=1), e1RM (Epley), volume (session total), reps-at-weight.
- If any value > prior best for the same `(userId, exerciseId, kind)` → write PR row, mark Set.isPR, fire PR event (triggers S95 + notif).
- Algorithm must be idempotent: re-computing from history produces the same PR list.

### C6 · Calendar & reschedule (ref S26)
- Month view; dots per day reflect PlannedSession.
- Long-press day → reschedule/skip/swap sheet. Updates `status` + optionally moves to another date.
- Swap picks from `Exercise.siblings` for same pattern.

### C7 · Program commit (ref S25, S81)
- **When** user taps "Start program" → **Then** N weeks of PlannedSessions are generated from `Program.schedule`, aligned to chosen start date, honoring `trainingFrequency`.
- Replaces any existing active program (confirm modal).

### C8 · Exercise detail (ref S27)
- Shows 18-month 1RM trend, cues, variants.
- "Swap" button opens Exercise.siblings picker.

### C9 · Workout history (ref S54, S55)
- Chronological list (30d default, load-more). Grouped by week.
- Tap row → S55 read-only detail.

---

## D · Nutrition

### D1 · Log a meal (ref S51, S32, S38)
- Entry points: capture (S32 scan/photo/voice), search (S98), recipe (S39/S82), manual.
- Writes MealLog with `source`; non-manual sources require confirmation before committing (confidence < 1 shows edit sheet).
- Daily totals update live on S51.

### D2 · Macro targets (ref S52)
- Defaults derived from Profile (see data model derived values).
- User can override; overrides persist until user taps "reset to derived".
- Coach may propose targets (appears as Insight with `appliesToPlan=true`).

### D3 · Water log (ref S53)
- Quick-add tiles: 250/500/750/1000 ml.
- Daily goal derived from bodyweight (35 ml/kg default).

### D4 · Food search (ref S98)
- Queries against Food catalog + user's Recipes.
- Sort: exact match → recent log → popularity.
- Verified foods badged.

### D5 · Capture (ref S32)
- **Barcode:** lookup returns Food → show product card → confirm → log.
- **Photo:** ML returns candidate items with bbox pins → user confirms/edits → log with `source=photo`, `confidence`.
- **Voice:** ASR + NER returns parsed items → show waveform + itemized list → confirm → log with `source=voice`.

### D6 · Recipe builder (ref S39)
- Add items from Food or free-typed. Live macro total.
- Save as Recipe; option to set `isTemplate=true` (appears in S99).

### D7 · Meal plans (ref S99)
- 6 templates shipped; user can "apply plan" which prefills tomorrow's meal slots with recipe items.

---

## E · Body & biology

### E1 · Bodyweight logging (ref S6, S101, S6b)
- Two input modes: keypad (S6b) or ruler (S101). User preference persists.
- 7-day moving average always shown; weight changes < 0.5 lb/day ignored for trend smoothing.

### E2 · Measurements (ref S17)
- Keypad entry per site. At least one site per record.
- Derived waist-to-hip ratio shown when both present.

### E3 · Composition (ref S14, S56)
- Read-only aggregation of Weight + Measurement + Composition records.
- Source dropdown on S14 switches between DEXA / BIA / estimate.

### E4 · Progress photos (ref S18, S107)
- Photos default to device-only. Opt-in toggle per-photo to sync.
- S107 capture guides 3 angles; can skip angles.
- Compare hero (S18) picks first and last photo in range; range selectable.

### E5 · Lab upload (ref S77)
- Three paths: file drop (PDF/CSV), phone-camera OCR, request panel.
- OCR populates LabMarker values; user confirms before save.
- "Request panel" opens a third-party ordering flow (out of v1 scope — link only).

### E6 · Lab inbox & marker detail (ref S15, S16, S78, S79)
- S15: chronological panels with flag summary.
- S16/S78: one marker; trend over time; "what drives this" pulls from a curated reference.
- S79: all panels timeline; compare handles on two panels produce a diff view.

### E7 · Body check-in (ref S100)
- 4 questions daily (sleep/soreness/energy/stress), each optional, chip-multi-select.
- Informs readiness input; shown on S2 ring tooltip.

---

## F · Protocols (Pro-gated)

### F1 · Create a protocol (ref S46, S47)
- Required: substance, dose+unit, cadence.
- Optional: cycle, notes.
- **Cycle conflict warning**: if cadence overlaps another protocol's cycle in a way coach flags as contraindicated (curated substance pairs list), show warning; user may proceed but consent is logged.

### F2 · Log a dose (ref S48)
- Three modes: taken (time, site, notes), skipped (reason), adjusted (new dose, reason).
- Sheet remembers last site for injectables, rotates suggestion.
- Offline-safe: writes to local queue, syncs on reconnect.

### F3 · Today's doses (ref S43, S50)
- Cadence → schedule resolver produces today's ProtocolOccurrences.
- Ring fills as doses logged. 4/4 = S50 success state.
- 30-day adherence strip = rolling `dosesTaken / dosesScheduled`.

### F4 · Protocol detail (ref S45)
- 90-day cadence grid: on / late / missed / today.
- Edit/pause/end actions. Pausing halts schedule but keeps history.

### F5 · Timeline (ref S49)
- 90-day cross-protocol zine. Per-protocol band + moments strip.
- Read-only; no editing from this surface.

### F6 · Locked (ref S44)
- If `Entitlements.features.protocols === false` → S44 locked variant replaces S43 tab content.

---

## G · Coach

### G1 · Daily brief (ref S13)
- Generated by coach service at user's wake-window-start (derived from sleep data or default 06:30 local).
- Content: readiness score, 3 recommended moves, 14-day signal strip.
- Push notif fires when brief is ready (unless quiet hours).

### G2 · Chat thread (ref S12, S97)
- Streaming responses; typing indicator while tokens flow.
- Coach messages may include CoachCard attachments — taps wire to their target action (swap lift → opens S27 with preselected swap, etc.).
- Quick-reply chips generated from current conversation context.

### G3 · Insights digest (ref S96, S57)
- Up to 5 items/week, prioritized by recency and impact.
- "Big one" = the highest-impact insight; renders on S96 hero card.
- S57 deep-dive: numbered factors + recommendation. If `appliesToPlan=true`, Apply writes plan changes.

### G4 · Coach home (ref S97)
- Aggregates: today's read, 3-up signals, active thread, "what I'm watching" list.
- The coach surface is the tab, not just chat.

---

## H · Social

### H1 · Crew (ref S28)
- Opt-in; explicit accept when added.
- Weekly stats roll up Sunday 00:00 local.
- No notifications about others' activity unless user enables in S22.

### H2 · Public profile (ref S33 own, S76 shareable)
- User toggles `publicProfile = true` in S67.
- S76 reachable at `/p/:handle`; renders only public fields (handle, displayName, avatar, big-4 PRs if opted).

---

## I · Settings & account

### I1 · Settings hub (ref S104, S63)
- S104 is the dashboard entry; links to S63 sub-pages, S64 integrations, S22 notifs, S105 subscription, S106 data export, S65 danger zone, S67 profile, S66 diagnostics.

### I2 · Integrations (ref S64)
- Per-provider connect/disconnect. OAuth flow out-of-app for HealthKit-adjacent providers.
- Scopes shown and editable (user can revoke individual data categories).
- Last sync timestamp visible per row.

### I3 · Notifications (ref S22)
- Per-category toggle + quiet hours.
- Copy explicitly says "no streak mechanics" — backend must not fire guilt-style nudges even in future features.

### I4 · Diagnostics (ref S66)
- Read-only self-check: API reachable, DB writable, camera/mic permission, HealthKit linked, clock skew, app version.
- Copy-report button dumps JSON to clipboard for support.

### I5 · Profile editor (ref S67)
- handle (unique, lowercase, `[a-z0-9_]`), displayName, avatar.
- Toggle publicProfile.

### I6 · Subscription manage (ref S105)
- Show current plan, next billing date, payment method.
- Change-plan: Stripe checkout.
- Cancel: confirmation + retention offer (one-time 50% off 3 months) → if declined, `cancelAtPeriodEnd=true`, user keeps access until period end.

### I7 · Data export (ref S106)
- Formats: JSON (full), CSV (per-entity), PDF (report).
- Includes toggles per category. Server zips and emails signed link (24h expiry).

### I8 · Danger zone (ref S65)
- Pause: entitlements frozen, no billing.
- Reset: keep account, wipe logs (7-day grace, soft-delete).
- Delete: 30-day soft-delete, then hard-delete with PII scrub.
- Export is required step before delete (enforced in UI).

---

## J · Platform & system

### J1 · Offline (ref S83, S83b)
- All writes queue locally; shown as pending in list views (mono "SYNC…" stamp).
- On reconnect, queue drains; conflicts resolved server-side (server wins unless timestamp is strictly newer).
- S83 shown only when user actively tries a network op; background failures don't interrupt.

### J2 · Server errors (ref S84, S84b)
- 5xx → S84 full overlay with incident ID (from response header) and auto-retry countdown.
- Specific route failures → S84b compact banner; rest of app usable.

### J3 · Maintenance (ref S85, S85b)
- Backend returns a `503 + maintenance` response with ETA and affected subsystems.
- Full outage → S85; partial → S85b banner on affected screens only.

### J4 · Force update (ref S86)
- Boot-time check against `app.minVersion`.
- If below min → S86 full gate; no way past except store redirect.

### J5 · 404 (ref S103)
- Any unknown route client-side → S103. Copy says "nothing broken on your side".

### J6 · Search (ref S35)
- Queries lifts, programs, history, articles, coach suggestions.
- Highlights in accent color.
- Tapping a result routes to the appropriate detail.

### J7 · Inbox (ref S37)
- Aggregated signal stream (coach, plan, labs, crew, rest, billing).
- Inline CTAs advance user to the relevant screen.
- No "unread count" badge on tab bar (intentional; avoid anxiety).

### J8 · The Ledger (ref S94)
- 53-week heatmap of adherence (combined: training + nutrition + protocols).
- **Anti-streak:** missed days shown as neutral, not red. Copy: "missed days are data, not debt."
- No "current streak" counter anywhere.

### J9 · Watch companion (ref S34)
- iOS only in v1.
- Mid-set mirror: current weight, current reps, rest-timer ring, HR.
- Logs sent from watch create a pending-confirm flag on phone until user dismisses.

---

## K · Coach-side (coach web app)

### K1 · Roster (ref S68)
- Staff-only; access gated by `User.role = "coach"`.
- Filter by flag, program, adherence, readiness.
- Sortable columns. 7-day readiness sparkline per athlete.

### K2 · Client detail (ref S69)
- Full read on one athlete. All scopes they've granted their coach.
- Compose message from here → writes to CoachThread.

### K3 · Message queue (ref S70)
- Prioritized inbox (unread, urgent, PR, churn-risk tags).
- AI draft reply appears; coach edits or sends as-is.
- Saved-template chips expand to prefill common messages.

### K4 · Intervention (ref S71)
- 3-step flow: why (select triggers), change (type + scope + details), message (tone + body).
- Right rail shows exact phone preview of what client will see.
- On send → writes Intervention + CoachMessage + optionally updates PlannedSessions.

---

## L · Non-goals (explicit, to prevent drift)

- No streak counters anywhere.
- No push notifications outside the categories in §I3.
- No social feed beyond Crew stats (S28) — no posts, no comments, no likes.
- No in-app purchases other than the subscription.
- No ads.
- No gym location check-ins.
- No exercise video library in v1.
- No Apple Health **write-back** (read-only integration); user's HealthKit stays pristine.
