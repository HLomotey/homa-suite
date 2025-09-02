import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://vconsodaevbqavtijaby.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjb25zb2RhZXZicWF2dGlqYWJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI4ODg5NiwiZXhwIjoyMDY4ODY0ODk2fQ.0VZ8BPzPct_Ge8uAWhbZtdpJQNcAKePnI6fznHW2_Yk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const rpcFunctionSQL = `
-- Drop function if it exists (to recreate with correct signature)
DROP FUNCTION IF EXISTS get_user_effective_permissions(UUID);

-- Create get_user_effective_permissions RPC function
CREATE OR REPLACE FUNCTION get_user_effective_permissions(p_user_id UUID)
RETURNS TABLE(
    resource TEXT,
    action TEXT,
    permission_key TEXT
) AS $$
BEGIN
    -- Return permissions based on user's role assignments
    RETURN QUERY
    SELECT 
        SPLIT_PART(p.name, ':', 1) as resource,
        SPLIT_PART(p.name, ':', 2) as action,
        p.name as permission_key
    FROM permissions p
    INNER JOIN role_permissions rp ON p.id = rp.permission_id
    INNER JOIN roles r ON rp.role_id = r.id
    INNER JOIN profiles pr ON pr.role_id = r.id
    WHERE pr.id = p_user_id
      AND r.is_active = true;
      
    -- If no permissions found, return empty result
    IF NOT FOUND THEN
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_effective_permissions(UUID) TO authenticated;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION get_user_effective_permissions(UUID) TO service_role;
`;

async function applyRPCFunction() {
  try {
    console.log('🔧 Applying RPC function to database...');
    
    // Execute the SQL to create the function
    const { data, error } = await supabase.rpc('exec', { sql: rpcFunctionSQL });
    
    if (error) {
      console.error('❌ Error creating RPC function:', error);
      return;
    }
    
    console.log('✅ RPC function applied successfully');
    
    // Test the function
    console.log('🧪 Testing RPC function...');
    const { data: testData, error: testError } = await supabase.rpc(
      'get_user_effective_permissions',
      { p_user_id: '7a4cc66a-de48-4b3f-9ca9-08eca558d200' }
    );
    
    if (testError) {
      console.error('❌ Error testing RPC function:', testError);
    } else {
      console.log('✅ RPC function test successful:', testData);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

applyRPCFunction();
