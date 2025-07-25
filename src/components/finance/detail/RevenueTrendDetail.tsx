import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export function RevenueTrendDetail() {
  const [timeRange, setTimeRange] = useState("6m");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Revenue & Profit Analysis</h1>
        <p className="text-muted-foreground">
          Detailed breakdown of revenue, expenses, and profit trends
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
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Revenue by product or service category</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for revenue breakdown chart */}
            <div className="h-[300px] w-full rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 flex items-center justify-center">
              <span className="text-muted-foreground">Revenue Breakdown Chart</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Profit Margins</CardTitle>
            <CardDescription>Gross, operating, and net profit margins</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for profit margins chart */}
            <div className="h-[300px] w-full rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 flex items-center justify-center">
              <span className="text-muted-foreground">Profit Margins Chart</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Monthly Trend Analysis</CardTitle>
          <CardDescription>Revenue and profit trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for trend analysis chart */}
          <div className="h-[400px] w-full rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 flex items-center justify-center">
            <span className="text-muted-foreground">Trend Analysis Chart</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
