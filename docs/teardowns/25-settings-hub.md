# Teardown 25 — Settings hub

**Surface:** Authenticated account/settings control plane for theme, language, nutrition mode, notifications, data/privacy, support, and session actions.
**Atlas file(s):** src/pages/Settings.jsx, src/pages/NotificationSettings.jsx, src/pages/PrivacyScreen.jsx, src/pages/ThemeScreen.jsx, src/pages/LanguageScreen.jsx, src/pages/DataExport.jsx, src/pages/DeleteAccount.jsx, src/pages/Account.jsx, src/pages/Profile.jsx, src/components/profile/PreferencesTab.jsx, src/components/layout/AppLayout.jsx, src/App.jsx
**Reference apps:** Things 3 (primary), iOS Settings (secondary)
**Audience tension:** High — serious users want direct control over data, notifications, and billing, while general users need a calm, low-friction place that does not feel like an admin console.

---

## Why this screen matters

This is the account control center users reach when they want to change how Atlas behaves, not what it does. The hub sits at the intersection of trust, retention, and operational clarity: if it is easy to understand, users can manage billing, reminders, language, and privacy without support; if it is confusing, every account-level task becomes a support ticket or a churn trigger.

The surface also carries outsized psychological weight. Settings is where users look for proof that the product is controllable, reversible, and respectful of their data. Broken settings here does not just mean a bad layout; it means hidden billing, dead-end preference pages, unclear deletions, or mismatched state between what the UI says and what the backend actually stores.

World-class here means a single calm hub that shows the current account state, gives obvious next actions, and only opens deeper flows when needed. It should feel more like Things 3 than a generic admin panel: tight hierarchy, minimal clutter, and no fake affordances.

---

## Reference app 1 — Things 3 (primary)

Things 3 is the right primary reference because it treats preferences as a quiet control layer rather than a feature dump. That matches Atlas better than a consumer app with a sprawling settings maze: Atlas has serious, data-heavy behavior, but it still needs to feel precise and human.

### What Things 3 does that works

1. **Small section count.** Things-style settings keep the number of visible groups low, so each one feels intentional. Atlas can use that same discipline to make the hub read as curated, not crowded.
2. **Terse labels.** The best settings surfaces do not explain themselves twice. Short titles and short supporting copy let the user scan quickly and decide whether to tap.
3. **Inline state first.** Good settings surfaces show the current mode before asking for action. That matters for Atlas because users need to see their current plan, theme, language, or reminder state before they change it.
4. **Low-friction toggles.** Things 3 makes changes feel immediate and local, not like form submission. Atlas should preserve that feel for appearance and language, where confirmation dialogs would be overkill.
5. **Separation of control and danger.** Routine preferences stay calm; destructive actions are isolated. That is the right model for Atlas because sign-out, reset, and deletion are not normal preferences.
6. **Calm density.** Things 3 can carry a lot of capability without visual noise. Atlas should borrow that restraint instead of turning the settings hub into a dashboard of badges, metrics, and product promo cards.

### What Things 3 does that you shouldn't copy

1. **Do not copy the minimalism so far that the product feels opaque.** Atlas has more serious account, data, and subscription implications than a task manager, so users need a little more explanation and state visibility.
2. **Do not collapse all settings into one flat list.** Atlas needs nested flows for notifications, export, privacy, and deletion; forcing everything into a single screen would hurt clarity.
3. **Do not make the page feel non-committal.** Things can be soft and understated because the stakes are low. Atlas needs the same calmness, but with more explicit consequences around billing and data.

---

## Reference app 2 — iOS Settings (secondary)

iOS Settings is the right secondary reference because it solves the same structural problem Atlas has: many small controls, some of them dangerous, across a product that should still feel orderly. It adds the system-level patterns Things 3 does not emphasize as much: grouped disclosure rows, nested pages, right-aligned status, and an obvious separation between inline toggles and deeper configuration.

### What iOS Settings does that works

1. **Grouped lists with clear boundaries.** Settings groups related controls into sections that are easy to scan and easy to dismiss mentally. Atlas already uses section cards; the opportunity is to make the grouping feel more authoritative and less like a random stack.
2. **Disclosure hierarchy.** iOS uses a row to show the current category, then a dedicated page for detail. That is the right model for Atlas for notifications, export, privacy, and deletion.
3. **Immediate feedback on toggles.** iOS makes toggles feel local and dependable. Atlas should mirror that for safe preferences like theme and language.
4. **Status on the right, action on the left.** A clean row with a title, a short description, and a visible current state is easy to scan. Atlas currently uses some of that, but not consistently across the whole hub.
5. **Danger isolation.** iOS buries destructive actions deeper and surrounds them with warning language. Atlas should keep the same separation, especially for reset and delete.

### What iOS Settings does that you shouldn't copy

