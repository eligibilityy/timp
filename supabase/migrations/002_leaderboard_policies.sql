-- timp: Add leaderboard support
-- Opens up read access to sessions and profiles for authenticated users

-- Allow authenticated users to read all sessions (for leaderboard aggregation)
drop policy if exists "Users can view own sessions" on sessions;
create policy "Users can read all sessions"
  on sessions for select
  to authenticated
  using (true);

-- Allow authenticated users to read all profiles (for leaderboard display names)
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can read all profiles"
  on profiles for select
  to authenticated
  using (true);
