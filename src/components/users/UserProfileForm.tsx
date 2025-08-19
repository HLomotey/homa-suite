import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FrontendUser } from '@/integration/supabase/types';
import { useRoles } from '@/hooks/role/useRole';
import { Role } from '@/integration/supabase/types/rbac-types';
import { Eye, EyeOff, RefreshCw, AlertCircle, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

interface UserProfileFormProps {
  user: FrontendUser;
  onInputChange: (field: keyof FrontendUser, value: string) => void;
  onPasswordChange?: (password: string) => void;
  defaultPassword?: string;
  isLoading: boolean;
  isNewUser?: boolean;
  onRolesChange: (roles: { roleId: string, isPrimary: boolean }[]) => void;
  userRoles: { roleId: string, isPrimary: boolean }[];
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  user,
  onInputChange,
  onPasswordChange,
  defaultPassword = '',
  isLoading,
  isNewUser = false,
  onRolesChange,
  userRoles
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState(defaultPassword);
  
  // Fetch roles from database
  const { roles, loading: rolesLoading, error: rolesError } = useRoles();

  // Generate a random default password
  const generateDefaultPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    onPasswordChange?.(result);
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    onPasswordChange?.(newPassword);
  };

  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [availableRoles, setAvailableRoles] = useState(roles || []);

  // Update available roles when roles or userRoles change
  useEffect(() => {
    // Filter out roles that the user already has
    const userRoleIds = userRoles.map(ur => ur.roleId);
    const filteredRoles = (roles || []).filter(role => !userRoleIds.includes(role.id));
    setAvailableRoles(filteredRoles);
  }, [roles, userRoles]);

  // Handle adding a role to the user
  const handleAddRole = (roleId: string) => {
    // If this is the first role, make it primary
    const isPrimary = userRoles.length === 0;
    const updatedRoles = [...userRoles, { roleId, isPrimary }];
    onRolesChange(updatedRoles);
    setShowRoleDialog(false);
  };

  // Handle removing a role from the user
  const handleRemoveRole = (roleIdToRemove: string) => {
    const updatedRoles = userRoles.filter(role => role.roleId !== roleIdToRemove);

    // If we removed the primary role, set the first remaining role as primary
    if (userRoles.find(role => role.roleId === roleIdToRemove)?.isPrimary && updatedRoles.length > 0) {
      updatedRoles[0].isPrimary = true;
    }

    onRolesChange(updatedRoles);
  };

  // Handle setting a role as primary
  const handleSetPrimaryRole = (roleId: string) => {
    const updatedRoles = userRoles.map(role => ({
      ...role,
      isPrimary: role.roleId === roleId
    }));
    onRolesChange(updatedRoles);
  };

  // Get role name by ID
  const getRoleName = (roleId: string) => {
    const role = (roles || []).find(r => r.id === roleId);
    return role?.name || 'Unknown Role';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Full Name *</Label>
          <Input
            id="name"
            type="text"
            value={user.name || ''}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="Enter full name"
            className="bg-black/20 border-white/10 text-white placeholder:text-white/50"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={user.email || ''}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="Enter email address"
            className="bg-black/20 border-white/10 text-white placeholder:text-white/50"
            disabled={isLoading}
          />
        </div>
      </div>

      {isNewUser && (
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">Default Password *</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter default password"
                className="bg-black/20 border-white/10 text-white placeholder:text-white/50 pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-white/60" />
                ) : (
                  <Eye className="h-4 w-4 text-white/60" />
                )}
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={generateDefaultPassword}
              disabled={isLoading}
              className="bg-black/20 border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
          <p className="text-xs text-white/60">
            User will be required to change this password on first login
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department" className="text-white">Department *</Label>
          <Select
            value={user.department || ''}
            onValueChange={(value) => onInputChange('department', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="bg-black/20 border-white/10 text-white">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administration</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="it">Information Technology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-white">Status</Label>
          <Select
            value={user.status || 'active'}
            onValueChange={(value) => onInputChange('status', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="bg-black/20 border-white/10 text-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-white">Roles</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setShowRoleDialog(true)}
            disabled={isLoading}
            className="text-xs bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Role
          </Button>
        </div>
        
        {isLoading ? (
          <Skeleton className="h-10 w-full bg-white/10" />
        ) : userRoles.length === 0 ? (
          <div className="text-white/60 text-sm p-2 border border-dashed border-white/20 rounded-md">
            No roles assigned. Please add at least one role.
          </div>
        ) : (
          <div className="space-y-2 p-2 border border-white/10 rounded-md bg-black/20">
            {userRoles.map((userRole) => (
              <div 
                key={userRole.roleId} 
                className="flex items-center justify-between p-2 bg-black/30 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-white">{getRoleName(userRole.roleId)}</span>
                  {userRole.isPrimary && (
                    <Badge className="bg-green-900/20 text-green-400 border-green-500/30 text-xs">
                      Primary
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {!userRole.isPrimary && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSetPrimaryRole(userRole.roleId)}
                      className="text-xs text-white/70 hover:text-white hover:bg-white/10"
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveRole(userRole.roleId)}
                    className="h-6 w-6 text-white/70 hover:text-red-400 hover:bg-red-900/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Role Selection Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription className="text-white/70">
              Select a role to assign to this user
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[300px] overflow-y-auto py-4">
            {availableRoles.length === 0 ? (
              <div className="text-white/60 text-center py-4">
                No more roles available to assign
              </div>
            ) : (
              <div className="space-y-2">
                {availableRoles.map((role) => (
                  <div 
                    key={role.id} 
                    className="flex items-center justify-between p-2 hover:bg-white/5 rounded-md"
                  >
                    <div>
                      <h3 className="text-white text-sm font-medium">{role.name}</h3>
                      <p className="text-white/60 text-xs">{role.description || 'No description'}</p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddRole(role.id)}
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
              onClick={() => setShowRoleDialog(false)}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
