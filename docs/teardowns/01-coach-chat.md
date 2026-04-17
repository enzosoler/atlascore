# Teardown 01 — Coach chat

**Surface:** AI Coach chat launched from the Today screen, presented as a bottom-sheet conversation with persistent memory, follow-up suggestions, and server-side execution of coach actions.
**Atlas file(s):** `src/pages/TodayV2.jsx`, `src/components/ai/CoachChatSheet.jsx`, `src/components/ai/CoachChatTrigger.jsx`, `src/hooks/useCoachChat.js`, `supabase/functions/ai-coach-chat/index.ts`, `supabase/config.toml`, `supabase/migrations/20260329210000_coach_memory.sql`, `supabase/migrations/20260331100000_proactive_insight.sql`
**Reference apps:** ChatGPT (primary), Character.ai (secondary)
**Audience tension:** High — serious users want fast, data-grounded coaching that can change behavior today, while general users need something approachable enough to ask a simple question without feeling judged or trapped in a “power user” workflow.

---

## Why this screen matters

This is the highest-intent AI surface in Atlas. It is not a novelty chat; it is the place where the product turns passive tracking into active coaching. When it works, it can increase daily retention because users get an immediate next step, not just a summary of what they already logged. It can also support conversion, because the coach is the most believable place to demonstrate that premium value is tied to actual behavior change.

When it fails, the failure is obvious: the coach feels generic, slow, disconnected from the user’s plan, or too hard to act on. That kind of miss is worse than a broken dashboard card because it damages trust in the whole “AI coach” promise. A world-class version feels specific, calm, and operational: it knows today’s metrics, remembers prior commitments, answers in the user’s language, and makes the next action unmistakable.

This surface also sits at the center of the mix-audience problem in Atlas. Serious optimizers will tolerate a stricter, more directive coach if it is accurate and fast. General fitness users will only keep engaging if the tone is concise, supportive, and non-intimidating. The design has to satisfy both without drifting into either sterile analytics or roleplay theater.

---

## Reference app 1 — ChatGPT (primary)

ChatGPT is the right primary reference because it solves the same core interaction pattern Atlas needs: a single conversation surface that can handle open-ended prompts, short commands, and task follow-through. It serves both casual and power users, which makes it a good fit for Atlas’s mixed audience, even though Atlas’s coach should be narrower and more opinionated than ChatGPT’s general-purpose assistant.

### What ChatGPT does that works

1. **Single focused composer**. ChatGPT keeps the input model simple: one visible composer, one obvious send action, and a clear mental model for “type and continue.” That reduces the cost of starting a conversation, which matters here because Atlas wants users to ask the coach small questions, not only big reflective prompts.

2. **Fast conversational feedback**. The strongest part of ChatGPT is that the assistant feels alive as soon as you submit. Streaming tokens and the typing state make the wait feel short and make the answer feel authored in real time, which is critical for a coach because delayed advice feels less confident.

3. **Follow-up affordances**. ChatGPT’s suggestion chips and quick actions keep the conversation moving without forcing the user to invent the next prompt. That pattern maps directly to Atlas, where the coach should keep nudging users toward logging, training, or checking adherence.

4. **Strong hierarchy in messages**. User content is visually distinct from assistant content, and long responses are chunked with markdown, lists, and emphasis. That makes dense answers readable without forcing the assistant to become shallow.

5. **Conversation continuity**. ChatGPT makes the thread feel persistent and legible across turns. For Atlas, that persistence is even more important because the coach is supposed to remember commitments, not just answer the current question.

6. **Low-friction correction**. ChatGPT does not punish the user for asking a bad prompt; it simply gives a useful next step. That is the right baseline for Atlas too, especially for general users who may only know how to ask “what should I do now?”

7. **Clear completion state**. Even when the assistant is done, ChatGPT leaves the user with an obvious next move. Atlas should steal that pattern because coaching is only useful if every exchange ends in action, not vague encouragement.

### What ChatGPT does that you shouldn't copy

1. **Do not copy the anything-goes assistant.** ChatGPT can afford to be a universal tool; Atlas cannot. This surface needs a coach that stays inside nutrition, training, check-ins, and plan execution, otherwise the product loses its positioning very quickly.

2. **Do not copy model/menu clutter.** ChatGPT’s model chooser, tool surface, and capability discovery are useful for a general assistant, but they would make Atlas’s coach feel overbuilt and less trustworthy. Atlas should look like a coach, not a sandbox.

3. **Do not copy long exploratory detours.** ChatGPT can support deep research mode and extended brainstorming. For Atlas, long speculative answers create friction because the job is to make the next behavior obvious, not to entertain the user with possibilities.

