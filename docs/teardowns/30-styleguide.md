# Teardown 30 — Styleguide

**Surface:** Dev-only design system reference for inspecting Atlas tokens and shadcn/Radix component states.
**Atlas file(s):** src/pages/styleguide/StyleguidePage.jsx, src/pages/styleguide/ColorBlock.jsx, src/App.jsx, src/components/ui/button.jsx, src/components/ui/input.jsx, src/components/ui/textarea.jsx, src/components/ui/card.jsx, src/components/ui/select.jsx, src/index.css, src/i18n/messages/en.json, src/i18n/messages/pt-BR.json, src/i18n/messages/es.json
**Reference apps:** Shadcn docs (primary), Radix docs (secondary)
**Audience tension:** Low — this is an internal builder surface, so the real tradeoff is speed and fidelity for designers/devs, not broad consumer readability.

---

## Why this screen matters

This page is the local source of truth for Atlas’s visual system. It is not a customer-facing feature, but it shapes every customer-facing screen because it tells the team which tokens, components, and states are considered valid.

If this surface is weak, the cost shows up elsewhere: people guess at colors, invent one-off spacing, or skip component conventions because the reference is too thin to trust. That creates inconsistency in the product and makes design/implementation reviews slower, not faster.

World-class here means a developer or designer can open one route, inspect the actual token names and component states, and answer “what should I use?” without hunting through CSS, component files, or screenshots.

---

## Reference app 1 — Shadcn docs (primary)

Shadcn docs is the best primary reference because it serves the same kind of user Atlas needs here: a builder who wants to move from a component name to a working implementation quickly. It is not exactly Atlas’s audience, because Atlas’s styleguide is internal rather than public, but the interaction model matches well.

### What Shadcn does that works

1. **Example first.** Each component page opens with a live example before any deep explanation. That makes the page immediately useful and keeps the docs grounded in what the component actually looks like.
2. **Copyable usage.** The install and usage snippets sit directly beside the component preview, so the path from “I need this” to “I can ship this” is short. That reduces drift between design intent and implementation.
3. **Variant mapping.** Button docs break the component into explicit size and variant examples, which makes the API legible at a glance. For a design system, showing states visually is more durable than describing them in prose.
4. **Composition clarity.** Select docs show the component tree and then reuse that tree in examples. That helps teams understand both the primitive API and how to assemble it correctly.
5. **State coverage.** The docs include disabled, icon, rounded, spinner, and as-child examples for Button. That is valuable because teams usually need edge states more than the default state.
6. **Accessibility notes.** The pages call out behavioral details such as keyboard support and RTL expectations. That keeps the docs from being purely cosmetic.

### What Shadcn does that you shouldn't copy

1. **Public-docs verbosity.** The install-command and package-manager tabs are useful for external consumers, but they waste space in an internal Atlas styleguide. Atlas should optimize for inspection, not onboarding strangers.
2. **Too much tutorial framing.** Shadcn can afford a longer explanatory flow because the page is documentation. Atlas should not turn the styleguide into a mini course; it needs to stay fast to scan.
3. **Generic examples.** Fruit, theme, and system-level demo content is fine for docs, but Atlas should show the product’s actual token semantics and internal conventions instead of generic sample nouns.

---

## Reference app 2 — Radix docs (secondary)

Radix adds the primitive-level reference that Shadcn does not fully emphasize. It is especially useful for Atlas’s internal styleguide because many of the Atlas components are wrappers around Radix behavior, so the most important details are often accessibility and focus management rather than just appearance.

### What Radix does that works

1. **Anatomy diagrams.** Radix explains a component as a set of parts, not just a black-box widget. That is useful for primitives like Select where the trigger, content, viewport, and items matter.
2. **Keyboard behavior.** The Select docs spell out arrow, enter, escape, and space behavior. That makes the component safe to implement and easier to debug.
3. **Accessibility framing.** Radix explains why the primitive is accessible, not just that it is. That matters for internal systems because teams need to trust that the UI building blocks are sound.
4. **Grouped and complex examples.** Radix shows grouped items, complex item content, and controlled values. Those examples are the real-life cases teams eventually hit.

