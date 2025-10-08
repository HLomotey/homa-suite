import { supabase } from '../src/integration/supabase/client';

async function populatePermissions() {
  try {
    console.log('Fetching modules and actions...');
    
    // Get all active modules and actions
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (modulesError) throw modulesError;
    
    const { data: actions, error: actionsError } = await supabase
      .from('actions')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (actionsError) throw actionsError;
    
    console.log(`Found ${modules?.length || 0} modules and ${actions?.length || 0} actions`);
    
    if (!modules || !actions || modules.length === 0 || actions.length === 0) {
      console.log('No modules or actions found. Make sure the RBAC migration has been applied.');
      return;
    }
    
    // Create permissions for all module-action combinations
    const permissions = [];
    
    for (const module of modules) {
      for (const action of actions) {
        permissions.push({
          module_id: module.id,
          action_id: action.id,
          permission_key: `${module.name}:${action.name}`,
          display_name: `${action.display_name} ${module.display_name}`,
          description: `${action.description} for ${module.display_name}`,
          is_active: true
        });
      }
    }
    
    console.log(`Creating ${permissions.length} permissions...`);
    
    // Insert permissions in batches to avoid conflicts
    let successCount = 0;
    for (const permission of permissions) {
      try {
        const { error } = await supabase
          .from('permissions')
          .upsert([permission], { 
            onConflict: 'permission_key',
            ignoreDuplicates: true 
          });
        
        if (!error) {
          successCount++;
        }
      } catch (err) {
        console.log(`Failed to insert ${permission.permission_key}`);
      }
    }
    
    console.log(`Successfully created ${successCount} permissions`);
    
    // Get admin role
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('name', 'admin')
      .single();
    
    if (roleError || !adminRole) {
      console.log('Admin role not found. Please make sure the RBAC migration has been applied.');
      return;
    }
    
    // Get all permissions
    const { data: allPermissions, error: allPermError } = await supabase
      .from('permissions')
      .select('id')
      .eq('is_active', true);
    
    if (allPermError || !allPermissions) {
      console.log('Could not fetch permissions');
      return;
    }
    
    // Grant all permissions to admin role
    const rolePermissions = allPermissions.map(p => ({
      role_id: adminRole.id,
      permission_id: p.id
    }));
    
    console.log(`Granting ${rolePermissions.length} permissions to admin role...`);
    
    let grantedCount = 0;
    for (const rolePermission of rolePermissions) {
      try {
        const { error } = await supabase
          .from('role_permissions')
          .upsert([rolePermission], { 
            onConflict: 'role_id,permission_id',
            ignoreDuplicates: true 
          });
        
        if (!error) {
          grantedCount++;
        }
      } catch (err) {
        // Ignore conflicts
      }
    }
    
    console.log(`Successfully granted ${grantedCount} permissions to admin role`);
    
    // Show summary
    const { count: permissionCount } = await supabase
      .from('permissions')
      .select('*', { count: 'exact', head: true });
    
    const { count: rolePermissionCount } = await supabase
      .from('role_permissions')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', adminRole.id);
    
    console.log(`\nSummary:`);
    console.log(`- Total permissions: ${permissionCount}`);
    console.log(`- Admin role permissions: ${rolePermissionCount}`);
    
    // Show sample permissions
    const { data: samplePermissions } = await supabase
      .from('permissions')
      .select(`
        permission_key,
        display_name,
        module:modules(display_name),
        action:actions(display_name)
      `)
      .limit(10);
    
    console.log('\nSample permissions:');
    samplePermissions?.forEach(p => {
      console.log(`- ${p.permission_key}: ${p.display_name}`);
    });
    
  } catch (error) {
    console.error('Error populating permissions:', error);
  }
}

// Run the script
populatePermissions().then(() => {
  console.log('Permission population completed');
}).catch(error => {
  console.error('Script failed:', error);
});
