/**
 * Delete Permissions Utility
 * Restricts delete operations to authorized users only
 */

import { useAuth } from '@/contexts/AuthContext';

/**
 * Authorized email for delete operations
 */
const AUTHORIZED_DELETE_EMAIL = 'nanasefa@gmail.com';

/**
 * Hook to check if current user can perform delete operations
 * @returns Object with canDelete boolean and user info
 */
export const useDeletePermissions = () => {
  const { currentUser } = useAuth();

  const canDelete = currentUser?.user?.email === AUTHORIZED_DELETE_EMAIL;
  
  return {
    canDelete,
    userEmail: currentUser?.user?.email,
    isAuthorizedUser: canDelete,
  };
};

/**
 * Higher-order component to wrap delete functions with permission checks
 * @param deleteFunction - The delete function to wrap
 * @returns Wrapped function that checks permissions before executing
 */
export const withDeletePermission = <T extends any[], R>(
  deleteFunction: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    // Get current user from Supabase session
    const { supabase } = await import('@/integration/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    
    const userEmail = session?.user?.email;
    
    if (userEmail !== AUTHORIZED_DELETE_EMAIL) {
      throw new Error(`Delete operation not authorized. Only ${AUTHORIZED_DELETE_EMAIL} can perform delete operations.`);
    }
    
    return deleteFunction(...args);
  };
};

/**
 * Utility function to check delete permissions synchronously
 * @param userEmail - Email to check
 * @returns boolean indicating if user can delete
 */
export const canUserDelete = (userEmail: string | undefined): boolean => {
  return userEmail === AUTHORIZED_DELETE_EMAIL;
};

/**
 * Utility function to ensure user has administrator role
 * This should be called during user setup/login
 */
export const ensureAdminRole = async (userEmail: string): Promise<void> => {
  if (userEmail !== AUTHORIZED_DELETE_EMAIL) {
    return; // Only set admin role for authorized user
  }

  try {
    const { supabase } = await import('@/integration/supabase/client');
    
    // Check if user has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', userEmail)
      .single();

    // Get or create administrator role
    let { data: adminRole } = await supabase
      .from('roles')
      .select('*')
      .eq('name', 'administrator')
      .single();

    if (!adminRole) {
      // Create administrator role if it doesn't exist
      const { data: newRole, error: roleError } = await supabase
        .from('roles')
        .insert({
          name: 'administrator',
          display_name: 'Administrator',
          description: 'Full system administrator with all permissions',
          is_system_role: true,
          is_active: true
        })
        .select()
        .single();

      if (roleError) {
        console.error('Error creating administrator role:', roleError);
        return;
      }
      adminRole = newRole;
    }

    if (profile) {
      // Update existing profile with admin role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role_id: adminRole.id })
        .eq('email', userEmail);

      if (updateError) {
        console.error('Error updating profile with admin role:', updateError);
      } else {
        console.log(`Updated ${userEmail} with administrator role`);
      }
    } else {
      // Create profile with admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === userEmail) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: userEmail,
            role_id: adminRole.id,
            first_name: 'Administrator',
            last_name: 'User'
          });

        if (insertError) {
          console.error('Error creating admin profile:', insertError);
        } else {
          console.log(`Created administrator profile for ${userEmail}`);
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring admin role:', error);
  }
};
