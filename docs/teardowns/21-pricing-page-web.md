# Teardown 21 — Pricing page (web)

**Surface:** Web pricing and subscription selection for Atlas Core
**Atlas file(s):** `src/pages/Pricing.jsx`, `src/components/pricing/RegionSelector.jsx`, `src/lib/regionalPricing.js`, `src/lib/SubscriptionContext.jsx`, `src/lib/analytics.js`, `supabase/functions/create-checkout/index.ts`, `supabase/functions/complete-checkout/index.ts`, `src/pages/TodayV2.jsx`, `src/lib/translations/en-US.json`
**Reference apps:** Linear (primary), Superhuman (secondary)
**Audience tension:** High — this page has to satisfy serious optimizers who want precision and general users who need reassurance without feeling like they are buying enterprise software.

---

## Why this screen matters

The pricing page is the first explicit revenue decision surface in the web app. It is not just a brochure page: in `src/pages/Pricing.jsx` it is wired to authenticated checkout, region-based pricing, billing interval selection, creator-code handling, and the redirect contract that ultimately activates the subscription. If this page is unclear, users do not just hesitate; they fail to convert, bounce back to sign-up, or end up confused about what was purchased.

Broken pricing pages usually fail in one of three ways: they feel vague, they feel untrustworthy, or they make the handoff to checkout opaque. Atlas currently avoids the worst of that by showing a comparison table, trust pills, and a direct checkout flow, but the experience still carries hidden complexity: region detection happens asynchronously, yearly savings are partially hard-coded, and the actual activation path is split between checkout, a Stripe redirect, and `TodayV2` finalization. That is a lot of invisible machinery for a page that should feel effortless.

World-class here means the user can answer three questions within seconds: what changes at each tier, what they will pay in their region and billing cadence, and what happens after they click. Linear is a strong model for the first two. Superhuman is a strong model for the emotional confidence and concise conversion language. Atlas needs both, but it needs them translated into a fitness and health context, not copied literally.

---

## Reference app 1 — Linear (primary)

Linear is the right primary reference because it serves a product-led audience that values speed, clarity, and low-friction decision-making. That is close to Atlas’s serious-optimizer segment: people who will read the comparison, compare tiers carefully, and notice when pricing language is fuzzy or inconsistent.

### What Linear does that works

1. **One job per section.** Linear pricing pages tend to separate persuasion, comparison, and reassurance into distinct blocks. That works because the user never has to wonder whether they are reading a pitch, a spec sheet, or a checkout step. For Atlas, the same separation keeps the pricing page from collapsing into a marketing landing page plus a billing FAQ plus a support article.

2. **Compact hierarchy.** The strongest visual signal is usually the plan name, price, and one-line promise. That makes the scan path obvious and keeps the page feeling premium instead of crowded. Atlas should preserve that discipline, especially because the current page already has a hero, comparison table, tier cards, creator-code affordance, and a private-beta CTA.

3. **Comparison where decisions happen.** Linear is good at putting meaningful deltas directly in front of the purchase decision instead of hiding them in footnotes. That helps users make an informed choice without leaving the page. Atlas already has a comparison snapshot; the next step is making sure it emphasizes the differences that actually matter for training, nutrition, analytics, and history.

4. **Reassurance without sales fog.** Clear cancellation, billing, and upgrade/downgrade language lowers perceived risk. This is especially important for subscription products where users are deciding whether they are signing up for a tool or a trap. Atlas already has trust pills, but they are generic; Linear’s approach is more explicit and therefore more credible.

5. **A clear highlighted option.** Linear’s best pricing treatments usually do not shout at every tier equally. One plan gets prominence, and the rest stay legible but quieter. That pattern is useful for Atlas because the page currently has a “Most popular” treatment for Pro, but the rest of the hierarchy still competes for attention through shadows, badges, and motion.

6. **Low cognitive load on mobile.** Linear’s pricing flows stay readable when compressed. That matters here because Atlas’s pricing page includes a wide comparison table and three plan cards; on mobile, every extra word or decorative treatment increases the chance of scroll fatigue.

