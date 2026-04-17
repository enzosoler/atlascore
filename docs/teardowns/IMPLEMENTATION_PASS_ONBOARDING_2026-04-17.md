# Atlas Teardown Implementation Pass — Onboarding & Auth — 2026-04-17

This file is the implementation spec for the onboarding/auth redesign batch.

## SURFACE: Welcome / Splash

1. REFERENCE APP
- Duolingo

2. WHAT TO COPY (EXACT PATTERNS)
- Full-screen hero with one obvious next step
- Tiny brand mark at top
- Central identity anchor
- One bold promise line
- One short support line
- One full-width bottom CTA
- One plain text login link
- No carousel, no skip, no competing secondary cards

3. TARGET STRUCTURE (TOP -> BOTTOM)
- Top: tiny Atlas logo row
  - Purpose: brand anchor only
  - Component: compact logo row
  - CTA: none
  - Density: tight
- Center: athlete/avatar hero
  - Purpose: emotional entry and product identity
  - Component: large avatar/illustration block
  - CTA: none
  - Density: loose
- Below hero: one-line promise + one support line
  - Purpose: tell the user what Atlas does in seconds
  - Component: headline and subtext
  - CTA: none
  - Density: medium
- Bottom sticky rail: primary CTA + plain login link
  - Purpose: start onboarding immediately or let returning users enter auth
  - Component: full-width button and text link
  - CTA priority: primary button first, login link second
  - Density: medium

4. INTERACTIONS
- Primary CTA -> mark welcome seen and go to onboarding
- Login link -> auth login mode
- No scrolling
- No slide gestures

5. STATE HANDLING
- Loading: none, static instant render
- Empty: not applicable
- Error: not applicable
- Offline: fully works, static route

## SURFACE: Sign up / Log in

1. REFERENCE APP
- Linear

2. WHAT TO COPY (EXACT PATTERNS)
- One centered access container
- Minimal brand chrome
- Strong whitespace
- Email-first form hierarchy
- One dominant continue CTA
- Apple/Google secondary below divider
- Plain routing copy below the card
- No marketing grid or multi-section layout

3. TARGET STRUCTURE (TOP -> BOTTOM)
- Top: compact logo only
  - Purpose: orientation
  - Component: tiny centered logo
- Middle: auth card
  - Purpose: complete access with minimal friction
  - Component: centered card
  - Density: medium
- Inside card, top: eyebrow + title + one-line destination note if present
  - Purpose: explain mode and preserved intent
  - Component: text block
- Inside card, middle: email-first form
  - Purpose: get the user through access with one primary action
  - Component: inputs
  - Placement:
    - signup: full name, email, password
    - login: email, password
    - recovery: email only
- Inside card, below form: primary CTA
  - Purpose: continue
  - Component: full-width button
- Inside card, below divider: Apple + Google buttons
  - Purpose: fast secondary access
  - Component: stacked social buttons
- Bottom: mode switch + forgot-password or back link
  - Purpose: low-friction navigation
  - Component: plain text links

4. INTERACTIONS
- Continue -> login/signup
- Google/Apple -> OAuth callback preserving destination intent
- Forgot password -> recovery mode in same card
- Mode switch -> swap login/signup without leaving route

5. STATE HANDLING
- Loading: spinner in CTA, buttons disabled
- Success:
  - signup with email confirmation -> inline success banner
  - auth callback -> short success state then redirect
- Error: inline banner inside card
- Offline: keep form visible, show operational error on submit

## SURFACE: Onboarding V2

1. REFERENCE APP
- Cal AI (primary)
- Noom (secondary)

2. WHAT TO COPY (EXACT PATTERNS)
- One decision per screen
- Top progress bar
- Small helper text under questions
- Reassurance around sensitive questions
- “We’re building your plan” loader
- Projection/result preview before paywall
- Calm support language after high-friction moments

3. TARGET STRUCTURE (TOP -> BOTTOM)
- Top: thin progress rail
  - Purpose: show bounded journey
  - Component: progress bar + back button when needed
  - Density: tight
- Main: single decision screen
  - Purpose: one answer at a time
  - Component: one of select chips, numeric input, body choice, or interstitial
  - Density: medium
- Helper zone under title
  - Purpose: explain why the answer matters
  - Component: short helper line or reassurance line
- Bottom sticky CTA
  - Purpose: continue when the screen is not auto-advancing
  - Component: full-width button
  - Density: medium

4. INTERACTIONS
- Single-select -> auto-advance where appropriate
- Multi-select -> choose then continue
- Numeric/body-stats -> fill inputs then continue
- Building screen -> auto-advance after staged progress
- Projection screen -> reveal result, then continue

5. STATE HANDLING
- Loading: onboarding page-level loading state before engine mount
- Empty: not applicable
- Error: page-level auth error before flow mount
- Resume: onboarding draft survives OAuth return

## SURFACE: Post-onboarding paywall

1. REFERENCE APP
- Cal AI
- Fastic

2. WHAT TO COPY (EXACT PATTERNS)
- Value-first headline
- Trial timeline card
- One highlighted default plan
- Plan selector directly above CTA
- 3–5 benefit bullets
- Light proof row
- One dominant CTA
- Restore + legal secondary

3. TARGET STRUCTURE (TOP -> BOTTOM)
- Top: eyebrow + value headline + one-line support copy
  - Purpose: reconnect purchase to the user’s plan
  - Component: compact text stack
- Below: trial timeline card
  - Purpose: state exactly what happens today, reminder point, billing point
  - Component: vertical timeline
- Below: benefits stack
  - Purpose: justify the paid plan
  - Component: 3 benefit rows
- Below: plan selector
  - Purpose: choose billing cadence
  - Component: stacked plan cards with one highlighted default
- Below: proof row
  - Purpose: low-noise trust cue
  - Component: compact stat/trust strip
- Bottom: dominant CTA
  - Purpose: start trial or continue to account setup
  - Component: full-width button
- Bottom secondary: restore + legal
  - Purpose: recovery and terms
  - Component: text links

4. INTERACTIONS
- Select plan -> updates selection and persisted onboarding answer
- CTA native -> purchase selected package
- CTA web -> continue to account setup with selected plan preserved
- Restore -> restore purchases

5. STATE HANDLING
- Loading: skeleton pricing card while store offerings load
- Empty: not applicable
- Error: inline paywall error under timeline/selector
- Native/web contract:
  - one trial story
  - one highlighted default plan
  - legal secondary
