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
} from "lucide-react";
import { HRAnalytics } from "@/components/dashboard/HRAnalytics";
import { FinanceAnalytics } from "@/components/dashboard/FinanceAnalytics";
import { OperationsAnalytics } from "@/components/dashboard/OperationsAnalytics";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ReportsList } from "@/components/dashboard/ReportsList";
import { AnalyticsTab } from "@/components/dashboard/AnalyticsTab";
import { ReportsTab } from "@/components/dashboard/ReportsTab";

export default function Dashboard() {
  return (
    <div className="flex-1 h-full p-4 md:p-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>Download Report</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-slate-900/40 to-slate-800/20 border-slate-800/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Properties
                </CardTitle>
                <Home className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-green-500">+2 from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/40 to-slate-800/20 border-slate-800/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-green-500">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/40 to-slate-800/20 border-slate-800/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Tenants
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">573</div>
                <p className="text-xs text-green-500">
                  +201 since last quarter
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/40 to-slate-800/20 border-slate-800/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Payments
                </CardTitle>
                <CreditCard className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-green-500">-3 from last week</p>
              </CardContent>
            </Card>
          </div>

          <HRAnalytics />

          <FinanceAnalytics />

          <OperationsAnalytics />

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
