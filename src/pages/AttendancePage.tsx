import React from "react";
import { AttendanceManagement } from "@/components/attendance/AttendanceManagement";
import { Clock } from "lucide-react";

export const AttendancePage: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Attendance Management</h1>
        </div>
        <p className="text-muted-foreground">
          Track employee attendance, manage time entries, and monitor work
          schedules with comprehensive reporting and analytics.
        </p>
      </div>

      <AttendanceManagement />
    </div>
  );
};
