import { createBrowserRouter, RouteObject } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import Housing from "@/pages/Housing";
import Billing from "@/pages/Billing";
import Staff from "@/pages/Staff";
import PayrollPage from "@/pages/PayrollPage";
import { AttendancePage } from "@/pages/AttendancePage";
import Transport from "@/pages/Transport";
import Settings from "@/pages/Settings";
import Users from "@/pages/Users";
import ExcelUploads from "@/pages/ExcelUploads";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/NotFound";
import { AppLayout } from "@/components/layout";
import { RouteGuard } from "@/components/permissions";

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
import Utilities from "@/pages/Utilities";
import UploadFinance from "@/pages/UploadFinance";

// Define all application routes
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <RouteGuard module="dashboard">
            <Dashboard />
          </RouteGuard>
        ),
      },
      {
        path: "dashboard",
        element: (
          <RouteGuard module="dashboard">
            <Dashboard />
          </RouteGuard>
        ),
      },
      {
        path: "properties",
        element: (
          <RouteGuard module="properties">
            <Properties />
          </RouteGuard>
        ),
      },
      {
        path: "housing",
        element: (
          <RouteGuard module="properties">
            <Housing />
          </RouteGuard>
        ),
      },
      {
        path: "billing",
        element: (
          <RouteGuard module="billing">
            <Billing />
          </RouteGuard>
        ),
      },
      {
        path: "staff",
        element: (
          <RouteGuard module="staff">
            <Staff />
          </RouteGuard>
        ),
      },
      {
        path: "payroll",
        element: (
          <RouteGuard module="payroll">
            <PayrollPage />
          </RouteGuard>
        ),
      },
      {
        path: "attendance",
        element: (
          <RouteGuard module="attendance">
            <AttendancePage />
          </RouteGuard>
        ),
      },
      {
        path: "transport",
        element: (
          <RouteGuard module="transport">
            <Transport />
          </RouteGuard>
        ),
      },
      {
        path: "settings",
        element: (
          <RouteGuard module="settings">
            <Settings />
          </RouteGuard>
        ),
      },
      {
        path: "users",
        element: (
          <RouteGuard module="users">
            <Users />
          </RouteGuard>
        ),
      },
      {
        path: "users/:userId",
        element: (
          <RouteGuard module="users">
            <Users />
          </RouteGuard>
        ),
      },
      {
        path: "users/:userId/permissions",
        element: (
          <RouteGuard module="users" action="edit">
            <Users />
          </RouteGuard>
        ),
      },
      {
        path: "excel-uploads",
        element: (
          <RouteGuard module="uploads">
            <ExcelUploads />
          </RouteGuard>
        ),
      },
      {
        path: "analytics",
        element: (
          <RouteGuard module="admin">
            <Analytics />
          </RouteGuard>
        ),
      },
      {
        path: "hr",
        element: (
          <RouteGuard module="hr">
            <HR />
          </RouteGuard>
        ),
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
        path: "/finance/upload",
        element: <UploadFinance />,
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
        path: "utilities",
        element: (
          <RouteGuard module="utilities">
            <Utilities />
          </RouteGuard>
        ),
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
