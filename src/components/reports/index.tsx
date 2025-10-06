import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useReports } from '@/hooks/reports/useReports';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  Building2, 
  Truck, 
  Users, 
  DollarSign,
  BarChart3,
  FileSpreadsheet,
  FileImage,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ReportFilters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  properties: string[];
  status: string[];
  reportType: string;
  exportFormat: 'excel' | 'pdf';
}

interface ReportModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
  reportTypes: {
    id: string;
    name: string;
    description: string;
  }[];
}

export function Reports() {
  const { toast } = useToast();
  const { generateReport, isGenerating, error, clearError } = useReports();
  const [selectedModule, setSelectedModule] = useState<string>('housing');
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    properties: [],
    status: [],
    reportType: '',
    exportFormat: 'excel'
  });

  const reportModules: ReportModule[] = [
    {
      id: 'housing',
      name: 'Housing Reports',
      description: 'Property assignments, rent, deposits, and occupancy reports',
      icon: <Building2 className="h-5 w-5" />,
      color: 'bg-blue-500',
      available: true,
      reportTypes: [
        { id: 'assignments', name: 'Assignment Summary', description: 'Current and historical property assignments' },
        { id: 'occupancy', name: 'Occupancy Report', description: 'Property occupancy rates and availability' },
        { id: 'rent-collection', name: 'Rent Collection', description: 'Rent payments and outstanding balances' },
        { id: 'security-deposits', name: 'Security Deposits', description: 'Security deposit status and deductions' },
        { id: 'property-maintenance', name: 'Property Maintenance', description: 'Maintenance requests and completion rates' }
      ]
    },
    {
      id: 'transportation',
      name: 'Transportation Reports',
      description: 'Vehicle fleet, maintenance, routes, and billing reports',
      icon: <Truck className="h-5 w-5" />,
      color: 'bg-green-500',
      available: true,
      reportTypes: [
        { id: 'fleet-summary', name: 'Fleet Summary', description: 'Vehicle inventory and status overview' },
        { id: 'maintenance-schedule', name: 'Maintenance Schedule', description: 'Upcoming and overdue maintenance' },
        { id: 'route-efficiency', name: 'Route Efficiency', description: 'Route performance and optimization data' },
        { id: 'transport-billing', name: 'Transport Billing', description: 'Transportation charges and payments' },
        { id: 'fuel-consumption', name: 'Fuel Consumption', description: 'Fuel usage and cost analysis' }
      ]
    },
    {
      id: 'hr',
      name: 'HR Reports',
      description: 'Staff management, payroll, and benefits reports',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-500',
      available: true,
      reportTypes: [
        { id: 'staff-roster', name: 'Staff Roster', description: 'Active staff directory and contact information' },
        { id: 'benefits-enrollment', name: 'Benefits Enrollment', description: 'Staff benefits participation rates' },
        { id: 'termination-summary', name: 'Termination Summary', description: 'Staff termination trends and reasons' },
        { id: 'diversity-metrics', name: 'Diversity Metrics', description: 'Workforce diversity and inclusion data' }
      ]
    },
    {
      id: 'finance',
      name: 'Finance Reports',
      description: 'Financial performance, budgets, and projections',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-yellow-500',
      available: true,
      reportTypes: [
        { id: 'financial-summary', name: 'Financial Summary', description: 'Revenue, expenses, and profit analysis' },
        { id: 'budget-variance', name: 'Budget Variance', description: 'Budget vs actual performance' },
        { id: 'cash-flow', name: 'Cash Flow', description: 'Cash flow projections and trends' },
        { id: 'cost-analysis', name: 'Cost Analysis', description: 'Detailed cost breakdown by category' }
      ]
    },
    {
      id: 'operations',
      name: 'Operations Reports',
      description: 'Job orders, performance metrics, and analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'bg-orange-500',
      available: true,
      reportTypes: [
        { id: 'job-orders', name: 'Job Orders', description: 'Work order status and completion rates' },
        { id: 'performance-metrics', name: 'Performance Metrics', description: 'Operational KPIs and benchmarks' },
        { id: 'productivity-analysis', name: 'Productivity Analysis', description: 'Team and department productivity' }
      ]
    }
  ];

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const handleGenerateReport = async () => {
    if (!filters.reportType) {
      toast({
        title: "Validation Error",
        description: "Please select a report type before generating.",
        variant: "destructive",
      });
      return;
    }

    try {
      clearError();
      await generateReport(selectedModule, filters.reportType, filters);
      
      const selectedModuleData = reportModules.find(m => m.id === selectedModule);
      const selectedReportType = selectedModuleData?.reportTypes.find(r => r.id === filters.reportType);
      
      toast({
        title: "Report Generated Successfully",
        description: `${selectedReportType?.name} report has been generated and downloaded as ${filters.exportFormat.toUpperCase()}.`,
      });
      
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "There was an error generating the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedModuleData = reportModules.find(m => m.id === selectedModule);

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Center</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive reports across all modules with customizable filters</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {reportModules.filter(m => m.available).length} Modules Available
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Module Selection Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Report Modules
              </CardTitle>
              <CardDescription>
                Select a module to generate reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportModules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => {
                    setSelectedModule(module.id);
                    setFilters(prev => ({ ...prev, reportType: '' }));
                  }}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedModule === module.id
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md text-white ${module.color}`}>
                      {module.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{module.name}</p>
                      <p className="text-xs text-gray-500 truncate">{module.description}</p>
                    </div>
                    {module.available && (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Report Configuration */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedModuleData?.icon}
                {selectedModuleData?.name}
              </CardTitle>
              <CardDescription>
                Configure filters and generate reports for {selectedModuleData?.name.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="filters" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="filters" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters & Options
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Report Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="filters" className="space-y-6">
                  {/* Report Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Report Type</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedModuleData?.reportTypes.map((reportType) => (
                        <button
                          key={reportType.id}
                          onClick={() => handleFilterChange('reportType', reportType.id)}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            filters.reportType === reportType.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <h4 className="font-medium text-sm">{reportType.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{reportType.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={filters.dateRange.startDate}
                        onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={filters.dateRange.endDate}
                        onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label>Status Filter</Label>
                    <Select onValueChange={(value) => handleFilterChange('status', [value])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status filter (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="inactive">Inactive Only</SelectItem>
                        <SelectItem value="pending">Pending Only</SelectItem>
                        <SelectItem value="completed">Completed Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Export Format */}
                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleFilterChange('exportFormat', 'excel')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                          filters.exportFormat === 'excel'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel (.xlsx)
                      </button>
                      <button
                        onClick={() => handleFilterChange('exportFormat', 'pdf')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                          filters.exportFormat === 'pdf'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <FileImage className="h-4 w-4" />
                        PDF (.pdf)
                      </button>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="pt-4">
                    <Button 
                      onClick={handleGenerateReport} 
                      disabled={isGenerating || !filters.reportType}
                      className="w-full md:w-auto"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <div className="border rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Report Preview</h3>
                    </div>
                    {filters.reportType ? (
                      <div className="space-y-3 text-sm">
                        <p><strong>Module:</strong> {selectedModuleData?.name}</p>
                        <p><strong>Report Type:</strong> {selectedModuleData?.reportTypes.find(r => r.id === filters.reportType)?.name}</p>
                        <p><strong>Date Range:</strong> {filters.dateRange.startDate} to {filters.dateRange.endDate}</p>
                        <p><strong>Export Format:</strong> {filters.exportFormat.toUpperCase()}</p>
                        <p><strong>Status Filter:</strong> {filters.status.length > 0 ? filters.status.join(', ') : 'All'}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Select a report type to see preview details</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
