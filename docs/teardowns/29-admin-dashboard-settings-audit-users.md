# Teardown 29 — Admin (dashboard + settings + audit + users)

**Surface:** Internal admin control plane for dashboard health, user management, audit review, and lightweight platform settings.
**Atlas file(s):** [src/components/admin/AdminLayout.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/admin/AdminLayout.jsx), [src/pages/admin/AdminOverview.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminOverview.jsx), [src/pages/admin/AdminUsers.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminUsers.jsx), [src/pages/admin/AdminUserProfile.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminUserProfile.jsx), [src/pages/admin/AdminLogs.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminLogs.jsx), [src/pages/admin/AdminSettings.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminSettings.jsx), [src/pages/admin/AdminRoles.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminRoles.jsx), [src/pages/admin/AdminAuditLog.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminAuditLog.jsx) (unrouted duplicate), [src/lib/adminService.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/adminService.js), [src/App.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/App.jsx)
**Reference apps:** Linear (primary)
**Audience tension:** High — this surface is for internal operators, but the data it changes controls access, billing, onboarding state, and user trust.

---

## Why this screen matters

Admin is the control plane that keeps Atlas usable when something goes wrong: entitlement mistakes, suspended accounts, onboarding resets, support escalations, and audit questions all end up here. If the surface is fast and legible, support and ops can fix problems without guessing.

The revenue and retention impact is indirect but real. Good admin tooling shortens response time, reduces the chance of wrong access changes, and makes billing/admin actions safer. Broken admin tooling looks like stale counts, missing records, duplicate audit trails, and operators who do not trust the tools enough to use them.

---

## Reference app 1 — Linear (primary)

