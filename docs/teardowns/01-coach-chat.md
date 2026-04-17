# Teardown 01 — Coach Chat

**Surface:** AI Coach Chat (in-app chat interface with the fitness/health AI)
**Atlas file(s):** `src/components/ai/CoachChatSheet.jsx`, `src/hooks/useCoachChat.js`, `supabase/functions/ai-coach-chat/index.ts`
**Reference apps:** ChatGPT (primary), Character.ai (secondary)
**Audience tension:** High — serious users want fast answers and dense data references, general users want warmth and encouragement. Every design choice has to serve both.

---

## Why this screen matters

Coach chat is Atlas's single biggest differentiator vs. MyFitnessPal, Hevy, and most competitors. Those apps track. Atlas coaches. If the chat feels like a dumb bot, the differentiator collapses and Atlas becomes "MyFitnessPal with worse food search." If it feels intelligent and personal, it's a feature worth switching apps for and worth paying for.

Previous sessions already flagged this surface as weak (low temperature, no memory persistence, thin system prompt, weak model). This teardown is about the *visual/interaction design* that wraps the underlying intelligence — the things that make a smart backend *feel* smart to the user.

---

## Reference app 1 — ChatGPT (primary)

ChatGPT is the mental model every user brings to every AI chat. Fighting that mental model is an uphill battle. The design lessons below are the specific patterns ChatGPT has converged on after years of A/B testing.

### What ChatGPT does that works

**1. Thread-less by default, but thread-able.** The main screen is a single ongoing conversation. No "start new thread" friction for casual use. But threads exist in a sidebar when the user wants to organize — accessed on demand, not in your face. For fitness coaching, this maps to: users don't want to "pick a conversation" every time. They want to just talk.

**2. Streaming tokens, always.** Text appears word-by-word, even for short responses. This is not a rendering quirk — it's a deliberate perception tool. Users tolerate 5 seconds of streaming far better than 2 seconds of blank screen. Apps that return completed text feel slower even when they're faster.

**3. Markdown rendering with restraint.** ChatGPT renders bold, lists, code blocks, tables — but doesn't force them. The model chooses format based on content. For fitness, this is crucial: a workout plan renders as a table, a motivational response renders as prose, a macro breakdown renders as a list. The UI has to support all three gracefully.

**4. Minimal chrome.** No avatars for the user or AI on each message. No timestamps on every bubble. No "AI is thinking" animations beyond a subtle pulse. The chat is the content; everything else gets out of the way.

**5. Persistent compose box.** The input field stays pinned to the bottom on scroll. The user can always type without hunting for the input. Attachments, voice, and model selection live as small icons inside or beside the input, not as separate buttons.

**6. Examples as starting prompts.** For new users with no history, ChatGPT shows 3-4 example prompts. These are specifically chosen to demonstrate range — one capability prompt, one creative, one analytical, one practical. Click-to-insert into the input field.

**7. "Regenerate" and "edit" affordances.** The user can regenerate the last response, edit their own message to re-prompt, or branch. These live as small icons that only appear on hover/long-press — never cluttering the default view.

**8. Chat title auto-generation.** The first exchange generates a short title for the thread (e.g., "Cutting phase macros"). The user never has to name conversations.

### What ChatGPT does that you shouldn't copy

**1. The empty state with no personality.** ChatGPT's empty state is a single prompt input and a logo. For a coaching app, this is too cold. Coach is supposed to be *someone*, not something.

**2. Model switcher complexity.** ChatGPT now has GPT-4, o1, o3, GPTs, custom instructions. For Atlas, one coach is enough. Don't surface any of this.

**3. Reference list at the bottom of search responses.** ChatGPT Search returns with a big sources panel. Your coach doesn't need that — it's drawing from the user's own data, not the web.

---

## Reference app 2 — Character.ai (secondary)

Character.ai is the opposite end of the spectrum: chat UI built around *personality first, information second.* Worth studying because the Whoop/MacroFactor audience wants ChatGPT-style density, but the Noom/Cal AI audience wants a relationship with a character. Coach chat has to feel warm without feeling fake.

### What Character.ai does that works

**1. Persistent character avatar in the thread.** Not on every message — but a single avatar visible at the top of the thread that doesn't scroll away. This grounds the conversation in "I'm talking to someone," not "I'm querying a model."

**2. Typing indicator with character name.** "Coach is typing..." vs a generic ellipsis. Tiny thing, big feel difference.

**3. In-thread messages of reflection/memory.** Character.ai occasionally surfaces lines like "*remembers your last conversation about cutting*" as inline subtle text. For a fitness coach, this is gold — it makes the memory feature *visible* to the user, which is where most AI memory fails in perception even when it works in reality.

