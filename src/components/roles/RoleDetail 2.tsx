import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { FrontendRole } from '@/integration/supabase/types';
import { useRole, useCreateRole, useUpdateRole } from '@/hooks/role/useRole';
import { RoleModulesTab } from '@/components/roles/RoleModulesTab';
import { RoleUsersTab } from '@/components/roles/RoleUsersTab';
import { Shield, Users } from 'lucide-react';

export function RoleDetail() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { roleId } = useParams<{ roleId: string }>();
  
  // Check URL parameters for role ID and action
  const urlParams = new URLSearchParams(location.search);
  const urlRoleId = urlParams.get('roleId');
  const action = urlParams.get('action');
  const isNewRole = action === 'new' || roleId === 'new';
  const currentRoleId = urlRoleId || roleId;
  
  // Fetch role data if editing existing role
  const { role: existingRole, loading: fetchingRole, error: fetchError } = useRole(isNewRole ? '' : currentRoleId || '');
  
  // CRUD hooks
  const { create, loading: creatingRole } = useCreateRole();
  const { update, loading: updatingRole } = useUpdateRole();
  
  const isSubmitting = creatingRole || updatingRole;
  const isLoading = isNewRole ? isSubmitting : (fetchingRole || isSubmitting);
  
  // Role form state
  const [role, setRole] = useState<Partial<FrontendRole>>({
    name: '',
    description: '',
    permissions: []
  });
  
  const [roleModules, setRoleModules] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState('details');
  
  // Load role data if editing existing role
  useEffect(() => {
    if (!isNewRole && existingRole) {
      setRole({
        id: existingRole.id,
        name: existingRole.name,
        description: existingRole.description,
        permissions: existingRole.permissions || []
      });
    }
  }, [isNewRole, existingRole]);
  
  // Handle fetch errors
  useEffect(() => {
    if (fetchError) {
      toast({
        title: 'Error loading role',
        description: 'The requested role could not be loaded.',
        variant: 'destructive'
      });
      navigate('/roles');
    }
  }, [fetchError, navigate, toast]);
  
  // Handle input changes
  const handleInputChange = (field: keyof FrontendRole, value: string) => {
    setRole(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle modules update
  const handleModulesUpdate = (modules: string[]) => {
    setRoleModules(modules);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role.name) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a role name.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      if (isNewRole) {
        await create({
          name: role.name,
          description: role.description || '',
          permissions: role.permissions || []
        });
        
        toast({
          title: 'Role created',
          description: `${role.name} has been created successfully.`
        });
      } else if (role.id) {
        await update(role.id, {
          name: role.name,
          description: role.description,
          permissions: role.permissions
        });
        
        toast({
          title: 'Role updated',
          description: `${role.name} has been updated successfully.`
        });
      }
      
      // Navigate back to roles tab
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('roleId');
      newUrl.searchParams.delete('action');
      newUrl.searchParams.set('tab', 'roles');
      navigate(newUrl.pathname + newUrl.search, { replace: true });
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save role',
        variant: 'destructive'
      });
    }
  };
  
  // Handle cancel/back navigation
  const handleCancel = () => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('roleId');
    newUrl.searchParams.delete('action');
    newUrl.searchParams.set('tab', 'roles');
    navigate(newUrl.pathname + newUrl.search, { replace: true });
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            {isNewRole ? 'Create New Role' : 'Edit Role'}
          </CardTitle>
          <CardDescription className="text-white/60">
            {isNewRole 
              ? 'Define a new role with specific permissions' 
              : `Manage ${role.name}'s permissions and users`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-black/20">
                <TabsTrigger 
                  value="details" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="permissions" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Permissions
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  disabled={isNewRole}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Role Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter role name"
                      value={role.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={isLoading && !isNewRole} // Only disable when loading existing role
                      className="bg-black/20 border-white/10 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the purpose of this role"
                      value={role.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={false} // Always allow description editing
                      className="bg-black/20 border-white/10 text-white min-h-[100px]"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="permissions" className="space-y-6 mt-6">
                {!isNewRole && role.id && (
                  <RoleModulesTab 
                    roleId={role.id} 
                    onModulesUpdate={handleModulesUpdate}
                  />
                )}
                {isNewRole && (
                  <div className="text-center py-8 text-white/60">
                    <p>Save the role first to assign navigation modules</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="users" className="space-y-6 mt-6">
                {!isNewRole && role.id && (
                  <RoleUsersTab roleId={role.id} />
                )}
              </TabsContent>
            </Tabs>
            
            <div className="pt-6 border-t border-white/10 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting || !role.name?.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Saving...' : isNewRole ? 'Create Role' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
