# Teardown 24 — Account / profile

**Surface:** Account and profile control center for identity, plan status, billing entry, settings entry, reset, delete, and logout.
**Atlas file(s):** `src/pages/Account.jsx`, `src/pages/Profile.jsx`, `src/pages/ProfileEdit.jsx`, `src/pages/BillingManagement.jsx`, `src/pages/DeleteAccount.jsx`, `src/pages/Settings.jsx`, `src/components/profile/AccountTab.jsx`, `src/components/system/StartFreshModal.jsx`, `src/components/nutrition/NutritionModeSelector.jsx`, `src/lib/routes.js`, `src/App.jsx`
**Reference apps:** Linear (primary)
**Audience tension:** High — serious users want a fast, trustworthy control center for account state and destructive actions, while general users need the same surface to stay simple, reassuring, and non-technical.

---

## Why this screen matters

This surface is the user’s control center for who they are, what they pay for, and what happens if they want to reset or leave. It sits late in the journey, but it influences retention and trust at the moments that matter most: when a user checks their plan, changes their name, manages billing, or hits a destructive action.

If this surface is broken, the failure mode is concrete: users can’t find where to edit profile details, can’t tell whether they are subscribed, get unclear billing handoffs, or feel unsafe about reset/delete actions. World-class here is not flashy. It is calm, legible, and brutally clear about identity, plan state, settings, and destructive consequences.

---

## Reference app 1 — Linear (primary)

Linear is the right reference because it serves a serious, high-expectation audience that values speed, clarity, and trust in account-adjacent workflows. Atlas only partially matches that audience because it also serves general fitness users, but the same bar still applies: users should understand their identity, subscription, and settings without hunting.

### What Linear does that works

1. **Keeps hierarchy tight**

   Linear tends to organize account and settings surfaces into compact, predictable blocks. That works because the user can scan state and actions without reading a long explanation first. For Atlas, that means the account surface should read like a control panel, not a profile story.

2. **Uses rows with one job**

   Each row in Linear usually has one clear purpose: view, change, manage, or leave. That keeps the surface from feeling like a junk drawer. Atlas should borrow that discipline for profile, billing, settings, and destructive actions.

3. **Separates benign and destructive actions**

   Linear makes the dangerous stuff feel dangerous. Destructive actions are visually distinct and are not mixed into ordinary preference toggles. That pattern is important for Atlas because reset and delete actions can erase user trust if they look casual.

4. **Keeps status and action together**

   When Linear shows a state, it usually puts the next action right beside it. That reduces the mental work of translating status into action. Atlas should do the same for subscription state, account status, and settings navigation.

5. **Makes “where am I?” obvious**

   Linear’s account/settings areas usually keep the user oriented with a strong section title and concise labels. That matters because account surfaces are often entered from deep links, not from a deliberate browse. Atlas needs the same orientation because `/Profile`, `/account`, `/Settings`, and `/billing` are all separate hops.

### What Linear does that you shouldn't copy

1. **Do not copy enterprise vocabulary**

   Linear can lean on workspace, seat, and team semantics. Atlas has some pro users, but its account surface also serves consumer fitness users, so overusing enterprise language would make the page feel colder and harder to understand.

2. **Do not make everything look like admin control**

   Linear’s density works because it is a work tool. Atlas should stay warmer and more personal in the identity area, otherwise the page will feel like a settings console instead of a user account.

3. **Do not bury plain-language reassurance**

   Linear can assume a user is comfortable with system-level terms. Atlas cannot assume that for reset, billing, or delete-account flows. Those flows need friendlier copy and stronger explanation than Linear typically needs.

---

## What Atlas does today (current state)

