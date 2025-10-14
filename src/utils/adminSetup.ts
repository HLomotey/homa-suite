/**
 * Admin Setup Utility
 * Ensures nanasefa@gmail.com has administrator privileges
 */

import { supabase } from '@/integration/supabase/client';

const ADMIN_EMAIL = 'nanasefa@gmail.com';

/**
 * Sets up administrator role for the authorized user
 * This should be called during app initialization or user login
 */
export const setupAdminUser = async (): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user || session.user.email !== ADMIN_EMAIL) {
      return; // Only set up admin for the authorized user
    }

    console.log(`Setting up administrator privileges for ${ADMIN_EMAIL}`);

    // Check if user already has a profile with admin role
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role_id, roles(name)')
      .eq('id', session.user.id)
      .single();

    // If user already has admin role, no need to continue
    if (existingProfile?.roles?.name === 'administrator') {
      console.log(`${ADMIN_EMAIL} already has administrator role`);
      return;
    }

    // Check if administrator role exists
    const { data: adminRole } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', 'administrator')
      .single();

    let adminRoleId = adminRole?.id;

    // Create administrator role if it doesn't exist
    if (!adminRole) {
      console.log('Creating administrator role...');
      // We'll use RPC function or direct SQL to create the role
      // This avoids TypeScript issues with table definitions
      const { data: newRole } = await supabase.rpc('create_admin_role_if_not_exists');
      adminRoleId = newRole?.id;
    }

    if (!adminRoleId) {
      console.error('Failed to get or create administrator role');
      return;
    }

    // Update or create user profile with admin role
    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role_id: adminRoleId })
        .eq('id', session.user.id);

      if (updateError) {
        console.error('Error updating profile with admin role:', updateError);
      } else {
        console.log(`Updated ${ADMIN_EMAIL} with administrator role`);
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          email: ADMIN_EMAIL,
          role_id: adminRoleId,
          first_name: 'Administrator',
          last_name: 'User'
        });

      if (insertError) {
        console.error('Error creating admin profile:', insertError);
      } else {
        console.log(`Created administrator profile for ${ADMIN_EMAIL}`);
      }
    }

  } catch (error) {
    console.error('Error in setupAdminUser:', error);
  }
};

/**
 * Checks if current user is the authorized admin
 */
export const isAuthorizedAdmin = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.email === ADMIN_EMAIL;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
