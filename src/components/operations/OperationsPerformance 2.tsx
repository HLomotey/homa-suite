import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { regionPerformanceData, topPerformersData, clientSatisfactionData } from "./data/operations-data";

export function OperationsPerformance() {
  const [timeRange, setTimeRange] = useState("6m");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Performance Metrics</h1>
        <p className="text-muted-foreground">
          Detailed performance metrics by region and individual
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
            <CardTitle>Regional Performance</CardTitle>
            <CardDescription>Performance metrics by region</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-right">Fill Rate (%)</TableHead>
                  <TableHead className="text-right">Time to Fill (days)</TableHead>
                  <TableHead className="text-right">Client Satisfaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionPerformanceData.map((region) => (
                  <TableRow key={region.region}>
                    <TableCell className="font-medium">{region.region}</TableCell>
                    <TableCell className="text-right">{region.fillRate}%</TableCell>
                    <TableCell className="text-right">{region.timeToFill}</TableCell>
                    <TableCell className="text-right">{region.clientSatisfaction}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Client Satisfaction Trend</CardTitle>
            <CardDescription>Monthly client satisfaction scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                score: {
                  label: "Satisfaction Score",
                  color: "#8b5cf6",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientSatisfactionData}>
                  <XAxis dataKey="month" />
                  <YAxis domain={[4, 5]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Recruiters with highest placement rates</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Placements</TableHead>
                <TableHead className="text-right">Fill Rate (%)</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformersData.map((performer) => (
                <TableRow key={performer.name}>
                  <TableCell className="font-medium">{performer.name}</TableCell>
                  <TableCell>{performer.region}</TableCell>
                  <TableCell className="text-right">{performer.placements}</TableCell>
                  <TableCell className="text-right">{performer.fillRate}%</TableCell>
                  <TableCell>
                    <Badge variant={performer.fillRate >= 90 ? "outline" : "secondary"}>
                      {performer.fillRate >= 90 ? "Excellent" : "Good"}
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
