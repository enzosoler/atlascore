create table public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  revenuecat_event_id text unique not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  product_id text,
  store text,
  transaction_id text,
  original_transaction_id text,
  amount numeric,
  currency text,
  event_at timestamptz not null default now(),
  raw jsonb not null
);

create index idx_subscription_events_user_id on public.subscription_events(user_id);
create index idx_subscription_events_event_type on public.subscription_events(event_type);

alter table public.subscription_events enable row level security;

create policy "Users can read own events" on public.subscription_events
  for select using (auth.uid() = user_id);

-- Service role inserts (webhook)
