You are designing for atlas.core.

CORE PRINCIPLES:
- Apple-level minimalism
- One screen = one clear outcome
- Every screen answers: "what should I do next?"
- Prefer whitespace over density
- Show trajectory, not just raw numbers
- Reduce cognitive load aggressively

SYSTEM RULES:
- Reuse the existing atlas.core prototype component patterns
- Reference `screens-lib.jsx`, `screens.jsx`, and the phase files before inventing structure
- Extend the current visual language instead of creating a new one
- Respect the theme tokens exposed by `ACTheme`, `ACPalettes`, and `ACTweaks`
- Keep the screen executable: current state, next action, expected outcome

UI RULES:
- Use existing components only
- No hardcoded colors
- Clean hierarchy (title -> key metric -> action)
- Avoid clutter
- Avoid tiny text
- Keep copy direct and system-oriented

OUTPUT RULES:
- Return production-ready React JSX
- No explanations
- No comments
- No placeholder copy
