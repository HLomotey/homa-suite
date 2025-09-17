import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CompanyAccountFilter, CompanyAccount } from './CompanyAccountFilter';
import { DateRangeFilter, DateRange } from './DateRangeFilter';
import { PnLAnalysis } from './PnLAnalysis';
import { useFinanceAnalysis } from '@/hooks/useFinanceAnalysis';
import { AlertCircle, BarChart3 } from 'lucide-react';

export function FinanceAnalysisDashboard() {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    from: new Date(2025, 0, 1), // Start of 2025
    to: new Date(2025, 11, 31)  // End of 2025
  }));

  // Memoize the filters object to prevent unnecessary re-renders
  const filters = React.useMemo(() => ({
    companyAccountId: selectedAccountId,
    dateRange
  }), [selectedAccountId, dateRange]);

  const { loading, companyAccounts, pnlData, error } = useFinanceAnalysis(filters);

  const selectedCompany = companyAccounts.find(c => c.id === selectedAccountId);
  const companyName = selectedCompany ? selectedCompany.name : 'All Companies';
  
  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`;
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Finance Analysis Dashboard</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CompanyAccountFilter
              companyAccounts={companyAccounts}
              selectedAccountId={selectedAccountId}
              onAccountChange={setSelectedAccountId}
              loading={loading}
            />
            <DateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              loading={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* P&L Analysis */}
      <PnLAnalysis
        data={pnlData}
        loading={loading}
        companyName={companyName}
        dateRange={formatDateRange()}
      />
    </div>
  );
}
