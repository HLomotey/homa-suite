import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { useProjectionSummary } from '@/hooks/projection/useProjectionSummary';

const ProjectionSummary = () => {
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [groupBy, setGroupBy] = useState<'year' | 'month'>('year');

  const { 
    summaryData, 
    loading, 
    error, 
    getUniqueCompanies, 
    getUniqueYears 
  } = useProjectionSummary({
    company: selectedCompany,
    year: selectedYear,
    groupBy
  });

  const companies = getUniqueCompanies();
  const years = getUniqueYears();

  // Calculate totals for statistics cards
  const totals = useMemo(() => {
    return {
      totalExpectedRevenue: summaryData.reduce((sum, item) => sum + item.total_expected_revenue, 0),
      totalActualRevenue: summaryData.reduce((sum, item) => sum + item.total_actual_revenue, 0),
      totalExpectedHours: summaryData.reduce((sum, item) => sum + item.total_expected_hours, 0),
      totalProjections: summaryData.reduce((sum, item) => sum + item.projection_count, 0)
    };
  }, [summaryData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading summary data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-500">
          <p>Error loading summary data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Projections Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Companies</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear?.toString() || 'ALL'} onValueChange={(value) => setSelectedYear(value === 'ALL' ? undefined : parseInt(value))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Group By</label>
              <Select value={groupBy} onValueChange={(value: 'year' | 'month') => setGroupBy(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expected Revenue</p>
                <p className="text-2xl font-bold">
                  ${totals.totalExpectedRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Actual Revenue</p>
                <p className="text-2xl font-bold">
                  ${totals.totalActualRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expected Hours</p>
                <p className="text-2xl font-bold">
                  {totals.totalExpectedHours.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projections</p>
                <p className="text-2xl font-bold">
                  {totals.totalProjections}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Summary by Company {groupBy === 'month' ? 'and Month' : 'and Year'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Projections</TableHead>
                  <TableHead className="text-right">Expected Hours</TableHead>
                  <TableHead className="text-right">Expected Revenue</TableHead>
                  <TableHead className="text-right">Actual Hours</TableHead>
                  <TableHead className="text-right">Actual Revenue</TableHead>
                  <TableHead className="text-right">Gross Wages</TableHead>
                  <TableHead className="text-right">Gross Income</TableHead>
                  <TableHead className="text-right">Total Expenditures</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No projection data available for the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  summaryData.map((summary, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{summary.company_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {groupBy === 'month' ? `${summary.month_name} ${summary.year}` : summary.year}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{summary.projection_count}</TableCell>
                        <TableCell className="text-right">{summary.total_expected_hours.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${summary.total_expected_revenue.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{summary.total_actual_hours.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${summary.total_actual_revenue.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${summary.total_monthly_gross_wages_salaries.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${summary.total_monthly_gross_income.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${summary.total_expenditures.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectionSummary;
