import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar, BarChart3, PieChart, Activity } from "lucide-react";

interface Expense {
  id: string;
  Company: string;
  Date: string;
  Type: string;
  Payee: string;
  Category: string;
  Total: number;
}

interface ExpenseAnalytics {
  totalExpenses: number;
  expenseCount: number;
  averageExpense: number;
  categoryCount: number;
  companyCount: number;
  typeCount: number;
  categoryTotals: Record<string, number>;
  companyTotals: Record<string, number>;
  typeTotals: Record<string, number>;
  topCategory?: [string, number];
  topCompany?: [string, number];
}

interface ExpenseTrendsAnalysisProps {
  expenses: Expense[];
  loading: boolean;
  analytics: ExpenseAnalytics;
}

export const ExpenseTrendsAnalysis: React.FC<ExpenseTrendsAnalysisProps> = ({
  expenses,
  loading,
  analytics
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Monthly trends analysis
  const monthlyTrends = React.useMemo(() => {
    const monthlyData: Record<string, { total: number; count: number; categories: Set<string> }> = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.Date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0, categories: new Set() };
      }
      
      monthlyData[monthKey].total += expense.Total;
      monthlyData[monthKey].count += 1;
      monthlyData[monthKey].categories.add(expense.Category);
    });
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        monthLabel: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        total: data.total,
        count: data.count,
        average: data.total / data.count,
        categoryCount: data.categories.size
      }));
  }, [expenses]);

  // Weekly trends (last 12 weeks)
  const weeklyTrends = React.useMemo(() => {
    const weeklyData: Record<string, { total: number; count: number }> = {};
    const now = new Date();
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.Date);
      const weeksDiff = Math.floor((now.getTime() - expenseDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      if (weeksDiff >= 0 && weeksDiff < 12) {
        const weekKey = `week-${weeksDiff}`;
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { total: 0, count: 0 };
        }
        weeklyData[weekKey].total += expense.Total;
        weeklyData[weekKey].count += 1;
      }
    });
    
    return Array.from({ length: 12 }, (_, i) => {
      const weekKey = `week-${i}`;
      const data = weeklyData[weekKey] || { total: 0, count: 0 };
      return {
        week: i,
        weekLabel: i === 0 ? 'This week' : i === 1 ? 'Last week' : `${i} weeks ago`,
        total: data.total,
        count: data.count,
        average: data.count > 0 ? data.total / data.count : 0
      };
    });
  }, [expenses]);

  // Category trends over time
  const categoryTrends = React.useMemo(() => {
    const trends: Record<string, Record<string, number>> = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.Date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!trends[expense.Category]) {
        trends[expense.Category] = {};
      }
      
      trends[expense.Category][monthKey] = (trends[expense.Category][monthKey] || 0) + expense.Total;
    });
    
    return Object.entries(trends)
      .map(([category, monthlyData]) => {
        const months = Object.keys(monthlyData).sort();
        const values = months.map(month => monthlyData[month]);
        const total = values.reduce((sum, val) => sum + val, 0);
        
        // Calculate trend (simple linear regression slope)
        const n = values.length;
        if (n < 2) return { category, total, trend: 0, months: months.length };
        
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        
        return {
          category,
          total,
          trend: slope,
          months: months.length,
          isIncreasing: slope > 0,
          isDecreasing: slope < 0
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [expenses]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-96 bg-red-800/20 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Trends */}
      <Card className="bg-[#1f0a0a] border border-red-900/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-red-400" />
            Monthly Expense Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {monthlyTrends.slice(-4).map((month, index) => (
                <div key={month.month} className="bg-red-900/10 p-4 rounded-lg border border-red-800/30">
                  <div className="text-red-300 text-sm font-medium">{month.monthLabel}</div>
                  <div className="text-white text-xl font-bold mt-1">{formatCurrency(month.total)}</div>
                  <div className="text-red-400 text-sm mt-1">
                    {month.count} expenses • Avg: {formatCurrency(month.average)}
                  </div>
                  <div className="text-red-500 text-xs mt-1">
                    {month.categoryCount} categories
                  </div>
                </div>
              ))}
            </div>
            
            {monthlyTrends.length > 1 && (
              <div className="mt-4">
                <div className="text-red-300 text-sm mb-2">Monthly Progression</div>
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {monthlyTrends.map((month, index) => (
                    <div key={month.month} className="flex flex-col items-center min-w-[80px]">
                      <div className="text-red-400 text-xs">{month.monthLabel.split(' ')[0]}</div>
                      <div 
                        className="bg-red-600 rounded-t-sm mt-1 min-h-[4px] transition-all duration-300"
                        style={{ 
                          height: `${Math.max(4, (month.total / Math.max(...monthlyTrends.map(m => m.total))) * 60)}px`,
                          width: '20px'
                        }}
                      />
                      <div className="text-white text-xs mt-1 font-medium">
                        {formatCurrency(month.total).replace('$', '').replace(',', 'k').slice(0, -3)}k
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trends */}
      <Card className="bg-[#1f0a0a] border border-orange-900/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="h-5 w-5 mr-2 text-orange-400" />
            Weekly Expense Activity (Last 12 Weeks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weeklyTrends.slice(0, 4).map((week) => (
              <div key={week.week} className="bg-orange-900/10 p-4 rounded-lg border border-orange-800/30">
                <div className="text-orange-300 text-sm font-medium">{week.weekLabel}</div>
                <div className="text-white text-lg font-bold mt-1">{formatCurrency(week.total)}</div>
                <div className="text-orange-400 text-sm mt-1">
                  {week.count} expenses
                </div>
                {week.count > 0 && (
                  <div className="text-orange-500 text-xs mt-1">
                    Avg: {formatCurrency(week.average)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Trends */}
      <Card className="bg-[#1f0a0a] border border-yellow-900/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-yellow-400" />
            Category Spending Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryTrends.map((trend) => (
              <div key={trend.category} className="bg-yellow-900/10 p-4 rounded-lg border border-yellow-800/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-200 font-medium">{trend.category}</span>
                  <div className="flex items-center">
                    {trend.isIncreasing && <TrendingUp className="h-4 w-4 text-green-400" />}
                    {trend.isDecreasing && <TrendingDown className="h-4 w-4 text-red-400" />}
                    {!trend.isIncreasing && !trend.isDecreasing && <BarChart3 className="h-4 w-4 text-yellow-400" />}
                  </div>
                </div>
                <div className="text-white text-lg font-bold">{formatCurrency(trend.total)}</div>
                <div className="text-yellow-400 text-sm">
                  {trend.months} months of data
                </div>
                <div className="text-yellow-500 text-xs mt-1">
                  {trend.isIncreasing && 'Increasing trend'}
                  {trend.isDecreasing && 'Decreasing trend'}
                  {!trend.isIncreasing && !trend.isDecreasing && 'Stable trend'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1f0a0a] border border-green-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Trending Up</p>
                <p className="text-white font-bold text-lg">
                  {categoryTrends.filter(t => t.isIncreasing).length}
                </p>
                <p className="text-green-400 text-xs">Categories increasing</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f0a0a] border border-red-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm">Trending Down</p>
                <p className="text-white font-bold text-lg">
                  {categoryTrends.filter(t => t.isDecreasing).length}
                </p>
                <p className="text-red-400 text-xs">Categories decreasing</p>
              </div>
              <TrendingDown className="h-6 w-6 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f0a0a] border border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Recent Activity</p>
                <p className="text-white font-bold text-lg">
                  {weeklyTrends.slice(0, 4).reduce((sum, week) => sum + week.count, 0)}
                </p>
                <p className="text-blue-400 text-xs">Expenses (4 weeks)</p>
              </div>
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
