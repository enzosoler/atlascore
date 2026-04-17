# Teardown Template

Every teardown produced by a subagent MUST follow this exact structure. Do not add, remove, or reorder sections. If a section genuinely doesn't apply to a surface (rare), write "N/A for this surface" with a one-sentence reason — do not omit.

---

# Teardown {NN} — {Surface Name}

**Surface:** {one-line description of what this screen/feature is}
**Atlas file(s):** {comma-separated list of file paths found in the codebase that implement this surface. If none found, write "not yet implemented" and note where it would live.}
**Reference apps:** {primary app} (primary){, {secondary app} (secondary) if applicable}
**Audience tension:** {High / Medium / Low} — {one sentence on the serious-vs-general-user tension for this specific surface}

---

## Why this screen matters

{2-3 short paragraphs. Cover: what role does this surface play in the Atlas user journey, what's the revenue/retention impact of getting it right vs wrong, what does "broken" look like for this surface, what does "world-class" look like. Concrete, not abstract.}

---

## Reference app 1 — {primary reference} (primary)

{One paragraph framing why this app is the right reference for this specific surface. Name the audience the reference app serves and whether it matches Atlas's audience exactly or partially.}

### What {primary reference} does that works

{Numbered list of 5-8 specific patterns. Each pattern: bold label in 2-4 words, then 2-4 sentences explaining the pattern and WHY it works. Be specific — "uses a bottom sheet that slides up" not "has good layout". If you can cite a specific screen or interaction by name, do so.}

### What {primary reference} does that you shouldn't copy

{Numbered list of 2-4 items. Patterns that work for the reference app but would NOT work for Atlas. Explain why in 1-2 sentences each. This section is mandatory — every app has patterns that don't translate, and naming them prevents the subagent from doing a lazy copy-paste later.}

---

## Reference app 2 — {secondary reference} (secondary)

{Only include this section if a secondary reference was listed in the inventory. Shorter than primary — 3-5 patterns to steal, 1-2 patterns not to copy. Frame why the secondary adds something the primary misses.}

---

## What Atlas does today (current state)

{Read the actual file(s) listed at the top of this document. Do not guess. Report concretely on:}

- Layout and navigation structure (where does this surface live in the app, how is it entered, how is it dismissed)
- Key interactions (what can the user do on this surface)
- Visual approach (colors, typography, density — describe, don't redesign)
- Known issues from code reading (stub handlers, TODOs, unused imports suggesting abandoned work, obvious bugs)
- Gaps relative to the reference app (specific missing features/patterns)

If a file is missing or empty, state that plainly. Do not fabricate current state.

---

## Patterns to steal, ranked by ROI

Three buckets, using traffic-light emoji:

### 🟢 Steal immediately — high impact, low effort

{Numbered list of 3-5 patterns. Each: bold label, 2-3 sentences on what to steal and how. Include a rough effort estimate in hours or days at the end of each.}

### 🟡 Steal soon — medium impact, medium effort

{Numbered list of 2-4 patterns. Same format.}

### 🔴 Consider carefully — high effort or audience-dependent

{Numbered list of 1-3 patterns. Same format. These are patterns that need a product decision, not just an engineering decision.}

---

## Atlas-specific design tensions to resolve

{2-4 tensions unique to this surface. Each tension has a name, a 2-sentence description of the conflict, and a one-paragraph recommendation that resolves it. The recommendation must be opinionated, not "it depends".}

**Tension 1 — {Name}.**
{Description.} *Resolution:* {opinionated recommendation}.

{... repeat for each tension ...}

---

## Specific changes to make (actionable list)

Ordered list of implementation tasks. Each task:
- What to do (one sentence, imperative mood — "Add streaming support to the edge function")
- File(s) to touch (from the current state reading)
- Effort estimate in hours or days
- Dependency on any other numbered task (if any)

Aim for 8-15 items. If there are fewer than 5 meaningful changes, the surface is probably already close to best-in-class; note that at the end. If there are more than 20, prioritize and list only the top 15.

After the list, give a total effort estimate and call out the 3-5 items that produce the biggest jump in perceived quality.

---

## What NOT to do

Numbered list of 3-6 items. Specific anti-patterns to avoid for THIS surface. Include things competitors do that seem good but aren't, things that would conflict with Atlas's positioning, and things that sound cool but actually hurt retention. Each item: one sentence, "Do **not**..." format.

---

## The single highest-leverage thing

One paragraph. If the team only did one thing from this entire teardown, what should it be and why? This is the most important paragraph in the document. It must be specific, concrete, and defensible — not a platitude like "make it feel premium".

---

**File status:** Draft 1. To be revised after implementation against reality.
