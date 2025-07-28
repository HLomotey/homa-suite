import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import { FrontendUser, FrontendRole } from "@/integration/supabase/types";
import { useUser, useUpdateUser } from "@/hooks/user-profile";
import { useRoles } from "@/hooks/role";
import { Skeleton } from "@/components/ui/skeleton";

interface Permission {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

// Default permissions as fallback if API fails
const defaultPermissions: Permission[] = [
  {
    id: "view-dashboard",
    name: "View Dashboard",
    description: "Can view the main dashboard and analytics",
    checked: false,
  },
  {
    id: "manage-users",
    name: "Manage Users",
    description: "Can create, edit, and delete users",
    checked: false,
  },
  {
    id: "view-reports",
    name: "View Reports",
    description: "Can view and download reports",
    checked: false,
  },
];

// Helper function to convert roles to permissions format
const rolesToPermissions = (roles: FrontendRole[], userPermissions: string[] = []): Permission[] => {
  if (!roles || roles.length === 0) return defaultPermissions;
  
  return roles.map(role => ({
    id: role.id,
    name: role.name,
    description: role.description || `Permission for ${role.name}`,
    checked: userPermissions.includes(role.id)
  }));
};

export function UserPermissions() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch user data
  const { user, loading: fetchingUser, error: fetchError, refetch } = useUser(userId || "");
  const { update, loading: updatingUser, error: updateError } = useUpdateUser();
  
  // Fetch roles data (which will be used as permissions)
  const { roles, loading: fetchingRoles, error: rolesError } = useRoles();
  
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
  const isLoading = fetchingUser || updatingUser || fetchingRoles;
  
  // Load roles and user permissions when data is available
  useEffect(() => {
    if (roles && roles.length > 0 && user) {
      // Convert roles to permissions format and check which ones the user has
      const mappedPermissions = rolesToPermissions(roles, user.permissions);
      setPermissions(mappedPermissions);
    } else if (user && user.permissions) {
      // Fallback to default permissions if roles aren't available
      setPermissions(prevPermissions => 
        prevPermissions.map(permission => ({
          ...permission,
          checked: user.permissions?.includes(permission.id) || false
        }))
      );
    }
  }, [user, roles]);
  
  // Handle fetch errors
  useEffect(() => {
    if (fetchError) {
      toast({
        title: "Error loading user",
        description: "Could not load user data. Please try again.",
        variant: "destructive"
      });
      navigate("/users");
    }
  }, [fetchError, navigate, toast]);
  
  // Handle role fetch errors
  useEffect(() => {
    if (rolesError) {
      toast({
        title: "Error loading permissions",
        description: "Could not load permissions data. Using default permissions instead.",
        variant: "destructive"
      });
      // Don't navigate away, just use default permissions
    }
  }, [rolesError, toast]);
  
  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setPermissions(permissions.map(permission => 
      permission.id === permissionId ? { ...permission, checked } : permission
    ));
  };
  
  const handleSave = async () => {
    if (!user || !user.id) return;
    
    try {
      // Extract permission IDs that are checked
      const selectedPermissions = permissions
        .filter(p => p.checked)
        .map(p => p.id);
      
      // Update user permissions
      await update(user.id, {
        permissions: selectedPermissions
      });
      
      toast({
        title: "Permissions updated",
        description: `Permissions for ${user?.name} have been updated successfully.`,
      });
      
      // Navigate back to the user list
      navigate("/users");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast({
        title: "Error",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleBack = () => {
    navigate("/users");
  };
  
  if (!user) {
    return (
      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white">User Not Found</CardTitle>
          <CardDescription className="text-white/60">
            The user you are looking for does not exist.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Users
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="bg-black/40 backdrop-blur-md border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-white text-xl">User Permissions</CardTitle>
            <CardDescription className="text-white/60">
              Manage permissions for {user.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fetchingRoles ? (
            // Show loading skeletons while fetching roles
            <>
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="flex items-start space-x-2 rounded-md border border-white/10 p-4"
                >
                  <Skeleton className="h-4 w-4 rounded-sm bg-white/10" />
                  <div className="space-y-1 leading-none w-full">
                    <Skeleton className="h-4 w-1/3 bg-white/10" />
                    <Skeleton className="h-3 w-full mt-2 bg-white/10" />
                  </div>
                </div>
              ))}
            </>
          ) : permissions.length === 0 ? (
            <div className="text-center py-4 text-white/60">
              No permissions available
            </div>
          ) : (
            // Show actual permissions
            permissions.map((permission) => (
              <div 
                key={permission.id} 
                className="flex items-start space-x-2 rounded-md border border-white/10 p-4"
              >
                <Checkbox
                  id={permission.id}
                  checked={permission.checked}
                  onCheckedChange={(checked) => 
                    handlePermissionChange(permission.id, checked === true)
                  }
                />
                <div className="space-y-1 leading-none">
                  <Label
                    htmlFor={permission.id}
                    className="text-sm font-medium leading-none text-white cursor-pointer"
                  >
                    {permission.name}
                  </Label>
                  <p className="text-sm text-white/60">
                    {permission.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          className="border-white/10"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
