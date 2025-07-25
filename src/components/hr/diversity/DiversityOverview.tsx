import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenderDistribution } from "./GenderDistribution";
import { AgeDemographics } from "./AgeDemographics";
import { EthnicityBreakdown } from "./EthnicityBreakdown";
import { DiversityTrends } from "./DiversityTrends";
import { DiversityPrograms } from "./DiversityPrograms";
import { DiversityGoals } from "./DiversityGoals";

export function DiversityOverview() {
  const [timeRange, setTimeRange] = useState("6m");
  const [department, setDepartment] = useState("all");
  
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <GenderDistribution />
        <AgeDemographics />
        <EthnicityBreakdown />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <DiversityTrends />
        <DiversityPrograms />
      </div>
      
      <DiversityGoals />
    </div>
  );
}
