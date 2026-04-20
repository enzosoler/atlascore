# atlas.core — Backend TODO

Consolidated list of every backend dependency the v2 frontend is waiting on.
Organized by priority. Each item shows: what UI is blocked, the schema/contract
needed, and the file that wires it on the client.

## Status legend

- 🔴 **P0** — Blocks launch. UI shows "coming soon" toasts or fake fallbacks.
- 🟡 **P1** — Ships at launch with empty states; better DX with this wired.
- 🟢 **P2** — Post-launch. Scaffolded but not announced as available.

### Backend deploy status (2026-04-18)

| # | Item | DB Status |
|---|------|-----------|
| 1 | Avatars bucket + RLS | ✅ Created (bucket + 4 policies) |
| 2 | RevenueCat dashboard | ❌ Manual — needs Apple/Google/RC dashboards |
| 3 | workout_sessions + workout_sets | ✅ Created (tables + RLS + indexes) |
| 4 | routines | ✅ Created (tables + RLS + indexes) |
| 5 | Profile / user_metadata | ✅ Already works (auth.users + profiles table) |
| 6 | Body tracking | ✅ Covered by existing `measurements` + `progress_photos` + `daily_checkins` (added soreness, stress cols) |
| 7 | Nutrition | ✅ `food_logs` exists + created `custom_foods`, `water_entries`, `meal_plan_templates` |
| 8 | Lab biomarkers | ✅ `lab_exams` exists + created `lab_biomarkers` |
| 9 | subscription_events | ✅ Already existed |

---

## 🔴 P0 — Launch blockers

### 1. Storage bucket: `avatars`

**Blocks:** Profile editor avatar upload (`ProfileEditor.jsx`)
**Symptom:** Toast "Avatar upload failed: storage bucket not configured"

Setup in Supabase dashboard (or run the SQL below):

```sql
-- Create bucket via dashboard UI: Storage → New bucket → name "avatars",
-- public ON, size limit 8 MB, MIME image/*

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Avatars are publicly readable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');
```

---

### 2. RevenueCat dashboard configuration

**Blocks:** Real subscription purchases (`Paywall.jsx`, `SubscriptionSettings.jsx`)
**Symptom:** Toast "Billing setup pending"

Follow `/docs/REVENUECAT_SETUP.md` end-to-end. Required deliverables:

- 3 products created in App Store Connect + Play Console:
  - `atlas_core_pro_weekly` ($3.99/wk, no trial)
  - `atlas_core_pro_monthly` ($9.99/mo, 7-day trial)
  - `atlas_core_pro_yearly` ($79/yr, 7-day trial)
- All 3 imported into RevenueCat
- One entitlement `pro` attached to all 3
- One offering `default` with packages `$rc_weekly`, `$rc_monthly`, `$rc_annual`
- Env vars set: `VITE_REVENUECAT_IOS_KEY`, `VITE_REVENUECAT_ANDROID_KEY`, `VITE_REVENUECAT_WEB_KEY`
- Webhook → Supabase Edge Function for tier sync (schema for `subscription_events` table is in the setup doc)

---

### 3. Workout sessions table

**Blocks:** Real training history (`WorkoutHistory.jsx`, `ExerciseDetail.jsx` history tab, `BodyCompositionHistory.jsx` cross-references)
**Symptom:** Empty state "No history yet"

```sql
CREATE TABLE workout_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id    uuid REFERENCES routines(id) ON DELETE SET NULL,
  started_at    timestamptz NOT NULL,
  ended_at      timestamptz,
  duration_sec  int,
  total_volume_kg numeric,
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON workout_sessions (user_id, started_at DESC);

CREATE TABLE workout_sets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id   text NOT NULL,                 -- matches DEMO_EXERCISES id (e.g., 'ch1')
  set_index     int NOT NULL,                  -- 1-indexed position within the exercise
  weight_kg     numeric,
  reps          int,
  rir           int,                           -- reps-in-reserve
  rest_sec      int,
  is_warmup     boolean NOT NULL DEFAULT false,
  performed_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON workout_sets (session_id);
CREATE INDEX ON workout_sets (exercise_id, performed_at DESC);

-- RLS
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own sessions" ON workout_sessions
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users access own sets" ON workout_sets
  FOR ALL USING (
    session_id IN (SELECT id FROM workout_sessions WHERE user_id = auth.uid())
  );
```

