# Atlas Core — AI Review Action Plan
> Generated: 2026-03-21
> Based on audits from Perplexity, Gemini, and ChatGPT
> Status: READY TO EXECUTE

---

## WAVE 1 — Immediate Fixes (24–48h)
*Trust-breaking issues. Must ship before any marketing push.*

### 1. Fix NaN states in Progress.jsx
**File:** `src/pages/Progress.jsx`
**Problem:** `MetricCard` renders `{Math.abs(goal - value).toFixed(1)} to go` and `style={{ width: \`${Math.min((value / goal) * 100, 100)}%\` }}` when `value` is `undefined` or `null`, producing "NaN to go" and "NaN%" on screen.
**Fix:** Guard all numeric operations in `MetricCard`:
- `value?.toFixed(1) ?? '—'` instead of `value?.toFixed(1)`
- Wrap `goal - value` computation: `if (!value || !goal) return null` (skip goal block)
- Wrap progress bar width: `Math.min(((value ?? 0) / (goal || 1)) * 100, 100)`

### 2. Fix "Forgot password? → Contact support" in Auth.jsx
**File:** `src/pages/Auth.jsx`
**Problem:** The login form shows "Forgot your password? Contact support." with a mailto link. This is a major trust-killer for SaaS — users expect a standard self-serve reset flow.
**Fix:** Add a proper Supabase password reset flow:
- Add `forgotPassword` state (boolean) to toggle a new "Reset password" mini-form
- When the user enters their email and clicks "Send reset link", call `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/auth' })`
- Show success message: "Check your email for a reset link."
- Replace the "Contact support" link with "Forgot your password?" that toggles `forgotPassword = true`
- Keep the support mailto as a secondary escape hatch ("Still need help? Contact support")
- Both EN and PT copy already exists in the `ui` object (`recoveryTitle`, `recoveryCopy`, `recoveryCta`) — reuse those strings

### 3. Remove/demote "Admin mode active" badge from Today.jsx
**File:** `src/pages/Today.jsx`
**Problem:** The greeting card shows a branded "Admin mode active" badge whenever `role === 'admin'`. All three AI reviewers flagged this as making the app look like an internal staging environment to any admin user (including the founder).
**Fix:** Remove the admin badge from the Today screen entirely. The Admin Console is accessible via the sidebar — no need to announce admin mode on every page load. Delete lines 522–527 in Today.jsx.

### 4. Fix hero punctuation in Landing.jsx
**File:** `src/pages/Landing.jsx`
**Problem:** At least one hero headline contains "working.?" — a broken punctuation pattern that looks sloppy.
**Fix:** Search the Landing.jsx COPY object for `.?" ` and correct to `?` only. Do a full pass for any other malformed punctuation.

### 5. Improve Atlas AI empty/starter state
**File:** `src/pages/AtlasAI.jsx`
**Problem:** The AI already has 6 `PROMPTS` defined but reviewers said it "looks like a generic chat box." The prompts need to be more visually prominent when the conversation is empty.
**Current state:** Prompts are rendered somewhere in the UI but not as the primary focus on load.
**Fix:** When `activeConversation.messages.length === 0`, show a prominent "Start with a question" grid of all 6 prompt cards ABOVE the chat input, center-stage. Each card should be clearly clickable and visually inviting. Make the prompt grid the hero of the empty state, not an afterthought.

### 6. Strip any internal dev text from user-facing UI
**Files:** Search all `src/pages/` and `src/components/` for the following patterns:
- `supabase_admin_console.sql`
- `schema`
- `DB schema`
- `project root`
- Any SQL references
**Fix:** Remove or replace with user-friendly language. If the AdminPanel references schema files, move that to a comment or a developer-only tooltip.

---

## WAVE 2 — Short-term (1–2 weeks): Navigation & IA

### 7. Consolidate athlete sidebar navigation
**File:** `src/lib/rbac.js` → `NAV_BY_ROLE.athlete`
**Problem:** Athletes see 12 nav items (Today, Nutrition, Workouts, Diary, Protocols, Measurements, Progress, Progress Photos, Insights, Lab Exams, Atlas AI, Profile). This is cognitive overload.
**Proposed consolidation (8 items):**
```
Today           → Today
Nutrition       → Nutrition
Workouts        → Workouts
Body            → NEW: merges Measurements + Progress + Progress Photos
Protocols       → Protocols
Lab Exams       → Lab Exams
Atlas AI        → Atlas AI
Profile         → Profile
```
- Remove: `Diary` (rename/absorb into Today or make it a sub-tab), `Insights` (make it a tab within the new Body hub or Today)
- `Progress Photos` and `Measurements` and `Progress` all live at `/body` as sub-tabs

### 8. Create a unified "Body" hub page
**New file:** `src/pages/Body.jsx`
**Purpose:** Single page with 3 sub-tabs: Check-ins (Progress), Measurements, Photos
- Tab 1: Current Progress.jsx content
- Tab 2: Current Measurements.jsx content
- Tab 3: Current ProgressPhotos.jsx content
- Route: `/body` with sub-routes `/body/checkins`, `/body/measurements`, `/body/photos`
- Update `src/lib/routes.js` and `src/App.jsx` accordingly
- Keep old individual routes as redirects to the new hub for backwards compatibility

### 9. Rename "Diary" to something clearer
**File:** `src/lib/rbac.js`, `src/pages/Diary.jsx`, all nav references
**Problem:** "Diary" sounds like journaling. Users don't know it's their daily consolidated log.
**Fix:** Rename to "Timeline" or "Daily Log" — "Timeline" is more consistent with the "Everything connected. One view." marketing promise.

