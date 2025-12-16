# Supabase Setup Guide for VoltHub

## Quick Answer to Your Questions

### ✅ **No separate repo needed!**
Supabase is a cloud service (like AWS or Google Cloud). You connect to it from this project using API keys. Everything stays in this repository.

### **Why Supabase over MongoDB?**
- ✅ **Better for your use case**: Your products have structured data (categories, specifications, variations) - SQL fits perfectly
- ✅ **Built-in features**: Auth, storage, real-time subscriptions included
- ✅ **TypeScript support**: Auto-generated types from your database schema
- ✅ **Free tier**: 500MB database, 1GB file storage, 2GB bandwidth/month
- ✅ **Next.js optimized**: Official client library works seamlessly with App Router

---

## Setup Steps

### 1. Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up (free) or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `volthub` (or your choice)
   - **Database Password**: Create a strong password ⚠️ **Save this!**
   - **Region**: Choose closest to your users (e.g., `Southeast Asia (Singapore)`)
5. Click **"Create new project"** (takes 1-2 minutes)

### 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 3. Create Environment Variables File

Create a file called `.env.local` in your project root:

```bash
# In your terminal, from project root:
touch .env.local
```

Add these to `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (for admin operations)
# Get this from Settings → API → service_role key
# ⚠️ NEVER commit this to git! It has admin access.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Your existing SMTP config (keep these)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

**Important**: 
- `.env.local` is already in `.gitignore` - it won't be committed
- Replace `your-project-id` and `your-anon-key-here` with your actual values

### 4. Create Database Tables

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from this project
4. Copy **all** the SQL code
5. Paste it into the SQL Editor
6. Click **"Run"** (or press `Cmd/Ctrl + Enter`)
7. You should see: "Success. No rows returned"

**Verify tables were created:**
- Go to **Table Editor** (left sidebar)
- You should see: `products`, `contact_submissions`, `category_banners`

### 5. Test the Connection

```bash
# Make sure your .env.local is set up, then:
pnpm dev
```

If there are no errors, you're connected! 🎉

---

## How to Use Supabase in Your Code

### Example: Fetch Products (API Route)

```typescript
// src/app/api/products/route.ts
import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let query = supabase.from('products').select('*');

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data: products, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products });
}
```

### Example: Save Contact Submission

```typescript
// src/app/api/contact/route.ts
import { createServerClient } from '@/lib/supabase';

export async function POST(request: Request) {
  const { firstName, lastName, email, ... } = await request.json();
  const supabase = createServerClient();

  // Save to database
  const { error } = await supabase
    .from('contact_submissions')
    .insert({
      first_name: firstName,
      last_name: lastName,
      email: email,
      // ... other fields
    });

  if (error) {
    console.error('Database error:', error);
  }

  // Still send email (your existing code)
  // ...
}
```

---

## Next Steps (Optional)

1. **Migrate existing products**: Create a script to import products from `productData.ts` to Supabase
2. **Update API routes**: Modify `/api/products` to fetch from database instead of static file
3. **Add admin panel**: Use Supabase dashboard or build a custom admin interface
4. **Add image storage**: Use Supabase Storage for product images

---

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists in project root
- Check that variable names match exactly (case-sensitive)
- Restart your dev server after adding env vars

### "relation does not exist"
- You haven't run the SQL schema yet
- Go to SQL Editor and run `schema.sql`

### Connection timeout
- Check your internet connection
- Verify the Project URL is correct
- Check if Supabase project is paused (free tier pauses after inactivity)

---

## Resources

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase TypeScript Types](https://supabase.com/docs/guides/api/generating-types)

---

## Summary

✅ **No separate repo** - Everything stays in this project  
✅ **Supabase is better** - SQL, built-in features, TypeScript support  
✅ **Easy setup** - Just API keys and SQL schema  
✅ **Free tier** - Perfect for getting started  

You're all set! 🚀


