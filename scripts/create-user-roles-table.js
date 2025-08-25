import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL to create the user_roles table
const createUserRolesTableSQL = `
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
`;

async function createUserRolesTable() {
  try {
    console.log('Creating user_roles table...');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: createUserRolesTableSQL });
    
    if (error) {
      console.error('Error creating user_roles table:', error);
      return;
    }
    
    console.log('user_roles table created successfully!');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the function
createUserRolesTable();
