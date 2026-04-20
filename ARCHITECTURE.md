# Atlas Core — Architecture (v2 canon)

## 🎨 THE BRAND RULE — no emojis

**Do not use emoji as UI (🔥 💪 🌿 ☀️ 🎯 📈 etc) anywhere.** Emojis render
inconsistently across platforms, look "cheap", break the dark-glass aesthetic,
and go against how premium apps (Linear, Superhuman, Whoop, Arc, Apple
Fitness) treat iconography.

Use:
- **Atlas iconography** from `src/redesign/v2/lib/icons.jsx` (clean line
  SVGs, stroke 1.75, currentColor) for all UI affordances.
- **Lucide React** (already in `package.json`) for anything the Atlas set
  doesn't cover. `import { Flame, Leaf, Target } from 'lucide-react'`.
- **Tinted badges** (small colored dots, pills, background tints) instead of
  emoji to convey severity/category.

Emojis are allowed ONLY:
- Inside user-authored content (chat messages the user typed, notes, etc).
- Inside AI-generated copy where the AI happens to output one (not a UI
  affordance).

If you're about to type `<span>🔥</span>` in JSX — STOP. Use an icon
component instead.

---

## 🚨 THE TRUST RULE — read before touching any user-facing screen

**Never fabricate user-specific data.** Ever. Fitness/health insights,
metrics, weight history, progress photos, chat history, "AI detected chicken
breast", "HRV rebounded 12%", streak counts, PR projections — ALL of it MUST
come from a real service or be explicitly empty.

The reason: our users trust Atlas with training decisions. A fake "HRV
rebounded 12%" could push someone to train hard when they're actually
under-recovered. The same mistake that leaked "Alex Johnson" into every
real user's profile applies across the product — we built it once and
need the discipline to never do it again.

**Rules of thumb:**

1. **Component defaults** may use sample data ONLY for reference-data
   (exercise catalogue, food catalogue, unit options). Never for claims
   about "your data".
2. **Route defaults** (in `App.jsx`) must always pass `[]`, `null`, or real
   service data. Never demo arrays of insights / chats / weights.
3. **Demo mode** (e.g. `?demo=1` on Today) is the only acceptable path for
   showing populated UIs with fake data — and it must be gated visibly.
4. **Empty states** are the default. Every screen must handle null/empty
   gracefully with copy that invites real data ("Log your first weight",
   "No insights yet — your coach needs data to analyze").

If you're about to add `const DEMO_*` and reference it from a component's
default prop — STOP. The answer is an empty state.

### First-login preview mode (the ONE exception)

Empty states are honest but they don't educate. New users need to see what
the app will look like WITH data. So on the very first login (before any
real data exists), the app enters **Preview Mode**:

- Every screen renders with sample/demo data populated
- **Every populated surface shows a visible "PREVIEW" label** (pill, banner,
  overlay corner) so the user knows this isn't their data
- **A persistent top strip or banner** says something like:
  *"Preview · This is sample data. Log your first meal / workout /
  weigh-in to replace it with real numbers."*
- As soon as the user logs one real entry in a domain, THAT domain exits
  preview mode (real + empty for the unentered bits). Other domains stay in
  preview until the user touches them.
- A user-visible "Exit preview" action in Settings lets them clear everything
  to full-empty state if they prefer.

**Implementation contract:**
- `AuthContext` (or a dedicated `PreviewContext`) exposes `previewMode: boolean`
  and `isDomainPreview(domain)` helpers.
- Every data-bound component accepts a `preview` prop (bool) OR detects it
  from context. When `preview === true` AND the real data is empty, render
  sample data + a `<PreviewBadge />` in the header.
- `PreviewBadge` is a shared component — always the same visual language
  (cyan pill or amber pill, tiny "PREVIEW" label, tappable to learn more).
- When saving a real entry, flip the domain's preview flag server-side
  (`user_metadata.preview_domains` array removes that domain key) so the
  next load shows real data only.

