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
  // Calculate percentages
  const activePercentage = stats.totalCount > 0 ? Math.round((stats.activeCount / stats.totalCount) * 100) : 0;
  const terminatedPercentage = stats.totalCount > 0 ? Math.round((stats.terminatedCount / stats.totalCount) * 100) : 0;

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
            {loading ? "..." : stats.totalCount}
          </div>
          <p className="text-xs text-muted-foreground">
            External staff members
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
            {loading ? "..." : stats.activeCount}
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
            {loading ? "..." : stats.terminatedCount}
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
            {loading ? "..." : stats.recentHiresCount}
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
                    {dept.count} staff ({Math.round((dept.count / stats.totalCount) * 100)}%)
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
