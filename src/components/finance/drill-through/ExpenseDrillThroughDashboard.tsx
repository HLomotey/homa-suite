import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinanceExpenses } from "@/hooks/finance/useFinanceExpense";
import { FrontendFinanceExpense } from "@/integration/supabase/types/finance";
// import { ExpenseCategoryAnalysis } from "./ExpenseCategoryAnalysis";
// import { ExpenseDetailsList } from "./ExpenseDetailsList";
// import { ExpenseTrendsAnalysis } from "./ExpenseTrendsAnalysis";
import { ArrowLeft, BarChart3, Receipt, TrendingUp, PieChart, AlertTriangle, Building } from "lucide-react";

interface DateRange {
  year: number;
  month: number;
  label: string;
}

interface ExpenseDrillThroughDashboardProps {
  onBack: () => void;
  dateRanges?: DateRange[];
}

export const ExpenseDrillThroughDashboard: React.FC<ExpenseDrillThroughDashboardProps> = ({
  onBack,
  dateRanges
}) => {
  const [selectedExpense, setSelectedExpense] = useState<FrontendFinanceExpense | null>(null);
  const [activeTab, setActiveTab] = useState('categories');
  
  const { data: expenses = [], isLoading } = useFinanceExpenses();

  // Filter expenses by date ranges if provided
  const filteredExpenses = React.useMemo(() => {
    if (!dateRanges || dateRanges.length === 0) return expenses;
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth() + 1;
      
      return dateRanges.some(range => 
        range.year === expenseYear && range.month === expenseMonth
      );
    });
  }, [expenses, dateRanges]);

  // Calculate expense analytics
  const expenseAnalytics = React.useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, expense: any) => sum + Number((expense.total ?? expense.amount) ?? 0), 0);
    const expenseCount = filteredExpenses.length;
    const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
    
    // Category breakdown
    const categoryTotals = filteredExpenses.reduce((acc, expense: any) => {
      const key = (expense.category || 'Uncategorized') as string;
      const amt = Number((expense.total ?? expense.amount) ?? 0);
      acc[key] = (acc[key] || 0) + amt;
      return acc;
    }, {} as Record<string, number>);
    
    // Company breakdown
    const companyTotals = filteredExpenses.reduce((acc, expense: any) => {
      const key = (expense.company || 'Unassigned') as string;
      const amt = Number((expense.total ?? expense.amount) ?? 0);
      acc[key] = (acc[key] || 0) + amt;
      return acc;
    }, {} as Record<string, number>);
    
    // Type breakdown
    const typeTotals = filteredExpenses.reduce((acc, expense: any) => {
      const key = (expense.type || 'Unknown') as string;
      const amt = Number((expense.total ?? expense.amount) ?? 0);
      acc[key] = (acc[key] || 0) + amt;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalExpenses,
      expenseCount,
      averageExpense,
      categoryCount: Object.keys(categoryTotals).length,
      companyCount: Object.keys(companyTotals).length,
      typeCount: Object.keys(typeTotals).length,
      categoryTotals,
      companyTotals,
      typeTotals,
      topCategory: Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0],
      topCompany: Object.entries(companyTotals).sort(([,a], [,b]) => b - a)[0]
    };
  }, [filteredExpenses]);

  const handleExpenseSelect = (expense: FrontendFinanceExpense) => {
    setSelectedExpense(expense);
    console.log('Selected expense:', expense);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-gradient-to-r from-red-900 to-orange-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Receipt className="h-6 w-6 mr-2 text-red-300" />
            Expense Drill-Through Analysis
          </h2>
          <Button variant="secondary" size="sm" onClick={onBack} className="bg-red-800 hover:bg-red-700 text-white border-none">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-red-800/20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-red-900 to-orange-900 p-4 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Receipt className="h-6 w-6 mr-2 text-red-300" />
          Expense Drill-Through Analysis
          {dateRanges && dateRanges.length > 0 && (
            <span className="ml-2 text-red-300 text-lg">
              - {dateRanges.length === 1 ? dateRanges[0].label : `${dateRanges.length} periods selected`}
            </span>
          )}
        </h2>
        <Button variant="secondary" size="sm" onClick={onBack} className="bg-red-800 hover:bg-red-700 text-white border-none">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1f0a0a] border border-red-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-red-400 mr-3" />
              <div>
                <p className="text-sm text-red-300">Total Expenses</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(expenseAnalytics.totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f0a0a] border border-orange-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-400 mr-3" />
              <div>
                <p className="text-sm text-orange-300">Expense Count</p>
                <p className="text-2xl font-bold text-white">
                  {expenseAnalytics.expenseCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f0a0a] border border-yellow-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              <PieChart className="h-8 w-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-sm text-yellow-300">Categories</p>
                <p className="text-2xl font-bold text-white">
                  {expenseAnalytics.categoryCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f0a0a] border border-purple-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-purple-400 mr-3" />
              <div>
                <p className="text-sm text-purple-300">Companies</p>
                <p className="text-2xl font-bold text-white">
                  {expenseAnalytics.companyCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1f0a0a] border border-green-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Average Expense</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(expenseAnalytics.averageExpense)}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f0a0a] border border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Top Category</p>
                <p className="text-lg font-bold text-white">
                  {expenseAnalytics.topCategory?.[0] || 'N/A'}
                </p>
                <p className="text-xs text-blue-400">
                  {expenseAnalytics.topCategory ? formatCurrency(expenseAnalytics.topCategory[1] || 0) : ''}
                </p>
              </div>
              <PieChart className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f0a0a] border border-indigo-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-300">Top Company</p>
                <p className="text-lg font-bold text-white">
                  {expenseAnalytics.topCompany?.[0] || 'N/A'}
                </p>
                <p className="text-xs text-indigo-400">
                  {expenseAnalytics.topCompany ? formatCurrency(expenseAnalytics.topCompany[1] || 0) : ''}
                </p>
              </div>
              <Building className="h-6 w-6 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drill-Through Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-red-900/20 border border-red-800/50">
          <TabsTrigger 
            value="categories" 
            className="data-[state=active]:bg-red-800 data-[state=active]:text-white text-red-300"
          >
            <PieChart className="h-4 w-4 mr-2" />
            Category Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="details" 
            className="data-[state=active]:bg-red-800 data-[state=active]:text-white text-red-300"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Expense Details
          </TabsTrigger>
          <TabsTrigger 
            value="trends" 
            className="data-[state=active]:bg-red-800 data-[state=active]:text-white text-red-300"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Expense Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Chart */}
            <Card className="bg-[#1f0a0a] border border-red-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-red-400" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(expenseAnalytics.categoryTotals)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 8)
                    .map(([category, amount], index) => {
                      const denominator = expenseAnalytics.totalExpenses || 0;
                      const percentage = denominator > 0 ? (amount / denominator) * 100 : 0;
                      const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'];
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                            <span className="text-white text-sm font-medium truncate">{category}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">{formatCurrency(amount)}</div>
                            <div className="text-red-300 text-xs">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </CardContent>
            </Card>

            {/* Category Summary Stats */}
            <Card className="bg-[#1f0a0a] border border-red-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-orange-400" />
                  Category Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-900/20 rounded-lg border border-red-800/30">
                    <div className="text-red-300 text-sm">Highest Category</div>
                    <div className="text-white font-bold">{expenseAnalytics.topCategory?.[0] || 'N/A'}</div>
                    <div className="text-red-400 text-sm">{expenseAnalytics.topCategory ? formatCurrency(expenseAnalytics.topCategory[1]) : ''}</div>
                  </div>
                  
                  <div className="p-3 bg-orange-900/20 rounded-lg border border-orange-800/30">
                    <div className="text-orange-300 text-sm">Total Categories</div>
                    <div className="text-white font-bold">{expenseAnalytics.categoryCount}</div>
                    <div className="text-orange-400 text-sm">Active categories</div>
                  </div>
                  
                  <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-800/30">
                    <div className="text-yellow-300 text-sm">Average per Category</div>
                    <div className="text-white font-bold">{formatCurrency(
                      expenseAnalytics.categoryCount > 0 ? (expenseAnalytics.totalExpenses / expenseAnalytics.categoryCount) : 0
                    )}</div>
                    <div className="text-yellow-400 text-sm">Mean spending</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card className="bg-[#1f0a0a] border border-red-900/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Receipt className="h-5 w-5 mr-2 text-red-400" />
                Expense Details ({filteredExpenses.length} expenses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {filteredExpenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense, index) => (
                      <div 
                        key={expense.id || index}
                        className="flex items-center justify-between p-3 bg-red-900/10 rounded-lg border border-red-800/20 hover:bg-red-900/20 transition-colors cursor-pointer"
                        onClick={() => handleExpenseSelect(expense)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="text-white font-medium">{expense.payee}</div>
                            <div className="text-red-300 text-sm px-2 py-1 bg-red-900/30 rounded">
                              {expense.category}
                            </div>
                          </div>
                          <div className="text-red-400 text-sm mt-1">
                            {expense.company} • {new Date(expense.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{formatCurrency(Number((expense.total ?? expense.amount ?? 0)))}</div>
                          <div className="text-red-300 text-sm">{expense.type}</div>
                        </div>
                      </div>
                    ))
                  }
                  {filteredExpenses.length > 0 && (
                    <div className="text-center p-4 text-red-300 text-sm">
                      Showing all {filteredExpenses.length} expenses
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card className="bg-[#1f0a0a] border border-red-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                  Monthly Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const monthlyData = filteredExpenses.reduce((acc, expense: any) => {
                      const date = new Date(expense.date);
                      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                      
                      if (!acc[monthKey]) {
                        acc[monthKey] = { label: monthLabel, total: 0, count: 0 };
                      }
                      acc[monthKey].total += Number((expense.total ?? expense.amount) ?? 0);
                      acc[monthKey].count += 1;
                      return acc;
                    }, {} as Record<string, { label: string; total: number; count: number }>);
                    
                    return Object.entries(monthlyData)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .slice(0, 6)
                      .map(([month, data]) => (
                        <div key={month} className="flex items-center justify-between p-3 bg-green-900/10 rounded-lg border border-green-800/20">
                          <div>
                            <div className="text-white font-medium">{data.label}</div>
                            <div className="text-green-400 text-sm">{data.count} expenses</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">{formatCurrency(data.total)}</div>
                            <div className="text-green-300 text-sm">
                              Avg: {formatCurrency(data.total / data.count)}
                            </div>
                          </div>
                        </div>
                      ));
                  })()
                  }
                </div>
              </CardContent>
            </Card>

            {/* Company Trends */}
            <Card className="bg-[#1f0a0a] border border-red-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-400" />
                  Company Spending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(expenseAnalytics.companyTotals)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 6)
                    .map(([company, amount]) => {
                      const companyExpenses = filteredExpenses.filter(e => e.company === company);
                      const avgExpense = amount / companyExpenses.length;
                      return (
                        <div key={company} className="flex items-center justify-between p-3 bg-blue-900/10 rounded-lg border border-blue-800/20">
                          <div>
                            <div className="text-white font-medium">{company}</div>
                            <div className="text-blue-400 text-sm">{companyExpenses.length} expenses</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">{formatCurrency(amount)}</div>
                            <div className="text-blue-300 text-sm">
                              Avg: {formatCurrency(avgExpense)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Expense Modal/Panel */}
      {selectedExpense && (
        <Card className="bg-[#1f0a0a] border border-red-900/30 fixed bottom-4 right-4 w-96 z-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">Expense Selected</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedExpense(null)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm">
              <div className="text-red-300">
                <strong>Company:</strong> {selectedExpense.company}
              </div>
              <div className="text-red-300">
                <strong>Payee:</strong> {selectedExpense.payee}
              </div>
              <div className="text-red-300">
                <strong>Category:</strong> {selectedExpense.category}
              </div>
              <div className="text-red-300">
                <strong>Type:</strong> {selectedExpense.type}
              </div>
              <div className="text-red-300">
                <strong>Amount:</strong> {formatCurrency(Number((selectedExpense.total ?? selectedExpense.amount ?? 0)))}
              </div>
              <div className="text-red-300">
                <strong>Date:</strong> {new Date(selectedExpense.date).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpenseDrillThroughDashboard;
