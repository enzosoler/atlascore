# atlas.core Admin Panel — Implementation Plan

_Merged from Claude Opus 4.6 codebase exploration + GPT 5.5 architectural plan. April 2026._

---

## 1. Inventory

### 1.1 Existing admin components

| Path | State | Reuse? |
|---|---|---|
| `src/components/admin/AdminLayout.jsx` | Legacy layout, checks `user.atlas_role === 'admin'`, queries `user_permissions`, sidebar with Overview/Users/Analytics/AI/Waitlist/Logs/Subscriptions/Influencers/Roles/Invites/Config | Salvage nav ideas only |
| `src/components/admin/AdminLayoutV2.jsx` | Premium v2 shell: collapsible sidebar, global search (Cmd+K), system health indicator, status bar (latency/region), Lucide icons, Outlet for nested routes | Best layout base — restyle to paper/ink/sulfur |
| `src/components/admin/SubscriptionManager.jsx` | Grant plans, delete subscriptions, entitlement overrides. Uses `adminService.grantAccess()` | Keep UX shape, move writes to edge functions |
| `src/components/admin/ImpersonationBanner.jsx` | Amber banner, elapsed timer, 60-min auto-exit | Reuse — change TTL to 30 min |
| `src/components/admin/AdminSparkline.jsx` | Recharts mini line chart (120×8px) | Reuse for KPI cards |
| `src/components/admin/AdminFunnelBar.jsx` | Horizontal bar with conversion/dropoff % | Reuse for onboarding funnel |

### 1.2 RBAC system

| Path | What it does |
|---|---|
| `src/lib/rbac.js` | 7 client roles (visitor, athlete, coach, nutritionist, clinician, admin, beta_tester). `PAGE_ACCESS.AdminPanel = ['admin']`. `canAccess(role, page)`, `getNavForRole(role)`, `useRBAC(user)` hook |
| `src/components/rbac/RouteGuard.jsx` | Guards routes by `page` or `roles[]`. Falls back to redirect or 403. Beta tester exception logic |
| `src/hooks/useRoleAndSubscription.js` | Fetches `profiles.role` + active subscription. `isAdmin(role)` checks `role === 'admin'` |

### 1.3 Admin service (`src/lib/adminService.js` — 42+ functions)

**User management:** fetchAllUsers, searchUsers, fetchUserFull, updateUserRole, suspendUser, unsuspendUser, resetOnboarding, deleteUser

**Subscriptions:** fetchAllSubscriptions, updateSubscriptionTier, updateSubscriptionStatus, extendTrial, grantAccess (sends email), revokeAccess, resyncBillingStatus (throws — not implemented)

**Metrics:** getAdminMetrics, getEnhancedAdminMetrics (signups, onboarding rate, trial conversion, AI messages, errors, pending support), fetchRecentSignups, fetchRecentErrors, fetchSignupSparkline

**Analytics:** fetchFunnelData (7-step: Registered → Onboarding → First Workout → Beta → Trial → Paid)

**User 360:** fetchUserWorkouts, fetchUserFoodLogs, fetchUserCheckins, fetchUserMeasurements, fetchUserPhotos, fetchUserAIData, fetchUserAuditLogs, fetchUserErrors, addAdminNote, fetchUserTimeline (chronological event stream)

**Beta:** fetchBetaInvites, sendBetaInvite, revokeBetaInvite, resendBetaInvite

**Audit:** logAdminAction, fetchAuditLogs

### 1.4 Edge functions (service_role)

| Function | Auth | What it does |
|---|---|---|
| `admin-delete-user` | JWT + `profiles.role = 'admin'` | Verifies admin, refuses self-delete/admin-delete, calls `auth.admin.deleteUser` (cascades), logs audit |
| `admin-users` | JWT + `has_permission()` RPC | 6 routes: list, detail, suspend, unsuspend, revoke-sessions, reset-onboarding, add notes |
| `admin-audit` | JWT + `has_permission('view_audit_logs')` | Query audit logs with filters + stats RPC |
| `self-delete-user` | JWT (any user) | Cancel Stripe, delete storage (`progress-photos` + `lab-exams`), wipe 30 tables, delete auth.users |
| `moderation` | JWT + `has_permission()` | Queue, photo detail, take action, list cases, assign case |
| `create-checkout` | JWT | Resolve Stripe price ID, create checkout session with 7-day trial |
| `complete-checkout` | JWT | Post-checkout subscription upsert |
| `stripe-webhook` | Stripe signature | subscription.created/updated/deleted, charge.refunded → subscriptions table |
| `revenuecat-webhook` | Bearer token | Purchase/renewal/expiration/refund → subscriptions table |
| `create-customer-portal` | JWT | Stripe billing portal URL |
| `send-email` / `send-email-v2` | Admin/service role | 12 templates: welcome, confirm, reset, trial_started/ending/expired, payment_success/failed, inactivity, weekly_report, milestone |
| `send-beta-invite` | Admin | Beta invite email |
| `redeem-invite` | JWT | Beta code redemption |
| Other 15 functions | Various | AI coach, food vision, workout logging, auth webhook, push notifications, share workout, terms acceptance |

### 1.5 Admin scripts

