# Teardown 26 — Integrations

**Surface:** Account and settings area for discovering, connecting, checking status, and managing external health integrations, centered on Apple Health / HealthKit.
**Atlas file(s):** `src/pages/Integrations.jsx`, `src/pages/ConnectedServices.jsx`, `src/hooks/useHealthKit.js`, `src/services/healthKitService.js`, `src/components/profile/PreferencesTab.jsx`
**Reference apps:** Notion (primary), Raycast (secondary)
**Audience tension:** High — serious users expect precise sync/permission state, while general users need a simple, low-friction explanation of what is actually connected.

---

## Why this screen matters

Integrations is where Atlas decides whether it feels like a trustworthy health hub or a wishlist of future features. This is the place users look to understand what data Atlas can actually read, what permissions have been granted, and how to get back in control if sync breaks. If that trust is fuzzy, the rest of the app inherits the doubt.

The revenue and retention risk is real because this surface sits directly behind the promise of the product: passive health data makes every downstream insight, workout, measurement, and coach recommendation better. If the integration story is broken, users do not just lose one feature. They lose confidence in the whole data model, which is much harder to recover than a styling issue or a slow screen.

World-class here means one honest place that shows what works today, what is available on this device, what permission was granted, when data last synced, and what is still roadmap-only. The best version should feel calmer than a settings dump and more dependable than a marketing page.

---

## Reference app 1 — Notion (primary)

