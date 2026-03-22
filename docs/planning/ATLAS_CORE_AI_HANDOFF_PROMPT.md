# Atlas Core — AI Handoff Prompt
> Copy-paste this entire prompt into any AI coding assistant (Claude, Cursor, Copilot, GPT-4, etc.)
> to continue the improvement work if the previous session was interrupted.

---

## CONTEXT

You are working on **Atlas Core**, a React + Vite + Supabase body-transformation and performance tracking app. The project is located at `src/` with the following key stack:

- **Frontend:** React 18, Vite, Tailwind CSS, Radix UI / shadcn components
- **Backend:** Supabase (auth, Postgres DB, edge functions)
- **Routing:** React Router v6
- **State:** React Query (TanStack), React Context (Auth, Subscription, i18n)
- **Payments:** Stripe
- **Languages:** EN-US (default) and PT-BR (partial support)

Three AI tools (Perplexity, Gemini, ChatGPT) audited the app and found critical issues. The full plan is in `ATLAS_CORE_IMPROVEMENT_PLAN.md`. Below are the specific code changes needed, in priority order.

---

## TASK 1 — Fix NaN states in Progress.jsx (CRITICAL)
**File:** `src/pages/Progress.jsx`

The `MetricCard` component at the top of the file renders broken "NaN to go" and a NaN-width progress bar when `value` is undefined (no measurements yet).

Find this block in `MetricCard`:
```jsx
{goal && (
  <div className="pt-2 border-t border-[hsl(var(--border-h))]">
    <div className="flex items-center justify-between text-[12px] mb-1">
      <span className="text-[hsl(var(--fg-2))]">Goal: {goal}</span>
      <span className={`font-medium ...`}>
        {Math.abs(goal - value).toFixed(1)} to go
      </span>
    </div>
    <div className="h-1.5 ...">
      <div style={{ width: `${Math.min((value / goal) * 100, 100)}%` }} />
    </div>
  </div>
)}
```

Replace with a version that guards against undefined/null value:
```jsx
{goal && value != null && (
  <div className="pt-2 border-t border-[hsl(var(--border-h))]">
    <div className="flex items-center justify-between text-[12px] mb-1">
      <span className="text-[hsl(var(--fg-2))]">Goal: {goal}</span>
      <span className={`font-medium ...`}>
        {Math.abs(goal - value).toFixed(1)} to go
      </span>
    </div>
    <div className="h-1.5 ...">
      <div style={{ width: `${Math.min(((value || 0) / (goal || 1)) * 100, 100)}%` }} />
    </div>
  </div>
)}
```

Also find the `value?.toFixed(1)` render in the same component and replace with `value != null ? value.toFixed(1) : '—'`.

---

## TASK 2 — Remove admin badge from Today.jsx (QUICK WIN)
**File:** `src/pages/Today.jsx`

Find and delete this block (around line 522):
```jsx
{isAdmin && (
  <div className="flex flex-wrap gap-2">
    <span className="inline-flex rounded-full border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.12)] px-3 py-1 text-[12px] font-semibold tracking-[0.04em] text-[hsl(var(--brand))]">
      {t('today_page.adminBadge')}
    </span>
  </div>
)}
```

The `isAdmin` variable and `role` query can stay — they are used elsewhere. Just remove this visual badge from the greeting card. Admin users know they are admins; they don't need a banner on every page load.

---

## TASK 3 — Add proper password reset to Auth.jsx (IMPORTANT)
**File:** `src/pages/Auth.jsx`

**Current broken behavior:** The login form shows "Forgot your password? Contact support." which opens a mailto link. This is unacceptable for a SaaS product.

**What to build:** A self-serve password reset flow using Supabase's built-in `resetPasswordForEmail`.

Here is the full implementation plan:

1. Add state near the top of the Auth component:
```jsx
const [forgotPassword, setForgotPassword] = React.useState(false);
const [resetSent, setResetSent] = React.useState(false);
```

