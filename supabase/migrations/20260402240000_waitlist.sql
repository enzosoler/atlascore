-- Waitlist / early access capture form
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  primary_goal text,
  improving text,
  current_tools text,
  interest_type text,
  created_at timestamptz not null default now()
);

-- Allow anonymous inserts (public form) but nothing else
alter table public.waitlist enable row level security;

create policy "Anyone can insert into waitlist"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

-- Only service role / admin can read
create policy "Service role can read waitlist"
  on public.waitlist for select
  to service_role
  using (true);
