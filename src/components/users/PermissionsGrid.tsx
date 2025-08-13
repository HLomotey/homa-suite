import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { modulesApi, actionsApi, getUserEffectivePermissions } from '@/integration/supabase/permissions-api';
import { Module, Action } from '@/integration/supabase/permissions-types';
import { FrontendUser } from '@/integration/supabase/types';

interface PermissionsGridProps {
  user: FrontendUser;
  customPermissionsEnabled: boolean;
  onCustomPermissionsToggle: (enabled: boolean) => void;
  onPermissionToggle: (permission: string) => void;
  isLoading: boolean;
}

export const PermissionsGrid: React.FC<PermissionsGridProps> = ({
  user,
  customPermissionsEnabled,
  onCustomPermissionsToggle,
  onPermissionToggle,
  isLoading
}) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [userEffectivePermissions, setUserEffectivePermissions] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    const fetchPermissionsData = async () => {
      try {
        setLoadingData(true);
        
        // Fetch modules and actions from database
        const [modulesResult, actionsResult] = await Promise.all([
          modulesApi.getAll(),
          actionsApi.getAll()
        ]);

        setModules(modulesResult);
        setActions(actionsResult);
      } catch (error) {
        console.error('Error fetching permissions data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPermissionsData();
  }, []);

  // Fetch user's effective permissions
  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!user.id) return;
      
      try {
        setLoadingPermissions(true);
        const { data, error } = await getUserEffectivePermissions(user.id);
        
        if (error) {
          console.error('Error fetching user effective permissions:', error);
          setUserEffectivePermissions([]);
        } else {
          setUserEffectivePermissions(data?.effectivePermissions || []);
        }
      } catch (error) {
        console.error('Error in fetchUserPermissions:', error);
        setUserEffectivePermissions([]);
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchUserPermissions();
  }, [user.id]);

  if (loadingData || loadingPermissions) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-white text-base font-medium">Custom Permissions</Label>
          <div className="w-12 h-6 bg-white/20 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-black/20 border-white/5">
              <CardHeader className="py-3">
                <div className="h-4 bg-white/20 rounded animate-pulse" />
              </CardHeader>
              <CardContent className="py-2 space-y-2">
                <div className="h-3 bg-white/10 rounded animate-pulse" />
                <div className="h-3 bg-white/10 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-white text-base font-medium">Custom Permissions</Label>
        <Switch
          checked={customPermissionsEnabled}
          onCheckedChange={onCustomPermissionsToggle}
          disabled={isLoading}
        />
      </div>
      
      <Separator className="bg-white/10" />
      
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-200 ${customPermissionsEnabled ? 'opacity-100' : 'opacity-50'}`}>
        {modules.map((module) => (
          <Card key={module.id} className="bg-black/20 border-white/5">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-white">{module.display_name}</CardTitle>
            </CardHeader>
            <CardContent className="py-2 space-y-2">
              {actions.map((action) => {
                const permissionKey = `${module.name}:${action.name}`;
                const isChecked = userEffectivePermissions.includes(permissionKey) || 
                                userEffectivePermissions.includes('*:*') || 
                                userEffectivePermissions.includes(`${module.name}:*`) ||
                                userEffectivePermissions.includes(`*:${action.name}`);
                
                return (
                  <div key={action.id} className="flex items-center justify-between">
                    <Label 
                      htmlFor={`perm-${module.name}-${action.name}`} 
                      className="text-white/80 text-sm"
                    >
                      {action.display_name} {module.display_name}
                    </Label>
                    <Switch 
                      id={`perm-${module.name}-${action.name}`}
                      checked={isChecked}
                      onCheckedChange={() => onPermissionToggle(permissionKey)}
                      disabled={!customPermissionsEnabled || isLoading}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {modules.length === 0 && !loadingData && (
        <div className="text-center py-8">
          <p className="text-white/60">No permission modules found. Please check your database configuration.</p>
        </div>
      )}
    </div>
  );
};
