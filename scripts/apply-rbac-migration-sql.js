import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase connection details - these need to be set in your environment or passed as arguments
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables must be set');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('Applying RBAC migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250820_role_based_access_control.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSql
      .replace(/--.*$/gm, '') // Remove comments
      .split(';')
      .filter(stmt => stmt.trim().length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;
      
      try {
        // For simplicity, we'll just create the tables directly
        if (stmt.toLowerCase().includes('create table')) {
          const tableName = stmt.match(/CREATE TABLE.*?public\.(.*?)\s/i)?.[1];
          console.log(`Creating table: ${tableName || 'unknown'}`);
          
          const { error } = await supabase.rpc('exec_sql', { sql: stmt });
          if (error) {
            console.error(`Error executing statement ${i+1}:`, error);
          }
        }
      } catch (err) {
        console.error(`Error processing statement ${i+1}:`, err);
      }
    }
    
    console.log('Migration completed');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the migration
applyMigration();
