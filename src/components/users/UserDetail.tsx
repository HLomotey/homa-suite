import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { FrontendUser, UserRole, UserStatus, UserWithProfile } from '@/integration/supabase/types';
import { useUser, useUserWithProfile, useCreateUser, useUpdateUser, useUpsertProfile, useDeleteUser } from '@/hooks/user-profile';
import { useEnhancedUsers } from '@/hooks/user-profile/useEnhancedUsers';
import { authUserService } from '@/integration/supabase/auth-user-service';
import { UserProfileForm } from './UserProfileForm';
import { PermissionsGrid } from './PermissionsGrid';
import { UserActivityTab } from './UserActivityTab';
import { UserFormActions } from './UserFormActions';
import { Shield, User as UserIcon, Activity } from 'lucide-react';

export function UserDetail() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const isNewUser = userId === 'new';
  
  const [activeTab, setActiveTab] = useState('profile');
  const [customPermissionsEnabled, setCustomPermissionsEnabled] = useState(false);
  const [defaultPassword, setDefaultPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // Fetch user data if editing existing user using enhanced API
  const { users: allUsers, loading: fetchingUsers, error: usersError } = useEnhancedUsers();
  
  // Find the specific user from the enhanced users list
  let userWithProfile = allUsers.find(u => u.id === userId) || null;
  
  // If user not found by ID, try to find by email (fallback for Nana Sefa case)
  if (!userWithProfile && userId && allUsers.length > 0) {
    console.log('User not found by ID:', userId);
    console.log('Available users:', allUsers.map(u => ({ id: u.id, name: u.name, email: u.email })));
    
    // Try to find Nana Sefa specifically if the wrong ID is being used
    userWithProfile = allUsers.find(u => u.email === 'nanasefa@gmail.com') || null;
    if (userWithProfile) {
      console.log('Found user by email fallback:', userWithProfile);
    }
  }
  
  const fetchingUser = fetchingUsers;
  const fetchError = usersError;
  
  // CRUD hooks
  const { create, loading: creatingUser, error: createError } = useCreateUser();
  const { update, loading: updatingUser, error: updateError } = useUpdateUser();
  const { upsert, loading: upsertingProfile, error: profileUpsertError } = useUpsertProfile();
  const { deleteUser: deleteUserFn, loading: deletingUser, error: deleteError } = useDeleteUser();
  
  const isSubmitting = creatingUser || updatingUser || upsertingProfile || deletingUser;
  const isLoading = isNewUser ? isSubmitting : (fetchingUser || isSubmitting);
  
  // User form state
  const [user, setUser] = useState<FrontendUser>({
    id: '',
    name: '',
    email: '',
    role: 'staff' as UserRole,
    roleId: '',
    department: '',
    status: 'pending' as UserStatus,
    lastActive: new Date().toISOString(),
    permissions: [],
    createdAt: new Date().toISOString(),
    avatar: ''
  });

  // Load user data if editing existing user
  useEffect(() => {
    if (!isNewUser && userWithProfile) {
      console.log('Loading user data:', userWithProfile);
      console.log('User role:', userWithProfile.role);
      console.log('User roleId:', userWithProfile.roleId);
      console.log('User status:', userWithProfile.status);
      
      setUser({
        id: userWithProfile.id || '',
        name: userWithProfile.name || '',
        email: userWithProfile.email || '',
        role: (userWithProfile.role as UserRole) || 'staff',
        roleId: userWithProfile.roleId || '',
        department: userWithProfile.department || '',
        status: (userWithProfile.status as UserStatus) || 'active', // Default to active instead of pending
        lastActive: userWithProfile.lastActive || new Date().toISOString(),
        createdAt: userWithProfile.createdAt || new Date().toISOString(),
        permissions: userWithProfile.permissions || [],
        avatar: userWithProfile.avatar || ''
      });
      
      // Enable custom permissions if user has any custom permissions
      setCustomPermissionsEnabled((userWithProfile.permissions || []).length > 0);
    }
  }, [isNewUser, userWithProfile]);
  
  // Handle fetch errors
  useEffect(() => {
    if (fetchError) {
      toast({
        title: 'Error loading user',
        description: 'The requested user could not be loaded.',
        variant: 'destructive'
      });
      navigate('/users');
    }
  }, [fetchError, navigate, toast]);

  // Handle input changes
  const handleInputChange = (field: keyof FrontendUser, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  // Handle permission toggle
  const handlePermissionToggle = (permission: string) => {
    setUser(prev => {
      const currentPermissions = prev.permissions || [];
      const hasPermission = currentPermissions.includes(permission);
      
      return {
        ...prev,
        permissions: hasPermission
          ? currentPermissions.filter(p => p !== permission)
          : [...currentPermissions, permission]
      };
    });
  };

  // Handle custom permissions toggle
  const handleCustomPermissionsToggle = (enabled: boolean) => {
    setCustomPermissionsEnabled(enabled);
    
    // If disabling custom permissions, clear all permissions
    if (!enabled) {
      setUser(prev => ({ ...prev, permissions: [] }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user.name || !user.email || !user.role || !user.department) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    // Validate password for new users
    if (isNewUser && !defaultPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a default password for the new user.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      if (isNewUser) {
        // First, create the Supabase Auth user
        const authResult = await authUserService.createAuthUser({
          email: user.email,
          password: defaultPassword,
          name: user.name,
          role: user.role as UserRole,
          department: user.department,
          requirePasswordChange: true
        });

        if (!authResult.success) {
          toast({
            title: 'Authentication Error',
            description: `Failed to create auth user: ${authResult.error}`,
            variant: 'destructive'
          });
          return;
        }

        // Then create the custom user record
        const newUser = await create({
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          department: user.department,
          status: (user.status as UserStatus) || 'pending',
          permissions: customPermissionsEnabled ? (user.permissions || []) : []
        });
        
        if (newUser.id) {
          await upsert(newUser.id, {
            bio: '',
            preferences: {}
          });
        }

        // Send password reset email so user can set their own password
        const resetResult = await authUserService.sendPasswordResetEmail(user.email);
        
        toast({
          title: 'User created successfully',
          description: `${user.name} has been added. ${resetResult.success ? 'A password reset email has been sent.' : 'Please manually send password reset instructions.'}`
        });
      } else {
        if (user.id) {
          await update(user.id, {
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            department: user.department,
            status: user.status as UserStatus,
            permissions: customPermissionsEnabled ? (user.permissions || []) : []
          });
          
          await upsert(user.id, {
            bio: '',
            preferences: {}
          });
        }
        
        toast({
          title: 'User updated',
          description: `${user.name}'s information has been updated.`
        });
      }
      
      navigate('/users');
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to save user. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Handle user deletion
  const handleDelete = async () => {
    if (!user.id) return;
    
    try {
      await deleteUserFn(user.id);
      
      toast({
        title: 'User deleted',
        description: `${user.name} has been removed from the system.`
      });
      navigate('/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!user.email) return;
    
    setIsResettingPassword(true);
    
    try {
      const result = await authUserService.sendPasswordResetEmail(user.email);
      
      if (result.success) {
        toast({
          title: 'Password reset email sent',
          description: `A password reset email has been sent to ${user.email}.`
        });
      } else {
        toast({
          title: 'Error sending password reset',
          description: result.error || 'Failed to send password reset email.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        title: 'Error',
        description: 'Failed to send password reset email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Handle cancel/back navigation
  const handleCancel = () => {
    navigate('/users');
  };

  // Get status badge for display
  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      suspended: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">
                {isNewUser ? 'Create New User' : 'Edit User'}
              </CardTitle>
              <CardDescription className="text-white/60">
                {isNewUser 
                  ? 'Add a new user to the system with appropriate permissions' 
                  : `Manage ${user.name}'s account and permissions`
                }
              </CardDescription>
            </div>
            {!isNewUser && user.status && (
              <div className="flex items-center space-x-2">
                {getStatusBadge(user.status)}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-black/20">
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="permissions" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Access & Permissions
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  disabled={isNewUser}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Activity
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-6 mt-6">
                <UserProfileForm
                  user={user}
                  onInputChange={handleInputChange}
                  onPasswordChange={setDefaultPassword}
                  defaultPassword={defaultPassword}
                  isLoading={isLoading}
                  isNewUser={isNewUser}
                />
              </TabsContent>
              
              <TabsContent value="permissions" className="space-y-6 mt-6">
                <PermissionsGrid
                  user={user}
                  customPermissionsEnabled={customPermissionsEnabled}
                  onCustomPermissionsToggle={handleCustomPermissionsToggle}
                  onPermissionToggle={handlePermissionToggle}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-6 mt-6">
                <UserActivityTab user={user} />
              </TabsContent>
            </Tabs>
            
            <div className="pt-6 border-t border-white/10">
              <UserFormActions
                isNewUser={isNewUser}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
                onCancel={handleCancel}
                onPasswordReset={handlePasswordReset}
                canDelete={!isNewUser && user.role !== 'admin'}
                isResettingPassword={isResettingPassword}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
