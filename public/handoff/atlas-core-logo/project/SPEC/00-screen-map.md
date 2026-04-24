# 00 · Screen Map

**What this is:** every designed screen mapped to a route, a role in the
app, its primary states, and how the user arrives/leaves.

**Conventions**
- `→ S##` means "navigates to screen ##"
- Routes use slashes (`/today`) and query for state (`?state=empty`)
- `modal:` means presented as a sheet over the previous screen
- `(coach)` marks screens that live in the coach web app, not the phone

---

## Phase 01 — Core loop

| # | Screen | Route | Role | Arrives from | Leaves to |
|---|---|---|---|---|---|
| S1a | Welcome (splash) | `/welcome` | Cold-start hero | first app open | `→ S87` Login · `→ S90` Signup |
| S1b | Manifesto | `/about` | Brand/about page | S1a "what is this?" link · deep link from web | back |
| S2 | Today (readiness) | `/today` | **Home tab.** Morning surface. | tab bar · post-auth · push notif | `→ S13` brief · `→ S3` workout · `→ S4` fuel · `→ S6` weight · `→ S12` coach chat |
| S3 | Active workout | `/workout/:sessionId` | Live session logger | S2 "today's session" CTA · S26 calendar day | `→ S93` focus mode · `→ S29` summary (on finish) · `→ S48` log dose modal |
| S4 | Nutrition (fuel) | `/fuel` | **Tab.** Day ledger | tab bar · S2 fuel tile | `→ S51` diary · `→ S32` capture · `→ S38` food detail · `→ S52` macro targets · `→ S98` search |
| S5a | Paywall — plans | `/upgrade` | Trial conversion | after 7d free trial · tap locked feature · S44 locked tab | `→ S40` billing on purchase · back (dismiss) |
| S5b | Paywall — PR moment | modal over S95 | Post-PR upgrade pitch | after logging a PR while on trial | `→ S40` · back |
| S6a | Weight trend | `/weight` | Bodyweight history | S2 weight tile · S14 body tab | `→ S6b` log entry · `→ S101` ruler input · `→ S102` compare |
| S6b | Weight entry | modal over S6a | Number-pad log | S6a "+" button | back on save (updates S6a) |

## Phase 02 — Onboarding (happy path)

Gated 5-step flow, linear, no jumping ahead. Exits to `/today` (S2).

| # | Screen | Route | Step | Validates |
|---|---|---|---|---|
| S7 | Identity | `/onboard/1` | 1/5 | sex, age (13+), height, units |
| S8 | Goal | `/onboard/2` | 2/5 | one of: lose, recomp, maintain, build |
| S9 | Activity | `/onboard/3` | 3/5 | 1–5 TDEE step |
| S10 | Plan preview | `/onboard/4` | 4/5 | accepts calculated targets (editable) |
| S11 | Permissions | `/onboard/5` | 5/5 | HealthKit, notifs, wearable — all optional |
| S58 | Workout prefs | `/onboard/3b` | 3/6 extended | frequency (1–7), style |
| S59 | Habits | `/onboard/4b` | 4/6 | ≥3 of 6 selected |
| S60 | Constraints | `/onboard/5b` | 5/6 | injuries, avoidances (optional) |
| S61 | Summary | `/onboard/6` | 6/6 | read-only review; confirms write |
| S62 | Tour | `/onboard/tour/:step` | post-onboard tour | 4 steps over `/today` surface |

**Onboarding variants (alternate first beats, then merge into S8+)**

| # | Screen | Route | Trigger |
|---|---|---|---|
| S72 | Returning user | `/welcome-back` | login from a previously canceled account |
| S73 | Import | `/onboard/import` | "I already track this elsewhere" path in S7 |
| S74 | Invite | `/invite/:code` | deep-linked referral |
| S75 | Sponsored | `/enroll/:sponsorCode` | corporate/insurance deep link |

## Phase 03 — Body & biology

