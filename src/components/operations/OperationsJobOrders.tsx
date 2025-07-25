import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { jobOrderData } from "./data/operations-data";

export function OperationsJobOrders() {
  const [timeRange, setTimeRange] = useState("6m");
  
  const jobOrders = [
    { id: "JO-2023-001", client: "Acme Corp", position: "Software Engineer", status: "filled", date: "2023-06-15", timeToFill: 9 },
    { id: "JO-2023-002", client: "Globex Inc", position: "Project Manager", status: "filled", date: "2023-06-18", timeToFill: 14 },
    { id: "JO-2023-003", client: "Initech", position: "Data Analyst", status: "pending", date: "2023-06-20", timeToFill: null },
    { id: "JO-2023-004", client: "Stark Industries", position: "UX Designer", status: "filled", date: "2023-06-22", timeToFill: 11 },
    { id: "JO-2023-005", client: "Wayne Enterprises", position: "Marketing Specialist", status: "pending", date: "2023-06-25", timeToFill: null },
    { id: "JO-2023-006", client: "Umbrella Corp", position: "HR Manager", status: "filled", date: "2023-06-28", timeToFill: 8 },
    { id: "JO-2023-007", client: "Cyberdyne Systems", position: "Systems Analyst", status: "pending", date: "2023-06-30", timeToFill: null },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job Orders</h1>
        <p className="text-muted-foreground">
          Manage and track all job orders and their statuses
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
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Job Orders Summary</CardTitle>
          <CardDescription>Overview of job orders for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-md">
              <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
              <div className="text-2xl font-bold">342</div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="text-sm font-medium text-muted-foreground">Filled Orders</div>
              <div className="text-2xl font-bold text-green-600">298</div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="text-sm font-medium text-muted-foreground">Pending Orders</div>
              <div className="text-2xl font-bold text-orange-600">44</div>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Order ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Time to Fill (days)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.client}</TableCell>
                  <TableCell>{order.position}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "filled" ? "outline" : "secondary"}>
                      {order.status === "filled" ? "Filled" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {order.timeToFill !== null ? order.timeToFill : "-"}
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
