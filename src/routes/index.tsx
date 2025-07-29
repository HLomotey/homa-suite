import { createBrowserRouter, RouteObject } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import Housing from "@/pages/Housing";
import Billing from "@/pages/Billing";
import Transport from "@/pages/Transport";
import Settings from "@/pages/Settings";
import Users from "@/pages/Users";
import ExcelUploads from "@/pages/ExcelUploads";
import NotFound from "@/pages/NotFound";
import { AppLayout } from "@/components/layout";

import { HRRecruitment } from "@/components/hr/HRRecruitment";
import { HRDiversity } from "@/components/hr/HRDiversity";
import { HROverview } from "@/components/hr/HROverview";
import { HRDepartments } from "@/components/hr/HRDepartments";
import HR from "@/pages/HR";
import Finance from "@/pages/Finance";
import Operations from "@/pages/Operations";
import { RevenueTrendDetail } from "@/components/finance/detail/RevenueTrendDetail";
import { ClientRevenueDetail } from "@/components/finance/detail/ClientRevenueDetail";
import { CashFlowDetail } from "@/components/finance/detail/CashFlowDetail";
import { ExpenseDetail } from "@/components/finance/detail/ExpenseDetail";
import { JobOrdersTrendDetail } from "@/components/operations/detail/JobOrdersTrendDetail";
import { RegionalFillRateDetail } from "@/components/operations/detail/RegionalFillRateDetail";
import { TimeToFillTrendDetail } from "@/components/operations/detail/TimeToFillTrendDetail";
import { JobTypesDistributionDetail } from "@/components/operations/detail/JobTypesDistributionDetail";

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
        path: "settings",
        element: <Settings />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "users/:userId",
        element: <Users />,
      },
      {
        path: "users/:userId/permissions",
        element: <Users />,
      },
      {
        path: "excel-uploads",
        element: <ExcelUploads />,
      },
      {
        path: "hr",
        element: <HR />,
      },
      {
        path: "/hr/recruitment",
        element: <HRRecruitment />,
      },
      {
        path: "/hr/diversity",
        element: <HRDiversity />,
      },
      {
        path: "/hr/overview",
        element: <HROverview />,
      },
      {
        path: "/hr/overview/headcount",
        element: <HRDepartments />,
      },
      {
        path: "/hr/overview/retention",
        element: <HROverview />,
      },
      {
        path: "/hr/overview/gender",
        element: <HRDiversity />,
      },
      {
        path: "/hr/overview/hiring",
        element: <HRRecruitment />,
      },
      {
        path: "/finance",
        element: <Finance />,
      },
      {
        path: "/finance/revenue-trend",
        element: <RevenueTrendDetail />,
      },
      {
        path: "/finance/client-revenue",
        element: <ClientRevenueDetail />,
      },
      {
        path: "/finance/cash-flow",
        element: <CashFlowDetail />,
      },
      {
        path: "/finance/expenses",
        element: <ExpenseDetail />,
      },
      {
        path: "/operations",
        element: <Operations />,
      },
      {
        path: "/operations/job-orders-trend",
        element: <JobOrdersTrendDetail />,
      },
      {
        path: "/operations/regional-performance",
        element: <RegionalFillRateDetail />,
      },
      {
        path: "/operations/time-to-fill",
        element: <TimeToFillTrendDetail />,
      },
      {
        path: "/operations/job-types",
        element: <JobTypesDistributionDetail />,
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