### What Linear does that you shouldn’t copy

1. **Do not copy Linear’s B2B language.** Atlas is not selling seats, admin tools, or procurement-friendly compliance. If the page starts sounding like a team software contract, it will alienate the general fitness user immediately.

2. **Do not over-index on exhaustive specs.** Linear can afford a high-information pricing page because its product has a narrow mental model. Atlas spans workouts, nutrition, progress, and labs, so a wall of feature detail will turn into noise faster.

3. **Do not flatten the emotional value.** Linear can win on clarity alone. Atlas needs some aspiration and transformation language because users are not just buying a tracker; they are buying a better performance system.

---

## Reference app 2 — Superhuman (secondary)

Superhuman adds what Linear does not: emotional sharpness. It is useful here because pricing is not only about comprehension; it is also about conviction. Superhuman is good at making premium software feel decisive, fast, and worth paying for.

### What Superhuman does that works

1. **Benefit-first microcopy.** Superhuman is extremely disciplined about writing copy that answers “why pay?” in one sentence. That works because the user is never left translating feature lists into outcome value. Atlas should do the same for each plan pitch.

2. **Premium pacing.** Superhuman uses whitespace and a restrained number of calls to action to make the experience feel composed. That same pacing would help Atlas’s pricing page feel less like a utility page and more like a serious product decision.

3. **Strong CTA verbs.** The best Superhuman CTAs are direct and outcome-oriented. Atlas’s current buttons are functional, but some of them read like account plumbing instead of purchase momentum. That can be tightened.

4. **Confidence through simplicity.** Superhuman reduces the amount of visible choice without hiding the consequence of choice. That is a good model for Atlas because the page already has enough structural complexity from regions, billing cadence, and subscription states.

5. **Reassurance bundled into the offer.** Superhuman is good at pairing premium language with reduced perceived risk. For Atlas, that means the trial and cancellation promise should feel like part of the plan, not a legal aside.

### What Superhuman does that you shouldn’t copy

1. **Do not copy the aggressive exclusivity tone.** Atlas is not a scarce, invitation-only productivity club. Overdoing urgency would feel fake and would undermine trust for health-related purchases.

2. **Do not make the page feel like a sales sequence.** Superhuman can carry a little more persuasion because its product category supports it. Atlas needs the pricing page to feel informational first and conversion-oriented second.

---

## What Atlas does today (current state)

- The surface lives in `src/pages/Pricing.jsx` and is rendered inside `PublicSiteShell`, so it behaves as a full public marketing page rather than a modal or settings subpage. Users enter through the public route (`ROUTES.pricing`) and exit either through auth links, the back-to-app link, or checkout redirection.
- The page starts with a hero section, trust pills, a `RegionSelector`, and a monthly/yearly toggle. The selector auto-detects region by IP in `src/components/pricing/RegionSelector.jsx`, which calls `detectRegion()` from `src/lib/regionalPricing.js`; that helper caches by session and falls back to `US` on failure.
- Pricing content is data-driven from translations in `src/lib/translations/en-US.json` and the region map in `src/lib/regionalPricing.js`. The page currently renders three athlete tiers only: Free, Pro, and Performance. Professional plans are acknowledged but commented out in code and replaced with a waitlist CTA.
- The primary conversion action posts to the Supabase edge function `create-checkout` with auth JWT, user ID, selected region, billing interval, and Stripe success/cancel URLs. The success URL includes `session_id={CHECKOUT_SESSION_ID}`, and `TodayV2.jsx` uses that redirect to call `complete-checkout` as a redundant activation path.
- The current UI is clean and high-contrast, with soft card fills, one highlighted “Most popular” card, motion-based entry, a static comparison table, and a private-beta-looking lower CTA. It reads as polished, but not yet fully resolved as a billing decision surface.
- Known issues from code reading: the yearly toggle shows a fixed “Save 31%” badge even though card savings are computed per region; `RegionSelector` returns `null` while loading, which can cause a brief blank gap; page-view analytics are fired once on mount and may miss late-auth hydration; and `currentPlanId` only treats `active` and `trialing` as paid, so `past_due` users are shown as free here even though `BillingManagement.jsx` treats them as paid.
- Relative to Linear and Superhuman, Atlas is missing a stronger explanation of what happens after checkout, a more explicit billing reassurance block, and a clearer distinction between the public athlete offering and the private professional lane.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Make the billing toggle truthful.** Replace the fixed “Save 31%” chip with region-aware savings derived from the same pricing object used in the cards. That removes a credibility leak and makes the page feel more precise. Effort: 2-4 hours.

