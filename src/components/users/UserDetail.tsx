import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Shield, User as UserIcon, Activity, Key, Eye, EyeOff, RefreshCw } from 'lucide-react';

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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
      // Get user role from the profiles table (simplified role system)
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('role_id')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      console.log('Loaded user profile with role:', profileData);
      
      if (profileData && profileData.role_id) {
        // Transform to the format expected by the UserProfileForm
        const formattedRoles = [{
          roleId: String(profileData.role_id), // Convert to string to match role.id format
          isPrimary: true // Single role is always primary
        }];
        
        console.log('Formatted roles for form:', formattedRoles);
        setUserRoles(formattedRoles);
      } else {
        console.log('No role assigned to user');
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
            // If user already exists, show error and stop
            if (authResult.error?.includes('already been registered')) {
              toast({
                title: 'User Already Exists',
                description: `A user with email ${user.email} already exists. Please use a different email address.`,
                variant: 'destructive'
              });
              return;
            } else {
              // Handle other auth creation errors
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

  // Generate a random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(result);
    setConfirmPassword(result);
  };

  // Handle manual password reset
  const handleManualPasswordReset = async () => {
    if (!user.id || !user.email) {
      toast({
        title: 'Error',
        description: 'User ID or email is missing.',
        variant: 'destructive'
      });
      return;
    }

    if (!newPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a new password.',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match.',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive'
      });
      return;
    }

    setIsResettingPassword(true);

    try {
      // Update the user's password using admin service
      const result = await adminUserService.updateUserPassword(user.id, newPassword);

      if (result.success) {
        toast({
          title: 'Password updated successfully',
          description: `Password has been reset for ${user.name}. They will be required to change it on next login.`
        });
        
        // Clear the password fields
        setNewPassword('');
        setConfirmPassword('');
        
        // Send notification email
        const emailResult = await adminUserService.sendPasswordResetEmail(user.email);
        if (!emailResult.success) {
          toast({
            title: 'Password updated, email failed',
            description: 'Password was reset but notification email could not be sent.',
            variant: 'default'
          });
        }
      } else {
        toast({
          title: 'Error updating password',
          description: result.error || 'Failed to update password.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error',
        description: 'Failed to update password. Please try again.',
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
                  value="password" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  disabled={isNewUser}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Password Reset
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
              
              <TabsContent value="password" className="space-y-6 mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Password Management</h3>
                      <p className="text-sm text-white/60">Reset the user's password or send a password reset email</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Email Reset Option */}
                    <div className="space-y-4 p-4 bg-black/20 border border-white/10 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Key className="h-5 w-5 text-blue-400" />
                        <h4 className="font-medium text-white">Email Password Reset</h4>
                      </div>
                      <p className="text-sm text-white/60">
                        Send a secure password reset link to the user's email address.
                      </p>
                      <Button
                        type="button"
                        onClick={handlePasswordReset}
                        disabled={isResettingPassword || !user.email}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isResettingPassword ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Reset Email'
                        )}
                      </Button>
                    </div>

                    {/* Manual Reset Option */}
                    <div className="space-y-4 p-4 bg-black/20 border border-white/10 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-orange-400" />
                        <h4 className="font-medium text-white">Manual Password Reset</h4>
                      </div>
                      <p className="text-sm text-white/60">
                        Set a new password directly. User will be required to change it on next login.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-white text-sm">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password"
                              className="bg-black/20 border-white/10 text-white placeholder:text-white/50 pr-10"
                              disabled={isResettingPassword}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              disabled={isResettingPassword}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-white/60" />
                              ) : (
                                <Eye className="h-4 w-4 text-white/60" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-white text-sm">Confirm Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                              className="bg-black/20 border-white/10 text-white placeholder:text-white/50 pr-10"
                              disabled={isResettingPassword}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              disabled={isResettingPassword}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-white/60" />
                              ) : (
                                <Eye className="h-4 w-4 text-white/60" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateRandomPassword}
                            disabled={isResettingPassword}
                            className="bg-black/20 border-white/10 text-white hover:bg-white/10"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Generate
                          </Button>
                          <Button
                            type="button"
                            onClick={handleManualPasswordReset}
                            disabled={isResettingPassword || !newPassword || !confirmPassword}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            {isResettingPassword ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              'Reset Password'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Shield className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-400">Security Notice</h4>
                        <p className="text-sm text-yellow-200/80 mt-1">
                          Both methods will require the user to change their password on the next login. 
                          Manual password reset should only be used when email delivery is not possible.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
