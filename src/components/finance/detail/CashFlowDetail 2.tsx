import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function CashFlowDetail() {
  const [timeRange, setTimeRange] = useState("6m");
  const [viewType, setViewType] = useState("weekly");
  
  const cashFlowData = [
    { week: "Week 1", inflow: 125000, outflow: 95000, balance: 30000 },
    { week: "Week 2", inflow: 140000, outflow: 85000, balance: 55000 },
    { week: "Week 3", inflow: 95000, outflow: 110000, balance: -15000 },
    { week: "Week 4", inflow: 130000, outflow: 100000, balance: 30000 },
    { week: "Week 5", inflow: 110000, outflow: 90000, balance: 20000 },
    { week: "Week 6", inflow: 135000, outflow: 105000, balance: 30000 }
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cash Flow Analysis</h1>
        <p className="text-muted-foreground">
          Detailed breakdown of cash inflows and outflows
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
            <CardTitle className="text-sm font-medium">Total Cash Inflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$735,000</div>
            <div className="text-xs text-muted-foreground mt-1">
              +8.5% from previous period
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cash Outflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$585,000</div>
            <div className="text-xs text-muted-foreground mt-1">
              +3.2% from previous period
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">$150,000</div>
            <div className="text-xs text-muted-foreground mt-1">
              +15.4% from previous period
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Cash Flow Trend</CardTitle>
          <CardDescription>Weekly cash inflow vs outflow</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for cash flow trend chart */}
          <div className="h-[300px] w-full rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 flex items-center justify-center">
            <span className="text-muted-foreground">Cash Flow Trend Chart</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Cash Flow Details</CardTitle>
          <CardDescription>Detailed breakdown by period</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Cash Inflow</TableHead>
                <TableHead className="text-right">Cash Outflow</TableHead>
                <TableHead className="text-right">Net Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashFlowData.map((item) => (
                <TableRow key={item.week}>
                  <TableCell className="font-medium">{item.week}</TableCell>
                  <TableCell className="text-right">${item.inflow.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${item.outflow.toLocaleString()}</TableCell>
                  <TableCell className={`text-right ${item.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                    ${Math.abs(item.balance).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.balance >= 0 ? "outline" : "destructive"}>
                      {item.balance >= 0 ? "Positive" : "Negative"}
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
