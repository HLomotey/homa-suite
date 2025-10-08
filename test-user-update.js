/**
 * Test script to verify user update functionality
 * This script tests the updateUser function to ensure our fixes work properly
 */

import { updateUser } from './src/hooks/user-profile/api';

// Test user ID - replace with a real user ID from your system
const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

// Test user data
const testUserData = {
  name: 'Test User Updated',
  email: 'testupdated@example.com',
  role: 'staff',
  roleId: null,
  department: 'IT',
  status: 'active',
  permissions: []
};

// Run the test
async function runTest() {
  console.log('Starting user update test...');
  console.log('Test user ID:', TEST_USER_ID);
  console.log('Test user data:', testUserData);
  
  try {
    const updatedUser = await updateUser(TEST_USER_ID, testUserData);
    console.log('User update successful!');
    console.log('Updated user:', updatedUser);
    return true;
  } catch (error) {
    console.error('User update failed:', error);
    return false;
  }
}

// Execute the test
runTest()
  .then(success => {
    if (success) {
      console.log('✅ Test passed!');
      process.exit(0);
    } else {
      console.log('❌ Test failed!');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
  });
