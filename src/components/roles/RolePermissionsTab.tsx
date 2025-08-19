import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { modulesApi, actionsApi } from '@/integration/supabase/permissions-api';
import { Module, Action } from '@/integration/supabase/permissions-types';
import { useUpdateRolePermissions } from '@/hooks/role/useRole';
import { Separator } from '@/components/ui/separator';
import { Check } from 'lucide-react';

interface RolePermissionsTabProps {
  roleId: string;
  permissions: string[];
  onPermissionsUpdate: (permissions: string[]) => void;
}

export const RolePermissionsTab: React.FC<RolePermissionsTabProps> = ({
  roleId,
  permissions,
  onPermissionsUpdate
}) => {
  const { toast } = useToast();
  const { updatePermissions, loading: updating } = useUpdateRolePermissions();
  
  const [modules, setModules] = useState<Module[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(permissions || []);
  const [loadingData, setLoadingData] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch modules and actions
  useEffect(() => {
    const fetchPermissionsData = async () => {
      try {
        setLoadingData(true);
        
        const [modulesResult, actionsResult] = await Promise.all([
          modulesApi.getAll(),
          actionsApi.getAll()
        ]);
        
        setModules(modulesResult);
        setActions(actionsResult);
      } catch (error) {
        console.error('Error fetching permissions data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load permissions data',
          variant: 'destructive'
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchPermissionsData();
  }, [toast]);

  // Update selected permissions when props change
  useEffect(() => {
    setSelectedPermissions(permissions || []);
    setHasChanges(false);
  }, [permissions]);

  // Handle permission toggle
  const handlePermissionToggle = (permissionKey: string) => {
    const isSelected = selectedPermissions.includes(permissionKey);
    
    const newPermissions = isSelected
      ? selectedPermissions.filter(p => p !== permissionKey)
      : [...selectedPermissions, permissionKey];
    
    setSelectedPermissions(newPermissions);
    setHasChanges(true);
  };

  // Handle module toggle (all permissions for a module)
  const handleModuleToggle = (moduleName: string) => {
    const modulePermissions = actions.map(action => `${moduleName}:${action.name}`);
    const allModulePermissionsSelected = modulePermissions.every(p => selectedPermissions.includes(p));
    
    let newPermissions: string[];
    
    if (allModulePermissionsSelected) {
      // Remove all module permissions
      newPermissions = selectedPermissions.filter(p => !p.startsWith(`${moduleName}:`));
    } else {
      // Add all module permissions
      const existingNonModulePermissions = selectedPermissions.filter(p => !p.startsWith(`${moduleName}:`));
      newPermissions = [...existingNonModulePermissions, ...modulePermissions];
    }
    
    setSelectedPermissions(newPermissions);
    setHasChanges(true);
  };

  // Save changes
  const handleSaveChanges = async () => {
    try {
      await updatePermissions(roleId, selectedPermissions);
      onPermissionsUpdate(selectedPermissions);
      setHasChanges(false);
      toast({
        title: 'Permissions updated',
        description: 'Role permissions have been updated successfully'
      });
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permissions',
        variant: 'destructive'
      });
    }
  };

  // Reset changes
  const handleResetChanges = () => {
    setSelectedPermissions(permissions || []);
    setHasChanges(false);
  };

  if (loadingData) {
    return (
      <div className="text-white/60 text-center py-8">Loading permissions data...</div>
    );
  }

  return (
    <div className="space-y-6">
      {hasChanges && (
        <div className="flex items-center justify-between bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
          <p className="text-blue-400">You have unsaved permission changes</p>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetChanges}
              className="border-white/20 hover:bg-white/10"
            >
              Reset
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveChanges}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => {
          const modulePermissions = actions.map(action => `${module.name}:${action.name}`);
          const allModulePermissionsSelected = modulePermissions.every(p => selectedPermissions.includes(p));
          const someModulePermissionsSelected = modulePermissions.some(p => selectedPermissions.includes(p));
          
          return (
            <Card key={module.id} className="bg-black/20 border-white/5">
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-white">{module.display_name}</CardTitle>
                <Switch 
                  checked={allModulePermissionsSelected}
                  onCheckedChange={() => handleModuleToggle(module.name)}
                  className={someModulePermissionsSelected && !allModulePermissionsSelected ? "data-[state=checked]:bg-blue-600/50" : ""}
                />
              </CardHeader>
              <CardContent className="py-2 space-y-2">
                {actions.map((action) => {
                  const permissionKey = `${module.name}:${action.name}`;
                  const isChecked = selectedPermissions.includes(permissionKey);
                  
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
                        onCheckedChange={() => handlePermissionToggle(permissionKey)}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {modules.length === 0 && (
        <div className="text-center py-8">
          <p className="text-white/60">No permission modules found. Please check your database configuration.</p>
        </div>
      )}
      
      <Separator className="bg-white/10 my-6" />
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveChanges}
          disabled={!hasChanges || updating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {updating ? 'Saving...' : 'Save Changes'}
          {!updating && hasChanges && <Check className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
