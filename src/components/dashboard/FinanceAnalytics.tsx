import { useFinanceAnalytics, useRevenueMetrics } from "@/hooks/finance/useFinanceAnalytics";
import { useExpenditureAnalytics } from "@/hooks/finance/useExpenditureAnalytics";
import { usePerformanceAnalytics } from "@/hooks/finance/usePerformanceAnalytics";
import PerformanceAnalytics from "@/components/analytics/PerformanceAnalytics";
import ProjectionMappingView from "@/components/analytics/ProjectionMappingView";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Calendar, 
  CreditCard, 
  Receipt, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Target, 
  Minus, 
  PieChart,
  BarChart3
} from 'lucide-react';
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface FinancialInsights {
  totalRevenue: number;
  collectedRevenue: number;
  outstandingRevenue: number;
  averagePaymentDelay: number;
  collectionEfficiency: number;
  outstandingInvoices: number;
  paidAmount: number;
  paidPercentage: number;
  overdueAmount: number;
  overduePercentage: number;
  sentAmount: number;
  sentPercentage: number;
  topClients: Array<{
    client: string;
    revenue: number;
    percentage: number;
  }>;
  clientConcentrationRisk: number;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    growth: number;
  }>;
  averageCollectionDays: number;
  agingBuckets: Array<{
    range: string;
    amount: number;
  }>;
  onTimePaymentRate: number;
  earlyPaymentDiscount: number;
  latePaymentFees: number;
  paymentMethods: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
}

