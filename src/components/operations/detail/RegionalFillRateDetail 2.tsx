import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { fillRateData } from "../data/operations-data";

export function RegionalFillRateDetail() {
  const [timeRange, setTimeRange] = useState("6m");
  
  // Extended data for detailed view
  const extendedFillRateData = [
    { 
      region: "East", 
      fillRate: 92, 
      placements: 487, 
      orders: 529, 
      timeToFill: 11, 
      clientSatisfaction: 4.8,
      topPerformer: "Emily Johnson"
    },
    { 
      region: "West", 
      fillRate: 85, 
      placements: 398, 
      orders: 468, 
      timeToFill: 14, 
      clientSatisfaction: 4.5,
      topPerformer: "Michael Chen"
    },
    { 
      region: "North", 
      fillRate: 89, 
      placements: 356, 
      orders: 400, 
      timeToFill: 12, 
      clientSatisfaction: 4.7,
      topPerformer: "Sarah Williams"
    },
    { 
      region: "South", 
      fillRate: 88, 
      placements: 422, 
      orders: 480, 
      timeToFill: 13, 
      clientSatisfaction: 4.6,
      topPerformer: "David Rodriguez"
    },
    { 
      region: "Central", 
      fillRate: 86, 
      placements: 301, 
      orders: 350, 
      timeToFill: 13, 
      clientSatisfaction: 4.5,
      topPerformer: "Jessica Thompson"
    },
  ];
  
  // Monthly trend data by region
  const monthlyTrendData = [
    { month: "Jan", East: 91, West: 83, North: 88, South: 87, Central: 85 },
    { month: "Feb", East: 90, West: 84, North: 87, South: 86, Central: 84 },
    { month: "Mar", East: 92, West: 84, North: 89, South: 87, Central: 85 },
    { month: "Apr", East: 91, West: 85, North: 88, South: 87, Central: 85 },
    { month: "May", East: 93, West: 85, North: 90, South: 88, Central: 86 },
    { month: "Jun", East: 92, West: 85, North: 89, South: 88, Central: 86 },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Regional Fill Rate Analysis</h1>
        <p className="text-muted-foreground">
          Detailed breakdown of fill rates by region
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Fill Rate by Region</CardTitle>
            <CardDescription>Current fill rate percentages</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                fillRate: {
                  label: "Fill Rate (%)",
                  color: "#8b5cf6",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fillRateData}>
                  <XAxis dataKey="region" />
                  <YAxis domain={[80, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="fillRate" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Monthly Fill Rate Trend</CardTitle>
            <CardDescription>6-month trend by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                East: {
                  label: "East",
                  color: "#3b82f6",
                },
                West: {
                  label: "West",
                  color: "#ef4444",
                },
                North: {
                  label: "North",
                  color: "#10b981",
                },
                South: {
                  label: "South",
                  color: "#f59e0b",
                },
                Central: {
                  label: "Central",
                  color: "#8b5cf6",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData}>
                  <XAxis dataKey="month" />
                  <YAxis domain={[80, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="East" fill="#3b82f6" />
                  <Bar dataKey="West" fill="#ef4444" />
                  <Bar dataKey="North" fill="#10b981" />
                  <Bar dataKey="South" fill="#f59e0b" />
                  <Bar dataKey="Central" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Regional Performance Details</CardTitle>
          <CardDescription>Comprehensive metrics by region</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Fill Rate (%)</TableHead>
                <TableHead className="text-right">Placements</TableHead>
                <TableHead className="text-right">Total Orders</TableHead>
                <TableHead className="text-right">Time to Fill (days)</TableHead>
                <TableHead className="text-right">Client Satisfaction</TableHead>
                <TableHead>Top Performer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extendedFillRateData.map((region) => (
                <TableRow key={region.region}>
                  <TableCell className="font-medium">{region.region}</TableCell>
                  <TableCell className="text-right">{region.fillRate}%</TableCell>
                  <TableCell className="text-right">{region.placements}</TableCell>
                  <TableCell className="text-right">{region.orders}</TableCell>
                  <TableCell className="text-right">{region.timeToFill}</TableCell>
                  <TableCell className="text-right">{region.clientSatisfaction}</TableCell>
                  <TableCell>{region.topPerformer}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Regional Insights</CardTitle>
          <CardDescription>Key observations and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-1">East Region Performance</h3>
              <p className="text-sm text-muted-foreground">
                The East region consistently maintains the highest fill rate at 92% with the shortest time to fill (11 days). Consider documenting their best practices for implementation across other regions.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-1">West Region Improvement Plan</h3>
              <p className="text-sm text-muted-foreground">
                The West region has the lowest fill rate (85%) and longest time to fill (14 days). Recommend additional training and resource allocation to improve performance metrics.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-1">Overall Trend</h3>
              <p className="text-sm text-muted-foreground">
                All regions show slight improvement or stability in fill rates over the past 6 months, indicating that current strategies are effective but there is room for optimization in specific regions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
