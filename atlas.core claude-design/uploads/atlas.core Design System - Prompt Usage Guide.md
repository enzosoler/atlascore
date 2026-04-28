# atlas.core Design System — Prompt Usage Guide

## Overview

You have **3 optimized Claude.ai/design prompts** designed to deliver your complete design system with maximum quality and minimum token usage.

---

## The Three Prompts

### 1. **Master Orchestration Prompt** (START HERE)
**File**: `claude-design-prompt-master.md`

**What it does**: Chains all 10 design layers together in one comprehensive execution.

**Layers**:
1. Icon library (60 icons, SVG)
2. Component library (15 components, React + Figma)
3. Design tokens (JSON + CSS)
4. Responsive design specs (mobile, tablet, desktop)
5. Accessibility compliance (WCAG 2.1 AA)
6. Error/empty/loading states
7. Dark mode & high-contrast variants
8. Micro-interactions & feedback patterns
9. Data visualization components
10. VC pitch deck (15 slides)

**When to use**: 
- You want everything in one shot
- You have time and tokens to burn
- You want maximum cohesion across all assets

**Token cost**: ~50K–80K tokens (high, but delivers complete system)

**Output**: 
- 60 SVG icons
- 15 React components (with code, Figma, Storybook docs)
- Design tokens (JSON, CSS, SCSS)
- Responsive specs (9 design variants)
- A11y audit (5 screens)
- Error/empty/loading states (15 variants)
- Dark mode variants (5 screens)
- 10 micro-interaction specs + Lottie animations
- 5 data viz components
- 15-slide VC deck (Figma + PDF + PNG + speaker notes)

---

### 2. **Design Assets Prompt** (FOCUSED)
**File**: `claude-design-prompt-main.md`

**What it does**: Focuses on design assets only (icons, components, tokens, specs, states, dark mode, micro-interactions, data viz). Excludes VC deck.

**Layers**:
1. Icon library (60 icons)
2. Component library (15 components)
3. Design tokens
4. Responsive design specs
5. Accessibility compliance
6. Error/empty/loading states
7. Dark mode & high-contrast
8. Micro-interactions
9. Data visualization

**When to use**:
- You want to ship the design system first
- You'll handle the VC deck separately
- You want faster turnaround (fewer tokens)

**Token cost**: ~35K–50K tokens (medium)

**Output**: Everything except the VC deck

---

### 3. **VC Pitch Deck Prompt** (STANDALONE)
**File**: `claude-design-prompt-vc-deck.md`

**What it does**: Designs a complete 15-slide Series A pitch deck, visually sophisticated and on-brand.

**Slides**:
1. Cover
2. Problem
3. Market Size
4. Solution
5. Product Demo
6. Business Model
7. Traction
8. Competitive Landscape
9. Go-to-Market
10. Team
11. Financial Projections
12. Funding Ask
13. Key Metrics
14. Roadmap
15. Closing

**When to use**:
- You want a standalone VC deck
- You're pitching Series A
- You want to run this separately from design assets

**Token cost**: ~15K–25K tokens (low-medium)

**Output**:
- 15-slide Figma file (editable)
- PDF export
- PNG per slide
- Speaker notes (100 words per slide)

---

## Recommended Execution Paths

### Path A: Complete System (Everything)
1. Use **Master Orchestration Prompt** (all 10 layers in one execution)
2. Done. You have everything.

**Timeline**: 1–2 hours
**Token cost**: ~50K–80K
**Result**: Complete, cohesive design system + VC deck

---

### Path B: Design System First, Deck Later
1. Use **Design Assets Prompt** (layers 1–9, no deck)
2. Later: Use **VC Pitch Deck Prompt** (standalone deck)

**Timeline**: 
- Phase 1: 1–1.5 hours (design assets)
- Phase 2: 30 min (VC deck)

**Token cost**: 
- Phase 1: ~35K–50K
- Phase 2: ~15K–25K
- Total: ~50K–75K

**Result**: Design system + VC deck (same as Path A, but staggered)

---

### Path C: Design System Only
1. Use **Design Assets Prompt** (layers 1–9, no deck)
2. Skip VC deck for now

**Timeline**: 1–1.5 hours
**Token cost**: ~35K–50K
**Result**: Complete design system (no pitch deck)

---

### Path D: VC Deck Only
1. Use **VC Pitch Deck Prompt** (standalone deck)
2. Skip design assets for now

**Timeline**: 30 min
**Token cost**: ~15K–25K
**Result**: 15-slide VC deck (no design system)

---

## How to Use These Prompts

