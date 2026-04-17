# Teardown 18 — Coach insights / proactive cards

**Surface:** Proactive AI coach cards on Today that surface a short, contextual nudge before the user opens chat.
**Atlas file(s):** `src/pages/TodayV2.jsx`, `src/components/ai/CoachChatTrigger.jsx`, `src/components/ai/CoachChatSheet.jsx`, `src/hooks/useCoachChat.js`, `supabase/functions/ai-coach-chat/index.ts`, `supabase/migrations/20260329210000_coach_memory.sql`, `supabase/migrations/20260331100000_proactive_insight.sql`
**Reference apps:** Whoop (primary), Oura (secondary)
**Audience tension:** High — this surface has to satisfy serious athletes who want specific, performance-oriented guidance without losing general users who only want a simple, encouraging next step.

---

## Why this screen matters

This surface sits in the highest-attention part of Atlas: the Today home loop. It is the first place where the product can move from passive tracking into active coaching, and it is also the fastest place to lose trust if the card feels generic, stale, or disconnected from what the user actually did today.

The revenue impact is indirect but real. A good proactive card makes Atlas feel alive, which increases return frequency, chat usage, and the odds that the user sees value before a subscription decision. A broken one does the opposite: it turns “AI coach” into another decorative label, or worse, a card that repeats chat content and adds noise to the home screen.

World-class here means the user sees one crisp, specific coaching nudge that clearly comes from their current state, understands why it appeared, and can act on it immediately. Broken means the card is either missing when it should appear, repeating a generic summary, or opening a chat flow that quickly becomes more friction than value.

---

## Reference app 1 — Whoop (primary)

