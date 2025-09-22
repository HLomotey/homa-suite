import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAttendance } from '@/hooks/useAttendance';
import { FrontendAttendance } from '@/integration/supabase/types/attendance';
import {
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  Timer,
  AlertCircle,
  CheckCircle,
  Coffee,
  Building,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  UserX,
  Zap,
  Target,
  Award,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, isToday, isThisWeek, isThisMonth } from 'date-fns';

interface AttendanceDashboardProps {
  className?: string;
}

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ className }) => {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  
  const { attendanceData, loading, stats, refreshData } = useAttendance();

  // Calculate advanced analytics
  const analytics = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) {
      return {
        attendanceRate: 0,
        avgHoursPerDay: 0,
        overtimeRate: 0,
        timeOffRate: 0,
        departmentStats: [],
        trendData: [],
        realtimeStatus: { present: 0, absent: 0, timeOff: 0, late: 0 },
        topPerformers: [],
        alerts: []
      };
    }

    // Filter data based on date range
    const filteredData = attendanceData.filter(record => {
      const recordDate = parseISO(record.attendanceDate);
      switch (dateRange) {
        case 'today':
          return isToday(recordDate);
        case 'week':
          return isThisWeek(recordDate);
        case 'month':
          return isThisMonth(recordDate);
        default:
          return true;
      }
    });

    // Calculate attendance rate
    const totalRecords = filteredData.length;
    const presentRecords = filteredData.filter(r => r.status === 'present').length;
    const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

    // Calculate average hours per day
    const workDays = filteredData.filter(r => r.attendanceType === 'work_day' && r.totalHoursWorked);
    const avgHoursPerDay = workDays.length > 0 
      ? workDays.reduce((sum, r) => sum + (r.totalHoursWorked || 0), 0) / workDays.length 
      : 0;

    // Calculate overtime rate
    const overtimeRecords = filteredData.filter(r => r.overtimeHours && r.overtimeHours > 0);
    const overtimeRate = totalRecords > 0 ? (overtimeRecords.length / totalRecords) * 100 : 0;

    // Calculate time off rate
    const timeOffRecords = filteredData.filter(r => r.status === 'time_off');
    const timeOffRate = totalRecords > 0 ? (timeOffRecords.length / totalRecords) * 100 : 0;

    // Department-wise statistics
    const departmentGroups = filteredData.reduce((acc, record) => {
      const dept = record.departmentWorked || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = { total: 0, present: 0, totalHours: 0, overtime: 0 };
      }
      acc[dept].total++;
      if (record.status === 'present') acc[dept].present++;
      if (record.totalHoursWorked) acc[dept].totalHours += record.totalHoursWorked;
      if (record.overtimeHours) acc[dept].overtime += record.overtimeHours;
      return acc;
    }, {} as Record<string, { total: number; present: number; totalHours: number; overtime: number }>);

    const departmentStats = Object.entries(departmentGroups).map(([dept, stats]) => ({
      department: dept,
      attendanceRate: (stats.present / stats.total) * 100,
      totalHours: stats.totalHours,
      overtimeHours: stats.overtime,
      employeeCount: stats.total
    })).sort((a, b) => b.attendanceRate - a.attendanceRate);

    // Real-time status (today's data)
    const todayData = attendanceData.filter(record => isToday(parseISO(record.attendanceDate)));
    const realtimeStatus = {
      present: todayData.filter(r => r.status === 'present').length,
      absent: todayData.filter(r => r.status === 'absent').length,
      timeOff: todayData.filter(r => r.status === 'time_off').length,
      late: todayData.filter(r => {
        if (!r.clockInTime || !r.scheduledStartTime) return false;
        const clockIn = new Date(`2000-01-01T${r.clockInTime}`);
        const scheduled = new Date(`2000-01-01T${r.scheduledStartTime}`);
        return clockIn > scheduled;
      }).length
    };

    // Top performers (highest attendance rate and hours)
    const staffPerformance = attendanceData.reduce((acc, record) => {
      const staffId = record.staffId;
      if (!acc[staffId]) {
        acc[staffId] = {
          staffName: record.staffName || 'Unknown',
          totalDays: 0,
          presentDays: 0,
          totalHours: 0,
          overtimeHours: 0
        };
      }
      acc[staffId].totalDays++;
      if (record.status === 'present') acc[staffId].presentDays++;
      if (record.totalHoursWorked) acc[staffId].totalHours += record.totalHoursWorked;
      if (record.overtimeHours) acc[staffId].overtimeHours += record.overtimeHours;
      return acc;
    }, {} as Record<string, any>);

    const topPerformers = Object.values(staffPerformance)
      .map((staff: any) => ({
        ...staff,
        attendanceRate: (staff.presentDays / staff.totalDays) * 100
      }))
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, 5);

    // Generate alerts
    const alerts = [];
    if (attendanceRate < 85) {
      alerts.push({
        type: 'warning',
        message: `Attendance rate is below 85% (${attendanceRate.toFixed(1)}%)`
      });
    }
    if (overtimeRate > 25) {
      alerts.push({
        type: 'info',
        message: `High overtime rate detected (${overtimeRate.toFixed(1)}%)`
      });
    }
    if (realtimeStatus.absent > 5) {
      alerts.push({
        type: 'error',
        message: `${realtimeStatus.absent} employees are absent today`
      });
    }

    return {
      attendanceRate,
      avgHoursPerDay,
      overtimeRate,
      timeOffRate,
      departmentStats,
      realtimeStatus,
      topPerformers,
      alerts
    };
  }, [attendanceData, dateRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600';
      case 'absent': return 'text-red-600';
      case 'time_off': return 'text-blue-600';
      case 'partial': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return CheckCircle;
      case 'absent': return UserX;
      case 'time_off': return Coffee;
      case 'partial': return AlertCircle;
      default: return Users;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading attendance analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Attendance Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into employee attendance patterns</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {analytics.alerts.length > 0 && (
        <div className="space-y-2">
          {analytics.alerts.map((alert, index) => (
            <Card key={index} className={`border-l-4 ${
              alert.type === 'error' ? 'border-l-red-500 bg-red-50' :
              alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
              'border-l-blue-500 bg-blue-50'
            }`}>
              <CardContent className="py-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${
                    alert.type === 'error' ? 'text-red-600' :
                    alert.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <span className="text-sm font-medium">{alert.message}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.attendanceRate.toFixed(1)}%
            </div>
            <Progress value={analytics.attendanceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.attendanceRate >= 90 ? 'Excellent' : 
               analytics.attendanceRate >= 80 ? 'Good' : 'Needs Improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
            <Timer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.avgHoursPerDay.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Target: 8.0h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Rate</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analytics.overtimeRate.toFixed(1)}%
            </div>
            <Progress value={analytics.overtimeRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.overtimeRate > 20 ? 'High' : 'Normal'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Off Rate</CardTitle>
            <Coffee className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.timeOffRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Planned absences
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Status (Today)
          </CardTitle>
          <CardDescription>Current attendance status across all employees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.realtimeStatus.present}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Present
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analytics.realtimeStatus.absent}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <UserX className="h-3 w-3" />
                Absent
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.realtimeStatus.timeOff}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Coffee className="h-3 w-3" />
                Time Off
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {analytics.realtimeStatus.late}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Late Arrivals
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Department Performance
            </CardTitle>
            <CardDescription>Attendance rates by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.departmentStats.slice(0, 5).map((dept, index) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      dept.attendanceRate >= 90 ? 'bg-green-500' :
                      dept.attendanceRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium">{dept.department}</div>
                      <div className="text-xs text-muted-foreground">
                        {dept.employeeCount} employees
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{dept.attendanceRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">
                      {dept.totalHours.toFixed(0)}h total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performers
            </CardTitle>
            <CardDescription>Employees with highest attendance rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{performer.staffName}</div>
                      <div className="text-xs text-muted-foreground">
                        {performer.totalHours.toFixed(0)}h worked
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {performer.attendanceRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {performer.presentDays}/{performer.totalDays} days
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
