import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText, CheckCircle, Clock, AlertCircle, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { FinanceDrillDownModal } from "./drill-down/FinanceDrillDownModal";

// Mock data for stable functionality
const mockFinanceData = {
  totalRevenue: 2847500,
  totalRevenueChange: 12.3,
  totalInvoices: 156,
  totalInvoicesChange: 8.2,
  paidInvoices: 142,
  paidInvoicesChange: 5.1,
  outstanding: 285000,
  outstandingChange: -15.2,
  overdue: 8,
  overdueChange: -25.0,
  pending: 6,
  pendingChange: 33.3,
  collectionRate: 91.0,
  collectionRateChange: 2.1,
  averageInvoiceValue: 18254
};

const mockInvoices = [
  { id: "INV-001", client_name: "Acme Corp", invoice_number: "INV-2024-001", amount: 25000, status: "paid", date_issued: "2024-01-15", date_paid: "2024-01-28" },
  { id: "INV-002", client_name: "Tech Solutions", invoice_number: "INV-2024-002", amount: 18500, status: "pending", date_issued: "2024-01-20", date_paid: null },
  { id: "INV-003", client_name: "Global Industries", invoice_number: "INV-2024-003", amount: 32000, status: "overdue", date_issued: "2024-01-10", date_paid: null }
];

export function FinanceAnalytics() {
  const [drillDownView, setDrillDownView] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

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

  // Loading state
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 h-full">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-slate-500" />
          <h3 className="text-lg font-semibold">Finance</h3>
          <Badge variant="outline" className="ml-2">FIN</Badge>
          <p className="text-sm text-muted-foreground ml-auto">Revenue and invoice performance metrics</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="h-5 w-5 text-slate-500" />
        <h3 className="text-lg font-semibold">Finance</h3>
        <Badge variant="outline" className="ml-2">FIN</Badge>
        <p className="text-sm text-muted-foreground ml-auto">Revenue and invoice performance metrics</p>
        <Button variant="ghost" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Revenue Card */}
        <Card 
          className="bg-gradient-to-br from-slate-900/40 to-slate-800/20 border-slate-800/30 cursor-pointer hover:bg-slate-800/30 transition-colors"
          onClick={() => setDrillDownView('revenue-breakdown')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-100 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(mockFinanceData.totalRevenue)}</p>
            <div className="flex items-center mt-1">
              {mockFinanceData.totalRevenueChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${
                mockFinanceData.totalRevenueChange > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {mockFinanceData.totalRevenueChange > 0 ? '+' : ''}{mockFinanceData.totalRevenueChange.toFixed(1)}% from last period
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Click for breakdown</p>
          </CardContent>
        </Card>

        {/* Total Invoices Card */}
        <Card 
          className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-800/30 cursor-pointer hover:bg-blue-800/30 transition-colors"
          onClick={() => setDrillDownView('invoice-list')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockFinanceData.totalInvoices}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatCurrency(mockFinanceData.averageInvoiceValue)}
            </p>
            <p className="text-xs text-blue-300 mt-1">Click for invoice list</p>
          </CardContent>
        </Card>

        {/* Paid Invoices Card */}
        <Card 
          className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-800/30 cursor-pointer hover:bg-green-800/30 transition-colors"
          onClick={() => setDrillDownView('paid-invoices')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Paid Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockFinanceData.paidInvoices}</p>
            <p className="text-xs text-green-300 mt-1">Click for details</p>
          </CardContent>
        </Card>

        {/* Outstanding Card */}
        <Card 
          className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-800/30 cursor-pointer hover:bg-amber-800/30 transition-colors"
          onClick={() => setDrillDownView('outstanding-invoices')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-100 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(mockFinanceData.outstanding)}</p>
            <p className="text-xs text-amber-300 mt-1">Click for follow-up</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-3 gap-3 mt-2">
        {/* Overdue Invoices */}
        <Card 
          className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-800/30 cursor-pointer hover:bg-red-800/30 transition-colors"
          onClick={() => setDrillDownView('overdue-invoices')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-100 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-xl font-bold text-white">
              {mockFinanceData.overdue}
            </div>
            <p className="text-xs text-red-200">Click for action items</p>
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card 
          className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-yellow-800/30 cursor-pointer hover:bg-yellow-800/30 transition-colors"
          onClick={() => setDrillDownView('pending-invoices')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-100 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-xl font-bold text-white">
              {mockFinanceData.pending}
            </div>
            <p className="text-xs text-yellow-200">Click for review</p>
          </CardContent>
        </Card>

        {/* Collection Rate */}
        <Card 
          className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-800/30 cursor-pointer hover:bg-purple-800/30 transition-colors"
          onClick={() => setDrillDownView('collection-trends')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-xl font-bold text-white">
              {mockFinanceData.collectionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-purple-200">Click for trends</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Status Summary */}
      <div className="bg-[#0a101f] border border-blue-900/30 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-blue-900/30">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Invoice Status Overview</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{mockFinanceData.paidInvoices}</p>
              <p className="text-sm text-green-300">Paid</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{mockFinanceData.pending}</p>
              <p className="text-sm text-yellow-300">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{mockFinanceData.overdue}</p>
              <p className="text-sm text-red-300">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Drill-down Modal */}
      {drillDownView && (
        <FinanceDrillDownModal
          isOpen={!!drillDownView}
          onClose={() => setDrillDownView(null)}
          view={drillDownView}
          financeData={{
            metrics: mockFinanceData,
            invoices: mockInvoices
          }}
        />
      )}
    </div>
  );
}
