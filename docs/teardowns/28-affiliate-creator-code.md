# Teardown 28 — Affiliate / creator code

**Surface:** Authenticated creator-code entry and redemption on the pricing page, with server-side attribution and post-purchase locking  
**Atlas file(s):** `src/pages/Pricing.jsx`, `src/components/affiliate/CreatorCodeModal.jsx`, `src/lib/affiliate/applyCreatorCode.js`, `src/i18n/messages/en.json`, `src/i18n/messages/es.json`, `src/i18n/messages/pt-BR.json`, `supabase/migrations/20260403002000_profile_creator_fields.sql`, `supabase/migrations/20260403005000_apply_creator_code_rpc.sql`, `supabase/functions/revenuecat-webhook/index.ts`  
**Reference apps:** Cameo (primary), Beehiiv (secondary)  
**Audience tension:** High — serious users need to know attribution is real, final, and auditable; casual users need the code to feel like a simple, trustworthy bonus rather than a confusing billing trick

---

## Why this screen matters

This surface sits at the edge of conversion and attribution. In Atlas, the creator-code affordance lives inside `Pricing.jsx`, so it is not a standalone affiliate center; it is a small decision inside a bigger purchase page. That makes it easy to miss and easy to misread. If users do not understand what the code does, they either ignore it, mistrust it, or apply it too late.

The revenue impact is indirect but real. A broken creator-code flow does not just lose affiliate credit; it can also create support confusion around whether a code applied, whether it can be changed, and whether it affects billing or account state. The broken version of this surface is a tiny link that feels like a coupon field, then a modal that says almost nothing, then a generic invalid/locked error. The world-class version is a compact, trust-first handoff that explains the consequence before the user taps, confirms the result clearly, and makes finality obvious.

For Atlas’s audience mix, this surface has an unusual burden. Serious users want explicit attribution rules and reassurance that the code is attached correctly. General fitness users need to understand it quickly without feeling like they are navigating a creator marketplace. The best design will serve both by treating the code as account attribution, not as a vague promo code.

---

## Reference app 1 — Cameo (primary)

Cameo is the right primary reference because it has a creator-facing economy built around identity, sharing, and earnings, not just checkout. That is only a partial match to Atlas, but the trust dynamics are close: the user needs to know who gets credit, what the link/code means, and where the relationship lives after the action.

### What Cameo does that works

1. **Named ownership**
   Cameo makes the creator’s own link part of their identity, not a hidden system field. That reduces ambiguity and makes sharing feel like a real action tied to a person rather than a generic coupon.

2. **Earnings framed plainly**
   The partner/referral story is expressed in direct language about percentage and duration. That works because the value exchange is explicit, which is exactly what creator-code users need before they trust the flow.

3. **Copyable next step**
   The talent hub and help docs keep the “what do I do next?” answer close to the link itself. That matters because attribution tools fail when users have to hunt for the action after they understand the concept.

4. **Social distribution baked in**
   Cameo repeatedly points people back to sharing in bios and on social posts. That pattern is useful for Atlas because a creator-code surface should feel connected to a relationship outside the app, not trapped inside a modal.

5. **Persistent wallet-like context**
   On Cameo, earnings and profile management live in a clear account context rather than in a one-off confirmation toast. That persistence builds trust because the user can later verify what happened.

6. **Disclosure is normal**
   Cameo’s creator materials treat disclosure and referral context as part of the program, not a footnote. That makes the affiliate motion feel legitimate instead of suspicious.

### What Cameo does that you shouldn't copy

1. **Do not copy the fame economy**
   Cameo’s tone assumes creators, talent, and fan commerce. Atlas users are not trying to monetize an audience on day one, so that language would overcomplicate a simple attribution flow.

2. **Do not make it feel like a full creator dashboard**
   Cameo can justify a wallet, earnings history, and referral program depth. Atlas should not surface that much machinery in the purchase path unless the product actually exposes creator operations.

3. **Do not overdo social proof**
   Cameo’s celebrity context gives it permission to lean on aspiration. Atlas should be more restrained because health/performance users care more about clarity and legitimacy than hype.

---

## Reference app 2 — Beehiiv (secondary)

Beehiiv adds the operational clarity Cameo misses. It is a better model for the mechanics of partner links, because it shows how to create, copy, manage, and monitor attribution without making the user guess what happened.

### What Beehiiv does that works

1. **Dedicated partner surface**
   Beehiiv gives partners a clear place to get their link and manage it later. That separation is useful for Atlas because creator-code state should be discoverable, not hidden as a transient modal interaction.

2. **Copy-first flow**
   Beehiiv puts copy/share actions right next to the link. That reduces friction and reinforces that the code is something the user can rely on and reuse.

