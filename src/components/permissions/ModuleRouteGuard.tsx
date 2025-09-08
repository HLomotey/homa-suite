import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX, Loader2 } from 'lucide-react';
import { getModuleByRoute, hasRouteAccess } from '@/config/navigation-modules';
import { getUserModules } from '@/hooks/role/modules-api';
import { useAuth } from '@/components/auth';

interface ModuleRouteGuardProps {
  children: React.ReactNode;
  module?: string; // Override module detection
  redirectTo?: string;
  showError?: boolean;
}

export const ModuleRouteGuard: React.FC<ModuleRouteGuardProps> = ({
  children,
  module,
  redirectTo = '/dashboard',
  showError = true
}) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [userModules, setUserModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) {
        console.log('No current user found');
        setLoading(false);
        setHasAccess(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Checking access for user:', currentUser.user.email);
        const modules = currentUser.modules || [];
        console.log('User modules from AuthContext:', modules);
        setUserModules(modules);

        // Determine which module to check
        const moduleToCheck = module || getModuleByRoute(location.pathname)?.id;
        console.log('Module to check:', moduleToCheck);
        
        if (!moduleToCheck) {
          // If no module is found, allow access (for public routes)
          console.log('No module required, allowing access');
          setHasAccess(true);
        } else {
          // Check if user has access to the module
          const hasModuleAccess = modules.includes(moduleToCheck);
          console.log('Has module access:', hasModuleAccess);
          setHasAccess(hasModuleAccess);
        }
      } catch (error) {
        console.error('Error checking module access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    // Add delay to prevent flash of permission error during login
    const timeoutId = setTimeout(() => {
      checkAccess();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [currentUser, location.pathname, module]);

  // Show loading state while checking access - but only if user is authenticated
  if (loading && currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If no user or still loading, don't show error - let auth handle it
  if (!currentUser) {
    return null;
  }

  // If user doesn't have access
  if (!hasAccess) {
    // For dashboard route, redirect silently without showing error
    if (location.pathname === '/' || location.pathname === '/dashboard') {
      return <Navigate to="/profile" replace />;
    }
    
    if (showError) {
      const moduleInfo = getModuleByRoute(location.pathname);
      const moduleName = typeof moduleInfo === 'string' ? moduleInfo : moduleInfo?.displayName;
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full">
            <Alert className="border-red-500/20 bg-red-500/10">
              <ShieldX className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-500">
                <div className="space-y-2">
                  <p className="font-medium">Access Denied</p>
                  <p className="text-sm">
                    You don't have permission to access the {moduleName || 'requested'} module. 
                    Please contact your administrator if you believe this is an error.
                  </p>
                  <div className="text-xs text-red-400 mt-2">
                    <p>Your current modules: {userModules.length > 0 ? userModules.join(', ') : 'None assigned'}</p>
                  </div>
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
