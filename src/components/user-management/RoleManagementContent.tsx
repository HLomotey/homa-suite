import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getRoleModules } from '@/hooks/role/modules-api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { FrontendRole } from '@/integration/supabase/types';
import { useRoles, useDeleteRole } from '@/hooks/role/useRole';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Users, 
  MoreHorizontal,
  Download,
  Upload,
  Settings
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RoleDetail } from '@/components/roles/RoleDetail';

export function RoleManagementContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const path = location.pathname;
  const { roles, loading, error, refetch } = useRoles();
  const { deleteRole, loading: deleting } = useDeleteRole();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleToDelete, setRoleToDelete] = useState<FrontendRole | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [roleModuleCounts, setRoleModuleCounts] = useState<Record<string, number>>({});

  // Check if we're on a role detail page or if URL params indicate role editing
  const urlParams = new URLSearchParams(location.search);
  const roleId = urlParams.get('roleId');
  const action = urlParams.get('action');
  const isRoleDetailPage = action === 'new' || !!roleId;

  // Load module counts for each role
  useEffect(() => {
    const loadModuleCounts = async () => {
      if (!roles.length) return;
      
      const counts: Record<string, number> = {};
      for (const role of roles) {
        try {
          const modules = await getRoleModules(role.id);
          counts[role.id] = modules.length;
        } catch (error) {
          console.error(`Error loading modules for role ${role.id}:`, error);
          counts[role.id] = 0;
        }
      }
      setRoleModuleCounts(counts);
    };

    loadModuleCounts();
  }, [roles]);

  // Effect to open/close sheet based on URL params
  useEffect(() => {
    setIsSheetOpen(isRoleDetailPage);
  }, [isRoleDetailPage]);

  // Handle sheet close
  const handleSheetClose = () => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('roleId');
    newUrl.searchParams.delete('action');
    newUrl.searchParams.set('tab', 'roles');
    navigate(newUrl.pathname + newUrl.search, { replace: true });
  };
  
  // Filter roles based on search query
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle role deletion
  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    
    try {
      await deleteRole(roleToDelete.id);
      toast({
        title: 'Role deleted',
        description: `${roleToDelete.name} has been removed.`
      });
      refetch();
      setRoleToDelete(null);
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete role',
        variant: 'destructive'
      });
    }
  };

  const getRoleTypeBadge = (isSystemRole: boolean) => {
    return isSystemRole ? (
      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
        System
      </Badge>
    ) : (
      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
        Custom
      </Badge>
    );
  };

  const getModulesBadge = (modulesCount: number) => {
    const color = modulesCount > 6 ? 'red' : modulesCount > 3 ? 'yellow' : 'green';
    const variants = {
      red: "bg-red-500/20 text-red-300 border-red-500/30",
      yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      green: "bg-green-500/20 text-green-300 border-green-500/30",
    };
    
    return (
      <Badge className={variants[color]}>
        {modulesCount} modules
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="text-center text-white/60">Loading roles...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="text-center text-red-400">Error loading roles: {error?.message || 'Unknown error'}</div>
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
              <CardTitle className="text-white">Roles</CardTitle>
              <p className="text-white/60 text-sm">Manage user roles and permissions</p>
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
                onClick={() => {
                  const newUrl = new URL(window.location.href);
                  newUrl.searchParams.set('tab', 'roles');
                  newUrl.searchParams.set('action', 'new');
                  navigate(newUrl.pathname + newUrl.search);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Role
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          {/* Roles Table */}
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/80">Role</TableHead>
                  <TableHead className="text-white/80">Type</TableHead>
                  <TableHead className="text-white/80">Users</TableHead>
                  <TableHead className="text-white/80">Permissions</TableHead>
                  <TableHead className="text-white/80">Created</TableHead>
                  <TableHead className="text-white/80 w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{role.name}</div>
                          <div className="text-sm text-white/60">{role.description || 'No description'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleTypeBadge(false)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-white/40" />
                        <span className="text-white/80">0</span>
                      </div>
                    </TableCell>
                    <TableCell>{getModulesBadge(roleModuleCounts[role.id] || 0)}</TableCell>
                    <TableCell className="text-white/60">
                      —
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
                            onClick={() => {
                              const newUrl = new URL(window.location.href);
                              newUrl.searchParams.set('tab', 'roles');
                              newUrl.searchParams.set('roleId', role.id);
                              navigate(newUrl.pathname + newUrl.search);
                            }}
                            className="text-white/80 hover:bg-white/10"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              const newUrl = new URL(window.location.href);
                              newUrl.searchParams.set('tab', 'roles');
                              newUrl.searchParams.set('roleId', role.id);
                              newUrl.searchParams.set('action', 'permissions');
                              navigate(newUrl.pathname + newUrl.search);
                            }}
                            className="text-white/80 hover:bg-white/10"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              const newUrl = new URL(window.location.href);
                              newUrl.searchParams.set('tab', 'roles');
                              newUrl.searchParams.set('roleId', role.id);
                              newUrl.searchParams.set('action', 'users');
                              navigate(newUrl.pathname + newUrl.search);
                            }}
                            className="text-white/80 hover:bg-white/10"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            View Users
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem 
                            onClick={() => setRoleToDelete(role)}
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Role
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRoles.length === 0 && (
            <div className="text-center py-8 text-white/60">
              No roles found matching your criteria.
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
              {action === 'new' ? "Create Role" : action === 'permissions' ? "Role Permissions" : action === 'users' ? "Role Users" : "Edit Role"}
            </SheetTitle>
            <SheetDescription className="text-white/60">
              {action === 'new'
                ? "Create a new role with specific permissions"
                : action === 'permissions'
                ? "Manage role permissions and access rights"
                : action === 'users'
                ? "View and manage users assigned to this role"
                : "Edit role details and permissions"}
            </SheetDescription>
          </SheetHeader>
          {isRoleDetailPage && (
            <div className="mt-6">
              {action === 'permissions' ? (
                <div className="text-white/60 p-4 border border-white/10 rounded-lg">
                  <p>Role permissions management will be implemented here.</p>
                </div>
              ) : action === 'users' ? (
                <div className="text-white/60 p-4 border border-white/10 rounded-lg">
                  <p>Role users management will be implemented here.</p>
                </div>
              ) : (
                <RoleDetail />
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Role Dialog */}
      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent className="bg-black/90 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Role</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
              All users with this role will need to be reassigned to a different role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setRoleToDelete(null)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete Role'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
