# Atlas Teardown Implementation Pass — 2026-04-17

This file records the implementation spec for the surfaces updated in this pass.
Each section includes:
- current structure from code
- target structure derived from the teardown plus reference app
- reference-to-Atlas translation

This is an implementation document, not analysis.

## 31. System States

### Current structure

Top to bottom in `src/components/shared/StablePage.jsx`:
1. `PageShell`
Purpose: page title and page chrome.
Component: page wrapper.
CTA: optional header actions.
Density: medium.
Interaction: navigation only.

2. `SectionCard`
Purpose: local content grouping.
Component: card section.
CTA: optional section actions.
Density: medium.
Interaction: passive container.

3. `LoadingState`, `ErrorState`, `EmptyState`, `StatusBanner`
Purpose: isolated state fragments.
Component: separate cards/banners.
CTA: inconsistent, page-specific.
Density: medium.
Interaction: mostly retry/go back buttons.

4. `SafePageBoundary`
Purpose: crash fallback.
Component: full replacement page.
CTA: bottom action group.
Density: loose.
Interaction: reload or history back.

Known current issues:
- loading, empty, error, and offline are separate primitives instead of one state contract
- retry actions are not standardized
- context labels such as freshness, offline, or scope are optional and inconsistent

### Target structure

Top to bottom for every state block:
1. Context row
Purpose: say what part of the product is affected.
Component: eyebrow + optional meta badge.
CTA location: none.
Density: tight.
Interaction: passive.

2. State body
Purpose: diagnose the state truthfully.
Component: bordered state card with icon, title, description.
CTA location: inline under description.
Density: medium.
Interaction: tap CTA buttons only.

3. Optional recovery notes
Purpose: show offline, partial-data, or platform constraints.
Component: muted note row or status banner.
CTA location: inline if needed.
Density: tight.
Interaction: optional secondary action.

Explicit decisions:
- component type: one `DataState` contract with variants `loading`, `empty`, `error`, `offline`, `permission`, `success`, `neutral`
- spacing density: medium inside the card, tight for meta rows
- CTA placement: inline inside the state card, primary left, secondary right
- interaction model: tap retry, tap back, tap go-to-settings, tap create-first-item
- loading: show structured loading state instead of blank gaps
- empty: show why empty + one primary next action
- error: show diagnosis + retry; do not masquerade as empty
- offline: use persistent inline banner for recoverable pages and full state only for route-blocking pages

### Reference translation

Reference: Linear system-state grammar
Translate into Atlas:
- Preserved workspace context -> Atlas keeps `PageShell` and section chrome visible
- One recovery action -> Atlas `DataState` primary CTA
- Partial failure stays inline -> Atlas `StatusBanner`/inline `DataState` inside a section

Reference: Things 3 / Duolingo permissions
Translate into Atlas:
- Calm empty canvas -> Atlas low-noise empty state card
- Benefit-first permission copy -> Atlas permission variant with explanation before OS prompt
- Clean skip path -> Atlas secondary CTA for later/settings

## 06. TodayV2 Dashboard

### Current structure

Top to bottom in `src/pages/TodayV2.jsx`:
1. Header
Purpose: date, greeting, weather, streak.
Component: mixed header row.
CTA: none.
Density: medium.
Interaction: passive.

2. Day-one banner or daily status + trial countdown
Purpose: onboarding/purchase state and day summary.
Component: multiple stacked cards.
CTA: top and mid-page.
Density: high.
Interaction: tap banner, tap pricing, tap primary action.

3. Streak/recovery modules
Purpose: streak reinforcement.
Component: pill, dots, milestone/share prompt.
CTA: inline or modal.
Density: medium.
Interaction: tap, auto-open share.

4. Nutrition/AI/protocol/weekly/quick actions/recommendations
Purpose: logging and deeper context.
Component: many separate cards and grid tiles.
CTA: distributed across the page.
Density: high.
Interaction: tap to navigate, open sheets, open chat.

5. Overlays
Purpose: coach chat, body check-in, quick meal, share flow.
Component: sheets/modals.
CTA: modal bottom actions.
Density: medium.
Interaction: modal, inline send, confirm.

### Target structure

Top to bottom:
1. Header strip
Purpose: orient the day.
Component: compact header with date, greeting, streak chip.
CTA location: none.
Density: tight.
Interaction: passive.

2. Daily status hero
Purpose: answer "How is today going?" in one glance.
Component: single dominant status card.
CTA location: inline inside card, primary left, coach follow-up right.
Density: medium.
Interaction: tap primary action, tap coach follow-up.

