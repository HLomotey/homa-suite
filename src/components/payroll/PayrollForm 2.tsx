import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FrontendPayroll } from '@/integration/supabase/types/billing';
import { useStaff } from '@/hooks/billing/useStaff';
import { 
  User, 
  Clock, 
  DollarSign, 
  Calendar, 
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface PayrollFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PayrollFormData) => Promise<void>;
  editingRecord?: FrontendPayroll | null;
  isSubmitting?: boolean;
}

export interface PayrollFormData {
  staffId: string;
  regularHours?: number;
  overtimeHours?: number;
  rent?: number;
  transport?: number;
  penalties?: number;
  payDate: string;
  payPeriod: string;
}

export const PayrollForm: React.FC<PayrollFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingRecord,
  isSubmitting = false,
}) => {
  const { staff, loading: staffLoading } = useStaff();
  
  const [formData, setFormData] = useState<PayrollFormData>({
    staffId: '',
    regularHours: undefined,
    overtimeHours: undefined,
    rent: undefined,
    transport: undefined,
    penalties: undefined,
    payDate: '',
    payPeriod: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PayrollFormData, string>>>({});

  // Reset form when opening/closing or when editing record changes
  useEffect(() => {
    if (isOpen) {
      if (editingRecord) {
        // Populate form with editing record data
        setFormData({
          staffId: editingRecord.staffId,
          regularHours: editingRecord.regularHours ?? undefined,
          overtimeHours: editingRecord.overtimeHours ?? undefined,
          rent: editingRecord.rent ?? undefined,
          transport: editingRecord.transport ?? undefined,
          penalties: editingRecord.penalties ?? undefined,
          payDate: editingRecord.payDate,
          payPeriod: editingRecord.payPeriod,
        });
      } else {
        // Reset form for new record
        setFormData({
          staffId: '',
          regularHours: undefined,
          overtimeHours: undefined,
          rent: undefined,
          transport: undefined,
          penalties: undefined,
          payDate: format(new Date(), 'yyyy-MM-dd'),
          payPeriod: format(new Date(), 'MMMM yyyy'),
        });
      }
      setErrors({});
    }
  }, [isOpen, editingRecord]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PayrollFormData, string>> = {};

    // Required fields
    if (!formData.staffId) {
      newErrors.staffId = 'Staff member is required';
    }
    if (!formData.payDate) {
      newErrors.payDate = 'Pay date is required';
    }
    if (!formData.payPeriod) {
      newErrors.payPeriod = 'Pay period is required';
    }

    // Numeric validations
    if (typeof formData.regularHours === 'number' && formData.regularHours < 0) {
      newErrors.regularHours = 'Regular hours cannot be negative';
    }
    if (typeof formData.overtimeHours === 'number' && formData.overtimeHours < 0) {
      newErrors.overtimeHours = 'Overtime hours cannot be negative';
    }
    if (typeof formData.rent === 'number' && formData.rent < 0) {
      newErrors.rent = 'Rent cannot be negative';
    }
    if (typeof formData.transport === 'number' && formData.transport < 0) {
      newErrors.transport = 'Transport cannot be negative';
    }
    if (typeof formData.penalties === 'number' && formData.penalties < 0) {
      newErrors.penalties = 'Penalties cannot be negative';
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
      await onSubmit(formData);
      onClose();
      toast.success(editingRecord ? 'Payroll record updated successfully' : 'Payroll record created successfully');
    } catch (error) {
      console.error('Error submitting payroll form:', error);
      toast.error('Failed to save payroll record');
    }
  };

  const handleInputChange = (field: keyof PayrollFormData, value: string | number) => {
    let processedValue: string | number | undefined = value;
    
    // Handle empty string cases for numeric fields
    if (value === '' || value === null || value === undefined) {
      processedValue = undefined;
    } else if (typeof value === 'string' && ['regularHours', 'overtimeHours', 'rent', 'transport', 'penalties'].includes(field)) {
      // Convert string to number for numeric fields
      const numValue = parseFloat(value);
      processedValue = isNaN(numValue) ? undefined : numValue;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const selectedStaff = staff.find(s => s.id === formData.staffId);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="max-w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {editingRecord ? 'Edit Payroll Record' : 'Add New Payroll Record'}
          </SheetTitle>
          <SheetDescription>
            {editingRecord 
              ? 'Update the payroll information for this record'
              : 'Enter payroll details for a staff member including hours worked, deductions, and payment information'
            }
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Staff Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Staff Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staffId">
                  Staff Member <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.staffId}
                  onValueChange={(value) => handleInputChange('staffId', value)}
                  disabled={staffLoading || !!editingRecord}
                >
                  <SelectTrigger className={errors.staffId ? 'border-destructive' : ''}>
                    <SelectValue placeholder={staffLoading ? 'Loading staff...' : 'Select staff member'} />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((staffMember) => (
                      <SelectItem key={staffMember.id} value={staffMember.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{staffMember.legalName}</span>
                          {staffMember.employeeId && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {staffMember.employeeId}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.staffId && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.staffId}
                  </p>
                )}
                {selectedStaff && (
                  <div className="text-sm text-muted-foreground">
                    <p>Department: {selectedStaff.department}</p>
                    <p>Job Title: {selectedStaff.jobTitle}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hours Worked */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hours Worked
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regularHours">Regular Hours</Label>
                  <Input
                    id="regularHours"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={formData.regularHours || ''}
                    onChange={(e) => handleInputChange('regularHours', e.target.value)}
                    className={errors.regularHours ? 'border-destructive' : ''}
                  />
                  {errors.regularHours && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.regularHours}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overtimeHours">Overtime Hours</Label>
                  <Input
                    id="overtimeHours"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={formData.overtimeHours || ''}
                    onChange={(e) => handleInputChange('overtimeHours', e.target.value)}
                    className={errors.overtimeHours ? 'border-destructive' : ''}
                  />
                  {errors.overtimeHours && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.overtimeHours}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent">Rent Deduction</Label>
                  <Input
                    id="rent"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.rent || ''}
                    onChange={(e) => handleInputChange('rent', e.target.value)}
                    className={errors.rent ? 'border-destructive' : ''}
                  />
                  {errors.rent && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.rent}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transport">Transport Allowance</Label>
                  <Input
                    id="transport"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.transport || ''}
                    onChange={(e) => handleInputChange('transport', e.target.value)}
                    className={errors.transport ? 'border-destructive' : ''}
                  />
                  {errors.transport && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.transport}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="penalties">Penalties/Deductions</Label>
                  <Input
                    id="penalties"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.penalties || ''}
                    onChange={(e) => handleInputChange('penalties', e.target.value)}
                    className={errors.penalties ? 'border-destructive' : ''}
                  />
                  {errors.penalties && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.penalties}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pay Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Pay Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payDate">
                    Pay Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="payDate"
                    type="date"
                    value={formData.payDate}
                    onChange={(e) => handleInputChange('payDate', e.target.value)}
                    className={errors.payDate ? 'border-destructive' : ''}
                  />
                  {errors.payDate && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.payDate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payPeriod">
                    Pay Period <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="payPeriod"
                    type="text"
                    placeholder="e.g., January 2024, Week 1-2 Jan 2024"
                    value={formData.payPeriod}
                    onChange={(e) => handleInputChange('payPeriod', e.target.value)}
                    className={errors.payPeriod ? 'border-destructive' : ''}
                  />
                  {errors.payPeriod && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.payPeriod}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingRecord ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {editingRecord ? 'Update Record' : 'Create Record'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
