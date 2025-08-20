// Node.js script to sync auth.users to public.users table
// This script can be run manually or via cron job

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncAuthToPublicUsers() {
  try {
    console.log('🔄 Starting sync of auth.users to public.users...');

    // Call the sync function
    const { data, error } = await supabase.rpc('sync_auth_to_public_users');

    if (error) {
      console.error('❌ Error syncing users:', error);
      return;
    }

    console.log('✅ Sync completed:', data);

    // Get current counts
    const { data: authCount } = await supabase.rpc('count_auth_users');
    const { data: publicCount, error: countError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    if (!countError) {
      console.log(`📊 Auth users: ${authCount || 'Unknown'}`);
      console.log(`📊 Public users: ${publicCount || 0}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Helper function to count auth users (if needed)
async function createCountFunction() {
  const { error } = await supabase.rpc('exec', {
    sql: `
      CREATE OR REPLACE FUNCTION count_auth_users()
      RETURNS INTEGER AS $$
      BEGIN
        RETURN (SELECT COUNT(*) FROM auth.users WHERE email IS NOT NULL);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  });

  if (error) {
    console.log('Note: Could not create count function (may already exist)');
  }
}

// Run the sync
async function main() {
  await createCountFunction();
  await syncAuthToPublicUsers();
}

if (require.main === module) {
  main().then(() => {
    console.log('🏁 Script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = { syncAuthToPublicUsers };
