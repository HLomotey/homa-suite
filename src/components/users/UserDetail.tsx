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
import { FrontendUser, UserRole, UserStatus, UserWithProfile } from "@/integration/supabase/types";
import { useUser, useUserWithProfile, useCreateUser, useUpdateUser, useUpsertProfile, useDeleteUser } from "@/hooks/user-profile";
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
  
  const [activeTab, setActiveTab] = useState("profile");
  
  // Fetch user data if editing existing user
  const { user: fetchedUser, loading: fetchingUser, error: fetchError } = useUser(isNewUser ? "" : userId || "");
  const { userWithProfile, loading: fetchingProfile, error: profileError } = useUserWithProfile(isNewUser ? "" : userId || "");
  
  // CRUD hooks
  const { create, loading: creatingUser, error: createError } = useCreateUser();
  const { update, loading: updatingUser, error: updateError } = useUpdateUser();
  const { upsert, loading: upsertingProfile, error: profileUpsertError } = useUpsertProfile();
  
  // Initialize delete user hook
  const { deleteUser: deleteUserFn, loading: deletingUser, error: deleteError } = useDeleteUser();
  
  const isLoading = fetchingUser || fetchingProfile || creatingUser || updatingUser || upsertingProfile || deletingUser;
  
  // User form state
  const [user, setUser] = useState<Partial<FrontendUser>>({
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
    if (!isNewUser && userWithProfile) {
      setUser({
        id: userWithProfile.id,
        name: userWithProfile.name,
        email: userWithProfile.email,
        role: userWithProfile.role,
        department: userWithProfile.department || "",
        status: userWithProfile.status,
        lastActive: userWithProfile.lastActive || new Date().toISOString(),
        createdAt: userWithProfile.createdAt || new Date().toISOString(),
        permissions: userWithProfile.permissions || []
      });
    }
  }, [isNewUser, userWithProfile]);
  
  // Handle fetch errors
  useEffect(() => {
    if (fetchError) {
      toast({
        title: "Error loading user",
        description: "The requested user could not be loaded.",
        variant: "destructive"
      });
      navigate("/users");
    }
  }, [fetchError, navigate, toast]);

  // Handle input changes
  const handleInputChange = (field: keyof FrontendUser, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!user.name || !user.email || !user.role || !user.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isNewUser) {
        // Create new user
        const newUser = await create({
          name: user.name || "",
          email: user.email || "",
          role: user.role as UserRole,
          department: user.department || "",
          status: user.status as UserStatus || 'pending',
          permissions: user.permissions || []
        });
        
        // Create profile if we have additional profile data
        if (newUser.id) {
          await upsert(newUser.id, {
            bio: "", // Optional: Add bio field to form if needed
            preferences: {}
          });
        }
        
        toast({
          title: "User created",
          description: `${user.name} has been added successfully.`,
        });
      } else {
        // Update existing user
        if (user.id) {
          await update(user.id, {
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            department: user.department,
            status: user.status as UserStatus,
            permissions: user.permissions
          });
          
          // Update profile if needed
          await upsert(user.id, {
            bio: "", // Optional: Add bio field to form if needed
            preferences: {}
          });
        }
        
        toast({
          title: "User updated",
          description: `${user.name}'s information has been updated.`,
        });
      }
      
      navigate("/users");
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: "Failed to save user. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle permission toggle
  const togglePermission = (permission: string) => {
    setUser((prev: Partial<FrontendUser>) => {
      const permissions = [...(prev.permissions || [])];
      const index = permissions.indexOf(permission);
      
      if (index === -1) {
        permissions.push(permission);
      } else {
        permissions.splice(index, 1);
      }
      
      return { ...prev, permissions };
    });
  };    
  
  // Delete user handler
  
  // Handle user deletion
  const handleDelete = async () => {
    if (!user.id) return;
    
    try {
      // Use the deleteUser function from the hook
      await deleteUserFn(user.id);
      
      toast({
        title: "User deleted",
        description: `${user.name} has been removed from the system.`,
      });
      navigate("/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    }
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
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
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
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
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
