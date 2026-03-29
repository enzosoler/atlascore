-- ─── push_tokens ──────────────────────────────────────────────────────────────
-- Stores APNs (iOS) and FCM (Android) device tokens for push notification
-- delivery. One row per user×token pair so the same user can have multiple
-- devices. Tokens are upserted on every app launch; stale tokens (uninstalled
-- apps) are cleaned up server-side when APNs/FCM returns a 410/404 response.

create table if not exists public.push_tokens (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  token       text        not null,
  platform    text        not null check (platform in ('ios', 'android', 'web')),
  -- optional device fingerprint for multi-device management
  device_id   text,
  -- app version that last saved this token (useful for debugging)
  app_version text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- one row per user+token combination
  unique (user_id, token)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

-- Primary lookup: find all active tokens for a user before sending a push.
create index if not exists push_tokens_user_id_idx on public.push_tokens (user_id);

-- Platform filter: useful when sending iOS-only or Android-only batches.
create index if not exists push_tokens_platform_idx on public.push_tokens (platform);

-- ── Row-Level Security ───────────────────────────────────────────────────────

alter table public.push_tokens enable row level security;

-- Users can only read/write their own tokens.
-- The server-side Edge Function uses the service_role key and bypasses RLS.
create policy "users can manage own push tokens"
  on public.push_tokens
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── updated_at trigger ───────────────────────────────────────────────────────

create or replace function public.set_push_tokens_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists push_tokens_set_updated_at on public.push_tokens;
create trigger push_tokens_set_updated_at
  before update on public.push_tokens
  for each row execute function public.set_push_tokens_updated_at();
