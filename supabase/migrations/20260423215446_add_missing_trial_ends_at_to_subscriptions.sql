alter table public.subscriptions
add column if not exists trial_ends_at timestamptz;

create index if not exists idx_subscriptions_trial_ends_at
on public.subscriptions(trial_ends_at)
where status = 'trialing';