This gives new users a populated, inviting app immediately AND is fully
honest about what's real. No silent hallucination. No empty tundra on day one.

---

# AI Architecture

**Status:** Partially implemented · **Last updated:** 2026-04-18

This document is the **authoritative architecture** for every AI-touching
feature in Atlas Core. Any new feature (nutrition, coach, workout generation,
labs analysis, meal plan) MUST follow this pattern. Re-read this before adding
a new AI call.

---

## The three mechanisms (Enzo's canon)

The architecture exists to **minimize tokens** without hurting UX. Three layers:

### 1. Semantic cache with embeddings

Before calling any AI, the query is converted into a vector via OpenAI's
`text-embedding-3-small` (~$0.02 per million tokens — effectively free). The
vector is compared against stored vectors using **cosine similarity**. If the
top match scores `≥ 0.92`, we treat them as the same query and return the
cached answer — **zero tokens spent on the big model**.

Example: "monte um treino de peito para iniciante" and "crie um treino de
peitoral para quem está começando" have similarity ~0.96 → same response.

### 2. Mathematical local adjustment

When the cache hit is **semantically similar but parametrically different**
(different frequency, calories, weight), we do NOT call the AI again. We apply
math locally:

- 3× → 5× per week workout: scale sets proportionally
- 2000 kcal → 2400 kcal diet: multiply portions by 1.2
- 70 kg → 80 kg user: rescale protein by weight ratio
- Single meal recalc: all macros scale linearly with portion grams

### 3. TTL per data type

Not all data ages the same:

| Data type              | Cache TTL  | Rationale                                          |
| ---------------------- | ---------- | -------------------------------------------------- |
| Food nutrition (macros)| 90 days    | "arroz + feijão" calories essentially never change |
| Recipe generation      | 30 days    | Can be reused across users                         |
| Exercise demonstrations| 365 days   | Form/technique is evergreen                        |
| Workout plan template  | 14 days    | Updates as user progresses                         |
| Personalized workout   | 3 days     | Needs to re-check recent recovery / strain         |
| Meal plan              | 7 days     | Adjusts as user weighs in                          |
| Coach chat insight     | 24 hours   | Time-sensitive to current state                    |
| Lab interpretation     | 30 days    | Stable for same result set                         |

TTL is stored as `expires_at` on each cache row. Expired rows are skipped and
pruned nightly.

---

## Request flow (canonical)

```
  ┌──────────────────────────────────────────────────────┐
  │ Frontend                                             │
  │  sends: text · image · audio  →  Supabase Function  │
  └────────────────────┬─────────────────────────────────┘
                       ▼
  ┌──────────────────────────────────────────────────────┐
  │ Backend router (Supabase Edge Function)              │
  │  1. Validate auth + rate limit (tier: free/pro/prem) │
  │  2. Check kill switch + daily/monthly spend cap      │
  │  3. Normalize query (lowercase, trim, remove fillers)│
  └────────────────────┬─────────────────────────────────┘
                       ▼
  ┌──────────────────────────────────────────────────────┐
  │ Semantic cache layer                                 │
  │  a. Embed query via text-embedding-3-small           │
  │  b. pgvector cosine search (top-1 within TTL)        │
  │  c. If similarity ≥ 0.92 → CACHE HIT                 │
  │                         └→ apply local math adjust   │
  │                         └→ return (0 tokens spent)   │
  │  d. Otherwise → CACHE MISS                           │
  └────────────────────┬─────────────────────────────────┘
                       ▼ (miss path)
  ┌──────────────────────────────────────────────────────┐
  │ Model router                                         │
  │  • Image understanding   → GPT-4o vision             │
  │  • Nutrition text parse  → GPT-4.1-nano (cheap)      │
  │  • Workout/diet plans    → Claude Sonnet / Gemini    │
  │  • Audio transcription   → Whisper (OpenAI)          │
  └────────────────────┬─────────────────────────────────┘
                       ▼
  ┌──────────────────────────────────────────────────────┐
  │ Persist                                              │
  │  • Save (embedding, answer, type, user_id, ts, TTL)  │
  │  • Log audit row (cost, tokens, cache_hit=false)     │
  └────────────────────┬─────────────────────────────────┘
                       ▼
                Response to frontend
```

