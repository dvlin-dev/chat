create extension if not exists "pgcrypto";
create extension if not exists moddatetime with schema public;

-- Profiles table mirrors auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);

create policy "Profiles can be updated by owner" on public.profiles
  for update using (auth.uid() = id);

create or replace function public.sync_profile()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do update set display_name = excluded.display_name;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.sync_profile();

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade,
  abstract text,
  model_id text,
  temperature real default 0.2,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.conversations enable row level security;

create index if not exists idx_conversations_owner_updated
  on public.conversations (owner_id, updated_at desc);

create policy "Users can access own conversations" on public.conversations
  for select using (auth.uid() = owner_id);

create policy "Users can insert own conversations" on public.conversations
  for insert with check (auth.uid() = owner_id);

create policy "Users can update own conversations" on public.conversations
  for update using (auth.uid() = owner_id);

create policy "Users can delete own conversations" on public.conversations
  for delete using (auth.uid() = owner_id);

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute procedure public.moddatetime('updated_at');

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations on delete cascade,
  owner_id uuid references auth.users,
  role text not null check (role in ('user', 'assistant', 'system')),
  status text,
  content text not null,
  metadata jsonb,
  token_count integer,
  error text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.messages enable row level security;

create index if not exists idx_messages_conversation_created
  on public.messages (conversation_id, created_at asc);

create index if not exists idx_messages_owner_created
  on public.messages (owner_id, created_at desc);

create policy "Users can read own conversation messages" on public.messages
  for select using (auth.uid() = owner_id);

create policy "Users can insert own messages" on public.messages
  for insert with check (auth.uid() = owner_id);

create policy "Users can update own messages" on public.messages
  for update using (auth.uid() = owner_id);

create policy "Users can delete own messages" on public.messages
  for delete using (auth.uid() = owner_id);

create policy "Service role can insert assistant messages" on public.messages
  for insert with check (
    auth.role() = 'service_role' and role = 'assistant'
  );

create or replace function public.set_message_owner()
returns trigger as $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger populate_message_owner
  before insert on public.messages
  for each row execute procedure public.set_message_owner();

-- Helper materialized view (optional)
create or replace view public.conversation_summaries as
select
  c.id,
  c.owner_id,
  coalesce(c.abstract, left(max(m.content) filter (where m.role = 'assistant'), 120)) as summary,
  c.updated_at,
  count(m.id) as message_count
from public.conversations c
left join public.messages m on m.conversation_id = c.id
where c.owner_id = auth.uid()
group by c.id;

-- Daily usage aggregation helper table
create table if not exists public.user_usage_daily (
  usage_date date not null,
  user_id uuid not null references auth.users,
  prompt_tokens integer default 0,
  completion_tokens integer default 0,
  total_tokens integer default 0,
  primary key (usage_date, user_id)
);

alter table public.user_usage_daily enable row level security;

create policy "Users can view own usage" on public.user_usage_daily
  for select using (auth.uid() = user_id);

create policy "Service role can modify usage" on public.user_usage_daily
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