| Script | What it does |
|---|---|
| `scripts/admin/grant_admin_simple.mjs` | Hardcoded: grants `profiles.role='admin'` to `inbox@enzosoler.com` via service role |
| `scripts/admin/sync_users.mjs` | Syncs all auth.users → profiles + creates default 7-day trial subscriptions |

### 1.6 Database schema (50+ tables)

#### Tables with user data (FK to auth.users)

| Table | FK column | ON DELETE | RLS | Admin note |
|---|---|---|---|---|
| `profiles` | `id` (PK) | CASCADE | Own read; admin via `is_admin()` | Role source. Privilege escalation trigger protects `role`, `is_admin`, entitlement keys |
| `subscriptions` | `user_id` | CASCADE | Own read; admin via `is_admin()` | `granted_by_admin` is SET NULL |
| `daily_checkins` | `user_id` | CASCADE | User manages own | Check-in/mood data |
| `measurements` | `user_id` | CASCADE | User CRUD own | Body measurements |
| `progress_photos` | `user_id` | CASCADE | User manages own; admin via `is_admin()` | Storage: `progress-photos/{user_id}/` |
| `lab_exams` | `user_id` | CASCADE | User CRUD own; admin via `is_admin()` | Storage: `lab-exams/{user_id}/` |
| `food_logs` | `user_id` | CASCADE | User manages own | Nutrition data |
| `workouts` / `workout_sessions` / `workout_sets` | `user_id` | CASCADE | User CRUD own | Training data |
| `routines` | `user_id` | CASCADE | User manages own | Workout programs |
| `protocols` / `protocol_logs` | `user_id` | CASCADE | User owns | Supplements/medications |
| `coach_messages` / `coach_memory` | `user_id` | CASCADE | User select/insert; admin later | AI coach data |
| `ai_conversations` / `user_ai_state` / `ai_recommendations` | `user_id` | CASCADE | User own | AI features |
| `ai_usage_quotas` / `ai_usage_log` | `user_id` | CASCADE | User own read; admin read all | AI cost tracking |
| `product_events` | `user_id` | CASCADE | User insert/read own | Analytics funnel |
| `error_logs` | `user_id` | SET NULL | Anyone insert; admin read | App errors |
| `support_requests` | `user_id` | SET NULL | Auth/anon insert; admin all | Support tickets |
| `email_events` | `user_id` | SET NULL | User own read; admin all | Email audit |
| `push_tokens` | `user_id` | CASCADE | User manages own | Notification delivery |
| `subscription_events` | `user_id` | CASCADE (via profiles) | User reads own | Webhook idempotency |
| `referrals` | `referrer_id`, `referred_id` | CASCADE | Referrer reads | Attribution |
| `terms_acceptances` | `user_id` | **Missing ON DELETE** | Owner/admin read | **FK repair needed** |
| `user_data_resets` | `user_id` | **Missing ON DELETE** | User read; service insert | **FK repair needed** |
| `beta_invites` | `invited_by`, `redeemed_by` | SET NULL | Admin/service manage | Invite codes |
| `professional_links` | `professional_id`, `client_id` | CASCADE; `invited_by` **missing** | Professional/client access | **FK repair needed** |

#### Admin/moderation tables (already exist)

| Table | Purpose | RLS |
|---|---|---|
| `admin_action_logs` | Full audit trail (actor, target, action, before/after JSONB, severity, IP, user_agent) | `view_audit_logs` permission |
| `roles` | 8 system roles (owner, super_admin, admin_ops, billing_admin, support_admin, moderator, senior_moderator, readonly_analytics) | All authenticated read; `manage_roles` write |
| `permissions` | 20 granular permissions | All authenticated read |
| `user_roles` | user↔role assignments (expires_at, revoked_at) | Admin read; super_admin write |
| `role_permissions` | role↔permission mappings | Admin read |
| `user_flags` | Per-user flags (banned, suspended, under_review) | Target+admin read; admin write |
| `internal_notes` | Staff notes on users (general/support/moderation/billing) | Admin read/write; author update |
| `moderation_cases` | Case tracking (status, priority, assigned_to) | Moderator permission |
| `moderation_actions` | Moderation decisions (keep/remove/warn/suspend/ban) | Moderator permission |
| `photos` | User photos with `moderation_status` field | Owner + moderator access |
| `photo_access_logs` | Audit staff access to sensitive photos | Moderator+admin read |
| `feature_flags` | System-wide toggles (key, enabled, rollout_percent) | All read; `manage_feature_flags` write |

#### System tables

| Table | Purpose |
|---|---|
| `ai_spending_config` | Global AI rate limits (kill_switch, monthly_cap, daily_cap, tier limits) |
| `stripe_webhook_events` | Stripe webhook idempotency |
| `influencer_commissions` | Affiliate tracking |
| `password_reset_rate_limits` | Brute-force prevention |
| `waitlist` | Pre-signup captures |
| `shared_workouts` | Public share links |

### 1.7 Design system tokens (`src/redesign/v3/lib/paper.jsx`)

- **Colors:** paper `#efe9da`, ink `#0a0a0a`, accent `#e8b500`, error `#c65b4b`
- **Fonts:** display (SF Pro Display), body (SF Pro Text), mono (SF Mono / JetBrains Mono), brand (Archivo Black)
- **Radii:** chip 8, button 12, input 14, card 18, sheet 24
- **Components:** ACLabel, ACMono, ACNum, ACBtn, ACChip, ACHeader, ACBrandMark, ACTabBar, ACLine, ACBars, ACRing, ACSpark
- **Theme hook:** `useACT(dark)` returns full palette (bg, fg, dim, mute, faint, hair, card, card2, accent)

