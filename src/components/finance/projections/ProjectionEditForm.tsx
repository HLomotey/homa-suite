import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectionWithDetails, ProjectionStatus, ProjectionPriority, UpdateProjectionRequest } from '@/types/projection';
import useStaffLocation from '@/hooks/transport/useStaffLocation';
import { useBillingPeriods } from '@/hooks/billing/useBillingPeriods';
import { format } from 'date-fns';

interface ProjectionEditFormProps {
  projection: ProjectionWithDetails;
  onSubmit: (data: UpdateProjectionRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ProjectionEditForm: React.FC<ProjectionEditFormProps> = ({
  projection,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { staffLocations } = useStaffLocation();
  const { billingPeriods } = useBillingPeriods();

  const [formData, setFormData] = React.useState({
    title: projection.title,
    description: projection.description || '',
    location_id: projection.location_id,
    billing_period_id: projection.billing_period_id,
    expected_hours: projection.expected_hours,
    expected_revenue: projection.expected_revenue,
    status: projection.status,
    priority: projection.priority,
    projection_date: format(new Date(projection.projection_date), 'yyyy-MM-dd'),
    estimator_percentage: projection.estimator_percentage || 0,
    notes: projection.notes || '',
    // Expenditure fields - only manual input fields
    monthly_gross_wages_salaries: projection.monthly_gross_wages_salaries || 0,
    monthly_gross_income: projection.monthly_gross_income || 0,
    estimated_other: projection.estimated_other || 0
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-border bg-background">
        <h2 className="text-2xl font-bold tracking-tight">Edit Projection</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Projection Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Enter projection title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select 
                      value={formData.location_id} 
                      onValueChange={(value) => handleChange('location_id', value)}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing_period">Billing Period *</Label>
                    <Select 
                      value={formData.billing_period_id} 
                      onValueChange={(value) => handleChange('billing_period_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing period" />
                      </SelectTrigger>
                      <SelectContent>
                        {billingPeriods?.map((period) => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projection_date">Projection Date *</Label>
                    <Input
                      id="projection_date"
                      type="date"
                      value={formData.projection_date}
                      onChange={(e) => handleChange('projection_date', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expected_hours">Expected Hours *</Label>
                    <Input
                      id="expected_hours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.expected_hours}
                      onChange={(e) => handleChange('expected_hours', parseFloat(e.target.value) || 0)}
                      placeholder="0.0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected_revenue">Expected Revenue *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="expected_revenue"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.expected_revenue}
                        onChange={(e) => handleChange('expected_revenue', parseFloat(e.target.value) || 0)}
                        className="pl-7"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleChange('status', value)}
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
                      value={formData.priority} 
                      onValueChange={(value) => handleChange('priority', value)}
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
                  <div className="space-y-2">
                    <Label htmlFor="estimator_percentage">Estimator %</Label>
                    <Input
                      id="estimator_percentage"
                      type="number"
                      step="0.1"
                      value={formData.estimator_percentage}
                      onChange={(e) => handleChange('estimator_percentage', parseFloat(e.target.value) || 0)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Enter projection description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Additional notes"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Expenditure Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Expenditure Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monthly Gross Wages/Salaries (68%)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        value={(formData.expected_revenue * 0.68).toFixed(2)}
                        className="pl-7 bg-muted"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Gross Income (32%)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        value={(formData.expected_revenue * 0.32).toFixed(2)}
                        className="pl-7 bg-muted"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payroll Taxes (8%)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        value={(formData.expected_revenue * 0.68 * 0.08).toFixed(2)}
                        className="pl-7 bg-muted"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Cost (10%)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        value={(formData.expected_revenue * 0.68 * 0.10).toFixed(2)}
                        className="pl-7 bg-muted"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Management Payroll Expenses (3%)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        value={(formData.expected_revenue * 0.68 * 0.03).toFixed(2)}
                        className="pl-7 bg-muted"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated_other">Estimated Other</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="estimated_other"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.estimated_other}
                        onChange={(e) => handleChange('estimated_other', parseFloat(e.target.value) || 0)}
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee Engagement (2%)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        value={(formData.expected_revenue * 0.68 * 0.02).toFixed(2)}
                        className="pl-7 bg-muted"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Health Insurance Benefits (6%)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        value={(formData.expected_revenue * 0.68 * 0.06).toFixed(2)}
                        className="pl-7 bg-muted"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Travel (1.5%)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        value={(formData.expected_revenue * 0.68 * 0.015).toFixed(2)}
                        className="pl-7 bg-muted"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Other Benefits (2%)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        value={(formData.expected_revenue * 0.68 * 0.02).toFixed(2)}
                        className="pl-7 bg-muted"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>

      <div className="flex justify-end gap-2 p-6 border-t border-border bg-background">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading || !formData.location_id || !formData.title}
        >
          {loading ? 'Updating...' : 'Update Projection'}
        </Button>
      </div>
    </div>
  );
};

export default ProjectionEditForm;
