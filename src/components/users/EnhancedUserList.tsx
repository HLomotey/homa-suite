import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { FrontendUser, UserRole, UserStatus } from "@/integration/supabase/types";
import { 
  useEnhancedUsers, 
  useUsersByRole, 
  useUsersByDepartment, 
  useSearchUsers,
  useUpdateUserRole 
} from "@/hooks/user-profile/useEnhancedUsers";
import { rolesApi } from "@/integration/supabase/permissions-api";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  Filter,
  Users,
  Building2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function EnhancedUserList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for filtering and search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<"all" | "role" | "department" | "search">("all");
  
  // State for role management
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FrontendUser | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  // Hooks based on filter mode
  const { users: allUsers, loading: allLoading, error: allError, refetch: refetchAll } = useEnhancedUsers();
  const { users: roleUsers, loading: roleLoading, error: roleError, refetch: refetchRole } = useUsersByRole(selectedRole === "all" ? "" : selectedRole);
  const { users: deptUsers, loading: deptLoading, error: deptError, refetch: refetchDept } = useUsersByDepartment(selectedDepartment === "all" ? "" : selectedDepartment);
  const { users: searchUsers, loading: searchLoading, error: searchError, refetch: refetchSearch } = useSearchUsers(searchTerm);
  const { updateRole, loading: updateLoading } = useUpdateUserRole();

  // Determine which data to use based on filter mode
  const users = filterMode === "role" ? roleUsers : 
                filterMode === "department" ? deptUsers :
                filterMode === "search" ? searchUsers : allUsers;
  
  const loading = filterMode === "role" ? roleLoading : 
                  filterMode === "department" ? deptLoading :
                  filterMode === "search" ? searchLoading : allLoading;
  
  const error = filterMode === "role" ? roleError : 
                filterMode === "department" ? deptError :
                filterMode === "search" ? searchError : allError;

  // Load available roles
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await rolesApi.getActive();
        setAvailableRoles(roles);
      } catch (err) {
        console.error('Error loading roles:', err);
      }
    };
    loadRoles();
  }, []);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim().length >= 2) {
      setFilterMode("search");
    } else if (value.trim().length === 0) {
      setFilterMode("all");
    }
  };

  // Handle role filter
  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    if (role === "all") {
      setFilterMode("all");
    } else {
      setFilterMode("role");
    }
  };

  // Handle department filter
  const handleDepartmentFilter = (dept: string) => {
    setSelectedDepartment(dept);
    if (dept === "all") {
      setFilterMode("all");
    } else {
      setFilterMode("department");
    }
  };

  // Handle role update
  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    const success = await updateRole(selectedUser.id, newRole);
    if (success) {
      toast({
        title: "Role Updated",
        description: `${selectedUser.name}'s role has been updated successfully.`,
      });
      setRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole("");
      // Refetch data
      refetchAll();
      refetchRole();
      refetchDept();
    } else {
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get unique departments for filtering
  const departments = Array.from(new Set(allUsers.map(user => user.department).filter(Boolean)));

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'staff': return 'secondary';
      case 'guest': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: UserStatus) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Error loading users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">Error: {error.message}</p>
            <Button onClick={() => refetchAll()} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users ({users.length})
              </CardTitle>
              <CardDescription>
                Manage users and their roles
                {filterMode !== "all" && (
                  <span className="ml-2 text-primary">
                    • Filtered by {filterMode}
                  </span>
                )}
              </CardDescription>
            </div>
            <Button onClick={() => navigate("/users/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedRole} onValueChange={handleRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.display_name || role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={handleDepartmentFilter}>
                <SelectTrigger className="w-[140px]">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {filterMode === "search" ? "No users found matching your search." : "No users found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {user.permissions?.length || 0} permissions
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setNewRole(user.role);
                                setRoleDialogOpen(true);
                              }}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/users/${user.id}/permissions`)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Manage Permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Update Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.name}. This will change their permissions immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(role.name as UserRole)}>
                        {role.name}
                      </Badge>
                      <span>{role.display_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRole} 
              disabled={updateLoading || !newRole}
            >
              {updateLoading ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