### 1.8 Platform gate (`src/redesign/v3/lib/PlatformGate.jsx`)

- Native (Capacitor) → always passes
- localhost / 127.0.0.1 → always passes
- `import.meta.env.DEV` → passes
- `VITE_ENABLE_PLATFORM_GATE_BYPASS=true` + `?dev=1` or `localStorage.atlas.dev=1` → passes
- Public web → redirects to `/download-app` unless on `/webapp` prefix

**Admin implication:** Mount `/admin` routes outside `<PlatformGate>`. Admin is web-only, accessible on internal/staging/admin deployments with bypass enabled. Never enable bypass on the marketing domain.

### 1.9 App.jsx routing

- **No admin routes currently mounted.** All admin components are orphans.
- Pattern: lazy imports + `isAuthed` guard + `hasCompletedOnboarding` check
- Admin should mount after `/webapp` utility routes, before fullscreen `/app` routes
- Guard with `RouteGuard roles={['superadmin','admin','support','analyst']}`

### 1.10 Storage buckets

- `progress-photos` — private, user-scoped `{user_id}/` with RLS
- `lab-exams` — private, user-scoped `{user_id}/` with RLS

### 1.11 Billing

- **RevenueCat:** products `atlas_core_pro_weekly/monthly/yearly`, entitlement ID `'pro'`
- **Stripe:** `create-checkout` with PRICE_MAP (region × billing × plan), 7-day trial, promo codes
- **Flow:** RevenueCat/Stripe → webhook → `subscriptions` table → app reads tier+status

---

## 2. Scope

### A. User Management

**WHAT:** Searchable user list, user profile detail, manual create/invite, delete, suspend/unsuspend, force password reset, force email re-verification, admin role grants, entitlement grants.

**WHY:** Support and ops need one place to resolve access, billing, onboarding, and account-state issues without SQL console access.

**HOW:**
- Read users through admin edge functions using service-role queries against `profiles`, `subscriptions`, `product_events`, and auth admin metadata.
- Manual create/invite/password/reverify/suspend/delete go through edge functions using `auth.admin` API.
- Delete only runs after Phase 0 FK repair verifies every `auth.users` FK has appropriate ON DELETE.
- Suspension sets Supabase Auth `banned_until` and mirrors `profiles.is_suspended=true`.

**UX FLOW:**
- `/admin/users` — Paginated table: avatar, name, email, role badge, subscription badge, status indicator, last active. Search with debounced `ilike`. Filter chips: role, tier, status, date range. Sort by created_at, last_sign_in_at.
- `/admin/users/new` — Create user or send invite modal (email, role, optional plan grant).
- `/admin/users/:id` — Profile header with key actions, tabbed content (Overview, Data, Subscription, Audit, Notes). Action toolbar: Suspend/Unsuspend, Reset Onboarding, Revoke Sessions, Delete (type-email-to-confirm), Grant Plan, Change Role.
- All destructive actions require confirmation modal with reason field. Reason stored in audit.

**PERMISSIONS:**
- `superadmin` — all actions including admin grants and deleting non-admins
- `admin` — all user ops except granting admin/superadmin and deleting admins
- `support` — read user metadata, reset password, reverify email, comp short trials
- `analyst` — aggregate user list only, no PII detail

### B. Impersonation

**WHAT:** Two modes: VIEW-ONLY (read user data in admin context) and INTERACTIVE (act as user for debugging). Time-boxed (30 min), fully audited, banner overlay.

**WHY:** Support needs to see what a user sees. Interactive mode needed to reproduce bugs. Both must be audited and time-limited.

**HOW:**
- **Implementation:** Custom `admin_sessions` table with TTL. Safer than minting real user JWTs — supports auditability and time-boxing, enforces view-only/destructive restrictions centrally.
- Admin edge function starts/stops sessions after verifying actor role and target is not admin/superadmin.
- Client stores admin-session token separate from Supabase auth.
- View-only: admin context renders User 360 panels with target user's data. No auth context switch.
- Interactive: data-read edge functions accept admin-session token for target-scoped reads. Writes blocked by middleware unless explicitly enabled.
- Every session writes audit row (who, who-as, mode, started_at, ended_at, pages_visited, exit_reason).

**UX FLOW:**
- From user detail page: "View as user" (view-only) or "Impersonate" (interactive).
- Modal requires mode selection and reason text.
- Global amber banner: "Impersonating {email} — Stop" with elapsed timer.
- 30-min auto-expire. Cannot impersonate admins. Cannot perform destructive actions while impersonating.

**PERMISSIONS:**
- `superadmin` — view-only + interactive
- `admin` — view-only; interactive only if config-enabled
- `support` — view-only only
- `analyst` — no impersonation

### C. User Data Inspection (User 360)

**WHAT:** Single-user drilldown into workouts, nutrition, body, labs, coach, subscription, activity, notifications, files.

**WHY:** Support/debugging requires context across the whole self-optimization loop.

**HOW:**
- Reads through service-role-backed admin edge functions to avoid broad client RLS expansion.
- Signed URLs generated server-side for `progress-photos/{userId}/*` and `lab-exams/{userId}/*`.
- Support cannot see photos/labs by default (requires elevated permission).
- Activity combines `product_events`, `error_logs`, `email_events`, `subscription_events`, `admin_action_logs`.

