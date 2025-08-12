import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/utils/permissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  module?: string;
  action?: 'view' | 'edit' | 'create' | 'delete';
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission
  fallback?: React.ReactNode;
  showError?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  module,
  action = 'view',
  requireAll = false,
  fallback,
  showError = false
}) => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    canViewModule, 
    canEditModule,
    loading 
  } = usePermissions();

  // Show loading state
  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>;
  }

  let hasAccess = false;

  // Check permissions based on provided props
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else if (module) {
    if (action === 'view') {
      hasAccess = canViewModule(module);
    } else if (action === 'edit') {
      hasAccess = canEditModule(module);
    } else {
      // For create/delete actions, check specific permission
      hasAccess = hasPermission(`${module}:${action}`);
    }
  }

  // If user doesn't have access
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (showError) {
      return (
        <Alert className="border-red-500/20 bg-red-500/10">
          <ShieldX className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">
            You don't have permission to access this content.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const ViewGuard: React.FC<{ module: string; children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  module, 
  children, 
  fallback 
}) => (
  <PermissionGuard module={module} action="view" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const EditGuard: React.FC<{ module: string; children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  module, 
  children, 
  fallback 
}) => (
  <PermissionGuard module={module} action="edit" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const CreateGuard: React.FC<{ module: string; children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  module, 
  children, 
  fallback 
}) => (
  <PermissionGuard module={module} action="create" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const DeleteGuard: React.FC<{ module: string; children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  module, 
  children, 
  fallback 
}) => (
  <PermissionGuard module={module} action="delete" fallback={fallback}>
    {children}
  </PermissionGuard>
);