1. **Do not mimic the exhaustive system-app density.** Atlas is not a device settings app; if it becomes that dense, it will feel bureaucratic rather than premium.
2. **Do not use generic system labels without product meaning.** Atlas needs the language to sound like Atlas, not like boilerplate OS preferences.

---

## What Atlas does today (current state)

- Layout and navigation structure: there is a dedicated `/Settings` route in `src/App.jsx:500` and it is reachable from the desktop/mobile app chrome in `src/components/layout/AppLayout.jsx:459` and `:604`, plus from `src/pages/Profile.jsx:177` and `src/pages/Account.jsx:346`. The page itself is a `SafePageBoundary` around a `PageShell` stack of `SectionCard`s in `src/pages/Settings.jsx`.
- Key interactions: the hub shows account identity and subscription status, opens the customer portal, lets users switch theme and language, stores a nutrition-mode preference in `profiles.profile_data`, links to notification settings, export, privacy, help, and sign-out. `src/pages/Settings.jsx:168-205` and `:232-439` are the core interaction code.
- Visual approach: the hub uses rounded cards, soft borders, muted fills, and icon chips with a premium-but-neutral feel. It is denser and more structured than the profile page, but still visually quiet.
- Known issues from code reading: `Settings.jsx` depends on nested `settings.*` translation keys, but the translation bundle excerpts I checked only showed top-level `settings.title` / `subtitle`; the translator falls back to generated readable labels when keys are missing, so section text may degrade. `NotificationSettings.jsx:74-80` calls `scheduleReminders(t)` without an import or local definition, which looks like a real bug. The linked `PrivacyScreen.jsx`, `ThemeScreen.jsx`, `LanguageScreen.jsx`, and `DataExport.jsx` are mostly static shells or local-state demos rather than fully wired settings pages.
- Gaps relative to the reference app: the hub does not yet behave like one coherent control plane. It mixes inline preferences, linked subpages, and duplicated settings surfaces in `ProfileEdit` and `Account`, so the user has to guess where a setting really lives. iOS Settings would make the hierarchy sharper; Things 3 would make the hub quieter and more deliberate.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Make the account summary authoritative.** Keep the current account/subscription block, but tighten it into a more explicit status row: who am I, what plan am I on, and what can I do next. That gives the hub an immediate sense of purpose. Effort: 1 day.
2. **Use real disclosure rows for deep actions.** The notification, privacy, export, and delete entries should read like proper settings rows with a clear destination and short status copy. That is the fastest way to make the page feel structured instead of improvised. Effort: 1 day.
3. **Keep safe preferences inline.** Theme, language, and nutrition mode are good inline controls because they are reversible and low-risk. Preserve that immediacy and avoid turning them into modal detours. Effort: 0.5-1 day.
4. **Separate danger into one block.** Sign-out, reset, and delete should live together at the bottom with consistent warning language. That reduces accidental taps and makes the page easier to trust. Effort: 0.5 day.

### 🟡 Steal soon — medium impact, medium effort

1. **Unify the duplicated settings model.** Decide whether nutrition mode belongs in the hub or in profile preferences, then remove the duplicate path. A single source of truth will reduce user confusion and backend drift. Effort: 1-2 days.
2. **Make subpages stateful, not illustrative.** Replace the static `ThemeScreen`, `LanguageScreen`, `PrivacyScreen`, and `DataExport` implementations with pages that reflect actual saved state and real outcomes. That is where the hub will stop feeling like a scaffold. Effort: 2-4 days.
3. **Normalize route destinations.** The current settings area points to both `/Export` and `/settings/export`, which is inconsistent and makes the control plane feel unfinished. Pick one destination pattern and use it everywhere. Effort: 0.5-1 day.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Collapse the hub into a more iOS-like settings tree.** This would improve hierarchy, but it is a product decision because Atlas is not a system utility. The right answer is probably a hybrid: calm hub, deeper pages for real tasks. Effort: 3-5 days.
2. **Turn privacy/export into a true compliance surface.** This would add a lot of trust, but it needs backend work and clear policy decisions. Do it only if the product is ready to support actual privacy controls, not placeholder language. Effort: 3-7 days.

---

## Atlas-specific design tensions to resolve

**Tension 1 — One hub vs scattered preferences.**
The app already spreads settings across `Settings`, `Account`, `ProfileEdit`, and separate subpages. That fragmentation makes each piece easier to build, but it also forces users to remember where a setting lives. *Resolution:* keep `Settings` as the single landing page for account-level decisions, and move only truly deep or risky actions into nested pages.

**Tension 2 — Immediate changes vs explicit save.**
Theme and language are currently instant; nutrition mode writes directly to `profiles`; other pages look like they should save but do not. That inconsistency creates uncertainty about whether a tap changed anything. *Resolution:* use immediate application for low-risk global preferences, but require explicit save and status feedback for anything that touches persisted profile data.