2. Add a `handlePasswordReset` function:
```jsx
const handlePasswordReset = async (event) => {
  event.preventDefault();
  if (!email.trim()) {
    setErrorMessage(isPt ? 'Digite seu email para continuar.' : 'Enter your email to continue.');
    return;
  }
  setIsSubmitting(true);
  setErrorMessage('');
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/auth?mode=login`,
  });
  setIsSubmitting(false);
  if (error) {
    setErrorMessage(isPt ? 'Não foi possível enviar o link. Tente novamente.' : 'Could not send the reset link. Please try again.');
  } else {
    setResetSent(true);
  }
};
```

3. Replace the "Contact support" link (around line 508–514) with:
```jsx
{isLogin && !forgotPassword && (
  <div className="mt-3 text-center">
    <button
      type="button"
      onClick={() => { setForgotPassword(true); setErrorMessage(''); setSuccessMessage(''); }}
      className="text-[12px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] underline-offset-2 hover:underline"
    >
      {isPt ? 'Esqueceu a senha?' : 'Forgot your password?'}
    </button>
  </div>
)}
```

4. Add a "forgot password" form panel that replaces the main form when `forgotPassword === true`:
```jsx
{forgotPassword && !resetSent && (
  <form className="mt-7 space-y-4" onSubmit={handlePasswordReset}>
    <div>
      <h2 className="text-[18px] font-bold">{ui.recoveryTitle}</h2>
      <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">{ui.recoveryCopy}</p>
    </div>
    <div className="space-y-1.5">
      <label htmlFor="resetEmail" className="text-[12px] font-semibold">{t('profile.email')}</label>
      <input
        id="resetEmail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={ui.emailPlaceholder}
        className="atlas-field h-12 px-4 text-base"
      />
    </div>
    {errorMessage && <div className="atlas-banner px-4 py-3.5 text-[12px]" data-tone="error">{errorMessage}</div>}
    <Button type="submit" size="lg" className="h-11 w-full" disabled={isSubmitting}>
      {isSubmitting ? '...' : ui.recoveryCta}
    </Button>
    <button type="button" onClick={() => { setForgotPassword(false); setErrorMessage(''); }}
      className="w-full text-center text-[12px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]">
      {isPt ? '← Voltar para o login' : '← Back to sign in'}
    </button>
  </form>
)}

{forgotPassword && resetSent && (
  <div className="mt-7 space-y-4 text-center">
    <div className="atlas-banner px-4 py-3.5 text-[13px]" data-tone="success">
      {isPt ? 'Link enviado! Verifique seu email.' : 'Reset link sent! Check your email.'}
    </div>
    <button type="button" onClick={() => { setForgotPassword(false); setResetSent(false); }}
      className="text-[12px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]">
      {isPt ? '← Voltar para o login' : '← Back to sign in'}
    </button>
  </div>
)}
```

5. Wrap the existing main form in `{!forgotPassword && (...)}`

Note: `supabase` is already imported in the file as `import { supabase } from '@/lib/supabaseClient'`. The `isPt` variable is `language === 'pt-BR'`.

---

## TASK 4 — Make Atlas AI prompt grid prominent on empty state
**File:** `src/pages/AtlasAI.jsx`

The `PROMPTS` array (6 items) already exists. The issue is that when a conversation has no messages, the empty chat area is just a void with "Ask something…" placeholder.

Find where the conversation messages are rendered (the area that maps over `activeConversation.messages`). When `messages.length === 0`, render the prompt grid as the hero element instead of an empty chat area:

```jsx
{activeConversation.messages.length === 0 ? (
  <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
    <div className="text-center space-y-2">
      <Brain className="h-8 w-8 mx-auto text-[hsl(var(--brand)/0.6)]" />
      <h2 className="t-subtitle">What do you want to understand today?</h2>
      <p className="t-small text-[hsl(var(--fg-2))]">Choose a starting point or ask your own question below.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
      {PROMPTS.map((p) => (
        <button
          key={p.id}
          onClick={() => handleSendMessage(p.prompt)}
          className="text-left surface rounded-xl p-4 space-y-1 hover:border-[hsl(var(--brand)/0.4)] border border-transparent transition-colors"
        >
          <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{p.title}</p>
          <p className="text-[12px] text-[hsl(var(--fg-2))]">{p.description}</p>
        </button>
      ))}
    </div>
  </div>
) : (
  // existing messages render
  <div className="flex-1 overflow-y-auto ...">
    {activeConversation.messages.map(...)}
  </div>
)}
```

You will need to find the exact function name for sending a message (likely something like `handleSend` or `sendMessage`) and use it in the `onClick`. Check the existing code.

---

## TASK 5 — Fix hero punctuation in Landing.jsx
**File:** `src/pages/Landing.jsx`

Search for `"working.?"` or `'.?"'` in the COPY object and fix to just `"working?"`. Do a full scan of all string values in the COPY object for any malformed punctuation (double periods, question marks after periods, etc.).

---

## TASK 6 — Consolidate athlete sidebar navigation
**File:** `src/lib/rbac.js`

Change `NAV_BY_ROLE.athlete` from 12 items to 8:

```js
athlete: [
  { path: ROUTES.today,        label: 'Today',     icon: 'Home' },
  { path: ROUTES.nutrition,    label: 'Nutrition',  icon: 'UtensilsCrossed' },
  { path: ROUTES.workouts,     label: 'Workouts',   icon: 'Dumbbell' },
  { path: ROUTES.body,         label: 'Body',       icon: 'TrendingUp' },   // NEW hub — see Task 7
  { path: ROUTES.protocols,    label: 'Protocols',  icon: 'FlaskConical' },
  { path: ROUTES.labExams,     label: 'Lab Exams',  icon: 'ClipboardList' },
  { path: ROUTES.atlasAI,      label: 'Atlas AI',   icon: 'Brain' },
  { path: ROUTES.profile,      label: 'Profile',    icon: 'User' },
],
```

Remove: Diary, Measurements, Progress, Progress Photos, Insights (these move into Body hub or are accessed through Today).
Note: Insights can be kept as a tab INSIDE the Body hub.

Also update `BOTTOM_NAV_BY_ROLE.athlete` to remove items that no longer exist in the main nav.

---

## TASK 7 — Create a unified "Body" hub page
**New file:** `src/pages/Body.jsx`
**New route:** `/body` with sub-tabs

Create a tabbed page that merges Measurements, Progress, and Progress Photos:

```jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Import existing page content as components or embed inline

const TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'measurements', label: 'Measurements' },
  { id: 'photos',       label: 'Photos' },
];

export default function Body() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="mx-auto max-w-5xl p-5 lg:p-8 space-y-6">
      <h1 className="t-headline">Body Progress</h1>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-[hsl(var(--border-h))]">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 pb-3 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[hsl(var(--brand))] text-[hsl(var(--fg))]'
                : 'border-transparent text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — render existing page content */}
      {activeTab === 'overview'     && <ProgressContent />}
      {activeTab === 'measurements' && <MeasurementsContent />}
      {activeTab === 'photos'       && <ProgressPhotosContent />}
    </div>
  );
}
```

The content components (`ProgressContent`, `MeasurementsContent`, `ProgressPhotosContent`) should be extracted from their respective pages and imported here.

**Also update:**
- `src/lib/routes.js` — add `body: '/body'`
- `src/App.jsx` — add route `<Route path="/body" element={<Body />} />`
- Add redirect from `/measurements`, `/progress`, `/progress-photos` to `/body` with the appropriate tab query param

---

## TASK 8 — CTA-first empty states
**Files:** `src/pages/Insights.jsx`, `src/pages/LabExams.jsx`, `src/pages/ProgressPhotos.jsx`

For any empty state in these files, change the structure from:
```
[Icon] Title → Description paragraph → Button
```
to:
```
[Icon] Title → [BIG BUTTON] → Short description
```

The primary CTA must be the first interactive element, not buried after copy.

---

## KEY PATHS & IMPORTS TO KNOW
```
src/lib/routes.js           — all route constants (ROUTES object)
src/lib/rbac.js             — navigation by role (NAV_BY_ROLE)
src/lib/supabaseClient.js   — supabase client (export: supabase)
src/lib/AuthContext.jsx      — useAuth() hook → { user, isAuthenticated }
src/lib/SubscriptionContext.jsx — useSubscription() hook → { plan_code, status }
src/lib/i18nContext.jsx     — useI18n() hook → { t, locale }
src/hooks/useTranslation.js — useTranslation() hook (landing/public pages)
src/components/ui/button.jsx — Button component
src/components/shared/StablePage.jsx — SafePageBoundary, StatusBanner, FilterChip
```

## CSS DESIGN TOKENS (Tailwind CSS variables)
```
hsl(var(--fg))       — primary text
hsl(var(--fg-2))     — secondary text
hsl(var(--fg-3))     — muted text
hsl(var(--brand))    — accent/brand color (teal)
hsl(var(--ok))       — success green
hsl(var(--warn))     — warning amber
hsl(var(--err))      — error red
hsl(var(--border))   — default border
hsl(var(--card))     — card background
hsl(var(--fill))     — slightly elevated fill
hsl(var(--shell))    — page shell background
surface              — Tailwind class for card surface (bg + border + rounded)
t-headline           — heading style class
t-subtitle           — subheading style class
t-small              — small text style class
atlas-field          — form input style class
atlas-banner         — status banner class (use data-tone="error"|"success"|"warning")
atlas-overline       — small overline/eyebrow text class
```

---

## WHAT NOT TO TOUCH
- `src/lib/AuthContext.jsx` — auth flow is stable, don't refactor it
- `src/lib/SubscriptionContext.jsx` — subscription logic is correct
- `src/components/ui/` — shadcn components, don't modify
- `supabase/functions/` — edge functions were recently refactored, leave alone
- `src/lib/i18n.js` — i18n system intentionally returns en-US only for now

---

## SUCCESS CRITERIA
After completing all 8 tasks:
- [ ] Progress page never shows "NaN" for any metric
- [ ] Forgot password shows a proper email-based reset flow, not mailto
- [ ] Today page has no admin badge for any user role
- [ ] Atlas AI loads with a prominent 6-prompt grid when conversation is empty
- [ ] Landing hero has no broken punctuation
- [ ] Athlete sidebar has 8 items maximum
- [ ] A `/body` route exists that combines measurements, progress, and photos
- [ ] Empty states in Insights/Labs/Photos lead with a CTA button