**UX FLOW:**
- `/admin/users/:id` with tabs:
  - **Overview:** Profile card, subscription summary, flags, last activity, signup date, onboarding status
  - **Timeline:** Unified chronological feed (from `fetchUserTimeline`) with type icons and expand-to-detail
  - **Training:** Workout list with date, name, exercises, duration. Expandable rows showing sets/reps/weight
  - **Nutrition:** Daily summary cards. Expand to individual food_logs
  - **Body:** Measurements chart + progress photos grid (thumbnail + date). Photo viewing logs to `photo_access_logs`
  - **Labs:** Lab exam list with biomarker summaries. PDF viewer for source files
  - **Coach AI:** Message thread (read-only), coach memory summary
  - **Subscription:** Full event history, Stripe customer link, RevenueCat link, grant/revoke controls
  - **Activity:** Product events feed, error logs filtered to user
  - **Notifications:** Email events sent (opens, clicks), push token status
  - **Files:** Signed URL viewer for `progress-photos/{userId}/*` and `lab-exams/{userId}/*`
  - **Audit:** Admin actions targeting this user, filterable by type
  - **Notes:** Internal staff notes (type: general/support/moderation/billing). Add note form

**PERMISSIONS:**
- `superadmin`, `admin` — full inspection
- `support` — all non-sensitive data; no photos/lab files unless elevated
- `analyst` — aggregate only

### D. Subscription / Billing Ops

**WHAT:** Side-by-side Stripe + RevenueCat + Supabase entitlement state. Comp, cancel, refund, invoices, force-sync, grace override.

**WHY:** Billing issues span web Stripe, native RevenueCat, and local entitlement rows. Need unified view and control.

**HOW:**
- Billing edge functions wrap Stripe secret APIs and RevenueCat REST sync.
- Manual comps write `subscriptions.status='granted'` with `granted_by_admin` and `grant_reason`.
- Force sync replays latest Stripe/RC customer state into `subscriptions`.
- Refunds call Stripe refund API via new `admin-billing` edge function.

**UX FLOW:**
- `/admin/billing` — Overview: MRR card, active subs, trialing count, trials expiring in 7 days, churn rate. Subscription table with user email, tier, status, source (stripe/rc/manual), period dates.
- Click row → subscription detail: full event history, Stripe dashboard link, grant/revoke controls.
- "Grant plan" button → reuse SubscriptionManager dialog (plan, duration, reason).
- "Process refund" → requires `process_refunds` permission. Confirmation with reason.
- "Force sync" → reads from Stripe/RC APIs, updates Supabase.

**PERMISSIONS:**
- `superadmin` — all
- `admin` — cancel, force-sync, grace override, limited refunds
- `support` — short comps/trials only
- `analyst` — read metrics only

### E. Content Moderation

**WHAT:** Reported content queue, photo review, user warnings/suspensions/bans, bulk photo delete.

**WHY:** App Store compliance and user safety. Photo review needs audit trail.

**HOW:**
- Existing `moderation` edge function has all 5 routes (queue, photo detail, take action, list cases, assign).
- `photos` table has `moderation_status` field. `photo_access_logs` auto-logged on view.
- Signed URL moderation viewer with blur-by-default, click-to-reveal (logged).

**UX FLOW:**
- `/admin/moderation` — Queue dashboard: open cases, unassigned, my assignments. Priority badges.
- Queue list: blurred thumbnail, owner email, report reason, count, priority, assigned moderator.
- Click case → detail: photo (blur/reveal), report history, user summary, case timeline, action buttons (Keep, Remove, Hide, Warn, Suspend, Ban, Escalate).
- Each action requires reason text. Creates `moderation_actions` record.

**PERMISSIONS:**
- `superadmin`, `admin` — full
- `support` — queue triage only, no bulk delete
- `analyst` — none

### F. Bulk / Cohort Operations

**WHAT:** Filter users by attributes, export CSV, send bulk email, tag cohorts.

**WHY:** Growth ops, marketing, user research.

**HOW:**
- Server-side filtered query endpoint with CSV export.
- Email sends call shared `send-email` renderer.
- Future: `admin_cohorts` and `admin_cohort_members` tables when tagging is implemented.

**UX FLOW:**
- `/admin/cohorts` — Filter builder: role, tier, status, signup date range, last active, onboarding status.
- Preview: count + sample list (first 20).
- Actions: "Export CSV", "Send email" (template picker), "Apply tag".
- CSV columns: id, email, full_name, role, tier, status, created_at, last_sign_in_at.

**PERMISSIONS:**
- `superadmin`, `admin` — all
- `support` — export only if PII export permission enabled
- `analyst` — aggregate exports without email/PII

### G. Operational Health

**WHAT:** Error dashboard, webhook event status, AI cost tracking, feature flag management.

**WHY:** Ops visibility. Know when things break, what AI costs, toggle features without deploy.

**HOW:**
- `error_logs`, `stripe_webhook_events`, `ai_usage_log`, `ai_spending_config`, `feature_flags` tables.
- `getEnhancedAdminMetrics()` from adminService already aggregates key counts.