3. State rail
Purpose: handle day-one, trial, offline, or partial-data context without fragmenting the hero.
Component: stacked compact banners.
CTA location: inline in each banner.
Density: tight.
Interaction: tap dismiss, tap pricing, tap retry.

4. Priority action strip
Purpose: expose 2-3 state-aware next moves.
Component: horizontal or 2-column mini action cards.
CTA location: inline on each card.
Density: medium.
Interaction: tap log meal, start workout, check in.

5. Coach + guidance block
Purpose: proactive interpretation, not navigation.
Component: coach insight card plus freshness/source label.
CTA location: bottom-right inside card.
Density: medium.
Interaction: tap continue in chat, tap dismiss.

6. Daily details block
Purpose: show supporting evidence for the hero.
Component: modular cards for nutrition, protocols, weekly progress.
CTA location: header-right or card footer.
Density: medium.
Interaction: tap card to drill down.

7. Recommendations block
Purpose: secondary next-best actions.
Component: simple stacked recommendation rows.
CTA location: row-right.
Density: medium.
Interaction: tap row.

Explicit decisions:
- CTA priority: hero primary action first, coach second, all other actions below
- data density: simple above the fold, denser below the fold
- interaction model: tap only; no auto-open share interrupt during initial read
- loading: route-level loading card before showing zero-state metrics
- empty: hero still renders with "getting started" copy plus one setup CTA
- error: inline partial-data banner under hero; keep last usable sections visible

### Reference translation

Reference: Whoop Today screen
Translate into Atlas:
- Top daily readiness card -> Atlas daily status hero
- State-specific recommendation -> Atlas priority action strip
- Supporting metrics under hero -> Atlas daily details block

Reference: Apple Fitness home
Translate into Atlas:
- Progress-first encouragement -> Atlas compact progress pills inside the hero
- Clean motivation below the fold -> Atlas recommendations block

## 21. Pricing Page

### Current structure

Top to bottom in `src/pages/Pricing.jsx`:
1. Hero
Purpose: price framing and brand promise.
Component: marketing header.
CTA: auth/app actions in nav only.
Density: medium.
Interaction: passive.

2. Trust pills + region selector + billing toggle
Purpose: billing controls and reassurance.
Component: mixed pills and controls.
CTA: top-right controls.
Density: medium.
Interaction: tap toggle, select region.

3. Comparison table
Purpose: compare tiers.
Component: table.
CTA: none.
Density: high.
Interaction: passive.

4. Plan cards
Purpose: select plan.
Component: three pricing cards.
CTA: bottom of each card.
Density: medium.
Interaction: tap subscribe/manage.

5. Creator code + private lane/footer
Purpose: secondary conversion/support.
Component: support card and waitlist/footer block.
CTA: bottom.
Density: medium.
Interaction: tap modal/waitlist.

### Target structure

Top to bottom:
1. Hero statement
Purpose: frame the athlete offer.
Component: concise hero block.
CTA location: none in hero body.
Density: medium.
Interaction: passive.

2. Billing contract row
Purpose: state the canonical billing promise.
Component: bordered contract card with trial, cancellation, card requirement, post-checkout path.
CTA location: none.
Density: medium.
Interaction: passive.

3. Purchase controls row
Purpose: let the user set region and billing interval before reading prices.
Component: region selector + monthly/yearly segmented control.
CTA location: top-right of the pricing area.
Density: tight.
Interaction: tap/select inline.

4. Plan card grid
Purpose: choose plan.
Component: three cards, one highlighted.
CTA location: bottom of each card.
Density: medium.
Interaction: tap subscribe/manage.

5. Decision comparison
Purpose: answer "what changes when I upgrade?"
Component: compact comparison table.
CTA location: none.
Density: medium-high.
Interaction: passive.

6. Billing FAQ
Purpose: remove post-click uncertainty.
Component: short accordion or stacked Q&A.
CTA location: none.
Density: medium.
Interaction: tap to expand if accordion.

7. Secondary support lane
Purpose: creator code and professional waitlist without competing with the purchase decision.
Component: low-emphasis support cards.
CTA location: bottom.
Density: medium.
Interaction: tap open modal / join waitlist.

Explicit decisions:
- plan CTA copy depends on state: free signup, current plan, open in app, start trial
- region selector never disappears during loading
- yearly savings badge is computed, not fixed
- loading: controls stay mounted with loading label
- empty: not applicable
- error: billing FAQ and support rows stay visible; show inline pricing error banner if checkout init fails

### Reference translation

Reference: Linear pricing
Translate into Atlas:
- One job per section -> Atlas hero, billing contract, plan grid, comparison, FAQ
- Clear highlighted tier -> Atlas Pro card
- Explicit deltas -> Atlas decision comparison

