import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, AlertTriangle, TrendingDown, DollarSign } from "lucide-react";

interface Invoice {
  id: string;
  client_name: string;
  invoice_number: string;
  line_total: number;
  date_issued: string;
  due_date?: string;
  invoice_status: string;
}

interface InvoiceAgingAnalysisProps {
  invoices: Invoice[];
  loading?: boolean;
}

interface AgingBucket {
  label: string;
  range: string;
  count: number;
  amount: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  invoices: Invoice[];
}

export const InvoiceAgingAnalysis: React.FC<InvoiceAgingAnalysisProps> = ({
  invoices,
  loading = false
}) => {
  const agingAnalysis = useMemo(() => {
    const today = new Date();
    
    // Filter to unpaid/outstanding invoices only
    const outstandingInvoices = invoices.filter(invoice => 
      invoice.invoice_status !== 'paid' && 
      invoice.invoice_status !== 'cancelled'
    );

    const buckets: AgingBucket[] = [
      {
        label: "Current",
        range: "0-30 days",
        count: 0,
        amount: 0,
        percentage: 0,
        color: "bg-green-500",
        icon: <Calendar className="h-4 w-4" />,
        invoices: []
      },
      {
        label: "31-60 Days",
        range: "31-60 days",
        count: 0,
        amount: 0,
        percentage: 0,
        color: "bg-yellow-500",
        icon: <Clock className="h-4 w-4" />,
        invoices: []
      },
      {
        label: "61-90 Days",
        range: "61-90 days",
        count: 0,
        amount: 0,
        percentage: 0,
        color: "bg-orange-500",
        icon: <AlertTriangle className="h-4 w-4" />,
        invoices: []
      },
      {
        label: "90+ Days",
        range: "Over 90 days",
        count: 0,
        amount: 0,
        percentage: 0,
        color: "bg-red-500",
        icon: <TrendingDown className="h-4 w-4" />,
        invoices: []
      }
    ];

    // Categorize invoices by aging
    outstandingInvoices.forEach(invoice => {
      const issueDate = new Date(invoice.date_issued);
      const daysDiff = Math.floor((today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
      const amount = parseFloat(invoice.line_total?.toString() || '0') || 0;

      if (daysDiff <= 30) {
        buckets[0].count++;
        buckets[0].amount += amount;
        buckets[0].invoices.push(invoice);
      } else if (daysDiff <= 60) {
        buckets[1].count++;
        buckets[1].amount += amount;
        buckets[1].invoices.push(invoice);
      } else if (daysDiff <= 90) {
        buckets[2].count++;
        buckets[2].amount += amount;
        buckets[2].invoices.push(invoice);
      } else {
        buckets[3].count++;
        buckets[3].amount += amount;
        buckets[3].invoices.push(invoice);
      }
    });

    // Calculate percentages
    const totalAmount = buckets.reduce((sum, bucket) => sum + bucket.amount, 0);
    buckets.forEach(bucket => {
      bucket.percentage = totalAmount > 0 ? (bucket.amount / totalAmount) * 100 : 0;
    });

    return {
      buckets,
      totalOutstanding: totalAmount,
      totalCount: outstandingInvoices.length,
      averageAge: outstandingInvoices.length > 0 
        ? Math.round(outstandingInvoices.reduce((sum, invoice) => {
            const issueDate = new Date(invoice.date_issued);
            const daysDiff = Math.floor((today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
            return sum + daysDiff;
          }, 0) / outstandingInvoices.length)
        : 0
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
            <CardTitle className="text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-400" />
              Invoice Aging Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map(i => (
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0a101f] border border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-sm text-blue-300">Total Outstanding</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(agingAnalysis.totalOutstanding)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-sm text-blue-300">Outstanding Invoices</p>
                <p className="text-2xl font-bold text-white">
                  {agingAnalysis.totalCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-sm text-blue-300">Average Age</p>
                <p className="text-2xl font-bold text-white">
                  {agingAnalysis.averageAge} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aging Buckets */}
      <Card className="bg-[#0a101f] border border-blue-900/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-400" />
            Invoice Aging Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {agingAnalysis.buckets.map((bucket, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${bucket.color} mr-3`}></div>
                  <div className="flex items-center">
                    {bucket.icon}
                    <span className="text-white font-medium ml-2">{bucket.label}</span>
                    <span className="text-blue-300 text-sm ml-2">({bucket.range})</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">
                    {formatCurrency(bucket.amount)}
                  </div>
                  <div className="text-blue-300 text-sm">
                    {bucket.count} invoices
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={bucket.percentage} 
                  className="flex-1 h-2"
                />
                <span className="text-blue-300 text-sm min-w-[50px]">
                  {bucket.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card className="bg-[#0a101f] border border-red-900/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
            Collection Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* High Risk (90+ days) */}
            {agingAnalysis.buckets[3].count > 0 && (
              <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-red-900/40 text-red-300 border-red-800/50">
                    High Risk
                  </Badge>
                  <span className="text-red-300 font-semibold">
                    {formatCurrency(agingAnalysis.buckets[3].amount)}
                  </span>
                </div>
                <p className="text-red-200 text-sm">
                  {agingAnalysis.buckets[3].count} invoices over 90 days old require immediate attention
                </p>
              </div>
            )}

            {/* Medium Risk (61-90 days) */}
            {agingAnalysis.buckets[2].count > 0 && (
              <div className="p-4 bg-orange-900/20 border border-orange-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-orange-900/40 text-orange-300 border-orange-800/50">
                    Medium Risk
                  </Badge>
                  <span className="text-orange-300 font-semibold">
                    {formatCurrency(agingAnalysis.buckets[2].amount)}
                  </span>
                </div>
                <p className="text-orange-200 text-sm">
                  {agingAnalysis.buckets[2].count} invoices approaching 90 days
                </p>
              </div>
            )}

            {/* Low Risk (31-60 days) */}
            {agingAnalysis.buckets[1].count > 0 && (
              <div className="p-4 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-yellow-900/40 text-yellow-300 border-yellow-800/50">
                    Watch List
                  </Badge>
                  <span className="text-yellow-300 font-semibold">
                    {formatCurrency(agingAnalysis.buckets[1].amount)}
                  </span>
                </div>
                <p className="text-yellow-200 text-sm">
                  {agingAnalysis.buckets[1].count} invoices require follow-up
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceAgingAnalysis;