**4. Action suggestions after a response.** After an AI message, Character.ai sometimes shows 2-3 chip-style follow-ups like "Tell me more" or "Why?" Contextual, not a fixed menu. For coaching, these could be "Log this workout," "Show me my trend," "Remind me tomorrow."

### What Character.ai does that you shouldn't copy

**1. Heavy character branding.** Custom fonts, character-specific color schemes, roleplay framing. Atlas coach is a coach, not a fictional character. Warmth, yes; roleplay, no.

**2. Emotional escalation patterns.** Character.ai is optimized for engagement-via-intimacy. That pattern is actively dangerous for a health app — you're not trying to build parasocial dependency, you're trying to help someone hit their goals.

---

## What Atlas does today (current state)

From reading the code in prior sessions:

- `CoachChatSheet.jsx` uses an in-component state for messages (`useCoachChat.js:27-28`) — no DB persistence, so messages die on page refresh.
- System prompt is tone/style rules only — no coaching substance.
- Temperature 0.3, max_tokens 400 — produces short, nervous responses.
- Model is `gpt-4o-mini` — weakest link for coaching judgment.
- No visible memory surfacing. Even if `coach_memory` table were populated, user wouldn't see it being used.
- No streaming (need to verify — might be, but prior session implied it isn't).
- Free users hit a client-side rate limit that resets on app reopen.
- Sheet-based UI — slides up from bottom, covers most of the screen but not full-screen.

**Visible gaps just from this code read:**
- No empty state worth looking at
- No suggested prompts for new users
- No "Coach is thinking" indicator
- No memory surfacing
- No action chips after responses
- No thread history (one rolling convo)
- No way to see "what coach knows about me" (transparency)

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

**1. Stream responses token-by-token.** This is the single biggest perceived-quality upgrade available. Users tolerate 8 seconds of streaming better than 3 seconds of blank. OpenAI's API supports streaming natively; the only work is on the frontend to render progressively. If Atlas isn't streaming today, this is a 1-day fix that changes the feel of the whole feature.

**2. Named typing indicator.** "Coach is thinking..." with a small pulse dot, not a generic spinner. Coach needs a name — in Atlas's case "Coach" is fine, or give them a single name (not multiple personas). The indicator should appear within 100ms of send, even if the real response is 2s away.

**3. Three starter prompts on empty state.** Not generic ("Ask me anything"). Specific to what this user just did:
   - "Why did I gain 1.2 lbs this week?" (trend-aware)
   - "Plan my workout for tomorrow" (action-oriented)
   - "How's my protein intake this week?" (nutrition context)

The prompts should be dynamically generated from the user's recent data — if they haven't logged any food, don't show the protein prompt. If they've logged every day for two weeks, show a harder question like "What's holding me back from my goal weight?"

**4. Action chips after responses.** When the coach says "you should bump protein by 20g," show chips: `Log this` / `Set a reminder` / `Show me the data`. These turn chat from a talking surface into a doing surface. The model returns the chips in a structured JSON field alongside text; the UI renders them as tappable buttons.

**5. Memory surfacing as inline subtle text.** When coach uses a remembered fact, prefix with a tiny gray italic line: "*based on your last week of logs*" or "*remembering you mentioned your knee on Tuesday*." Not on every message — only when memory is actually being used. This is the #1 fix for the "coach feels dumb" complaint, because even smart coaches feel dumb when the user can't tell they're remembering anything.

### 🟡 Steal soon — medium impact, medium effort

**6. Editable user messages.** Let users edit their last message and resend. Tiny pencil icon on long-press. Common in ChatGPT, absent in most fitness AI — easy win.

**7. Thread titles auto-generated.** After the first exchange, name the thread ("Cutting macros," "Deload week planning"). Show thread history in a small drawer accessible from the top-left, not as a main-nav item. This keeps single-thread default but gives power users a way to revisit.

**8. "What does Coach know about me?" transparency screen.** A tappable info button in the corner of the chat that opens a sheet listing everything coach knows: your stats, your goal, your recent trends, recent conversations. This is the killer trust feature that MacroFactor does for macros and almost nobody does for AI. Paired with #5 (inline memory surfacing), it makes the intelligence *visible*.

**9. Voice input.** Native iOS microphone button in the compose box. For gym use where typing sucks. Capacitor plugin handles this.

### 🔴 Consider carefully — high effort or audience-dependent

**10. Full-screen chat vs. sheet.** Currently Atlas uses a bottom sheet. ChatGPT is full-screen. Full-screen is more immersive but fights the "quick question" use case. Recommendation: *keep sheet as default*, but allow swipe-up-to-expand to full-screen for deep conversations. Best of both.

**11. Coach avatar/illustration.** Character.ai has a visual character. ChatGPT doesn't. For Atlas, recommendation: *a single subtle avatar at the top of the thread*, not on every message. A simple geometric illustration, not a photo or anthropomorphic cartoon. Keep it abstract — the moment it becomes a specific person (white male trainer, etc.), you've alienated half your audience.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Density vs. warmth.**
Serious users want a response like "Your 30-day weight regression slope is -0.3 lb/wk. You're under target deficit. Consider +200 kcal/day." General users want "You're making steady progress — down a bit this month. Let's bump calories slightly so you don't lose steam." *Resolution:* have the coach default to warm-then-specific. Open with the human framing, follow with the number. Both audiences get what they want. The system prompt should enforce this structure.

**Tension 2 — Free vs. paid messaging limits.**
Prior code shows a client-side rate limit for free users that resets on reload (a bug per prior QA). *Resolution:* keep the limit, fix the bypass, but make the rate limit *feel fair*. When free user hits the limit, don't show "upgrade to chat more." Show "You've used 5 of 5 coach messages today. Resets at midnight. Want unlimited? [upgrade]." This is more honest, less pushy, converts better in practice (RevenueCat data from 2024).

**Tension 3 — Proactive vs. reactive coaching.**
Chat is reactive — user asks, coach answers. But the best coaching moments are proactive — "hey, you missed the gym Saturday again, what's up?" *Resolution:* proactive coaching lives in a *separate* surface (Coach Insights, teardown #11), not inside chat. Chat is the user-initiated surface. Insights is the coach-initiated surface. Don't mix them or both get confused.

**Tension 4 — AI honesty about limitations.**
The coach will sometimes get things wrong. Serious users will notice and trust-break. *Resolution:* build in a "Was this helpful?" on every response (👍/👎 — silent logging, no friction prompt). When coach gives nutrition/medical-adjacent advice, include a subtle line: "I can't replace a registered dietitian — for specific conditions, check with a pro." Not on every message — only when the model's system prompt detects medical territory.

---

## Specific changes to make (actionable list)

If someone wanted to take this teardown and implement it directly, here's the ordered list:

1. Add streaming support to `ai-coach-chat` edge function (OpenAI supports `stream: true`) — **1 day**
2. Add progressive rendering to `CoachChatSheet.jsx` to display stream — **1 day**
3. Replace generic spinner with "Coach is thinking..." named indicator — **2 hours**
4. Generate 3 starter prompts server-side on first open of an empty thread, based on user's recent data — **2 days**
5. Add structured `suggested_actions` field to coach responses; render as chips in UI — **2 days**
6. Inline memory cues — when the response uses remembered context, prepend a small italic line (model returns this as a field in response) — **2 days**
7. "What does Coach know about me?" info sheet — **1 day**
8. Editable user messages — **half day**
9. Voice input via Capacitor mic plugin — **1 day**
10. Auto-named threads + history drawer — **2 days**
11. System prompt rewrite: warm-then-specific structure, medical-territory awareness — **half day, high leverage**
12. Fix free-tier rate limit messaging (honest, not pushy) — **2 hours**

**Total estimate: ~13 days of focused work.** Most of the gain comes from items 1, 2, 3, 5, 6, and 11 — roughly 7 days for the biggest jump.

---

## What NOT to do

- Do **not** add voice *output* (AI speaking the response aloud). It feels novel for 2 uses then annoying. Nobody wants their phone talking about their protein intake on the subway.
- Do **not** add a character-selection system ("choose your coach personality"). Single coach, consistent voice, earned through quality.
- Do **not** integrate the coach chat with push notifications ("Coach messaged you!"). Proactive coaching belongs in Insights, not as chat pings. Chat-as-notification feels spammy and breaks the user-initiated mental model.
- Do **not** let the coach sign off messages with emojis or exclamation points by default. Let the *content* be warm; the *punctuation* should stay grounded. Users can set a preference for "more casual tone" if they want.
- Do **not** add a "share this response" button. Coach conversations should feel private. If the user wants to share, screenshot works fine.

---

## One last thing — the thing that makes the biggest difference

If you do only one thing from this teardown, make it **streaming with a named typing indicator.** Streaming alone takes coach from "nervous intern with latency" to "thoughtful assistant." No other single change produces as big a perception upgrade. Everything else on this list matters, but streaming is the unlock.

---

**File status:** Draft 1. Revise after implementation, before Teardown 02.
