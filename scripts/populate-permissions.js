import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    
    console.log(`Found ${modules.length} modules and ${actions.length} actions`);
    
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
    
    // Insert permissions (ignore conflicts)
    const { data: insertedPermissions, error: permissionsError } = await supabase
      .from('permissions')
      .upsert(permissions, { 
        onConflict: 'permission_key',
        ignoreDuplicates: true 
      })
      .select();
    
    if (permissionsError) {
      console.error('Error inserting permissions:', permissionsError);
      // Try inserting one by one to see which ones fail
      let successCount = 0;
      for (const permission of permissions) {
        try {
          await supabase
            .from('permissions')
            .upsert([permission], { 
              onConflict: 'permission_key',
              ignoreDuplicates: true 
            });
          successCount++;
        } catch (err) {
          console.log(`Failed to insert ${permission.permission_key}:`, err.message);
        }
      }
      console.log(`Successfully inserted ${successCount} permissions`);
    } else {
      console.log(`Successfully created permissions`);
    }
    
    // Get admin role
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('name', 'admin')
      .single();
    
    if (roleError) {
      console.log('Admin role not found, creating it...');
      const { data: newAdminRole, error: createRoleError } = await supabase
        .from('roles')
        .insert([{
          name: 'admin',
          display_name: 'Administrator',
          description: 'Full system access',
          is_system_role: true,
          is_active: true,
          sort_order: 10
        }])
        .select()
        .single();
      
      if (createRoleError) throw createRoleError;
      adminRole = newAdminRole;
    }
    
    // Get all permissions
    const { data: allPermissions, error: allPermError } = await supabase
      .from('permissions')
      .select('id')
      .eq('is_active', true);
    
    if (allPermError) throw allPermError;
    
    // Grant all permissions to admin role
    const rolePermissions = allPermissions.map(p => ({
      role_id: adminRole.id,
      permission_id: p.id
    }));
    
    console.log(`Granting ${rolePermissions.length} permissions to admin role...`);
    
    const { error: rolePermError } = await supabase
      .from('role_permissions')
      .upsert(rolePermissions, { 
        onConflict: 'role_id,permission_id',
        ignoreDuplicates: true 
      });
    
    if (rolePermError) {
      console.error('Error granting permissions to admin role:', rolePermError);
    } else {
      console.log('Successfully granted all permissions to admin role');
    }
    
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
    process.exit(1);
  }
}

populatePermissions();