---

## Current implementation status

### ✅ Already built

| Component              | Location                                            | Notes                                 |
| ---------------------- | --------------------------------------------------- | ------------------------------------- |
| Nutrition text AI      | `supabase/functions/log-food-text/`                 | GPT-4.1-nano · string-normalized cache|
| Food vision AI         | `supabase/functions/food-vision/`                   | GPT-4o                                |
| Coach chat             | `supabase/functions/ai-coach-chat/`                 | Claude / Gemini                       |
| Decision engine        | `supabase/functions/ai-decision-engine/`            | Internal                              |
| Generic LLM invoke     | `supabase/functions/invoke-llm/`                    | Multi-provider switch                 |
| Workout text log       | `supabase/functions/log-workout-text/`              |                                       |
| Lab PDF parse          | `supabase/functions/parse-lab-pdf/`                 |                                       |
| Exercise search        | `supabase/functions/exercise-search/`               |                                       |
| Rate limit + spend caps| Inside edge functions                                | Per-tier                              |
| Audit trail            | `food_nutrition_cache`, `ai_audit_log` tables       |                                       |

### ⚠️ Partial / needs upgrade

| Component              | Current                     | Needed                                    |
| ---------------------- | --------------------------- | ----------------------------------------- |
| Nutrition cache        | String-normalized match     | **Embedding + cosine ≥ 0.92**             |
| Local math adjustment  | Not implemented             | Scale portions/macros when params differ  |
| TTL per data type      | Single TTL (if any)         | Per-type TTLs (table above)               |
| pgvector extension     | Not enabled (?)             | Enable on Supabase · add embedding column |
| Voice transcription    | Web Speech API (client-side)| Optional: Whisper server-side for PT-BR   |

### ⬜ Not built (but follows same pattern)

- Workout plan generation (Claude for complex structure)
- Meal plan generation (Claude)
- Recipe generation (Claude)
- Lab biomarker interpretation (GPT-4o with reasoning)
- Body photo progress interpretation (GPT-4o vision)

---

## APIs Enzo needs to provision

These are the secrets to add in Supabase (Dashboard → Project Settings → Edge
Functions → Secrets) via `supabase secrets set KEY=value`:

| # | Secret                    | Used by                                  | Cost profile                      | Status                |
| - | ------------------------- | ---------------------------------------- | --------------------------------- | --------------------- |
| 1 | `OPENAI_API_KEY`          | GPT-4.1-nano, GPT-4o vision, **text-embedding-3-small**, Whisper | Pay-as-you-go, embeddings ~free | Probably already set (log-food-text depends on it) |
| 2 | `ANTHROPIC_API_KEY`       | Claude Sonnet for workout/diet plans     | Pay-as-you-go                     | **Check** — needed for workout/plan generation |
| 3 | `GOOGLE_GEMINI_API_KEY`   | Gemini as fallback / cost arbitrage      | Pay-as-you-go, generous free tier | Optional but recommended |
| 4 | (no secret — DB extension)| pgvector on the Supabase Postgres        | Free with Supabase                | **Enable** — see migration below |

**Quick test:** run this in the Supabase SQL editor:

```sql
-- Check if OPENAI and pgvector are ready
select vault.create_secret('openai-api-key-check', '<your-key-here>'); -- sanity
create extension if not exists vector;  -- idempotent
select * from pg_extension where extname = 'vector';  -- should return 1 row
```

### Rate-limit + kill-switch knobs

These are Postgres values, not secrets. Already handled in `log-food-text`:

- `ai_kill_switch` boolean — toggle off all AI if something goes wrong
- `ai_daily_spend_cap_usd` / `ai_monthly_spend_cap_usd` — global ceilings
- `user_tier_limits` — per-tier per-minute/day quotas