### What Radix does that you shouldn't copy

1. **Exhaustive prop tables.** That level of API detail is useful for a primitive library, but Atlas’s styleguide should not mirror it unless the page becomes a true documentation hub.
2. **Low-context abstraction.** Radix intentionally stays generic. Atlas should not do that; it needs to show the brand’s actual tokens, cards, radii, and button conventions.

---

## What Atlas does today (current state)

- **Layout and navigation structure:** `StyleguidePage` renders a single full-screen page inside a centered `max-w-2xl` column with generous vertical spacing. It is only routed in dev builds via `/styleguide` in `src/App.jsx`, and there is no visible in-app nav entry or built-in dismiss control beyond leaving the route or using browser back.
- **Key interactions:** The page is mostly a static gallery of live component examples. It renders token swatches, button variants, inputs, a textarea, a Radix select, radius chips, and shadow samples, but none of the demos are wired to application state, form submission, or copy actions.
- **Visual approach:** The page uses the app background token, uppercase section labels, small cards, and compact grids. Typography is restrained and functional, with monospaced labels for token names and a small headline/subtitle hierarchy; the design is intentionally sparse rather than editorial.
- **Known issues from code reading:** The text labels above the input demos are plain `<label>` elements without `htmlFor`/`id` pairing, so they are not actually associated with the controls. The select demo is also unlabeled at the control level, and the “ring” swatch reuses `--accent-primary` instead of a distinct ring token. The page has no stateful invalid/error examples, no copy-to-clipboard affordance, and no direct link from the main app shell.
- **Gaps relative to the reference app:** Compared with Shadcn and Radix, the page lacks component anatomy, code/usage snippets, keyboard guidance, controlled examples, and explicit accessibility notes. It shows what the components look like, but not enough about how they are meant to be used or why the primitives behave the way they do.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Real field labeling.** Wire the demo labels to the controls with `htmlFor`/`id`, and give the select a real accessible label. This is the cheapest fix that makes the page feel trustworthy instead of decorative. Effort: 2-4 hours.
2. **Visible component states.** Add explicit disabled, invalid, focus, and selected states for inputs, buttons, and select. These are the states teams forget most often, and they are exactly what a styleguide should settle. Effort: 4-6 hours.
3. **Token provenance.** Show the exact CSS variable name and sampled value for each color block, with a simple copy action. That turns the color section from a palette board into a usable reference. Effort: 4-8 hours.
4. **Controlled select example.** Make one select demo controlled so the current value is visible and predictable. It will better match how teams use Radix-based fields in real forms. Effort: 2-3 hours.

### 🟡 Steal soon — medium impact, medium effort

1. **Anatomy strip.** Add a short “parts” or “anatomy” row for Button, Input, and Select showing the underlying building blocks and the intended use of each variant. This reduces guesswork when someone is reusing the component in a new surface. Effort: 1 day.
2. **Usage snippets.** Add compact code snippets for the most important components, especially Select and Button variants. Shadcn’s docs work because the preview and the code live together; Atlas should borrow that relationship even if the docs stay internal. Effort: 1 day.
3. **Accessibility notes.** Add one-line notes for keyboard behavior and label requirements near the select/input demos. This is a small addition with outsized payoff because internal misuse usually comes from missing behavior context, not missing visuals. Effort: 4-6 hours.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Full docs navigation.** Building a browsable docs system with sections, search, and per-component pages would make the styleguide richer, but it is probably too much for a dev-only surface. Effort: 2-4 days.
2. **Theme comparison mode.** A light/dark or token-compare toggle would help QA, but only if the team truly uses the styleguide to validate theme changes. Without that need, it becomes maintenance overhead. Effort: 1-2 days.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Reference board vs documentation site.**
The current page sits between a token inventory and a component manual. If it leans too far into prose, it slows down the people who need it most; if it leans too far into swatches, it stops answering implementation questions. *Resolution:* keep it as a compact reference board with just enough annotation to explain accessibility, state, and composition.

**Tension 2 — Raw tokens vs human readability.**
The exact CSS variable names are important for engineers, but they are not enough for a designer scanning the page under time pressure. *Resolution:* always show the raw token name, but pair it with a short human label and a concrete sample state so the page can serve both audiences at once.

