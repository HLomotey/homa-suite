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
 * Note: Admin role setup is handled by /src/utils/adminSetup.ts
 * This utility focuses only on permission checking for delete operations
 */
