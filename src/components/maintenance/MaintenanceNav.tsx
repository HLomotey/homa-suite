import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission } from "@/components/permissions/utils";
import { User as AppUser } from "@/integration/supabase/types/user-profile";
import { User as AuthUser } from "@supabase/supabase-js";

// Helper function to adapt AuthUser to AppUser for permission checks
const adaptUserForPermissions = (authUser: AuthUser | null): AppUser | null => {
  if (!authUser) return null;
  
  return {
    id: authUser.id,
    name: authUser.user_metadata?.name || authUser.email || '',
    email: authUser.email || '',
    role: authUser.user_metadata?.role || 'guest',
    department: authUser.user_metadata?.department || '',
    status: 'active',
    last_active: null,
    permissions: authUser.user_metadata?.permissions || null,
    created_at: authUser.created_at || '',
    updated_at: null,
    avatar_url: authUser.user_metadata?.avatar_url || null
  };
};

export function MaintenanceNav() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Adapt the auth user to the app user format for permission checks
  const appUser = adaptUserForPermissions(user);
  
  const isStaff = appUser && hasPermission(appUser, "maintenance", "staff");
  const isAdmin = appUser && hasPermission(appUser, "maintenance", "admin");
  const isTenant = appUser && hasPermission(appUser, "maintenance", "tenant");
  
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes("/maintenance/admin")) return "admin";
    if (path.includes("/maintenance/staff")) return "staff";
    if (path.includes("/maintenance/requests")) return "requests";
    if (path.includes("/maintenance/report")) return "report";
    return "dashboard";
  };

  return (
    <div className="mb-6 border-b">
      <Tabs value={getCurrentTab()} className="w-full">
        <TabsList className="w-full justify-start h-auto p-0">
          <TabsTrigger 
            value="dashboard" 
            className={cn(
              "rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary",
              "hover:bg-muted/50 transition-colors"
            )}
            asChild
          >
            <Link to="/maintenance">Dashboard</Link>
          </TabsTrigger>
          
          {isTenant && (
            <>
              <TabsTrigger 
                value="requests" 
                className={cn(
                  "rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary",
                  "hover:bg-muted/50 transition-colors"
                )}
                asChild
              >
                <Link to="/maintenance/requests">My Requests</Link>
              </TabsTrigger>
              
              <TabsTrigger 
                value="report" 
                className={cn(
                  "rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary",
                  "hover:bg-muted/50 transition-colors"
                )}
                asChild
              >
                <Link to="/maintenance/report">Report Issue</Link>
              </TabsTrigger>
            </>
          )}
          
          {isStaff && (
            <TabsTrigger 
              value="staff" 
              className={cn(
                "rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary",
                "hover:bg-muted/50 transition-colors"
              )}
              asChild
            >
              <Link to="/maintenance/staff">Staff Requests</Link>
            </TabsTrigger>
          )}
          
          {isAdmin && (
            <TabsTrigger 
              value="admin" 
              className={cn(
                "rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary",
                "hover:bg-muted/50 transition-colors"
              )}
              asChild
            >
              <Link to="/maintenance/admin">Admin</Link>
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>
    </div>
  );
}