4. **Do not copy detached neutrality.** ChatGPT’s tone often aims for broad helpfulness. Atlas needs a coach voice that is more accountable and more plan-specific, or else the entire “AI coach” promise collapses into generic advice.

---

## Reference app 2 — Character.ai (secondary)

Character.ai is useful as a secondary reference because it is extremely good at creating a sticky, personality-forward chat surface that users want to return to. Atlas should not copy the roleplay dynamics, but it should borrow the idea that the conversation should feel owned by one stable persona with a recognizable voice and rhythm.

### What Character.ai does that works

1. **Distinct persona consistency**. Character.ai makes the chat feel like it comes from one character, not from a generic model. Atlas’s coach needs the same kind of continuity, because users should be able to predict the coach’s tone and standards from one session to the next.

2. **Fast prompt-to-response loop**. The UI is tuned for low effort, quick back-and-forth interaction. That matters for Atlas because a coach is most valuable when it can be consulted in the middle of real-life friction, not only during a formal review session.

3. **Suggestion-led participation**. Character.ai often lowers the blank-page problem by offering starter prompts and follow-up ideas. Atlas should absolutely steal that, because many users will not know how to phrase a useful coaching question on their own.

4. **Emotionally legible output**. Even when the content is simple, the delivery feels intentional and human. Atlas should be warm in that sense, but the warmth must stay anchored to action and accountability.

5. **Thread-as-relationship feeling**. Character.ai makes the thread feel like a continuing relationship, which increases return visits. Atlas can use that same retention mechanic without copying the theatrical or dependency-building parts.

### What Character.ai does that you shouldn't copy

1. **Do not copy roleplay ambiguity.** Atlas is not an entertainment product. The coach must stay grounded in real plan data and real actions, not vague persona improvisation.

2. **Do not copy emotional dependency cues.** Character.ai benefits from strong parasocial stickiness, but Atlas should not lean into “I’m always here for you” framing that can become creepy or manipulative in a health context.

3. **Do not copy infinite chat drift.** Character.ai can survive meandering conversations because the goal is engagement. Atlas needs to keep pulling the user back to adherence, logging, training, and recovery.

---

## What Atlas does today (current state)

This surface is implemented as a Today-screen entry point that opens a full-screen bottom sheet. `TodayV2` mounts `CoachChatTrigger` and `CoachChatSheet`, and `useCoachChat` manages the message state, hydration, and server calls. The sheet opens from a trigger bar labeled for coach guidance, with page-specific suggestion pills below it. Inside the sheet, the top-level structure is: header with title and close button, scrollable message area, horizontal suggestion chips, and a fixed input bar.

The chat itself is a simple message thread, not a multi-panel workspace. User messages render as solid brand-colored bubbles. Assistant messages render through `ReactMarkdown`, which gives the coach a slightly more structured feel than plain text. There is an assistant avatar, a typing indicator, and a compact action-card component for confirmations, but the backend currently never returns actions, so that pathway is effectively dormant.

The hook hydrates previous conversation from `coach_messages` on mount and stores message history in local component state. The edge function persists both sides of the exchange back to the database, loads profile, nutrition, workout, check-in, and memory context, then sends a single OpenAI chat completion. It also writes updated memory and a proactive insight into `coach_memory`, and logs spend against quota tables. In other words, the backend is doing real orchestration; the UI is only showing the result.

The visual approach is polished but restrained. It uses the app’s token system, subtle gradients, muted borders, compact spacing, and a dark-on-light neutral base with small AI-blue accents. The result is closer to a premium utility than a playful chatbot. That is directionally correct for Atlas, but the current sheet still reads as a standard mobile drawer with nice surface styling rather than a truly differentiated coaching environment.

Known issues visible from the code: the free-user gate is enforced in the sheet after one user message, but the code counts all hydrated user messages rather than messages “per day,” so the comment and the behavior do not match. The hook exposes `isHydrating`, but the sheet does not use it, so there is no loading state when prior chat history is still coming in. The edge function returns `actions: []` every time, so the confirmation cards in the UI are not actually reachable. The client also appends raw error text into the conversation on failure, which makes the chat feel less polished than the rest of the surface.

Relative to ChatGPT, the biggest gap is not “smartness”; it is interaction quality. There is no streaming, no visible sense of incremental response generation, no clear thread management, and no explicit explanation of what context the coach used. Relative to Character.ai, the gap is the opposite: Atlas is much more serious and grounded, but it still lacks a strongly recognizable coach rhythm and a more legible starter flow for people who do not know what to ask.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Add a true loading state**. Use the existing `isHydrating` signal in `CoachChatSheet` so the user sees that prior messages are loading instead of briefly seeing an empty thread. This is cheap, and it removes a moment of uncertainty that currently makes the surface feel flaky. Effort: 2-4 hours.

