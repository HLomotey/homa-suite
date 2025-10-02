import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffStats } from "@/hooks/external-staff/useExternalStaff";
import { Users, UserCheck, UserX, Calendar, Building2 } from "lucide-react";
import styles from "./ExternalStaffStats.module.css";

interface ExternalStaffStatsProps {
  stats: StaffStats;
  loading: boolean;
  onDepartmentFilter?: (department: string | null) => void;
  selectedDepartment?: string | null;
  onStatusChange?: (status: string) => void;
}

export const ExternalStaffStats: React.FC<ExternalStaffStatsProps> = ({
  stats,
  loading,
  onDepartmentFilter,
  selectedDepartment,
  onStatusChange,
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
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div>

      {/* Department Filter Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Filter by Department</h3>
          {selectedDepartment && (
            <button
              onClick={() => onDepartmentFilter?.(null)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : stats.topDepartments.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* All Departments Card */}
            <DepartmentCard
              department="All Departments"
              count={stats.active}
              percentage={100}
              isSelected={selectedDepartment === null}
              onClick={() => {
                onStatusChange?.('active');
                onDepartmentFilter?.(null);
              }}
              isAllCard={true}
            />

            {/* Individual Department Cards */}
            {stats.topDepartments.map((dept) => (
              <DepartmentCard
                key={dept.department}
                department={dept.department}
                count={dept.count}
                percentage={Math.round((dept.count / stats.active) * 100)}
                isSelected={selectedDepartment === dept.department}
                onClick={() => {
                  onStatusChange?.('active');
                  onDepartmentFilter?.(dept.department);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No department data available
          </div>
        )}
      </div>
    </div>
  );
};

// Department Card Component
interface DepartmentCardProps {
  department: string;
  count: number;
  percentage: number;
  isSelected: boolean;
  onClick: () => void;
  isAllCard?: boolean;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  count,
  percentage,
  isSelected,
  onClick,
  isAllCard = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105
        ${isSelected
          ? 'bg-blue-950/60 border-blue-600/50 ring-2 ring-blue-500/30'
          : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-700/40 hover:border-gray-600/50'
        }
        ${isAllCard ? 'border-green-600/50 bg-green-950/40' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Building2 className={`h-4 w-4 ${isSelected ? 'text-blue-400' : isAllCard ? 'text-green-400' : 'text-gray-400'}`} />
          <span className={`text-sm font-medium ${isSelected ? 'text-blue-300' : isAllCard ? 'text-green-300' : 'text-white'}`}>
            {isAllCard ? 'All' : department}
          </span>
        </div>
        {isSelected && (
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        )}
      </div>

      <div className="space-y-1">
        <div className={`text-xl font-bold ${isSelected ? 'text-blue-200' : isAllCard ? 'text-green-200' : 'text-white'}`}>
          {count}
        </div>
        <div className={`text-xs ${isSelected ? 'text-blue-400' : isAllCard ? 'text-green-400' : 'text-gray-400'}`}>
          {percentage}% of active staff
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full bg-gray-700 rounded-full h-1.5">
        <div
          className={`${styles.progressBar} ${styles[`width${Math.min(percentage, 100)}`]} ${isSelected ? 'bg-blue-400' : isAllCard ? 'bg-green-400' : 'bg-gray-500'
            }`}
        />
      </div>
    </div>
  );
};

export default ExternalStaffStats;