**UX FLOW:**
- `/admin/ops` — Dashboard cards: Errors today, AI messages today, pending support, webhook failures.
- **Errors tab:** Table of recent errors with stack trace expansion. Group by component/route.
- **Webhooks tab:** Recent `subscription_events` with status. Filter by source.
- **AI costs tab:** Daily/monthly counts. Cost estimates. Kill switch toggle.
- **Feature flags tab:** List all flags. Toggle enabled/disabled. Edit rollout %.

**PERMISSIONS:**
- `superadmin`, `admin` — full
- `support` — user-scoped errors only
- `analyst` — read dashboards

### H. Support Inbox

**WHAT:** View support_requests, reply, resolve, thread view.

**WHY:** Support requests exist but lack admin resolution surface.

**HOW:**
- Extend `support_requests` with `status`, `assigned_to`, `resolved_at`, `priority` columns.
- New `support_replies` table for threaded replies.
- Replies send email via `send-email` shared renderer and log to audit.

**UX FLOW:**
- `/admin/support` — Inbox sorted by created_at desc. Status/type badges, user email, message preview.
- Click ticket → detail: full message, user profile card (linked to User 360), reply form, internal notes, status controls.
- "Reply" sends email + appends to `support_replies`. "Resolve" updates status + logs audit.

**PERMISSIONS:**
- `superadmin`, `admin`, `support` — read/reply/resolve
- `analyst` — none

### I. Audit & Compliance

**WHAT:** Admin action log viewer, audit export, per-user GDPR export/delete, terms acceptance log.

**WHY:** Legal compliance (LGPD for Brazil, GDPR for EU). Must prove what admins did and fulfill data subject requests.

**HOW:**
- Standardize on `admin_audit_log` table. Migrate/alias from existing `admin_audit_logs` and `admin_action_logs`.
- `admin-audit` edge function already has filtered query + stats.
- GDPR delete reuses `self-delete-user` logic but admin-initiated and audit-logged.
- New `admin-gdpr-export` edge function generates JSON/ZIP of all user data.

**UX FLOW:**
- `/admin/audit` — Paginated audit log: timestamp, actor, action, target, severity, reason. Filters by actor/target/action/severity/date.
- "My actions" shortcut. Stats panel: actions/day chart, top actors.
- `/admin/compliance` — GDPR tools: "Export user data" (generates ZIP), "Delete user data" (admin-initiated with verification), "Terms log" (search by user for acceptance timestamps/versions).

**PERMISSIONS:**
- `superadmin` — all
- `admin` — audit read/export, user export/delete for non-admins
- `support` — limited audit related to assigned cases
- `analyst` — none

### J. Beta / Invites

**WHAT:** Beta invite codes, generate, view redemption, revoke, onboarding funnel.

**WHY:** Controlled rollout. Track invite conversion.

**HOW:**
- Existing `beta_invites` table, `send-beta-invite` and `redeem-invite` edge functions.
- Existing `fetchBetaInvites()`, `sendBetaInvite()`, `revokeBetaInvite()`, `resendBetaInvite()` from adminService.
- `fetchFunnelData()` for conversion funnel visualization.

**UX FLOW:**
- `/admin/invites` — List of invites with status badge, email, sent date, redeemed date. Actions: Resend, Revoke.
- "Send invite" → modal with email, first name, notes, locale.
- Funnel visualization using AdminFunnelBar: Registered → Onboarding → First Workout → Beta → Trial → Paid.
- Stats cards: total sent, redeemed rate, expired rate.

**PERMISSIONS:**
- `superadmin`, `admin` — all
- `support` — send/resend invites
- `analyst` — funnel read only

---

## 3. RBAC Design

### v1 approach: `profiles.role`

Standardize v1 admin RBAC on `profiles.role` with four roles:

| Role | Description |
|---|---|
| `superadmin` | Everything including granting admin to others, GDPR delete, interactive impersonation |
| `admin` | Most things; cannot grant admin/superadmin, delete other admins, or interactive-impersonate |
| `support` | Read-only across users + reply to support + comp short trials + view-only impersonation |
| `analyst` | Read-only metrics dashboards, no PII, no user-level detail |

### Permission matrix

| Area | superadmin | admin | support | analyst |
|---|:---:|:---:|:---:|:---:|
| A. User list/search | Full | Full | Read + support ops | Aggregate only |
| A. User create/invite | Yes | Yes | No | No |
| A. User delete | Yes (non-admins) | No | No | No |
| A. Suspend/unsuspend | Yes | Yes | No | No |
| A. Force password reset | Yes | Yes | Yes | No |
| A. Role grants | Yes | Non-admin roles only | No | No |
| A. Entitlement comp | Yes | Yes | Short trials only | No |
| B. View-only impersonation | Yes | Yes | Yes | No |
| B. Interactive impersonation | Yes | Config-gated | No | No |
| C. User data (non-sensitive) | Full | Full | Full | No |
| C. Photos/labs | Full | Full | Requires elevation | No |
| D. Billing view | Yes | Yes | Limited | Metrics only |
| D. Comp/cancel | Yes | Yes | Short comps | No |
| D. Refund | Yes | Yes (capped) | No | No |
| D. Force sync | Yes | Yes | No | No |
| E. Moderation | Full | Full | Queue triage | No |
| F. Bulk export | Yes | Yes | PII-restricted | Aggregate |
| F. Bulk email | Yes | Yes | No | No |
| G. Ops dashboards | Full | Full | User-scoped errors | Read only |
| G. Feature flags | Yes | Yes | No | No |
| G. AI kill switch | Yes | No | No | No |
| H. Support inbox | Full | Full | Full | No |
| I. Audit log | Full | Full | Limited | No |
| I. GDPR export | Yes | Yes (non-admins) | No | No |
| I. GDPR delete | Yes | No | No | No |
| J. Beta invites | Full | Full | Send/resend | Funnel only |

