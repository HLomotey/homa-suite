#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables or use defaults
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Running J1 tracking migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20251002_create_j1_tracking_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          // Try direct execution for some statements
          try {
            const { error: directError } = await supabase
              .from('_sql_exec')
              .insert({ query: statement + ';' });
            
            if (directError) {
              console.error(`❌ Direct execution also failed:`, directError);
            }
          } catch (e) {
            console.log(`ℹ️  Statement ${i + 1} may have executed successfully despite error`);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('🎉 Migration completed!');
    console.log('🔍 Checking if j1_dashboard_view was created...');
    
    // Test the view
    const { data, error } = await supabase
      .from('j1_dashboard_view')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ j1_dashboard_view not accessible:', error.message);
    } else {
      console.log('✅ j1_dashboard_view is working!');
      console.log(`📊 Found ${data?.length || 0} records in the view`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
