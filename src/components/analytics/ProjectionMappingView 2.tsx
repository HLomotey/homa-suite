import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { usePerformanceAnalytics } from '@/hooks/finance/usePerformanceAnalytics';
import { 
  ArrowUpDown, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Calendar,
  DollarSign,
  Clock
} from 'lucide-react';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const ProjectionMappingView: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'company_name', direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const dateRanges = [{ year: selectedYear, month: 1 }]; // Full year data
  const { data: performanceData, isLoading } = usePerformanceAnalytics(dateRanges);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getVarianceColor = (percentage: number) => {
    if (percentage >= 10) return 'text-green-600';
    if (percentage >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVarianceBadge = (percentage: number) => {
    if (percentage >= 10) return 'bg-green-100 text-green-800';
    if (percentage >= 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const filteredAndSortedData = useMemo(() => {
    if (!performanceData?.companyPerformances) return [];

    let filtered = performanceData.companyPerformances.filter(company => {
      const matchesSearch = company.company_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'over' && company.variance_percentage > 0) ||
        (filterStatus === 'under' && company.variance_percentage < 0) ||
        (filterStatus === 'on-target' && Math.abs(company.variance_percentage) < 5);
      
      return matchesSearch && matchesFilter;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key as keyof typeof a];
      let bValue = b[sortConfig.key as keyof typeof b];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [performanceData, searchTerm, sortConfig, filterStatus]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    return sortConfig.direction === 'asc' ? 
      <TrendingUp className="h-4 w-4 text-blue-500" /> : 
      <TrendingDown className="h-4 w-4 text-blue-500" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projection vs Actual Mapping</h2>
          <p className="text-gray-600">Detailed comparison of projected and actual performance by company</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Companies</p>
                <p className="text-2xl font-bold">{performanceData?.companyPerformances.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Projected</p>
                <p className="text-2xl font-bold">{formatCurrency(performanceData?.totalProjectedRevenue || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Actual</p>
                <p className="text-2xl font-bold">{formatCurrency(performanceData?.totalActualRevenue || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {performanceData?.overallVariance && performanceData.overallVariance >= 0 ? 
                <TrendingUp className="h-5 w-5 text-green-500" /> : 
                <TrendingDown className="h-5 w-5 text-red-500" />
              }
              <div>
                <p className="text-sm text-muted-foreground">Overall Variance</p>
                <p className={`text-2xl font-bold ${getVarianceColor(performanceData?.overallVariancePercentage || 0)}`}>
                  {performanceData?.overallVariancePercentage && performanceData.overallVariancePercentage >= 0 ? '+' : ''}
                  {performanceData?.overallVariancePercentage?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                <SelectItem value="over">Over-performing</SelectItem>
                <SelectItem value="under">Under-performing</SelectItem>
                <SelectItem value="on-target">On Target (±5%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Summary by Company and Year
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('company_name')}
                      className="font-medium text-gray-900 hover:bg-gray-100"
                    >
                      Company {getSortIcon('company_name')}
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('period')}
                      className="font-medium text-gray-900 hover:bg-gray-100"
                    >
                      Period {getSortIcon('period')}
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('projected_hours')}
                      className="font-medium text-gray-900 hover:bg-gray-100"
                    >
                      Projected Hours {getSortIcon('projected_hours')}
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('projected_revenue')}
                      className="font-medium text-gray-900 hover:bg-gray-100"
                    >
                      Expected Revenue {getSortIcon('projected_revenue')}
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('actual_hours')}
                      className="font-medium text-gray-900 hover:bg-gray-100"
                    >
                      Actual Hours {getSortIcon('actual_hours')}
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('actual_revenue')}
                      className="font-medium text-gray-900 hover:bg-gray-100"
                    >
                      Actual Revenue {getSortIcon('actual_revenue')}
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="font-medium text-gray-900">Gross Wages</span>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="font-medium text-gray-900">Gross Income</span>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('variance_percentage')}
                      className="font-medium text-gray-900 hover:bg-gray-100"
                    >
                      Performance {getSortIcon('variance_percentage')}
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedData.map((company, index) => {
                  const grossWages = company.actual_revenue * 0.65; // Estimate 65% for wages
                  const grossIncome = company.actual_revenue - grossWages;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{company.company_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{selectedYear}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium">
                          {company.projected_hours ? formatNumber(company.projected_hours) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-blue-600">
                          {formatCurrency(company.projected_revenue)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium">
                          {company.actual_hours ? formatNumber(company.actual_hours) : '0'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(company.actual_revenue)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-purple-600">
                          {formatCurrency(grossWages)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-orange-600">
                          {formatCurrency(grossIncome)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getPerformanceIcon(company.variance_percentage)}
                          <Badge className={getVarianceBadge(company.variance_percentage)}>
                            {company.variance_percentage >= 0 ? '+' : ''}{company.variance_percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">No companies found</p>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectionMappingView;
