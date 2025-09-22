import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FrontendAttendance } from '@/integration/supabase/types/attendance';
import { useStaff } from '@/hooks/billing/useStaff';
import { 
  User, 
  Clock, 
  Calendar, 
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Coffee,
  Building,
  UserCheck,
  Timer,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AttendanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AttendanceFormData) => Promise<void>;
  editingRecord?: FrontendAttendance | null;
  isSubmitting?: boolean;
}

export interface AttendanceFormData {
  staffId: string;
  employeeId?: string;
  clockInTime?: string;
  clockOutTime?: string;
  totalHoursWorked?: number;
  mealBreakStart?: string;
  mealBreakEnd?: string;
  mealBreakDuration?: number;
  jobTransferNotes?: string;
  departmentWorked?: string;
  taskDescription?: string;
  timeOffType?: string;
  timeOffHours?: number;
  timeOffBalanceUsed?: number;
  timeOffRequestStatus?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  shiftAssignment?: string;
  unplannedAbsence?: boolean;
  overtimeHours?: number;
  attendanceExceptions?: string;
  exceptionNotes?: string;
  attendanceDate: string;
  attendanceType: string;
  status: string;
  notes?: string;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingRecord,
  isSubmitting = false,
}) => {
  const { staff, loading: staffLoading } = useStaff();
  
  const [formData, setFormData] = useState<AttendanceFormData>({
    staffId: '',
    employeeId: '',
    clockInTime: '',
    clockOutTime: '',
    totalHoursWorked: undefined,
    mealBreakStart: '',
    mealBreakEnd: '',
    mealBreakDuration: undefined,
    jobTransferNotes: '',
    departmentWorked: '',
    taskDescription: '',
    timeOffType: '',
    timeOffHours: undefined,
    timeOffBalanceUsed: undefined,
    timeOffRequestStatus: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    shiftAssignment: '',
    unplannedAbsence: false,
    overtimeHours: undefined,
    attendanceExceptions: '',
    exceptionNotes: '',
    attendanceDate: format(new Date(), 'yyyy-MM-dd'),
    attendanceType: 'work_day',
    status: 'present',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AttendanceFormData, string>>>({});

  // Reset form when opening/closing or when editing record changes
  useEffect(() => {
    if (isOpen) {
      if (editingRecord) {
        // Populate form with editing record data
        setFormData({
          staffId: editingRecord.staffId,
          employeeId: editingRecord.employeeId || '',
          clockInTime: editingRecord.clockInTime ? format(new Date(editingRecord.clockInTime), "yyyy-MM-dd'T'HH:mm") : '',
          clockOutTime: editingRecord.clockOutTime ? format(new Date(editingRecord.clockOutTime), "yyyy-MM-dd'T'HH:mm") : '',
          totalHoursWorked: editingRecord.totalHoursWorked,
          mealBreakStart: editingRecord.mealBreakStart ? format(new Date(editingRecord.mealBreakStart), "yyyy-MM-dd'T'HH:mm") : '',
          mealBreakEnd: editingRecord.mealBreakEnd ? format(new Date(editingRecord.mealBreakEnd), "yyyy-MM-dd'T'HH:mm") : '',
          mealBreakDuration: editingRecord.mealBreakDuration,
          jobTransferNotes: editingRecord.jobTransferNotes || '',
          departmentWorked: editingRecord.departmentWorked || '',
          taskDescription: editingRecord.taskDescription || '',
          timeOffType: editingRecord.timeOffType || '',
          timeOffHours: editingRecord.timeOffHours,
          timeOffBalanceUsed: editingRecord.timeOffBalanceUsed,
          timeOffRequestStatus: editingRecord.timeOffRequestStatus || '',
          scheduledStartTime: editingRecord.scheduledStartTime ? format(new Date(editingRecord.scheduledStartTime), "yyyy-MM-dd'T'HH:mm") : '',
          scheduledEndTime: editingRecord.scheduledEndTime ? format(new Date(editingRecord.scheduledEndTime), "yyyy-MM-dd'T'HH:mm") : '',
          shiftAssignment: editingRecord.shiftAssignment || '',
          unplannedAbsence: editingRecord.unplannedAbsence || false,
          overtimeHours: editingRecord.overtimeHours,
          attendanceExceptions: editingRecord.attendanceExceptions || '',
          exceptionNotes: editingRecord.exceptionNotes || '',
          attendanceDate: editingRecord.attendanceDate,
          attendanceType: editingRecord.attendanceType,
          status: editingRecord.status,
          notes: editingRecord.notes || '',
        });
      } else {
        // Reset form for new record
        setFormData({
          staffId: '',
          employeeId: '',
          clockInTime: '',
          clockOutTime: '',
          totalHoursWorked: undefined,
          mealBreakStart: '',
          mealBreakEnd: '',
          mealBreakDuration: undefined,
          jobTransferNotes: '',
          departmentWorked: '',
          taskDescription: '',
          timeOffType: '',
          timeOffHours: undefined,
          timeOffBalanceUsed: undefined,
          timeOffRequestStatus: '',
          scheduledStartTime: '',
          scheduledEndTime: '',
          shiftAssignment: '',
          unplannedAbsence: false,
          overtimeHours: undefined,
          attendanceExceptions: '',
          exceptionNotes: '',
          attendanceDate: format(new Date(), 'yyyy-MM-dd'),
          attendanceType: 'work_day',
          status: 'present',
          notes: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, editingRecord]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AttendanceFormData, string>> = {};

    // Required fields
    if (!formData.staffId) {
      newErrors.staffId = 'Staff member is required';
    }
    if (!formData.attendanceDate) {
      newErrors.attendanceDate = 'Attendance date is required';
    }
    if (!formData.attendanceType) {
      newErrors.attendanceType = 'Attendance type is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    // Numeric validations
    if (typeof formData.totalHoursWorked === 'number' && formData.totalHoursWorked < 0) {
      newErrors.totalHoursWorked = 'Total hours cannot be negative';
    }
    if (typeof formData.overtimeHours === 'number' && formData.overtimeHours < 0) {
      newErrors.overtimeHours = 'Overtime hours cannot be negative';
    }
    if (typeof formData.timeOffHours === 'number' && formData.timeOffHours < 0) {
      newErrors.timeOffHours = 'Time off hours cannot be negative';
    }
    if (typeof formData.mealBreakDuration === 'number' && formData.mealBreakDuration < 0) {
      newErrors.mealBreakDuration = 'Meal break duration cannot be negative';
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
      toast.success(editingRecord ? 'Attendance record updated successfully' : 'Attendance record created successfully');
    } catch (error) {
      console.error('Error submitting attendance form:', error);
      toast.error('Failed to save attendance record');
    }
  };

  const handleInputChange = (field: keyof AttendanceFormData, value: string | number | boolean) => {
    let processedValue: string | number | boolean | undefined = value;
    
    // Handle empty string cases for numeric fields
    if (value === '' || value === null || value === undefined) {
      processedValue = undefined;
    } else if (typeof value === 'string' && ['totalHoursWorked', 'overtimeHours', 'timeOffHours', 'timeOffBalanceUsed', 'mealBreakDuration'].includes(field)) {
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
      <SheetContent className="max-w-[800px] sm:max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {editingRecord ? 'Edit Attendance Record' : 'Add New Attendance Record'}
          </SheetTitle>
          <SheetDescription>
            {editingRecord 
              ? 'Update the attendance information for this record'
              : 'Enter comprehensive attendance details including time entry, breaks, scheduling, and compliance information'
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

          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attendanceDate">
                    Attendance Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="attendanceDate"
                    type="date"
                    value={formData.attendanceDate}
                    onChange={(e) => handleInputChange('attendanceDate', e.target.value)}
                    className={errors.attendanceDate ? 'border-destructive' : ''}
                  />
                  {errors.attendanceDate && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.attendanceDate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendanceType">
                    Attendance Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.attendanceType}
                    onValueChange={(value) => handleInputChange('attendanceType', value)}
                  >
                    <SelectTrigger className={errors.attendanceType ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select attendance type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work_day">Work Day</SelectItem>
                      <SelectItem value="time_off">Time Off</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="absence">Absence</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.attendanceType && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.attendanceType}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="time_off">Time Off</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.status}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shiftAssignment">Shift Assignment</Label>
                  <Select
                    value={formData.shiftAssignment}
                    onValueChange={(value) => handleInputChange('shiftAssignment', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                      <SelectItem value="split">Split</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                      <SelectItem value="on_call">On Call</SelectItem>
                    </SelectContent>
                  </Select>
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
