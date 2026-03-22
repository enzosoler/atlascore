-- ============================================================================
-- Atlas Core — Daily Check-ins and Extended User Profiles
-- ============================================================================

-- ─── DAILY CHECKINS TABLE ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  mood        integer check (mood between 1 and 5),
  energy      integer check (energy between 1 and 5),
  sleep_hours numeric(4,1),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.daily_checkins enable row level security;

create policy "Users manage own checkins"
  on public.daily_checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_daily_checkins_user_date
  on public.daily_checkins(user_id, date desc);

-- ─── EXTEND PROFILES WITH FITNESS FIELDS ─────────────────────────────────
alter table public.profiles
  add column if not exists full_name          text,
  add column if not exists avatar_url         text,
  add column if not exists training_goal      text,
  add column if not exists health_goals       text[],
  add column if not exists activity_level     text,
  add column if not exists current_weight     numeric(6,2),
  add column if not exists target_weight      numeric(6,2),
  add column if not exists height_cm          numeric(5,1),
  add column if not exists age                integer,
  add column if not exists sex                text,
  add column if not exists calories_target    integer,
  add column if not exists protein_target     integer,
  add column if not exists carbs_target       integer,
  add column if not exists fat_target         integer,
  add column if not exists water_target       numeric(4,1),
  add column if not exists dietary_style      text,
  add column if not exists food_preferences   text,
  add column if not exists allergies          text,
  add column if not exists meals_per_day      integer,
  add column if not exists training_experience text,
  add column if not exists training_location  text,
  add column if not exists training_frequency integer,
  add column if not exists training_session_minutes integer,
  add column if not exists onboarding_done    boolean default false,
  add column if not exists preferred_language text default 'en-US';

-- Allow users to update their own profile fitness fields
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow users to insert their own profile (for upsert)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
