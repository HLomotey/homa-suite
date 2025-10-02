import { createBrowserRouter, RouteObject } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import { AppLayout } from "@/components/layout";
import { ModuleRouteGuard } from "@/components/permissions/ModuleRouteGuard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy load all page components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Properties = lazy(() => import("@/pages/Properties"));
const Housing = lazy(() => import("@/pages/Housing"));
const Billing = lazy(() => import("@/pages/Billing"));
const Staff = lazy(() => import("@/pages/Staff"));
const ExternalStaff = lazy(() => import("@/pages/ExternalStaff"));
const PayrollPage = lazy(() => import("@/pages/PayrollPage"));
const AttendancePage = lazy(() =>
  import("@/pages/AttendancePage").then((module) => ({
    default: module.AttendancePage,
  }))
);
const Transport = lazy(() => import("@/pages/Transport"));
const Settings = lazy(() => import("@/pages/Settings"));
const Profile = lazy(() =>
  import("@/pages/Profile").catch((error) => {
    console.error("Error loading Profile module:", error);
    return {
      default: () => <div>Error loading profile. Please try again.</div>,
    };
  })
);
const Users = lazy(() => import("@/pages/Users"));
const Roles = lazy(() => import("@/pages/Roles"));
const ExcelUploads = lazy(() => import("@/pages/ExcelUploads"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const HR = lazy(() => import("@/pages/HR"));
const Finance = lazy(() => import("@/pages/Finance"));
const Operations = lazy(() => import("@/pages/Operations"));
const Utilities = lazy(() => import("@/pages/Utilities"));
const UploadFinance = lazy(() => import("@/pages/UploadFinance"));
const ActivityLogPage = lazy(() => import("@/pages/ActivityLogPage"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const StaffBenefits = lazy(() => import("@/pages/StaffBenefits"));
const JobOrders = lazy(() => import("@/pages/JobOrders"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Login = lazy(() => import("@/pages/Login"));

// Lazy load Termination Module
const TerminationModule = lazy(() =>
  import("@/components/termination/TerminationModule").then((module) => ({
    default: module.TerminationModule,
  }))
);

// Lazy load J-1 Tracking Module
const J1TrackingModule = lazy(() =>
  import("@/components/j1-tracking/J1TrackingModule").then((module) => ({
    default: module.J1TrackingModule,
  }))
);

// Lazy load HR components
const HRRecruitment = lazy(() =>
  import("@/components/hr/HRRecruitment").then((module) => ({
    default: module.HRRecruitment,
  }))
);
const HRDiversity = lazy(() =>
  import("@/components/hr/HRDiversity").then((module) => ({
    default: module.HRDiversity,
  }))
);
const HROverview = lazy(() =>
  import("@/components/hr/HROverview").then((module) => ({
    default: module.HROverview,
  }))
);
const HRDepartments = lazy(() =>
  import("@/components/hr/HRDepartments").then((module) => ({
    default: module.HRDepartments,
  }))
);

// Lazy load Finance detail components
const RevenueTrendDetail = lazy(() =>
  import("@/components/finance/detail/RevenueTrendDetail").then((module) => ({
    default: module.RevenueTrendDetail,
  }))
);
const ClientRevenueDetail = lazy(() =>
  import("@/components/finance/detail/ClientRevenueDetail").then((module) => ({
    default: module.ClientRevenueDetail,
  }))
);
const CashFlowDetail = lazy(() =>
  import("@/components/finance/detail/CashFlowDetail").then((module) => ({
    default: module.CashFlowDetail,
  }))
);
const ExpenseDetail = lazy(() =>
  import("@/components/finance/detail/ExpenseDetail").then((module) => ({
    default: module.ExpenseDetail,
  }))
);

// Lazy load Operations detail components
const JobOrdersTrendDetail = lazy(() =>
  import("@/components/operations/detail/JobOrdersTrendDetail").then(
    (module) => ({ default: module.JobOrdersTrendDetail })
  )
);
const RegionalFillRateDetail = lazy(() =>
  import("@/components/operations/detail/RegionalFillRateDetail").then(
    (module) => ({ default: module.RegionalFillRateDetail })
  )
);
const TimeToFillTrendDetail = lazy(() =>
  import("@/components/operations/detail/TimeToFillTrendDetail").then(
    (module) => ({ default: module.TimeToFillTrendDetail })
  )
);
const JobTypesDistributionDetail = lazy(() =>
  import("@/components/operations/detail/JobTypesDistributionDetail").then(
    (module) => ({ default: module.JobTypesDistributionDetail })
  )
);

// Lazy load Operations Call Meeting Report components
const MonthEndReportsPage = lazy(() =>
  import("@/components/operations/month-end-reports/MonthEndReportsPage").then(
    (module) => ({ default: module.MonthEndReportsPage })
  )
);

// Lazy load Maintenance Module components
const MaintenanceLayout = lazy(() => import("@/routes/maintenance"));
const MaintenanceDashboard = lazy(
  () => import("@/routes/maintenance/dashboard")
);
const MaintenanceRequests = lazy(() => import("@/routes/maintenance/requests"));
const MaintenanceRequestDetail = lazy(
  () => import("@/routes/maintenance/request-detail")
);
const ReportMaintenanceIssue = lazy(
  () => import("@/routes/maintenance/report")
);
const MaintenanceAdmin = lazy(() => import("@/routes/maintenance/admin"));
const AdminRequestDetail = lazy(
  () => import("@/routes/maintenance/admin/request-detail")
);
const ManageMaintenanceRequest = lazy(
  () => import("@/routes/maintenance/admin/request-manage")
);
const StaffMaintenanceRequests = lazy(
  () => import("@/routes/maintenance/staff")
);
const StaffRequestDetail = lazy(
  () => import("@/routes/maintenance/staff/request-detail")
);

// Lazy load Complaints Module components
const ComplaintsLayout = lazy(() => import("@/pages/complaints"));
const ComplaintsList = lazy(() => import("@/pages/complaints/list"));
const ComplaintsKanban = lazy(() => import("@/pages/complaints/kanban"));
const ComplaintDetail = lazy(() => import("@/pages/complaints/detail"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Error boundary component to catch lazy loading errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Route loading failed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-4">
            Failed to load the requested page
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for lazy loaded routes with suspense and error handling
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
  </ErrorBoundary>
);

// Define all application routes
export const routes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <LazyWrapper>
        <Login />
      </LazyWrapper>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <LazyWrapper>
        <ResetPassword />
      </LazyWrapper>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="dashboard">
              <Dashboard />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "dashboard",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="dashboard">
              <Dashboard />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "properties",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="properties">
              <Properties />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "housing",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="properties">
              <Housing />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "billing",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="billing">
              <Billing />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "staff",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="hr">
              <Staff />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "external-staff",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="hr">
              <ExternalStaff />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "payroll",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="hr">
              <PayrollPage />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "attendance",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="hr">
              <AttendancePage />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "termination",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="termination">
              <TerminationModule />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "j1-tracking",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="j1-tracking">
              <J1TrackingModule />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "transport",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="transport">
              <Transport />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "settings",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="settings">
              <Settings />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "profile",
        element: (
          <LazyWrapper>
            <Profile />
          </LazyWrapper>
        ),
      },
      {
        path: "users",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="users">
              <Users />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "users/:userId",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="users">
              <Users />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "users/:userId/permissions",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="users">
              <Users />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      // Add role management routes
      {
        path: "roles",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="users">
              <Roles />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "roles/:roleId",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="users">
              <Roles />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "excel-uploads",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="settings">
              <ExcelUploads />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "analytics",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="operations">
              <Analytics />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "hr",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="hr">
              <HR />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "/hr/recruitment",
        element: (
          <LazyWrapper>
            <HRRecruitment />
          </LazyWrapper>
        ),
      },
      {
        path: "/hr/diversity",
        element: (
          <LazyWrapper>
            <HRDiversity />
          </LazyWrapper>
        ),
      },
      {
        path: "/hr/overview",
        element: (
          <LazyWrapper>
            <HROverview />
          </LazyWrapper>
        ),
      },
      {
        path: "/hr/overview/headcount",
        element: (
          <LazyWrapper>
            <HRDepartments />
          </LazyWrapper>
        ),
      },
      {
        path: "/hr/overview/retention",
        element: (
          <LazyWrapper>
            <HROverview />
          </LazyWrapper>
        ),
      },
      {
        path: "/hr/overview/gender",
        element: (
          <LazyWrapper>
            <HRDiversity />
          </LazyWrapper>
        ),
      },
      {
        path: "/hr/overview/hiring",
        element: (
          <LazyWrapper>
            <HRRecruitment />
          </LazyWrapper>
        ),
      },
      {
        path: "/finance",
        element: (
          <LazyWrapper>
            <Finance />
          </LazyWrapper>
        ),
      },
      {
        path: "/finance/revenue-trend",
        element: (
          <LazyWrapper>
            <RevenueTrendDetail />
          </LazyWrapper>
        ),
      },
      {
        path: "/finance/client-revenue",
        element: (
          <LazyWrapper>
            <ClientRevenueDetail />
          </LazyWrapper>
        ),
      },
      {
        path: "/finance/cash-flow",
        element: (
          <LazyWrapper>
            <CashFlowDetail />
          </LazyWrapper>
        ),
      },
      {
        path: "/finance/expenses",
        element: (
          <LazyWrapper>
            <ExpenseDetail />
          </LazyWrapper>
        ),
      },
      {
        path: "/finance/upload",
        element: (
          <LazyWrapper>
            <UploadFinance />
          </LazyWrapper>
        ),
      },
      {
        path: "/operations",
        element: (
          <LazyWrapper>
            <Operations />
          </LazyWrapper>
        ),
      },
      {
        path: "/operations/job-orders-trend",
        element: (
          <LazyWrapper>
            <JobOrdersTrendDetail />
          </LazyWrapper>
        ),
      },
      {
        path: "/operations/regional-performance",
        element: (
          <LazyWrapper>
            <RegionalFillRateDetail />
          </LazyWrapper>
        ),
      },
      {
        path: "/operations/time-to-fill",
        element: (
          <LazyWrapper>
            <TimeToFillTrendDetail />
          </LazyWrapper>
        ),
      },
      {
        path: "/operations/job-types",
        element: (
          <LazyWrapper>
            <JobTypesDistributionDetail />
          </LazyWrapper>
        ),
      },
      {
        path: "/operations/month-end-reports",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="operations">
              <MonthEndReportsPage />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "utilities",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="utilities">
              <Utilities />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "maintenance",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="properties">
              <MaintenanceLayout />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
        children: [
          {
            index: true,
            element: (
              <LazyWrapper>
                <MaintenanceDashboard />
              </LazyWrapper>
            ),
          },
          {
            path: "requests",
            element: (
              <LazyWrapper>
                <MaintenanceRequests />
              </LazyWrapper>
            ),
          },
          {
            path: "requests/:id",
            element: (
              <LazyWrapper>
                <MaintenanceRequestDetail />
              </LazyWrapper>
            ),
          },
          {
            path: "report",
            element: (
              <LazyWrapper>
                <ReportMaintenanceIssue />
              </LazyWrapper>
            ),
          },
          {
            path: "admin",
            element: (
              <LazyWrapper>
                <MaintenanceAdmin />
              </LazyWrapper>
            ),
          },
          {
            path: "admin/requests/:id",
            element: (
              <LazyWrapper>
                <AdminRequestDetail />
              </LazyWrapper>
            ),
          },
          {
            path: "admin/requests/:id/edit",
            element: (
              <LazyWrapper>
                <ManageMaintenanceRequest />
              </LazyWrapper>
            ),
          },
          {
            path: "staff",
            element: (
              <LazyWrapper>
                <StaffMaintenanceRequests />
              </LazyWrapper>
            ),
          },
          {
            path: "staff/requests/:id",
            element: (
              <LazyWrapper>
                <StaffRequestDetail />
              </LazyWrapper>
            ),
          },
          {
            path: "staff/requests/:id/manage",
            element: (
              <LazyWrapper>
                <ManageMaintenanceRequest />
              </LazyWrapper>
            ),
          },
        ],
      },
      {
        path: "complaints",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="complaints">
              <ComplaintsLayout />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
        children: [
          {
            index: true,
            element: (
              <LazyWrapper>
                <ComplaintsList />
              </LazyWrapper>
            ),
          },
          {
            path: "kanban",
            element: (
              <LazyWrapper>
                <ComplaintsKanban />
              </LazyWrapper>
            ),
          },
          {
            path: ":id",
            element: (
              <LazyWrapper>
                <ComplaintDetail />
              </LazyWrapper>
            ),
          },
        ],
      },
      {
        path: "activity-log",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="activity_log">
              <ActivityLogPage />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "onboarding",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="onboarding">
              <Onboarding />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "staff-benefits",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="onboarding">
              <StaffBenefits />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "job-orders",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="job-orders">
              <JobOrders />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "notifications",
        element: (
          <LazyWrapper>
            <ModuleRouteGuard module="notifications">
              <Notifications />
            </ModuleRouteGuard>
          </LazyWrapper>
        ),
      },
      {
        path: "*",
        element: (
          <LazyWrapper>
            <NotFound />
          </LazyWrapper>
        ),
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
