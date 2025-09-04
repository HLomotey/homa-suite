import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth";
import {
  Building2,
  Users,
  Calculator,
  Truck,
  BarChart3,
  Settings,
  Menu,
  X,
  LayoutDashboard,
  UserRound,
  Home,
  Bus,
  FileBarChart2,
  DollarSign,
  ClipboardList,
  Upload,
  FileUp,
  LogOut,
  Clock,
  Gauge,
  Wrench,
  MessageSquare,
  Activity,
  UserCheck,
  UserPlus,
  LineChart,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/routes/constants";

const navigationItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    module: "dashboard",
  },
  {
    label: "HR",
    icon: UserRound,
    href: ROUTES.HR,
    module: "hr",
  },
  {
    label: "Finance",
    icon: DollarSign,
    href: ROUTES.FINANCE,
    module: "finance",
  },
  {
    label: "Operations",
    icon: ClipboardList,
    href: ROUTES.OPERATIONS,
    module: "operations",
  },
  {
    label: "Operations Call (Ops Call)",
    icon: FileBarChart2,
    href: "/operations/month-end-reports",
    module: "operations",
  },
  {
    label: "Housing",
    icon: Building2,
    href: ROUTES.PROPERTIES,
    module: "properties",
  },
  // {
  //   label: "Billing",
  //   icon: Calculator,
  //   href: ROUTES.BILLING,
  //   module: "billing",
  // },
  // {
  //   label: "Staff",
  //   icon: Users,
  //   href: ROUTES.STAFF,
  //   module: "hr",
  // },
  {
    label: "Staff",
    icon: UserCheck,
    href: ROUTES.EXTERNAL_STAFF,
    module: "hr",
  },
  {
    label: "Payroll",
    icon: DollarSign,
    href: "/payroll",
    module: "hr",
  },
  {
    label: "Attendance",
    icon: Clock,
    href: "/attendance",
    module: "hr",
  },
  {
    label: "Transport",
    icon: Truck,
    href: ROUTES.TRANSPORT,
    module: "transport",
  },
  {
    label: "Maintenance",
    icon: Wrench,
    href: ROUTES.MAINTENANCE,
    module: "properties",
  },
  {
    label: "Incidence Report",
    icon: MessageSquare,
    href: ROUTES.COMPLAINTS,
    module: "complaints",
  },
  {
    label: "Users",
    icon: Users,
    href: ROUTES.USERS,
    module: "users",
  },
  {
    label: "Profile",
    icon: UserRound,
    href: ROUTES.PROFILE,
    module: "settings",
  },
  {
    label: "Excel Uploads",
    icon: FileUp,
    href: ROUTES.EXCEL_UPLOADS,
    module: "settings",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    module: "operations",
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/reports",
    module: "operations",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    module: "settings",
  },
  {
    label: "Activity Log",
    icon: Activity,
    href: ROUTES.ACTIVITY_LOG,
    module: "activity_log",
  },
  // {
  //   label: "Onboarding",
  //   icon: UserPlus,
  //   href: "/onboarding",
  //   module: "onboarding",
  // },
  {
    label: "Housing & Transport Allocation",
    icon: UserPlus,
    href: "/staff-benefits",
    module: "onboarding",
  },
  {
    label: "Job Orders",
    icon: ClipboardList,
    href: "/job-orders",
    module: "job-orders",
  },
];

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar = ({ collapsed = false }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { currentUser, signOut, hasModule } = useAuth();

  // Filter navigation items based on user's permissions and role
  const filteredNavigationItems = navigationItems.filter((item) => {
    if (!currentUser) return false;

    // Use module-based access control
    return hasModule(item.module);
  });

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "h-screen bg-card border-r border-border transition-all duration-200 ease-in-out sticky top-0 z-40",
          collapsed ? "w-16" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-20 items-center border-b border-border px-6 py-3">
            <div className="flex items-center justify-center min-w-[40px]">
              <img 
                src="/Compass.png" 
                alt="BOH Concepts Logo" 
                className={cn("w-auto object-contain", collapsed ? "h-10" : "h-12")}
              />
            </div>
            {!collapsed && (
              <div className="ml-3 min-w-0 flex-1">
                <h1 className="text-lg font-semibold text-foreground truncate">
                  BOH Concepts
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  Operations Management
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredNavigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-md py-2 text-sm font-medium transition-colors",
                    collapsed ? "justify-center px-2" : "px-3",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={cn("h-4 w-4", collapsed ? "" : "mr-3")}
                  />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div
            className={cn(
              "border-t border-border p-4",
              collapsed ? "flex justify-center" : "space-y-3"
            )}
          >
            {collapsed ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={signOut}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {currentUser?.user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {currentUser?.userType === 'management' ? 'Management' : 'Staff'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentUser?.user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
