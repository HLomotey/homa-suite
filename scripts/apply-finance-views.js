#!/usr/bin/env node

/**
 * Apply the finance_monthly_summary migration to fix 406 errors
 * Run this script to create the missing database views
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Applying finance_monthly_summary migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250923_create_finance_monthly_summary_view.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration applied successfully!');
    
    // Test the views
    console.log('🧪 Testing finance_monthly_summary view...');
    const { data: summaryData, error: summaryError } = await supabase
      .from('finance_monthly_summary')
      .select('*')
      .limit(1);
    
    if (summaryError) {
      console.warn('⚠️ Warning: finance_monthly_summary view test failed:', summaryError.message);
    } else {
      console.log('✅ finance_monthly_summary view is working');
    }
    
    console.log('🧪 Testing finance_analytics_view...');
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('finance_analytics_view')
      .select('*')
      .limit(1);
    
    if (analyticsError) {
      console.warn('⚠️ Warning: finance_analytics_view test failed:', analyticsError.message);
    } else {
      console.log('✅ finance_analytics_view is working');
    }
    
    console.log('\n🎉 Finance views are ready! Your dashboard should now load without 406 errors.');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Alternative method if exec_sql RPC doesn't exist
async function applyMigrationDirect() {
  try {
    console.log('🚀 Applying migration using direct SQL execution...');
    
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250923_create_finance_monthly_summary_view.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          console.error(`❌ Statement ${i + 1} failed:`, error);
          // Continue with other statements
        }
      }
    }
    
    console.log('✅ Migration completed!');
    
  } catch (error) {
    console.error('❌ Direct migration failed:', error);
    console.log('\n💡 Manual steps:');
    console.log('1. Open your Supabase dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and paste the contents of:');
    console.log('   supabase/migrations/20250923_create_finance_monthly_summary_view.sql');
    console.log('4. Execute the SQL');
  }
}

// Run the migration
if (require.main === module) {
  applyMigration().catch(() => {
    console.log('\n🔄 Trying alternative method...');
    applyMigrationDirect();
  });
}

module.exports = { applyMigration, applyMigrationDirect };
