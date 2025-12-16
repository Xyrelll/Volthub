# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: volthub (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project" (takes 1-2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 3: Set Up Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. (Optional) For admin operations, also add:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
   ⚠️ **Warning**: Never commit this to git! It has admin access.

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `schema.sql`
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. Verify tables were created in **Table Editor**

## Step 5: (Optional) Migrate Existing Product Data

If you want to migrate your existing products from `productData.ts`:

1. Use the migration script (to be created)
2. Or manually import via Supabase dashboard → Table Editor → Import

## Step 6: Test the Connection

Run your dev server:
```bash
pnpm dev
```

The Supabase client is now ready to use in your API routes and components!

## Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)


