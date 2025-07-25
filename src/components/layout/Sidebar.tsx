import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  Users, 
  Calculator, 
  Truck, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/routes/constants';

const navigationItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
    active: true
  },
  {
    label: 'Properties',
    icon: Building2,
    href: ROUTES.PROPERTIES,
    active: false
  },
  {
    label: 'Housing',
    icon: Users,
    href: ROUTES.HOUSING,
    active: false
  },
  {
    label: 'Billing',
    icon: Calculator,
    href: ROUTES.BILLING,
    active: false
  },
  {
    label: 'Transport',
    icon: Truck,
    href: ROUTES.TRANSPORT,
    active: false
  },
  {
    label: 'Reports',
    icon: BarChart3,
    href: '/reports',
    active: false
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    active: false
  }
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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
      <div className={cn(
        "h-screen w-64 bg-card border-r border-border transition-transform duration-200 ease-in-out sticky top-0 z-40",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center border-b border-border px-6">
            <Building2 className="h-8 w-8 text-primary" />
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-foreground">HOMA Suite</h1>
              <p className="text-xs text-muted-foreground">BOH Concepts ERP</p>
            </div>
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
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                PM
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">Property Manager</p>
                <p className="text-xs text-muted-foreground">property@bohconcepts.com</p>
              </div>
            </div>
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