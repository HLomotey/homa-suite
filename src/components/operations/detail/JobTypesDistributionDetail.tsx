import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { jobTypeData } from "../data/operations-data";

export function JobTypesDistributionDetail() {
  const [timeRange, setTimeRange] = useState("6m");
  const [viewType, setViewType] = useState("distribution");
  
  // Extended data for detailed view
  const jobTypeDetailData = [
    { 
      type: "Full-time", 
      count: 215, 
      percentage: 63, 
      fillRate: 89, 
      avgTimeToFill: 13,
      color: "#3b82f6"
    },
    { 
      type: "Contract", 
      count: 76, 
      percentage: 22, 
      fillRate: 92, 
      avgTimeToFill: 10,
      color: "#ef4444"
    },
    { 
      type: "Part-time", 
      count: 34, 
      percentage: 10, 
      fillRate: 85, 
      avgTimeToFill: 11,
      color: "#10b981"
    },
    { 
      type: "Temporary", 
      count: 17, 
      percentage: 5, 
      fillRate: 94, 
      avgTimeToFill: 8,
      color: "#f59e0b"
    },
  ];
  
  // Monthly trend data by job type
  const monthlyTrendData = [
    { month: "Jan", "Full-time": 198, "Contract": 65, "Part-time": 28, "Temporary": 12 },
    { month: "Feb", "Full-time": 205, "Contract": 68, "Part-time": 30, "Temporary": 14 },
    { month: "Mar", "Full-time": 187, "Contract": 62, "Part-time": 27, "Temporary": 12 },
    { month: "Apr", "Full-time": 210, "Contract": 70, "Part-time": 32, "Temporary": 15 },
    { month: "May", "Full-time": 218, "Contract": 72, "Part-time": 33, "Temporary": 16 },
    { month: "Jun", "Full-time": 215, "Contract": 76, "Part-time": 34, "Temporary": 17 },
  ];
  
  // Industry breakdown by job type
  const industryBreakdown = [
    { industry: "Technology", "Full-time": 68, "Contract": 32, "Part-time": 8, "Temporary": 4 },
    { industry: "Healthcare", "Full-time": 54, "Contract": 15, "Part-time": 12, "Temporary": 6 },
    { industry: "Finance", "Full-time": 42, "Contract": 10, "Part-time": 5, "Temporary": 2 },
    { industry: "Manufacturing", "Full-time": 25, "Contract": 8, "Part-time": 3, "Temporary": 1 },
    { industry: "Retail", "Full-time": 18, "Contract": 6, "Part-time": 4, "Temporary": 3 },
    { industry: "Other", "Full-time": 8, "Contract": 5, "Part-time": 2, "Temporary": 1 },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job Types Analysis</h1>
        <p className="text-muted-foreground">
          Detailed breakdown of job orders by type
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="1m">1 Month</TabsTrigger>
            <TabsTrigger value="3m">3 Months</TabsTrigger>
            <TabsTrigger value="6m">6 Months</TabsTrigger>
            <TabsTrigger value="1y">1 Year</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Tabs value={viewType} onValueChange={setViewType} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="trend">Trend</TabsTrigger>
            <TabsTrigger value="industry">Industry</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Job Type Distribution</CardTitle>
            <CardDescription>Current distribution of job orders by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Count",
                  color: "#3b82f6",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ type, percent }) =>
                      `${type} ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                  >
                    {jobTypeData.map((entry, index) => (
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
            <CardTitle>Job Type Metrics</CardTitle>
            <CardDescription>Performance metrics by job type</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Type</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Fill Rate (%)</TableHead>
                  <TableHead className="text-right">Avg Time to Fill</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobTypeDetailData.map((item) => (
                  <TableRow key={item.type}>
                    <TableCell className="font-medium">{item.type}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                    <TableCell className="text-right">{item.fillRate}%</TableCell>
                    <TableCell className="text-right">{item.avgTimeToFill} days</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <TabsContent value="trend" className="mt-0">
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Monthly Job Type Trend</CardTitle>
            <CardDescription>6-month trend by job type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                "Full-time": {
                  label: "Full-time",
                  color: "#3b82f6",
                },
                "Contract": {
                  label: "Contract",
                  color: "#ef4444",
                },
                "Part-time": {
                  label: "Part-time",
                  color: "#10b981",
                },
                "Temporary": {
                  label: "Temporary",
                  color: "#f59e0b",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="Full-time" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Contract" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Part-time" stackId="a" fill="#10b981" />
                  <Bar dataKey="Temporary" stackId="a" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="industry" className="mt-0">
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Industry Breakdown by Job Type</CardTitle>
            <CardDescription>Distribution across industries</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Industry</TableHead>
                  <TableHead className="text-right">Full-time</TableHead>
                  <TableHead className="text-right">Contract</TableHead>
                  <TableHead className="text-right">Part-time</TableHead>
                  <TableHead className="text-right">Temporary</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {industryBreakdown.map((item) => (
                  <TableRow key={item.industry}>
                    <TableCell className="font-medium">{item.industry}</TableCell>
                    <TableCell className="text-right">{item["Full-time"]}</TableCell>
                    <TableCell className="text-right">{item["Contract"]}</TableCell>
                    <TableCell className="text-right">{item["Part-time"]}</TableCell>
                    <TableCell className="text-right">{item["Temporary"]}</TableCell>
                    <TableCell className="text-right font-medium">
                      {item["Full-time"] + item["Contract"] + item["Part-time"] + item["Temporary"]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Job Type Insights</CardTitle>
          <CardDescription>Key observations and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-1">Contract Position Efficiency</h3>
              <p className="text-sm text-muted-foreground">
                Contract positions show the highest fill rate (92%) and second-fastest time to fill (10 days). Consider expanding contract offerings for clients with urgent needs.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-1">Technology Sector Focus</h3>
              <p className="text-sm text-muted-foreground">
                Technology sector accounts for the highest number of job orders across all types (112 total). Recommend increasing recruiter specialization in this sector to maintain competitive advantage.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-1">Part-time Improvement Opportunity</h3>
              <p className="text-sm text-muted-foreground">
                Part-time positions have the lowest fill rate (85%). Analyze candidate pool and client requirements to identify gaps and improve matching algorithms for this job type.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
