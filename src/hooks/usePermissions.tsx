import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserEffectivePermissions } from '@/integration/supabase/permissions-api';

interface PermissionsContextType {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canViewModule: (module: string) => boolean;
  canEditModule: (module: string) => boolean;
  loading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    if (!user?.id) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: apiError } = await getUserEffectivePermissions(user.id);
      
      if (apiError) {
        console.error('Error fetching permissions:', apiError);
        setError(apiError.message);
        setPermissions([]);
      } else if (data) {
        setPermissions(data.effectivePermissions);
        console.log('Loaded permissions for user:', data.effectivePermissions);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [user?.id]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every(permission => permissions.includes(permission));
  };

  const canViewModule = (module: string): boolean => {
    // Check for specific view permission for the module
    const viewPermission = `${module}:view`;
    const readPermission = `${module}:read`;
    const allPermission = `${module}:*`;
    
    return hasPermission(viewPermission) || 
           hasPermission(readPermission) || 
           hasPermission(allPermission) ||
           hasPermission('*:view') ||
           hasPermission('*:*');
  };

  const canEditModule = (module: string): boolean => {
    // Check for specific edit permission for the module
    const editPermission = `${module}:edit`;
    const writePermission = `${module}:write`;
    const updatePermission = `${module}:update`;
    const allPermission = `${module}:*`;
    
    return hasPermission(editPermission) || 
           hasPermission(writePermission) || 
           hasPermission(updatePermission) ||
           hasPermission(allPermission) ||
           hasPermission('*:edit') ||
           hasPermission('*:write') ||
           hasPermission('*:update') ||
           hasPermission('*:*');
  };

  const refreshPermissions = async () => {
    await fetchPermissions();
  };

  return (
    <PermissionsContext.Provider value={{
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canViewModule,
      canEditModule,
      loading,
      error,
      refreshPermissions
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
