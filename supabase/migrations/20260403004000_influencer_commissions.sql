create table public.influencer_commissions (
  id uuid primary key default gen_random_uuid(),
  influencer_id uuid not null references public.influencers(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription_event_id uuid references public.subscription_events(id) on delete set null,
  payment_event_id text not null unique,
  revenue_amount numeric not null,
  commission_percent numeric not null,
  commission_amount numeric not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reversed_at timestamptz
);

create index idx_influencer_commissions_influencer_id on public.influencer_commissions(influencer_id);
create index idx_influencer_commissions_user_id on public.influencer_commissions(user_id);

alter table public.influencer_commissions enable row level security;

-- Only admins can read commissions
create policy "Admins can manage commissions" on public.influencer_commissions
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