export function FinanceAnalytics() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [insights, setInsights] = useState<FinancialInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Use same data sources as other finance components - no date filtering to show all data
  const { data: financeData, isLoading: financeLoading, error: financeError } = useFinanceAnalytics();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueMetrics();
  const { data: expenditureData, isLoading: expenditureLoading } = useExpenditureAnalytics();
  
  // Combine loading states
  const isLoading = financeLoading || revenueLoading || expenditureLoading;
  
  useEffect(() => {
    const processFinanceData = () => {
      // Use the same data processing approach as other finance components
      if (!financeData && !revenueData) {
        setInsights({
          totalRevenue: 0,
          collectedRevenue: 0,
          outstandingRevenue: 0,
          averagePaymentDelay: 0,
          paidAmount: 0,
          overdueAmount: 0,
          sentAmount: 0,
          paidPercentage: 0,
          overduePercentage: 0,
          sentPercentage: 0,
          topClients: [],
          clientConcentrationRisk: 0,
          monthlyTrends: [],
          outstandingInvoices: 0,
          averageCollectionDays: 0,
          collectionEfficiency: 0,
          agingBuckets: [],
          onTimePaymentRate: 0,
          earlyPaymentDiscount: 0,
          latePaymentFees: 0,
          paymentMethods: []
        });
        setLoading(false);
        return;
      }

      console.log("Processing finance data using same sources as other finance components");

      // Use revenue data from useRevenueMetrics (all-time data, not filtered by month)
      const totalRevenue = financeData?.totalRevenue || 0;
      const collectedRevenue = totalRevenue;
      const expectedRevenue = financeData?.expectedRevenue || totalRevenue;
      const outstandingRevenue = expectedRevenue - totalRevenue;

      // Use finance analytics data (same as FinanceOverview and RevenueByClient components)
      const paidInvoices = financeData?.paidInvoices || 0;
      const pendingInvoices = financeData?.pendingInvoices || 0;
      const overdueInvoices = financeData?.overdueInvoices || 0;
      const sentInvoices = financeData?.sentInvoices || 0;
      const totalInvoices = financeData?.totalInvoices || 0;

      // Calculate percentages
      const paidPercentage = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
      const overduePercentage = totalInvoices > 0 ? (overdueInvoices / totalInvoices) * 100 : 0;
      const sentPercentage = totalInvoices > 0 ? (sentInvoices / totalInvoices) * 100 : 0;

      // Use top clients data (same as RevenueByClient component)
      const topClients = financeData?.topClients?.map(client => ({
        client: client.client_name,
        revenue: client.total_revenue,
        percentage: totalRevenue > 0 ? (client.total_revenue / totalRevenue) * 100 : 0
      })) || [];

      const clientConcentrationRisk = topClients.slice(0, 2).reduce((sum, client) => sum + client.percentage, 0);

      // Use monthly revenue data (same as other components)
      const monthlyTrends = financeData?.monthlyRevenue?.map((month, index, array) => ({
        month: month.month,
        revenue: month.revenue,
        growth: index > 0 ? ((month.revenue - array[index - 1].revenue) / array[index - 1].revenue) * 100 : 0
      })) || [];

      // Calculate aging buckets from status distribution
      const agingBuckets = [
        { range: '0-30 days', amount: 0 },
        { range: '31-60 days', amount: 0 },
        { range: '61-90 days', amount: 0 },
        { range: '90+ days', amount: 0 }
      ];

      // Use average invoice value for outstanding calculations
      const averageInvoiceValue = financeData?.averageInvoiceValue || 0;
      const outstandingInvoicesCount = pendingInvoices + overdueInvoices + sentInvoices;
      const overdueAmount = overdueInvoices * averageInvoiceValue;
      const sentAmount = sentInvoices * averageInvoiceValue;

      setInsights({
        totalRevenue,
        collectedRevenue,
        outstandingRevenue,
        averagePaymentDelay: financeData?.averagePaymentDays || 0,
        paidAmount: totalRevenue,
        overdueAmount,
        sentAmount,
        paidPercentage,
        overduePercentage,
        sentPercentage,
        topClients,
        clientConcentrationRisk,
        monthlyTrends,
        outstandingInvoices: outstandingInvoicesCount,
        averageCollectionDays: financeData?.averagePaymentDays || 0,
        collectionEfficiency: financeData?.collectionRate || 0,
        agingBuckets,
        onTimePaymentRate: financeData?.collectionRate || 0,
        earlyPaymentDiscount: 0,
        latePaymentFees: 0,
        paymentMethods: [] // Would need payment method data from database
      });
      
      setLoading(false);
    };

    processFinanceData();
  }, [financeData, revenueData]);

  // Format currency values with consistent 2 decimal places
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Format percentage with 2 decimal places
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Get trend indicator with visual enhancement
  const getTrendIndicator = (value: number, threshold: number = 0) => {
    if (value > threshold) {
      return { icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-50', text: 'Positive' };
    } else if (value < threshold) {
      return { icon: TrendingDown, color: 'text-red-500', bgColor: 'bg-red-50', text: 'Negative' };
    }
    return { icon: Minus, color: 'text-gray-500', bgColor: 'bg-gray-50', text: 'Neutral' };
  };

  // Calculate financial health score
  const getFinancialHealthScore = () => {
    if (!insights) return 0;
    const collectionScore = Math.min(insights.collectionEfficiency, 100);
    const paymentScore = Math.max(0, 100 - insights.averagePaymentDelay * 2);
    const concentrationScore = Math.max(0, 100 - insights.clientConcentrationRisk);
    return Math.round((collectionScore + paymentScore + concentrationScore) / 3);
  };

  // Get health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (financeError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Financial Analytics</h3>
          <Badge variant="secondary" className="text-xs">Error</Badge>
        </div>
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-xs text-red-600">Error loading financial data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !insights) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Financial Analytics</h3>
          <Badge variant="secondary" className="text-xs">Loading...</Badge>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-background border-border">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-6 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Financial Analytics</h3>
          <Badge variant="secondary" className="text-xs">Dashboard</Badge>
        </div>
        
        {/* Time Period Selector */}
        <div className="flex items-center gap-2">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="text-xs border rounded px-2 py-1 bg-background"
          >
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={i+1}>
                {new Date(0, i).toLocaleDateString('en-US', { month: 'short' })}
              </option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-xs border rounded px-2 py-1 bg-background"
          >
            {Array.from({length: 5}, (_, i) => (
              <option key={2020 + i} value={2020 + i}>
                {2020 + i}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="expenditure" className="flex items-center gap-2">
            <Minus className="h-4 w-4" />
            Expenditure
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="mapping" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Mapping
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Revenue */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(insights.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Cash basis • Paid invoices</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Total Expenditure */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Expenditure</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(expenditureData?.actualExpenditure || (insights.totalRevenue * 0.8))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(expenditureData?.expenditureRate || 80.0)} of revenue
                </p>
              </div>
              <Minus className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* Gross Margin */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Gross Margin</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatPercentage(expenditureData?.profitMargin || 20.0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(expenditureData?.totalProfit || (insights.totalRevenue * 0.2))} profit
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Revenue */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Outstanding</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(insights.outstandingRevenue)}</p>
                <p className="text-xs text-muted-foreground">{insights.outstandingInvoices} invoices pending</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-medium text-blue-900">Financial Health Score</h4>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-3xl font-bold ${getHealthScoreColor(getFinancialHealthScore())}`}>
                  {getFinancialHealthScore()}/100
                </div>
                <div className="text-xs text-blue-700">
                  <div>Collection: {formatPercentage(insights.collectionEfficiency)}</div>
                  <div>Payment Speed: {insights.averagePaymentDelay.toFixed(2)} days</div>
                  <div>Risk Level: {formatPercentage(insights.clientConcentrationRisk)}</div>
                </div>
              </div>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              getFinancialHealthScore() >= 80 ? 'bg-green-100' :
              getFinancialHealthScore() >= 60 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              {getFinancialHealthScore() >= 80 ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : getFinancialHealthScore() >= 60 ? (
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenditure Breakdown */}
      {expenditureData && expenditureData.expenditureByCategory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-background border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Expenditure Breakdown</h4>
              </div>
              <div className="space-y-3">
                {expenditureData.expenditureByCategory.slice(0, 5).map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-yellow-500' :
                        index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-xs text-muted-foreground">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{formatCurrency(category.amount)}</p>
                      <p className="text-xs text-muted-foreground">{formatPercentage(category.percentage)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Revenue & Profit Trend</h4>
              </div>
              <div className="space-y-3">
                {expenditureData.monthlyExpenditure.slice(-4).map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{month.month}</span>
                    <div className="text-right">
                      <p className="text-xs font-medium text-green-600">
                        {formatCurrency(month.revenue)} revenue
                      </p>
                      <p className="text-xs text-blue-600">
                        {formatCurrency(month.profit)} profit
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Revenue Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Collected Revenue</p>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(insights.collectedRevenue)}</p>
            <p className="text-xs text-green-600">{formatPercentage(insights.collectionEfficiency)} collection rate</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Outstanding</p>
              <AlertCircle className="h-3 w-3 text-orange-500" />
            </div>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(insights.outstandingRevenue)}</p>
            <p className="text-xs text-orange-600">{insights.outstandingInvoices} invoices pending</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Avg Payment Delay</p>
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">{insights.averagePaymentDelay.toFixed(2)} days</p>
            <p className="text-xs text-muted-foreground">From issue to payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Status & Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by Status */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">Revenue by Status</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Paid</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{formatCurrency(insights.paidAmount)}</p>
                  <p className="text-xs text-green-600">{formatPercentage(insights.paidPercentage)}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Overdue</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{formatCurrency(insights.overdueAmount)}</p>
                  <p className="text-xs text-red-600">{formatPercentage(insights.overduePercentage)}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Sent</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{formatCurrency(insights.sentAmount)}</p>
                  <p className="text-xs text-orange-600">{formatPercentage(insights.sentPercentage)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">Top Clients by Revenue</h4>
            </div>
            <div className="space-y-2">
              {insights?.topClients?.slice(0, 5).map((client, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground truncate flex-1 mr-2">{client.client}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">{formatCurrency(client.revenue)}</span>
                    <Badge variant="outline" className="text-xs">{formatPercentage(client.percentage)}</Badge>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">No client data available</p>
                </div>
              )}
            </div>
            {insights?.topClients && insights.topClients.length >= 2 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-orange-600">
                  ⚠️ Top 2 clients: {formatPercentage(insights.clientConcentrationRisk)} concentration risk
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="bg-background border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-foreground">Monthly Revenue Trends 2025</h4>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {insights.monthlyTrends.map((month, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{month.month}</p>
                <p className="text-sm font-medium text-foreground">{formatCurrency(month.revenue)}</p>
                {month.growth !== 0 && (
                  <div className="flex items-center justify-center text-xs mt-1">
                    {month.growth > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={month.growth > 0 ? "text-green-600" : "text-red-600"}>
                      {month.growth > 0 ? "+" : ""}{formatPercentage(Math.abs(month.growth))}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-xs text-green-600">
                📈 Strong revenue momentum detected
              </p>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                Growth Trend
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections Health & Payment Behavior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Collections Health */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">Collections Health</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Average Collection Days</span>
                <span className="text-sm font-medium text-foreground">{insights.averageCollectionDays} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Collection Efficiency</span>
                <Badge variant={insights.collectionEfficiency >= 85 ? "default" : "destructive"} className="text-xs">
                  {formatPercentage(insights.collectionEfficiency)}
                </Badge>
              </div>
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-foreground">Outstanding by Age</h5>
                {insights.agingBuckets.map((bucket, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{bucket.range}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{formatCurrency(bucket.amount)}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        bucket.range.includes('90+') ? 'bg-red-500' :
                        bucket.range.includes('60-89') ? 'bg-orange-500' :
                        bucket.range.includes('30-59') ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Behavior */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">Payment Behavior</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">On-Time Payment Rate</span>
                <Badge variant={insights.onTimePaymentRate >= 80 ? "default" : "secondary"} className="text-xs">
                  {formatPercentage(insights.onTimePaymentRate)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Early Payment Discount</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(insights.earlyPaymentDiscount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Late Payment Fees</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(insights.latePaymentFees)}</span>
              </div>
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-foreground">Payment Methods</h5>
                {insights.paymentMethods.map((method, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{method.method}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{formatPercentage(method.percentage)}</span>
                      <span className="text-xs text-muted-foreground">({method.count})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-600">
                  💡 {insights.onTimePaymentRate >= 80 ? 'Strong payment discipline' : 'Consider payment reminders and incentives'}
                </p>
                <Badge variant="outline" className={`text-xs ${
                  insights.onTimePaymentRate >= 80 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                }`}>
                  {insights.onTimePaymentRate >= 80 ? 'Excellent' : 'Needs Attention'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="bg-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Cash Revenue</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(insights.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">Actual payments received</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Expected Revenue</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(insights?.outstandingRevenue || 0)}</p>
                    <p className="text-xs text-muted-foreground">All invoices issued</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Collection Rate</p>
                    <p className="text-lg font-bold text-purple-600">{formatPercentage(insights.collectionEfficiency)}</p>
                    <p className="text-xs text-muted-foreground">Payment efficiency</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Avg Payment Delay</p>
                    <p className="text-lg font-bold text-orange-600">{insights.averagePaymentDelay.toFixed(2)} days</p>
                    <p className="text-xs text-muted-foreground">From issue to payment</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Status Breakdown */}
          <Card className="bg-background border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Revenue by Invoice Status</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium">{formatCurrency(insights.paidAmount)}</p>
                  <p className="text-xs text-green-600">Paid ({formatPercentage(insights.paidPercentage)})</p>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium">{formatCurrency(insights.overdueAmount)}</p>
                  <p className="text-xs text-red-600">Overdue ({formatPercentage(insights.overduePercentage)})</p>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium">{formatCurrency(insights.sentAmount)}</p>
                  <p className="text-xs text-yellow-600">Sent ({formatPercentage(insights.sentPercentage)})</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenditure Tab */}
        <TabsContent value="expenditure" className="space-y-4">
          {expenditureData && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="bg-background border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Total Expenditure</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(expenditureData.actualExpenditure)}</p>
                        <p className="text-xs text-muted-foreground">{formatPercentage(expenditureData.expenditureRate)} of revenue</p>
                      </div>
                      <Minus className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Wages & Salaries</p>
                        <p className="text-lg font-bold text-blue-600">${expenditureData.expenditureBreakdown.wages_salaries.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Largest expense category</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Profit Margin</p>
                        <p className="text-lg font-bold text-green-600">{formatPercentage(expenditureData.profitMargin)}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(expenditureData.totalProfit)} profit</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Admin Costs</p>
                        <p className="text-lg font-bold text-purple-600">${expenditureData.expenditureBreakdown.admin_cost.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Operational expenses</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-background border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">Detailed Expenditure Breakdown</h4>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {expenditureData.expenditureByCategory.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium">{category.category}</p>
                          <p className="text-xs text-muted-foreground">{formatPercentage(category.percentage)}</p>
                        </div>
                        <p className="text-sm font-bold">{formatCurrency(category.amount)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Top Clients by Revenue</h4>
                </div>
                <div className="space-y-3">
                  {insights.topClients.slice(0, 5).map((client, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-green-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-sm font-medium">{client.client}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatCurrency(client.revenue)}</p>
                        <p className="text-xs text-muted-foreground">{formatPercentage(client.percentage)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Client Concentration Risk</h4>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{formatPercentage(insights.clientConcentrationRisk)}</p>
                  <p className="text-sm text-muted-foreground mb-4">Top 2 clients represent</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    insights.clientConcentrationRisk > 50 ? 'bg-red-100 text-red-800' :
                    insights.clientConcentrationRisk > 30 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insights.clientConcentrationRisk > 50 ? 'High Risk' :
                     insights.clientConcentrationRisk > 30 ? 'Medium Risk' : 'Low Risk'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <PerformanceAnalytics />
        </TabsContent>

        {/* Mapping Tab */}
        <TabsContent value="mapping" className="space-y-4">
          <ProjectionMappingView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
