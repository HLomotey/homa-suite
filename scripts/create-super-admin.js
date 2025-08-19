// Script to create a Super Admin role with all permissions
import { supabase } from '../src/integration/supabase/client.js';
import { permissionsApi, rolesApi, userRolesApi } from '../src/integration/supabase/rbac-api.js';

async function createSuperAdminRole() {
  try {
    console.log('Creating Super Admin role...');
    
    // 1. Get all permissions
    const allPermissions = await permissionsApi.getAll();
    console.log(`Found ${allPermissions.length} permissions`);
    
    // 2. Create Super Admin role
    const superAdminRole = await rolesApi.create({
      name: 'super_admin',
      display_name: 'Super Administrator',
      description: 'Role with access to all system modules and features',
      permission_ids: allPermissions.map(p => p.id)
    });
    
    console.log('Super Admin role created successfully:', superAdminRole);
    
    return superAdminRole;
  } catch (error) {
    console.error('Error creating Super Admin role:', error);
    throw error;
  }
}

async function assignSuperAdminToUser(userId) {
  try {
    console.log(`Assigning Super Admin role to user ${userId}...`);
    
    // 1. Get the Super Admin role
    const superAdminRole = await rolesApi.getByName('super_admin');
    
    if (!superAdminRole) {
      throw new Error('Super Admin role not found');
    }
    
    // 2. Assign role to user
    await userRolesApi.assignRole({
      user_id: userId,
      role_id: superAdminRole.id,
      is_primary: true
    });
    
    console.log('Super Admin role assigned successfully');
  } catch (error) {
    console.error('Error assigning Super Admin role:', error);
    throw error;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const userId = args[0];
  
  if (!userId) {
    console.error('Please provide a user ID as an argument');
    process.exit(1);
  }
  
  try {
    // Check if Super Admin role already exists
    const existingSuperAdmin = await rolesApi.getByName('super_admin');
    
    let superAdminRole;
    if (existingSuperAdmin) {
      console.log('Super Admin role already exists');
      superAdminRole = existingSuperAdmin;
    } else {
      superAdminRole = await createSuperAdminRole();
    }
    
    // Assign role to user
    await assignSuperAdminToUser(userId);
    
    console.log('✅ Process completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Process failed:', error);
    process.exit(1);
  }
}

main();
