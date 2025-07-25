import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { timeToFillData } from "../data/operations-data";

export function TimeToFillTrendDetail() {
  const [timeRange, setTimeRange] = useState("6m");
  
  // Extended data for detailed view
  const extendedTimeToFillData = [
    { month: "Jan", avgDays: 14, target: 12, byRegion: { East: 11, West: 16, North: 14, South: 15, Central: 14 } },
    { month: "Feb", avgDays: 14, target: 12, byRegion: { East: 12, West: 16, North: 14, South: 14, Central: 14 } },
    { month: "Mar", avgDays: 13, target: 12, byRegion: { East: 11, West: 15, North: 13, South: 14, Central: 13 } },
    { month: "Apr", avgDays: 13, target: 12, byRegion: { East: 11, West: 15, North: 13, South: 13, Central: 13 } },
    { month: "May", avgDays: 12, target: 12, byRegion: { East: 10, West: 14, North: 12, South: 13, Central: 13 } },
    { month: "Jun", avgDays: 12, target: 12, byRegion: { East: 11, West: 14, North: 12, South: 13, Central: 12 } },
  ];
  
  // Data by job type
  const timeToFillByJobType = [
    { jobType: "Software Development", avgDays: 14, volume: 128, trend: "stable" },
    { jobType: "Healthcare", avgDays: 10, volume: 97, trend: "decreasing" },
    { jobType: "Finance", avgDays: 13, volume: 76, trend: "stable" },
    { jobType: "Sales", avgDays: 9, volume: 65, trend: "decreasing" },
    { jobType: "Administrative", avgDays: 8, volume: 54, trend: "decreasing" },
    { jobType: "Engineering", avgDays: 15, volume: 48, trend: "increasing" },
    { jobType: "Marketing", avgDays: 11, volume: 42, trend: "stable" },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Time to Fill Analysis</h1>
        <p className="text-muted-foreground">
          Detailed breakdown of time to fill metrics
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-background border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Avg Time to Fill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 days</div>
            <div className="text-xs text-green-600 mt-1">
              On target
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">6-Month Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-2 days</div>
            <div className="text-xs text-muted-foreground mt-1">
              14.3% reduction
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Performing Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">East</div>
            <div className="text-xs text-muted-foreground mt-1">
              11 days average
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Time to Fill Trend</CardTitle>
          <CardDescription>Monthly average vs target</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              avgDays: {
                label: "Avg Days",
                color: "#ef4444",
              },
              target: {
                label: "Target",
                color: "#10b981",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeToFillData}>
                <XAxis dataKey="month" />
                <YAxis domain={[8, 16]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="avgDays"
                  stroke="#ef4444"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Time to Fill by Job Type</CardTitle>
            <CardDescription>Average days by job category</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Type</TableHead>
                  <TableHead className="text-right">Avg Days</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeToFillByJobType.map((item) => (
                  <TableRow key={item.jobType}>
                    <TableCell className="font-medium">{item.jobType}</TableCell>
                    <TableCell className="text-right">{item.avgDays}</TableCell>
                    <TableCell className="text-right">{item.volume}</TableCell>
                    <TableCell>
                      <Badge variant={
                        item.trend === "decreasing" ? "outline" : 
                        item.trend === "increasing" ? "destructive" : 
                        "secondary"
                      }>
                        {item.trend === "decreasing" ? "Improving" : 
                         item.trend === "increasing" ? "Worsening" : 
                         "Stable"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Regional Breakdown</CardTitle>
            <CardDescription>Time to fill by region (current month)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-right">Avg Days</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">East</TableCell>
                  <TableCell className="text-right">11</TableCell>
                  <TableCell>
                    <Badge variant="outline">Exceeding Target</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">West</TableCell>
                  <TableCell className="text-right">14</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Below Target</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">North</TableCell>
                  <TableCell className="text-right">12</TableCell>
                  <TableCell>
                    <Badge variant="outline">On Target</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">South</TableCell>
                  <TableCell className="text-right">13</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Near Target</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Central</TableCell>
                  <TableCell className="text-right">12</TableCell>
                  <TableCell>
                    <Badge variant="outline">On Target</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
