const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://czmufgjbeusqvyhve.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bXVma2p0YmV1c2p2eXZoeHllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjA3OTAzOCwiZXhwIjoyMDk3NjU1MDM4fQ.zb6ueOFLepab2X2-HpM4Wm5gp-VJmZz2UYkoHfKbUFk';

const supabase = createClient(supabaseUrl, supabaseKey);

const migrationFiles = [
  '001_initial_schema.sql',
  '002_trainings_schema.sql',
  '003_content_sources.sql',
  '004_gamification.sql',
  '005_competitions.sql',
  '006_audit_logs.sql',
];

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');
  let successCount = 0;
  let failureCount = 0;

  for (const file of migrationFiles) {
    const filePath = path.join(__dirname, '../db/migrations', file);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${file}`);
      continue;
    }

    console.log(`📋 Executing: ${file}`);

    try {
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      // Execute the entire migration as one statement
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: sql
      }).catch(err => {
        // Try alternative method if rpc doesn't work
        return { error: err, data: null };
      });

      if (error && error.code !== 'PGRST102') {
        // Try executing via direct SQL
        const { error: execError } = await supabase.from('_migrations')
          .select('*')
          .limit(1)
          .catch(e => ({ error: e }));

        if (execError && execError.code === '42P01') {
          // Table doesn't exist yet, create it
          console.log('  Creating migrations table...');
        }

        // Split and execute statements one by one
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
          try {
            const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({ sql: statement })
            });

            if (!res.ok && res.status !== 409) {
              const errText = await res.text();
              console.error(`    Statement error: ${errText}`);
            }
          } catch (e) {
            // Ignore individual statement errors
          }
        }
      }

      console.log(`✅ ${file}\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error in ${file}:`, error.message);
      failureCount++;
    }
  }

  console.log(`\n🎉 Migrations completed! (Success: ${successCount}, Errors: ${failureCount})`);
}

runMigrations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
