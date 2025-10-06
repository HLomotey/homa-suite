import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenderDistribution } from "./GenderDistribution";
import { AgeDemographics } from "./AgeDemographics";
import { EthnicityBreakdown } from "./EthnicityBreakdown";
import { DiversityTrends } from "./DiversityTrends";
import { DiversityPrograms } from "./DiversityPrograms";
import { DiversityGoals } from "./DiversityGoals";
import { useDiversityAnalytics } from "@/hooks/diversity/useDiversityAnalytics";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";

export function DiversityOverview() {
  const [timeRange, setTimeRange] = useState("6m");
  const [department, setDepartment] = useState("all");
  
  // Get real data from hooks
  const { metrics, loading } = useDiversityAnalytics(timeRange, department);
  const { stats } = useExternalStaff();

  // Get unique departments from external staff data
  const departments = stats.topDepartments.map(dept => dept.department).slice(0, 7);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Diversity Metrics</h3>
          <p className="text-sm text-muted-foreground">
            Analyze and track diversity metrics across the organization
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <GenderDistribution timeRange={timeRange} department={department} />
        <AgeDemographics timeRange={timeRange} department={department} />
        <EthnicityBreakdown timeRange={timeRange} department={department} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <DiversityTrends timeRange={timeRange} department={department} />
        <DiversityPrograms timeRange={timeRange} department={department} />
      </div>
      
      <DiversityGoals timeRange={timeRange} department={department} />
    </div>
  );
}
