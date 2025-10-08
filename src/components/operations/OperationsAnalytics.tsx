import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { industryBreakdownData, placementTrendData } from "./data/operations-data";

export function OperationsAnalytics() {
  const [timeRange, setTimeRange] = useState("6m");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Advanced analytics and insights for operations
        </p>
      </div>
      
      <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="1m">1 Month</TabsTrigger>
          <TabsTrigger value="3m">3 Months</TabsTrigger>
          <TabsTrigger value="6m">6 Months</TabsTrigger>
          <TabsTrigger value="1y">1 Year</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Industry Breakdown</CardTitle>
            <CardDescription>Job orders by industry</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                percentage: {
                  label: "Percentage",
                  color: "#3b82f6",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industryBreakdownData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="percentage"
                    label={({ industry, percentage }) =>
                      `${industry} ${percentage}%`
                    }
                  >
                    {industryBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Weekly Placement Trend</CardTitle>
            <CardDescription>Placements vs target</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                placements: {
                  label: "Placements",
                  color: "#8b5cf6",
                },
                target: {
                  label: "Target",
                  color: "#10b981",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={placementTrendData}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="placements" fill="#8b5cf6" />
                  <Bar dataKey="target" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Key insights from operations data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-1">Fill Rate Optimization</h3>
              <p className="text-sm text-muted-foreground">
                The West region has the lowest fill rate at 85%. Consider reallocating resources or providing additional training to improve performance.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-1">Time to Fill Reduction</h3>
              <p className="text-sm text-muted-foreground">
                Average time to fill has decreased from 14 days to 12 days over the past 6 months, meeting the target. Continue monitoring to maintain this improvement.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-1">Industry Focus</h3>
              <p className="text-sm text-muted-foreground">
                Healthcare and Technology sectors account for 60% of all job orders. Consider developing specialized teams for these industries to further improve fill rates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
