import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export function ClientRevenueDetail() {
  const [timeRange, setTimeRange] = useState("6m");
  
  const clients = [
    { name: "Acme Inc.", revenue: 750000, growth: 12.5, projects: 8 },
    { name: "Globex", revenue: 620000, growth: 8.3, projects: 5 },
    { name: "Initech", revenue: 480000, growth: -2.1, projects: 6 },
    { name: "Umbrella Co.", revenue: 350000, growth: 15.7, projects: 4 },
    { name: "Stark Industries", revenue: 280000, growth: 5.2, projects: 3 },
    { name: "Wayne Enterprises", revenue: 210000, growth: 3.8, projects: 2 },
    { name: "Cyberdyne Systems", revenue: 180000, growth: -1.5, projects: 2 },
    { name: "Oscorp", revenue: 150000, growth: 7.3, projects: 1 }
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Client Revenue Analysis</h1>
        <p className="text-muted-foreground">
          Detailed breakdown of revenue by client and client performance metrics
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Revenue distribution by client</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for client revenue distribution chart */}
            <div className="h-[300px] w-full rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 flex items-center justify-center">
              <span className="text-muted-foreground">Client Revenue Distribution Chart</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Client Growth</CardTitle>
            <CardDescription>Year-over-year revenue growth by client</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for client growth chart */}
            <div className="h-[300px] w-full rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 flex items-center justify-center">
              <span className="text-muted-foreground">Client Growth Chart</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Client Revenue Details</CardTitle>
          <CardDescription>Detailed revenue breakdown by client</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Growth</TableHead>
                <TableHead className="text-center">Projects</TableHead>
                <TableHead className="text-right">Avg. Project Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.name}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-right">${client.revenue.toLocaleString()}</TableCell>
                  <TableCell className={`text-right ${client.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {client.growth >= 0 ? "+" : ""}{client.growth}%
                  </TableCell>
                  <TableCell className="text-center">{client.projects}</TableCell>
                  <TableCell className="text-right">
                    ${Math.round(client.revenue / client.projects).toLocaleString()}
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
