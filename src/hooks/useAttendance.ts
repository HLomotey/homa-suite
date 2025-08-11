import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/client';
import { FrontendAttendance, mapDatabaseAttendanceToFrontend, Attendance } from '@/integration/supabase/types/attendance';
import { toast } from 'sonner';

export interface AttendanceFilters {
  staffId?: string;
  attendanceType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  shiftAssignment?: string;
}

export interface AttendanceStats {
  totalRecords: number;
  presentDays: number;
  absentDays: number;
  timeOffDays: number;
  totalHoursWorked: number;
  totalOvertimeHours: number;
  totalTimeOffHours: number;
  averageHoursPerDay: number;
}

export const useAttendance = (filters?: AttendanceFilters) => {
  const [attendanceData, setAttendanceData] = useState<FrontendAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AttendanceStats>({
    totalRecords: 0,
    presentDays: 0,
    absentDays: 0,
    timeOffDays: 0,
    totalHoursWorked: 0,
    totalOvertimeHours: 0,
    totalTimeOffHours: 0,
    averageHoursPerDay: 0,
  });

  // Fetch all attendance data with staff information
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      let error;

      // Use appropriate function based on filters
      if (filters?.startDate && filters?.endDate) {
        ({ data, error } = await supabase.rpc('get_attendance_by_date_range', {
          start_date: filters.startDate,
          end_date: filters.endDate
        }));
      } else if (filters?.staffId) {
        ({ data, error } = await supabase.rpc('get_attendance_by_staff', {
          staff_uuid: filters.staffId
        }));
      } else {
        ({ data, error } = await supabase.rpc('get_attendance_with_staff'));
      }

      if (error) {
        throw error;
      }

      if (data) {
        // Map database results to frontend format
        const mappedData = data.map((record: any) =>
          mapDatabaseAttendanceToFrontend(record, record.staff_name)
        );

        // Apply additional filters if provided
        let filteredData = mappedData;
        
        if (filters?.attendanceType) {
          filteredData = filteredData.filter(record => record.attendanceType === filters.attendanceType);
        }
        
        if (filters?.status) {
          filteredData = filteredData.filter(record => record.status === filters.status);
        }
        
        if (filters?.shiftAssignment) {
          filteredData = filteredData.filter(record => record.shiftAssignment === filters.shiftAssignment);
        }

        setAttendanceData(filteredData);
        
        // Calculate stats
        const newStats: AttendanceStats = {
          totalRecords: filteredData.length,
          presentDays: filteredData.filter(record => record.status === 'present').length,
          absentDays: filteredData.filter(record => record.status === 'absent').length,
          timeOffDays: filteredData.filter(record => record.status === 'time_off').length,
          totalHoursWorked: filteredData.reduce((sum, record) => sum + (record.totalHoursWorked || 0), 0),
          totalOvertimeHours: filteredData.reduce((sum, record) => sum + (record.overtimeHours || 0), 0),
          totalTimeOffHours: filteredData.reduce((sum, record) => sum + (record.timeOffHours || 0), 0),
          averageHoursPerDay: 0,
        };
        
        // Calculate average hours per day (only for work days)
        const workDays = filteredData.filter(record => record.attendanceType === 'work_day' && record.totalHoursWorked);
        newStats.averageHoursPerDay = workDays.length > 0 
          ? newStats.totalHoursWorked / workDays.length 
          : 0;
        
        setStats(newStats);
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance data');
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Create new attendance record
  const createAttendanceRecord = async (attendanceData: Omit<Attendance, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert([attendanceData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Attendance record created successfully');
      await fetchAttendanceData(); // Refresh data
      return data;
    } catch (err) {
      console.error('Error creating attendance record:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create attendance record';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Update attendance record
  const updateAttendanceRecord = async (id: string, updates: Partial<Omit<Attendance, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Attendance record updated successfully');
      await fetchAttendanceData(); // Refresh data
      return data;
    } catch (err) {
      console.error('Error updating attendance record:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update attendance record';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Delete attendance record
  const deleteAttendanceRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Attendance record deleted successfully');
      await fetchAttendanceData(); // Refresh data
    } catch (err) {
      console.error('Error deleting attendance record:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete attendance record';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Bulk create attendance records (for Excel upload)
  const bulkCreateAttendanceRecords = async (records: Omit<Attendance, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert(records)
        .select();

      if (error) {
        throw error;
      }

      toast.success(`${records.length} attendance records created successfully`);
      await fetchAttendanceData(); // Refresh data
      return data;
    } catch (err) {
      console.error('Error bulk creating attendance records:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create attendance records';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Get attendance records for specific staff member
  const getAttendanceByStaff = async (staffId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_attendance_by_staff', {
        staff_uuid: staffId
      });

      if (error) {
        throw error;
      }

      if (data) {
        return data.map((record: any) =>
          mapDatabaseAttendanceToFrontend(record, record.staff_name)
        );
      }
      return [];
    } catch (err) {
      console.error('Error fetching staff attendance:', err);
      toast.error('Failed to fetch staff attendance data');
      return [];
    }
  };

  // Get attendance records for specific date range
  const getAttendanceByDateRange = async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase.rpc('get_attendance_by_date_range', {
        start_date: startDate,
        end_date: endDate
      });

      if (error) {
        throw error;
      }

      if (data) {
        return data.map((record: any) =>
          mapDatabaseAttendanceToFrontend(record, record.staff_name)
        );
      }
      return [];
    } catch (err) {
      console.error('Error fetching attendance by date range:', err);
      toast.error('Failed to fetch attendance data for date range');
      return [];
    }
  };

  // Clock in/out functions for real-time attendance tracking
  const clockIn = async (staffId: string, attendanceDate: string, scheduledStartTime?: string) => {
    try {
      const clockInTime = new Date().toISOString();
      
      const attendanceRecord = {
        staff_id: staffId,
        attendance_date: attendanceDate,
        clock_in_time: clockInTime,
        scheduled_start_time: scheduledStartTime || null,
        attendance_type: 'work_day',
        status: 'present',
      };

      await createAttendanceRecord(attendanceRecord);
      toast.success('Clocked in successfully');
    } catch (err) {
      console.error('Error clocking in:', err);
      toast.error('Failed to clock in');
      throw err;
    }
  };

  const clockOut = async (attendanceId: string) => {
    try {
      const clockOutTime = new Date().toISOString();
      
      await updateAttendanceRecord(attendanceId, {
        clock_out_time: clockOutTime,
      });
      
      toast.success('Clocked out successfully');
    } catch (err) {
      console.error('Error clocking out:', err);
      toast.error('Failed to clock out');
      throw err;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAttendanceData();
  }, [filters]);

  return {
    attendanceData,
    loading,
    error,
    stats,
    refreshData: fetchAttendanceData,
    createAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    bulkCreateAttendanceRecords,
    getAttendanceByStaff,
    getAttendanceByDateRange,
    clockIn,
    clockOut,
  };
};
