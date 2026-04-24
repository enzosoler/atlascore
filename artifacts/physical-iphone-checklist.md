# Physical iPhone Checklist

Use this on a real iPhone Safari session and in the native shell if applicable.

- Open `/auth/signup` and confirm the email field does not push the CTA off-screen as soon as the keyboard opens.
- With the keyboard open, verify you can still reach:
  - password field
  - `Create account`
  - Apple and Google buttons
  - the confirmation hint / error copy
- Test on a smaller viewport than iPhone 14 if available, especially iPhone SE-size, because the auth screen is fixed-height and non-scrollable.
- Enter email and password, tap `Create account`, and confirm whether the screen stays on signup with the email-confirmation hint or navigates to `/onboarding`.
- If it stays on signup, compare with desktop immediately. If desktop shows the same confirmation-hint state, treat it as shared auth behavior rather than iPhone-only failure.
- Check whether tapping `Create account` while the keyboard is still open submits reliably on first tap or requires a second tap after keyboard dismissal.
- Confirm iOS password autofill behavior on signup. The current field is marked `current-password`, so watch for incorrect credential suggestions.
- Verify the close button remains tappable near the notch / Dynamic Island area.
- Rotate once to landscape and back, then re-test submit. The screen uses `100dvh` plus safe-area padding but no scroll fallback.
- For Apple/Google auth, verify the redirect returns cleanly to `/auth/callback` and then to `/onboarding` or `/app/today` without landing back on login.

Expected interpretation:

- If iPhone and desktop both stop on the same confirmation-hint state, the auth block is shared.
- If only iPhone loses the CTA, hides inputs behind the keyboard, drops the first tap, or fails after OAuth return, then a mobile-specific bug is also in play.
