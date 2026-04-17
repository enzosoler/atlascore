# Teardown 03 — Sign up / Log in

**Surface:** Public and authenticated entry flow for email/password, Google OAuth, password reset, and auth-related redirects.
**Atlas file(s):** `src/pages/Auth.jsx`, `src/pages/AuthCallback.jsx`, `src/pages/UpdatePassword.jsx`, `src/pages/EmailAuth.jsx`, `src/pages/AppleAuth.jsx`, `src/pages/SocialAuth.jsx`, `src/lib/AuthContext.jsx`, `src/lib/googleSignIn.js`, `src/components/auth/GoogleSignInButton.jsx`, `src/components/routing/WebOnlyRoute.jsx`, `src/components/public/PublicSiteShell.jsx`, `src/App.jsx`, `src/features/onboarding/screens/AccountCreationScreen.jsx`
**Reference apps:** Linear (primary)
**Audience tension:** High — Atlas has to satisfy both serious users who expect reliable, secure access and general users who need a low-friction first run without feeling lost.

---

## Why this screen matters

Sign up and log in are not just a utility form in Atlas. They are the control point for every new account, every returning user, every protected deep link, and every recovery path after a password reset or expired session. If this surface is slow or lossy, the app loses the user before they ever reach the product value.

Broken auth here shows up in a few very specific ways: users land on the wrong screen after OAuth, a signup succeeds but the next step disappears, a returning user is kicked into onboarding without a clear explanation, or password recovery drops them into a dead end. World-class auth feels almost invisible: the user knows what will happen next, can choose the fastest sign-in path, and never wonders whether their destination, role, or onboarding state survived the handoff.

---

## Reference app 1 — Linear (primary)