Notion is the right primary reference because it treats integrations as a settings system, not a promo page. Its Help Center pages around [Connections](https://www.notion.com/help/embed-and-connect-other-apps) and [Add & manage integrations](https://www.notion.com/help/add-and-manage-connections-with-the-api) show discovery, auth, multi-account handling, and removal in one place. That maps well to Atlas, where the user is managing trust and access, not shopping for apps.

### What Notion does that works

1. **One canonical home.** Notion puts connected apps under `Settings -> Connections`, giving users one obvious place to return when they need to inspect or change something.

2. **Connected and available together.** The same area shows apps already authenticated and apps not yet connected, so users do not have to hunt for a separate discovery page.

3. **Per-app actions are explicit.** The action set is clear: connect, connect another account, or disconnect.

4. **Multi-account is a first-class state.** When relevant, Notion shows multiple accounts under the same app instead of pretending every integration is single-account only.

5. **Workspace vs individual separation.** Notion separates personal connections from workspace policy, which keeps login state and admin controls from getting mixed together.

6. **Approval and restriction are visible.** The lesson for Atlas is not to copy enterprise detail, but to make permission state visible whenever access is gated by platform rules.

7. **Removal is easy to find.** Users can clearly see how to disconnect, which lowers anxiety around sensitive access.

### What Notion does that you shouldn't copy

1. **Do not copy the enterprise surface area.** Notion has workspace owner controls, approved lists, webhook toggles, and policy states that only make sense in a large organization. Atlas is a consumer health product, so that much admin structure would be dead weight.

2. **Do not mimic a broad app-directory feel.** Notion can safely expose a large gallery of integrations because most of them are genuinely real and differentiated. Atlas does not have that depth yet, so a gallery treatment would read like overclaiming.

3. **Do not over-index on account-count complexity.** Notion’s “connect another account” model is useful for its use case, but Atlas does not currently have verified multi-account integration logic. Showing that pattern before the backend supports it would create false expectations.

---

## Reference app 2 — Raycast (secondary)

Raycast is useful as a secondary reference because it makes integration work feel fast, native, and command-oriented. Its [store](https://www.raycast.com/store/extensions/78) and [extension philosophy](https://www.raycast.com/blog/how-raycast-api-extensions-work) emphasize discoverability, compact actions, and the sense that a tool belongs inside the product rather than floating beside it.

### What Raycast does that works

1. **Action-first framing.** Raycast surfaces integrations as commands with clear verbs, so users immediately know what they can do.

2. **Fast visual scanning.** Short labels, visible install state, and concise supporting text let users decide in a glance whether something is set up.

3. **Native-feeling detail views.** Integration controls should stay inside normal settings language, not feel like a web view bolted on top.

4. **Requirements are explicit.** Prerequisites and platform limits should be clear before the user starts.

5. **Quick return path.** The route back to integration management should be obvious from settings and profile.

### What Raycast does that you shouldn't copy

1. **Do not make this keyboard-first.** Raycast can rely on a command palette because that is its core interaction model. Atlas needs visible, touch-friendly settings because users will look for integrations in a conventional account area.

2. **Do not turn integrations into extensions.** Raycast’s extension ecosystem is a platform. Atlas’s current integration surface is not; it is a small set of platform-specific sync controls, so the UI should stay much simpler.

---

## What Atlas does today (current state)

- **Layout and navigation structure:** Atlas has two separate surfaces: `/integrations` and `/connected-services`, both with back navigation. The profile area also shows an inline Apple Health card that points elsewhere instead of managing anything.

- **Key interactions:** Apple Health is the only real integration. On iOS, users can connect, sync now, and disconnect; connect requests HealthKit authorization, disconnect clears local state, and sync imports the last 30 days plus today's activity summary.

- **Visual approach:** `Integrations.jsx` is a static list with an intro card, icon rows, status text, and “Coming 2026” chips. `ConnectedServices.jsx` is more functional: Apple Health icon, status line, data-type list, stats grid, and action buttons. The inline preferences card is informational only.

- **Known issues from code reading:** `Integrations.jsx` hardcodes Apple Health as connected and every other integration as coming soon, with no actions. It also hides Apple Health on Android but still shows a generic Health Connect message. `useHealthKit.js` persists connection state in localStorage, so the UI can drift from real permission state. `ConnectedServices.jsx` makes disconnect look final even though it only clears local app state. `PreferencesTab.jsx` is a noninteractive placeholder.

- **Gaps relative to the reference app:** Atlas does not yet have one canonical settings home, a real per-integration status model, an account list, a connect-another-account pattern, or a clear split between live integrations and roadmap items. Compared with Notion, it is missing the connections system; compared with Raycast, it is missing fast, action-oriented discovery.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **One canonical integration center** — Collapse the split between `/integrations` and `/connected-services` into one screen that says what is connected, what is available on this device, and what is coming later. `src/pages/Integrations.jsx`, `src/pages/ConnectedServices.jsx` can be unified or one can redirect. Effort: 1-2 days.

2. **Permission-aware status row** — Show a real state machine for Apple Health: available, permission needed, connected, last synced, and disconnected. `src/hooks/useHealthKit.js`, `src/pages/ConnectedServices.jsx`. Effort: 1 day.

3. **Truthful roadmap separation** — Move Garmin, Strava, Fitbit, WHOOP, and MyFitnessPal into a clearly labeled future section instead of mixing them with live connection rows. `src/pages/Integrations.jsx`. Effort: 2-4 hours.

4. **Restore-path clarity** — Add a short explanation of what disconnect does and does not do, including that iOS permission revocation still happens in Apple Health settings. `src/pages/ConnectedServices.jsx`, `src/hooks/useHealthKit.js`. Effort: 2-3 hours.

### 🟡 Steal soon — medium impact, medium effort

1. **Discovery from settings** — Add an actual link from `Settings` or `Account` into the integrations manager so users do not have to know the route name. `src/pages/Settings.jsx`, `src/pages/Account.jsx`, `src/lib/routes.js`. Effort: 0.5-1 day.

2. **Inline health card with live state** — Replace the fake Apple Health card in `PreferencesTab.jsx` with a real status summary and a deep link to management. `src/components/profile/PreferencesTab.jsx`. Effort: 0.5-1 day.

3. **Android-specific honesty state** — On Android, show a purposeful empty state for Health Connect instead of a generic coming-soon banner. `src/pages/Integrations.jsx`, `src/pages/ConnectedServices.jsx`. Effort: 4-6 hours.

4. **Sync timestamp and scope** — Surface the last sync time and the specific data categories Apple Health can read/write in the same place. `src/pages/ConnectedServices.jsx`, `src/services/healthKitService.js`. Effort: 0.5-1 day.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Real multi-integration backend** — Only build Garmin, Strava, Fitbit, WHOOP, or MyFitnessPal if there is a backend integration plan behind them. Without that, the list becomes UI fiction. `src/pages/Integrations.jsx`, plus new services. Effort: days to weeks.

2. **System-level permissions management** — A richer permission dashboard could show granular HealthKit scopes and platform-level revoke instructions. `src/hooks/useHealthKit.js`, `src/services/healthKitService.js`. Effort: 1-2 weeks.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Honest current state vs aspirational catalog.**
Atlas wants to look like a serious platform, which tempts the UI toward a long list of integrations. But only Apple Health is actually wired. *Resolution:* keep the live integration separate from the roadmap and make the roadmap obviously nonfunctional until the backend exists.

**Tension 2 — Simple for general users vs useful for power users.**
General users just want to know if Apple Health is on, while advanced users want permission scope, data types, and sync timestamps. *Resolution:* default to a simple one-card summary, then reveal technical details after connection.

**Tension 3 — Settings page vs operational dashboard.**
If this becomes too abstract, it feels like a policy page; if it becomes too dense, it feels like a developer console. *Resolution:* use a settings-first layout with one high-signal card per real integration and keep diagnostics tucked into secondary text.

**Tension 4 — Apple’s system permissions vs Atlas-owned state.**
The current hook treats localStorage as connection truth, but Apple Health permission is owned by the OS. That can create stale UI if Atlas says “connected” after the user changes permissions elsewhere. *Resolution:* treat local state as a cache, not the source of truth.

---

## Specific changes to make (actionable list)

1. **Consolidate the two integration routes into one management experience.** File(s) to touch: `src/pages/Integrations.jsx`, `src/pages/ConnectedServices.jsx`, `src/App.jsx`. Effort: 1-2 days. Dependency: none.

2. **Replace static integration tiles with a live Apple Health card and a roadmap section.** File(s) to touch: `src/pages/Integrations.jsx`. Effort: 4-6 hours. Dependency: task 1.

3. **Expose actual connection state from `useHealthKit` instead of relying on localStorage alone.** File(s) to touch: `src/hooks/useHealthKit.js`, `src/services/healthKitService.js`. Effort: 1 day. Dependency: none.

4. **Add explicit last-sync and permission-copy states to the Apple Health card.** File(s) to touch: `src/pages/ConnectedServices.jsx`. Effort: 4-6 hours. Dependency: task 3.

5. **Make disconnect copy clear that Atlas is clearing app state, not revoking the OS permission.** File(s) to touch: `src/pages/ConnectedServices.jsx`, `src/hooks/useHealthKit.js`. Effort: 2-3 hours. Dependency: task 3.

6. **Remove or relabel misleading “Connected” status on the static integrations list.** File(s) to touch: `src/pages/Integrations.jsx`. Effort: 1-2 hours. Dependency: task 2.

7. **Replace the placeholder Apple Health card in preferences with a live summary link.** File(s) to touch: `src/components/profile/PreferencesTab.jsx`. Effort: 0.5 day. Dependency: task 1.

8. **Add a settings/profile entry point so users can find integrations without memorizing a route.** File(s) to touch: `src/pages/Settings.jsx`, `src/pages/Account.jsx`, `src/lib/routes.js`. Effort: 0.5 day. Dependency: task 1.

9. **Gate Apple Health messaging cleanly by platform and show a purposeful Android empty state.** File(s) to touch: `src/pages/Integrations.jsx`, `src/pages/ConnectedServices.jsx`. Effort: 4-6 hours. Dependency: task 2.

10. **Add tests or story coverage for iOS connected, iOS disconnected, and Android hidden states.** File(s) to touch: integration/page test files around `src/pages/Integrations.jsx` and `src/pages/ConnectedServices.jsx`. Effort: 1 day. Dependency: tasks 2 and 9.

Total effort: roughly 4-6 days for the honest version, or 2-3 weeks if the team builds real additional integrations.

Biggest quality jump: tasks 1, 2, 3, and 7.

---

## What NOT to do

1. Do **not** show Garmin, Strava, Fitbit, WHOOP, and MyFitnessPal as if they are real integrations when only Apple Health is wired.

2. Do **not** bury permission state behind generic “Connected” copy; users need to know whether Atlas has access right now, not whether a local flag was set once.

3. Do **not** turn this into a marketing gallery of future logos; that would make a settings surface feel like an announcement page.

4. Do **not** make disconnect imply revoking Apple Health permissions, because Atlas does not control the OS-level revoke flow.

5. Do **not** rely on the profile inline card as a substitute for real management; it should point to the authoritative surface, not compete with it.

6. Do **not** overbuild enterprise-style approval and policy controls before the app has more than one verified integration.

---

## The single highest-leverage thing

Build one honest integration center that treats Apple Health as the only live integration, shows its true permission and sync state, and moves every other provider into a clearly labeled roadmap area. That one change would fix discovery, reduce duplicate UI, remove the “fake connected” problem, and make the rest of Atlas feel more credible because the app would finally tell the truth about what is connected and what is not.

**File status:** Draft 1. To be revised after implementation against reality.
