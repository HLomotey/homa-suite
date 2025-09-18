/**
 * Attendance management types for Supabase integration
 * Based on comprehensive attendance tracking requirements including time entry, 
 * time off, scheduling, and compliance reporting
 */

/**
 * Attendance interface representing the attendance table in Supabase
 * Comprehensive attendance tracking with time entry, breaks, transfers, and compliance
 */
export interface Attendance {
  id: string;
  staff_id: string; // Links to billing_staff.id
  employee_id?: string; // For Excel upload reference
  
  // Time Entry
  clock_in_time?: string; // ISO timestamp
  clock_out_time?: string; // ISO timestamp
  total_hours_worked?: number; // Calculated or manual entry
  
  // Meal Breaks
  meal_break_start?: string; // ISO timestamp
  meal_break_end?: string; // ISO timestamp
  meal_break_duration?: number; // Minutes
  
  // Job Transfers
  job_transfer_notes?: string; // Tracking time on different tasks/departments
  department_worked?: string; // Department during this time entry
  task_description?: string; // Specific task or project
  
  // Time Off
  time_off_type?: string; // vacation, sick_leave, personal_day, holiday
  time_off_hours?: number; // Hours of time off
  time_off_balance_used?: number; // Balance deducted
  time_off_request_status?: string; // pending, approved, denied
  
  // Scheduling
  scheduled_start_time?: string; // ISO timestamp
  scheduled_end_time?: string; // ISO timestamp
  shift_assignment?: string; // Morning, Afternoon, Night, etc.
  unplanned_absence?: boolean; // Flag for unplanned absences
  
  // Compliance and Reporting
  overtime_hours?: number; // Hours over standard work time
  attendance_exceptions?: string; // missed_punch, late_arrival, early_departure
  exception_notes?: string; // Additional notes for exceptions
  
  // General Information
  attendance_date: string; // Date of attendance (YYYY-MM-DD)
  attendance_type: string; // work_day, time_off, holiday, absence
  status: string; // present, absent, partial, time_off
  notes?: string; // General notes
  
  // System fields
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend attendance type that matches the structure for attendance components
 * Based on the upload fields with camelCase naming
 */
export interface FrontendAttendance {
  id: string;
  staffId: string; // Links to staff record
  employeeId?: string; // For display and Excel reference
  
  // Time Entry
  clockInTime?: string;
  clockOutTime?: string;
  totalHoursWorked?: number;
  
  // Meal Breaks
  mealBreakStart?: string;
  mealBreakEnd?: string;
  mealBreakDuration?: number;
  
  // Job Transfers
  jobTransferNotes?: string;
  departmentWorked?: string;
  taskDescription?: string;
  
  // Time Off
  timeOffType?: string;
  timeOffHours?: number;
  timeOffBalanceUsed?: number;
  timeOffRequestStatus?: string;
  
  // Scheduling
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  shiftAssignment?: string;
  unplannedAbsence?: boolean;
  
  // Compliance and Reporting
  overtimeHours?: number;
  attendanceExceptions?: string;
  exceptionNotes?: string;
  
  // General Information
  attendanceDate: string;
  attendanceType: string;
  status: string;
  notes?: string;
  
  // Additional computed fields for UI
  staffName?: string; // Populated from joined staff data
  actualHoursWorked?: number; // Calculated from clock in/out
  scheduledHours?: number; // Calculated from scheduled times
}

/**
 * Attendance status enum
 */
export type AttendanceStatus = 'present' | 'absent' | 'partial' | 'time_off';

/**
 * Attendance type enum
 */
export type AttendanceType = 'work_day' | 'time_off' | 'holiday' | 'absence';

/**
 * Time off type enum
 */
export type TimeOffType = 'vacation' | 'sick_leave' | 'personal_day' | 'holiday' | 'bereavement' | 'jury_duty' | 'other';

/**
 * Shift assignment enum
 */
export type ShiftAssignment = 'morning' | 'afternoon' | 'night' | 'split' | 'flexible' | 'on_call';

/**
 * Attendance exception enum
 */
export type AttendanceException = 'missed_punch' | 'late_arrival' | 'early_departure' | 'long_break' | 'no_break' | 'other';

/**
 * Time off request status enum
 */
export type TimeOffRequestStatus = 'pending' | 'approved' | 'denied' | 'cancelled';

/**
 * Maps a database attendance to the frontend attendance format
 */
export const mapDatabaseAttendanceToFrontend = (
  dbAttendance: Attendance,
  staffName?: string
): FrontendAttendance => {
  return {
    id: dbAttendance.id,
    staffId: dbAttendance.staff_id,
    employeeId: dbAttendance.employee_id,
    
    // Time Entry
    clockInTime: dbAttendance.clock_in_time,
    clockOutTime: dbAttendance.clock_out_time,
    totalHoursWorked: dbAttendance.total_hours_worked,
    
    // Meal Breaks
    mealBreakStart: dbAttendance.meal_break_start,
    mealBreakEnd: dbAttendance.meal_break_end,
    mealBreakDuration: dbAttendance.meal_break_duration,
    
    // Job Transfers
    jobTransferNotes: dbAttendance.job_transfer_notes,
    departmentWorked: dbAttendance.department_worked,
    taskDescription: dbAttendance.task_description,
    
    // Time Off
    timeOffType: dbAttendance.time_off_type,
    timeOffHours: dbAttendance.time_off_hours,
    timeOffBalanceUsed: dbAttendance.time_off_balance_used,
    timeOffRequestStatus: dbAttendance.time_off_request_status,
    
    // Scheduling
    scheduledStartTime: dbAttendance.scheduled_start_time,
    scheduledEndTime: dbAttendance.scheduled_end_time,
    shiftAssignment: dbAttendance.shift_assignment,
    unplannedAbsence: dbAttendance.unplanned_absence,
    
    // Compliance and Reporting
    overtimeHours: dbAttendance.overtime_hours,
    attendanceExceptions: dbAttendance.attendance_exceptions,
    exceptionNotes: dbAttendance.exception_notes,
    
    // General Information
    attendanceDate: dbAttendance.attendance_date,
    attendanceType: dbAttendance.attendance_type,
    status: dbAttendance.status,
    notes: dbAttendance.notes,
    
    // Additional computed fields
    staffName,
    actualHoursWorked: calculateActualHours(dbAttendance.clock_in_time, dbAttendance.clock_out_time, dbAttendance.meal_break_duration),
    scheduledHours: calculateScheduledHours(dbAttendance.scheduled_start_time, dbAttendance.scheduled_end_time),
  };
};

/**
 * Calculate actual hours worked from clock in/out times minus meal break
 */
const calculateActualHours = (clockIn?: string, clockOut?: string, mealBreakDuration?: number): number | undefined => {
  if (!clockIn || !clockOut) return undefined;
  
  const clockInTime = new Date(clockIn);
  const clockOutTime = new Date(clockOut);
  
  const totalMinutes = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60);
  const workMinutes = totalMinutes - (mealBreakDuration || 0);
  
  return workMinutes > 0 ? Number((workMinutes / 60).toFixed(2)) : 0;
};

/**
 * Calculate scheduled hours from scheduled start/end times
 */
const calculateScheduledHours = (scheduledStart?: string, scheduledEnd?: string): number | undefined => {
  if (!scheduledStart || !scheduledEnd) return undefined;
  
  const startTime = new Date(scheduledStart);
  const endTime = new Date(scheduledEnd);
  
  const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  
  return totalMinutes > 0 ? Number((totalMinutes / 60).toFixed(2)) : 0;
};
