import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Users, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFinanceAnalytics } from "@/hooks/finance/useFinanceAnalytics";
import { useMemo } from "react";

export function RevenueByClient() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const { data: financeData, isLoading, error } = useFinanceAnalytics(currentYear, currentMonth);

  // Process real client data from finance analytics
  const clientData = useMemo(() => {
    if (!financeData?.topClients || financeData.topClients.length === 0) {
      return [];
    }

    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-yellow-500"];
    const totalRevenue = financeData.topClients.reduce((sum, client) => sum + client.revenue, 0);
    
    // Calculate percentages and add colors
    const processedClients = financeData.topClients.slice(0, 5).map((client, index) => ({
      client: client.client_name,
      revenue: client.revenue,
      percentage: totalRevenue > 0 ? (client.revenue / totalRevenue) * 100 : 0,
      color: colors[index] || "bg-gray-500",
      invoiceCount: client.invoices
    }));

    // Calculate "Others" if there are more clients
    const displayedRevenue = processedClients.reduce((sum, client) => sum + client.revenue, 0);
    const othersRevenue = totalRevenue - displayedRevenue;
    
    if (othersRevenue > 0) {
      processedClients.push({
        client: "Others",
        revenue: othersRevenue,
        percentage: (othersRevenue / totalRevenue) * 100,
        color: "bg-gray-400",
        invoiceCount: 0
      });
    }

    return processedClients;
  }, [financeData]);

  const totalRevenue = useMemo(() => {
    return clientData.reduce((sum, client) => sum + client.revenue, 0);
  }, [clientData]);

  const topTwoConcentration = useMemo(() => {
    if (clientData.length >= 2) {
      return clientData[0].percentage + clientData[1].percentage;
    }
    return clientData[0]?.percentage || 0;
  }, [clientData]);

  const formatCurrency = (value: number | undefined | null) => {
    const numValue = Number(value) || 0;
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(1)}M`;
    } else if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(0)}K`;
    }
    return `$${numValue.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading client data...</span>
        </div>
      </div>
    );
  }

  if (error || clientData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {error ? "Failed to load client data" : "No client data available"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Client Revenue List */}
      <div className="space-y-3">
        {clientData.slice(0, 5).map((client, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 ${client.color} rounded-full`}></div>
              <div>
                <div className="font-medium text-sm text-foreground">{client.client}</div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(client.revenue)} revenue
                  {client.invoiceCount > 0 && ` • ${client.invoiceCount} invoices`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm text-foreground">{client.percentage.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">of total</div>
            </div>
          </div>
        ))}
      </div>

      {/* Concentration Risk Analysis */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Concentration Risk</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-orange-700 dark:text-orange-300">Top 2 clients</span>
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
              {topTwoConcentration.toFixed(1)}%
            </Badge>
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400">
            High dependency on top clients. Consider diversification strategies.
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">
            {financeData?.topClients?.length || 0}
          </div>
          <div className="text-xs text-muted-foreground">Active Clients</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{formatCurrency(totalRevenue)}</div>
          <div className="text-xs text-muted-foreground">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-lg font-semibold text-foreground">
              {financeData?.topClients?.length ? formatCurrency(totalRevenue / financeData.topClients.length) : '$0'}
            </span>
            <TrendingUp className="h-3 w-3 text-green-500" />
          </div>
          <div className="text-xs text-muted-foreground">Avg per Client</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Client Portfolio</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs"
          onClick={() => navigate('/finance/client-revenue')}
        >
          View All Clients <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </div>

      {/* Strategic Insights */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Growth Opportunities</span>
        </div>
        <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
          <p>• Focus on expanding mid-tier clients (8-12% range)</p>
          <p>• Develop new client acquisition strategies</p>
          <p>• Consider upselling to existing smaller clients</p>
        </div>
      </div>
    </div>
  );
}
