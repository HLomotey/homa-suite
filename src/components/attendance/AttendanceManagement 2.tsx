import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAttendance, AttendanceFilters } from '@/hooks/useAttendance';
import { AttendanceForm, AttendanceFormData } from './AttendanceForm';
import { FrontendAttendance } from '@/integration/supabase/types/attendance';
import {
  Search,
  Plus,
  Download,
  Filter,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle,
  Timer,
  Coffee,
  Building,
  UserCheck,
  Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export const AttendanceManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AttendanceFilters>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FrontendAttendance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    attendanceData,
    loading,
    error,
    stats,
    refreshData,
    createAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
  } = useAttendance(filters);

  // Filter attendance data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return attendanceData;
    
    const searchLower = searchTerm.toLowerCase();
    return attendanceData.filter((record) => {
      return (
        record.staffName?.toLowerCase().includes(searchLower) ||
        record.employeeId?.toLowerCase().includes(searchLower) ||
        record.departmentWorked?.toLowerCase().includes(searchLower) ||
        record.attendanceType.toLowerCase().includes(searchLower) ||
        record.status.toLowerCase().includes(searchLower) ||
        record.shiftAssignment?.toLowerCase().includes(searchLower)
      );
    });
  }, [attendanceData, searchTerm]);

  const handleAddRecord = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleEditRecord = (record: FrontendAttendance) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await deleteAttendanceRecord(recordId);
      toast.success('Attendance record deleted successfully');
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      toast.error('Failed to delete attendance record');
    }
  };

  const handleFormSubmit = async (formData: AttendanceFormData) => {
    setIsSubmitting(true);
    try {
      const attendanceRecord = {
        staff_id: formData.staffId,
        employee_id: formData.employeeId || null,
        clock_in_time: formData.clockInTime ? new Date(formData.clockInTime).toISOString() : null,
        clock_out_time: formData.clockOutTime ? new Date(formData.clockOutTime).toISOString() : null,
        total_hours_worked: formData.totalHoursWorked || null,
        meal_break_start: formData.mealBreakStart ? new Date(formData.mealBreakStart).toISOString() : null,
        meal_break_end: formData.mealBreakEnd ? new Date(formData.mealBreakEnd).toISOString() : null,
        meal_break_duration: formData.mealBreakDuration || null,
        job_transfer_notes: formData.jobTransferNotes || null,
        department_worked: formData.departmentWorked || null,
        task_description: formData.taskDescription || null,
        time_off_type: formData.timeOffType || null,
        time_off_hours: formData.timeOffHours || null,
        time_off_balance_used: formData.timeOffBalanceUsed || null,
        time_off_request_status: formData.timeOffRequestStatus || null,
        scheduled_start_time: formData.scheduledStartTime ? new Date(formData.scheduledStartTime).toISOString() : null,
        scheduled_end_time: formData.scheduledEndTime ? new Date(formData.scheduledEndTime).toISOString() : null,
        shift_assignment: formData.shiftAssignment || null,
        unplanned_absence: formData.unplannedAbsence || false,
        overtime_hours: formData.overtimeHours || null,
        attendance_exceptions: formData.attendanceExceptions || null,
        exception_notes: formData.exceptionNotes || null,
        attendance_date: formData.attendanceDate,
        attendance_type: formData.attendanceType,
        status: formData.status,
        notes: formData.notes || null,
      };

      if (editingRecord) {
        await updateAttendanceRecord(editingRecord.id, attendanceRecord);
      } else {
        await createAttendanceRecord(attendanceRecord);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Staff Name',
      'Employee ID',
      'Date',
      'Type',
      'Status',
      'Clock In',
      'Clock Out',
      'Total Hours',
      'Overtime Hours',
      'Department',
      'Shift',
      'Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map(record => [
        record.staffName || '',
        record.employeeId || '',
        record.attendanceDate,
        record.attendanceType,
        record.status,
        record.clockInTime ? format(new Date(record.clockInTime), 'HH:mm') : '',
        record.clockOutTime ? format(new Date(record.clockOutTime), 'HH:mm') : '',
        record.totalHoursWorked || '',
        record.overtimeHours || '',
        record.departmentWorked || '',
        record.shiftAssignment || '',
        record.notes || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_records_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Attendance data exported successfully');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'present': return 'default';
      case 'absent': return 'destructive';
      case 'partial': return 'secondary';
      case 'time_off': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'work_day': return 'default';
      case 'time_off': return 'secondary';
      case 'holiday': return 'outline';
      case 'absence': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading attendance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Attendance entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
            <p className="text-xs text-muted-foreground">
              Days worked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Timer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalHoursWorked.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Hours worked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalOvertimeHours.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Extra hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendance Records
          </CardTitle>
          <CardDescription>
            Manage and track employee attendance, time entries, and work schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by staff name, employee ID, department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="time_off">Time Off</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.attendanceType || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, attendanceType: value === 'all' ? undefined : value }))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="work_day">Work Day</SelectItem>
                  <SelectItem value="time_off">Time Off</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="absence">Absence</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button onClick={handleAddRecord} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'No attendance records match your search' : 'No attendance records found'}
                        </p>
                        {!searchTerm && (
                          <Button onClick={handleAddRecord} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Record
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.staffName}</div>
                          {record.employeeId && (
                            <div className="text-sm text-muted-foreground">
                              ID: {record.employeeId}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(parseISO(record.attendanceDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(record.attendanceType)}>
                          {record.attendanceType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(record.status)}>
                          {record.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.clockInTime 
                          ? format(new Date(record.clockInTime), 'HH:mm')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {record.clockOutTime 
                          ? format(new Date(record.clockOutTime), 'HH:mm')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {record.totalHoursWorked 
                          ? `${record.totalHoursWorked.toFixed(1)}h`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {record.overtimeHours 
                          ? `${record.overtimeHours.toFixed(1)}h`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {record.departmentWorked || '-'}
                      </TableCell>
                      <TableCell>
                        {record.shiftAssignment 
                          ? record.shiftAssignment.replace('_', ' ')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRecord(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this attendance record for {record.staffName} on {format(parseISO(record.attendanceDate), 'MMM dd, yyyy')}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteRecord(record.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Form */}
      <AttendanceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingRecord={editingRecord}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
