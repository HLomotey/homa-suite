import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Calendar, CreditCard, Target, BarChart3 } from "lucide-react";

interface Invoice {
  id: string;
  client_name: string;
  invoice_number: string;
  line_total: number;
  date_issued: string;
  due_date?: string;
  invoice_status: string;
  tax_1_type?: string;
}

interface PaymentTrendsAnalysisProps {
  invoices: Invoice[];
  loading?: boolean;
}

interface MonthlyTrend {
  month: string;
  totalInvoiced: number;
  totalPaid: number;
  paymentRate: number;
  invoiceCount: number;
  paidCount: number;
}

interface ClientPerformance {
  clientName: string;
  totalInvoiced: number;
  totalPaid: number;
  paymentRate: number;
  averagePaymentDays: number;
  invoiceCount: number;
}

export const PaymentTrendsAnalysis: React.FC<PaymentTrendsAnalysisProps> = ({
  invoices,
  loading = false
}) => {
  const analysis = useMemo(() => {
    // Monthly trends for the last 12 months
    const monthlyData: { [key: string]: MonthlyTrend } = {};
    const clientData: { [key: string]: ClientPerformance } = {};
    
    const currentDate = new Date();
    const twelveMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 11, 1);

    // Initialize last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyData[monthKey] = {
        month: monthKey,
        totalInvoiced: 0,
        totalPaid: 0,
        paymentRate: 0,
        invoiceCount: 0,
        paidCount: 0
      };
    }

    // Process invoices
    invoices.forEach(invoice => {
      const issueDate = new Date(invoice.date_issued);
      if (issueDate >= twelveMonthsAgo) {
        const monthKey = issueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const amount = parseFloat(invoice.line_total?.toString() || '0') || 0;
        const isPaid = invoice.invoice_status === 'paid';

        // Monthly trends
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].totalInvoiced += amount;
          monthlyData[monthKey].invoiceCount++;
          if (isPaid) {
            monthlyData[monthKey].totalPaid += amount;
            monthlyData[monthKey].paidCount++;
          }
        }

        // Client performance
        if (!clientData[invoice.client_name]) {
          clientData[invoice.client_name] = {
            clientName: invoice.client_name,
            totalInvoiced: 0,
            totalPaid: 0,
            paymentRate: 0,
            averagePaymentDays: 0,
            invoiceCount: 0
          };
        }

        clientData[invoice.client_name].totalInvoiced += amount;
        clientData[invoice.client_name].invoiceCount++;
        if (isPaid) {
          clientData[invoice.client_name].totalPaid += amount;
        }
      }
    });

    // Calculate payment rates
    Object.values(monthlyData).forEach(month => {
      month.paymentRate = month.totalInvoiced > 0 ? (month.totalPaid / month.totalInvoiced) * 100 : 0;
    });

    Object.values(clientData).forEach(client => {
      client.paymentRate = client.totalInvoiced > 0 ? (client.totalPaid / client.totalInvoiced) * 100 : 0;
    });

    // Sort and get top/bottom performers
    const sortedMonths = Object.values(monthlyData)
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    const topClients = Object.values(clientData)
      .filter(client => client.invoiceCount >= 3) // Only clients with 3+ invoices
      .sort((a, b) => b.paymentRate - a.paymentRate)
      .slice(0, 5);

    const bottomClients = Object.values(clientData)
      .filter(client => client.invoiceCount >= 3)
      .sort((a, b) => a.paymentRate - b.paymentRate)
      .slice(0, 5);

    // Calculate overall metrics
    const totalInvoiced = Object.values(clientData).reduce((sum, client) => sum + client.totalInvoiced, 0);
    const totalPaid = Object.values(clientData).reduce((sum, client) => sum + client.totalPaid, 0);
    const overallPaymentRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;

    // Calculate trend (comparing last 3 months vs previous 3 months)
    const recentMonths = sortedMonths.slice(-3);
    const previousMonths = sortedMonths.slice(-6, -3);
    
    const recentRate = recentMonths.reduce((sum, month) => sum + month.paymentRate, 0) / 3;
    const previousRate = previousMonths.reduce((sum, month) => sum + month.paymentRate, 0) / 3;
    const trendDirection = recentRate > previousRate ? 'up' : recentRate < previousRate ? 'down' : 'stable';
    const trendPercentage = previousRate > 0 ? ((recentRate - previousRate) / previousRate) * 100 : 0;

    return {
      monthlyTrends: sortedMonths,
      topClients,
      bottomClients,
      overallPaymentRate,
      trendDirection,
      trendPercentage,
      totalInvoiced,
      totalPaid
    };
  }, [invoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="bg-[#0a101f] border border-blue-900/30">
          <CardHeader>
            <CardTitle className="text-white">Payment Trends Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-blue-800/20 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0a101f] border border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-sm text-blue-300">Overall Payment Rate</p>
                <p className="text-2xl font-bold text-white">
                  {analysis.overallPaymentRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-sm text-blue-300">Total Collected</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(analysis.totalPaid)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              {analysis.trendDirection === 'up' ? (
                <TrendingUp className="h-8 w-8 text-green-400 mr-3" />
              ) : analysis.trendDirection === 'down' ? (
                <TrendingDown className="h-8 w-8 text-red-400 mr-3" />
              ) : (
                <BarChart3 className="h-8 w-8 text-blue-400 mr-3" />
              )}
              <div>
                <p className="text-sm text-blue-300">3-Month Trend</p>
                <p className={`text-2xl font-bold ${
                  analysis.trendDirection === 'up' ? 'text-green-400' : 
                  analysis.trendDirection === 'down' ? 'text-red-400' : 'text-white'
                }`}>
                  {analysis.trendDirection === 'up' ? '+' : analysis.trendDirection === 'down' ? '' : ''}
                  {Math.abs(analysis.trendPercentage).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="bg-[#0a101f] border border-blue-900/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-400" />
            Monthly Payment Trends (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.monthlyTrends.map((month, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-white font-medium w-20">{month.month}</span>
                    <div className="ml-4">
                      <div className="text-sm text-blue-300">
                        {formatCurrency(month.totalPaid)} / {formatCurrency(month.totalInvoiced)}
                      </div>
                      <div className="text-xs text-blue-400">
                        {month.paidCount} / {month.invoiceCount} invoices
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">
                      {month.paymentRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress value={month.paymentRate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Clients */}
      <Card className="bg-[#0a101f] border border-green-900/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
            Top Performing Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.topClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-900/10 border border-green-800/30 rounded-lg">
                <div>
                  <div className="text-white font-medium">{client.clientName}</div>
                  <div className="text-sm text-green-300">
                    {formatCurrency(client.totalPaid)} collected from {client.invoiceCount} invoices
                  </div>
                </div>
                <Badge className="bg-green-900/40 text-green-300 border-green-800/50">
                  {client.paymentRate.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clients Needing Attention */}
      {analysis.bottomClients.length > 0 && (
        <Card className="bg-[#0a101f] border border-red-900/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingDown className="h-5 w-5 mr-2 text-red-400" />
              Clients Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.bottomClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-900/10 border border-red-800/30 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{client.clientName}</div>
                    <div className="text-sm text-red-300">
                      {formatCurrency(client.totalInvoiced - client.totalPaid)} outstanding from {client.invoiceCount} invoices
                    </div>
                  </div>
                  <Badge className="bg-red-900/40 text-red-300 border-red-800/50">
                    {client.paymentRate.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentTrendsAnalysis;