### 10. Improve empty states across all modules
**Files:** `src/pages/Insights.jsx`, `src/pages/LabExams.jsx`, `src/pages/ProgressPhotos.jsx`, `src/pages/Measurements.jsx`
**Pattern to follow for every empty state:**
1. Prominent icon (already usually present)
2. **Bold primary CTA button at the TOP** (not buried after 3 lines of copy)
3. Short 1-sentence explanation BELOW the button
4. No long paragraphs about what the feature does — users can explore that themselves

Example for Insights empty state:
```jsx
<div className="text-center space-y-4 py-16">
  <Heart className="h-10 w-10 mx-auto text-[hsl(var(--brand)/0.5)]" />
  <h2 className="t-subtitle">Your insights will appear here</h2>
  <Button asChild><Link to={ROUTES.measurements}>Add your first measurement →</Link></Button>
  <p className="t-small text-[hsl(var(--fg-2))]">Log at least 7 days of data to generate your first insight.</p>
</div>
```

### 11. Add in-app upgrade nudge hooks
**Files:** `src/pages/Insights.jsx`, `src/pages/Progress.jsx`, `src/pages/ProgressPhotos.jsx`
**Fix:** When a free user hits the 30-day limit on Insights, show a tasteful paywall card inline (not just a generic banner):
- Show a blurred preview of what deeper insights look like
- CTA: "Unlock 1-year history with Pro — $9/mo"
- Mirror this pattern on ProgressPhotos when the free 5-checkpoint limit is hit

---

## WAVE 3 — Strategic (High-leverage)

### 12. Build a "Clarity" screen — the connected insight view
**New file:** `src/pages/Clarity.jsx` or repurpose `src/pages/Insights.jsx`
**Purpose:** The core product promise is "see what's actually working." This screen delivers that.
**Content:**
- A 4-week rolling window combining: weight trend + macro adherence trend + workout frequency + active protocols
- 2–3 auto-generated narrative bullets (via Atlas AI backend call, not chat)
- One recommended action for next week
- This is the **flagship Pro feature** — gate it behind a plan check

### 13. Atlas AI — deepen beyond chat
**File:** `src/pages/AtlasAI.jsx`
**Current state:** Chat with 6 starter prompts. Good foundation.
**Improvements:**
- Add a "Quick Analyses" section with task-specific wizard prompts that pass real user data automatically (weight trend delta, adherence %, active protocols list)
- Make the context block (profile summary) visible to the user so they understand why AI answers are personalized
- Add a "Share" button on any AI message to copy it as text (for sharing with coaches)

### 14. Consolidate CTA language across landing, auth, and pricing
**Files:** `src/pages/Landing.jsx`, `src/pages/Auth.jsx`, `src/pages/Pricing.jsx`
**Problem:** "Get Started", "Get started", "Create account", "Subscribe", "Claim Founder Price", "See All Plans" — 6+ CTA patterns.
**Fix:** Standardize to 3 patterns only:
- Primary acquisition: **"Get started free"**
- Secondary exploration: **"See plans"**
- Direct conversion: **"Start Pro"** / **"Start Performance"**

### 15. Fix the "not clinical" contradiction
**Files:** `src/pages/Landing.jsx`, `src/pages/Pricing.jsx`
**Problem:** Landing says Atlas is not a clinical tool, but the app has Clinician plans, lab exams, hormone tracking, and half-life curves. This creates trust friction.
**Fix option A:** Lean in — remove the "not clinical" disclaimer and own the clinical-adjacent positioning
**Fix option B:** Segment the messaging — "For athletes and coaches" on the main landing, clinician features on a separate `/for/clinicians` page
**Recommended:** Option B — keeps the primary persona clean

---

## File Change Index
| # | File | Change type |
|---|------|-------------|
| 1 | `src/pages/Progress.jsx` | Bug fix — NaN guards |
| 2 | `src/pages/Auth.jsx` | Feature — proper password reset flow |
| 3 | `src/pages/Today.jsx` | UX fix — remove admin badge |
| 4 | `src/pages/Landing.jsx` | Copy fix — punctuation + CTA standardization |
| 5 | `src/pages/AtlasAI.jsx` | UX — prominent prompt grid on empty state |
| 6 | `src/pages/AdminPanel.jsx` | Cleanup — remove any SQL/schema copy that bleeds into UI |
| 7 | `src/lib/rbac.js` | Navigation — trim athlete nav from 12 → 8 items |
| 8 | `src/pages/Body.jsx` (NEW) | New — unified body hub with 3 sub-tabs |
| 9 | `src/lib/routes.js` | Routes — add `/body` and sub-routes |
| 10 | `src/App.jsx` | Router — wire new Body hub routes |
| 11 | `src/pages/Diary.jsx` | Rename/rebrand to Timeline |
| 12 | Empty state components | UX — CTA-first empty states in Insights, Labs, Photos, Measurements |
| 13 | `src/pages/Insights.jsx` | Feature — inline upgrade nudge at 30-day limit |
| 14 | `src/pages/Clarity.jsx` (NEW) | New — connected insight view (Wave 3) |

---

## Priority Order (if credits or time are limited)
1. ✅ NaN in Progress.jsx — 15 min, high visibility bug
2. ✅ Remove admin badge from Today.jsx — 5 min, big trust win
3. ✅ Password reset flow in Auth.jsx — 45 min, critical SaaS standard
4. ✅ Atlas AI empty state prominence — 30 min, immediate AI value signal
5. ✅ Landing punctuation + CTA cleanup — 20 min, first impression
6. ⏳ Nav consolidation (rbac.js) — 30 min, reduces overwhelm
7. ⏳ Body hub page — 2-3 hours, major IA improvement
8. ⏳ Empty state CTAs — 1 hour across 4 pages
9. ⏳ Clarity/insight screen — 4+ hours, strategic