3. **Multiple-state visibility**
   Beehiiv surfaces current tier, visitors, leads, and conversions. Atlas does not need that full dashboard, but it does need a visible state change after application so the user can tell the code attached successfully.

4. **Rule clarity**
   Beehiiv explains when a link changes, when it stops working, and what happens after signup. That is a strong model for Atlas’s lock rules, because finality needs to be obvious.

5. **Disclosure built in**
   Beehiiv treats partner disclosure as a normal part of the experience. That is useful here because creator-code UX should feel legitimate, not sneaky.

### What Beehiiv does that you shouldn't copy

1. **Do not copy the creator-publisher complexity**
   Beehiiv’s dashboard model assumes a business relationship with multiple links and performance metrics. Atlas only needs a single consumer-facing redemption flow today.

2. **Do not make the code feel like admin**
   Beehiiv can lean into dashboards and metrics because that is its audience. Atlas should keep the interaction lightweight and human.

---

## What Atlas does today (current state)

- **Layout and navigation structure:** The creator-code entry lives as a small authenticated-only link centered under the athlete pricing cards in `Pricing.jsx`. It is not a standalone page. If the user already has a code on file, the link is replaced by a static inline status row showing `Creator: {code}`. The modal opens as a `MobileSheet` bottom drawer and is dismissed by closing the sheet or tapping the post-success close button.
- **Key interactions:** An authenticated user taps “Have a creator code?” to open `CreatorCodeModal.jsx`, types a code into one text field, and submits with Enter or the Apply button. The modal can show a success state, a generic invalid-code error, or a locked-code error. After a successful apply, the parent pricing page stores the returned code in local state.
- **Visual approach:** The trigger is low-emphasis brand text with a tag icon; the modal is a clean, minimal sheet with one input, inline error text, and a primary brand button. The design is consistent with the rest of Atlas, but it reads more like a utility input than a social or referral surface.
- **Known issues from code reading:** The modal gives almost no context before asking for input, so users learn the rules only after tapping. `getCreatorStatus()` fails soft to “no code” if the profile fetch errors, which can hide existing attribution state. The success state only updates local pricing-page state; it does not surface lock semantics beyond the error path. Error handling collapses several backend failures into either “invalid” or “locked,” which is simple but not very explanatory.
- **Gaps relative to the reference app:** Atlas does not explain who benefits from the code, why it exists, or whether it can be changed after purchase. It also lacks any persistent management view, copy/share helper, or disclosure language around attribution. Compared with Cameo and Beehiiv, the flow is functional but not yet trustworthy enough.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Add pre-entry context.** Put one sentence under the “Have a creator code?” trigger that explains the code attaches attribution to the account and may be final after purchase. That removes the biggest trust gap before the modal opens. Effort: 2-4 hours.

2. **Show applied state clearly.** Replace the current bare `Creator: {code}` text with a more explicit applied badge and lock explanation once a code exists. That makes the state feel intentional instead of incidental. Effort: 2-3 hours.

3. **Differentiate errors.** Split invalid, inactive, unauthorized, profile-missing, and locked states into distinct user-facing messages where possible. This is low effort because the backend already returns structured errors, and it materially improves trust. Effort: 3-5 hours.

4. **Explain the consequence in the modal.** Add one short line above the input that says what the code changes and when it can no longer be edited. The modal is the wrong place to be mysterious. Effort: 2-4 hours.

### 🟡 Steal soon — medium impact, medium effort

1. **Make success confirm the owner.** After a valid apply, show the creator name and a brief “attached to this account” statement rather than only “applied.” That mirrors the way Cameo and Beehiiv make ownership visible. Effort: 4-6 hours.

2. **Add a persistent account-view of code status.** Surface the code on account or settings pages so the user can verify it later without returning to pricing. This helps both supportability and trust. Effort: 1 day.

3. **Add disclosure-style helper copy.** Include a lightweight note about attribution or partner relationships, especially if the code is tied to rewards. That makes the surface feel legitimate instead of promotional. Effort: 4-8 hours.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Introduce a copy/share path for creator-owned codes.** If Atlas eventually wants users to reuse or share creator codes, give them a reusable share action and a canonical code card. That is useful, but it changes the product from redemption-only to creator participation. Effort: 2-4 days.

2. **Build a creator dashboard.** A true affiliate hub with conversion counts, code status, and historical attribution would be excellent, but it is a bigger product commitment than this surface needs today. Effort: several days to a week.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Coupon vs attribution.**  
Users will assume a creator code is a discount field unless the UI says otherwise. *Resolution:* frame it as account attribution first and only imply discounts if the backend truly uses the code that way.

