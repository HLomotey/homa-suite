import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  CreditCard,
  DollarSign,
  Home,
  LineChart,
  Users,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { HRAnalytics } from "@/components/dashboard/HRAnalytics";
import { FinanceAnalytics } from "@/components/dashboard/FinanceAnalytics";
import { OperationsAnalytics } from "@/components/dashboard/OperationsAnalytics";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ReportsList } from "@/components/dashboard/ReportsList";
import { AnalyticsTab } from "@/components/dashboard/AnalyticsTab";
import { ReportsTab } from "@/components/dashboard/ReportsTab";
import { DateFilter } from "@/components/ui/date-filter";
import { useProperties } from "@/hooks/property/useProperty";
import { useAssignments } from "@/hooks/assignment/useAssignment";
import { useBillingLogs } from "@/hooks/billing/useBillingLog";
import { useRooms } from "@/hooks/room/useRoom";

// Stats Card Component matching properties dashboard style
interface StatsCardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    direction: "up" | "down";
    period: string;
  };
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "purple";
  isLoading?: boolean;
}

const StatsCard = ({ title, value, trend, icon, color, isLoading = false }: StatsCardProps) => {
  const colorClasses = {
    blue: "bg-blue-950/40 border-blue-800/30 text-blue-500",
    green: "bg-green-950/40 border-green-800/30 text-green-500",
    amber: "bg-amber-950/40 border-amber-800/30 text-amber-500",
    purple: "bg-purple-950/40 border-purple-800/30 text-purple-500",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-white/60">{title}</span>
        <div className="p-2 rounded-full bg-white/5">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{isLoading ? "--" : value}</div>
      <div className="flex items-center text-xs">
        {!isLoading && trend && (
          <>
            <span className={trend.direction === "up" ? "text-green-500" : "text-red-500"}>
              {trend.direction === "up" ? <ArrowUp className="h-3 w-3 inline mr-1" /> : <ArrowDown className="h-3 w-3 inline mr-1" />}
              {trend.value}
            </span>
            <span className="text-white/40 ml-1">{trend.period}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<number>();
  const [selectedMonth, setSelectedMonth] = useState<number>();

  // Fetch real data from properties components
  const { properties, loading: propertiesLoading } = useProperties();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const { data: billingLogs, isLoading: billingLoading } = useBillingLogs({});
  const { rooms, loading: roomsLoading } = useRooms();

  const handleDateChange = (year: number | undefined, month: number | undefined) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  // Calculate metrics from real data
  const dashboardMetrics = useMemo(() => {
    const totalProperties = properties?.length || 0;
    const activeAssignments = assignments?.filter(a => a.status === "Active").length || 0;
    
    // Calculate pending payments from billing logs
    const pendingBillingRecords = billingLogs?.filter(b => 
      b.paymentStatus === "unpaid" || b.paymentStatus === "partial"
    ) || [];
    
    const pendingPaymentsCount = pendingBillingRecords.length;
    const pendingPaymentsAmount = pendingBillingRecords.reduce((sum, b) => sum + b.rentAmount, 0);
    
    // Calculate total revenue from billing logs
    const totalRevenue = billingLogs?.reduce((sum, b) => 
      b.paymentStatus === "paid" ? sum + b.rentAmount : sum, 0
    ) || 0;

    // Calculate occupancy rate from available rooms vs occupied rooms
    const availableRooms = rooms?.filter(r => r.status === "Available" || r.status === "Occupied").length || 0;
    const occupiedRooms = assignments?.filter(a => a.status === "Active").length || 0;
    const occupancyRate = availableRooms > 0 ? (occupiedRooms / availableRooms) * 100 : 0;
    
    // Calculate expected rent from rooms (RoomForm.tsx price field)
    // This represents the total expected rent from all rooms
    const expectedMonthlyRent = rooms?.reduce((sum, r) => sum + r.price, 0) || 0;
    const expectedBiWeeklyRent = expectedMonthlyRent / 2.17; // Convert to bi-weekly
    
    // Calculate actual bi-weekly billing from assignments (AssignmentForm.tsx rentAmount field)
    const actualBiWeeklyBilling = assignments
      ?.filter(a => a.status === "Active")
      .reduce((sum, a) => sum + (a.rentAmount / 2.17), 0) || 0;

    return {
      totalProperties,
      activeAssignments,
      pendingPaymentsCount,
      pendingPaymentsAmount,
      totalRevenue,
      occupancyRate,
      expectedBiWeeklyRent,
      actualBiWeeklyBilling,
      availableRooms,
      occupiedRooms,
      isLoading: propertiesLoading || assignmentsLoading || billingLoading || roomsLoading
    };
  }, [properties, assignments, billingLogs, rooms, propertiesLoading, assignmentsLoading, billingLoading, roomsLoading]);

  return (
    <div className="flex-1 h-full p-4 md:p-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <DateFilter onDateChange={handleDateChange} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Main Stats Cards - 5 columns including occupancy rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Total Properties"
              value={dashboardMetrics.isLoading ? "--" : dashboardMetrics.totalProperties.toString()}
              trend={{ value: "+8.3%", direction: "up", period: "vs last month" }}
              icon={dashboardMetrics.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Home className="h-5 w-5" />}
              color="amber"
              isLoading={dashboardMetrics.isLoading}
            />
            <StatsCard
              title="Total Revenue"
              value={dashboardMetrics.isLoading ? "--" : `$${dashboardMetrics.totalRevenue.toLocaleString()}`}
              trend={{ value: "+20.1%", direction: "up", period: "vs last month" }}
              icon={dashboardMetrics.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <DollarSign className="h-5 w-5" />}
              color="green"
              isLoading={dashboardMetrics.isLoading}
            />
            <StatsCard
              title="Active Tenants"
              value={dashboardMetrics.isLoading ? "--" : dashboardMetrics.activeAssignments.toString()}
              trend={{ value: "+54.1%", direction: "up", period: "vs last quarter" }}
              icon={dashboardMetrics.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Users className="h-5 w-5" />}
              color="blue"
              isLoading={dashboardMetrics.isLoading}
            />
            <StatsCard
              title="Pending Payments"
              value={dashboardMetrics.isLoading ? "--" : `${dashboardMetrics.pendingPaymentsCount} ($${dashboardMetrics.pendingPaymentsAmount.toLocaleString()})`}
              trend={{ value: "-20.0%", direction: "down", period: "vs last week" }}
              icon={dashboardMetrics.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
              color="purple"
              isLoading={dashboardMetrics.isLoading}
            />
            <StatsCard
              title="Expected vs Actual"
              value={dashboardMetrics.isLoading ? "--" : `$${dashboardMetrics.expectedBiWeeklyRent.toLocaleString()} / $${dashboardMetrics.actualBiWeeklyBilling.toLocaleString()}`}
              trend={{ 
                value: dashboardMetrics.isLoading ? "0%" : `${((dashboardMetrics.actualBiWeeklyBilling / dashboardMetrics.expectedBiWeeklyRent - 1) * 100).toFixed(1)}%`, 
                direction: dashboardMetrics.actualBiWeeklyBilling >= dashboardMetrics.expectedBiWeeklyRent ? "up" : "down", 
                period: "actual vs expected" 
              }}
              icon={dashboardMetrics.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LineChart className="h-5 w-5" />}
              color="blue"
              isLoading={dashboardMetrics.isLoading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            <div className="bg-card/20 rounded-lg p-4 border border-border/50">
              <HRAnalytics />
            </div>
            <div className="bg-card/20 rounded-lg p-4 border border-border/50">
              <FinanceAnalytics />
            </div>
            <div className="bg-card/20 rounded-lg p-4 border border-border/50">
              <OperationsAnalytics />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* <ActivityFeed />
            <ReportsList /> */}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
