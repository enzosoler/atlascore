create table public.influencers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  display_name text not null,
  commission_percent numeric not null default 20,
  commission_model text not null default 'first_payment_only',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.influencers enable row level security;

-- Admins can manage influencers
create policy "Admins can manage influencers" on public.influencers
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Anyone can read active influencers (needed for code validation)
create policy "Anyone can read active influencers" on public.influencers
  for select using (active = true);
