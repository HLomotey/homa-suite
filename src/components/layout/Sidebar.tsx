import { useState } from "react";
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
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/routes/constants";

const navigationItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    active: true,
  },
  {
    label: "HR",
    icon: UserRound,
    href: ROUTES.HR,
    active: false,
  },
  {
    label: "Finance",
    icon: DollarSign,
    href: ROUTES.FINANCE,
    active: false,
  },
  {
    label: "Operations",
    icon: ClipboardList,
    href: ROUTES.OPERATIONS,
    active: false,
  },
  {
    label: "Properties",
    icon: Building2,
    href: ROUTES.PROPERTIES,
    active: false,
  },

  {
    label: "Billing",
    icon: Calculator,
    href: ROUTES.BILLING,
    active: false,
  },
  {
    label: "Staff",
    icon: Users,
    href: ROUTES.STAFF,
    active: false,
  },
  {
    label: "Payroll",
    icon: DollarSign,
    href: "/payroll",
    active: false,
  },
  {
    label: "Attendance",
    icon: Clock,
    href: "/attendance",
    active: false,
  },
  {
    label: "Transport",
    icon: Truck,
    href: ROUTES.TRANSPORT,
    active: false,
  },
  {
    label: "Maintenance",
    icon: Wrench,
    href: ROUTES.MAINTENANCE,
    active: false,
  },
  {
    label: "Users",
    icon: Users,
    href: ROUTES.USERS,
    active: false,
  },
  {
    label: "Excel Uploads",
    icon: FileUp,
    href: ROUTES.EXCEL_UPLOADS,
    active: false,
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    active: false,
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/reports",
    active: false,
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    active: false,
  },
];

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar = ({ collapsed = false }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

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
          <div className="flex h-16 items-center border-b border-border px-6">
            <Building2 className="h-8 w-8 text-primary" />
            {!collapsed && (
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-foreground">BoH ERP</h1>
                <p className="text-xs text-muted-foreground">BOH Concepts ERP</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigationItems.map((item) => {
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
                  <item.icon className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={cn("border-t border-border p-4", collapsed ? "flex justify-center" : "space-y-3")}>
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
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Signed in as
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
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