Client wiring needed:
- `ActiveWorkout.jsx` — on finish: insert session + sets via `supabaseClient`
- `ExerciseDetail.jsx` `HistoryTab` — query sets by `exercise_id` + user
- `WorkoutHistory.jsx` — list sessions paginated

---

### 4. Routines table

**Blocks:** "Use this routine" CTA (`RoutinePresetDetail.jsx`), saved routines (`Routines.jsx`)
**Symptom:** Toast "will be saved once sync is wired"

```sql
CREATE TABLE routines (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  source_preset_id text,                       -- matches ROUTINE_PRESETS id when cloned
  days          jsonb NOT NULL,                -- shape matches preset.days
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz
);
CREATE INDEX ON routines (user_id, last_used_at DESC NULLS LAST);

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own routines" ON routines
  FOR ALL USING (user_id = auth.uid());
```

Client wiring:
- `RoutinePresetDetail.jsx` — `onUsePreset` clones preset.days into a routine row
- `Routines.jsx` — query by user, sort by `last_used_at`

---

### 5. Profile / user_metadata keys

**Blocks:** Anything reading user info (`Profile.jsx`, `ProfileEditor.jsx`, all hero greetings, AI coach personalization)
**Symptom:** Empty greetings, "User" instead of name

The frontend reads/writes these keys via `supabase.auth.updateUser({ data: {...} })`:

| Key | Type | Source |
|---|---|---|
| `first_name` | text | ProfileEditor + Signup (already split, fix Signup if not) |
| `last_name` | text | ProfileEditor |
| `full_name` | text (derived) | ProfileEditor sets it as `firstName lastName` |
| `display_name` | text | ProfileEditor (used for public profile + feed) |
| `avatar_url` | text | ProfileEditor avatar upload |
| `bio` | text (≤160 chars) | ProfileEditor |
| `date_of_birth` | text (ISO) | ProfileEditor |
| `gender` | enum (`male\|female\|non_binary\|prefer_not_to_say`) | ProfileEditor |
| `height_cm` | number | ProfileEditor |
| `unit_preference` | enum (`metric\|imperial`) | ProfileEditor |
| `experience_level` | enum (`beginner\|intermediate\|advanced`) | ProfileEditor |
| `primary_goal` | enum (`strength\|hypertrophy\|endurance\|weight_loss\|health\|general`) | ProfileEditor |
| `training_days_per_week` | int 1-7 | ProfileEditor |
| `tier` | enum (`free\|pro`) | RevenueCat webhook (read-only client-side) |

These live in Supabase `auth.users.raw_user_meta_data` JSONB — no separate table needed unless we need to search/aggregate (then mirror into a `profiles` view).

---

## 🟡 P1 — Ship with empty states, wire post-launch

### 6. Body tracking tables

**Blocks:** Real body data history (`Measurements.jsx`, `BodyCompositionHistory.jsx`, `WeightEntry.jsx`, `ProgressPhotos.jsx`)

