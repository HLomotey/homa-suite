import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { FrontendRole } from '@/integration/supabase/types';
import { useRoles, useDeleteRole } from '@/hooks/role/useRole';
import { Plus, Search, Edit, Trash2, Shield } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export function RoleList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { roles, loading, error, refetch } = useRoles();
  const { deleteRole, loading: deleting } = useDeleteRole();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleToDelete, setRoleToDelete] = useState<FrontendRole | null>(null);
  
  // Debug logging
  console.log('🎯 RoleList: Component rendered');
  console.log('📊 RoleList: roles =', roles);
  console.log('⏳ RoleList: loading =', loading);
  console.log('❌ RoleList: error =', error);
  
  // Filter roles based on search query
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle role deletion
  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    
    try {
      await deleteRole(roleToDelete.id);
      toast({
        title: 'Role deleted',
        description: `${roleToDelete.name} has been removed.`
      });
      refetch(); // Refresh the roles list
      setRoleToDelete(null);
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete role',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white text-xl">Roles</CardTitle>
            <p className="text-white/60 text-sm mt-1">
              Manage roles and their permissions
            </p>
          </div>
          <Button onClick={() => navigate('/roles/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Role
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search roles..."
              className="pl-10 bg-black/20 border-white/10 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {loading ? (
            <div className="text-white/60 text-center py-8">Loading roles...</div>
          ) : error ? (
            <div className="text-red-400 text-center py-8">Error loading roles: {error.message}</div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-white/60 text-center py-8">
              {searchQuery ? 'No roles match your search' : 'No roles found. Create your first role!'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRoles.map((role) => (
                <div 
                  key={role.id} 
                  className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-blue-400" />
                    <div>
                      <h3 className="text-white font-medium">{role.name}</h3>
                      <p className="text-white/60 text-sm">{role.description || 'No description'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-500/30">
                      {role.permissions?.length || 0} permissions
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate(`/roles/${role.id}`)}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setRoleToDelete(role)}
                        className="text-white/70 hover:text-red-400 hover:bg-red-900/20"
                        disabled={false} // Role restrictions removed - allow deletion of all roles
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <AlertDialogContent className="bg-black/90 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
              Users assigned to this role will lose access associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRole}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
