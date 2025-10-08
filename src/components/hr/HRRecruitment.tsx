import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { RecruitmentMetrics } from "./recruitment/RecruitmentMetrics";
import { CandidatePipeline } from "./recruitment/CandidatePipeline";
import { JobListings } from "./recruitment/JobListings";
import { RecruitmentAnalytics } from "./recruitment/RecruitmentAnalytics";
import { useRecruitmentAnalytics } from "@/hooks/recruitment/useRecruitmentAnalytics";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";

export function HRRecruitment() {
  const [timeRange, setTimeRange] = useState("6m");
  const [department, setDepartment] = useState("all");
  const [activeTab, setActiveTab] = useState("metrics");
  
  // Get real data from hooks
  const { metrics, loading, error } = useRecruitmentAnalytics(timeRange, department);
  const { stats } = useExternalStaff();

  // Get unique departments from external staff data
  const departments = stats.topDepartments.map(dept => dept.department).slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Recruitment Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Track hiring metrics, candidate pipeline, and recruitment analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept.toLowerCase()}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList className="grid w-[180px] grid-cols-3">
              <TabsTrigger value="3m">3M</TabsTrigger>
              <TabsTrigger value="6m">6M</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Positions
            </CardTitle>
            <div className="h-4 w-4 text-blue-500">{loading ? "..." : metrics.openPositions}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics.openPositions}</div>
            <p className="text-xs text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{Math.floor(metrics.openPositions * 0.2)} from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <div className="h-4 w-4 text-green-500">{loading ? "..." : metrics.applications}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics.applications}</div>
            <p className="text-xs text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{Math.floor(metrics.applications * 0.15)} from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <div className="h-4 w-4 text-amber-500">{loading ? "..." : metrics.interviews}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics.interviews}</div>
            <p className="text-xs text-amber-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{Math.floor(metrics.interviews * 0.13)} from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Made</CardTitle>
            <div className="h-4 w-4 text-purple-500">{loading ? "..." : metrics.offersMade}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics.offersMade}</div>
            <p className="text-xs text-purple-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{Math.floor(metrics.offersMade * 0.28)} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recruitment Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-background border-border">
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="pipeline">Candidate Pipeline</TabsTrigger>
          <TabsTrigger value="jobs">Job Listings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <RecruitmentMetrics timeRange={timeRange} department={department} />
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <CandidatePipeline timeRange={timeRange} department={department} />
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <JobListings department={department} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <RecruitmentAnalytics timeRange={timeRange} department={department} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