**Tension 3 — Internal utility vs discoverability.**
Because the route is dev-only, it is easy for the page to become invisible even when it is high value. *Resolution:* keep the route gated, but give it one stable internal entry point so the team does not have to remember the URL.

**Tension 4 — Minimal surface vs coverage.**
The current layout is intentionally compact, which is good, but too much compactness hides the cases that matter most: invalid, disabled, controlled, and grouped states. *Resolution:* add coverage through example rows, not through heavier layout chrome.

---

## Specific changes to make (actionable list)

1. Add `htmlFor`/`id` pairs to the text, disabled, textarea, and select demo labels so the examples are actually accessible. File(s) to touch: src/pages/styleguide/StyleguidePage.jsx. Effort: 2-4 hours. Dependency: none.
2. Convert the select demo into a controlled example with visible selected state and a disabled/error variant. File(s) to touch: src/pages/styleguide/StyleguidePage.jsx. Effort: 2-3 hours. Dependency: task 1.
3. Add a compact “anatomy” or “parts” subsection for Button, Input, and Select that names the parts and their intent. File(s) to touch: src/pages/styleguide/StyleguidePage.jsx. Effort: 4-6 hours. Dependency: none.
4. Expand the color section to show token value, token name, and a copy action for each swatch. File(s) to touch: src/pages/styleguide/ColorBlock.jsx, src/pages/styleguide/StyleguidePage.jsx. Effort: 4-8 hours. Dependency: none.
5. Replace the current ring sample with a true ring token sample or rename the section so it does not imply a distinct token that is not actually being shown. File(s) to touch: src/pages/styleguide/StyleguidePage.jsx, src/index.css. Effort: 1-2 hours. Dependency: none.
6. Add explicit disabled, focus, and invalid examples for the Input and Textarea components. File(s) to touch: src/pages/styleguide/StyleguidePage.jsx. Effort: 3-4 hours. Dependency: task 1.
7. Add a short keyboard-behavior note for Select covering open, close, and arrow navigation. File(s) to touch: src/pages/styleguide/StyleguidePage.jsx. Effort: 2-3 hours. Dependency: task 2.
8. Add a compact usage snippet or import hint near the Button and Select sections so the page doubles as a handoff aid. File(s) to touch: src/pages/styleguide/StyleguidePage.jsx. Effort: 1 day. Dependency: task 3.
9. Add a stable internal entry point to `/styleguide` from whatever developer or admin hub the team already uses. File(s) to touch: src/App.jsx and the chosen internal nav surface. Effort: 2-4 hours. Dependency: none.
10. Audit the styleguide against the current token set in `src/index.css` so every visible swatch maps to a real variable and nothing is implied but missing. File(s) to touch: src/pages/styleguide/StyleguidePage.jsx, src/index.css. Effort: 4-6 hours. Dependency: task 4.

Total effort: roughly 2-4 days. The biggest perceived-quality jump will come from tasks 1, 2, 4, and 3 because they make the surface simultaneously more accessible, more truthful, and more useful.

---

## What NOT to do

1. Do **not** turn this into a long-form docs site with marketing copy or install instructions; that would slow down the internal workflow.
2. Do **not** hardcode prettier colors or spacing just to make screenshots look cleaner; the point of the page is token fidelity.
3. Do **not** hide the raw CSS variable names; the team needs the exact token identifiers to use the system correctly.
4. Do **not** add overly clever interactions that make the page feel like a playground rather than a reference.
5. Do **not** mirror the main app navigation chrome here; this surface should stay lightweight and utilitarian.
6. Do **not** show only the happy path; if a state matters in production, it belongs in the styleguide.

---

## The single highest-leverage thing

Make the demos accessible and stateful before adding more sections. Right now the page proves that the Atlas tokens exist, but it does not yet prove how to use them safely: labels are not connected, select state is not explicit, and the token swatches do not give enough context to be operational. Fixing those three gaps turns the styleguide from a static gallery into a reference the team can actually trust.

**File status:** Draft 1. To be revised after implementation against reality.