2. **Add an explicit post-checkout note.** Right next to the CTA or trust row, explain that checkout redirects back to Today and finalizes activation automatically. Atlas already implements this contract in `Pricing.jsx` and `TodayV2.jsx`; surfacing it would reduce anxiety and support load. Effort: 2-3 hours.

3. **Keep the region selector visible while loading.** Show a compact skeleton or default label instead of returning `null` from `RegionSelector`. That avoids a small but noticeable layout jump at the exact moment the user is scanning prices. Effort: 2-4 hours.

4. **State the free-trial promise once, clearly.** The page already has “7-day free trial,” “Cancel anytime,” and “No credit card required” as separate pills. Recast them into a single reassurance row that reads like one policy, not three fragments. Effort: 2-3 hours.

### 🟡 Steal soon — medium impact, medium effort

1. **Add a short billing FAQ.** Include 3-4 questions about billing cadence, cancellation, regional pricing, and what happens after payment. Linear-style clarity here will reduce hesitation and prevent support tickets. Effort: 1 day.

2. **Make the comparison table more decision-oriented.** Today it shows broad capability buckets, but not the real decision differentiators. Refine the rows so they mirror the questions users actually ask when choosing between Free, Pro, and Performance. Effort: 1-2 days.

3. **Separate public and private tiers more cleanly.** The professional waitlist block currently sits below the athlete plans and shares the same visual language. Give it a more clearly secondary treatment so it does not read like a hidden upsell. Effort: 1 day.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Introduce richer social proof.** Testimonials, usage stats, or outcome claims could lift conversion, but only if they are believable and specific. For Atlas, fake-looking proof will do more damage than no proof. Effort: 2-4 days.

2. **Rework the pricing story around outcomes instead of products.** This could be powerful, but it is a product decision, not just a design decision. If the team wants a more Superhuman-like conversion page, the messaging has to be aligned across onboarding, app copy, and the feature set. Effort: several days to a week.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Precision vs. simplicity.**
Region-based pricing, billing cadence, and checkout handoff create real complexity, but the page cannot expose every moving part at once. *Resolution:* keep the page simple on first read, then reveal precision through a compact regional price summary and a short billing explanation under the CTA rather than burying trust details in the cards.

**Tension 2 — Athlete product vs. professional product.**
The public page is currently selling an athlete-oriented offer, while the codebase still contains private-beta professional plans and a waitlist path. *Resolution:* make the athlete offer the only active commercial lane on this page and demote professional access to a visibly secondary, non-purchasable lane.

**Tension 3 — Premium feel vs. billing honesty.**
The current design feels polished, but the fixed savings badge and hidden redirect logic weaken trust if the user notices them. *Resolution:* trade a little visual flourish for explicitness around savings, trial duration, and checkout completion. Billing pages earn trust by removing doubt, not by looking expensive.

**Tension 4 — Serious optimizer vs. general user.**
Serious users want exact feature differences and regional pricing; general users want to know they can try and cancel without hassle. *Resolution:* use a two-layer structure: a tight comparison and price layer up top, then a light reassurance layer below it. Do not force one audience to read through the other’s needs.

---

## Specific changes to make (actionable list)

1. **Replace the hard-coded yearly savings chip with a computed, region-aware savings value.** File(s): `src/pages/Pricing.jsx`. Effort: 2-4 hours. Dependency: none.

2. **Keep the region selector mounted during detection and show a compact loading state instead of returning `null`.** File(s): `src/components/pricing/RegionSelector.jsx`. Effort: 2-4 hours. Dependency: none.

