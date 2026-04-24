# Mobile Auth Findings

## Conclusion

The captured iPhone block looks like the same root cause as desktop, not a clearly separate mobile-only auth failure.

## Evidence

- The iPhone artifact and the Chromium artifact show the same post-submit state in `error-context.md`: the signup form remains on `/auth/signup`, fields stay populated, and the hint reads "Check your inbox and confirm your email, then come back and sign in."
- The iPhone screenshot in `test-results/loop-integrity-Real-user-l-2e205----Today---actions---reload-iphone-14/test-failed-1.png` shows the CTA visible and tappable on-screen. There is no obvious clipped button, off-screen form, modal overlay, or broken viewport state at the failure moment.
- The signup route uses the same `signUp()` path on all form factors and only branches on the backend result:
  - [`src/redesign/v3/routes/V3AuthSignup.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthSignup.jsx:45)
  - [`src/lib/AuthContext.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/AuthContext.jsx:353)
- If Supabase returns a user without session, the UI intentionally stays on signup and swaps the hint to email-confirmation copy. That matches both artifacts exactly.

## Mobile-specific risk assessment

No mobile-only bug is proven by the captured failure, but iPhone-specific UX risk is still present in the current auth layout:

- `V3StandaloneLayout` pins the native/dev auth surface to `height: 100dvh` with `overflow: hidden`, which means the screen cannot scroll if the iPhone keyboard compresses the visual viewport.
  - [`src/redesign/v3/layouts/V3StandaloneLayout.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/layouts/V3StandaloneLayout.jsx:82)
  - [`src/redesign/v3/layouts/V3StandaloneLayout.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/layouts/V3StandaloneLayout.jsx:85)
- The auth form itself is a full-height flex column with no internal `overflowY: auto`, so lower controls can become unreachable on smaller iPhones or when the keyboard is open.
  - [`src/redesign/v3/screens/S36_Auth.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/screens/S36_Auth.jsx:59)
- The email field uses `autoFocus`, which can trigger the keyboard immediately on iPhone and make the initial layout more fragile.
  - [`src/redesign/v3/screens/S36_Auth.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/screens/S36_Auth.jsx:158)
- The signup password field uses `autoComplete="current-password"` instead of `new-password`, which can cause worse password-manager/autofill behavior on mobile.
  - [`src/redesign/v3/screens/S36_Auth.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/screens/S36_Auth.jsx:210)

## Answer

Based on the current artifacts, this block appears to be the same root cause as desktop. A separate mobile-specific bug is possible at the UX layer, especially around keyboard and non-scrollable viewport behavior, but it is not the primary explanation for this captured failure.
