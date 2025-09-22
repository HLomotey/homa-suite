import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/utils/permissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX, Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  module?: string;
  action?: 'view' | 'edit' | 'create' | 'delete';
  requireAll?: boolean;
  redirectTo?: string;
  showError?: boolean;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  permission,
  permissions,
  module,
  action = 'view',
  requireAll = false,
  redirectTo = '/dashboard',
  showError = true
}) => {
  const location = useLocation();
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    canViewModule, 
    canEditModule,
    loading 
  } = usePermissions();

  // Show loading state while permissions are being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading permissions...</span>
        </div>
      </div>
    );
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
    if (showError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full">
            <Alert className="border-red-500/20 bg-red-500/10">
              <ShieldX className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-500">
                <div className="space-y-2">
                  <p className="font-medium">Access Denied</p>
                  <p className="text-sm">
                    You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }
    
    // Redirect to allowed page
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
