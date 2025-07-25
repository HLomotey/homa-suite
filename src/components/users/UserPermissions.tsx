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
import { mockUsers } from "./data";

interface Permission {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

const defaultPermissions: Permission[] = [
  {
    id: "view-dashboard",
    name: "View Dashboard",
    description: "Can view the main dashboard and analytics",
    checked: true,
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
    checked: true,
  },
  {
    id: "manage-properties",
    name: "Manage Properties",
    description: "Can create, edit, and delete properties",
    checked: false,
  },
  {
    id: "manage-billing",
    name: "Manage Billing",
    description: "Can view and process billing information",
    checked: false,
  },
  {
    id: "system-settings",
    name: "System Settings",
    description: "Can modify system settings and configurations",
    checked: false,
  },
  {
    id: "api-access",
    name: "API Access",
    description: "Can access and use the API",
    checked: false,
  },
];

export function UserPermissions() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState(mockUsers.find(u => u.id === userId));
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate loading user permissions
  useEffect(() => {
    // In a real app, you would fetch the user's permissions from an API
    console.log(`Loading permissions for user ID: ${userId}`);
  }, [userId]);
  
  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setPermissions(permissions.map(permission => 
      permission.id === permissionId ? { ...permission, checked } : permission
    ));
  };
  
  const handleSave = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "Permissions updated",
        description: `Permissions for ${user?.name} have been updated successfully.`,
      });
      
      // Navigate back to the user list
      navigate("/users");
    }, 1000);
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
          {permissions.map((permission) => (
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
          ))}
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