### Implementation

- Add role constraint values to `profiles.role`: `CHECK (role IN ('user', 'admin', 'superadmin', 'support', 'analyst', 'coach', 'nutritionist', 'clinician'))`
- Sync `profiles.role` to JWT claims via existing `sync-role-to-jwt` edge function.
- **Client:** `RouteGuard roles={[...]}` for UX gating only. Not a security boundary.
- **Server:** Every admin edge function verifies caller JWT → loads `profiles.role` via service-role client → checks role/action/target → performs operation.
- **Privilege escalation prevention:** Only superadmin can grant/revoke admin roles. No role may mutate a peer or higher role. Self-demotion is disallowed.

### Future: granular permissions

The `user_roles` / `role_permissions` / `permissions` tables already exist with 8 roles and 20 permissions. V1 uses `profiles.role` for simplicity. When granular permissions are needed, migrate to `has_permission()` RPC calls (already used by `admin-users` and `moderation` edge functions).

---

## 4. Security Model

### Server-side checks
- All admin endpoints verify caller's `profiles.role` server-side using service-role client.
- Never trust client-side role, target user ID, price, entitlement, or impersonation mode.
- Read-heavy endpoints use service-role queries. Do not relax RLS globally.

### Audit logging
- Every admin action writes to `admin_audit_log`: actor_id, action, target_id, before_state (JSONB), after_state (JSONB), ip, user_agent, ts, reason, severity.
- Audit table is append-only — no UPDATE or DELETE policies.
- Critical actions (delete, ban, role change, impersonate) have `severity: 'critical'`.
- Photo access separately logged to `photo_access_logs`.

### Impersonation safety
- Custom `admin_sessions` table (not real user JWTs).
- 30-minute hard timeout enforced client-side and server-side.
- Cannot impersonate admins/superadmins.
- Cannot perform destructive actions while impersonating.
- Every session fully audit-logged with pages visited.

### FK cascade repair
Before enabling admin delete, run FK discovery:

```sql
SELECT conrelid::regclass AS table_name, conname,
       pg_get_constraintdef(oid) AS constraint_def
FROM pg_constraint
WHERE contype = 'f' AND confrelid = 'auth.users'::regclass
ORDER BY 1, 2;
```

**Rule:** Not-null ownership FKs → `ON DELETE CASCADE`. Nullable attribution/audit FKs → `ON DELETE SET NULL`.

**Known repairs needed:**
- `terms_acceptances.user_id` — add ON DELETE CASCADE
- `user_data_resets.user_id` — add ON DELETE CASCADE
- `professional_links.invited_by` — add ON DELETE SET NULL
- `admin_action_logs.target_user_id` — add ON DELETE SET NULL (preserve audit on user delete)
- `photos`, `moderation_cases`, `moderation_actions`, `user_flags`, `internal_notes` — verify all refs to auth.users have explicit ON DELETE

### Platform gate
- Admin routes mounted outside `<PlatformGate>`.
- `VITE_ENABLE_PLATFORM_GATE_BYPASS=true` only on internal/staging/admin deployments.
- Never enable on the public marketing domain.

### Optional (superadmin actions)
- IP allowlist for superadmin destructive actions.
- 2FA-required flag before role grants, refunds, GDPR delete, interactive impersonation.

---

## 5. UI Architecture

### Design system
- **Paper + ink + sulfur.** Use `ACBrand`, `ACFonts`, `ACRadii` from `paper.jsx`. No new theme system.
- Admin panel is **dark-by-default** (`useACT(true)`) to visually distinguish from the user-facing app.
- Colors: ink background, paper text, accent for CTAs and warnings, error for destructive actions.

### Layout
- **AdminShell** — evolve from `AdminLayoutV2.jsx`. Full-width web layout (no V3AppShell bottom tabs).
- Fixed left sidebar (collapsible on mobile ≥720px). Sticky top header with search + notifications + user menu.
- Bottom status strip: latency, region, API timing (carry from AdminLayoutV2).

### Sidebar navigation

```
ADMIN
├── Dashboard           (overview KPIs + funnel)
├── Users
│   ├── All Users       (list/search/filter)
│   └── [User Detail]   (/:id with tabs)
├── Billing
│   ├── Subscriptions   (list + stats)
│   └── Revenue         (MRR, churn)
├── Moderation
│   ├── Queue           (reported content)
│   └── Cases           (case management)
├── Support             (inbox)
├── Invites & Beta      (codes + funnel)
├── Operations
│   ├── Errors          (error_logs)
│   ├── Webhooks        (subscription_events)
│   ├── AI Costs        (ai_usage_log)
│   └── Feature Flags   (feature_flags)
├── Audit Log           (admin_audit_log)
├── Compliance          (GDPR tools)
└── Settings            (admin config, role mgmt)
```

