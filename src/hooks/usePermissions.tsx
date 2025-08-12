import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Permission, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  canViewModule, 
  canEditModule,
  getRolePermissions,
  mergePermissions
} from '@/utils/permissions';
import { FrontendUser } from '@/integration/supabase/types';
import { useUser } from '@/hooks/user-profile';

interface PermissionsContextType {
  permissions: Permission[];
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canViewModule: (module: string) => boolean;
  canEditModule: (module: string) => boolean;
  userRole: string;
  refreshPermissions: () => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

interface PermissionsProviderProps {
  children: React.ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('guest');
  
  // Fetch user profile data including role and custom permissions
  const { user: userProfile, loading: userLoading } = useUser(authUser?.id || '');

  const refreshPermissions = async () => {
    if (!authUser) {
      setPermissions([]);
      setUserRole('guest');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      if (userProfile) {
        const role = userProfile.role || 'guest';
        setUserRole(role);
        
        // Get base role permissions
        const rolePermissions = getRolePermissions(role);
        
        // Merge with custom permissions if they exist
        const customPermissions = userProfile.permissions || [];
        const finalPermissions = mergePermissions(rolePermissions, customPermissions);
        
        setPermissions(finalPermissions);
      } else {
        // Default to guest permissions if no profile found
        setUserRole('guest');
        setPermissions(getRolePermissions('guest'));
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
      // Fallback to guest permissions on error
      setUserRole('guest');
      setPermissions(getRolePermissions('guest'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPermissions();
  }, [authUser, userProfile]);

  const contextValue: PermissionsContextType = {
    permissions,
    loading: loading || userLoading,
    hasPermission: (permission: Permission) => hasPermission(permissions, permission),
    hasAnyPermission: (requiredPermissions: Permission[]) => hasAnyPermission(permissions, requiredPermissions),
    hasAllPermissions: (requiredPermissions: Permission[]) => hasAllPermissions(permissions, requiredPermissions),
    canViewModule: (module: string) => canViewModule(permissions, module),
    canEditModule: (module: string) => canEditModule(permissions, module),
    userRole,
    refreshPermissions
  };

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
};
