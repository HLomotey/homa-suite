import { useState } from "react";
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
import { User, mockUsers } from "./data";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  UserPlus, 
  UserMinus, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UserList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      searchQuery === "" || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === null || user.role === roleFilter;
    const matchesStatus = statusFilter === null || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle user creation
  const handleCreateUser = () => {
    navigate("/users/new");
  };

  // Handle user editing
  const handleEditUser = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  // Handle user deletion confirmation
  const handleDeleteConfirm = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Handle user deletion
  const handleDeleteUser = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setUsers(users.filter(user => user.id !== userToDelete?.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setIsLoading(false);
      
      toast({
        title: "User deleted",
        description: `${userToDelete?.name} has been removed from the system.`,
      });
    }, 1000);
  };

  // Handle user status change
  const handleStatusChange = (userId: string, newStatus: "active" | "inactive" | "pending") => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      setIsLoading(false);
      
      const statusMessages = {
        active: "activated",
        inactive: "deactivated",
        pending: "set to pending"
      };
      
      const user = users.find(u => u.id === userId);
      
      toast({
        title: "User status updated",
        description: `${user?.name} has been ${statusMessages[newStatus]}.`,
      });
    }, 1000);
  };

  // Get status badge color
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

  // Get role badge color
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/20">
            Admin
          </Badge>
        );
      case "manager":
        return (
          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20">
            Manager
          </Badge>
        );
      case "staff":
        return (
          <Badge className="bg-cyan-500/20 text-cyan-500 border-cyan-500/20">
            Staff
          </Badge>
        );
      case "guest":
        return (
          <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/20">
            Guest
          </Badge>
        );
      default:
        return <Badge>{role}</Badge>;
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
    <div className="space-y-4">
      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">User Management</CardTitle>
              <CardDescription className="text-white/60">
                Manage users, roles, and permissions
              </CardDescription>
            </div>
            <Button onClick={handleCreateUser} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search users..."
                className="pl-8 bg-black/40 border-white/10 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select onValueChange={(value) => setRoleFilter(value === "all" ? null : value)}>
                <SelectTrigger className="w-[150px] bg-black/40 border-white/10 text-white">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
                <SelectTrigger className="w-[150px] bg-black/40 border-white/10 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-black/60">
                <TableRow className="hover:bg-transparent border-white/10">
                  <TableHead className="text-white/60 w-[250px]">User</TableHead>
                  <TableHead className="text-white/60">Role</TableHead>
                  <TableHead className="text-white/60">Department</TableHead>
                  <TableHead className="text-white/60">Status</TableHead>
                  <TableHead className="text-white/60">Last Active</TableHead>
                  <TableHead className="text-white/60 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="hover:bg-white/5 border-white/10"
                      onClick={() => handleEditUser(user.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">{user.name}</div>
                            <div className="text-sm text-white/60">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-white">{user.department}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-white/60">
                        {new Date(user.lastActive).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-black/90 border-white/10 text-white">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem 
                              className="cursor-pointer flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditUser(user.id);
                              }}
                            >
                              <Edit className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/users/${user.id}/permissions`);
                              }}
                            >
                              <Shield className="h-4 w-4" /> Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Simulate sending email invitation
                                toast({
                                  title: "Invitation sent",
                                  description: `An invitation email has been sent to ${user.email}.`,
                                });
                              }}
                            >
                              <Mail className="h-4 w-4" /> Send Invitation
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {user.status === "active" ? (
                              <DropdownMenuItem 
                                className="cursor-pointer flex items-center gap-2 text-amber-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(user.id, "inactive");
                                }}
                              >
                                <UserMinus className="h-4 w-4" /> Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="cursor-pointer flex items-center gap-2 text-green-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(user.id, "active");
                                }}
                              >
                                <UserPlus className="h-4 w-4" /> Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="cursor-pointer flex items-center gap-2 text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConfirm(user);
                              }}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-white/60">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 text-sm text-white/60">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-black/80 backdrop-blur-md border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