WHOOP is the better primary reference because it treats AI coaching as a performance layer, not as a conversational gimmick. Its public Coach positioning emphasizes proactive guidance across sleep, strain, and recovery, which is the right mental model for Atlas’s Today card: a short nudge grounded in current state, followed by a concrete next move. See [WHOOP Coach](https://www.whoop.com/thelocker/introducing-whoop-coach-powered-by-openai) and [WHOOP Recovery](https://www.whoop.com/thelocker/how-does-whoop-recovery-work-101).

### What Whoop does that works

1. **Proactive, not reactive.** WHOOP frames coach output as something that can guide the user before they ask a question. That matters here because a proactive card should feel like an intervention based on state, not like a recycled chat reply pasted into the home screen.

2. **One clear physiological frame.** WHOOP keeps the conversation anchored to recovery, strain, and sleep. That gives the user a stable mental model for why the app is speaking up, and Atlas should mirror that by tying each card to a legible signal or threshold instead of a vague “insight.”

3. **Direct, accountable tone.** WHOOP’s coach language is practical and specific rather than airy. That tone fits Atlas’s serious-user audience and keeps the card from sounding like a wellness blog summary.

4. **Personalized guidance from live context.** WHOOP’s public coach copy stresses that it uses the user’s data and adapts to what they are doing now. The relevant pattern is not “AI that knows things,” but “AI that chooses the next best action from current context.”

5. **Low-friction continuation.** WHOOP positions the coach as something you can keep talking to. That is the right handoff pattern for Atlas too: the proactive card should not be a dead end; it should be a bridge into deeper action if the user wants it.

6. **Performance-first framing.** WHOOP keeps the emphasis on training smarter and recovering better. That is useful because Atlas’s proactive cards should remain execution-oriented, not turn into generic self-help blurbs.

### What Whoop does that you shouldn't copy

1. **Do not copy the elite-athlete intensity everywhere.** WHOOP can lean hard into performance culture because that is its core brand. Atlas serves a broader fitness audience, so the card needs to stay calm and accessible even when the underlying signal is serious.

2. **Do not mimic score obsession without explanation.** WHOOP’s ecosystem can tolerate a lot of metric density because users expect it. Atlas should avoid stacking the card with too many numbers unless those numbers directly justify the nudge.

3. **Do not turn the card into a surveillance vibe.** WHOOP can get away with deeper biometric framing because the product promise is built around it. Atlas should still feel guided, not watched.

---

## Reference app 2 — Oura (secondary)

Oura adds the missing trust and pacing model. Its [Readiness Score](https://support.ouraring.com/hc/en-us/articles/360025589793-Readiness-Score) shows how a score can be tied to contributors and then translated into a simple recommendation. Its [Oura Advisor](https://support.ouraring.com/hc/en-us/articles/39512345699219-Oura-Advisor) adds the stronger pattern for Atlas: personalized advice, memories, and explicit settings control. Its [notification model](https://support.ouraring.com/hc/en-us/articles/360025579173-Managing-Your-Notifications) also reinforces that insight is a timed event, not just an always-visible card.

### What Oura does that works

1. **Score plus contributors.** Oura does not just say “here is your readiness”; it explains the contributors behind it. Atlas can borrow that pattern by showing the user what signal triggered the proactive card, especially when the message is short.

2. **Guidance attached to a home surface.** Oura Advisor is accessible from the Today experience, which is exactly where a proactive Atlas card belongs. The card should feel native to home, not buried in a separate insights dump.

3. **Memory and control.** Oura makes memory and settings explicit, which is important for trust. Atlas needs a visible story for what the coach remembers and how long a proactive card sticks around.

4. **Notification as timing, not spam.** Oura’s insight notifications are a useful model for when to surface new advice. The lesson is that proactive cards should appear because something changed, not because the screen has room for one more component.

5. **Recovery-aware restraint.** Oura’s guidance often tells users to ease off rather than push harder. That is a useful counterweight for Atlas, which must coach serious users without assuming every day is a max-effort day.

### What Oura does that you shouldn't copy

1. **Do not over-medicalize the card.** Oura can afford a health-first vocabulary that skates closer to wellness monitoring. Atlas should stay firmly in training and habit execution unless the user context clearly demands more caution.

2. **Do not bury the action behind settings.** Oura’s control model is good for trust, but Atlas should not make the proactive card feel like a configurable feature before it feels useful.

---

## What Atlas does today (current state)

- **Layout and navigation structure:** The proactive card lives inside `TodayV2` as a standalone block after the primary action and before the coach guidance section (`src/pages/TodayV2.jsx:720-835`). It is not its own route or modal. Dismissal is only local component state (`aiDismissed`), so a page refresh will bring it back if the underlying message still exists.

- **Key interactions:** The card has exactly two actions: a dismiss `X` and a “continue conversation” button that opens the full coach sheet (`src/pages/TodayV2.jsx:158-186`, `:826-834`). It does not expose any direct coaching actions of its own, so the card is a handoff, not a task surface.

- **Visual approach:** The card is small, rounded, and card-like with a left AI accent bar, a sparkle icon, and a single paragraph of copy (`src/pages/TodayV2.jsx:163-183`). The tone is visually lighter than the primary action block and uses brand-AI accents rather than the darker, more dramatic treatment used for the main task card.

- **Where the message comes from:** Today fetches `coach_memory.proactive_insight` and `proactive_insight_generated_at` with a 120-second stale time, then treats the value as fresh only if it is under 24 hours old (`src/pages/TodayV2.jsx:619-726`). If that value is missing or stale, the card falls back to `ai.briefing.message` from `useAICoach`, which is a separate engine output and not the same thing as a proactive insight.

- **What generates the insight:** The `ai-coach-chat` edge function writes `proactive_insight` back into `coach_memory` after each chat exchange (`supabase/functions/ai-coach-chat/index.ts:482-497`). The generator is rule-based and capped at one sentence, with priority order for low energy, protein deficit, missed training, calorie overshoot, and “all green” conditions (`supabase/functions/ai-coach-chat/index.ts:545-600`).

- **Adjacent chat experience:** The card’s CTA opens the full bottom-sheet coach experience, which is hydrated from `coach_messages` and rendered with message bubbles, suggestion pills, and paywall gating after one free-user message per day (`src/hooks/useCoachChat.js:1-120`, `src/components/ai/CoachChatSheet.jsx:170-220`). That means the card is not a self-contained coach flow; it is a teaser for a heavier interaction.

- **Known issues from code reading:** `generateProactiveInsight` computes `trend` but never uses it, which suggests unfinished logic or a dead condition (`supabase/functions/ai-coach-chat/index.ts:558-561`). The `aiInsightsService` file exists and has its own cache/rate-limit pipeline, but a repo search found no imports from `src`, so it is not driving this surface. That is a split-brain risk, because Atlas currently has at least two separate “insight” systems in the codebase.

- **Gaps relative to the reference app:** The card has no explicit “why now” label, no source label, no freshness badge, and no persistence for dismissal. Compared with Whoop and Oura, Atlas is missing the explanation layer that turns a nudge into trusted coaching.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Add a reason stub.** Show one short line that names the trigger behind the card, such as “low energy,” “protein shortfall,” or “missed training.” This is the fastest way to make the card feel like a signal instead of a random AI sentence. Effort: 4-6 hours.

2. **Persist dismissal.** Store card dismissal per user and day, or per insight fingerprint, so it does not reappear after every refresh. WHOOP and Oura both imply timing discipline; Atlas currently only has session-local dismissal. Effort: 4-8 hours.

3. **Separate coach nudge from chat reply.** Make the card clearly originate from a proactive signal, not from the chat transcript or a generic briefing fallback. This reduces UI confusion and lets the user understand when Atlas is prompting versus answering. Effort: 1 day.

4. **Add a freshness label.** If the insight is older than the current day or older than a defined window, either hide it or label it as stale. That prevents the Today screen from implying real-time intelligence when it is really replaying cached memory. Effort: 4-6 hours.

### 🟡 Steal soon — medium impact, medium effort

1. **Give the card a source hierarchy.** Prefer a dedicated proactive-insight payload, then a fallback from current-day coaching data, and only then a briefing fallback. This makes the system easier to reason about and easier to debug when the message looks wrong. Effort: 1-2 days.

2. **Attach one contextual action.** A protein-deficit card should offer a nutrition action; a missed-training card should offer a workout action; a low-energy card should offer a lighter-plan suggestion. WHOOP works because the nudge leads somewhere. Effort: 1-2 days.

3. **Expose memory controls.** Give the user a small path to see what Atlas is remembering or why the coach is repeating itself. Oura’s settings/memory model is the right trust pattern here. Effort: 2-3 days.

4. **Log card impressions and dismissals.** Right now the surface has no learning loop visible in code. Tracking impressions, open rates, and dismissals would tell you whether the card helps or just takes space. Effort: 1-2 days.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Decouple proactive generation from chat replies.** The current implementation only writes `proactive_insight` when chat runs. A better system would generate the card on its own cadence from current state, which is more correct but requires a product decision and a backend job. Effort: 2-4 days.

2. **Create a dedicated insight abstraction.** Unify `aiInsightsService`, `useAICoach`, and the `coach_memory` path into one source of truth or deliberately delete the unused path. This is a cleanup with real payoff, but it touches architecture rather than just UI. Effort: 2-5 days.

3. **Support multiple card types.** If Atlas wants more than one proactive surface, you will need a taxonomy for recovery, nutrition, training, and habit prompts. That is powerful, but it can also bloat Today if the product does not police card volume. Effort: 3-5 days.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Proactive prompt vs. summary tile.** A proactive card should feel like a timely interruption based on current state, not a decorative dashboard summary. The current fallback to `ai.briefing.message` blurs that line. *Resolution:* keep the card strictly conditional on a fresh, named trigger and hide it when the system cannot explain why it exists.

**Tension 2 — Stable coach vs. changing context.** The coach should feel like one consistent voice, but the actual prompt may come from low energy one day and protein deficit the next. That creates a risk of the card feeling random even when the logic is correct. *Resolution:* preserve a stable voice, but always expose the triggering context in one short label or chip.

**Tension 3 — Helpful nudge vs. intrusive repetition.** A card that keeps returning after dismissal will feel pushy, especially for general users. A card that disappears forever may stop being useful for serious users who want a persistent coach. *Resolution:* persist dismissal for a short window and re-arm it only when the underlying signal changes.

**Tension 4 — Serious athlete vs. general user language.** The backend already uses direct performance language, but Atlas cannot assume every user wants “protect the main work” copy every day. *Resolution:* keep the message concise and action-oriented, but parameterize the tone so the same insight can be translated into a softer or sharper register.

---

## Specific changes to make (actionable list)

1. **Split proactive-card selection into a dedicated selector that returns `message`, `source`, `trigger`, and `freshness`.** Touch `src/pages/TodayV2.jsx` and optionally a new hook or helper. Effort: 1-2 days. Dependency: none.

2. **Persist proactive-card dismissal outside component state.** Touch `src/pages/TodayV2.jsx` and whatever storage layer you choose. Effort: 4-8 hours. Dependency: 1.

3. **Stop falling back silently from proactive insight to briefing copy.** Touch `src/pages/TodayV2.jsx` and `src/hooks/useAICoach.js`. Effort: 4-6 hours. Dependency: 1.

4. **Add a visible reason label or chip to the card.** Touch `src/pages/TodayV2.jsx` and the localization files for the three supported languages. Effort: 4-8 hours. Dependency: 1.

5. **Use the message type to drive a contextual action, not just chat.** Touch `src/pages/TodayV2.jsx`, `src/components/ai/CoachChatSheet.jsx`, and `supabase/functions/ai-coach-chat/index.ts`. Effort: 1-2 days. Dependency: 1.

6. **Make the proactive insight generation independent of chat exchange.** Touch `supabase/functions/ai-coach-chat/index.ts`, the database job or cron layer, and `src/pages/TodayV2.jsx`. Effort: 2-4 days. Dependency: 1.

7. **Remove or wire up the dead `aiInsightsService` path.** Touch `src/services/aiInsightsService.js` and the places that should consume it, or delete it if it is no longer needed. Effort: 1-2 days. Dependency: product decision.

8. **Fix the unused `trend` variable or actually use it in the insight rules.** Touch `supabase/functions/ai-coach-chat/index.ts`. Effort: 1-2 hours. Dependency: none.

9. **Add impression, open, dismiss, and follow-through analytics for the proactive card.** Touch `src/pages/TodayV2.jsx` and the analytics layer. Effort: 1-2 days. Dependency: 1.

10. **Expose coach-memory freshness or memory state in a lightweight settings view.** Touch `src/pages/TodayV2.jsx`, `src/components/ai/CoachChatSheet.jsx`, and account/settings pages if needed. Effort: 2-3 days. Dependency: 1.

11. **Align free-user gating with the proactive-card CTA.** Touch `src/components/ai/CoachChatSheet.jsx` and the Today CTA copy so the user does not hit a surprise paywall right after tapping the proactive nudge. Effort: 1 day. Dependency: 5.

Total effort: roughly 2-3 weeks if you include the architecture cleanup and independent generation path, or about 4-6 days for the UI-only improvements. The biggest perceived quality jump comes from items 1, 2, 3, 4, and 6.

---

## What NOT to do

1. **Do not turn the proactive card into another chat launcher with fancy styling.** If it only opens the sheet, it is not a proactive insight surface.

2. **Do not show stale memory as if it were current coaching.** A stale card is worse than no card because it creates false confidence in the coach.

3. **Do not stack multiple metrics into one card unless they map to a single decision.** The user should not have to decode a mini dashboard to know what to do.

4. **Do not copy Oura’s soft wellness framing into every state.** Atlas’s value is direct coaching, not generalized comfort copy.

5. **Do not make dismissal purely ephemeral.** If the user closes the card, the product should remember that choice for at least a meaningful time window.

6. **Do not keep two separate insight systems that disagree with each other.** The current split between the local `aiInsightsService` and the coach-memory-backed card is confusing and will age badly.

---

## The single highest-leverage thing

Make the proactive card a first-class signal with its own lifecycle instead of a fallback string pulled from chat memory. If Atlas can reliably answer “why is this showing now, what changed, and what should I do next,” the Today screen will feel like coaching rather than commentary. That one change resolves the biggest trust gap in the current implementation, reduces confusion between chat and proactive surfaces, and gives the team a clean base for better gating, analytics, and future card types.

**File status:** Draft 1. To be revised after implementation against reality.
