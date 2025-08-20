import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { permissionsApi, rolesApi } from '@/integration/supabase/permissions-api';
import { PermissionWithDetails } from '@/integration/supabase/permissions-types';
import { updateRolePermissions } from '@/hooks/role/api';
import { Separator } from '@/components/ui/separator';
import { Check, Loader2 } from 'lucide-react';

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
  
  const [availablePermissions, setAvailablePermissions] = useState<PermissionWithDetails[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch all available permissions and current role permissions
  useEffect(() => {
    const fetchPermissionsData = async () => {
      try {
        setLoadingData(true);
        
        const [allPermissions, roleWithPermissions] = await Promise.all([
          permissionsApi.getAll(),
          rolesApi.getWithPermissions(roleId)
        ]);
        
        setAvailablePermissions(allPermissions);
        
        // Set currently selected permissions
        const currentPermissionIds = roleWithPermissions?.permissions?.map(p => p.id) || [];
        setSelectedPermissionIds(currentPermissionIds);
        
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

    if (roleId) {
      fetchPermissionsData();
    }
  }, [roleId, toast]);

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    const isSelected = selectedPermissionIds.includes(permissionId);
    
    const newPermissionIds = isSelected
      ? selectedPermissionIds.filter(p => p !== permissionId)
      : [...selectedPermissionIds, permissionId];
    
    setSelectedPermissionIds(newPermissionIds);
    setHasChanges(true);
  };

  // Handle module toggle (all permissions for a module)
  const handleModuleToggle = (moduleName: string) => {
    const modulePermissions = availablePermissions.filter(p => p.module?.name === moduleName);
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const allModulePermissionsSelected = modulePermissionIds.every(id => selectedPermissionIds.includes(id));
    
    let newPermissionIds: string[];
    
    if (allModulePermissionsSelected) {
      // Remove all module permissions
      newPermissionIds = selectedPermissionIds.filter(id => !modulePermissionIds.includes(id));
    } else {
      // Add all module permissions
      const existingNonModulePermissions = selectedPermissionIds.filter(id => !modulePermissionIds.includes(id));
      newPermissionIds = [...existingNonModulePermissions, ...modulePermissionIds];
    }
    
    setSelectedPermissionIds(newPermissionIds);
    setHasChanges(true);
  };

  // Save changes
  const handleSaveChanges = async () => {
    try {
      setUpdating(true);
      await updateRolePermissions(roleId, selectedPermissionIds);
      
      // Update the parent component with permission keys
      const selectedPermissionKeys = availablePermissions
        .filter(p => selectedPermissionIds.includes(p.id))
        .map(p => p.permission_key);
      onPermissionsUpdate(selectedPermissionKeys);
      
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
    } finally {
      setUpdating(false);
    }
  };

  // Reset changes
  const handleResetChanges = async () => {
    try {
      setLoadingData(true);
      const roleWithPermissions = await rolesApi.getWithPermissions(roleId);
      const currentPermissionIds = roleWithPermissions?.permissions?.map(p => p.id) || [];
      setSelectedPermissionIds(currentPermissionIds);
      setHasChanges(false);
    } catch (error) {
      console.error('Error resetting permissions:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-white/60 mr-2" />
        <span className="text-white/60">Loading permissions data...</span>
      </div>
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
        {/* Group permissions by module */}
        {Array.from(new Set(availablePermissions.map(p => p.module?.name).filter(Boolean))).map((moduleName) => {
          const modulePermissions = availablePermissions.filter(p => p.module?.name === moduleName);
          const modulePermissionIds = modulePermissions.map(p => p.id);
          const allModulePermissionsSelected = modulePermissionIds.every(id => selectedPermissionIds.includes(id));
          const someModulePermissionsSelected = modulePermissionIds.some(id => selectedPermissionIds.includes(id));
          
          return (
            <Card key={moduleName} className="bg-black/20 border-white/5">
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-white">
                  {modulePermissions[0]?.module?.display_name || moduleName}
                </CardTitle>
                <Switch 
                  checked={allModulePermissionsSelected}
                  onCheckedChange={() => handleModuleToggle(moduleName)}
                  className={someModulePermissionsSelected && !allModulePermissionsSelected ? "data-[state=checked]:bg-blue-600/50" : ""}
                />
              </CardHeader>
              <CardContent className="py-2 space-y-2">
                {modulePermissions.map((permission) => {
                  const isChecked = selectedPermissionIds.includes(permission.id);
                  
                  return (
                    <div key={permission.id} className="flex items-center justify-between">
                      <Label 
                        htmlFor={`perm-${permission.id}`} 
                        className="text-white/80 text-sm"
                      >
                        {permission.display_name}
                      </Label>
                      <Switch 
                        id={`perm-${permission.id}`}
                        checked={isChecked}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {availablePermissions.length === 0 && (
        <div className="text-center py-8 space-y-4">
          <p className="text-white/60">No permissions found in the database.</p>
          <div className="text-sm text-white/40">
            <p>This could mean:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The permissions table hasn't been populated yet</li>
              <li>The RBAC migration needs to be applied</li>
              <li>There's a database connection issue</li>
            </ul>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="border-white/20 hover:bg-white/10"
          >
            Refresh Page
          </Button>
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