```sql
CREATE TABLE body_weight_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_at   timestamptz NOT NULL,
  weight_kg     numeric NOT NULL,
  body_fat_pct  numeric,
  source        text,                          -- 'manual' | 'apple_health' | 'fitbit' | etc
  note          text
);
CREATE INDEX ON body_weight_log (user_id, measured_at DESC);

CREATE TABLE body_measurements (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_at   timestamptz NOT NULL,
  unit          text NOT NULL CHECK (unit IN ('cm','in')),
  waist         numeric,
  hips          numeric,
  chest         numeric,
  left_bicep    numeric,
  right_bicep   numeric,
  left_thigh    numeric,
  right_thigh   numeric,
  left_calf     numeric,
  right_calf    numeric,
  neck          numeric,
  shoulders     numeric
);
CREATE INDEX ON body_measurements (user_id, measured_at DESC);

CREATE TABLE progress_photos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  captured_at   timestamptz NOT NULL,
  pose          text NOT NULL CHECK (pose IN ('front','side','back')),
  image_url     text NOT NULL,
  weight_kg     numeric,
  body_fat_pct  numeric
);
CREATE INDEX ON progress_photos (user_id, captured_at DESC);

CREATE TABLE body_checkins (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_at    timestamptz NOT NULL,
  mood          int CHECK (mood BETWEEN 1 AND 5),
  energy        int CHECK (energy BETWEEN 1 AND 5),
  soreness      int CHECK (soreness BETWEEN 1 AND 5),
  stress        int CHECK (stress BETWEEN 1 AND 5),
  sleep_hours   numeric,
  note          text
);

-- RLS for all four
ALTER TABLE body_weight_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_checkins      ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  FOR t IN SELECT unnest(ARRAY['body_weight_log','body_measurements','progress_photos','body_checkins']) LOOP
    EXECUTE format('CREATE POLICY "Users access own %s" ON %s FOR ALL USING (user_id = auth.uid())', t, t);
  END LOOP;
END $$;
```

Storage bucket `progress-photos` needed (similar RLS to avatars but private — only owner SELECT).

---

### 7. Nutrition tables

**Blocks:** Server-synced food/water/macro data (today everything is `localStorage`)

```sql
CREATE TABLE nutrition_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consumed_at   timestamptz NOT NULL,
  meal_slot     text CHECK (meal_slot IN ('breakfast','lunch','dinner','snack')),
  food_name     text NOT NULL,
  brand         text,
  serving_amount numeric NOT NULL,
  serving_unit  text NOT NULL,
  kcal          numeric NOT NULL,
  protein_g     numeric NOT NULL DEFAULT 0,
  carbs_g       numeric NOT NULL DEFAULT 0,
  fat_g         numeric NOT NULL DEFAULT 0,
  fiber_g       numeric,
  sugar_g       numeric,
  sodium_mg     numeric,
  source        text,                          -- 'photo' | 'voice' | 'text' | 'barcode' | 'manual'
  source_payload jsonb                         -- raw AI parse, for audit/recoverability
);
CREATE INDEX ON nutrition_entries (user_id, consumed_at DESC);

CREATE TABLE custom_foods (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  brand         text,
  serving_amount numeric,
  serving_unit  text,
  kcal          numeric,
  protein_g     numeric,
  carbs_g       numeric,
  fat_g         numeric,
  fiber_g       numeric,
  sugar_g       numeric,
  sodium_mg     numeric,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON custom_foods (user_id, name);

CREATE TABLE water_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consumed_at   timestamptz NOT NULL,
  amount_ml     int NOT NULL
);
CREATE INDEX ON water_entries (user_id, consumed_at DESC);

CREATE TABLE meal_plan_templates (        -- public catalog (no user_id)
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  name          text NOT NULL,
  kcal_min      int,
  kcal_max      int,
  protein_pct   int,
  carb_pct      int,
  fat_pct       int,
  description   text
);
```

RLS — same pattern as body tables. `meal_plan_templates` public-readable.

---

### 8. Lab biomarkers

**Blocks:** `LabsOverview.jsx`, `BiomarkerDetail.jsx`, `LabExamDetail.jsx`

```sql
CREATE TABLE lab_exams (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collected_at  timestamptz NOT NULL,
  lab_name      text,
  raw_pdf_url   text,
  status        text DEFAULT 'parsed',         -- 'uploaded' | 'parsing' | 'parsed' | 'failed'
  parse_meta    jsonb
);

CREATE TABLE lab_biomarkers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id       uuid NOT NULL REFERENCES lab_exams(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loinc_code    text,
  name          text NOT NULL,
  value         numeric,
  unit          text,
  reference_low numeric,
  reference_high numeric,
  flag          text                           -- 'normal' | 'low' | 'high' | 'critical'
);
CREATE INDEX ON lab_biomarkers (user_id, name, exam_id);
```

Storage bucket `lab-pdfs` (private, owner-only access).

Edge function: `parse-lab-pdf` — already exists per project summary, verify it writes to these tables.

---

### 9. Subscription events table

**Blocks:** Server-side tier enforcement, audit trail

