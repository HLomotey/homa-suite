import { createBrowserRouter, RouteObject } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import Housing from "@/pages/Housing";
import Billing from "@/pages/Billing";
import Transport from "@/pages/Transport";
import NotFound from "@/pages/NotFound";
import { AppLayout } from "@/components/layout";

import { HRRecruitment } from "@/components/hr/HRRecruitment";
import { HRDiversity } from "@/components/hr/HRDiversity";
import { HROverview } from "@/components/hr/HROverview";
import HR from "@/pages/HR";

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
        path: "hr",
        element: <HR />,
      },
      {
        path: "hr/recruitment",
        element: <HRRecruitment />,
      },
      {
        path: "hr/diversity",
        element: <HRDiversity />,
      },
      {
        path: "hr/overview",
        element: <HROverview />,
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

// Import route constants
import { ROUTES } from "./constants";

// Re-export route constants
export { ROUTES };
