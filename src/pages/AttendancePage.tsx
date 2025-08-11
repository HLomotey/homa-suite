import React from "react";
import { AttendanceManagement } from "@/components/attendance/AttendanceManagement";
import { AttendanceDashboard } from "@/components/attendance/AttendanceDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, BarChart3, Users } from "lucide-react";

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

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Attendance Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <AttendanceDashboard />
        </TabsContent>

        <TabsContent value="records" className="space-y-6 mt-6">
          <AttendanceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
