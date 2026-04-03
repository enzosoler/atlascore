alter table public.profiles
add column if not exists influencer_id uuid references public.influencers(id),
add column if not exists creator_code text,
add column if not exists creator_attached_at timestamptz,
add column if not exists creator_locked boolean not null default false;

create index if not exists idx_profiles_influencer_id on public.profiles(influencer_id);
