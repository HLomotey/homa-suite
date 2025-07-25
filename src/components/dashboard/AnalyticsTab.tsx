import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, LineChart, PieChart, TrendingUp } from "lucide-react";

export function AnalyticsTab() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
                <CardDescription>Monthly revenue growth across all departments</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <div className="text-center space-y-2">
                  <LineChart className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Revenue growth chart</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Performance metrics by department</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Department performance chart</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Detailed breakdown of company KPIs</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
              <div className="text-center space-y-2">
                <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">KPI metrics visualization</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Employee Growth</CardTitle>
                <CardDescription>Headcount trends over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <div className="text-center space-y-2">
                  <LineChart className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Employee growth chart</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Job Order Trends</CardTitle>
                <CardDescription>Job order volume and fill rate trends</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Job order trends chart</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Department</CardTitle>
                <CardDescription>Comparative revenue analysis</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <div className="text-center space-y-2">
                  <PieChart className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Revenue distribution chart</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Year-over-Year Comparison</CardTitle>
                <CardDescription>Performance comparison with previous years</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">YoY comparison chart</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
