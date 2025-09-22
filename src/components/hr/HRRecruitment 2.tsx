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
import { ChevronRight } from "lucide-react";
import { RecruitmentMetrics } from "./recruitment/RecruitmentMetrics";
import { CandidatePipeline } from "./recruitment/CandidatePipeline";
import { JobListings } from "./recruitment/JobListings";
import { RecruitmentAnalytics } from "./recruitment/RecruitmentAnalytics";

export function HRRecruitment() {
  const [timeRange, setTimeRange] = useState("6m");
  const [department, setDepartment] = useState("all");
  const [activeTab, setActiveTab] = useState("metrics");

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
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="support">Support</SelectItem>
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
            <div className="h-4 w-4 text-blue-500">35</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35</div>
            <p className="text-xs text-green-500">+8 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <div className="h-4 w-4 text-green-500">428</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">428</div>
            <p className="text-xs text-green-500">+64 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <div className="h-4 w-4 text-amber-500">92</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92</div>
            <p className="text-xs text-amber-500">+12 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Made</CardTitle>
            <div className="h-4 w-4 text-purple-500">18</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-purple-500">+5 from last month</p>
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
