import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Check, Loader2 } from 'lucide-react';
import { NAVIGATION_MODULES, NavigationModule } from '@/config/navigation-modules';
import { updateRoleModules, getRoleModules } from '@/hooks/role/modules-api';

interface RoleModulesTabProps {
  roleId: string;
  onModulesUpdate: (modules: string[]) => void;
}

export const RoleModulesTab: React.FC<RoleModulesTabProps> = ({
  roleId,
  onModulesUpdate
}) => {
  const { toast } = useToast();
  
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current role modules
  useEffect(() => {
    const fetchRoleModules = async () => {
      try {
        setLoadingData(true);
        const roleModules = await getRoleModules(roleId);
        setSelectedModules(roleModules);
      } catch (error) {
        console.error('Error fetching role modules:', error);
        toast({
          title: 'Error',
          description: 'Failed to load role modules',
          variant: 'destructive'
        });
      } finally {
        setLoadingData(false);
      }
    };

    if (roleId) {
      fetchRoleModules();
    }
  }, [roleId, toast]);

  // Handle module toggle
  const handleModuleToggle = (moduleId: string) => {
    const isSelected = selectedModules.includes(moduleId);
    
    const newModules = isSelected
      ? selectedModules.filter(m => m !== moduleId)
      : [...selectedModules, moduleId];
    
    setSelectedModules(newModules);
    setHasChanges(true);
  };

  // Select all modules
  const handleSelectAll = () => {
    const allModuleIds = NAVIGATION_MODULES.map(m => m.id);
    setSelectedModules(allModuleIds);
    setHasChanges(true);
  };

  // Deselect all modules
  const handleDeselectAll = () => {
    setSelectedModules([]);
    setHasChanges(true);
  };

  // Save changes
  const handleSaveChanges = async () => {
    try {
      setUpdating(true);
      await updateRoleModules(roleId, selectedModules);
      
      onModulesUpdate(selectedModules);
      
      setHasChanges(false);
      toast({
        title: 'Modules updated',
        description: 'Role modules have been updated successfully'
      });
    } catch (error) {
      console.error('Error updating modules:', error);
      toast({
        title: 'Error',
        description: 'Failed to update modules',
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
      const roleModules = await getRoleModules(roleId);
      setSelectedModules(roleModules);
      setHasChanges(false);
    } catch (error) {
      console.error('Error resetting modules:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-white/60 mr-2" />
        <span className="text-white/60">Loading modules data...</span>
      </div>
    );
  }

  const allSelected = selectedModules.length === NAVIGATION_MODULES.length;
  const someSelected = selectedModules.length > 0;

  return (
    <div className="space-y-6">
      {hasChanges && (
        <div className="flex items-center justify-between bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
          <p className="text-blue-400">You have unsaved module changes</p>
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

      {/* Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-white">Navigation Modules</h3>
          <span className="text-sm text-white/60">
            {selectedModules.length} of {NAVIGATION_MODULES.length} selected
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={allSelected}
            className="border-white/20 hover:bg-white/10"
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={!someSelected}
            className="border-white/20 hover:bg-white/10"
          >
            Deselect All
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {NAVIGATION_MODULES.map((module: NavigationModule) => {
          const isSelected = selectedModules.includes(module.id);
          
          return (
            <Card key={module.id} className={`bg-black/20 border-white/5 transition-all ${isSelected ? 'ring-2 ring-blue-500/50' : ''}`}>
              <CardHeader className="py-4 flex flex-row items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base text-white mb-1">
                    {module.displayName}
                  </CardTitle>
                  <p className="text-sm text-white/60">
                    {module.description}
                  </p>
                </div>
                <Switch 
                  checked={isSelected}
                  onCheckedChange={() => handleModuleToggle(module.id)}
                  className="ml-4"
                />
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-xs text-white/40">
                  <p className="font-medium mb-1">Routes:</p>
                  <ul className="space-y-1">
                    {module.routes.map((route, index) => (
                      <li key={index} className="font-mono">
                        {route}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
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
