// Debug script to diagnose user login issues
// Run this in your browser console or as a Node.js script

const debugUserLogin = async (userEmail) => {
  console.log('🔍 Debugging login for:', userEmail);
  
  // Check if user exists in auth.users
  console.log('\n1. Checking auth.users table...');
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
    return;
  }
  
  const authUser = authUsers.users.find(u => u.email === userEmail);
  if (authUser) {
    console.log('✅ User found in auth.users');
    console.log('   - ID:', authUser.id);
    console.log('   - Email confirmed:', authUser.email_confirmed_at ? 'Yes' : 'No');
    console.log('   - Created at:', authUser.created_at);
    console.log('   - Last sign in:', authUser.last_sign_in_at || 'Never');
    console.log('   - User metadata:', authUser.user_metadata);
  } else {
    console.log('❌ User NOT found in auth.users');
    return;
  }
  
  // Check if user exists in profiles table
  console.log('\n2. Checking profiles table...');
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();
    
  if (profileError) {
    console.log('❌ Profile not found or error:', profileError.message);
  } else {
    console.log('✅ Profile found');
    console.log('   - Full name:', profile.full_name);
    console.log('   - Role ID:', profile.role_id);
    console.log('   - Status:', profile.status);
  }
  
  // Check if user exists in external_staff table (CRITICAL for login)
  console.log('\n3. Checking external_staff table...');
  const normalizedEmail = userEmail.trim().toLowerCase();
  
  const { data: externalStaff, error: staffError } = await supabaseAdmin
    .from('external_staff')
    .select('*')
    .eq('"PERSONAL E-MAIL"', normalizedEmail)
    .eq('"POSITION STATUS"', 'A - Active');
    
  if (staffError) {
    console.error('❌ Error checking external_staff:', staffError);
  } else if (externalStaff && externalStaff.length > 0) {
    console.log('✅ User found in external_staff');
    console.log('   - Employee ID:', externalStaff[0]['EMPLOYEE ID']);
    console.log('   - Full name:', externalStaff[0]['FULL NAME']);
    console.log('   - Position status:', externalStaff[0]['POSITION STATUS']);
  } else {
    console.log('❌ User NOT found in external_staff table');
    console.log('🚨 THIS IS LIKELY THE CAUSE OF LOGIN FAILURE');
    
    // Check if email exists with different status
    const { data: anyStatus, error: anyError } = await supabaseAdmin
      .from('external_staff')
      .select('*')
      .eq('"PERSONAL E-MAIL"', normalizedEmail);
      
    if (anyStatus && anyStatus.length > 0) {
      console.log('📋 Found user with different status:');
      anyStatus.forEach(staff => {
        console.log(`   - Status: ${staff['POSITION STATUS']}`);
        console.log(`   - Name: ${staff['FULL NAME']}`);
      });
    } else {
      console.log('📋 Email not found in external_staff at all');
    }
  }
  
  // Test actual login attempt
  console.log('\n4. Testing login validation logic...');
  if (!externalStaff || externalStaff.length === 0) {
    console.log('❌ Login will fail: Email not in external_staff with active status');
    console.log('💡 SOLUTION: Add user to external_staff table or update their status to "A - Active"');
  } else {
    console.log('✅ External staff validation should pass');
    console.log('💡 If login still fails, check password or other auth issues');
  }
};

// Usage: debugUserLogin('user@example.com');
console.log('Debug script loaded. Call debugUserLogin("user@example.com") to diagnose login issues.');
