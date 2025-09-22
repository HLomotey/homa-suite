import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CustomSelect } from '../ui/select';
import {
  useStaffTerminationView,
  useSubmitTerminationRequest,
} from '@/hooks/staff/useStaffTermination';
import {
  TerminationRequestCreate,
} from '@/integration/supabase/types/staff-termination';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  TERMINATION_REASON_LABELS,
  SEPARATION_TYPE_LABELS,
  REHIRE_ELIGIBILITY_LABELS,
  DIRECT_DEPOSIT_ACTION_LABELS,
} from '@/constants/termination';

interface TerminationFormProps {
  onSuccess?: (requestId: string) => void;
  onCancel?: () => void;
  preSelectedStaffId?: string;
}

export function TerminationForm({
  onSuccess,
  onCancel,
  preSelectedStaffId
}: TerminationFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();

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

  // Fetch staff from the termination view - test without activeOnly filter
  const { data: staffList = [], isLoading: isLoadingStaff, error: staffError } = useStaffTerminationView({
    activeOnly: false,
  });

  // Debug logging
  console.log('Staff data count:', staffList?.length || 0);
  console.log('Employee options count:', employeeOptions.length);
  if (staffError) console.log('Staff error:', staffError);



  // Submit termination request mutation
  const submitTerminationMutation = useSubmitTerminationRequest();

  // Update selected staff when staff_id changes
  useEffect(() => {
    if (formData.staff_id) {
      const staff = staffList.find(s => s.staff_id === formData.staff_id);

      // Auto-select manager if available
      if (staff?.manager_id) {
        setFormData(prev => ({ ...prev, manager_id: staff.manager_id }));
      }
    }
  }, [formData.staff_id, staffList]);

  const handleInputChange = (field: keyof TerminationRequestCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.staff_id) newErrors.staff_id = 'Employee is required';
    if (!formData.effective_termination_date) newErrors.effective_termination_date = 'Effective date is required';
    if (!formData.last_day_worked) newErrors.last_day_worked = 'Last day worked is required';
    if (!formData.separation_type) newErrors.separation_type = 'Separation type is required';
    if (!formData.reason_for_leaving?.trim()) newErrors.reason_for_leaving = 'Reason for leaving is required';
    if (!formData.direct_deposit_instruction) newErrors.direct_deposit_instruction = 'Direct deposit instruction is required';

    // Date validation
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

    if (!validateForm()) return;

    setLoading(true);
    try {
      const requestId = await submitTerminationMutation.mutateAsync(formData as TerminationRequestCreate);
      toast.success('Termination request submitted successfully');
      onSuccess?.(requestId);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit termination request');
    } finally {
      setLoading(false);
    }
  };

  const reasonOptions = Object.entries(TERMINATION_REASON_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const separationTypeOptions = Object.entries(SEPARATION_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const rehireEligibilityOptions = Object.entries(REHIRE_ELIGIBILITY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const directDepositOptions = Object.entries(DIRECT_DEPOSIT_ACTION_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const employeeOptions = staffList.map(staff => ({
    value: staff.staff_id,
    label: `${staff.full_name} (${staff.work_email || staff.personal_email || 'No email'})`,
  }));

  const managerOptions = staffList
    .filter(staff => staff.manager_id && staff.manager_full_name)
    .reduce((acc, staff) => {
      if (staff.manager_id && !acc.find(m => m.value === staff.manager_id)) {
        acc.push({
          value: staff.manager_id,
          label: staff.manager_full_name!,
        });
      }
      return acc;
    }, [] as { value: string; label: string }[]);

  const isHRUser = currentUser?.role === 'admin' || currentUser?.role === 'hr';
  const canEditEmployee = true; // Allow all users to select employees for now

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          New Termination Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Employee <span className="text-red-500">*</span>
              </Label>



              <CustomSelect
                value={formData.staff_id}
                onChange={(value) => handleInputChange('staff_id', value)}
                options={employeeOptions}
                placeholder={
                  isLoadingStaff
                    ? "Loading employees..."
                    : employeeOptions.length === 0
                      ? "No employees found"
                      : "Select employee"
                }
                disabled={!canEditEmployee || isLoadingStaff}
                error={errors.staff_id}
              />
              {staffError && (
                <p className="mt-1 text-sm text-red-600">Error loading staff: {staffError.message}</p>
              )}
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Manager
              </Label>
              <CustomSelect
                value={formData.manager_id || ''}
                onChange={(value) => handleInputChange('manager_id', value)}
                options={managerOptions}
                placeholder="Select manager"
                error={errors.manager_id}
              />
            </div>
          </div>

          {/* Termination Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Termination Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.effective_termination_date}
                onChange={(e) => handleInputChange('effective_termination_date', e.target.value)}
                error={errors.effective_termination_date}
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Last Day Worked <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.last_day_worked}
                onChange={(e) => handleInputChange('last_day_worked', e.target.value)}
                error={errors.last_day_worked}
              />
            </div>
          </div>

          {/* Separation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Separation Type <span className="text-red-500">*</span>
              </Label>
              <CustomSelect
                value={formData.separation_type}
                onChange={(value) => handleInputChange('separation_type', value)}
                options={separationTypeOptions}
                placeholder="Select separation type"
                error={errors.separation_type}
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Eligible for Rehire <span className="text-red-500">*</span>
              </Label>
              <CustomSelect
                value={formData.eligible_for_rehire?.toString()}
                onChange={(value) => handleInputChange('eligible_for_rehire', value === 'true')}
                options={rehireEligibilityOptions}
                placeholder="Select rehire eligibility"
                error={errors.eligible_for_rehire}
              />
            </div>
          </div>

          {/* Reason for Leaving */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leaving <span className="text-red-500">*</span>
            </Label>
            <CustomSelect
              value={formData.reason_for_leaving}
              onChange={(value) => handleInputChange('reason_for_leaving', value)}
              options={reasonOptions}
              placeholder="Select reason for leaving"
              error={errors.reason_for_leaving}
            />
          </div>

          {/* Direct Deposit Action */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Direct Deposit Instruction <span className="text-red-500">*</span>
            </Label>
            <CustomSelect
              value={formData.direct_deposit_instruction}
              onChange={(value) => handleInputChange('direct_deposit_instruction', value)}
              options={directDepositOptions}
              placeholder="Select direct deposit instruction"
              error={errors.direct_deposit_instruction}
            />
          </div>

          {/* Comments */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </Label>
            <Textarea
              value={formData.additional_notes || ''}
              onChange={(e) => handleInputChange('additional_notes', e.target.value)}
              placeholder="Enter any additional notes or details..."
              rows={4}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Termination Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
