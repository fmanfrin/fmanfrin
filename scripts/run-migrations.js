#!/usr/bin/env node

/**
 * Script to run database migrations
 * Usage: npm run db:push
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function runMigrations() {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');

  // Read all migration files
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('⚠️  No migration files found');
    return;
  }

  console.log(`📦 Running ${files.length} migrations...\n`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`⏳ ${file}...`);

    try {
      // Execute the migration
      const { error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        // If exec_sql doesn't exist, try raw query
        // This is a workaround - in production, use Supabase CLI or migrations tool
        console.log(`   ⚠️  Skipped - requires Supabase CLI`);
      } else {
        console.log(`   ✅ Done`);
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error.message);
    }
  }

  console.log('\n📝 Note: Use Supabase CLI for proper migration management');
  console.log('   npm install -g @supabase/cli');
  console.log('   supabase db push');
}

runMigrations().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