Reference: Superhuman pricing
Translate into Atlas:
- Outcome-first tier pitches -> Atlas plan pitch lines
- Premium spacing -> Atlas simpler top contract row and quieter support lane

## 23. Manage Subscription

### Current structure

Top to bottom in `src/pages/BillingManagement.jsx`:
1. Header
Purpose: back navigation and generic billing subtitle.
Component: page header.
CTA: back.
Density: tight.
Interaction: tap back.

2. Current subscription card
Purpose: plan facts and portal button.
Component: one section card with status banner, metric rows, action buttons.
CTA: bottom.
Density: medium.
Interaction: tap open portal/customer center.

### Target structure

Top to bottom:
1. Billing summary card
Purpose: show current plan, renewal, and billing owner immediately.
Component: primary status card with one-row summary.
CTA location: top card footer.
Density: medium.
Interaction: tap manage billing.

2. Handoff explanation card
Purpose: explain exactly what opens next and what can be changed there.
Component: explanation card with bullet rows for renewal, payment method, cancellation, restore/support.
CTA location: bottom.
Density: medium.
Interaction: tap open customer center or portal.

3. Portal failure state
Purpose: recover if launch fails.
Component: inline error state card.
CTA location: inline retry/support.
Density: medium.
Interaction: tap retry, tap back to settings.

Explicit decisions:
- CTA placement: bottom of summary and handoff card, same label hierarchy
- data density: medium, no large metric grid
- interaction model: tap manage, tap retry
- loading: disable CTA and show inline spinner in button
- empty: free-plan empty state with upgrade CTA
- error: handoff error card stays on the same page

### Reference translation

Reference: Apple Settings subscription row
Translate into Atlas:
- Single subscription row -> Atlas billing summary card
- Action follows state -> Atlas state-specific manage CTA

Reference: Blinkist consumer billing
Translate into Atlas:
- Plain language plan framing -> Atlas handoff explanation card
- Clear visible manage action -> Atlas footer CTA

## 24. Account

### Current structure

Top to bottom in `src/pages/Account.jsx`:
1. Header with back link.
Purpose: route orientation.
Component: page shell actions.
CTA: top-left back.
Density: tight.
Interaction: tap back.

2. Identity section.
Purpose: show initials, name, email, role.
Component: profile card.
CTA: none.
Density: medium.
Interaction: passive.

3. Account state section.
Purpose: show plan details and billing links.
Component: status banner + detail grid + buttons.
CTA: bottom.
Density: medium-high.
Interaction: tap billing/status or pricing.

4. Control plane section.
Purpose: branch to profile, settings, notifications, integrations.
Component: stacked rows.
CTA: row-right.
Density: medium.
Interaction: tap rows.

5. Danger zone + logout.
Purpose: reset/delete/logout.
Component: rows + button.
CTA: bottom.
Density: medium.
Interaction: tap row, modal confirm.

### Target structure

Top to bottom:
1. Identity summary card
Purpose: say who this account is.
Component: avatar/initials + name/email + role chip + edit profile CTA.
CTA location: top-right or footer-right.
Density: medium.
Interaction: tap edit profile.

2. Subscription hub card
Purpose: make account state immediately legible.
Component: single billing summary card with plan, renewal, billing owner, next action.
CTA location: inline in the card footer.
Density: medium.
Interaction: tap manage billing or view plans.

3. Control rows
Purpose: send users to the correct ownership surface.
Component: stacked disclosure rows for settings, notifications, integrations.
CTA location: row-right.
Density: medium.
Interaction: tap rows.

4. Danger zone
Purpose: isolate destructive actions.
Component: stacked destructive rows plus confirm dialogs.
CTA location: row-right or modal footer.
Density: medium.
Interaction: tap row, type confirm if destructive.

5. Session action
Purpose: end the session without mixing with destructive data actions.
Component: single secondary button.
CTA location: bottom.
Density: loose.
Interaction: tap confirm logout.

Explicit decisions:
- no separate "view plan status" CTA in account hub; billing hub owns that
- settings row copy explains what lives there
- integrations row points to one canonical integration center
- loading: if user/subscription missing, show state card instead of generic placeholders
- empty: free-plan branch shows "View plans"
- error: section-level error state inside subscription hub

### Reference translation

Reference: Linear account control center
Translate into Atlas:
- Tight account blocks -> Atlas identity, subscription, control rows, danger zone
- One row, one job -> Atlas disclosure rows
- Status next to action -> Atlas subscription hub card

## 25. Settings Hub

### Current structure

Top to bottom in `src/pages/Settings.jsx`:
1. Account summary
Purpose: user and plan summary.
Component: two stacked cards.
CTA: manage billing, edit profile.
Density: medium.
Interaction: tap row buttons.