- `src/pages/Profile.jsx` is the main profile hub in the authenticated shell. It shows the user identity at the top, then grouped links for goals, body profile, training plan, lab results, protocols, account, subscription, notifications, settings, export, help, and sign out. This is the broad “More / Control Center” entry point.
- `src/pages/Account.jsx` is a narrower account summary page. It has a back link to profile, an identity card with initials, email, name, and role badge, a plan card with current tier and a CTA to pricing or billing, a settings link, a danger zone, and a logout button.
- Identity editing is split out again into `src/pages/ProfileEdit.jsx`, where the Account tab is a separate form for first name, last name, display name, and read-only email. So “profile” is not edited on the account page itself; it is edited through a dedicated profile flow.
- Billing is split into `src/pages/BillingManagement.jsx`, which is a separate full-screen page for opening the customer portal or customer center. The account page only links there when subscribed; otherwise it links to pricing. That means billing is a separate destination, not an inline account control.
- Destructive actions are split again into `src/pages/DeleteAccount.jsx` and the reset dialog inside `Account.jsx`. The account page exposes “reset all my data” through an inline confirmation modal and exposes delete-account through a link to `/settings/delete-account`.
- Visual style is compact, card-based, and fairly restrained: rounded cards, small uppercase labels, muted secondary text, and one consistent page header. The surface is more list/control-center than marketing page.
- Known issues from code reading: `Account.jsx` creates `showResetModal` and `showNutritionModal` state, passes both into `AccountContent`, and renders `StartFreshModal` / `NutritionModeSelector` conditionally, but there is no visible trigger in this file and the setters are never used. Those modal branches are dead today, and the referenced components are not imported here. `BillingManagement.jsx` also uses hardcoded capitalized paths like `/Settings` and `/Pricing`, which is brittle against route conventions.
- The biggest structural gap versus Linear is fragmentation. Atlas spreads identity, billing, general settings, and destructive actions across `/Profile`, `/account`, `/profile/edit`, `/Settings`, `/billing`, and `/settings/delete-account`, which makes the control center feel more distributed than intentional.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Tight sectioning**

   Keep identity, plan, settings, and danger zone as clearly separated blocks with a single-line purpose for each. The current page already moves in this direction; the next step is to make each section’s job unmistakable. Effort: 2-4 hours.

2. **One row, one action**

   Every tappable row should either navigate somewhere or do one destructive thing, never both. That keeps the surface scannable and lowers accidental taps. Effort: 4-6 hours.

3. **Visible state plus next step**

   The plan card should always show the current status and the exact next action in the same visual cluster. That is the cleanest way to make account state feel concrete. Effort: 2-4 hours.

### 🟡 Steal soon — medium impact, medium effort

1. **Shared identity formatting**

   Reuse one derivation for display name, initials, and email across profile, account, and settings surfaces. Today those surfaces independently synthesize the same information, which makes them easier to drift apart. Effort: 1 day.

2. **Dedicated billing language**

   Make billing copy say exactly what happens next: upgrade, manage, or open portal. Atlas should not use a single vague billing CTA for both free and subscribed users. Effort: 4-8 hours.

3. **Clear destructive handoff**

   Put reset and delete-account behind dedicated confirmation screens or dialogs with explicit consequences. That is worth the extra click because the surface is about trust as much as convenience. Effort: 1 day.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Merge the profile system**

   A deeper refactor could unify `/Profile`, `/account`, and `/profile/edit` into one coherent account model. That would improve coherence, but it is a product decision because it changes how much structure Atlas exposes to users. Effort: 1-2 weeks.

2. **Add security/session controls**

   A true Linear-like account area would expose active sessions, connected devices, and security settings. That is a worthwhile direction only if Atlas wants to make account trust a first-class product pillar. Effort: 1-2 weeks.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Identity hub vs. account summary.**
`/Profile` is already the broad identity hub, while `/account` is a narrower account summary. *Resolution:* keep that split. Make `/Profile` the place where people recognize themselves and branch out, and make `/account` the place where they verify plan state and jump to deeper management screens.

**Tension 2 — Simple control center vs. fragmented routing.**
The surface is easier to understand when each concern gets its own page, but too many hops make the experience feel disjointed. *Resolution:* keep the separate pages, but make the account page a deliberately strong hub with sharper labels and clearer next actions so users never wonder where to go next.

