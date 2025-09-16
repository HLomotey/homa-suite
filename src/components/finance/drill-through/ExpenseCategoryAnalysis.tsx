import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, BarChart3, Building, Receipt, TrendingUp, TrendingDown } from "lucide-react";

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

interface ExpenseCategoryAnalysisProps {
  expenses: Expense[];
  loading: boolean;
  analytics: ExpenseAnalytics;
}

export const ExpenseCategoryAnalysis: React.FC<ExpenseCategoryAnalysisProps> = ({
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

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  };

  // Sort categories by total amount
  const sortedCategories = Object.entries(analytics.categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10); // Top 10 categories

  // Sort companies by total amount
  const sortedCompanies = Object.entries(analytics.companyTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8); // Top 8 companies

  // Sort types by total amount
  const sortedTypes = Object.entries(analytics.typeTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6); // Top 6 types

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
      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1f0a0a] border border-red-900/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-red-400" />
              Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedCategories.map(([category, total], index) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: `hsl(${(index * 360) / sortedCategories.length}, 70%, 50%)` 
                      }}
                    />
                    <span className="text-red-200 text-sm font-medium">{category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{formatCurrency(total)}</div>
                    <div className="text-red-400 text-xs">
                      {getPercentage(total, analytics.totalExpenses)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f0a0a] border border-orange-900/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Building className="h-5 w-5 mr-2 text-orange-400" />
              Company Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedCompanies.map(([company, total], index) => (
                <div key={company} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: `hsl(${30 + (index * 360) / sortedCompanies.length}, 70%, 50%)` 
                      }}
                    />
                    <span className="text-orange-200 text-sm font-medium">{company}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{formatCurrency(total)}</div>
                    <div className="text-orange-400 text-xs">
                      {getPercentage(total, analytics.totalExpenses)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Types */}
      <Card className="bg-[#1f0a0a] border border-yellow-900/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Receipt className="h-5 w-5 mr-2 text-yellow-400" />
            Expense Types Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTypes.map(([type, total], index) => (
              <div key={type} className="bg-yellow-900/10 p-4 rounded-lg border border-yellow-800/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-200 font-medium">{type}</span>
                  <Receipt className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="text-white text-lg font-bold">{formatCurrency(total)}</div>
                <div className="text-yellow-400 text-sm">
                  {getPercentage(total, analytics.totalExpenses)}% of total
                </div>
                <div className="mt-2 bg-yellow-800/20 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getPercentage(total, analytics.totalExpenses)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1f0a0a] border border-green-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Highest Category</p>
                <p className="text-white font-bold text-lg">
                  {sortedCategories[0]?.[0] || 'N/A'}
                </p>
                <p className="text-green-400 text-xs">
                  {sortedCategories[0] ? formatCurrency(sortedCategories[0][1]) : ''}
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
                <p className="text-blue-300 text-sm">Categories Count</p>
                <p className="text-white font-bold text-lg">{analytics.categoryCount}</p>
                <p className="text-blue-400 text-xs">Active categories</p>
              </div>
              <PieChart className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f0a0a] border border-purple-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Avg per Category</p>
                <p className="text-white font-bold text-lg">
                  {formatCurrency(analytics.totalExpenses / Math.max(analytics.categoryCount, 1))}
                </p>
                <p className="text-purple-400 text-xs">Average spend</p>
              </div>
              <BarChart3 className="h-6 w-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f0a0a] border border-indigo-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-300 text-sm">Top Company</p>
                <p className="text-white font-bold text-lg">
                  {sortedCompanies[0]?.[0] || 'N/A'}
                </p>
                <p className="text-indigo-400 text-xs">
                  {sortedCompanies[0] ? formatCurrency(sortedCompanies[0][1]) : ''}
                </p>
              </div>
              <Building className="h-6 w-6 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
