import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { FrontendUser, UserStatus } from "@/integration/supabase/types";
import { useEnhancedUsers, useUsersByRole, useUsersByStatus, useUpdateUserStatus, useDeleteUser } from "@/hooks/user-profile";
import { useRoles } from "@/hooks/role/useRole";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck, 
  UserX,
  Filter,
  Download,
  Upload
} from "lucide-react";
import { UserDetail } from "@/components/users/UserDetail";
import { UserPermissions } from "@/components/users/UserPermissions";

export function UserManagementContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const path = location.pathname;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [roleFilter, setRoleFilter] = useState<string | "all">("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch users and roles data
  const { users, loading, error, refetch } = useEnhancedUsers();
  const { roles } = useRoles();
  const { updateStatus } = useUpdateUserStatus();
  const { deleteUser } = useDeleteUser();

  // Debug logging for users data
  console.log('🔍 UserManagementContent - Users data:', { 
    count: users.length, 
    users, 
    loading, 
    error 
  });

  // Check if we're on a user detail page
  const isUserDetailPage = path.includes("/users/new") || !!path.match(/\/users\/[^/]+$/);
  const isUserPermissionsPage = !!path.match(/\/users\/[^/]+\/permissions$/);

  // Effect to open/close sheet based on URL
  useEffect(() => {
    setIsSheetOpen(isUserDetailPage || isUserPermissionsPage);
  }, [isUserDetailPage, isUserPermissionsPage]);

  // Handle sheet close
  const handleSheetClose = () => {
    navigate("/users");
  };

  // Filter users based on search query, status, and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      await updateStatus(userId, newStatus);
      toast({
        title: "Status updated",
        description: `User status has been changed to ${newStatus}`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast({
        title: "User deleted",
        description: "User has been successfully deleted",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: UserStatus | undefined) => {
    if (!status) {
      return (
        <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
          Unknown
        </Badge>
      );
    }

    const variants = {
      active: "bg-green-500/20 text-green-300 border-green-500/30",
      inactive: "bg-red-500/20 text-red-300 border-red-500/30",
      pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    };
    
    return (
      <Badge className={variants[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (roleName: string | undefined) => {
    if (!roleName) {
      return (
        <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
          No Role
        </Badge>
      );
    }

    // Generate consistent colors based on role name hash
    const colors = [
      "bg-purple-500/20 text-purple-300 border-purple-500/30",
      "bg-blue-500/20 text-blue-300 border-blue-500/30",
      "bg-green-500/20 text-green-300 border-green-500/30",
      "bg-orange-500/20 text-orange-300 border-orange-500/30",
      "bg-pink-500/20 text-pink-300 border-pink-500/30",
      "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    ];
    
    const hash = roleName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colorIndex = Math.abs(hash) % colors.length;
    
    return (
      <Badge className={colors[colorIndex]}>
        {roleName}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="text-center text-white/60">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="text-center text-red-400">Error loading users: {error?.message || 'Unknown error'}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Users</CardTitle>
              <p className="text-white/60 text-sm">Manage user accounts and permissions</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={() => navigate("/users/new")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as UserStatus | "all")}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                <Shield className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/80">User</TableHead>
                  <TableHead className="text-white/80">Role</TableHead>
                  <TableHead className="text-white/80">Department</TableHead>
                  <TableHead className="text-white/80">Status</TableHead>
                  <TableHead className="text-white/80">Last Active</TableHead>
                  <TableHead className="text-white/80 w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-white/10 text-white">
                            {user.name?.[0]}{user.name?.split(' ')?.[1]?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-white/60">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-white/80">{user.department || "—"}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-white/60">
                      {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                          <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => navigate(`/users/${user.id}`)}
                            className="text-white/80 hover:bg-white/10"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => navigate(`/users/${user.id}/permissions`)}
                            className="text-white/80 hover:bg-white/10"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                            className="text-white/80 hover:bg-white/10"
                          >
                            {user.status === 'active' ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-white/60">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) handleSheetClose();
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:w-[700px] md:w-[700px] bg-black/40 backdrop-blur-md border-white/10 text-white overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="text-white">
              {isUserDetailPage &&
                (path.includes("/users/new") ? "Create User" : "Edit User")}
              {isUserPermissionsPage && "User Permissions"}
            </SheetTitle>
            <SheetDescription className="text-white/60">
              {isUserDetailPage &&
                (path.includes("/users/new")
                  ? "Create a new user account"
                  : "Edit user details and profile")}
              {isUserPermissionsPage && "Manage user roles and permissions"}
            </SheetDescription>
          </SheetHeader>
          {isUserDetailPage && <UserDetail />}
          {isUserPermissionsPage && <UserPermissions />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