```sql
CREATE TABLE subscription_events (
  id            bigserial PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type    text NOT NULL,                 -- 'INITIAL_PURCHASE' | 'RENEWAL' | 'CANCELLATION' | etc
  product_id    text,
  entitlement   text,
  occurred_at   timestamptz NOT NULL,
  store         text,                          -- 'app_store' | 'play_store' | 'stripe'
  raw_payload   jsonb NOT NULL,
  received_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON subscription_events (user_id, occurred_at DESC);
```

Edge function `revenuecat-webhook` — see `/docs/REVENUECAT_SETUP.md` section 12.

---

## 🟢 P2 — Post-launch

### 10. Social tables (post-launch)

**Blocks:** Social domain (`SocialFeed`, `Friends`, `Follow`, `PublicProfile`, `ShareWorkout`)

```sql
CREATE TABLE friendships (
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  state text NOT NULL CHECK (state IN ('pending','accepted','blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_a, user_b),
  CHECK (user_a < user_b)
);

CREATE TABLE follows (
  follower  uuid NOT NULL,
  followee  uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower, followee)
);

CREATE TABLE feed_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind          text NOT NULL,                 -- 'workout' | 'pr' | 'body_milestone' | 'lab'
  payload       jsonb NOT NULL,
  visibility    text NOT NULL CHECK (visibility IN ('public','friends','private')),
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON feed_items (user_id, created_at DESC);

CREATE TABLE feed_item_likes (
  feed_item_id  uuid NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (feed_item_id, user_id)
);

CREATE TABLE feed_item_comments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id  uuid NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL,
  body          text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public_profiles (
  user_id       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text UNIQUE NOT NULL,
  display_name  text,
  bio           text,
  is_indexed    boolean NOT NULL DEFAULT true
);
```

Edge functions:
- `social-feed-aggregator` — produces user's feed from friends + follows
- `social-friends-resolver` — accept/reject + symmetric writes
- `social-search-users` — username search
- `social-public-profile` — render public profile data

---

### 11. AI usage tracking

**Blocks:** Cost-control enforcement of `LIMITS` from `plans.js`

```sql
CREATE TABLE ai_usage (
  id            bigserial PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature       text NOT NULL,                 -- 'coach_chat' | 'food_vision' | 'voice_log' | 'lab_parser'
  model         text NOT NULL,
  input_tokens  int,
  output_tokens int,
  cost_usd      numeric,
  occurred_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON ai_usage (user_id, feature, occurred_at DESC);
```

Edge functions for AI features (`log-food-text`, `ai-coach-chat`, `food-vision`, `voice-transcribe`) all need to:
1. Check `ai_usage` count for current user vs `LIMITS[feature]` based on tier
2. Reject with `429` if limit exceeded
3. Insert a row after the API call with token + cost
4. Return remaining quota in response headers (`X-Quota-Remaining`)

Frontend rate-limit feedback uses these headers to show "5 messages left this week" hints in the UI.

---

### 12. Misc edge functions / integrations

- `streak-aggregator` — nightly job that computes streaks from workout/nutrition logs (powers `StreaksDetail`)
- `achievement-detector` — runs on workout/PR insert, fires `/app/today/celebrate/<kind>` deep link via push notification
- `tdee-calculator` — Mifflin-St Jeor + activity multiplier (replaces the dumb `weight_kg × 32` in `MacroTargets`)
- `meal-plan-generator` — AI-driven plan generation from user goals (Pro only)
- Apple Health / Google Fit integrations — already SDK installed, need permission flows + sync workers

---

## Quick prioritization for ship-week

If you can only do 5 things before launch:

1. ✅ Avatars storage bucket + RLS (15 min, blocks Profile editor)
2. ✅ RevenueCat dashboard end-to-end (1-3 days inc. Apple/Play approval)
3. ✅ workout_sessions + workout_sets tables + ActiveWorkout save wiring (4 hours)
4. ✅ user_metadata keys verified after Signup (30 min)
5. ✅ subscription_events + RevenueCat webhook → tier sync (2 hours)

Everything else can ship as honest empty states on day 1 and get wired in post-launch sprints.
