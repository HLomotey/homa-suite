import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useFinanceExpenses, useDeleteFinanceExpense } from '@/hooks/finance';
import { FrontendFinanceExpense } from '@/integration/supabase/types/finance';
import { FinanceExpenseExcelUpload } from './FinanceExpenseExcelUpload';
import { 
  Upload, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  DollarSign,
  TrendingUp,
  Calendar,
  Building,
  PieChart,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';

export function FinanceExpenses() {
  const { data: expenses = [], isLoading, error } = useFinanceExpenses();
  const deleteExpenseMutation = useDeleteFinanceExpense();
  
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Filter expenses based on search and filters
  const filteredExpenses = expenses.filter(expense => {
    const company = (expense.company || '').toString();
    const payee = (expense.payee || '').toString();
    const category = (expense.category || '').toString();

    const matchesSearch =
      company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany = filterCompany === 'all' || company === filterCompany;
    const matchesCategory = filterCategory === 'all' || category === filterCategory;
    const matchesType = filterType === 'all' || expense.type === filterType;

    return matchesSearch && matchesCompany && matchesCategory && matchesType;
  });

  // Get unique values for filters
  const uniqueCompanies = [...new Set(expenses.map(e => e.company).filter(Boolean))] as string[];
  const uniqueCategories = [...new Set(expenses.map(e => e.category).filter(Boolean))] as string[];
  const uniqueTypes = [...new Set(expenses.map(e => e.type).filter(Boolean))] as string[];

  // Calculate comprehensive analytics using useMemo for performance
  const analytics = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number((expense.total ?? expense.amount) ?? 0), 0);
    const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;
    const expenseCount = filteredExpenses.length;

    // Category breakdown
    const categoryBreakdown = filteredExpenses.reduce((acc, expense) => {
      const key = (expense.category || 'Uncategorized') as string;
      const amt = Number((expense.total ?? expense.amount) ?? 0);
      acc[key] = (acc[key] || 0) + amt;
      return acc;
    }, {} as Record<string, number>);

    // Company breakdown
    const companyBreakdown = filteredExpenses.reduce((acc, expense) => {
      const key = (expense.company || 'Unassigned') as string;
      const amt = Number((expense.total ?? expense.amount) ?? 0);
      acc[key] = (acc[key] || 0) + amt;
      return acc;
    }, {} as Record<string, number>);

    // Type breakdown
    const typeBreakdown = filteredExpenses.reduce((acc, expense) => {
      const key = (expense.type || 'Unknown') as string;
      const amt = Number((expense.total ?? expense.amount) ?? 0);
      acc[key] = (acc[key] || 0) + amt;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trend
    const monthlyTrend = filteredExpenses.reduce((acc, expense) => {
      const d = expense.date ? new Date(expense.date) : null;
      const month = d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 7) : 'Unknown';
      const amt = Number((expense.total ?? expense.amount) ?? 0);
      acc[month] = (acc[month] || 0) + amt;
      return acc;
    }, {} as Record<string, number>);

    // Top categories and companies
    const topCategories = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    const topCompanies = Object.entries(companyBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Highest and lowest expenses
    const sortedExpenses = [...filteredExpenses].sort((a, b) => Number((b.total ?? b.amount) ?? 0) - Number((a.total ?? a.amount) ?? 0));
    const highestExpense = sortedExpenses[0];
    const lowestExpense = sortedExpenses[sortedExpenses.length - 1];

    return {
      totalExpenses,
      averageExpense,
      expenseCount,
      categoryBreakdown,
      companyBreakdown,
      typeBreakdown,
      monthlyTrend,
      topCategories,
      topCompanies,
      highestExpense,
      lowestExpense
    };
  }, [filteredExpenses]);

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpenseMutation.mutateAsync(id);
        toast.success('Expense deleted successfully');
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading finance expenses: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Finance Expenses</h2>
          <p className="text-gray-600">Manage and track company expenses</p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Excel
        </Button>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-xl font-bold">{formatCurrency(analytics.totalExpenses)}</p>
                {analytics.highestExpense && (
                  <p className="text-xs text-gray-500 mt-1">
                    Highest: {formatCurrency(analytics.highestExpense.total)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Average Expense</p>
                <p className="text-xl font-bold">{formatCurrency(analytics.averageExpense)}</p>
                {analytics.lowestExpense && (
                  <p className="text-xs text-gray-500 mt-1">
                    Lowest: {formatCurrency(analytics.lowestExpense.total)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-xl font-bold">{analytics.expenseCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.topCategories.length} categories
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Companies</p>
                <p className="text-xl font-bold">{uniqueCompanies.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {Object.keys(analytics.monthlyTrend).length} months
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {uniqueCompanies.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchTerm || filterCompany !== 'all' || filterCategory !== 'all' || filterType !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterCompany('all');
                  setFilterCategory('all');
                  setFilterType('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics and Data Visualization */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="records">All Records</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Categories Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Top Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topCategories.map(([category, amount], index) => {
                    const percentage = (amount / analytics.totalExpenses) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm text-gray-600">
                            {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Companies Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topCompanies.map(([company, amount], index) => {
                    const percentage = (amount / analytics.totalExpenses) * 100;
                    return (
                      <div key={company} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{company}</span>
                          <span className="text-sm text-gray-600">
                            {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Spending Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.monthlyTrend)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([month, amount]) => {
                    const maxAmount = Math.max(...Object.values(analytics.monthlyTrend));
                    const percentage = (amount / maxAmount) * 100;
                    const monthName = new Date(month + '-01').toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    });
                    return (
                      <div key={month} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{monthName}</span>
                          <span className="text-sm text-gray-600">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analytics.categoryBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = (amount / analytics.totalExpenses) * 100;
                    const categoryExpenses = filteredExpenses.filter(e => e.category === category);
                    return (
                      <Card key={category} className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{category}</h3>
                            <Badge variant="outline">{categoryExpenses.length}</Badge>
                          </div>
                          <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
                          <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of total</p>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analytics.companyBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .map(([company, amount]) => {
                    const percentage = (amount / analytics.totalExpenses) * 100;
                    const companyExpenses = filteredExpenses.filter(e => e.company === company);
                    return (
                      <Card key={company} className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{company}</h3>
                            <Badge variant="outline">{companyExpenses.length}</Badge>
                          </div>
                          <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
                          <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of total</p>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Expense Records ({filteredExpenses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading expenses...</div>
              ) : filteredExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {expenses.length === 0 ? 'No expenses found. Upload an Excel file to get started.' : 'No expenses match your filters.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Payee</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{formatDate(expense.date)}</TableCell>
                          <TableCell className="font-medium">{expense.company}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{expense.type}</Badge>
                          </TableCell>
                          <TableCell>{expense.payee}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{expense.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(expense.total)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteExpense(expense.id)}
                                disabled={deleteExpenseMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Excel Upload Modal */}
      {showUpload && (
        <FinanceExpenseExcelUpload
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
