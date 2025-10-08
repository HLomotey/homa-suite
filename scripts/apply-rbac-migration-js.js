import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in your environment');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    // Read the migration SQL file
    const migrationPath = path.resolve('./scripts/apply-rbac-migration-fixed.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Apply the migration
    console.log('Applying RBAC migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error applying migration:', error);
      return;
    }
    
    console.log('RBAC migration applied successfully');
    
    // Apply RLS fixes
    const rlsFixPath = path.resolve('./scripts/fix-roles-rls.sql');
    const rlsFixSQL = fs.readFileSync(rlsFixPath, 'utf8');
    
    console.log('Applying RLS fixes...');
    const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsFixSQL });
    
    if (rlsError) {
      console.error('Error applying RLS fixes:', rlsError);
      return;
    }
    
    console.log('RLS fixes applied successfully');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

applyMigration();
