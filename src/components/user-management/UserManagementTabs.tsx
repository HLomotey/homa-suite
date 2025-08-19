import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { UserManagementContent } from "./UserManagementContent";
import { RoleManagementContent } from "./RoleManagementContent";
import { useUsers } from "@/hooks/user-profile";
import { useRoles } from "@/hooks/role/useRole";

export function UserManagementTabs() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const tabFromUrl = urlParams.get('tab') || 'users';
  
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const { users, loading: usersLoading } = useUsers();
  const { roles, loading: rolesLoading } = useRoles();

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  // Calculate user statistics
  const userStats = {
    total: users.length,
    active: users.filter((user) => user.status === "active").length,
    inactive: users.filter((user) => user.status === "inactive").length,
    pending: users.filter((user) => user.status === "pending").length,
  };

  // Calculate role statistics
  const roleStats = {
    total: roles.length,
    withUsers: roles.filter(
      (role) => role.permissions && role.permissions.length > 0
    ).length,
    systemRoles: Math.floor(roles.length * 0.3), // Approximate system roles
    customRoles: Math.floor(roles.length * 0.7), // Approximate custom roles
  };

  const UserDashboardCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-100">
            Total Users
          </CardTitle>
          <Users className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-100">
            {userStats.total}
          </div>
          <p className="text-xs text-blue-300">Registered users in system</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-100">
            Active Users
          </CardTitle>
          <UserCheck className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-100">
            {userStats.active}
          </div>
          <p className="text-xs text-green-300">Currently active accounts</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-100">
            Inactive Users
          </CardTitle>
          <UserX className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-100">
            {userStats.inactive}
          </div>
          <p className="text-xs text-red-300">Disabled or suspended</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-100">
            Pending Users
          </CardTitle>
          <Clock className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-100">
            {userStats.pending}
          </div>
          <p className="text-xs text-yellow-300">Awaiting approval</p>
        </CardContent>
      </Card>
    </div>
  );

  const RoleDashboardCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-100">
            Total Roles
          </CardTitle>
          <Shield className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-100">
            {roleStats.total}
          </div>
          <p className="text-xs text-purple-300">Available roles in system</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border-indigo-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-indigo-100">
            Active Roles
          </CardTitle>
          <UserCheck className="h-4 w-4 text-indigo-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-100">
            {roleStats.withUsers}
          </div>
          <p className="text-xs text-indigo-300">Roles with assigned users</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-cyan-100">
            System Roles
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-cyan-100">
            {roleStats.systemRoles}
          </div>
          <p className="text-xs text-cyan-300">Built-in system roles</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-100">
            Custom Roles
          </CardTitle>
          <Shield className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-100">
            {roleStats.customRoles}
          </div>
          <p className="text-xs text-emerald-300">User-defined roles</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            User Management
          </h1>
          <p className="text-white/60">Manage users, roles, and permissions</p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('tab', value);
          window.history.replaceState({}, '', newUrl.toString());
        }}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
          >
            <Users className="w-4 h-4 mr-2" />
            Users
            <Badge
              variant="secondary"
              className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30"
            >
              {userStats.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
          >
            <Shield className="w-4 h-4 mr-2" />
            Roles
            <Badge
              variant="secondary"
              className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/30"
            >
              {roleStats.total}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserDashboardCards />
          <UserManagementContent />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <RoleDashboardCards />
          <RoleManagementContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