---

## Frontend contract

Every Atlas v2 screen that needs AI calls ONE helper per domain. These helpers
all live in `src/redesign/v2/<domain>/<domain>Ai.js`:

```js
// src/redesign/v2/nutrition/nutritionAi.js
parseFoodText(text, opts)         // → { food_name, items[], totals, confidence }
parseFoodImage(blob, opts)        // → same shape from image
```

```js
// src/redesign/v2/coach/coachAi.js  (future)
askCoach(message, context, opts)  // → { reply, sources[], confidence }
```

```js
// src/redesign/v2/workouts/workoutAi.js  (future)
generateWorkout(brief, opts)      // → { name, exercises[], estimated_duration }
adaptWorkout(existing, changes)   // uses local math, not AI
```

```js
// src/redesign/v2/nutrition/mealPlanAi.js  (future)
generateMealPlan(targets, prefs)  // → { days[...7], grocery_list }
scaleMealPlan(plan, newTargets)   // uses local math, not AI
```

Every helper:
1. Posts to a Supabase edge function
2. That function runs the semantic-cache flow (above)
3. Returns structured JSON to the frontend
4. Frontend shows AI loading UI, then renders the result

The frontend NEVER calls OpenAI/Anthropic directly. All AI goes through
Supabase so we keep rate limits, caps, and audit in one place.

---

## Migration: semantic cache upgrade

Below is the SQL to upgrade `food_nutrition_cache` from string-match to
embedding-based. Apply as a new Supabase migration.

```sql
-- 1. Enable pgvector
create extension if not exists vector;

-- 2. Add embedding column + TTL
alter table food_nutrition_cache
  add column if not exists embedding vector(1536),
  add column if not exists cache_type text default 'food',
  add column if not exists expires_at timestamptz;

-- 3. Index for fast cosine search (HNSW is faster read than IVFFlat)
create index if not exists food_nutrition_cache_embedding_idx
  on food_nutrition_cache
  using hnsw (embedding vector_cosine_ops);

-- 4. Top-1 similarity search RPC
create or replace function match_food_cache(
  query_embedding vector(1536),
  match_threshold float default 0.92,
  match_type text default 'food'
)
returns table (id uuid, similarity float, payload jsonb)
language sql stable as $$
  select
    id,
    1 - (embedding <=> query_embedding) as similarity,
    jsonb_build_object(
      'original_query', original_query,
      'serving_description', serving_description,
      'calories', calories, 'protein', protein,
      'carbs', carbs, 'fat', fat, 'fiber', fiber,
      'confidence', confidence
    ) as payload
  from food_nutrition_cache
  where cache_type = match_type
    and (expires_at is null or expires_at > now())
    and 1 - (embedding <=> query_embedding) >= match_threshold
  order by embedding <=> query_embedding
  limit 1;
$$;

-- 5. Nightly prune
create or replace function prune_expired_ai_cache()
returns void language sql as $$
  delete from food_nutrition_cache where expires_at < now();
$$;
```

Then update `log-food-text` to:
- Before GPT call: embed query → call `match_food_cache(embedding, 0.92)` → if hit, return (with local math if applicable)
- After GPT call: embed query + store the embedding alongside the answer + set `expires_at = now() + interval '90 days'`

---

## Checklist for Enzo

- [ ] Confirm `OPENAI_API_KEY` is set in Supabase → Edge Functions → Secrets
- [ ] Add `ANTHROPIC_API_KEY` (for Claude, workout/diet generation)
- [ ] Add `GOOGLE_GEMINI_API_KEY` (optional, cost arbitrage fallback)
- [ ] Run `create extension if not exists vector;` in SQL editor
- [ ] Apply the migration above to `food_nutrition_cache`
- [ ] Update `log-food-text` to embed queries + use `match_food_cache` (I can do this when the env is ready)

Once these are in place, every AI feature I build for v2 will respect the three mechanisms automatically.
