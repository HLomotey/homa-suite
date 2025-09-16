import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Receipt, 
  Search, 
  Filter, 
  Calendar, 
  Building, 
  User, 
  DollarSign,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface Expense {
  id: string;
  Company: string;
  Date: string;
  Type: string;
  Payee: string;
  Category: string;
  Total: number;
}

interface ExpenseDetailsListProps {
  expenses: Expense[];
  loading: boolean;
  onExpenseSelect: (expense: Expense) => void;
}

export const ExpenseDetailsList: React.FC<ExpenseDetailsListProps> = ({
  expenses,
  loading,
  onExpenseSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Expense>('Date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unique categories and companies for filters
  const categories = [...new Set(expenses.map(e => e.Category))].sort();
  const companies = [...new Set(expenses.map(e => e.Company))].sort();

  // Filter and sort expenses
  const filteredAndSortedExpenses = React.useMemo(() => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = !searchTerm || 
        expense.Payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.Category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.Company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.Type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || expense.Category === selectedCategory;
      const matchesCompany = !selectedCompany || expense.Company === selectedCompany;
      
      return matchesSearch && matchesCategory && matchesCompany;
    });

    // Sort expenses
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'Total') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortField === 'Date') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [expenses, searchTerm, sortField, sortDirection, selectedCategory, selectedCompany]);

  const handleSort = (field: keyof Expense) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: keyof Expense) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    const index = category.length % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <Card className="bg-[#1f0a0a] border border-red-900/30">
        <CardHeader>
          <CardTitle className="text-white">Loading expense details...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-red-800/20 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <Card className="bg-[#1f0a0a] border border-red-900/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="h-5 w-5 mr-2 text-red-400" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-400" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-red-900/20 border-red-800/50 text-white placeholder-red-400"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-red-900/20 border border-red-800/50 rounded-md text-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-3 py-2 bg-red-900/20 border border-red-800/50 rounded-md text-white"
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>

            <div className="text-red-300 text-sm flex items-center">
              <Receipt className="h-4 w-4 mr-2" />
              {filteredAndSortedExpenses.length} expenses found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense List */}
      <Card className="bg-[#1f0a0a] border border-red-900/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Receipt className="h-5 w-5 mr-2 text-red-400" />
            Expense Details ({filteredAndSortedExpenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedExpenses.length === 0 ? (
            <div className="text-center py-8 text-red-400">
              No expenses found matching your criteria
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-7 gap-4 p-3 bg-red-900/20 rounded-lg text-red-300 text-sm font-medium">
                <button 
                  onClick={() => handleSort('Date')}
                  className="flex items-center space-x-1 hover:text-red-200"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                  {getSortIcon('Date')}
                </button>
                <button 
                  onClick={() => handleSort('Company')}
                  className="flex items-center space-x-1 hover:text-red-200"
                >
                  <Building className="h-4 w-4" />
                  <span>Company</span>
                  {getSortIcon('Company')}
                </button>
                <button 
                  onClick={() => handleSort('Payee')}
                  className="flex items-center space-x-1 hover:text-red-200"
                >
                  <User className="h-4 w-4" />
                  <span>Payee</span>
                  {getSortIcon('Payee')}
                </button>
                <button 
                  onClick={() => handleSort('Category')}
                  className="flex items-center space-x-1 hover:text-red-200"
                >
                  <span>Category</span>
                  {getSortIcon('Category')}
                </button>
                <button 
                  onClick={() => handleSort('Type')}
                  className="flex items-center space-x-1 hover:text-red-200"
                >
                  <span>Type</span>
                  {getSortIcon('Type')}
                </button>
                <button 
                  onClick={() => handleSort('Total')}
                  className="flex items-center space-x-1 hover:text-red-200"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Amount</span>
                  {getSortIcon('Total')}
                </button>
                <span>Actions</span>
              </div>

              {/* Expense Rows */}
              {filteredAndSortedExpenses.map((expense) => (
                <div 
                  key={expense.id}
                  className="grid grid-cols-7 gap-4 p-3 bg-red-900/10 hover:bg-red-900/20 rounded-lg transition-colors border border-red-800/30"
                >
                  <div className="text-red-200 text-sm">
                    {formatDate(expense.Date)}
                  </div>
                  <div className="text-white font-medium">
                    {expense.Company}
                  </div>
                  <div className="text-red-200">
                    {expense.Payee}
                  </div>
                  <div>
                    <Badge 
                      className={`${getCategoryColor(expense.Category)} text-white text-xs`}
                    >
                      {expense.Category}
                    </Badge>
                  </div>
                  <div className="text-red-300 text-sm">
                    {expense.Type}
                  </div>
                  <div className="text-white font-semibold">
                    {formatCurrency(expense.Total)}
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onExpenseSelect(expense)}
                      className="border-red-800/50 text-red-300 hover:bg-red-900/30 hover:text-red-200"
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1f0a0a] border border-green-900/30">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-green-300 text-sm">Total Amount</p>
              <p className="text-white text-xl font-bold">
                {formatCurrency(filteredAndSortedExpenses.reduce((sum, e) => sum + e.Total, 0))}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1f0a0a] border border-blue-900/30">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-blue-300 text-sm">Average Amount</p>
              <p className="text-white text-xl font-bold">
                {formatCurrency(
                  filteredAndSortedExpenses.length > 0 
                    ? filteredAndSortedExpenses.reduce((sum, e) => sum + e.Total, 0) / filteredAndSortedExpenses.length
                    : 0
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1f0a0a] border border-purple-900/30">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-purple-300 text-sm">Expense Count</p>
              <p className="text-white text-xl font-bold">
                {filteredAndSortedExpenses.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
