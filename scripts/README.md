# Migration Scripts

## migrate-products.ts

This script migrates your existing product data from `productData.ts` to your Supabase database.

### Prerequisites

1. ✅ Supabase project created
2. ✅ Database schema run (from `supabase/schema.sql`)
3. ✅ `.env.local` file with Supabase credentials

### Setup

1. **Get your Supabase Service Role Key:**
   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key (⚠️ Keep this secret!)
   - Add it to `.env.local`:
     ```env
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
     ```

2. **Run the migration:**
   ```bash
   npx tsx scripts/migrate-products.ts
   ```

### What it does

- ✅ Migrates all products from `productData.ts`
- ✅ Merges data from `productDetails` (variations, specifications, features)
- ✅ Migrates category banners
- ✅ Uses `upsert` to handle duplicates (safe to run multiple times)

### Expected Output

```
🚀 Starting category banner migration...
📦 Found 4 category banners to migrate
✅ Successfully inserted 4 category banners

🚀 Starting product migration...
📦 Found 20 products to migrate
📤 Inserting batch 1/1 (20 products)...
✅ Batch 1 inserted successfully

📊 Migration Summary:
   ✅ Inserted: 20 products
   📝 Total: 20 products

🎉 Migration completed!
```

### Troubleshooting

**Error: "Missing Supabase credentials"**
- Make sure `.env.local` exists in project root
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

**Error: "relation does not exist"**
- You haven't run the SQL schema yet
- Go to Supabase SQL Editor and run `supabase/schema.sql`

**Error: "duplicate key value"**
- This is normal if you run the script multiple times
- The script uses `upsert` to update existing records

