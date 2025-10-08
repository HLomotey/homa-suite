// Cleanup Orphaned Auth User Script
// Run this with: node cleanup-orphaned-user.js
// Make sure you have the admin service role key in your environment

const { createClient } = require('@supabase/supabase-js');

// Configuration - UPDATE THESE VALUES
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const SUPABASE_SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY'; // Replace with your service role key
const PROBLEMATIC_EMAIL = 'user@example.com'; // Replace with the actual email causing issues

// Create admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupOrphanedUser() {
  try {
    console.log(`🔍 Checking for orphaned user: ${PROBLEMATIC_EMAIL}`);
    
    // Step 1: Get auth user by email
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    const authUser = authUsers.users.find(user => user.email === PROBLEMATIC_EMAIL);
    
    if (!authUser) {
      console.log('✅ No auth user found with this email. Problem may already be resolved.');
      return;
    }
    
    console.log(`📧 Found auth user: ${authUser.id}`);
    
    // Step 2: Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileError);
      return;
    }
    
    if (profile) {
      console.log('✅ Profile already exists. No cleanup needed.');
      return;
    }
    
    console.log('🚨 Confirmed: Orphaned auth user detected');
    
    // Step 3: Choose cleanup method
    console.log('\n🔧 Cleanup options:');
    console.log('1. Delete auth user (recommended if you want to recreate)');
    console.log('2. Create missing profile (recommended if you want to keep the user)');
    
    // Option 1: Delete auth user
    const DELETE_USER = true; // Set to false if you want to create profile instead
    
    if (DELETE_USER) {
      console.log('🗑️  Deleting orphaned auth user...');
      
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.id);
      
      if (deleteError) {
        console.error('❌ Error deleting auth user:', deleteError);
        return;
      }
      
      console.log('✅ Successfully deleted orphaned auth user');
      console.log('💡 You can now recreate the user with the same email');
      
    } else {
      // Option 2: Create profile
      console.log('👤 Creating missing profile...');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('❌ Error creating profile:', insertError);
        return;
      }
      
      console.log('✅ Successfully created missing profile');
      console.log('💡 User should now appear in your user management system');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the cleanup
cleanupOrphanedUser();
