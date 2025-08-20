import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { FrontendUser, UserRole, UserStatus, UserWithProfile } from '@/integration/supabase/types';
import { useUser, useUserWithProfile, useCreateUser, useUpdateUser, useUpsertProfile, useDeleteUser } from '@/hooks/user-profile';
import { useEnhancedUsers } from '@/hooks/user-profile/useEnhancedUsers';
import { useRoles } from '@/hooks/role';
import { adminUserService } from '@/integration/supabase/admin-client';
import { supabase } from '@/integration/supabase/client';
import { getUserEffectivePermissions, permissionsApi, userPermissionsApi } from "@/integration/supabase/permissions-api";
import * as enhancedUserApi from '@/integration/supabase/enhanced-user-api';
import { userRolesApi } from '@/integration/supabase/rbac-api';
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
  const [userRoles, setUserRoles] = useState<{ roleId: string, isPrimary: boolean }[]>([]);
  
  // Fetch user data if editing existing user using enhanced API
  const { users: allUsers, loading: fetchingUsers, error: usersError } = useEnhancedUsers();
  
  // Fetch roles for role mapping
  const { roles = [] } = useRoles();
  
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
    department: 'admin', // Set default department to avoid validation error
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
      
      // Load user roles if this is an existing user
      if (userWithProfile.id) {
        loadUserRoles(userWithProfile.id);
      }
    }
  }, [isNewUser, userWithProfile]);
  
  // Load user roles from the database
  const loadUserRoles = async (userId: string) => {
    try {
      // Get user roles directly from the user_roles table instead
      const { data: userRolesData, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      console.log('Loaded user roles:', userRolesData);
      
      if (Array.isArray(userRolesData)) {
        // Transform to the format expected by the UserProfileForm
        const formattedRoles = userRolesData.map(ur => ({
          roleId: String(ur.role_id), // Convert to string to match role.id format
          isPrimary: ur.is_primary || false
        }));
        
        console.log('Formatted roles for form:', formattedRoles);
        setUserRoles(formattedRoles);
      } else {
        console.error('User roles data is not an array:', userRolesData);
        setUserRoles([]);
      }
    } catch (error) {
      console.error('Error loading user roles:', error);
      toast({
        title: 'Error loading roles',
        description: 'Could not load user roles. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
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
  
  // Handle roles changes
  const handleRolesChange = (roles: { roleId: string, isPrimary: boolean }[]) => {
    console.log('Roles changed:', roles);
    setUserRoles(roles);
  };

  // Handle permission toggle
  const handlePermissionToggle = async (permission: string) => {
    console.log('UserDetail: handlePermissionToggle called with permission:', permission);
    console.log('UserDetail: Current user permissions:', user.permissions);
    
    // Store original permissions for rollback if needed
    const currentPermissions = user.permissions || [];
    const hasPermission = currentPermissions.includes(permission);
    
    // Calculate new permissions state
    const newPermissions = hasPermission
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    
    console.log('UserDetail: New permissions will be:', newPermissions);
    
    // Optimistically update UI state
    setUser(prev => ({
      ...prev,
      permissions: newPermissions
    }));
    
    // Save to database immediately if this is an existing user
    if (user.id && user.id !== 'new') {
      try {
        console.log('Saving updated permissions to database for user:', user.id);
        
        // Get the permission ID from the permission key
        const permissionDetails = await permissionsApi.getByKey(permission);
        
        if (!permissionDetails) {
          throw new Error(`Permission ${permission} not found`);
        }
        
        console.log('Found permission details:', permissionDetails);
        
        // Prepare the permission update request
        const permissionUpdateRequest = {
          user_id: user.id,
          permissions: [
            {
              permission_id: permissionDetails.id,
              is_granted: !hasPermission // Toggle the permission
            }
          ]
        };
        
        // Update the user's permissions using the proper API
        const updateResult = await userPermissionsApi.updateUserPermissions(permissionUpdateRequest);
        console.log('Permission update result:', updateResult);
        
        // Fetch the latest effective permissions to ensure UI is in sync with DB
        const permissionsResponse = await getUserEffectivePermissions(user.id);
        console.log('Updated effective permissions:', permissionsResponse);
        
        // Force a refresh of the user object with the latest permissions
        const { users: refreshedUsers } = await enhancedUserApi.getUsersWithRoles();
        const refreshedUser = refreshedUsers.find(u => u.id === user.id);
        
        if (refreshedUser) {
          console.log('Refreshed user data:', refreshedUser);
          // Update the full user object with the latest data
          setUser(prev => ({
            ...prev,
            ...refreshedUser,
            // Ensure we keep the newly toggled permission state
            permissions: newPermissions
          }));
        }
        
        toast({
          title: 'Permissions updated',
          description: hasPermission 
            ? `Removed permission: ${permission}` 
            : `Added permission: ${permission}`,
          variant: 'default'
        });
      } catch (error) {
        console.error('Error updating permissions:', error);
        
        // Revert the local state change on error
        setUser(prev => ({
          ...prev,
          permissions: currentPermissions // Revert to original permissions
        }));
        
        toast({
          title: 'Error updating permissions',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive'
        });
      }
    }
  };

  // Handle custom permissions toggle
  const handleCustomPermissionsToggle = (enabled: boolean) => {
    console.log('UserDetail: Custom permissions toggle clicked, enabled:', enabled);
    console.log('UserDetail: Previous customPermissionsEnabled state:', customPermissionsEnabled);
    setCustomPermissionsEnabled(enabled);
    console.log('UserDetail: New customPermissionsEnabled state will be:', enabled);
    
    // If disabling custom permissions, clear all permissions
    if (!enabled) {
      setUser(prev => ({ ...prev, permissions: [] }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user.name || !user.email || !user.department) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate that at least one role is assigned
    if (userRoles.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please assign at least one role to the user.',
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
        let authUserId: string | null = null;
        
        try {
          // Create Supabase Auth user using admin client
          console.log('Creating auth user with admin client...');
          
          const authResult = await adminUserService.createAuthUser({
            email: user.email,
            password: defaultPassword,
            name: user.name,
            role: user.role,
            department: user.department,
            requirePasswordChange: true
          });

          if (!authResult.success) {
            // Check if it's a duplicate email error - overwrite existing user
            if (authResult.error?.includes('already been registered')) {
              console.log('Email already exists, attempting to overwrite existing user...');
              
              try {
                // First, find and delete the existing auth user
                const existingAuthResult = await adminUserService.deleteUserByEmail(user.email);
                
                if (existingAuthResult.success) {
                  console.log('Existing auth user deleted, creating new one...');
                  
                  // Try creating the auth user again
                  const retryAuthResult = await adminUserService.createAuthUser({
                    email: user.email,
                    password: defaultPassword,
                    name: user.name,
                    role: user.role,
                    department: user.department,
                    requirePasswordChange: true
                  });
                  
                  if (!retryAuthResult.success) {
                    toast({
                      title: 'Authentication Error',
                      description: `Failed to create auth user after cleanup: ${retryAuthResult.error}`,
                      variant: 'destructive'
                    });
                    return;
                  }
                  
                  // Update authUserId with the new user ID
                  authUserId = retryAuthResult.user?.id || null;
                  console.log('New auth user created successfully with ID:', authUserId);
                  
                  toast({
                    title: 'Existing User Overwritten',
                    description: `Existing user with email ${user.email} has been replaced with the new user data.`,
                    variant: 'default'
                  });
                } else {
                  toast({
                    title: 'Cleanup Failed',
                    description: `Could not remove existing user: ${existingAuthResult.message || 'Unknown error'}`,
                    variant: 'destructive'
                  });
                  return;
                }
              } catch (overwriteError) {
                console.error('Error during user overwrite:', overwriteError);
                toast({
                  title: 'Overwrite Failed',
                  description: 'Failed to overwrite existing user. Please try again.',
                  variant: 'destructive'
                });
                return;
              }
            } else {
              toast({
                title: 'Authentication Error',
                description: `Failed to create auth user: ${authResult.error}`,
                variant: 'destructive'
              });
              return;
            }
          } else {
            // Store auth user ID for normal creation flow
            authUserId = authResult.user?.id || null;
            console.log('Auth user created successfully with ID:', authUserId);
          }
          
          // Get the primary role for the user
          const primaryRole = userRoles.find(r => r.isPrimary);
          let userRole = user.role;
          
          if (primaryRole) {
            const selectedRole = roles.find(r => r.id === primaryRole.roleId);
            if (selectedRole) {
              userRole = selectedRole.name as UserRole;
            }
          }
        
        const userWithAuthId = {
          ...user,
          id: authUserId || '', // Use the auth user ID
          role: userRole,
          roleId: primaryRole?.roleId || ''
        };
        
        // Debug role value before creation
        console.log('=== ROLE DEBUGGING ===');
        console.log('Original user role:', user.role);
        console.log('User with auth ID role:', userWithAuthId.role);
        console.log('User roleId:', userWithAuthId.roleId);
        console.log('User roles:', userRoles);
        console.log('=====================');
        
          const createdUser = await create(userWithAuthId);
          
          if (!createdUser) {
            // Rollback: Delete the auth user if database user creation failed
            if (authUserId) {
              try {
                await adminUserService.deleteAuthUser(authUserId);
                console.log('Rolled back auth user creation due to database failure');
              } catch (rollbackError) {
                console.error('Failed to rollback auth user:', rollbackError);
              }
            }
            
            toast({
              title: 'User Creation Error',
              description: 'Failed to create user in database. Auth user has been cleaned up.',
              variant: 'destructive'
            });
            return;
          }

        // Verify ID synchronization
        console.log('ID Synchronization Check:');
        console.log('- Auth User ID:', authUserId);
        console.log('- Database User ID:', createdUser.id);
        console.log('- IDs Match:', authUserId === createdUser.id);

        if (authUserId !== createdUser.id) {
          console.error('CRITICAL: ID mismatch detected!');
          toast({
            title: 'ID Synchronization Error',
            description: 'Auth user and database user IDs do not match. This may cause deletion issues.',
            variant: 'destructive'
          });
        }

        // Profile creation (handled by database trigger, but verify it exists)
        if (createdUser.id) {
          // The trigger should have created the profile automatically
          // Let's verify the profile was created with the correct user_id
          console.log('Verifying profile creation for user ID:', createdUser.id);
          
          // Add additional profile data if needed
          await upsert(createdUser.id, {
            bio: '',
            preferences: {}
          });
          
          console.log('Profile upsert completed for user ID:', createdUser.id);
          
          // Assign all roles to the user
          console.log('Assigning roles to new user:', userRoles);
          for (const userRole of userRoles) {
            try {
              await userRolesApi.assignRole({
                user_id: createdUser.id,
                role_id: userRole.roleId,
                is_primary: userRole.isPrimary
              });
              console.log(`Role ${userRole.roleId} assigned successfully with primary=${userRole.isPrimary}`);
            } catch (roleError) {
              console.error(`Error assigning role ${userRole.roleId}:`, roleError);
            }
          }
          
          // Verify complete ID synchronization across all entities
          setTimeout(async () => {
            try {
              console.log('=== COMPLETE ID SYNCHRONIZATION VERIFICATION ===');
              
              // Check if profile exists with correct id
              // Don't use .single() as it causes errors when multiple profiles exist
              const { data: profilesData, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('id', createdUser.id);
              
              // Get the first profile if multiple exist
              const profileData = profilesData && profilesData.length > 0 ? profilesData[0] : null;
              
              if (profileError) {
                console.error('Profile verification failed:', profileError);
              } else {
                console.log('✅ Profile found:');
                console.log('- Profile ID:', profileData.id);
                console.log('- Profile matches auth user ID:', profileData.id === createdUser.id);
              }
              
              // Summary of all IDs
              console.log('=== ID SYNCHRONIZATION SUMMARY ===');
              console.log('Auth User ID:', authUserId);
              console.log('Database User ID:', createdUser.id);
              console.log('Profile ID:', profileData?.id);
              console.log('All IDs synchronized:', 
                authUserId === createdUser.id && 
                createdUser.id === profileData?.id
              );
              console.log('=======================================');
              
            } catch (error) {
              console.error('ID verification error:', error);
            }
          }, 1000); // Wait 1 second for database trigger to complete
        }

          // Send password reset email using admin client
          const resetResult = await adminUserService.sendPasswordResetEmail(user.email);
          
          toast({
            title: 'User created successfully',
            description: `${user.name} has been added to the system. ${resetResult.success ? 'A password reset email has been sent.' : 'Please manually send password reset instructions.'}`
          });

          // Set refresh flag for users list
          sessionStorage.setItem('refreshUsers', 'true');
          
        } catch (userCreationError) {
          // Handle any errors during user creation process
          console.error('User creation failed:', userCreationError);
          
          // Rollback: Delete the auth user if any step failed
          if (authUserId) {
            try {
              await adminUserService.deleteAuthUser(authUserId);
              console.log('Rolled back auth user creation due to process failure');
            } catch (rollbackError) {
              console.error('Failed to rollback auth user:', rollbackError);
            }
          }
          
          toast({
            title: 'User Creation Failed',
            description: 'Failed to create user. Any partial changes have been rolled back.',
            variant: 'destructive'
          });
          return;
        }
      } else {
        if (user.id) {
          // Get the primary role for the user profile
          const primaryRole = userRoles.find(r => r.isPrimary);
          let userRole = user.role;
          let userRoleId = '';
          
          if (primaryRole) {
            const selectedRole = roles.find(r => r.id === primaryRole.roleId);
            if (selectedRole) {
              userRole = selectedRole.name as UserRole;
              userRoleId = selectedRole.id;
            }
          }
          
          await update(user.id, {
            name: user.name,
            email: user.email,
            role: userRole,
            roleId: userRoleId,
            department: user.department,
            status: user.status as UserStatus,
            permissions: customPermissionsEnabled ? (user.permissions || []) : []
          });
          
          await upsert(user.id, {
            bio: '',
            preferences: {}
          });
          
          // Update user roles
          console.log('Updating user roles:', userRoles);
          
          // Get all role IDs
          const roleIds = userRoles.map(ur => ur.roleId);
          
          // Find the primary role ID
          const primaryRoleId = userRoles.find(ur => ur.isPrimary)?.roleId;
          
          // Update all user roles at once
          await userRolesApi.updateUserRoles({
            user_id: user.id,
            role_ids: roleIds,
            primary_role_id: primaryRoleId
          });
        }
        
        toast({
          title: 'User updated',
          description: `${user.name}'s information has been updated.`
        });

        // Set refresh flag for users list
        sessionStorage.setItem('refreshUsers', 'true');
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
    
    // Prevent deletion of nanasefa@gmail.com as requested
    if (user.email === 'nanasefa@gmail.com') {
      toast({
        title: 'Cannot Delete User',
        description: 'This user cannot be deleted as it is a protected admin account.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      console.log('Deleting user with ID:', user.id, 'and email:', user.email);
      
      // Step 1: Delete auth user first to ensure it's removed from auth system
      console.log('First deleting auth user:', user.id, 'with email:', user.email);
      const authDeleteResult = await adminUserService.deleteAuthUser(user.id, user.email);
      
      if (!authDeleteResult.success) {
        // Check if it's just a "user not found" error, which is acceptable
        if (authDeleteResult.error?.includes('User not found')) {
          console.log('Auth user was already deleted or never existed - continuing with database deletion');
        } else {
          console.warn('Warning: Failed to delete auth user:', authDeleteResult.error);
          // Continue with database deletion even if auth deletion fails
        }
      } else {
        console.log('Auth user deleted successfully');
      }
      
      // Step 2: Delete user from database (profiles, permissions, etc.)
      console.log('Now deleting user from database:', user.id);
      await deleteUserFn(user.id);
      
      toast({
        title: 'User deleted',
        description: `${user.name} has been completely removed from the system.`
      });
      
      // Set refresh flag for users list
      sessionStorage.setItem('refreshUsers', 'true');
      
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
      const result = await adminUserService.sendPasswordResetEmail(user.email);
      
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
                  userRoles={userRoles}
                  onRolesChange={handleRolesChange}
                />
              </TabsContent>
              
              <TabsContent value="permissions" className="space-y-6 mt-6">
                <PermissionsGrid
                  user={user}
                  customPermissionsEnabled={customPermissionsEnabled}
                  onCustomPermissionsToggle={handleCustomPermissionsToggle}
                  onPermissionToggle={handlePermissionToggle}
                  isLoading={isLoading}
                  isNewUser={isNewUser}
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
                canDelete={!isNewUser} // Role restrictions removed - allow deletion of all users
                isResettingPassword={isResettingPassword}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
