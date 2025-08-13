import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FrontendUser } from '@/integration/supabase/types';
import { useRoles } from '@/hooks/role';
import { Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react';

interface UserProfileFormProps {
  user: FrontendUser;
  onInputChange: (field: keyof FrontendUser, value: string) => void;
  onPasswordChange?: (password: string) => void;
  defaultPassword?: string;
  isLoading: boolean;
  isNewUser?: boolean;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  user,
  onInputChange,
  onPasswordChange,
  defaultPassword = '',
  isLoading,
  isNewUser = false
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
          <Label htmlFor="role" className="text-white">Role *</Label>
          {rolesError ? (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to load roles</span>
            </div>
          ) : (
            <Select
              value={user.roleId || ''}
              onValueChange={(value) => onInputChange('roleId', value)}
              disabled={isLoading || rolesLoading}
            >
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select role"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

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
              <SelectItem value="hr">Human Resources</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="it">Information Technology</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status" className="text-white">Status</Label>
        <Select
          value={user.status || 'pending'}
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
  );
};
