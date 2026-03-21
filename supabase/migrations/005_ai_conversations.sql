-- AI Conversations: persist Atlas AI conversations in Supabase
-- Previously stored only in localStorage; now persisted for cross-device access

create table if not exists public.ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'Conversa',
  messages    jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS
alter table public.ai_conversations enable row level security;

create policy "Users can manage their own conversations"
  on public.ai_conversations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast per-user queries
create index if not exists idx_ai_conversations_user_id
  on public.ai_conversations(user_id, updated_at desc);

-- Auto-update updated_at on change
create or replace function public.update_ai_conversations_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ai_conversations_updated_at on public.ai_conversations;
create trigger ai_conversations_updated_at
  before update on public.ai_conversations
  for each row execute function public.update_ai_conversations_updated_at();
