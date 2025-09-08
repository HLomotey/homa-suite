import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, X, Save, Plus, Trash2 } from 'lucide-react';
import { CreateProjectionRequest, ProjectionStatus, ProjectionPriority, ProjectionWithDetails } from '@/types/projection';
import useStaffLocation from '@/hooks/transport/useStaffLocation';
import { useBillingPeriods } from '@/hooks/billing/useBillingPeriods';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { EmailNotificationPanel } from '@/components/shared/EmailNotificationPanel';
import { EmailNotificationConfig } from '@/types/notification';

interface MonthlyProjection {
  month: number;
  year: number;
  monthName: string;
  expected_hours: number;
  expected_revenue: number;
  selected: boolean;
  // Only manual expenditure field (others are computed from expected_revenue)
  estimated_other: number;
}

interface BulkProjectionFormProps {
  projection?: ProjectionWithDetails;
  onSubmit?: (data: CreateProjectionRequest[]) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  readOnly?: boolean;
}

const BulkProjectionForm: React.FC<BulkProjectionFormProps> = ({
  projection,
  onSubmit,
  onCancel,
  loading = false,
  readOnly = false
}) => {
  // Debug log to check readOnly prop
  console.log('BulkProjectionForm readOnly prop:', readOnly);
  const { staffLocations } = useStaffLocation();
  const { billingPeriods } = useBillingPeriods();

  // Base form data
  const [baseFormData, setBaseFormData] = React.useState({
    title: '',
    description: '',
    location_id: '',
    status: 'DRAFT' as ProjectionStatus,
    priority: 'MEDIUM' as ProjectionPriority,
    year: new Date().getFullYear()
  });

  // Monthly projections data
  const [monthlyProjections, setMonthlyProjections] = React.useState<MonthlyProjection[]>([]);
  
  // Estimator settings
  const [globalEstimator, setGlobalEstimator] = React.useState({
    percentage: 0,
    applyToAll: false
  });

  // Email notification configuration
  const [emailConfig, setEmailConfig] = React.useState<EmailNotificationConfig>({
    enabled: false,
    recipients: [],
    groups: [],
    subject: '',
    message: '',
    includeFormData: true,
    sendOnSubmit: true,
    sendOnUpdate: false,
    sendOnDelete: false
  });

  const [activeTab, setActiveTab] = React.useState('projections');
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Initialize monthly projections for the year
  React.useEffect(() => {
    if (monthlyProjections.length === 0) {
      const initialMonths = months.map((monthName, index) => ({
        month: index,
        year: baseFormData.year,
        monthName,
        expected_hours: 0,
        expected_revenue: 0,
        selected: false,
        // Initialize expenditure fields (only manual field)
        estimated_other: 0
      }));
      setMonthlyProjections(initialMonths);
    }
  }, [baseFormData.year, months, monthlyProjections.length]);

  React.useEffect(() => {
    if (projection) {
      setBaseFormData({
        title: projection.title,
        description: projection.description || '',
        location_id: projection.location_id,
        status: projection.status,
        priority: projection.priority,
        year: new Date(projection.projection_date || new Date()).getFullYear()
      });
      
      // Convert single projection to monthly format for editing
      const projectionMonth = new Date(projection.projection_date || new Date()).getMonth();
      const updatedMonths = months.map((monthName, index) => ({
        month: index,
        year: new Date(projection.projection_date || new Date()).getFullYear(),
        monthName,
        expected_hours: index === projectionMonth ? projection.expected_hours : 0,
        expected_revenue: index === projectionMonth ? projection.expected_revenue : 0,
        selected: index === projectionMonth,
        // Initialize expenditure fields from projection or default to 0 (only manual field)
        estimated_other: index === projectionMonth ? (projection.estimated_other || 0) : 0
      }));
      setMonthlyProjections(updatedMonths);
    }
  }, [projection, months]);

  const handleBaseFormChange = (field: string, value: any) => {
    setBaseFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMonthlyProjectionChange = (monthIndex: number, field: string, value: any) => {
    setMonthlyProjections(prev => 
      prev.map((month, index) => 
        index === monthIndex ? { ...month, [field]: value } : month
      )
    );
  };

  const toggleMonthSelection = (monthIndex: number) => {
    setMonthlyProjections(prev => 
      prev.map((month, index) => 
        index === monthIndex ? { ...month, selected: !month.selected } : month
      )
    );
  };

  const selectAllMonths = () => {
    setMonthlyProjections(prev => 
      prev.map(month => ({ ...month, selected: true }))
    );
  };

  const deselectAllMonths = () => {
    setMonthlyProjections(prev => 
      prev.map(month => ({ ...month, selected: false }))
    );
  };

  const applyEstimatorToSelected = () => {
    if (globalEstimator.applyToAll) {
      const multiplier = 1 + (globalEstimator.percentage / 100);
      setMonthlyProjections(prev => 
        prev.map(month => 
          month.selected ? {
            ...month,
            expected_hours: Math.round(month.expected_hours * multiplier * 10) / 10,
            expected_revenue: Math.round(month.expected_revenue * multiplier * 100) / 100
          } : month
        )
      );
    }
  };

  // Function to find billing period for a given month/year
  const findBillingPeriodForMonth = (month: number, year: number): string | null => {
    const monthDate = new Date(year, month, 15); // Use middle of month for comparison
    
    const matchingPeriod = billingPeriods?.find(period => {
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);
      return monthDate >= startDate && monthDate <= endDate;
    });
    
    return matchingPeriod?.id || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onSubmit) return;

    const selectedProjections = monthlyProjections
      .filter(month => month.selected && (month.expected_hours > 0 || month.expected_revenue > 0))
      .map(month => {
        const billing_period_id = findBillingPeriodForMonth(month.month, month.year);
        
        // Skip months without valid billing periods
        if (!billing_period_id) {
          console.warn(`No billing period found for ${month.monthName} ${month.year}, skipping projection`);
          return null;
        }
        
        return {
          title: `${baseFormData.title} - ${month.monthName} ${month.year}`,
          description: baseFormData.description,
          location_id: baseFormData.location_id,
          billing_period_id,
          expected_hours: month.expected_hours,
          expected_revenue: month.expected_revenue,
          status: baseFormData.status,
          priority: baseFormData.priority,
          projection_date: format(new Date(month.year, month.month, 1), 'yyyy-MM-dd'),
          estimator_percentage: globalEstimator.percentage,
          notes: baseFormData.description,
          // Include expenditure fields (only estimated_other is manually set, others are computed)
          estimated_other: month.estimated_other
        };
      })
      .filter(projection => projection !== null); // Remove null entries

    if (selectedProjections.length === 0) {
      return;
    }

    await onSubmit(selectedProjections);
  };

  const selectedCount = monthlyProjections.filter(m => m.selected).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-border bg-background">
        <h2 className="text-2xl font-bold tracking-tight">
          {projection ? 'Edit Projection' : 'Create Bulk Projections'}
        </h2>
        <Badge variant="secondary">
          {selectedCount} month{selectedCount !== 1 ? 's' : ''} selected
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projections">Monthly Projections</TabsTrigger>
            <TabsTrigger value="estimator">Estimator Tools</TabsTrigger>
            <TabsTrigger value="notifications">Email Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="projections" className="space-y-6">
            {/* Base Information */}
            <Card>
              <CardHeader>
                <CardTitle>Base Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Projection Title *</Label>
                    <Input
                      id="title"
                      value={baseFormData.title}
                      onChange={(e) => handleBaseFormChange('title', e.target.value)}
                      placeholder="Enter projection title"
                      required
                      disabled={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select 
                      value={baseFormData.location_id} 
                      onValueChange={(value) => handleBaseFormChange('location_id', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffLocations?.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.locationDescription}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select 
                      value={baseFormData.year.toString()} 
                      onValueChange={(value) => handleBaseFormChange('year', parseInt(value))}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2024, 2025, 2026, 2027, 2028].map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={baseFormData.status} 
                      onValueChange={(value) => handleBaseFormChange('status', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={baseFormData.priority} 
                      onValueChange={(value) => handleBaseFormChange('priority', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={baseFormData.description}
                    onChange={(e) => handleBaseFormChange('description', e.target.value)}
                    placeholder="Enter projection description"
                    rows={3}
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Month Selection Controls */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Monthly Projections for {baseFormData.year}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Select months and set expected hours and revenue for each</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={selectAllMonths}
                      disabled={readOnly}
                    >
                      Select All
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={deselectAllMonths}
                      disabled={readOnly}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {monthlyProjections.map((month, index) => (
                    <div key={index} className={`flex items-center gap-4 p-3 border rounded-lg transition-all ${month.selected ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' : 'bg-card border-border hover:bg-muted/50'}`}>
                      {/* Checkbox */}
                      <div className="flex-shrink-0">
                        <Checkbox
                          checked={month.selected}
                          onCheckedChange={() => toggleMonthSelection(index)}
                          disabled={readOnly}
                        />
                      </div>
                      
                      {/* Month Name */}
                      <div className="flex-shrink-0 w-24">
                        <div className="font-medium text-sm text-foreground">{month.monthName || months[index]}</div>
                        <div className="text-xs text-foreground opacity-60">{month.year}</div>
                      </div>
                      
                      {/* Hours Input */}
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs font-medium text-muted-foreground mb-1 block">Expected Hours</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={month.expected_hours || ''}
                          onChange={(e) => handleMonthlyProjectionChange(index, 'expected_hours', parseFloat(e.target.value) || 0)}
                          disabled={readOnly}
                          className="h-9"
                          placeholder="0.0"
                        />
                      </div>
                      
                      {/* Revenue Input */}
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs font-medium text-muted-foreground mb-1 block">Expected Revenue</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={month.expected_revenue || ''}
                            onChange={(e) => handleMonthlyProjectionChange(index, 'expected_revenue', parseFloat(e.target.value) || 0)}
                            disabled={readOnly}
                            className="h-9 pl-7"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Estimated Other Input */}
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs font-medium text-muted-foreground mb-1 block">Estimated Other</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={month.estimated_other || ''}
                            onChange={(e) => handleMonthlyProjectionChange(index, 'estimated_other', parseFloat(e.target.value) || 0)}
                            disabled={readOnly}
                            className="h-9 pl-7"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Computed Expenditures Display */}
                      {month.selected && month.expected_revenue > 0 && (
                        <div className="flex-1 min-w-0">
                          <Label className="text-xs font-medium text-muted-foreground mb-1 block">Computed Expenditures</Label>
                          <div className="text-xs space-y-1 bg-muted/50 p-2 rounded border">
                            <div className="flex justify-between">
                              <span>Wages/Salaries (68%):</span>
                              <span>${(month.expected_revenue * 0.68).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Gross Income (32%):</span>
                              <span>${(month.expected_revenue * 0.32).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Payroll Taxes (8%):</span>
                              <span>${(month.expected_revenue * 0.68 * 0.08).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Admin Cost (10%):</span>
                              <span>${(month.expected_revenue * 0.68 * 0.10).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estimator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Bulk Estimator Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimator_percentage">Global Adjustment Percentage</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="estimator_percentage"
                        type="number"
                        step="0.1"
                        value={globalEstimator.percentage}
                        onChange={(e) => setGlobalEstimator(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.0"
                        disabled={readOnly}
                        className="max-w-32"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Positive values increase, negative values decrease selected months
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="apply_to_all"
                      checked={globalEstimator.applyToAll}
                      onCheckedChange={(checked) => setGlobalEstimator(prev => ({ ...prev, applyToAll: !!checked }))}
                      disabled={readOnly}
                    />
                    <Label htmlFor="apply_to_all" className="text-sm">
                      Apply to all selected months
                    </Label>
                  </div>

                  <Button
                    type="button"
                    onClick={applyEstimatorToSelected}
                    disabled={!globalEstimator.applyToAll || selectedCount === 0 || readOnly}
                    className="w-full"
                  >
                    Apply {globalEstimator.percentage}% adjustment to {selectedCount} selected month{selectedCount !== 1 ? 's' : ''}
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Preview Impact</h4>
                  <div className="text-sm text-gray-600">
                    {selectedCount > 0 ? (
                      <div>
                        <p>Selected months: {selectedCount}</p>
                        <p>Adjustment: {globalEstimator.percentage > 0 ? '+' : ''}{globalEstimator.percentage}%</p>
                        <p className="text-xs mt-1">
                          This will {globalEstimator.percentage > 0 ? 'increase' : 'decrease'} hours and revenue for selected months
                        </p>
                      </div>
                    ) : (
                      <p>Select months to see impact preview</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <EmailNotificationPanel
              formType="bulk-projection"
              formData={monthlyProjections.filter(m => m.selected)}
              onSend={(config) => setEmailConfig(config)}
              className="w-full"
            />
          </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end gap-2 p-6 border-t border-border bg-background">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading || !baseFormData.location_id || !baseFormData.title || selectedCount === 0}
        >
          {loading ? 'Creating...' : `Create ${selectedCount} Projection${selectedCount !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
};

export default BulkProjectionForm;