**Tension 3 — Safety vs. speed for destructive actions.**
Reset and delete-account need friction, but they should not feel like traps. *Resolution:* keep them visually isolated in a danger zone, and make the confirmation step explicit enough that the user can predict the outcome before they tap.

**Tension 4 — Consumer warmth vs. serious-user credibility.**
Atlas needs to feel approachable to general fitness users, but the account surface also has to satisfy people who expect precision and control. *Resolution:* keep the copy human and the layout compact, but let the status, labels, and destructive confirmations be exact.

---

## Specific changes to make (actionable list)

1. Remove the dead modal state from `Account.jsx` or wire it to real triggers.
   Files to touch: `src/pages/Account.jsx`, optionally `src/App.jsx`
   Effort: 2-4 hours
   Dependency on any other numbered task: none

2. Promote profile editing into a clearer CTA from the account summary.
   Files to touch: `src/pages/Account.jsx`, `src/pages/Profile.jsx`, `src/pages/ProfileEdit.jsx`
   Effort: 4-6 hours
   Dependency on any other numbered task: none

3. Standardize the subscription CTA so free users go to pricing and paid users go to billing with copy that matches the action.
   Files to touch: `src/pages/Account.jsx`, `src/pages/BillingManagement.jsx`, `src/pages/Settings.jsx`
   Effort: 4-8 hours
   Dependency on any other numbered task: none

4. Replace hardcoded billing paths with route constants.
   Files to touch: `src/pages/BillingManagement.jsx`, `src/lib/routes.js`
   Effort: 1-2 hours
   Dependency on any other numbered task: none

5. Make the identity block derive display name, initials, and email through a shared helper.
   Files to touch: `src/pages/Account.jsx`, `src/pages/Profile.jsx`, `src/pages/Settings.jsx`
   Effort: 1 day
   Dependency on any other numbered task: none

6. Tighten the account page’s settings row copy so it says what lives under `/Settings`.
   Files to touch: `src/pages/Account.jsx`, `src/pages/Settings.jsx`
   Effort: 2-4 hours
   Dependency on any other numbered task: none

7. Make reset and delete-account copy consistent across the account page and the delete-account screen.
   Files to touch: `src/pages/Account.jsx`, `src/pages/DeleteAccount.jsx`
   Effort: 4-6 hours
   Dependency on any other numbered task: none

8. Add loading and empty-state handling for missing user or subscription data so the page does not fall back to generic placeholders without context.
   Files to touch: `src/pages/Account.jsx`, `src/pages/Profile.jsx`, `src/pages/Settings.jsx`
   Effort: 4-8 hours
   Dependency on any other numbered task: none

Total effort: about 2-4 days for the UI cleanup and consistency work, or 1-2 weeks if the team chooses to rationalize the profile/account split more aggressively. The biggest jump in perceived quality comes from fixing the dead modal wiring, standardizing identity and plan state across the split surfaces, and making billing/destructive actions read as intentional next steps instead of generic links.

---

## What NOT to do

1. Do **not** collapse profile, settings, billing, and delete-account into one long form; that would turn a control center into a maintenance dump.
2. Do **not** copy Linear’s enterprise account language without translation; Atlas needs precision, not corporate jargon.
3. Do **not** leave reset or delete actions looking like ordinary navigation rows; users should feel the risk before they tap.
4. Do **not** keep parallel identity derivation logic in multiple pages if the values are supposed to match.
5. Do **not** use one vague billing CTA for both free and paid users when the next step is different.
6. Do **not** leave modal state or route targets in the code unless the page can actually reach them.

---

## The single highest-leverage thing

Make the account system read as one intentional structure: `/Profile` for identity and branching, `/account` for account state and plan status, `/Settings` for preferences, and dedicated screens for billing and deletion. That split already exists in code, but it is not yet legible as a product model. If Atlas tightens that model and removes the dead wiring around the account page, the entire surface will feel more trustworthy, easier to scan, and much less like a set of loosely related settings pages.

**File status:** Draft 1. To be revised after implementation against reality.
