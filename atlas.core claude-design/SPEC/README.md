# atlas.core — handoff spec pack

**Purpose:** turn the 107 designed screens into a real, working app.

The HTML designs show *what* each screen looks like. This spec layer adds
*how everything connects, what data drives it, and what behaviors are
required*. Anyone building the app — Claude Code, a human dev team, or
both — reads these four docs in order before touching code.

## Read order

1. **`00-screen-map.md`** — every screen, its route, its variants, what navigates
   in and out of it. Answers: "when does this screen appear?"

2. **`01-data-model.md`** — the entities (User, Workout, Set, Lab, Protocol…)
   and the fields each one needs. Answers: "what does this screen read and
   write?"

3. **`02-features.md`** — features as testable behaviors: `Given / When /
   Then` acceptance criteria, grouped by domain (training, nutrition, labs,
   protocols, coach, auth, billing, platform). Answers: "is this done?"

4. **`03-wiring-notes.md`** — per-screen event map. For each screen: which
   buttons do what, which data source it reads from, which events it emits.
   Answers: "when user taps X on screen Y, what happens?"

## Handoff assumptions

- **Stack:** React Native (iOS first, Android second), Node/TypeScript
  backend, Postgres + Redis. Coach console is web React at 1280px.
- **Auth:** passwordless email magic code only. No passwords anywhere.
- **Sync:** offline-first — local SQLite, write-ahead log, server is
  source of truth for conflict resolution.
- **AI:** the coach is an LLM-backed agent, not scripted. All coach copy
  on screens is *illustrative* — real prompts generate real text.
- **Privacy:** health data is on-device by default; server sync is opt-in
  per-category. Screens say this out loud; the backend must honor it.

## What's explicitly out of scope for v1

- Android watch companion (S34 is iOS only)
- Web app for the athlete side (S42 is the marketing page, not an app)
- Real-time video coaching
- Community/forum features beyond the Crew leaderboard (S28)
- Any gamification beyond what's already on-screen (ledger, PR wall)

## Screens that are illustrative, not implementable

Some screens exist to communicate brand/tone and don't ship as-is:
- **S30 Weekly Recap** — zine layout; ship a simpler version and iterate
- **S42 Web Landing** — design reference for a marketing site, not part of the app
- **Template pack (app store screenshots, emails, ads)** — assets, not features

Everything else (S1–S29, S31–S41, S43–S107) is shipping UI.