| # | Screen | Route | Role |
|---|---|---|---|
| S14 | Body dashboard | `/body` | **Tab.** Composition overview |
| S15 | Labs inbox | `/labs` | Chronological panel list |
| S16 | Biomarker detail | `/labs/marker/:id` | Single marker (e.g. ApoB) deep-dive |
| S78 | Lab marker detail (v2) | `/labs/marker/:id` | Same route as S16 — newer visual — **pick one in build** |
| S17 | Measurements entry | modal over S14 | Girth inputs with keypad |
| S18 | Progress photos | `/body/photos` | 6-month grid + compare hero |
| S107 | Photo capture | `/body/photos/capture` | 3-angle guided camera |
| S77 | Lab upload | `/labs/upload` | Drop file / photo / request panel |
| S79 | Lab history | `/labs/history` | All panels chronologically |

## Phase 04 — Settings & edges

| # | Screen | Route | Role |
|---|---|---|---|
| S19 | Settings (v1) | `/settings` | Top-level settings |
| S63 | Settings (v2) | `/settings` | Newer version — **pick one** |
| S104 | Account hub | `/account` | Dashboard entry point to all account surfaces |
| S20 | PR gallery | `/prs` | All-time PR wall |
| S21 | PR share card | modal export | Post-PR screenshot → IG |
| S22 | Notifications | `/settings/notifications` | Inbox + prefs |
| S23 | Empty states | (internal) | 3 states shown together — spec reference |
| S37 | Inbox | `/inbox` | Signal stream |
| S64 | Integrations | `/settings/integrations` | HealthKit, Whoop, etc. |
| S65 | Danger zone | `/settings/danger` | Pause, reset, export, delete |
| S66 | Diagnostics | `/settings/diagnostics` | Self-check |
| S67 | Profile editor | `/account/profile` | Edit public profile |
| S105 | Subscription | `/account/subscription` | Plan change + cancel |
| S106 | Data export | `/account/data/export` | JSON/CSV/PDF |

## Phase 05 — Training surface

| # | Screen | Route | Role |
|---|---|---|---|
| S24 | Library (v1) | `/library` | Program directory |
| S80 | Presets browse (v2) | `/library` | Same route — **pick one** |
| S25 | Program detail (v1) | `/program/:id` | 5/3/1 BBB-style deep-dive |
| S81 | Preset detail (v2) | `/program/:id` | Same route — **pick one** |
| S26 | Calendar | `/plan` | **Tab.** Month view |
| S27 | Exercise detail | `/exercise/:id` | Lift deep-dive |
| S28 | Crew leaderboard | `/crew` | Opt-in micro-social |
| S54 | Workout history | `/workouts/history` | 30-day session list |
| S55 | Workout detail | `/workouts/:id` | Past session read-only |
| S29 | Workout summary | `/workouts/:id/summary` | Post-session success state |
| S93 | Focus mode | `/workout/:id/focus` | Eyes-up training mode (inverted) |

## Phase 06 — Bookends & companions

| # | Screen | Route | Role |
|---|---|---|---|
| S30 | Weekly recap | `/recap/:week` | Sunday zine (ship a simpler v1) |
| S31 | Sleep detail | `/sleep/:date` | Last-night deep-dive |
| S32 | Capture (fuel) | `/fuel/capture` | Scan / photo / voice — 3 modes |
| S33 | Public profile (own view) | `/profile` | How the crew sees you |
| S76 | Shareable profile | `/p/:handle` | External web-shareable view |
| S34 | Watch companion | (watchOS app) | Mid-set wrist mirror |
| S35 | Search | `/search` | Universal search |

## Phase 07 — Auth, edges, web

| # | Screen | Route | Role |
|---|---|---|---|
| S36 | Auth (v1) | `/auth` | Email+magic — **use S87 flow instead** |
| S87 | Login | `/login` | Email entry |
| S88 | Magic code | `/login/code` | 6-digit entry |
| S89 | Verifying | `/login/verify` | Callback while validating |
| S90 | Signup | `/signup` | Create account |
| S91 | Forgot (locked out) | `/login/help` | Alternate verify paths |
| S92 | Change email | `/account/change-email` | 2-step email change |
| S38 | Food detail | `/fuel/log/:id` | Logged meal expanded |
| S82 | Meal detail | `/meals/:id` | Saved meal expanded |
| S39 | Recipe builder | `/fuel/recipe/:id?` | Draft a meal |
| S40 | Billing | `/billing` | Payment/invoices (deprecated? see S105) |
| S41 | Errors (catch-all) | various | 4 states; **use S83/S84/S85 individually** |
| S42 | Web landing | (marketing site) | Out of app scope |

