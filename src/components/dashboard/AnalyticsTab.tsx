import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, LineChart, PieChart, TrendingUp, DollarSign, Users, Building, CheckCircle } from "lucide-react";
import { useFinanceAnalytics } from "@/hooks/finance/useFinanceAnalytics";
import { useState } from "react";

export function AnalyticsTab() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const { data: financeData, isLoading } = useFinanceAnalytics(selectedYear, selectedMonth);
  
  // Format currency values
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  return (
    <div className="space-y-4">
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4">
          {/* Top Clients Section - HR Analytics Style */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-semibold">Top Clients</h3>
              <Badge variant="outline" className="ml-2">By Revenue</Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/20 border-indigo-800/30">
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="h-6 w-3/4 bg-indigo-800/30 rounded animate-pulse"></div>
                      <div className="h-6 w-2/3 bg-indigo-800/30 rounded animate-pulse"></div>
                      <div className="h-6 w-3/4 bg-indigo-800/30 rounded animate-pulse"></div>
                    </div>
                  ) : financeData?.topClients && financeData.topClients.length > 0 ? (
                    <div className="space-y-4">
                      {financeData.topClients.slice(0, 5).map((client, index) => (
                        <div key={index} className="flex items-center justify-between text-white">
                          <div>
                            <p className="font-medium">{client.client_name || 'Unknown Client'}</p>
                            <p className="text-xs text-indigo-200">{client.invoice_count} invoices</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(client.total_revenue)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-indigo-200 py-4">No client data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
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
          
          {/* Top Clients Section - HR Analytics Style */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Top Clients</h3>
              <Badge variant="outline" className="ml-2">By Revenue</Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-800/30">
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="h-6 w-3/4 bg-blue-800/30 rounded animate-pulse"></div>
                      <div className="h-6 w-2/3 bg-blue-800/30 rounded animate-pulse"></div>
                      <div className="h-6 w-3/4 bg-blue-800/30 rounded animate-pulse"></div>
                    </div>
                  ) : financeData?.topClients && financeData.topClients.length > 0 ? (
                    <div className="space-y-4">
                      {financeData.topClients.slice(0, 5).map((client, index) => (
                        <div key={index} className="flex items-center justify-between text-white">
                          <div>
                            <p className="font-medium">{client.client_name || 'Unknown Client'}</p>
                            <p className="text-xs text-blue-200">{client.invoice_count} invoices</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(client.total_revenue)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-blue-200 py-4">No client data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