**Tension 3 — Calm premium tone vs operational seriousness.**
Atlas wants to feel sophisticated, not bureaucratic, but settings is where billing, privacy, and deletion live. If the page gets too decorative, users will miss critical actions; if it gets too system-like, the product loses its premium edge. *Resolution:* keep the visual language calm and premium, but make the data, support, and danger sections slightly more explicit and utility-first than the rest of the app.

**Tension 4 — Honest current state vs aspirational roadmap.**
Several linked settings pages appear more like prototypes than finished product. That is acceptable during build-out, but not acceptable once users are asked to trust those flows with account data. *Resolution:* either wire the page fully or demote the placeholder pages behind the hub until they are real.

---

## Specific changes to make (actionable list)

1. **Replace fallback-prone section copy with explicit settings text.** Update `src/pages/Settings.jsx` and the translation bundles so the hub does not rely on generated labels for section headings or subtitles. Effort: 0.5-1 day. Dependency: none.
2. **Make the settings hub the canonical entry point.** Keep `Settings` in the global nav, profile page, and account page, but make each entry land on the same coherent top-level summary. Files: `src/components/layout/AppLayout.jsx`, `src/pages/Profile.jsx`, `src/pages/Account.jsx`, `src/pages/Settings.jsx`. Effort: 1 day. Dependency: none.
3. **Choose one home for nutrition mode.** Either keep it in `Settings.jsx` or move it into `PreferencesTab.jsx`, then remove the duplicate path. Files: `src/pages/Settings.jsx`, `src/components/profile/PreferencesTab.jsx`, `src/pages/ProfileEdit.jsx`. Effort: 1-2 days. Dependency: product decision.
4. **Fix notification settings wiring.** Resolve the undefined `scheduleReminders` call and connect the reminder UI to a real persisted config. Files: `src/pages/NotificationSettings.jsx`, reminder service modules. Effort: 1-2 days. Dependency: none.
5. **Turn privacy into a real screen or remove the link.** The current privacy page is static copy and toggles without state persistence, so it should either be wired to real controls or hidden until it is. Files: `src/pages/PrivacyScreen.jsx`, `src/pages/Settings.jsx`, `src/App.jsx`. Effort: 2-4 days. Dependency: backend/policy decision.
6. **Replace export placeholder behavior with an actual export job flow.** Show queued state, delivery status, and a real download action instead of a simulated timeout. Files: `src/pages/DataExport.jsx`, export backend/service. Effort: 2-3 days. Dependency: backend support.
7. **Unify route casing and destinations.** Remove the split between `/Export` and `/settings/export` so users do not get two versions of the same action. Files: `src/pages/Settings.jsx`, `src/App.jsx`, `src/lib/routes.js`. Effort: 0.5-1 day. Dependency: none.
8. **Refine the account summary row.** Make plan, renewal, and billing actions easier to scan, and keep the customer-portal button only when a plan is active. Files: `src/pages/Settings.jsx`, `src/hooks/useCustomerPortal.js`. Effort: 1 day. Dependency: none.
9. **Collapse or rename the stub pages.** If `ThemeScreen.jsx`, `LanguageScreen.jsx`, and `DeleteAccount.jsx` are meant to be the real destinations, make them reflect the live app state; if not, route users away from them. Files: `src/pages/ThemeScreen.jsx`, `src/pages/LanguageScreen.jsx`, `src/pages/DeleteAccount.jsx`, `src/pages/Settings.jsx`. Effort: 2-4 days. Dependency: product decision.
10. **Add explicit empty/error states around settings data fetches.** If profile or subscription data fails to load, show a clear state in the hub rather than silently falling back to generic values. Files: `src/pages/Settings.jsx`, `src/lib/AuthContext.jsx`, `src/lib/SubscriptionContext.jsx`. Effort: 0.5-1 day. Dependency: none.

Total effort: roughly 10-20 days, depending on how much backend work is needed for privacy and export. The biggest quality jumps come from fixing the translation fallback risk, removing duplicated settings paths, and turning the placeholder subpages into real stateful flows.

---

## What NOT to do

1. Do **not** turn the settings hub into a giant scroll of every preference in the product.
2. Do **not** keep duplicate controls for the same setting in both `Settings` and `ProfileEdit`.
3. Do **not** leave static placeholder pages linked from a serious account surface.
4. Do **not** bury deletion, reset, or sign-out beside benign cosmetic preferences.
5. Do **not** copy iOS Settings so literally that Atlas loses its own tone and product language.

---

## The single highest-leverage thing

Make `Settings` the one truthful, compact control plane for Atlas. Right now it has the right skeleton, but too many of the destinations are split, duplicated, or still illustrative. If the team only does one thing, it should be to make every row in this hub either a real inline preference with persisted state or a real nested destination with actual behavior, then remove the duplicate and placeholder paths that weaken trust.

**File status:** Draft 1. To be revised after implementation against reality.
