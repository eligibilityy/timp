-- timp: Initial database schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- PROFILES
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  timezone text default 'UTC',
  settings jsonb default '{"workDuration": 1500, "shortBreakDuration": 300, "longBreakDuration": 900, "cyclesBeforeLongBreak": 4, "autoAdvance": true}'::jsonb,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- ============================================
-- SESSIONS
-- ============================================
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text,
  reflection text,
  duration_seconds integer not null,
  focus_score integer check (focus_score >= 1 and focus_score <= 5),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

alter table sessions enable row level security;

create policy "Users can view own sessions"
  on sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on sessions for delete
  using (auth.uid() = user_id);

-- ============================================
-- TAGS
-- =========================================  ===
create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz default now(),
  unique(user_id, name)
);

alter table tags enable row level security;

-- Global tags (user_id is null) are readable by all authenticated users
create policy "Users can view own and global tags"
  on tags for select
  using (auth.uid() = user_id or user_id is null);

create policy "Users can insert own tags"
  on tags for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tags"
  on tags for update
  using (auth.uid() = user_id);

create policy "Users can delete own tags"
  on tags for delete
  using (auth.uid() = user_id);

-- ============================================
-- SESSION_TAGS (junction table)
-- ============================================
create table session_tags (
  session_id uuid references sessions(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (session_id, tag_id)
);

alter table session_tags enable row level security;

create policy "Users can view own session_tags"
  on session_tags for select
  using (
    exists (
      select 1 from sessions where sessions.id = session_tags.session_id and sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert own session_tags"
  on session_tags for insert
  with check (
    exists (
      select 1 from sessions where sessions.id = session_tags.session_id and sessions.user_id = auth.uid()
    )
  );

create policy "Users can delete own session_tags"
  on session_tags for delete
  using (
    exists (
      select 1 from sessions where sessions.id = session_tags.session_id and sessions.user_id = auth.uid()
    )
  );

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- SEED DEFAULT TAGS (global, user_id = null)
-- ============================================
insert into tags (user_id, name, color) values
  (null, 'Coding', '#3b82f6'),
  (null, 'Reading', '#8b5cf6'),
  (null, 'Design', '#ec4899'),
  (null, 'Writing', '#f59e0b'),
  (null, 'Learning', '#10b981'),
  (null, 'Planning', '#6366f1');