2. **Fix the free gate logic**. Make the gate reflect the actual quota policy instead of counting every historical user message, and move the logic closer to the server quota source so the UI and backend cannot drift. This is a trust issue as much as a monetization issue. Effort: 4-8 hours.

3. **Replace raw error echoing**. Convert failed requests into a short friendly recovery state with retry affordance instead of inserting the exception text into the chat. ChatGPT does this better by keeping failure states separate from the conversation. Effort: 2-4 hours.

4. **Show a compact context badge**. Add one short line like “Using today’s plan, check-in, and recent meals” in the sheet header or under the composer. This gives the coach credibility without adding visual clutter. Effort: 4-6 hours.

### 🟡 Steal soon — medium impact, medium effort

1. **Stream the assistant reply**. Switch the edge function and client to incremental rendering so answers arrive progressively instead of as a single blob. This is the single biggest feel upgrade from ChatGPT, and it will make the coach feel much faster even when the model latency is unchanged. Effort: 1-2 days.

2. **Expose a real reset or new thread control**. The hook already has `clearHistory`, but there is no visible entry point in the sheet. Adding a “start fresh” action would help serious users clear noise and would give general users a way to recover if the thread gets weird. Effort: 0.5-1 day.

3. **Make action cards real**. Either return structured actions from the edge function or remove the dead UI until the backend can support them. Right now the action-card affordance promises more interactivity than the system can deliver. Effort: 1-2 days.

4. **Tighten the suggestion hierarchy**. Merge default page suggestions, assistant suggestions, and task-specific prompts into a more intentional order so the most useful chip is always first. ChatGPT-style chips work best when they are clearly ranked, not just dumped into a horizontal rail. Effort: 0.5-1 day.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Add voice or multimodal input**. This would be attractive in the abstract, but for this surface it is a product decision, not a polish task. The current job is to make text chat highly trustworthy and action-oriented first; voice should only follow if it serves a measurable behavior loop. Effort: 3-5 days.

2. **Build a dedicated coach inbox or history view**. A fuller thread browser would help power users, but it risks pulling the coach out of the Today loop and making the experience feel like a separate product. This is only worth it if retention data shows that prior conversations are a major reason users come back. Effort: 2-4 days.

**Total rough effort:** about 4-8 days for a meaningful upgrade, with streaming, free-gate correction, and real action handling producing the biggest jump in perceived quality.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Coach authority vs. user warmth.** Serious users want direct, almost clinical guidance; general users need a tone that does not feel punitive. *Resolution:* keep the voice calm and concise, but make every answer end with one specific next action and one short accountability line. Do not make the UI softer to solve this; solve it by making the output more structured and more concrete.

**Tension 2 — Monetization vs. momentum.** The product wants to gate premium AI usage, but an abrupt dead-end after a single message destroys conversational momentum. *Resolution:* let free users complete one useful exchange, then switch the sheet into a clear upgrade state that explains the value they just experienced and offers a direct path to continue. Do not silently disable the composer without context.

**Tension 3 — Persistent memory vs. user trust.** The coach is supposed to remember prior context, but health users are sensitive to anything that feels like hidden surveillance. *Resolution:* make the remembered inputs legible in the UI with a tiny context line and a visible reset path. If the coach is using yesterday’s check-in or last week’s trend, say so plainly.

**Tension 4 — Serious optimizer vs. mainstream fitness user.** Power users want specificity, numbers, and speed; casual users need fewer branches and less jargon. *Resolution:* keep one coach voice, but vary the starter prompts and answer depth by page context and user behavior. Do not fork into separate personalities; that creates more inconsistency than value.

---

## Specific changes to make (actionable list)

1. **Wire `isHydrating` into `CoachChatSheet` and show an explicit loading state before the thread appears.** File(s) to touch: `src/hooks/useCoachChat.js`, `src/components/ai/CoachChatSheet.jsx`. Effort: 2-4 hours. Dependency: none.

2. **Fix the free-user gate so it reflects the actual quota policy instead of counting all historical user messages.** File(s) to touch: `src/components/ai/CoachChatSheet.jsx`, `src/hooks/useCoachChat.js`, `supabase/functions/ai-coach-chat/index.ts` if you centralize policy. Effort: 4-8 hours. Dependency: none.