### Step 1: Copy the Prompt
- Open the relevant prompt file (master, main, or vc-deck)
- Copy the entire content

### Step 2: Go to Claude.ai/design
- Navigate to https://claude.ai/design
- Paste the prompt into the chat

### Step 3: Add Context (Optional)
- Attach your existing design files (if any)
- Mention any specific brand guidelines or constraints
- Example: "Here's our existing brand sheet. Please ensure all designs follow this aesthetic."

### Step 4: Hit Send
- Claude will execute all layers sequentially
- Sit back and watch the magic happen

### Step 5: Download Outputs
- Figma files (editable, ready to iterate)
- SVG/PNG exports (ready to ship)
- Code files (React components, CSS, JSON)
- PDF/speaker notes (for presentations)

---

## Token Optimization Tips

### To minimize token usage:
1. **Use the Master Prompt**: It's optimized for batching. Asking for icons, then components, then tokens separately would cost more.
2. **Batch similar work**: The prompts are designed to batch (all icons at once, all components at once).
3. **Reuse patterns**: Each layer builds on the previous one. No reinvention.
4. **Minimal copy**: Specs are concise. Code examples are short.
5. **Show, don't tell**: Use visuals (charts, icons, mockups) instead of long descriptions.

### If you want to reduce token usage further:
1. **Skip dark mode**: Remove Layer 7 (saves ~5K tokens)
2. **Skip micro-interactions**: Remove Layer 8 (saves ~5K tokens)
3. **Skip data viz**: Remove Layer 9 (saves ~3K tokens)
4. **Use Design Assets Prompt instead of Master**: Saves ~15K–30K tokens (no VC deck)

---

## What You Get

### From Master Orchestration Prompt:
- 60 production-ready SVG icons
- 15 React components (TSX files with variants)
- Figma design file (components, auto-layout, variants)
- Storybook documentation
- Design tokens (JSON, CSS, SCSS)
- Responsive design specs (9 variants)
- WCAG 2.1 AA accessibility audit
- Error/empty/loading state designs
- Dark mode CSS overrides
- High-contrast variants
- 10 micro-interaction specs
- Lottie animations (5 interactions)
- 5 data visualization components
- 15-slide VC pitch deck (Figma + PDF + PNG + speaker notes)

### From Design Assets Prompt:
- Everything above except the VC deck

### From VC Pitch Deck Prompt:
- 15-slide Figma file (editable)
- PDF export
- PNG per slide
- Speaker notes (100 words per slide)

---

## Brand Reference (For Claude)

**Product**: atlas.core — AI fitness coach, privacy-first, offline-first

**Visual Language**:
- **Mark**: Filled heart with ECG trace (never tilted, never outlined)
- **Wordmark**: "atlas.core" (lowercase, Archivo Black, sulfur dot)
- **Palette**: Ink (#1a1a1a), Paper (#fafaf8), Sulfur (#f5c211)
- **Typography**: Archivo Black (display), Inter (body), IBM Plex Mono (mono)

**Tone**: Calm, analytical, editorial. Empowering. No hype.

**Existing Assets**: 107 designed screens, data model, feature specs, React component library

---

## FAQ

**Q: Can I customize these prompts?**
A: Absolutely. Feel free to:
- Remove layers you don't need
- Add specific requirements
- Adjust token budget
- Specify output formats

**Q: What if I want to iterate on designs?**
A: Claude will output Figma files (editable) and code files (modifiable). You can:
- Edit in Figma and re-export
- Modify React components
- Adjust tokens
- Request variations

**Q: How long does execution take?**
A: ~1–2 hours for the full system, depending on Claude's processing speed.

**Q: Can I use these designs in production?**
A: Yes. All outputs are production-ready (SVG, React, CSS, JSON). Ship directly to engineering.

**Q: What if I need changes after delivery?**
A: Use the Figma files or code files to iterate. Or run the prompt again with updated requirements.

**Q: Should I use the Master Prompt or Design Assets Prompt?**
A: 
- Use **Master** if you want everything in one shot
- Use **Design Assets** if you want design system first, VC deck later
- Use **VC Deck** standalone if you only need the pitch deck

---

## Next Steps

1. **Choose your path** (A, B, C, or D)
2. **Copy the relevant prompt**
3. **Go to claude.ai/design**
4. **Paste and execute**
5. **Download and ship**

---

## Support

If you have questions or need modifications:
- Edit the prompt file and re-run
- Add context or constraints
- Request specific variations
- Iterate until you're happy

**atlas.core — Complete. Cohesive. Ready to ship.**
