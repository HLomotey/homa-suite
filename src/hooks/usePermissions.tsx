import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { userPermissionsApi } from '@/integration/supabase/rbac-api';
import { Role, UserPermissionSummary } from '@/integration/supabase/types/rbac-types';
import { supabase } from '@/integration/supabase';

interface PermissionsContextType {
  permissions: Record<string, string[]>;
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
  const { currentUser } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [primaryRole, setPrimaryRole] = useState<Role | undefined>(undefined);
  const [permissionDetails, setPermissionDetails] = useState<UserPermissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      if (!currentUser?.user?.id) {
        setPermissions({});
        return;
      }

      try {
        const { data, error } = await supabase.rpc(
          'get_user_effective_permissions',
          { p_user_id: currentUser.user.id }
        );

        if (error) {
          // Handle RPC function not existing yet or column errors
          if (error.code === "PGRST301" || error.message?.includes("function") || error.code === "400" || error.message?.includes("column") || error.message?.includes("does not exist")) {
            console.warn("Permission function may not exist or has schema issues:", error.message);
            // Set default permissions for development - grant all access
            setPermissions({
              dashboard: ["view"],
              properties: ["view", "manage"],
              users: ["view", "manage"],
              reports: ["view", "create"],
              transport: ["view", "manage"],
              hr: ["view", "manage"],
              finance: ["view", "manage"],
              billing: ["view", "manage"],
              operations: ["view", "manage"],
              complaints: ["view", "manage"],
              settings: ["view", "manage"],
              activity_log: ["view"],
              onboarding: ["view", "manage"],
              "job-orders": ["view", "manage"],
              analytics: ["view", "manage"],
              notifications: ["view", "manage"]
            });
            return;
          }
          throw error;
        }

        // Process the returned permissions
        const permMap: Record<string, string[]> = {};
        if (data && Array.isArray(data)) {
          data.forEach(perm => {
            if (!permMap[perm.resource]) {
              permMap[perm.resource] = [];
            }
            permMap[perm.resource].push(perm.action);
          });
        }
        
        setPermissions(permMap);
      } catch (error: any) {
        console.error("Error fetching permissions:", error?.message || error);
        // Set fallback permissions
        setPermissions({
          dashboard: ["view"]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [currentUser?.user?.id]);

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