**Tension 2 — Friction vs trust.**  
The fastest flow would be a single input and one tap, but that leaves users unsure what they just did. *Resolution:* add one explanatory line and one explicit success state; do not trade away clarity for speed.

**Tension 3 — Private state vs visible proof.**  
The current code is only visible after login and disappears into account state after submission. *Resolution:* make the applied code visible in at least one persistent place so the user can verify it later.

**Tension 4 — Serious vs casual users.**  
Power users want lock rules and attribution certainty; casual users only want to move on. *Resolution:* keep the default surface minimal, but reveal the rules in one short sentence and let the system earn trust through state, not prose.

---

## Specific changes to make (actionable list)

1. Add a one-line explanation under the creator-code trigger so users know why the field exists before they open the sheet. Files: `src/pages/Pricing.jsx`, `src/i18n/messages/en.json` and locale equivalents. Effort: 2-4 hours. Dependency: none.
2. Replace the current plain text “Creator: {code}” status with a more explicit applied badge plus lock/finality copy. Files: `src/pages/Pricing.jsx`, `src/i18n/messages/en.json` and locale equivalents. Effort: 2-3 hours. Dependency: none.
3. Add a short helper sentence at the top of `CreatorCodeModal` that explains attribution and lock behavior. Files: `src/components/affiliate/CreatorCodeModal.jsx`, `src/i18n/messages/en.json` and locale equivalents. Effort: 2-4 hours. Dependency: 1.
4. Split backend errors into distinct user-facing states instead of collapsing everything into invalid or locked. Files: `src/components/affiliate/CreatorCodeModal.jsx`, `src/lib/affiliate/applyCreatorCode.js`, `supabase/migrations/20260403005000_apply_creator_code_rpc.sql`. Effort: 3-5 hours. Dependency: none.
5. Add a visible loading or empty-state treatment while creator status is being fetched on the pricing page. Files: `src/pages/Pricing.jsx`, `src/lib/affiliate/applyCreatorCode.js`. Effort: 2-4 hours. Dependency: none.
6. Persist the applied creator code in a read-only account or settings surface so users can verify it later. Files: `src/pages/Account.jsx` or `src/pages/Settings.jsx`, `src/lib/affiliate/applyCreatorCode.js`. Effort: 1 day. Dependency: 2.
7. Show a clear confirmation state after apply that includes the creator name and account attachment wording. Files: `src/components/affiliate/CreatorCodeModal.jsx`, `src/i18n/messages/en.json` and locale equivalents. Effort: 4-6 hours. Dependency: 4.
8. Add copy that explains codes are final or change-limited after purchase, and make that rule match the backend lock behavior. Files: `src/components/affiliate/CreatorCodeModal.jsx`, `src/pages/Pricing.jsx`, `supabase/functions/revenuecat-webhook/index.ts`. Effort: 4-8 hours. Dependency: 3.
9. Surface a small disclosure note if creator codes participate in affiliate credit or rewards. Files: `src/pages/Pricing.jsx`, `src/components/affiliate/CreatorCodeModal.jsx`, locale files. Effort: 4-8 hours. Dependency: none.
10. Normalize the input behavior so pasted codes are trimmed and uppercased consistently before submit. Files: `src/components/affiliate/CreatorCodeModal.jsx`, `src/lib/affiliate/applyCreatorCode.js`. Effort: 1-2 hours. Dependency: none.

Total effort: roughly 2-4 days for a strong trust pass, or 1 week if the team also adds persistent account-level verification and richer error states. The biggest jump in perceived quality will come from items 1, 3, 4, 7, and 8.

---

## What NOT to do

1. Do **not** present the field like a generic coupon box without explaining attribution.
2. Do **not** hide lock/finality rules until after a failed attempt.
3. Do **not** make the surface look like a creator dashboard unless Atlas actually ships creator operations.
4. Do **not** collapse all backend failures into “invalid code” forever; that makes debugging and trust worse.
5. Do **not** add aggressive affiliate marketing language that competes with the pricing decision.
6. Do **not** expose RevenueCat or Supabase terminology to the user unless it is translated into plain product language.

---

## The single highest-leverage thing

The highest-leverage change is to make the creator-code flow explain itself before the user taps. Right now Atlas asks for a code inside a pricing page, then reveals the rules only through a minimal modal and a couple of backend-specific states. If the team adds one sentence of context, one explicit success state, and one persistent place to verify the applied code, the surface will stop feeling like a hidden coupon field and start feeling like a trustworthy attribution flow.

**File status:** Draft 1. To be revised after implementation against reality.
