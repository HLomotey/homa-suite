import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { jobOrderData } from "../data/operations-data";

export function JobOrdersTrendDetail() {
  const [timeRange, setTimeRange] = useState("6m");
  const [viewType, setViewType] = useState("monthly");
  
  // Extended data for detailed view
  const extendedJobOrderData = [
    { month: "Jan", total: 298, filled: 267, pending: 31, cancelled: 0, fillRate: 89.6 },
    { month: "Feb", total: 312, filled: 278, pending: 34, cancelled: 0, fillRate: 89.1 },
    { month: "Mar", total: 285, filled: 251, pending: 34, cancelled: 0, fillRate: 88.1 },
    { month: "Apr", total: 334, filled: 295, pending: 39, cancelled: 0, fillRate: 88.3 },
    { month: "May", total: 356, filled: 312, pending: 44, cancelled: 0, fillRate: 87.6 },
    { month: "Jun", total: 342, filled: 298, pending: 44, cancelled: 0, fillRate: 87.1 },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job Orders Trend Analysis</h1>
        <p className="text-muted-foreground">
          Detailed breakdown of job orders over time
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
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-background border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Job Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,927</div>
            <div className="text-xs text-muted-foreground mt-1">
              +8.3% from previous period
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filled Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,701</div>
            <div className="text-xs text-muted-foreground mt-1">
              88.3% fill rate
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">226</div>
            <div className="text-xs text-muted-foreground mt-1">
              11.7% of total orders
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Job Orders Trend</CardTitle>
          <CardDescription>Monthly job orders: total, filled, and pending</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              total: {
                label: "Total Orders",
                color: "#3b82f6",
              },
              filled: {
                label: "Filled Orders",
                color: "#10b981",
              },
              pending: {
                label: "Pending Orders",
                color: "#f59e0b",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobOrderData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="#3b82f6" />
                <Bar dataKey="filled" fill="#10b981" />
                <Bar dataKey="pending" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Job Orders Details</CardTitle>
          <CardDescription>Detailed breakdown by period</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Total Orders</TableHead>
                <TableHead className="text-right">Filled Orders</TableHead>
                <TableHead className="text-right">Pending Orders</TableHead>
                <TableHead className="text-right">Fill Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extendedJobOrderData.map((item) => (
                <TableRow key={item.month}>
                  <TableCell className="font-medium">{item.month}</TableCell>
                  <TableCell className="text-right">{item.total}</TableCell>
                  <TableCell className="text-right">{item.filled}</TableCell>
                  <TableCell className="text-right">{item.pending}</TableCell>
                  <TableCell className="text-right">{item.fillRate}%</TableCell>
                  <TableCell>
                    <Badge variant={item.fillRate >= 89 ? "outline" : "secondary"}>
                      {item.fillRate >= 89 ? "On Target" : "Below Target"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
