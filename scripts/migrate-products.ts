/**
 * Migration Script: Import products from productData.ts to Supabase
 * 
 * Usage:
 * 1. Make sure your .env.local has SUPABASE_SERVICE_ROLE_KEY set
 * 2. Run: npx tsx scripts/migrate-products.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { products, productDetails, categoryBanner } from '../src/app/products/components/productData';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function migrateProducts() {
  console.log('🚀 Starting product migration...\n');

  // Prepare products for database
  const productsToInsert = products.map((product) => {
    // Get additional details from productDetails if available
    const details = productDetails[product.id];

    return {
      id: product.id, // Keep the original ID
      name: product.name,
      subtitle: product.subtitle || null,
      category: product.category,
      tag: product.tag || null,
      image: product.image,
      images: product.images || [],
      price: product.price || null,
      description: product.description || details?.description || null,
      variations: details?.variations || product.variations || [],
      specifications: details?.specifications || product.specifications || [],
      features: details?.features || product.features || [],
    };
  });

  console.log(`📦 Found ${productsToInsert.length} products to migrate\n`);

  // Insert products in batches (Supabase allows up to 1000 per batch)
  const batchSize = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < productsToInsert.length; i += batchSize) {
    const batch = productsToInsert.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(productsToInsert.length / batchSize);

    console.log(`📤 Inserting batch ${batchNum}/${totalBatches} (${batch.length} products)...`);

    const { data, error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'id' }); // Use upsert to handle duplicates

    if (error) {
      console.error(`❌ Error in batch ${batchNum}:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`✅ Batch ${batchNum} inserted successfully\n`);
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Inserted: ${inserted} products`);
  if (errors > 0) {
    console.log(`   ❌ Errors: ${errors} products`);
  }
  console.log(`   📝 Total: ${productsToInsert.length} products\n`);
}

async function migrateCategoryBanners() {
  console.log('🚀 Starting category banner migration...\n');

  const bannersToInsert = Object.entries(categoryBanner).map(([category, banner]) => ({
    category: category as 'ev-charging' | 'solar-street' | 'smart-home' | 'cabinet',
    title: banner.title,
    description: banner.description,
    image: banner.image,
    video: banner.video || null,
  }));

  console.log(`📦 Found ${bannersToInsert.length} category banners to migrate\n`);

  const { data, error } = await supabase
    .from('category_banners')
    .upsert(bannersToInsert, { onConflict: 'category' });

  if (error) {
    console.error('❌ Error inserting category banners:', error.message);
  } else {
    console.log(`✅ Successfully inserted ${bannersToInsert.length} category banners\n`);
  }
}

async function main() {
  try {
    // First, migrate category banners
    await migrateCategoryBanners();

    // Then, migrate products
    await migrateProducts();

    console.log('🎉 Migration completed!\n');
    console.log('💡 Next steps:');
    console.log('   1. Check your Supabase dashboard to verify the data');
    console.log('   2. Update your API routes to fetch from database');
    console.log('   3. Test your product pages\n');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

main();