## Phase 08 — Protocols

Full sub-app for supplement/medication protocols. Gated behind `pro` feature flag.

| # | Screen | Route | Role |
|---|---|---|---|
| S43 | Protocols home | `/protocols` | **Tab** (if pro). Today's doses + active list |
| S44a | Protocols empty | `/protocols?state=empty` | First-run |
| S44b | Protocols locked | `/protocols?state=locked` | Free-tier paywall |
| S45 | Protocol detail | `/protocols/:id` | One protocol |
| S46 | Protocol form | `/protocols/new` · `/protocols/:id/edit` | Author/edit |
| S47 | Substance picker | modal over S46 | Search substance DB |
| S48 | Log dose | modal over S43/S45 | Taken/skipped/adjust sheet |
| S49 | Timeline | `/protocols/timeline` | 90-day cross-protocol view |
| S50 | All-complete | `/protocols?state=complete` | 4/4 success bookend |

## Phase 09 — Nutrition, history, insight

| # | Screen | Route | Role |
|---|---|---|---|
| S51 | Food diary | `/fuel` | Day ledger (tab landing) |
| S52 | Macro targets | `/fuel/targets` | Editable targets |
| S53 | Water log | `/fuel/water` | Hydration |
| S56 | Composition history | `/body/trends` | 30d weight trend |
| S57 | Coach insight | `/coach/insight/:id` | Single deep-read |
| S96 | Insights digest | `/coach/insights` | Weekly reads list |
| S97 | Coach home | `/coach` | **Tab.** Full coach surface |
| S12 | Coach chat | `/coach/chat` | Live thread |
| S13 | Coach brief | `/coach/brief` | Morning brief (push destination) |
| S98 | Nutrition search | `/fuel/search` | Food DB |
| S99 | Meal plans | `/fuel/plans` | Template picker |
| S100 | Body check-in | modal over S2 | 4-question daily quick |
| S101 | Weight ruler | alt input for S6b | Drag-ruler variant |
| S102 | Weight compare | `/weight/compare` | Range overlay |

## Phase 10 — States & system

| # | Screen | Route | Role |
|---|---|---|---|
| S83 | Offline | full-bleed overlay | Connection lost |
| S83b | Offline compact | inline banner | Mid-session offline notice |
| S84 | 5xx error | full-bleed overlay | Backend down |
| S84b | 5xx compact | inline banner | Partial-route failure |
| S85 | Maintenance | full-bleed overlay | Planned downtime |
| S85b | Maintenance compact | inline banner | Sub-service downtime |
| S86 | Force update | full-bleed gate | Version below minimum |
| S103 | 404 | `*` fallback | Unknown route |
| S94 | The Ledger | `/ledger` | Adherence heatmap (anti-streak) |
| S95 | PR celebration | modal over S3/S29 | Unlock moment |

## Coach web app (1280px desktop)

| # | Screen | Route | Role |
|---|---|---|---|
| S68 | Roster | `coach.atlas.core/` | **Home.** Athlete dashboard |
| S69 | Client detail | `coach.atlas.core/:handle` | One athlete's full read |
| S70 | Message queue | `coach.atlas.core/queue` | Inbox of threads |
| S71 | Intervention | `coach.atlas.core/:handle/intervention` | 3-step push composer |

---

## Tab bar (athlete app)

Five tabs:
1. **Today** (S2) — default
2. **Fuel** (S4/S51)
3. **Train** (S26 calendar · S24 library as secondary)
4. **Body** (S14)
5. **Coach** (S97)

Protocols (S43) appears as a 6th tab only when `features.protocols === true`.

## Global routing rules

- Unauthenticated user on any route → redirect to `/welcome` (S1a)
- Authenticated, not-onboarded → `/onboard/1` (S7), block other routes
- `app.minVersion` check at boot → S86 if below
- Offline at boot with no cached user → S83; with cache → last-known tab, flag stale
- Any 5xx → S84; any 4xx other than 401/403 → S103
- 401/403 → force re-auth (S87)