3. **Rewrite the trust copy into a single billing reassurance block that covers trial length, cancellation, and card requirements.** File(s): `src/pages/Pricing.jsx`, `src/lib/translations/en-US.json`. Effort: 2-3 hours. Dependency: none.

4. **Add a short “what happens next” line near the CTA that explains the Stripe redirect and Today activation handoff.** File(s): `src/pages/Pricing.jsx`, `src/pages/TodayV2.jsx`. Effort: 2-3 hours. Dependency: none.

5. **Differentiate the athlete comparison table with clearer row labels and a stronger visual hierarchy for the plan that is actually recommended.** File(s): `src/pages/Pricing.jsx`, `src/lib/translations/en-US.json`. Effort: 1 day. Dependency: task 3.

6. **Treat `past_due` subscriptions as paid on the pricing page, or intentionally document why they are not.** File(s): `src/pages/Pricing.jsx`, `src/lib/SubscriptionContext.jsx`. Effort: 4-6 hours. Dependency: none.

7. **Reframe the professional waitlist section so it reads as a separate private lane rather than a third visible public tier.** File(s): `src/pages/Pricing.jsx`, `src/lib/translations/en-US.json`. Effort: 4-8 hours. Dependency: none.

8. **Move the creator-code affordance into a smaller support-style treatment so it does not compete with the pricing decision.** File(s): `src/pages/Pricing.jsx`, `src/components/affiliate/CreatorCodeModal.jsx`. Effort: 4-6 hours. Dependency: none.

9. **Fix pricing-page analytics to capture the hydrated auth state instead of only the initial mount state.** File(s): `src/pages/Pricing.jsx`. Effort: 1-2 hours. Dependency: none.

10. **Use `ROUTES.pricing` instead of a hard-coded `/Pricing` string in the pending-plan auth redirect.** File(s): `src/pages/Pricing.jsx`. Effort: 1 hour. Dependency: none.

11. **Add a short FAQ section for billing, cancellation, and regional pricing.** File(s): `src/pages/Pricing.jsx`, `src/lib/translations/en-US.json`. Effort: 1 day. Dependency: task 3.

12. **Add a small visual state for the active plan when the user is authenticated, including a clearer distinction between active, trialing, and lapsed-paid users.** File(s): `src/pages/Pricing.jsx`, `src/lib/SubscriptionContext.jsx`. Effort: 1 day. Dependency: task 6.

Total effort: roughly 3-5 days for a meaningful polish pass, or 1-2 weeks if the team also wants to revise the messaging architecture and add social proof. The biggest perceived-quality jumps will come from tasks 1, 2, 3, 4, and 11.

---

## What NOT to do

1. **Do not** copy Superhuman’s urgency or exclusivity language; Atlas is a health/performance product, not an invitation-only inbox tool.

2. **Do not** turn the page into a feature dump. If every plan gets every nuance on-screen, the pricing decision becomes harder instead of easier.

3. **Do not** leave region detection invisible and assume users will trust the result. If the price changes, explain why and make the selector stable.

4. **Do not** make the private professional offer look like a live public checkout path. That confuses the billing model and weakens trust.

5. **Do not** hide cancellation, trial, or redirect behavior in footnotes only. Billing trust has to be visible at the point of decision.

6. **Do not** add flashy urgency mechanisms like countdown timers or fake scarcity unless the product team explicitly wants a sales-led pricing motion. That would hurt Atlas’s credibility more than it helps conversion.

---

## The single highest-leverage thing

The highest-leverage change is to make the pricing page tell the complete checkout story in one glance: what the plan includes, what it costs in the user’s region, and what happens after click-through. Right now Atlas has the plumbing for all three, but the story is split across a fixed savings badge, an async region selector, a hidden redirect contract, and a private-beta professional block. If the team only does one thing, it should be to replace that fragmentation with a single, explicit, region-aware decision surface that feels honest enough for serious optimizers and simple enough for general users.

**File status:** Draft 1. To be revised after implementation against reality.
