import { createBrowserRouter, RouteObject } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import Housing from "@/pages/Housing";
import Billing from "@/pages/Billing";
import Transport from "@/pages/Transport";
import NotFound from "@/pages/NotFound";
import { AppLayout } from "@/components/layout";

// Define all application routes
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "properties",
        element: <Properties />,
      },
      {
        path: "housing",
        element: <Housing />,
      },
      {
        path: "billing",
        element: <Billing />,
      },
      {
        path: "transport",
        element: <Transport />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

// Create and export the router
export const router = createBrowserRouter(routes);

// Export route paths as constants for use throughout the app
export const ROUTES = {
  DASHBOARD: "/dashboard",
  PROPERTIES: "/properties",
  HOUSING: "/housing",
  BILLING: "/billing",
  TRANSPORT: "/transport",
};
