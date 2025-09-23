/**
 * Staff Termination Form Component
 * Handles the termination workflow with employee and manager selection
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, User, UserCheck, Calendar, FileText, Building } from 'lucide-react';
import {
  useStaffForTermination,
  useManagersForLocation,
  useSubmitTerminationRequest,
} from '@/hooks/staff/useStaffTermination';
import {
  SeparationType,
  DirectDepositInstruction,
  TerminationRequestCreate,
} from '@/integration/supabase/types/staff-termination';
import { toast } from 'sonner';

interface StaffTerminationFormProps {
  onSuccess?: (requestId: string) => void;
  onCancel?: () => void;
  preSelectedStaffId?: string;
}

export const StaffTerminationForm: React.FC<StaffTerminationFormProps> = ({
  onSuccess,
  onCancel,
  preSelectedStaffId,
}) => {
  const [formData, setFormData] = useState<Partial<TerminationRequestCreate>>({
    staff_id: preSelectedStaffId || '',
    manager_id: '',
    effective_termination_date: '',
    last_day_worked: '',
    separation_type: 'voluntary',
    reason_for_leaving: '',
    eligible_for_rehire: false,
    direct_deposit_instruction: 'stop',
    additional_notes: '',
  });

  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch staff eligible for termination
  const { data: staffList = [], isLoading: isLoadingStaff } = useStaffForTermination({
    activeOnly: true,
  });

  // Fetch managers for the selected staff's location
  const { data: managers = [], isLoading: isLoadingManagers } = useManagersForLocation(
    selectedStaff?.company_code
  );

  // Submit termination request mutation
  const submitTerminationMutation = useSubmitTerminationRequest();

  // Update selected staff when staff_id changes
  useEffect(() => {
    if (formData.staff_id) {
      const staff = staffList.find(s => s.staff_id === formData.staff_id);
      setSelectedStaff(staff);
      
      // Auto-select manager if there's only one for this location
      if (staff && managers.length === 1) {
        setFormData(prev => ({ ...prev, manager_id: managers[0].manager_id }));
      }
    } else {
      setSelectedStaff(null);
    }
  }, [formData.staff_id, staffList, managers]);

  const handleInputChange = (field: keyof TerminationRequestCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.staff_id) {
      newErrors.staff_id = 'Employee selection is required';
    }

    if (!formData.effective_termination_date) {
      newErrors.effective_termination_date = 'Effective termination date is required';
    }

    if (!formData.last_day_worked) {
      newErrors.last_day_worked = 'Last day worked is required';
    }

    if (!formData.separation_type) {
      newErrors.separation_type = 'Separation type is required';
    }

    if (!formData.reason_for_leaving?.trim()) {
      newErrors.reason_for_leaving = 'Reason for leaving is required';
    }

    if (!formData.direct_deposit_instruction) {
      newErrors.direct_deposit_instruction = 'Direct deposit instruction is required';
    }

    // Validate dates
    if (formData.effective_termination_date && formData.last_day_worked) {
      const effectiveDate = new Date(formData.effective_termination_date);
      const lastDayWorked = new Date(formData.last_day_worked);
      
      if (lastDayWorked > effectiveDate) {
        newErrors.last_day_worked = 'Last day worked cannot be after effective termination date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    try {
      const requestId = await submitTerminationMutation.mutateAsync(formData as TerminationRequestCreate);
      onSuccess?.(requestId);
    } catch (error) {
      console.error('Error submitting termination request:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      staff_id: '',
      manager_id: '',
      effective_termination_date: '',
      last_day_worked: '',
      separation_type: 'voluntary',
      reason_for_leaving: '',
      eligible_for_rehire: false,
      direct_deposit_instruction: 'stop',
      additional_notes: '',
    });
    setSelectedStaff(null);
    setErrors({});
    onCancel?.();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-red-900 to-orange-900 text-white">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Staff Termination Request
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee and Manager Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label htmlFor="employee" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Employee *
              </Label>
              <Select
                value={formData.staff_id}
                onValueChange={(value) => handleInputChange('staff_id', value)}
              >
                <SelectTrigger className={errors.staff_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingStaff ? (
                    <SelectItem value="" disabled>Loading employees...</SelectItem>
                  ) : (
                    staffList.map((staff) => (
                      <SelectItem key={staff.staff_id} value={staff.staff_id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{staff.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {staff.job_title} • {staff.location_name}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.staff_id && (
                <p className="text-sm text-red-500">{errors.staff_id}</p>
              )}
              
              {/* Selected Staff Info */}
              {selectedStaff && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Employee Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-1">{selectedStaff.work_email || selectedStaff.personal_email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-1">{selectedStaff.location_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Job Title:</span>
                      <span className="ml-1">{selectedStaff.job_title}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Company:</span>
                      <span className="ml-1">{selectedStaff.company_code}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Manager Selection */}
            <div className="space-y-2">
              <Label htmlFor="manager" className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Manager
              </Label>
              <Select
                value={formData.manager_id}
                onValueChange={(value) => handleInputChange('manager_id', value)}
                disabled={!selectedStaff}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingManagers ? (
                    <SelectItem value="" disabled>Loading managers...</SelectItem>
                  ) : managers.length === 0 ? (
                    <SelectItem value="" disabled>No managers found for this location</SelectItem>
                  ) : (
                    managers.map((manager) => (
                      <SelectItem key={manager.manager_id} value={manager.manager_id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{manager.manager_full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {manager.manager_job_title} • {manager.location_description}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="effective_date" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Effective Termination Date *
              </Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_termination_date}
                onChange={(e) => handleInputChange('effective_termination_date', e.target.value)}
                className={errors.effective_termination_date ? 'border-red-500' : ''}
              />
              {errors.effective_termination_date && (
                <p className="text-sm text-red-500">{errors.effective_termination_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_day_worked" className="text-sm font-medium">
                Last Day Worked *
              </Label>
              <Input
                id="last_day_worked"
                type="date"
                value={formData.last_day_worked}
                onChange={(e) => handleInputChange('last_day_worked', e.target.value)}
                className={errors.last_day_worked ? 'border-red-500' : ''}
              />
              {errors.last_day_worked && (
                <p className="text-sm text-red-500">{errors.last_day_worked}</p>
              )}
            </div>
          </div>

          {/* Separation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="separation_type" className="text-sm font-medium">
                Separation Type *
              </Label>
              <Select
                value={formData.separation_type}
                onValueChange={(value) => handleInputChange('separation_type', value)}
              >
                <SelectTrigger className={errors.separation_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select separation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SeparationType.VOLUNTARY}>Voluntary</SelectItem>
                  <SelectItem value={SeparationType.INVOLUNTARY}>Involuntary</SelectItem>
                  <SelectItem value={SeparationType.LAYOFF}>Layoff</SelectItem>
                  <SelectItem value={SeparationType.RETIREMENT}>Retirement</SelectItem>
                  <SelectItem value={SeparationType.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.separation_type && (
                <p className="text-sm text-red-500">{errors.separation_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Checkbox
                  checked={formData.eligible_for_rehire}
                  onCheckedChange={(checked) => handleInputChange('eligible_for_rehire', checked)}
                />
                Eligible for Rehire *
              </Label>
            </div>
          </div>

          {/* Reason for Leaving */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for Leaving *
            </Label>
            <Select
              value={formData.reason_for_leaving}
              onValueChange={(value) => handleInputChange('reason_for_leaving', value)}
            >
              <SelectTrigger className={errors.reason_for_leaving ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select reason for leaving" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resignation">Resignation</SelectItem>
                <SelectItem value="termination">Termination</SelectItem>
                <SelectItem value="layoff">Layoff</SelectItem>
                <SelectItem value="retirement">Retirement</SelectItem>
                <SelectItem value="end_of_contract">End of Contract</SelectItem>
                <SelectItem value="performance">Performance Issues</SelectItem>
                <SelectItem value="misconduct">Misconduct</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.reason_for_leaving && (
              <p className="text-sm text-red-500">{errors.reason_for_leaving}</p>
            )}
          </div>

          {/* Direct Deposit Instruction */}
          <div className="space-y-2">
            <Label htmlFor="direct_deposit" className="text-sm font-medium">
              Direct Deposit Instruction *
            </Label>
            <Select
              value={formData.direct_deposit_instruction}
              onValueChange={(value) => handleInputChange('direct_deposit_instruction', value)}
            >
              <SelectTrigger className={errors.direct_deposit_instruction ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select direct deposit action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DirectDepositInstruction.STOP}>Stop Direct Deposit</SelectItem>
                <SelectItem value={DirectDepositInstruction.CONTINUE}>Continue Direct Deposit</SelectItem>
                <SelectItem value={DirectDepositInstruction.CHANGE}>Change Direct Deposit Details</SelectItem>
              </SelectContent>
            </Select>
            {errors.direct_deposit_instruction && (
              <p className="text-sm text-red-500">{errors.direct_deposit_instruction}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes or details..."
              value={formData.additional_notes}
              onChange={(e) => handleInputChange('additional_notes', e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitTerminationMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={submitTerminationMutation.isPending}
            >
              {submitTerminationMutation.isPending ? 'Submitting...' : 'Submit Termination Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};