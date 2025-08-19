import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file if available
dotenv.config();

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase connection details
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for admin privileges

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', tableName);
  
  if (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
  
  return data && data.length > 0;
}

async function applyMigration() {
  try {
    console.log('Checking RBAC tables...');
    
    // Check if key tables exist
    const modulesExists = await checkTableExists('modules');
    const rolesExists = await checkTableExists('roles');
    const userRolesExists = await checkTableExists('user_roles');
    
    if (modulesExists && rolesExists && userRolesExists) {
      console.log('RBAC tables already exist. No migration needed.');
      return;
    }
    
    console.log('RBAC tables missing. Applying migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250820_role_based_access_control.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration SQL
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSql });
    
    if (error) {
      console.error('Error applying migration:', error);
      return;
    }
    
    console.log('RBAC migration applied successfully!');
    
    // Verify tables were created
    const tablesCreated = await Promise.all([
      checkTableExists('modules'),
      checkTableExists('actions'),
      checkTableExists('permissions'),
      checkTableExists('roles'),
      checkTableExists('role_permissions'),
      checkTableExists('user_roles'),
      checkTableExists('user_permissions')
    ]);
    
    if (tablesCreated.every(exists => exists)) {
      console.log('All RBAC tables created successfully.');
    } else {
      console.error('Some tables were not created:', 
        ['modules', 'actions', 'permissions', 'roles', 'role_permissions', 'user_roles', 'user_permissions']
          .filter((_, i) => !tablesCreated[i])
      );
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the migration
applyMigration();
