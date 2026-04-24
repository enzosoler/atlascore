# Atlas Core Email System Source Of Truth

This file is the canonical implementation spec for the atlas.core email system.

Codex must read this file before writing or modifying any email template, renderer, preview, or email-related copy structure.

If a value is not defined here, Codex must not invent it.

## Purpose

Build the email system from:

`tokens -> components -> templates -> renderer -> previews`

Do not build from taste, screenshots, or inferred design decisions.

## Required Read Order

Before writing code for emails, read in this order:

1. `docs/email-system/EMAIL_SYSTEM_SOURCE_OF_TRUTH.md`
2. `CLAUDE.md` email sections
3. `supabase/functions/_shared/templates.ts`
4. `docs/email-rebuild/email-approval-preview.html`

## Implementation Directive

Use Stitch screenshots only as visual reference, never as the implementation source.

Do not infer design from screenshots.

Implement the atlas.core email system exactly from this source-of-truth spec.

## Brand Tokens

```text
paper: #efe9da
ink: #0a0a0a
sulfur: #e8b500
wordmark: atlas + sulfur dot + core
```

## Typography Rules

```text
headline: heavy, editorial, tight tracking
body: clean sans, readable
meta/footer: mono, uppercase, spaced
```

## Component Rules

All email templates must be assembled from the same component system:

```text
header
eyebrow
headline
body
CTA
data block
founder signature
system footer
```

No template may introduce a new structural block unless this file is updated first.

## Canonical Layout Structure

All emails must follow this exact structure:

```text
1. Header (wordmark)
2. Optional hero / image (only for founder emails)
3. Eyebrow label
4. Headline
5. Body (1–2 paragraphs max)
6. CTA
7. Optional data block (OTP / status)
8. Optional founder signature (founder emails only)
9. Footer (system)
```

Rules:

```text
order cannot change
components cannot be skipped except where explicitly optional
spacing must follow the same rhythm across all templates
```

## Voice Rules

```text
Founder emails = human, restrained, signed by Enzo
System emails = no person, no photo, functional product voice
```

## Forbidden Rules

```text
no Stitch code
no absolute positioning
no z-index
no flex/grid
no cyan/obsidian
no invented colors
no new layouts
```

## Renderer Rules

Build email-safe HTML only:

```text
table-based
inline CSS
no absolute positioning
no z-index
no flex
no grid
no external CSS
```

All emails must use the same tokens and components.

## Canonical Email List

The email system must support these canonical templates:

```text
welcome
onboarding check-in
confirm identity
reset password
email confirmation
magic login
security alert
trial ending
trial ended
subscription activated
payment failed
billing receipt
```

## Authoring Rule

When generating or modifying email code, prefer:

1. shared tokens
2. shared components
3. template data
4. one reusable renderer
5. preview outputs

Never start from layout invention.
