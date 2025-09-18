import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import CustomSelect from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { 
  TerminationRequest, 
  SeparationType, 
  RehireEligibility, 
  DirectDepositAction, 
  TerminationReason,
  Profile 
} from '../../lib/supabase';
import {
  TERMINATION_REASON_LABELS,
  SEPARATION_TYPE_LABELS,
  REHIRE_ELIGIBILITY_LABELS,
  DIRECT_DEPOSIT_ACTION_LABELS,
  validateTerminationDates,
} from '../../lib/termination';
import { useTermination } from '../../hooks/useTermination';
import { useAuth } from '@/components/auth/AuthProvider';

interface TerminationFormProps {
  onSubmit: (data: Partial<TerminationRequest>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<TerminationRequest>;
  isEditing?: boolean;
}

export function TerminationForm({ onSubmit, onCancel, initialData, isEditing = false }: TerminationFormProps) {
  const { currentUser } = useAuth();
  const { getEmployees } = useTermination();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    employee_id: initialData?.employee_id || '',
    manager_id: initialData?.manager_id || '',
    effective_date: initialData?.effective_date || '',
    last_day_worked: initialData?.last_day_worked || '',
    separation_type: initialData?.separation_type || '' as SeparationType,
    reason_for_leaving: initialData?.reason_for_leaving || '' as TerminationReason,
    rehire_eligible: initialData?.rehire_eligible || '' as RehireEligibility,
    direct_deposit_action: initialData?.direct_deposit_action || '' as DirectDepositAction,
    notes: initialData?.notes || '',
    manager_comments: initialData?.manager_comments || '',
    hr_comments: initialData?.hr_comments || '',
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      const employeeList = await getEmployees();
      setEmployees(employeeList);
    };
    fetchEmployees();
  }, [getEmployees]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.employee_id) newErrors.employee_id = 'Employee is required';
    if (!formData.effective_date) newErrors.effective_date = 'Effective date is required';
    if (!formData.last_day_worked) newErrors.last_day_worked = 'Last day worked is required';
    if (!formData.separation_type) newErrors.separation_type = 'Separation type is required';
    if (!formData.reason_for_leaving) newErrors.reason_for_leaving = 'Reason for leaving is required';
    if (!formData.rehire_eligible) newErrors.rehire_eligible = 'Rehire eligibility is required';
    if (!formData.direct_deposit_action) newErrors.direct_deposit_action = 'Direct deposit action is required';

    // Date validation
    if (formData.effective_date && formData.last_day_worked) {
      const dateErrors = validateTerminationDates(formData.effective_date, formData.last_day_worked);
      if (dateErrors.length > 0) {
        newErrors.dates = dateErrors[0];
      }
    }

    // Effective date should not be in the past (unless editing)
    if (formData.effective_date && !isEditing) {
      const effectiveDate = new Date(formData.effective_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (effectiveDate < today) {
        newErrors.effective_date = 'Effective date cannot be in the past';
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
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

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.first_name} ${emp.last_name} (${emp.email})`,
  }));

  const managerOptions = employees
    .filter(emp => emp.role === 'employer' || emp.role === 'admin')
    .map(emp => ({
      value: emp.id,
      label: `${emp.first_name} ${emp.last_name}`,
    }));

  const isHRUser = currentUser?.user?.user_metadata?.role === 'admin';
  const canEditEmployee = !isEditing && (isHRUser || currentUser?.user?.user_metadata?.role === 'employer');

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Termination Request' : 'New Termination Request'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee CustomSelection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formData.employee_id}
                onChange={(value) => handleInputChange('employee_id', value)}
                options={employeeOptions}
                placeholder="CustomSelect employee"
                disabled={!canEditEmployee}
                error={errors.employee_id}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager
              </label>
              <CustomSelect
                value={formData.manager_id}
                onChange={(value) => handleInputChange('manager_id', value)}
                options={managerOptions}
                placeholder="CustomSelect manager"
                error={errors.manager_id}
              />
            </div>
          </div>

          {/* Termination Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Termination Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.effective_date}
                onChange={(e) => handleInputChange('effective_date', e.target.value)}
                error={errors.effective_date}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Day Worked <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.last_day_worked}
                onChange={(e) => handleInputChange('last_day_worked', e.target.value)}
                error={errors.last_day_worked}
                required
              />
            </div>
          </div>

          {errors.dates && (
            <div className="text-red-600 text-sm">{errors.dates}</div>
          )}

          {/* Separation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Separation Type <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formData.separation_type}
                onChange={(value) => handleInputChange('separation_type', value as SeparationType)}
                options={separationTypeOptions}
                placeholder="CustomSelect separation type"
                error={errors.separation_type}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eligible for Rehire <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formData.rehire_eligible}
                onChange={(value) => handleInputChange('rehire_eligible', value as RehireEligibility)}
                options={rehireEligibilityOptions}
                placeholder="CustomSelect rehire eligibility"
                error={errors.rehire_eligible}
                required
              />
            </div>
          </div>

          {/* Reason for Leaving */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leaving <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={formData.reason_for_leaving}
              onChange={(value) => handleInputChange('reason_for_leaving', value as TerminationReason)}
              options={reasonOptions}
              placeholder="CustomSelect reason for leaving"
              error={errors.reason_for_leaving}
              required
            />
          </div>

          {/* Direct Deposit Action */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Direct Deposit Instruction <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={formData.direct_deposit_action}
              onChange={(value) => handleInputChange('direct_deposit_action', value as DirectDepositAction)}
              options={directDepositOptions}
              placeholder="CustomSelect direct deposit action"
              error={errors.direct_deposit_action}
              required
            />
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <Textarea
              value={formData.notes}
              onChange={(value) => handleInputChange('notes', value)}
              placeholder="Enter any additional notes or details..."
              rows={4}
            />
          </div>

          {/* Manager Comments (only for managers) */}
          {(currentUser?.user?.user_metadata?.role === 'employer' || isHRUser) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager Comments
              </label>
              <Textarea
                value={formData.manager_comments}
                onChange={(value) => handleInputChange('manager_comments', value)}
                placeholder="Manager's comments on the termination..."
                rows={3}
              />
            </div>
          )}

          {/* HR Comments (only for HR) */}
          {isHRUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HR Comments
              </label>
              <Textarea
                value={formData.hr_comments}
                onChange={(value) => handleInputChange('hr_comments', value)}
                placeholder="HR comments and notes..."
                rows={3}
              />
            </div>
          )}

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
              loading={loading}
            >
              {isEditing ? 'Update Termination' : 'Submit Termination Request'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
