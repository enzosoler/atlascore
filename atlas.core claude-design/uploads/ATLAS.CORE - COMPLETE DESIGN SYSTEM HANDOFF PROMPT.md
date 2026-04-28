# ATLAS.CORE — COMPLETE DESIGN SYSTEM HANDOFF PROMPT
## For Claude.ai/design (Optimized for Token Efficiency & Maximum Output)

---

## CONTEXT: BRAND FOUNDATION (Reference Only)

**Product**: Atlas.Core — AI-powered fitness coaching app (iOS-first, Android, web)

**Visual Language**: Calm, analytical, editorial. Built for people who measure.

**Color System**: 
- **Ink** (#1a1a1a) — primary text, UI
- **Paper** (#fafaf8) — backgrounds
- **Sulfur** (#f5c211) — accent, highlights

**Typography**:
- Display: Archivo Black (headlines)
- Body: Inter (UI copy)
- Mono: IBM Plex Mono (data, code)

**Mark**: Filled heart with ECG trace across midline (never tilted, never outlined, never gradient)

**Existing Assets**: 107 designed screens, data model, feature specs, component library (React JSX)

---

## TASK: DESIGN ALL MISSING LAYERS

### LAYER 1: ICON LIBRARY (60 Icons, SVG)

Design a cohesive icon set for health/fitness/data contexts. All icons must:
- Fit 24×24 grid with 2px stroke
- Work at 16px, 24px, 32px, 48px sizes
- Support regular & bold weights
- Use Ink color only (no fills, stroke-based)
- Follow Apple SF Symbols aesthetic (minimal, geometric, consistent weight)

**Icon Categories** (60 total):

*Navigation (8)*: home, search, settings, menu, back, close, notifications, profile

*Training (12)*: dumbbell, barbell, kettlebell, cable, machine, bodyweight, timer, stopwatch, rest, pr-badge, volume, intensity

*Nutrition (10)*: apple, water, protein, carbs, fats, calories, meal, plate, utensils, macros

*Body (8)*: weight, scale, heart, blood-pressure, temperature, lab-flask, chart-line, trending-up

*Protocols (6)*: pill, calendar, dose, check, clock, repeat

*Coach (6)*: chat, message, user, team, crown, star

*Platform (10)*: download, upload, share, export, sync, offline, error, warning, info, help

---

### LAYER 2: COMPONENT SPECS (15 Core Components)

For each component, provide:
1. **Visual design** (light + dark mode)
2. **State variants** (default, hover, active, disabled, loading, error)
3. **React code snippet** (TypeScript, ~20 lines)
4. **Accessibility notes** (ARIA, keyboard nav, focus states)
5. **Animation spec** (if applicable: duration, easing, trigger)

**Components**:

1. **Button** (primary, secondary, tertiary, ghost)
2. **Input Field** (text, email, password, number, with validation states)
3. **Chip/Tag** (dismissible, selectable, with icon)
4. **Card** (elevated, flat, with image, with actions)
5. **List Row** (with avatar, with toggle, with badge, with action menu)
6. **Modal/Dialog** (confirm, alert, form modal)
7. **Toast Notification** (success, error, warning, info)
8. **Segmented Control** (2–4 options, icon + text)
9. **Toggle Switch** (on/off, with label)
10. **Dropdown/Select** (single, multi, searchable)
11. **Slider/Range** (single value, range, with labels)
12. **Progress Ring** (indeterminate, determinate, with label)
13. **Tab Bar** (5 tabs, with badges, active indicator)
14. **Skeleton Loader** (text lines, card, list rows)
15. **Stepper/Form Progress** (numbered steps, linear flow)

---

### LAYER 3: DESIGN TOKENS (Export Format)

Provide tokens in **JSON** and **CSS** formats:

```json
{
  "color": {
    "ink": "#1a1a1a",
    "paper": "#fafaf8",
    "sulfur": "#f5c211",
    "gray-50": "#f9f9f7",
    "gray-100": "#f0efe8",
    "gray-200": "#e8e6e0",
    "gray-300": "#d9d5cc",
    "gray-400": "#c5bfb3",
    "gray-500": "#9d9690",
    "gray-600": "#6b6560",
    "gray-700": "#4a4540",
    "gray-800": "#2d2a27",
    "gray-900": "#1a1a1a"
  },
  "spacing": {
    "0": "0",
    "2": "2px",
    "4": "4px",
    "8": "8px",
    "12": "12px",
    "16": "16px",
    "20": "20px",
    "24": "24px",
    "32": "32px",
    "40": "40px",
    "48": "48px"
  },
  "radius": {
    "0": "0",
    "2": "2px",
    "4": "4px",
    "8": "8px",
    "12": "12px",
    "16": "16px"
  },
  "typography": {
    "display-lg": { "family": "Archivo Black", "size": "32px", "weight": 900, "lineHeight": 1.2 },
    "display-md": { "family": "Archivo Black", "size": "24px", "weight": 900, "lineHeight": 1.25 },
    "headline": { "family": "Inter", "size": "18px", "weight": 600, "lineHeight": 1.4 },
    "body-lg": { "family": "Inter", "size": "16px", "weight": 400, "lineHeight": 1.5 },
    "body": { "family": "Inter", "size": "14px", "weight": 400, "lineHeight": 1.5 },
    "label": { "family": "Inter", "size": "12px", "weight": 500, "lineHeight": 1.4 },
    "mono": { "family": "IBM Plex Mono", "size": "12px", "weight": 400, "lineHeight": 1.5 }
  },
  "shadow": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px rgba(0,0,0,0.1)",
    "lg": "0 10px 15px rgba(0,0,0,0.1)"
  },
  "animation": {
    "fast": "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    "base": "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    "slow": "350ms cubic-bezier(0.4, 0, 0.2, 1)"
  }
}
```

---

### LAYER 4: RESPONSIVE DESIGN SPECS

Define breakpoints & layouts:

**Mobile** (375px): Single column, full-width cards, bottom sheet modals
**Tablet** (768px): Two-column grid, side navigation, split view
**Desktop** (1280px+): Three-column grid, left sidebar (coach console), right panel

Provide 3 key screens redesigned for each breakpoint (e.g., Today, Workout, Coach).

---

### LAYER 5: ACCESSIBILITY COMPLIANCE

**WCAG 2.1 AA Checklist**:
- Color contrast ratios (all text ≥ 4.5:1 for body, ≥ 3:1 for large text)
- Focus states (visible 2px outline, 2px offset)
- Keyboard navigation (Tab order, Enter/Space triggers, Escape closes)
- Screen reader labels (aria-label, aria-describedby, role attributes)
- Motion (prefers-reduced-motion support, no auto-play)
- Form validation (error messages, required indicators, inline hints)

Provide a11y specs for 5 critical screens (auth, onboarding, today, workout, coach).

---

### LAYER 6: ERROR & EMPTY STATES

Design 3 variants for each:

**Error States**: Network error, server error (500), validation error, permission denied
**Empty States**: No workouts logged, no meals, no labs, no coach messages, no crew
**Loading States**: Skeleton screens for 5 key screens, progress indicators

---

### LAYER 7: DARK MODE & HIGH-CONTRAST VARIANTS

**Dark Mode Palette**:
- Ink → Paper (inverted)
- Paper → Ink (inverted)
- Sulfur → Sulfur (same, but lighter if needed)
- Gray scale adjusted for OLED

**High-Contrast Variant**:
- Increase color contrast to WCAG AAA (≥ 7:1)
- Thicker strokes for icons
- Bolder typography weights

Provide dark mode + high-contrast versions of 5 key screens.

---

### LAYER 8: MICRO-INTERACTIONS & FEEDBACK

Specify for 10 key interactions:

1. **Button press** → scale down 2%, haptic feedback (iOS)
2. **Form submission** → loading spinner, disable button, success toast
3. **Swipe to delete** → reveal delete button, confirm on tap
4. **Pull to refresh** → spinner animation, haptic on refresh complete
5. **Set logged** → PR badge animation (scale + fade in), confetti (optional)
6. **Session complete** → slide-up modal, celebration animation
7. **Error toast** → shake animation, 4s auto-dismiss
8. **Tab switch** → fade transition (150ms), preserve scroll position
9. **Modal open** → backdrop fade in (150ms), modal slide up (250ms)
10. **Notification badge** → pulse animation on new message

Provide: trigger condition, animation duration, easing, haptic feedback (if iOS).

---

### LAYER 9: DATA VISUALIZATION SPECS

Design chart components for 5 use cases:

1. **Volume Over Time** (line chart) — 12-week trend with current session highlight
2. **Macro Breakdown** (pie chart) — protein/carbs/fats distribution
3. **Body Weight Trend** (area chart) — weekly average with trend line
4. **Readiness Score** (circular gauge) — 0–100 scale with color zones
5. **Workout Frequency** (bar chart) — sessions per week, 4-week rolling

Specs: color scheme, axis labels, legend, data point interactions (hover tooltip), responsive sizing.

---

### LAYER 10: VC PITCH DECK SLIDES (15 Slides)

Design a 15-slide deck for Series A fundraising. Each slide must:
- Use Atlas.Core brand (mark, palette, typography)
- Be visually sophisticated (data viz, charts, infographics)
- Fit 16:9 widescreen
- Include speaker notes (100 words per slide)

**Slide Outline**:

1. **Cover** — Mark, product name, tagline, date
2. **Problem** — Health data fragmentation, coaching inaccessibility, data privacy concerns
3. **Market Size** — TAM/SAM/SOM (fitness tracking, coaching, health tech)
4. **Solution** — Atlas.Core value prop (AI coach, privacy-first, offline-first)
5. **Product Demo** — 3 key screens (Today, Workout, Coach) with annotations
6. **Business Model** — Freemium (free tier) → Pro ($9.99/mo) → Sponsored partnerships
7. **Traction** — User growth, retention, NPS, early revenue (use realistic/projected numbers)
8. **Competitive Landscape** — Positioning vs. Apple Fitness+, Peloton, Fitbod, Trainerize
9. **Go-to-Market** — Launch strategy, distribution channels, partnerships
10. **Team** — Founder bios, relevant experience (3–4 key roles)
11. **Financial Projections** — 3-year revenue forecast, unit economics, burn rate
12. **Funding Ask** — Amount, use of funds (product, marketing, team)
13. **Key Metrics** — DAU, MAU, retention, LTV/CAC ratio, cohort analysis
14. **Roadmap** — 12-month product roadmap (phases, key features)
15. **Closing** — Vision statement, call to action, contact info

---

## OUTPUT REQUIREMENTS

Deliver all assets as:

1. **Icons**: SVG files (60 icons, organized by category)
2. **Components**: React TSX files (15 components, with Storybook-style variants)
3. **Tokens**: JSON + CSS files
4. **Specs**: Markdown documents (responsive, a11y, error states, micro-interactions, data viz)
5. **Dark Mode**: CSS overrides or Figma variants
6. **VC Deck**: 15-slide Figma design (export as PDF + PNG per slide)

---

## DESIGN PRINCIPLES (Apply to All Layers)

- **Minimal**: Remove all non-essential elements. Every pixel serves a purpose.
- **Consistent**: Reuse spacing, colors, typography across all components.
- **Accessible**: WCAG 2.1 AA compliance by default. Test with screen readers.
- **Responsive**: Mobile-first design. Scale gracefully to tablet & desktop.
- **Performant**: Optimize SVGs. Use CSS animations, not JavaScript.
- **Documented**: Every component has usage guidelines, do's & don'ts, code examples.

---

## TONE & VOICE (For Copy in Slides & Error Messages)

- **Calm**: No urgency, no hype. Speak like a coach, not a marketer.
- **Analytical**: Data-driven language. Show numbers, trends, insights.
- **Editorial**: Sophisticated, slightly formal. Avoid jargon.
- **Empowering**: Help users feel in control of their health data.

---

## QUICK REFERENCE: EXISTING ASSETS TO REFERENCE

- **Design System**: 107 screens, component library (React JSX), brand sheet
- **Data Model**: User, Profile, Program, Exercise, Workout, Meal, Lab, Protocol, Coach entities
- **Features**: 8 domains (auth, onboarding, training, nutrition, body, protocols, coach, billing)
- **Tone**: "A health operating system — calm, analytical, and editorial."

---

## SUCCESS CRITERIA

✓ All 60 icons are cohesive, scalable, and work at 16px–48px
✓ 15 components have light + dark variants, all states, code examples, a11y specs
✓ Tokens are production-ready (JSON + CSS)
✓ Responsive specs cover mobile, tablet, desktop with 3 key screens each
✓ A11y checklist is WCAG 2.1 AA compliant
✓ Error/empty/loading states are designed for 5+ screens
✓ Dark mode + high-contrast variants are visually distinct
✓ 10 micro-interactions are specified with timings & haptics
✓ 5 data visualization components are designed & documented
✓ VC deck is 15 slides, visually sophisticated, on-brand, with speaker notes

---

## BONUS: IF TIME PERMITS

- Figma component library (auto-layout, variants, documentation)
- Lottie animations for 5 key micro-interactions
- Storybook setup with component stories
- Accessibility audit report (WAVE, Axe, manual testing)
- Performance optimization guide (image formats, bundle size budgets)

---

## FINAL NOTE

This prompt is designed to maximize design output while minimizing token usage. Focus on:
1. **Reusability**: Design once, apply everywhere
2. **Clarity**: Show, don't tell. Use visuals + minimal text
3. **Efficiency**: Batch similar tasks (e.g., all icons at once, all components at once)
4. **Quality**: Sophisticated, production-ready designs. No placeholders.

**Ready to ship.**