3. **Add a visible “new thread” or “clear chat” control in the sheet and connect it to `clearHistory`.** File(s) to touch: `src/components/ai/CoachChatSheet.jsx`, `src/hooks/useCoachChat.js`. Effort: 3-5 hours. Dependency: task 1.

4. **Replace raw error messages with a short friendly retry state.** File(s) to touch: `src/hooks/useCoachChat.js`, `src/components/ai/CoachChatSheet.jsx`. Effort: 2-4 hours. Dependency: none.

5. **Implement streaming assistant output in the edge function and client.** File(s) to touch: `supabase/functions/ai-coach-chat/index.ts`, `src/hooks/useCoachChat.js`, `src/components/ai/CoachChatSheet.jsx`. Effort: 1-2 days. Dependency: none, but it should happen before any deeper UI polish.

6. **Return structured coach actions from the edge function or remove the dead action-card UI until they exist.** File(s) to touch: `supabase/functions/ai-coach-chat/index.ts`, `src/hooks/useCoachChat.js`, `src/components/ai/CoachChatSheet.jsx`. Effort: 1-2 days. Dependency: none.

7. **Add a small context disclosure line that tells the user what data powered the reply.** File(s) to touch: `src/components/ai/CoachChatSheet.jsx`, `supabase/functions/ai-coach-chat/index.ts` if you want to pass explicit context labels. Effort: 4-6 hours. Dependency: none.

8. **Make the suggestion rail more intentional by ranking starter prompts and assistant-generated chips separately.** File(s) to touch: `src/components/ai/CoachChatSheet.jsx`, `src/components/ai/CoachChatTrigger.jsx`, `supabase/functions/ai-coach-chat/index.ts`. Effort: 0.5-1 day. Dependency: task 5 if you want dynamic suggestions to feel alive.

9. **Align the client hydration window with the actual backend context window and clean up the misleading comment.** File(s) to touch: `src/hooks/useCoachChat.js`, `supabase/functions/ai-coach-chat/index.ts`. Effort: 1-2 hours. Dependency: none.

10. **Give the composer a stronger empty-state prompt with two concrete example asks.** File(s) to touch: `src/components/ai/CoachChatSheet.jsx`, `src/components/ai/CoachChatTrigger.jsx`. Effort: 2-4 hours. Dependency: none.

11. **Move the paywall from a passive inline blocker to an explicit upgrade moment after the first useful answer.** File(s) to touch: `src/components/ai/CoachChatSheet.jsx`, `src/pages/TodayV2.jsx`, `src/components/entitlements/PaywallTrigger` usage if needed. Effort: 0.5-1 day. Dependency: task 2.

12. **Make the coach feel more grounded by exposing the current page context in the backend prompt and a small UI label.** File(s) to touch: `src/hooks/useCoachChat.js`, `supabase/functions/ai-coach-chat/index.ts`, `src/components/ai/CoachChatSheet.jsx`. Effort: 4-6 hours. Dependency: none.

The biggest perceived-quality jump will come from tasks 2, 5, and 7. Together they solve the three things users feel immediately: whether the chat is usable, whether it is responsive, and whether it is clearly grounded in their real data.

---

## What NOT to do

1. **Do not turn this into a generic chatbot that answers every question in the same tone.** Atlas needs a coach that stays inside training, nutrition, check-ins, and plan execution.

2. **Do not copy Character.ai’s roleplay or dependency vibe.** This surface should feel supportive and stable, not emotionally sticky in a way that blurs into entertainment.

3. **Do not leave the free gate as a silent disabled input after one historical message.** If the user is being gated, they need a clear explanation of why and what they gain by upgrading.

4. **Do not surface raw technical errors as assistant messages.** That makes the coach feel brittle and breaks the illusion that the system is competent.

5. **Do not add flashy AI affordances before the core loop is trustworthy.** Voice input, multimodal input, and extra chrome are a distraction if the chat still feels delayed or disconnected from the user’s plan.

6. **Do not let memory be invisible.** If the coach is using prior sessions, today’s metrics, or adherence trends, the surface should make that legible instead of feeling vaguely omniscient.

---

## The single highest-leverage thing

Make the coach feel like a live, grounded decision-maker by streaming responses and pairing them with a visible context cue and one clear next step. That one change would close the biggest gap to ChatGPT, make Atlas’s coach feel faster and more trustworthy, and reduce the “generic AI” smell that currently comes from static replies, hidden context, and dead action wiring. If the team only does one thing, make the conversation feel immediate and specific.

**File status:** Draft 1. To be revised after implementation against reality.
