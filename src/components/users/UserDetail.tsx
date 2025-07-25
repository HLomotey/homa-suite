import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { User, mockUsers, mockDepartments, mockRoles } from "./data";
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  User as UserIcon,
  Key,
  Calendar
} from "lucide-react";

export function UserDetail() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const isNewUser = userId === "new";
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // User form state
  const [user, setUser] = useState<User>({
    id: "",
    name: "",
    email: "",
    role: "staff",
    department: "",
    status: "pending",
    lastActive: new Date().toISOString(),
    permissions: [],
    createdAt: new Date().toISOString()
  });

  // Load user data if editing existing user
  useEffect(() => {
    if (!isNewUser) {
      const foundUser = mockUsers.find(u => u.id === userId);
      if (foundUser) {
        setUser(foundUser);
      } else {
        toast({
          title: "User not found",
          description: "The requested user could not be found.",
          variant: "destructive"
        });
        navigate("/users");
      }
    }
  }, [userId, isNewUser, navigate, toast]);

  // Handle input changes
  const handleInputChange = (field: keyof User, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate form
    if (!user.name || !user.email || !user.role || !user.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: isNewUser ? "User Created" : "User Updated",
        description: isNewUser 
          ? `${user.name} has been added to the system.` 
          : `${user.name}'s information has been updated.`
      });
      
      navigate("/users");
    }, 1500);
  };

  // Handle user deletion
  const handleDelete = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "User Deleted",
        description: `${user.name} has been removed from the system.`
      });
      
      navigate("/users");
    }, 1000);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" /> Inactive
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string): string => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/users")}
          className="text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Users
        </Button>
      </div>
      
      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">
                {isNewUser ? "Create New User" : "Edit User"}
              </CardTitle>
              <CardDescription className="text-white/60">
                {isNewUser 
                  ? "Add a new user to the system" 
                  : "Update user information and settings"
                }
              </CardDescription>
            </div>
            {!isNewUser && (
              <div className="flex items-center gap-2">
                {getStatusBadge(user.status)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6 bg-black/40 border border-white/10">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="access" className="flex items-center gap-2">
                <Key className="h-4 w-4" /> Access & Permissions
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2" disabled={isNewUser}>
                <Calendar className="h-4 w-4" /> Activity
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-lg bg-black/20">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                        {getUserInitials(user.name || "New User")}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="border-white/10">
                      <Upload className="h-4 w-4 mr-2" /> Upload Photo
                    </Button>
                    <p className="text-xs text-white/40 mt-2">
                      Recommended: Square image, at least 300x300px
                    </p>
                  </div>
                  
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Full Name</Label>
                        <Input 
                          id="name"
                          value={user.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="bg-black/40 border-white/10 text-white"
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email Address</Label>
                        <Input 
                          id="email"
                          type="email"
                          value={user.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="bg-black/40 border-white/10 text-white"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-white">Department</Label>
                        <Select 
                          value={user.department} 
                          onValueChange={(value) => handleInputChange("department", value)}
                        >
                          <SelectTrigger id="department" className="bg-black/40 border-white/10 text-white">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/10 text-white">
                            {mockDepartments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {!isNewUser && (
                        <div className="space-y-2">
                          <Label htmlFor="status" className="text-white">Status</Label>
                          <Select 
                            value={user.status} 
                            onValueChange={(value: "active" | "inactive" | "pending") => 
                              handleInputChange("status", value)
                            }
                          >
                            <SelectTrigger id="status" className="bg-black/40 border-white/10 text-white">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/10 text-white">
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="access">
              <div className="space-y-6">
                {/* Role Assignment */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Role Assignment</h3>
                  <p className="text-sm text-white/60">
                    Assign a role to determine the user's base permissions
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-white">User Role</Label>
                      <Select 
                        value={user.role} 
                        onValueChange={(value: "admin" | "manager" | "staff" | "guest") => 
                          handleInputChange("role", value)
                        }
                      >
                        <SelectTrigger id="role" className="bg-black/40 border-white/10 text-white">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/10 text-white">
                          {mockRoles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name.charAt(0).toUpperCase() + role.name.slice(1)} - {role.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-white/10" />
                
                {/* Custom Permissions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Custom Permissions</h3>
                      <p className="text-sm text-white/60">
                        Override role-based permissions with custom settings
                      </p>
                    </div>
                    <Switch id="custom-permissions" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
                    <Card className="bg-black/20 border-white/5">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm text-white">User Management</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="perm-users-view" className="text-white/80 text-sm">View Users</Label>
                          <Switch id="perm-users-view" checked disabled />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="perm-users-create" className="text-white/80 text-sm">Create Users</Label>
                          <Switch id="perm-users-create" disabled />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="perm-users-edit" className="text-white/80 text-sm">Edit Users</Label>
                          <Switch id="perm-users-edit" disabled />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="perm-users-delete" className="text-white/80 text-sm">Delete Users</Label>
                          <Switch id="perm-users-delete" disabled />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-black/20 border-white/5">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm text-white">Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="perm-settings-view" className="text-white/80 text-sm">View Settings</Label>
                          <Switch id="perm-settings-view" checked disabled />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="perm-settings-edit" className="text-white/80 text-sm">Edit Settings</Label>
                          <Switch id="perm-settings-edit" disabled />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-black/20 border-white/5">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm text-white">Billing</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="perm-billing-view" className="text-white/80 text-sm">View Billing</Label>
                          <Switch id="perm-billing-view" disabled />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="perm-billing-edit" className="text-white/80 text-sm">Edit Billing</Label>
                          <Switch id="perm-billing-edit" disabled />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">User Activity</h3>
                  <p className="text-sm text-white/60">
                    Recent activity and login history
                  </p>
                  
                  <Card className="bg-black/20 border-white/10">
                    <CardContent className="p-4">
                      <div className="text-center text-white/60 py-8">
                        Activity history will be available in a future update.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-white/10 pt-6">
          <div>
            {!isNewUser && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete User
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/users")}
              disabled={isLoading}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isNewUser ? "Creating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isNewUser ? "Create User" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
