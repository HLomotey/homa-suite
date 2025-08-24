// Navigation modules configuration for role-based access control
export interface NavigationModule {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  routes: string[]; // Routes that belong to this module
}

export const NAVIGATION_MODULES: NavigationModule[] = [
  {
    id: 'dashboard',
    name: 'dashboard',
    displayName: 'Dashboard',
    description: 'Main dashboard and overview',
    icon: 'LayoutDashboard',
    routes: ['/dashboard', '/']
  },
  {
    id: 'properties',
    name: 'properties',
    displayName: 'Properties',
    description: 'Property management and housing',
    icon: 'Building',
    routes: ['/properties', '/housing', '/maintenance', '/maintenance/*']
  },
  {
    id: 'transport',
    name: 'transport',
    displayName: 'Transport',
    description: 'Transportation management',
    icon: 'Truck',
    routes: ['/transport']
  },
  {
    id: 'hr',
    name: 'hr',
    displayName: 'Human Resources',
    description: 'HR management and employee data',
    icon: 'Users',
    routes: ['/hr', '/hr/*', '/staff', '/payroll', '/attendance']
  },
  {
    id: 'finance',
    name: 'finance',
    displayName: 'Finance',
    description: 'Financial management and billing',
    icon: 'DollarSign',
    routes: ['/finance', '/finance/*', '/billing']
  },
  {
    id: 'operations',
    name: 'operations',
    displayName: 'Operations',
    description: 'Operational management and analytics',
    icon: 'Activity',
    routes: ['/operations', '/operations/*', '/analytics']
  },
  {
    id: 'complaints',
    name: 'complaints',
    displayName: 'Complaints',
    description: 'Complaint management system',
    icon: 'MessageSquare',
    routes: ['/complaints', '/complaints/*']
  },
  {
    id: 'users',
    name: 'users',
    displayName: 'User Management',
    description: 'User and role management',
    icon: 'UserCog',
    routes: ['/users', '/users/*', '/roles', '/roles/*']
  },
  {
    id: 'settings',
    name: 'settings',
    displayName: 'Settings',
    description: 'System settings and configuration',
    icon: 'Settings',
    routes: ['/settings', '/profile', '/utilities', '/excel-uploads']
  },
  {
    id: 'activity_log',
    name: 'activity_log',
    displayName: 'Activity Log',
    description: 'System activity monitoring and audit trails',
    icon: 'Activity',
    routes: ['/activity-log']
  }
];

// Helper function to get module by route
export const getModuleByRoute = (route: string): NavigationModule | undefined => {
  return NAVIGATION_MODULES.find(module => 
    module.routes.some(moduleRoute => {
      if (moduleRoute.endsWith('/*')) {
        const baseRoute = moduleRoute.slice(0, -2);
        return route.startsWith(baseRoute);
      }
      return route === moduleRoute;
    })
  );
};

// Helper function to check if user has access to a route
export const hasRouteAccess = (userModules: string[], route: string): boolean => {
  const module = getModuleByRoute(route);
  if (!module) return false;
  return userModules.includes(module.id);
};

// Get all route patterns for a module
export const getModuleRoutes = (moduleId: string): string[] => {
  const module = NAVIGATION_MODULES.find(m => m.id === moduleId);
  return module?.routes || [];
};
