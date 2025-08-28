import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffStats } from "@/hooks/external-staff/useExternalStaff";
import { Users, UserCheck, UserX, Calendar, Building2 } from "lucide-react";

interface ExternalStaffStatsProps {
  stats: StaffStats;
  loading: boolean;
}

export const ExternalStaffStats: React.FC<ExternalStaffStatsProps> = ({
  stats,
  loading,
}) => {
  // Use the totalCount from stats directly
  const totalStaffCount = stats.totalCount;
  const activePercentage = totalStaffCount > 0 ? Math.round((stats.active / totalStaffCount) * 100) : 0;
  const terminatedPercentage = totalStaffCount > 0 ? Math.round((stats.terminated / totalStaffCount) * 100) : 0;
  
  console.log('ExternalStaffStats rendering with:', { 
    totalCount: stats.totalCount, 
    active: stats.active, 
    terminated: stats.terminated,
    calculated: stats.active + stats.terminated
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Staff Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : totalStaffCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Total external staff members
          </p>
        </CardContent>
      </Card>

      {/* Active Staff Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.active}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "..." : `${activePercentage}% of total staff`}
          </p>
        </CardContent>
      </Card>

      {/* Terminated Staff Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Terminated Staff</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.terminated}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "..." : `${terminatedPercentage}% of total staff`}
          </p>
        </CardContent>
      </Card>

      {/* Recent Hires Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Hires</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.newThisMonth}
          </div>
          <p className="text-xs text-muted-foreground">
            In the last 30 days
          </p>
        </CardContent>
      </Card>

      {/* Top Departments Card (spans full width on smaller screens, half on larger) */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Departments</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm">Loading...</div>
          ) : stats.topDepartments.length > 0 ? (
            <div className="space-y-2">
              {stats.topDepartments.map((dept) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate max-w-[70%]">
                    {dept.department}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {dept.count} staff ({Math.round((dept.count / stats.active) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No department data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalStaffStats;