### Screen patterns
- **List view:** DataTable with pagination, search, filters, bulk actions. `@tanstack/react-query` for server state.
- **Detail view:** Card header + tabbed content. Action toolbar at top.
- **Modals:** Confirmation dialogs for destructive actions. Reason text mandatory.
- **Toasts:** Success/error feedback via Sonner (already integrated).
- **Empty/loading/error states** for every screen.

---

## 6. Build Order

### Phase 0 — Schema Repair

**Tables touched:** All FKs to `auth.users`, `admin_audit_log` reconciliation, new `admin_sessions`.

**Migrations:**
- `YYYYMMDD_fix_fk_cascade_audit.sql` — Bulk-fix ON DELETE rules on all FKs to `auth.users`
- `YYYYMMDD_admin_audit_log_reconcile.sql` — Standardize audit table name, create alias if needed
- `YYYYMMDD_admin_sessions.sql` — Create `admin_sessions` table for impersonation
- `YYYYMMDD_support_requests_admin.sql` — Add `status`, `assigned_to`, `resolved_at`, `priority` to `support_requests`; create `support_replies` table

**Edge functions:** None. SQL verification scripts only.

**Routes/UI:** None.

**Tests:**
- FK discovery returns no missing delete actions.
- Deleting a test user cascades/set-nulls cleanly.
- RLS confirms non-admin cannot read admin tables.

### Phase 1 — Mount + RBAC + Dashboard

**Tables touched:** `profiles` role constraint.

**Edge functions:** `admin-me` (returns caller profile + permissions).

**Routes:**
- `/admin` → AdminOverview (dashboard)
- `/admin/users` → placeholder
- `/admin/billing` → placeholder
- `/admin/moderation` → placeholder
- `/admin/support` → placeholder
- `/admin/invites` → placeholder
- `/admin/ops` → placeholder
- `/admin/audit` → placeholder
- `/admin/compliance` → placeholder
- `/admin/settings` → placeholder

**UI components:**
- `AdminShell.jsx` — layout shell (evolved from AdminLayoutV2)
- `AdminRouteGuard.jsx` — checks `profiles.role` for admin-level roles
- `AdminOverview.jsx` — KPI cards (users, MRR, churn, errors today) + sparklines + funnel
- `useAdminPermissions.js` — hook for current user's role + permission checks

**Tests:**
- Non-auth redirects to login.
- Non-admin denied (403 or redirect).
- Admin route renders when allowed.

### Phase 2 — User List + User 360 (Read-Only)

**Tables touched:** Read from profiles, subscriptions, workouts, food_logs, measurements, progress_photos, lab_exams, coach_messages, coach_memory, product_events, error_logs, email_events.

**Edge functions:**
- `admin-user-detail` (aggregated user data)
- `admin-user-files-sign` (signed URLs for storage)

**Routes:**
- `/admin/users` (list)
- `/admin/users/:id` (detail with all tabs)

**UI components:**
- `AdminUserList.jsx` — table, search, filters
- `AdminUserDetail.jsx` — profile header + tabs
- Tab components: UserOverviewTab, UserTimelineTab, UserTrainingTab, UserNutritionTab, UserBodyTab, UserLabsTab, UserCoachTab, UserSubscriptionTab, UserAuditTab, UserNotesTab
- `PhotoViewer.jsx` — blur-by-default, click-to-reveal, logs to `photo_access_logs`

**Tests:**
- Search/filter/pagination works.
- Support cannot open photos/labs by default.
- Signed URLs expire.
- Missing user returns 404.

### Phase 3 — Destructive Actions (with Audit)

**Tables touched:** `profiles`, `admin_audit_log`, `user_flags`, all cascaded user tables.

**Edge functions (add/update):**
- `admin-user-delete` (replaces/updates `admin-delete-user`)
- `admin-user-suspend`
- `admin-user-password-reset`
- `admin-user-email-reverify`
- `admin-user-role-update`

**UI components:**
- `UserActionToolbar.jsx` — suspend, reset, delete, grant, role change buttons
- `ConfirmModal.jsx` — reusable confirmation with reason field and audit preview

**Tests:**
- Delete non-admin succeeds after FK repair.
- Delete admin/superadmin blocked.
- Every action writes audit with before/after state.
- Reason is required.

### Phase 4 — Subscription/Billing Ops + Support Inbox

**Tables touched:** `subscriptions`, `subscription_events`, `stripe_webhook_events`, `support_requests`, `support_replies`.

**Edge functions:**
- `admin-billing-summary` (MRR, churn, anomalies)
- `admin-billing-comp` (grant entitlement)
- `admin-billing-cancel`
- `admin-billing-refund` (Stripe refund API)
- `admin-billing-force-sync` (RC/Stripe → Supabase)
- `admin-support-list`
- `admin-support-reply` (sends email via shared renderer)
- `admin-support-resolve`

**Routes:**
- `/admin/billing`
- `/admin/support`
- `/admin/support/:id`

**UI components:**
- `AdminBilling.jsx` — subscription table + stats
- `AdminSupport.jsx` — inbox
- `AdminSupportDetail.jsx` — ticket detail + reply + resolve

**Tests:**
- Comp creates expected entitlement state.
- Refund caps enforced by role.
- Reply sends email + logs audit.
- Support role can operate without broader admin powers.

### Phase 5 — Impersonation