Linear is the right reference because it serves a serious, high-expectation audience that cares about speed, trust, and workspace continuity. Its login model is not “marketing login”; it is a disciplined access layer for a product people use daily. The public docs on [login methods](https://linear.app/docs/login-methods) and [workspaces](https://linear.app/docs/workspaces) show the exact patterns Atlas should borrow: multiple auth methods, strong account/session handling, and a clean handoff back into the user’s last meaningful context.

### What Linear does that works

1. **Offers clear method hierarchy**

   Linear does not present auth as one giant generic form. It gives users explicit methods like Google, email login links/codes, passkeys, and SSO, then lets org settings constrain those options when needed. That works because the user can choose the fastest trusted path, while teams with stricter security can still enforce policy.

2. **Treats login as workspace access**

   Linear’s language and flow are workspace-aware rather than app-generic. That matters because users are not just “logging in,” they are re-entering a specific team context, and the product keeps that mental model intact from the first step onward.

3. **Returns users to the right place**

   After auth, Linear takes users back into the workspace or account they were actually using, instead of dropping them into a neutral holding screen. That reduces reorientation cost, especially for returning users who bounce between multiple contexts and devices.

4. **Separates access from settings**

   Security, sessions, passkeys, and connected apps live in a dedicated account/security area, not in the login form itself. That keeps first-run auth simple while still giving advanced users visible control over session behavior and security posture.

5. **Privileges passwordless and low-friction sign-in**

   Linear’s docs emphasize email login links/codes and passkeys alongside Google and SSO. That reduces password fatigue and gives users a faster path back into the app, which is especially important for a product with repeated daily usage.

6. **Makes sign-out and session scope legible**

   Linear documents that signing out is session-aware and that users can manage current devices. This level of transparency is valuable because it creates trust: users can see how access is scoped and what a sign-out actually does.

### What Linear does that you shouldn't copy

1. **Do not copy the enterprise vocabulary**

   Linear’s workspace, admin, SSO, and IP-restriction language is appropriate for a team product. Atlas serves serious users, but not every user is thinking in enterprise access-control terms when they arrive to log in, so that framing would raise cognitive load instead of reducing it.

2. **Do not over-index on admin controls in the first screen**

   The security and access depth in Linear is valuable, but it belongs after entry, not inside the sign-in experience. Atlas should preserve the simplicity of the entry form and only expose advanced security controls once the user is inside and context is established.

3. **Do not assume work email is the primary identity**

   Linear recommends work email because its core audience is teams. Atlas is broader and includes consumer fitness users, so the signup experience should not imply that a business email is required or more legitimate than a personal email.

---

## What Atlas does today (current state)

- The surface is centralized on `src/pages/Auth.jsx`, with route aliases for `/auth`, `/login`, and `/signup` all rendering the same page. Entry into the surface comes from public CTAs, protected-route redirects, auth gate modals, and onboarding-related handoffs; exit is either a normal app route, `/onboarding`, or an OAuth/password-reset callback path.
- `RequireAuthenticatedApp` in `src/App.jsx` controls most unauthenticated redirects. Deep links to protected routes on web are sent to `/auth?mode=login&next=...`, while native unauthenticated users are routed directly to onboarding. That means auth is not the only entry path: onboarding also acts as a first-run gate.
- The visible auth UI is a centered card inside `PublicSiteShell` on web and a mobile-safe full-screen wrapper on native. The screen supports login, signup, and a forgot-password substate, with a Google OAuth button, email/password fields, a name field for signup, and small legal copy linking to Terms and Privacy.
- `src/pages/AuthCallback.jsx` is the OAuth landing screen. It checks the Supabase session, resolves a post-auth destination from the profile row, and then delays navigation by 1.5 seconds to show a success state. `src/pages/UpdatePassword.jsx` handles reset-link verification and password update on `/auth/update-password`.
- Auth is fragmented across the main page and onboarding. `src/features/onboarding/screens/AccountCreationScreen.jsx` is a separate account-creation flow that can sign users up with email, Google, or Apple while also persisting onboarding data. That flow does not reuse the main auth page UI, so the user experience diverges depending on whether they start from marketing, a protected route, or onboarding.
- Concrete rough edges visible in code: the auth form computes a CAPTCHA token but never passes it into `signIn` or `signUp`, so that protection is effectively dead on this screen; `ui.aiHint` is defined but never rendered; and Google OAuth does not preserve the `next` destination through `AuthCallback`, so OAuth users can lose the original target even when email/password users do not.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Preserve destination intent**

   Atlas already has `next` handling in the email/password path, but it needs to be surfaced and preserved everywhere, including Google OAuth and callback routing. Make the user’s destination explicit in the UI and keep it stable through redirects. Effort: 4-8 hours.

2. **Keep a single auth hub**

   The consolidated `/auth` page is the right default. It keeps login, signup, recovery, and social auth in one place instead of scattering them across multiple entry pages, which reduces routing overhead and support confusion. Effort: 1 day.

3. **Use progressive states instead of separate pages**

   The forgot-password mode inside the auth card is good because it avoids a full-page context switch. Keep that pattern and make the state transitions even clearer, so users can back out without losing their email input. Effort: 4-6 hours.

### 🟡 Steal soon — medium impact, medium effort

1. **Add passwordless or passkey readiness**

   Linear shows why low-friction login methods matter for repeat-use products. Atlas does not need to copy every enterprise control, but it should be designed so passkeys or email links can be added without redesigning the surface later. Effort: 2-4 days.

2. **Unify signup behavior across auth and onboarding**

   The main auth page and onboarding account-creation screen should share the same auth primitives, validation rules, and post-signup state handling. Right now they are functionally related but visually and behaviorally different, which makes the system harder to reason about. Effort: 2-3 days.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Add workspace/account semantics**

   Linear’s auth model works because login is tied to a workspace. Atlas would only benefit from that if account types or organizations become first-class in the product; otherwise it is extra conceptual weight with little payoff. Effort: 1-2 weeks.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Fast entry vs. reliable routing.**
The screen wants to be simple, but the app also needs to preserve `next`, onboarding state, and role-aware destinations across multiple auth methods. *Resolution:* keep the visual surface simple, but make routing state first-class in the code and visible in the success messaging when it matters.

**Tension 2 — Consumer-friendly vs. serious-user credible.**
Atlas serves general fitness users and more demanding optimizer/professional users, and those groups expect different amounts of ceremony. *Resolution:* keep the default form minimal, but add small trust cues for security, recovery, and destination preservation rather than adding more fields or choices.

**Tension 3 — One auth surface vs. fragmented onboarding.**
The main auth page is centralized, but onboarding has its own account-creation branch with overlapping responsibilities. *Resolution:* keep one canonical auth state machine and let onboarding consume it, rather than letting onboarding maintain a parallel signup experience.

**Tension 4 — Security vs. conversion.**
CAPTCHA, email confirmation, and recovery flows all add friction, but skipping them can make the surface feel fragile or unsafe. *Resolution:* keep the primary path fast, but make the security steps explicit and correctly wired so the friction is real only where it protects the system.

---

## Specific changes to make (actionable list)

1. Thread the `next` destination through Google OAuth and `AuthCallback` so social auth returns users to the same place as email/password auth.
   Files to touch: `src/pages/Auth.jsx`, `src/lib/googleSignIn.js`, `src/pages/AuthCallback.jsx`
   Effort: 4-8 hours
   Dependency: none

2. Pass the CAPTCHA token into the auth calls or remove the dead CAPTCHA branch.
   Files to touch: `src/pages/Auth.jsx`, `src/lib/AuthContext.jsx`, `src/features/onboarding/screens/AccountCreationScreen.jsx`
   Effort: 4-6 hours
   Dependency: none

3. Reuse a shared auth form component between `/auth` and onboarding account creation.
   Files to touch: `src/pages/Auth.jsx`, `src/features/onboarding/screens/AccountCreationScreen.jsx`
   Effort: 1-2 days
   Dependency: none

4. Add visible destination messaging for `next` and preserve it in the Google and reset flows.
   Files to touch: `src/pages/Auth.jsx`, `src/pages/AuthCallback.jsx`, `src/pages/UpdatePassword.jsx`
   Effort: 4-6 hours
   Dependency: task 1

5. Replace the dead `EmailAuth`, `AppleAuth`, and `SocialAuth` stubs with canonical redirects or remove the routes if they are no longer needed.
   Files to touch: `src/pages/EmailAuth.jsx`, `src/pages/AppleAuth.jsx`, `src/pages/SocialAuth.jsx`, `src/App.jsx`
   Effort: 1-2 hours
   Dependency: none

6. Render or delete the unused `aiHint` copy so the auth page does not carry dead product language.
   Files to touch: `src/pages/Auth.jsx`
   Effort: 1 hour
   Dependency: none

7. Add inline password guidance and signup validation that matches the actual backend rules.
   Files to touch: `src/pages/Auth.jsx`, `src/lib/AuthContext.jsx`
   Effort: 4-8 hours
   Dependency: none

8. Give the signup success state a real next action when email confirmation is required.
   Files to touch: `src/pages/Auth.jsx`, `src/lib/emailService.js`
   Effort: 4-6 hours
   Dependency: none

9. Make the password reset flow more explicit about session state, link expiration, and retry options.
   Files to touch: `src/pages/UpdatePassword.jsx`, `src/pages/Auth.jsx`
   Effort: 4-8 hours
   Dependency: none

10. Simplify the login callback retry path so it preserves mode and destination instead of always sending users back to login.
    Files to touch: `src/pages/AuthCallback.jsx`
    Effort: 2-4 hours
    Dependency: task 1

Total effort: roughly 2-4 days for the immediate quality jump, or 1-2 weeks if you include the shared-auth refactor and future-proofing work. The biggest perceived lift comes from preserving destination intent, unifying auth behavior across the main page and onboarding, and fixing the dead CAPTCHA / callback branches.

---

## What NOT to do

1. Do **not** split login and signup into separate heavyweight pages unless routing requires it; Atlas benefits more from one coherent entry point.
2. Do **not** add workspace, admin, or role selection before authentication unless the product explicitly needs it; that would import Linear’s enterprise complexity without the same user model.
3. Do **not** let OAuth continue to ignore `next`; losing the user’s destination is one of the fastest ways to make auth feel broken.
4. Do **not** turn the auth screen into a marketing hero with too many benefits, badges, or proof points; the user came to complete access, not read a landing page.
5. Do **not** leave “security” features computed in code but not actually wired into the request path; dead CAPTCHA and dead copy create false confidence.
6. Do **not** make password reset a one-way dead end; users need a clear escape hatch back to login and a visible retry loop.

---

## The single highest-leverage thing

Preserve and surface user intent across every auth path. Today, the biggest quality gap is not the card layout or the button styling; it is that email/password, Google OAuth, onboarding signup, and password recovery do not all guarantee the same destination handoff. If Atlas fixes that one thing so the user always understands where they are going, why they are here, and what happens after submit, the whole surface will feel more trustworthy and much less brittle.

**File status:** Draft 1. To be revised after implementation against reality.