2. Appearance, language, nutrition mode
Purpose: safe preferences.
Component: inline segmented cards.
CTA: inline.
Density: medium.
Interaction: tap change immediately.

3. Notifications, data/privacy, support
Purpose: deeper control pages.
Component: disclosure rows and one static support card.
CTA: row-right.
Density: medium.
Interaction: tap row.

4. Session section
Purpose: logout.
Component: destructive row.
CTA: inline.
Density: medium.
Interaction: tap confirm logout.

### Target structure

Top to bottom:
1. Control-plane summary
Purpose: anchor settings as preferences, not billing.
Component: compact summary card linking to Account and showing current plan/theme/language at a glance.
CTA location: row-right to Account.
Density: medium.
Interaction: tap disclosure.

2. Inline preferences
Purpose: change safe, reversible preferences immediately.
Component: appearance, language, nutrition-mode cards.
CTA location: inline on controls.
Density: medium.
Interaction: tap to apply immediately with toast feedback.

3. Connected services
Purpose: expose integrations as part of the control plane.
Component: disclosure row with current connection state.
CTA location: row-right.
Density: tight.
Interaction: tap to open integration center.

4. Notification and data controls
Purpose: open deeper system flows.
Component: grouped disclosure rows.
CTA location: row-right.
Density: medium.
Interaction: tap row.

5. Support and lifecycle
Purpose: help, privacy, sign out.
Component: grouped rows with danger section separated at bottom.
CTA location: row-right or inline.
Density: medium.
Interaction: tap row, confirm sign out.

Explicit decisions:
- Settings owns preferences and control-plane rows only
- Billing is linked through Account, not framed as the primary settings job
- safe preferences stay inline
- destructive actions stay isolated at bottom
- loading: summary card shows loading state when profile/subscription fetch is unresolved
- empty: not applicable
- error: summary card uses inline error state

### Reference translation

Reference: Things 3 settings
Translate into Atlas:
- Small section count -> Atlas five settings groups
- Inline safe preferences -> Atlas appearance/language/nutrition cards

Reference: iOS Settings
Translate into Atlas:
- Right-aligned status rows -> Atlas control-plane disclosure rows
- Deep settings on separate pages -> Atlas notifications/privacy/export/integrations destinations

## 26. Integrations

### Current structure

Top to bottom across `src/pages/Integrations.jsx` and `src/pages/ConnectedServices.jsx`:
1. `Integrations.jsx` overview and static connected/roadmap lists.
Purpose: discovery.
Component: counters, static rows, next steps.
CTA: bottom rows.
Density: medium.
Interaction: mostly passive.

2. `ConnectedServices.jsx` Apple Health manager.
Purpose: connect, sync, disconnect.
Component: separate management card.
CTA: bottom actions.
Density: medium.
Interaction: tap connect/sync/disconnect.

Known current issue:
- one surface says connected statically while another manages the real state

### Target structure

Top to bottom:
1. Overview banner
Purpose: explain what integrations are live on this device and what Atlas can do with them.
Component: intro status banner.
CTA location: none.
Density: medium.
Interaction: passive.

2. Live integrations section
Purpose: manage real connections.
Component: one high-signal Apple Health card with status, sync scope, last sync, and actions.
CTA location: card footer.
Density: medium.
Interaction: tap connect, sync now, disconnect, open device settings guidance.

3. Platform state card
Purpose: be explicit on Android or unsupported devices.
Component: empty/platform guidance card.
CTA location: bottom if relevant.
Density: medium.
Interaction: tap back or learn more.

4. Roadmap section
Purpose: show future providers without pretending they are live.
Component: clearly labeled static rows.
CTA location: none or waitlist-style secondary CTA.
Density: medium.
Interaction: passive.

Explicit decisions:
- one canonical integrations center; `ConnectedServices` should reuse or redirect to this surface
- CTA placement: all live-integration actions live inside the Apple Health card footer
- data density: simple summary first, deeper sync details after connected
- interaction model: tap connect, tap sync, tap disconnect, modal-free unless OS prompt appears
- loading: show in-card loading state for permission requests/sync
- empty: unsupported-platform card
- error: show inline sync failure state and keep the rest of the card visible

### Reference translation

Reference: Notion connections
Translate into Atlas:
- One canonical home -> Atlas single integrations center
- Connected and available together -> Atlas live section + roadmap section
- Explicit per-app actions -> Atlas Apple Health card footer actions

Reference: Raycast action-first discovery
Translate into Atlas:
- Fast visual scan -> Atlas one-card live integration summary
- Requirements visible -> Atlas platform state card and permission copy