**Tables touched:** `admin_sessions`, `admin_audit_log`.

**Edge functions:**
- `admin-impersonation-start`
- `admin-impersonation-stop`
- Admin-session-aware read endpoints

**UI components:**
- `useImpersonation.js` — context for impersonation state
- `ImpersonationProvider.jsx` — wraps admin layout
- Updated `ImpersonationBanner.jsx` — 30-min TTL, mode display

**Tests:**
- 30-minute expiry.
- Cannot impersonate admins.
- View-only cannot mutate.
- Destructive actions blocked while impersonating.

### Phase 6 — Audit, Compliance, Beta/Invites

**Tables touched:** `admin_audit_log`, `terms_acceptances`, `beta_invites`.

**Edge functions:**
- `admin-gdpr-export` (ZIP of all user data)
- (beta invites use existing edge functions)

**Routes:**
- `/admin/audit`
- `/admin/compliance`
- `/admin/invites`

**UI components:**
- `AdminAudit.jsx` — audit log table + filters + stats
- `AdminCompliance.jsx` — GDPR export/delete tools + terms log
- `AdminInvites.jsx` — invite list + send + funnel

**Tests:**
- Analyst read-only audit access.
- GDPR export generates valid ZIP.
- Beta invite lifecycle works.

### Phase 7 — Ops Health + Feature Flags

**Tables touched:** `error_logs`, `stripe_webhook_events`, `ai_usage_log`, `ai_spending_config`, `feature_flags`.

**Edge functions:**
- `admin-ops-health` (aggregated error/webhook stats)
- `admin-feature-flags` (CRUD for flags)

**Routes:**
- `/admin/ops` (with sub-tabs: errors, webhooks, AI costs)
- `/admin/settings/flags`

**UI components:**
- `AdminOps.jsx` — status cards + tabs
- `AdminFeatureFlags.jsx` — flag list, toggle, edit rollout %

**Tests:**
- Analyst read-only access.
- Feature toggles require admin/superadmin.
- Status indicators degrade gracefully.

### Phase 8 — Bulk/Cohort + Polish + Settings

**Tables touched:** Future `admin_cohorts`, `admin_cohort_members`.

**Edge functions:**
- `admin-user-export` (CSV generation)
- `admin-cohort-email` (batch send)

**Routes:**
- `/admin/cohorts`
- `/admin/settings`

**UI components:**
- `AdminCohorts.jsx` — filter builder + export + email
- `AdminSettings.jsx` — role management, admin config
- `CohortFilterBuilder.jsx`
- `BulkEmailDialog.jsx`
- `RoleManager.jsx`

**Tests:**
- CSV obeys role/PII policy.
- Email render/send audited.
- Large exports paginate.

---

## 7. Open Questions

Defaults chosen where possible. Questions requiring product/business answers:

1. Should `admin` have interactive impersonation, or only `superadmin`?
2. What refund amount requires two-admin approval? (Or no cap for v1?)
3. Should `support` be able to suspend users, or only admins?
4. How long should short support comps last: 7, 14, or 30 days?
5. Should manual comps update only `subscriptions`, or also mirror into `profiles.profile_data.pro_entitlement`?
6. Should lab PDFs render inline with a PDF viewer or download/open in a new tab?
7. What PII fields may `analyst` role export, if any?
8. Do GDPR exports need to include raw AI prompts/messages verbatim?
9. Should admin access require IP allowlist in production from day one?
10. Which domain/environment will host internal admin with `VITE_ENABLE_PLATFORM_GATE_BYPASS=true`?
11. Should admin audit logs be visible to affected users for critical actions?
12. Should deleted user storage files be removed immediately or retained for a compliance hold period?
13. Should support replies come from a shared address (`support@atlascore.app`) or named staff identity?
14. What is the initial country source for cohort filters? (`profiles` does not reliably store country.)

---

## 8. Risks & Non-Goals

### Risks

- **Privilege escalation** if client-side role checks are trusted as security boundary.
- **Data leakage** through impersonation, signed URLs, CSV exports, or support role overreach.
- **Audit gaps** if direct client writes remain in `adminService.js` (legacy path).
- **User delete failures** if FK actions remain missing after Phase 0.
- **Inconsistent RBAC** if `profiles.role`, `user_roles`, and JWT claims diverge.
- **Public-web exposure** if platform bypass is enabled on the marketing domain.
- **RLS performance** if `has_permission()` is called per-row on large admin tables.

### Non-goals for v1

- Machine-learning content moderation (manual only).
- Full billing self-service replacing Stripe/RevenueCat dashboards.
- Granular permission editor UI for every permission in `user_roles`.
- Real-time edge invocation logs (unless Supabase exposes API).
- Two-admin approval workflows (except where refund policy requires).
- In-app real-time chat for support (email-only replies).
- Mobile-native admin experience (web-only).
- Multi-tenant org/team hierarchy (single-tenant SaaS).
- Custom report builder (pre-defined metrics and funnels only).

---

## 9. Implied Counts

| Category | Count |
|---|---|
| Tables directly implicated | 50+ |
| Existing service-role edge functions | 28 |
| New/updated admin edge functions | ~24 |
| Admin routes | ~30 |
| Primary admin screens | ~28 |
| UI components (new) | ~35 |
| Migrations (Phase 0) | 4 |
| Unresolved open questions | 14 |
