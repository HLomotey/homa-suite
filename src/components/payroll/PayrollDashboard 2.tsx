import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePayroll } from '@/hooks/usePayroll';
import { FrontendPayroll } from '@/integration/supabase/types/billing';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Calculator,
  Building,
  BarChart3,
  PieChart,
  Activity,
  Award,
  AlertTriangle,
  RefreshCw,
  Wallet,
  CreditCard,
  Target,
  Zap,
  Clock,
  FileText
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isThisMonth, isSameMonth } from 'date-fns';

interface PayrollDashboardProps {
  className?: string;
}

export const PayrollDashboard: React.FC<PayrollDashboardProps> = ({ className }) => {
  const [dateRange, setDateRange] = useState<'current' | 'last' | 'quarter'>('current');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  
  const { payrollData, loading, stats, refreshData } = usePayroll();

  // Calculate advanced payroll analytics
  const analytics = useMemo(() => {
    if (!payrollData || payrollData.length === 0) {
      return {
        totalPayroll: 0,
        avgSalary: 0,
        totalDeductions: 0,
        overtimeCost: 0,
        departmentCosts: [],
        payPeriodTrends: [],
        topEarners: [],
        costBreakdown: { regular: 0, overtime: 0, deductions: 0, net: 0 },
        alerts: [],
        employeeCount: 0,
        avgHoursWorked: 0
      };
    }

    // Filter data based on date range
    const filteredData = payrollData.filter(record => {
      const recordDate = parseISO(record.payDate);
      switch (dateRange) {
        case 'current':
          return isThisMonth(recordDate);
        case 'last':
          const lastMonth = subMonths(new Date(), 1);
          return isSameMonth(recordDate, lastMonth);
        case 'quarter':
          const threeMonthsAgo = subMonths(new Date(), 3);
          return recordDate >= threeMonthsAgo;
        default:
          return true;
      }
    });

    // Calculate total payroll costs
    const totalRegularPay = filteredData.reduce((sum, record) => {
      const regularHours = record.regularHours || 0;
      const hourlyRate = 25; // Default hourly rate - should come from staff data
      return sum + (regularHours * hourlyRate);
    }, 0);

    const totalOvertimePay = filteredData.reduce((sum, record) => {
      const overtimeHours = record.overtimeHours || 0;
      const hourlyRate = 25 * 1.5; // Overtime rate (1.5x)
      return sum + (overtimeHours * hourlyRate);
    }, 0);

    const totalDeductions = filteredData.reduce((sum, record) => {
      return sum + (record.rent || 0) + (record.transport || 0) + (record.penalties || 0);
    }, 0);

    const totalPayroll = totalRegularPay + totalOvertimePay - totalDeductions;
    const avgSalary = filteredData.length > 0 ? totalPayroll / filteredData.length : 0;
    const overtimeCost = totalOvertimePay;

    // Calculate average hours worked
    const totalHours = filteredData.reduce((sum, record) => {
      return sum + (record.regularHours || 0) + (record.overtimeHours || 0);
    }, 0);
    const avgHoursWorked = filteredData.length > 0 ? totalHours / filteredData.length : 0;

    // Department-wise cost analysis
    const departmentGroups = filteredData.reduce((acc, record) => {
      // Since we don't have department in payroll, we'll use staff name as a proxy
      const dept = record.staffName?.split(' ')[0] || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { 
          totalCost: 0, 
          employeeCount: 0, 
          regularHours: 0, 
          overtimeHours: 0,
          deductions: 0
        };
      }
      
      const regularPay = (record.regularHours || 0) * 25;
      const overtimePay = (record.overtimeHours || 0) * 37.5;
      const deductions = (record.rent || 0) + (record.transport || 0) + (record.penalties || 0);
      
      acc[dept].totalCost += regularPay + overtimePay - deductions;
      acc[dept].employeeCount++;
      acc[dept].regularHours += record.regularHours || 0;
      acc[dept].overtimeHours += record.overtimeHours || 0;
      acc[dept].deductions += deductions;
      
      return acc;
    }, {} as Record<string, any>);

    const departmentCosts = Object.entries(departmentGroups).map(([dept, stats]) => ({
      department: dept,
      totalCost: stats.totalCost,
      avgCostPerEmployee: stats.totalCost / stats.employeeCount,
      employeeCount: stats.employeeCount,
      regularHours: stats.regularHours,
      overtimeHours: stats.overtimeHours,
      deductions: stats.deductions
    })).sort((a, b) => b.totalCost - a.totalCost);

    // Top earners analysis
    const employeeEarnings = filteredData.reduce((acc, record) => {
      const staffId = record.staffId;
      const staffName = record.staffName || 'Unknown';
      
      if (!acc[staffId]) {
        acc[staffId] = {
          staffName,
          totalEarnings: 0,
          regularHours: 0,
          overtimeHours: 0,
          deductions: 0,
          recordCount: 0
        };
      }
      
      const regularPay = (record.regularHours || 0) * 25;
      const overtimePay = (record.overtimeHours || 0) * 37.5;
      const deductions = (record.rent || 0) + (record.transport || 0) + (record.penalties || 0);
      
      acc[staffId].totalEarnings += regularPay + overtimePay - deductions;
      acc[staffId].regularHours += record.regularHours || 0;
      acc[staffId].overtimeHours += record.overtimeHours || 0;
      acc[staffId].deductions += deductions;
      acc[staffId].recordCount++;
      
      return acc;
    }, {} as Record<string, any>);

    const topEarners = Object.values(employeeEarnings)
      .sort((a: any, b: any) => b.totalEarnings - a.totalEarnings)
      .slice(0, 5);

    // Cost breakdown
    const costBreakdown = {
      regular: totalRegularPay,
      overtime: totalOvertimePay,
      deductions: totalDeductions,
      net: totalPayroll
    };

    // Generate alerts
    const alerts = [];
    const overtimePercentage = totalPayroll > 0 ? (totalOvertimePay / totalPayroll) * 100 : 0;
    const deductionPercentage = totalPayroll > 0 ? (totalDeductions / (totalPayroll + totalDeductions)) * 100 : 0;

    if (overtimePercentage > 20) {
      alerts.push({
        type: 'warning',
        message: `High overtime costs: ${overtimePercentage.toFixed(1)}% of total payroll`
      });
    }

    if (deductionPercentage > 15) {
      alerts.push({
        type: 'info',
        message: `High deductions: ${deductionPercentage.toFixed(1)}% of gross pay`
      });
    }

    if (avgHoursWorked > 45) {
      alerts.push({
        type: 'error',
        message: `Average hours per employee exceeds 45h (${avgHoursWorked.toFixed(1)}h)`
      });
    }

    if (totalPayroll > 100000) {
      alerts.push({
        type: 'info',
        message: `High payroll period: $${(totalPayroll / 1000).toFixed(0)}K total cost`
      });
    }

    return {
      totalPayroll,
      avgSalary,
      totalDeductions,
      overtimeCost,
      departmentCosts,
      topEarners,
      costBreakdown,
      alerts,
      employeeCount: filteredData.length,
      avgHoursWorked
    };
  }, [payrollData, dateRange]);

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
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading payroll analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payroll Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into payroll costs and employee compensation</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">This Month</SelectItem>
              <SelectItem value="last">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {analytics.alerts.length > 0 && (
        <div className="space-y-2">
          {analytics.alerts.map((alert, index) => (
            <Card key={index} className={`border-l-4 ${
              alert.type === 'error' ? 'border-l-red-500 bg-red-50' :
              alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
              'border-l-blue-500 bg-blue-50'
            }`}>
              <CardContent className="py-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${
                    alert.type === 'error' ? 'text-red-600' :
                    alert.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <span className="text-sm font-medium">{alert.message}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics.totalPayroll)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.employeeCount} employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Employee</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(analytics.avgSalary)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.avgHoursWorked.toFixed(1)}h avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Cost</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(analytics.overtimeCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalPayroll > 0 ? ((analytics.overtimeCost / analytics.totalPayroll) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(analytics.totalDeductions)}
            </div>
            <p className="text-xs text-muted-foreground">
              Rent, transport, penalties
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Cost Breakdown
          </CardTitle>
          <CardDescription>Distribution of payroll costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(analytics.costBreakdown.regular)}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Regular Pay
              </div>
              <Progress 
                value={analytics.totalPayroll > 0 ? (analytics.costBreakdown.regular / (analytics.totalPayroll + analytics.totalDeductions)) * 100 : 0} 
                className="mt-2" 
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(analytics.costBreakdown.overtime)}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Zap className="h-3 w-3" />
                Overtime Pay
              </div>
              <Progress 
                value={analytics.totalPayroll > 0 ? (analytics.costBreakdown.overtime / (analytics.totalPayroll + analytics.totalDeductions)) * 100 : 0} 
                className="mt-2" 
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                -{formatCurrency(analytics.costBreakdown.deductions)}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <CreditCard className="h-3 w-3" />
                Deductions
              </div>
              <Progress 
                value={analytics.totalPayroll > 0 ? (analytics.costBreakdown.deductions / (analytics.totalPayroll + analytics.totalDeductions)) * 100 : 0} 
                className="mt-2" 
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.costBreakdown.net)}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Wallet className="h-3 w-3" />
                Net Payroll
              </div>
              <Progress 
                value={100} 
                className="mt-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Department Costs
            </CardTitle>
            <CardDescription>Payroll costs by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.departmentCosts.slice(0, 5).map((dept, index) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <div className="font-medium">{dept.department}</div>
                      <div className="text-xs text-muted-foreground">
                        {dept.employeeCount} employees
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(dept.totalCost)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(dept.avgCostPerEmployee)}/emp
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Earners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Earners
            </CardTitle>
            <CardDescription>Employees with highest earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topEarners.map((earner, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{earner.staffName}</div>
                      <div className="text-xs text-muted-foreground">
                        {earner.regularHours + earner.overtimeHours}h total
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(earner.totalEarnings)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {earner.overtimeHours}h OT
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
