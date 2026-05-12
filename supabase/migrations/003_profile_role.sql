-- Add role column to profiles
alter table public.profiles
  add column if not exists role text default null;

-- Set your role (update the UUID to your actual user ID after applying)
-- update public.profiles set role = 'dev' where id = 'YOUR_USER_ID';
