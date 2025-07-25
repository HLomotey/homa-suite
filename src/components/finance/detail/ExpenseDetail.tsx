import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function ExpenseDetail() {
  const [timeRange, setTimeRange] = useState("6m");
  
  const expenseCategories = [
    { category: "Salaries", amount: 580000, percentage: 50, change: 3.5 },
    { category: "Operations", amount: 290000, percentage: 25, change: 2.1 },
    { category: "Marketing", amount: 174000, percentage: 15, change: 8.7 },
    { category: "Office Supplies", amount: 58000, percentage: 5, change: -1.2 },
    { category: "Software & Tools", amount: 34800, percentage: 3, change: 12.5 },
    { category: "Travel", amount: 23200, percentage: 2, change: -15.3 }
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expense Analysis</h1>
        <p className="text-muted-foreground">
          Detailed breakdown of expenses by category and department
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
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>Expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for expense distribution chart */}
            <div className="h-[300px] w-full rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 flex items-center justify-center">
              <span className="text-muted-foreground">Expense Distribution Chart</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Expense Trends</CardTitle>
            <CardDescription>Monthly expense trends by category</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for expense trends chart */}
            <div className="h-[300px] w-full rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 flex items-center justify-center">
              <span className="text-muted-foreground">Expense Trends Chart</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>Detailed breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
                <TableHead className="text-right">YoY Change</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseCategories.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="text-right">${item.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.percentage}%</TableCell>
                  <TableCell className={`text-right ${item.change <= 0 ? "text-green-500" : "text-red-500"}`}>
                    {item.change > 0 ? "+" : ""}{item.change}%
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.change <= 0 ? "outline" : "secondary"}>
                      {item.change <= 0 ? "Decreasing" : "Increasing"}
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
          <CardTitle>Cost Optimization Opportunities</CardTitle>
          <CardDescription>Potential areas for expense reduction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-1">Software & Tools Consolidation</h3>
              <p className="text-sm text-muted-foreground">
                Potential savings of $8,500 by consolidating duplicate software subscriptions and negotiating enterprise rates.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-1">Remote Work Policy</h3>
              <p className="text-sm text-muted-foreground">
                Potential savings of $12,000 in office expenses by implementing a hybrid work policy.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-1">Marketing Spend Optimization</h3>
              <p className="text-sm text-muted-foreground">
                Potential savings of $25,000 by focusing on higher ROI marketing channels and reducing spend on underperforming campaigns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
