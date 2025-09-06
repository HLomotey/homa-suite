import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  FileText,
  BarChart,
  PieChart,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
} from "lucide-react";
import { FinanceOverview } from "@/components/finance/FinanceOverview";
import { FinanceReports } from "@/components/finance/FinanceReports";
import { FinanceTransactions } from "@/components/finance/FinanceTransactions";
import { FinanceAnalyticsTab } from "@/components/finance/FinanceAnalyticsTab";
import { DateFilter } from "@/components/ui/date-filter";
import { useFinanceAnalytics } from "@/hooks/finance/useFinanceAnalytics";
import { FinanceDrillThroughDashboard } from "@/components/finance/drill-through/FinanceDrillThroughDashboard";
import ProjectionModule from '@/components/finance/projections/ProjectionModule';
import { FinanceBudgeting } from "@/components/finance/FinanceBudgeting";

export default function Finance() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState<number>();
  const [selectedMonth, setSelectedMonth] = useState<number>();
  const { data: financeData, isLoading } = useFinanceAnalytics(selectedYear, selectedMonth);

  const handleDateChange = (year: number | undefined, month: number | undefined) => {
    setSelectedYear(year);
    setSelectedMonth(month);
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

  return (
    <div className="flex-1 h-full p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Finance Dashboard</h2>
        <div className="flex items-center space-x-2">
          <DateFilter onDateChange={handleDateChange} />
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : formatCurrency(financeData?.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Current period</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : financeData?.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "..." : `${formatCurrency(financeData?.averageInvoiceValue)} average value`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : financeData?.paidInvoices}</div>
            <p className="text-xs text-green-500">
              {isLoading ? "..." : financeData && financeData.totalInvoices > 0
                ? `${((financeData.paidInvoices / financeData.totalInvoices) * 100).toFixed(0)}% of total`
                : "0% of total"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : (financeData?.pendingInvoices || 0) + (financeData?.overdueInvoices || 0)}
            </div>
            <p className="text-xs text-amber-500">
              {isLoading ? "..." : financeData && financeData.totalInvoices > 0
                ? `${(((financeData?.pendingInvoices || 0) + (financeData?.overdueInvoices || 0)) / financeData.totalInvoices * 100).toFixed(0)}% of total`
                : "0% of total"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-background border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="detailed-analysis">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgeting">Budgeting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <FinanceOverview year={selectedYear} month={selectedMonth} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <FinanceAnalyticsTab year={selectedYear} month={selectedMonth} />
        </TabsContent>

        <TabsContent value="detailed-analysis" className="space-y-4">
          <FinanceDrillThroughDashboard
            onBack={() => setActiveTab("analytics")}
            year={selectedYear}
            month={selectedMonth}
          />
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <ProjectionModule />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <FinanceReports />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <FinanceTransactions />
        </TabsContent>

        <TabsContent value="budgeting" className="space-y-4">
          <FinanceBudgeting />
        </TabsContent>
      </Tabs>
    </div>
  );
}
