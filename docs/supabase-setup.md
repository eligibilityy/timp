# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Save your project credentials:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Add these to your `.env.local` file

## 2. Run the Database Migration

1. Open the **SQL Editor** in your Supabase dashboard
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run**

This creates:
- `profiles` table (auto-created on signup)
- `sessions` table (focus session records)
- `tags` table (with 6 default global tags)
- `session_tags` junction table
- Row Level Security policies on all tables
- A trigger that auto-creates a profile when a user signs up

## 3. Enable Authentication Providers

Go to **Authentication → Providers** in your Supabase dashboard.

### GitHub

1. Enable the GitHub provider
2. Create a GitHub OAuth App at [github.com/settings/developers](https://github.com/settings/developers)
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Copy the Client ID and Client Secret into Supabase

### Google

1. Enable the Google provider
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - **Authorized redirect URI:** `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Copy the Client ID and Client Secret into Supabase

## 4. Set Redirect URLs

Go to **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** Add `http://localhost:3000/auth/callback`

For production, also add:
- `https://yourdomain.com/auth/callback`

## 5. Verify Setup

After running the migration, check:
- [ ] Tables exist in **Table Editor**
- [ ] RLS is enabled (lock icon on each table)
- [ ] Default tags appear in the `tags` table
- [ ] Auth providers show as enabled
