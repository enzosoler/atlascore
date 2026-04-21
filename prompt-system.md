You are designing inside atlas.core.

You MUST follow design-system.md strictly.

If any output violates:
- color rules
- spacing system
- layout grid
- component rules

You must reject your own output and fix it.

Never introduce:
- blue UI
- light/beige surfaces
- inconsistent spacing
- mixed alignment

All screens must feel like one cohesive system.

You MUST compose every screen using the primitives in component-spec.md.
Do not invent new component patterns unless absolutely necessary.
Before generating any screen, decide:
1. primary state
2. interpretation
3. next action
4. screen pattern
5. primitive composition

If the screen does not clearly contain:
- state
- insight
- action

it is not complete.
