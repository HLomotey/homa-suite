import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, X, UserPlus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useEnhancedUsers } from '@/hooks/user-profile/useEnhancedUsers';
import { userRolesApi } from '@/integration/supabase/rbac-api';
import { UserWithRoles } from '@/integration/supabase/types/rbac-types';

interface RoleUsersTabProps {
  roleId: string;
}

export const RoleUsersTab: React.FC<RoleUsersTabProps> = ({ roleId }) => {
  const { toast } = useToast();
  const { users: allUsers, loading: loadingAllUsers } = useEnhancedUsers();
  
  const [usersWithRole, setUsersWithRole] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  
  // Fetch users with this role
  useEffect(() => {
    const fetchUsersWithRole = async () => {
      try {
        setLoading(true);
        const users = await userRolesApi.getUsersWithRole(roleId);
        setUsersWithRole(users);
      } catch (error) {
        console.error('Error fetching users with role:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users with this role',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsersWithRole();
  }, [roleId, toast]);
  
  // Filter users based on search query
  const filteredUsers = usersWithRole.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get users not already assigned to this role
  const usersNotInRole = allUsers.filter(user => 
    !usersWithRole.some(u => u.id === user.id)
  );
  
  // Filter available users based on search in dialog
  const [dialogSearchQuery, setDialogSearchQuery] = useState('');
  const filteredAvailableUsers = usersNotInRole.filter(user => 
    user.name?.toLowerCase().includes(dialogSearchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(dialogSearchQuery.toLowerCase())
  );
  
  // Handle adding user to role
  const handleAddUserToRole = async (userId: string) => {
    try {
      setProcessingUser(userId);
      await userRolesApi.assignRole({ user_id: userId, role_id: roleId, is_primary: false }); // Not primary role by default
      
      // Refresh the users list
      const users = await userRolesApi.getUsersWithRole(roleId);
      setUsersWithRole(users);
      
      toast({
        title: 'User added to role',
        description: 'User has been assigned to this role successfully'
      });
    } catch (error) {
      console.error('Error adding user to role:', error);
      toast({
        title: 'Error',
        description: 'Failed to add user to role',
        variant: 'destructive'
      });
    } finally {
      setProcessingUser(null);
    }
  };
  
  // Handle removing user from role
  const handleRemoveUserFromRole = async (userId: string) => {
    try {
      setProcessingUser(userId);
      await userRolesApi.removeRole(userId, roleId);
      
      // Update local state
      setUsersWithRole(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: 'User removed from role',
        description: 'User has been removed from this role successfully'
      });
    } catch (error) {
      console.error('Error removing user from role:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove user from role',
        variant: 'destructive'
      });
    } finally {
      setProcessingUser(null);
    }
  };
  
  // Handle setting a role as primary for a user
  const handleSetAsPrimaryRole = async (userId: string) => {
    try {
      setProcessingUser(userId);
      await userRolesApi.assignRole({ user_id: userId, role_id: roleId, is_primary: true }); // Set as primary role
      
      // Refresh the users list
      const users = await userRolesApi.getUsersWithRole(roleId);
      setUsersWithRole(users);
      
      toast({
        title: 'Primary role updated',
        description: 'This role is now the primary role for the user'
      });
    } catch (error) {
      console.error('Error setting primary role:', error);
      toast({
        title: 'Error',
        description: 'Failed to set primary role',
        variant: 'destructive'
      });
    } finally {
      setProcessingUser(null);
    }
  };
  
  if (loading) {
    return (
      <div className="text-white/60 text-center py-8">Loading users...</div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search users..."
            className="pl-10 bg-black/20 border-white/10 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={() => setShowAddUserDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 ml-4"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
      
      <Card className="bg-black/20 border-white/5">
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-white/60 text-center py-8">
              {searchQuery ? 'No users match your search' : 'No users have been assigned to this role yet'}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 bg-blue-900/30">
                      <AvatarImage src={user.avatar || ''} />
                      <AvatarFallback className="bg-blue-900/30 text-blue-200">
                        {user.name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="text-white font-medium">{user.name}</h3>
                      <p className="text-white/60 text-sm">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {user.is_primary_role && (
                      <Badge className="bg-green-900/20 text-green-400 border-green-500/30">
                        Primary Role
                      </Badge>
                    )}
                    
                    <div className="flex space-x-2">
                      {!user.is_primary_role && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetAsPrimaryRole(user.id)}
                          disabled={processingUser === user.id}
                          className="text-white/70 border-white/20 hover:bg-white/10 text-xs"
                        >
                          Set as Primary
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveUserFromRole(user.id)}
                        disabled={processingUser === user.id}
                        className="text-white/70 hover:text-red-400 hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add Users to Role</DialogTitle>
            <DialogDescription className="text-white/70">
              Select users to assign to this role
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative my-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search users..."
              className="pl-10 bg-black/20 border-white/10 text-white"
              value={dialogSearchQuery}
              onChange={(e) => setDialogSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {loadingAllUsers ? (
              <div className="text-white/60 text-center py-4">Loading users...</div>
            ) : filteredAvailableUsers.length === 0 ? (
              <div className="text-white/60 text-center py-4">
                {dialogSearchQuery ? 'No users match your search' : 'All users already have this role'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAvailableUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-2 hover:bg-white/5 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8 bg-blue-900/30">
                        <AvatarImage src={user.avatar || ''} />
                        <AvatarFallback className="bg-blue-900/30 text-blue-200">
                          {user.name?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="text-white text-sm font-medium">{user.name}</h3>
                        <p className="text-white/60 text-xs">{user.email}</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        handleAddUserToRole(user.id);
                        setDialogSearchQuery('');
                      }}
                      disabled={processingUser === user.id}
                      className="text-white/70 border-white/20 hover:bg-white/10 text-xs"
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddUserDialog(false)}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
