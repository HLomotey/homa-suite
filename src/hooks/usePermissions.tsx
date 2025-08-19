import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { userPermissionsApi } from '@/integration/supabase/rbac-api';
import { Role, UserPermissionSummary } from '@/integration/supabase/types/rbac-types';

interface PermissionsContextType {
  permissions: string[];
  roles: Role[];
  primaryRole?: Role;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canViewModule: (module: string) => boolean;
  canEditModule: (module: string) => boolean;
  canCreateInModule: (module: string) => boolean;
  canDeleteInModule: (module: string) => boolean;
  canAdminModule: (module: string) => boolean;
  hasRole: (roleName: string) => boolean;
  loading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
  permissionDetails: UserPermissionSummary | null;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [primaryRole, setPrimaryRole] = useState<Role | undefined>(undefined);
  const [permissionDetails, setPermissionDetails] = useState<UserPermissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    if (!user?.id) {
      setPermissions([]);
      setRoles([]);
      setPrimaryRole(undefined);
      setPermissionDetails(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const permissionData = await userPermissionsApi.getUserEffectivePermissions(user.id);
      
      if (permissionData) {
        setPermissions(permissionData.effective_permissions);
        setRoles(permissionData.roles || []);
        setPrimaryRole(permissionData.primary_role);
        setPermissionDetails(permissionData);
        console.log('Loaded permissions for user:', permissionData.effective_permissions);
        console.log('User roles:', permissionData.roles);
      } else {
        setPermissions([]);
        setRoles([]);
        setPrimaryRole(undefined);
        setPermissionDetails(null);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPermissions([]);
      setRoles([]);
      setPrimaryRole(undefined);
      setPermissionDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [user?.id]);

  const hasPermission = (permission: string): boolean => {
    // TEMPORARY: Grant access to all permissions
    return true; // permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    // TEMPORARY: Grant access to all permissions
    return true; // permissionList.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    // TEMPORARY: Grant access to all permissions
    return true; // permissionList.every(permission => permissions.includes(permission));
  };

  const hasRole = (roleName: string): boolean => {
    // TEMPORARY: Grant access to all roles
    return true; // roles.some(role => role.name === roleName);
  };

  const canViewModule = (module: string): boolean => {
    // TEMPORARY: Grant access to all modules
    return true;
  };

  const canEditModule = (module: string): boolean => {
    // TEMPORARY: Grant access to all modules
    return true;
  };

  const canCreateInModule = (module: string): boolean => {
    // TEMPORARY: Grant access to all modules
    return true;
  };

  const canDeleteInModule = (module: string): boolean => {
    // TEMPORARY: Grant access to all modules
    return true;
  };

  const canAdminModule = (module: string): boolean => {
    // TEMPORARY: Grant access to all modules
    return true;
  };

  const refreshPermissions = async () => {
    await fetchPermissions();
  };

  return (
    <PermissionsContext.Provider value={{
      permissions,
      roles,
      primaryRole,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canViewModule,
      canEditModule,
      canCreateInModule,
      canDeleteInModule,
      canAdminModule,
      hasRole,
      loading,
      error,
      refreshPermissions,
      permissionDetails
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
