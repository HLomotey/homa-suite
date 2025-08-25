import { useState, useEffect } from "react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  UserMinus,
  Clock,
  BarChart,
  PieChart,
  Calendar,
  Download,
  ChevronRight,
  Filter,
} from "lucide-react";
import { HROverview } from "@/components/hr/HROverview";
import { HRDepartments } from "@/components/hr/HRDepartments";
import { HRDiversity } from "@/components/hr/HRDiversity";
import { HRRecruitment } from "@/components/hr/HRRecruitment";

export default function HR() {
  const [activeTab, setActiveTab] = useState("overview");
  const { stats, statsLoading } = useExternalStaff();

  return (
    <div className="flex-1 h-full p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">HR Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Headcount
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats.totalCount}</div>
            <p className="text-xs text-muted-foreground">External staff members</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Staff
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats.activeCount}</div>
            <p className="text-xs text-green-500">
              {statsLoading ? "..." : `${stats.totalCount > 0 ? Math.round((stats.activeCount / stats.totalCount) * 100) : 0}% of total`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminated Staff</CardTitle>
            <UserMinus className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats.terminatedCount}</div>
            <p className="text-xs text-red-500">
              {statsLoading ? "..." : `${stats.totalCount > 0 ? Math.round((stats.terminatedCount / stats.totalCount) * 100) : 0}% of total`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Hires
            </CardTitle>
            <UserPlus className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats.recentHiresCount}
            </div>
            <p className="text-xs text-muted-foreground">
              In the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-background border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="diversity">Diversity</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <HROverview />
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <HRDepartments />
        </TabsContent>

        <TabsContent value="diversity" className="space-y-4">
          <HRDiversity />
        </TabsContent>

        <TabsContent value="recruitment" className="space-y-4">
          <HRRecruitment />
        </TabsContent>
      </Tabs>
    </div>
  );
}