Linear is the right reference because it treats admin surfaces as serious internal software, not as a generic dashboard dump. Its docs for [Members & roles](https://linear.app/docs/members-roles) and [Audit log](https://linear.app/docs/audit-log) are especially relevant: they show a hierarchy that supports scanning, role-based action, and traceability without hiding the important stuff.

### What Linear does that works

1. **Clear admin hierarchy.** Linear puts workspace administration under a predictable Settings > Administration path. Atlas needs the same kind of structure because this shell is already broad enough to feel fragmented if the nav is flat.
2. **List-first member management.** The Members page is row-based and built for scanning users, statuses, and permissions. That is the right model for Atlas because the common task is finding one account and changing one thing safely.
3. **Role and status filtering.** Linear explicitly supports filtering members by role or status. That lowers scan cost and is exactly what Atlas needs for active, suspended, invited, or privileged users.
4. **First-class audit trail.** Linear’s audit log is a dedicated history with event types and actor context. That is the right mental model for Atlas because admin actions should remain legible after the fact.
5. **Minimal detail views.** Linear keeps the primary object in view and exposes only the controls that belong to it. Atlas’s user 360 should do the same: summary first, then targeted tabs, then explicit actions.

### What Linear does that you shouldn't copy

1. **Do not copy power-user opacity.** Atlas admins may be support or operations staff who need obvious labels, not only shortcuts and hidden affordances.
2. **Do not copy enterprise gating language.** Linear’s admin model is tied to workspace plans; Atlas’s surface is an internal control panel, so the language should be operational, not promotional.

---

## What Atlas does today (current state)

- The admin shell lives behind `/AdminPanel`, is web-only, and is gated by `RouteGuard roles={['admin']}` in [src/App.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/App.jsx). [AdminLayout.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/admin/AdminLayout.jsx) provides grouped navigation plus App and Logout actions.
- [AdminOverview.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminOverview.jsx) is a KPI dashboard with signups, users, subscriptions, onboarding, trial-to-paid, AI, errors, support, expiring trials, and a hardcoded “Operational” card.
- [AdminUsers.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminUsers.jsx) is the main user list. It paginates 50 profiles, filters by active/suspended/admin/trial/paid, does client-side search over up to 500 profiles, and exposes impersonation, grant, reset, and delete actions.
- [AdminUserProfile.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminUserProfile.jsx) is the per-user 360 with summary, profile, workouts, nutrition, check-ins, measurements, photos, AI, timeline, and audit tabs, plus quick actions for impersonate, grant/revoke premium, reset onboarding, suspend/unsuspend, and add note.
- [AdminLogs.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminLogs.jsx) is the live logs area with Errors, Audit Log, and Support tabs. [AdminAuditLog.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminAuditLog.jsx) exists separately but is not routed, so audit is split across entry points.
- [AdminSettings.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminSettings.jsx) only shows profiles/subscriptions counts and a cache-clear button that depends on `window.__queryClient`.
- [AdminRoles.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminRoles.jsx) is a simple role editor with a search field and dropdown.
- [src/lib/adminService.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/adminService.js) powers the surface with direct Supabase reads/writes for users, subscriptions, grants, suspensions, onboarding resets, audit logging, metrics, and timelines.
- The visual language is functional but inconsistent across files: `surface`, `atlas-card`, custom rounded cards, tables, badges, and small caption text all coexist.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Grouped admin navigation.** Keep the sidebar grouped into Core, Operations, and Settings, but tighten the visual rhythm so those groups read as one system. Effort: 4-8 hours.
2. **Row-level overflow actions.** Scan rows first, open the menu only when needed, and keep destructive actions behind deliberate clicks. Effort: 1 day.
3. **Audit-as-history.** Treat admin audit as a chronological record with actor, target, action, and time in one line. Effort: 1 day.

### 🟡 Steal soon — medium impact, medium effort

1. **State filters as chips.** Borrow Linear’s role/status filtering mentality and make the user list and audit log filterable by the most common states first. Effort: 1-2 days.
2. **Explicit consequence text.** For suspend, revoke, and delete, spell out what changes and what does not. Effort: 4-8 hours.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Full keyboard-driven admin workflows.** Atlas should not copy Linear’s shortcut depth wholesale unless the team commits to teaching and supporting it. Effort: 2-4 days plus adoption work.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Speed vs safety.** Admins need to move fast when users are stuck, but this surface also controls access, billing, and deletion. *Resolution:* keep the UI fast to navigate, but make every destructive action explicit and confirmation-gated.

**Tension 2 — One system vs many pages.** Dashboard, users, audit, roles, and settings still read like separate mini-tools. *Resolution:* make Users the hub, Logs the trust layer, and Settings intentionally small.

**Tension 3 — Power-user detail vs operational clarity.** Raw data is useful, but too much raw data turns admin work into archaeology. *Resolution:* show a narrow set of canonical fields and push the rest into tabs, rows, or the user 360 timeline.

---

## Specific changes to make (actionable list)

1. Make `/AdminPanel/logs` the canonical audit entry point and either route or delete [AdminAuditLog.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminAuditLog.jsx). File(s) to touch: [src/components/admin/AdminLayout.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/admin/AdminLayout.jsx), [src/App.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/App.jsx), [src/pages/admin/AdminAuditLog.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminAuditLog.jsx). Effort: 0.5 day. Dependency: none.
2. Replace the hardcoded “Operational” KPI with either real health data or a plain label that does not pretend to be live. File(s) to touch: [src/pages/admin/AdminOverview.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminOverview.jsx), [src/lib/adminService.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/adminService.js). Effort: 0.5-1 day. Dependency: none.
3. Move user search to server-side search so the admin list does not silently miss users beyond the first 500 profiles. File(s) to touch: [src/lib/adminService.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/adminService.js), [src/pages/admin/AdminUsers.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminUsers.jsx). Effort: 1-2 days. Dependency: none.
4. Fix audit rendering so it matches the action types emitted by `adminService`, and add filters for action type and target user. File(s) to touch: [src/pages/admin/AdminLogs.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminLogs.jsx), [src/pages/admin/AdminAuditLog.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminAuditLog.jsx), [src/pages/admin/AdminUserProfile.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminUserProfile.jsx), [src/lib/adminService.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/adminService.js). Effort: 1 day. Dependency: 1.
5. Make Settings a real operations page by either wiring the unfinished maintenance state or removing the dead state entirely. File(s) to touch: [src/pages/admin/AdminSettings.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminSettings.jsx), [src/lib/adminService.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/adminService.js). Effort: 0.5-1 day. Dependency: none.
6. Extract shared admin page chrome so dashboard, users, logs, settings, and roles use the same header, spacing, card, and table primitives. File(s) to touch: [src/pages/admin/AdminOverview.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminOverview.jsx), [src/pages/admin/AdminUsers.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminUsers.jsx), [src/pages/admin/AdminUserProfile.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminUserProfile.jsx), [src/pages/admin/AdminLogs.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminLogs.jsx), [src/pages/admin/AdminSettings.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminSettings.jsx), [src/pages/admin/AdminRoles.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminRoles.jsx). Effort: 2-3 days. Dependency: none.
7. Separate destructive actions visually from routine actions on both the users list and user 360 page. File(s) to touch: [src/pages/admin/AdminUsers.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminUsers.jsx), [src/pages/admin/AdminUserProfile.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminUserProfile.jsx). Effort: 0.5-1 day. Dependency: 6.
8. Turn roles into an explainable permission surface instead of a plain dropdown list. File(s) to touch: [src/pages/admin/AdminRoles.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminRoles.jsx), [src/pages/admin/AdminUserProfile.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/admin/AdminUserProfile.jsx), [src/components/admin/AdminLayout.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/admin/AdminLayout.jsx). Effort: 0.5-1 day. Dependency: 6.

Total effort: roughly 8-12 days. The biggest perceived-quality jump will come from tasks 4, 6, 8, and 1 because they fix discoverability, trust, and system coherence at the same time.

---

## What NOT to do

1. Do **not** turn the admin surface into a raw data dump of tables and JSON blobs that only the original author can parse.
2. Do **not** copy Linear’s power-user density without making the same actions obvious to less technical operators.
3. Do **not** make destructive actions look like ordinary navigation or routine edits.
4. Do **not** leave duplicate admin surfaces alive when only one of them is actually routed and maintained.
5. Do **not** use charts or KPI tiles to hide the absence of real operational controls in Settings.

---

## The single highest-leverage thing

Unify the user 360 and the audit trail into one trustworthy admin workflow. If an operator can land on a user, understand their status in seconds, make a controlled change, and immediately verify that the change is recorded, the entire admin surface gets better even if the rest of the UI stays modest. That is the strongest leverage point because it improves support speed, reduces mistakes, and makes the system feel accountable.

---

**File status:** Draft 1. To be revised after implementation against reality.
