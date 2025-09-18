import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission } from "@/components/permissions/utils";
import { User as AppUser } from "@/integration/supabase/types/user-profile";

// Helper function to adapt AuthUser to AppUser for permission checks
const adaptUserForPermissions = (currentUser: any): AppUser | null => {
  if (!currentUser?.user) return null;
  
  return {
    id: currentUser.user.id,
    name: currentUser.user.user_metadata?.name || currentUser.user.email || '',
    email: currentUser.user.email || '',
    role: currentUser.user.user_metadata?.role || 'guest',
    department: currentUser.user.user_metadata?.department || '',
    is_active: true,
    permissions: currentUser.user.user_metadata?.permissions || null,
    created_at: currentUser.user.created_at || '',
    updated_at: null,
    last_login: null,
    email_verified: true,
    password_changed_at: null,
    two_factor_enabled: false,
    login_attempts: 0,
    locked_until: null
  };
};

export function MaintenanceNav() {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Adapt the auth user to the app user format for permission checks
  const appUser = adaptUserForPermissions(currentUser);
  
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
