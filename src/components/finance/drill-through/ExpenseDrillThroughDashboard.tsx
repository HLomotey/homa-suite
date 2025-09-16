import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinanceExpenses } from "@/hooks/finance/useFinanceExpense";
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

interface Expense {
  id: string;
  company: string;
  date: string;
  type: string;
  payee: string;
  category: string;
  total: number;
  createdAt?: string;
}

export const ExpenseDrillThroughDashboard: React.FC<ExpenseDrillThroughDashboardProps> = ({
  onBack,
  dateRanges
}) => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
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
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.total, 0);
    const expenseCount = filteredExpenses.length;
    const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
    
    // Category breakdown
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.total;
      return acc;
    }, {} as Record<string, number>);
    
    // Company breakdown
    const companyTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.company] = (acc[expense.company] || 0) + expense.total;
      return acc;
    }, {} as Record<string, number>);
    
    // Type breakdown
    const typeTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + expense.total;
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

  const handleExpenseSelect = (expense: Expense) => {
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
                  {expenseAnalytics.topCategory ? formatCurrency(expenseAnalytics.topCategory[1]) : ''}
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
                  {expenseAnalytics.topCompany ? formatCurrency(expenseAnalytics.topCompany[1]) : ''}
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
          <Card className="bg-[#1f0a0a] border border-red-900/30">
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Category Analysis</h3>
              <p className="text-red-300">Detailed expense category breakdown coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card className="bg-[#1f0a0a] border border-red-900/30">
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Expense Details</h3>
              <p className="text-red-300">Detailed expense list and filtering coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="bg-[#1f0a0a] border border-red-900/30">
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Expense Trends</h3>
              <p className="text-red-300">Expense trend analysis coming soon</p>
            </CardContent>
          </Card>
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
                <strong>Amount:</strong> {formatCurrency(selectedExpense.total)}
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
