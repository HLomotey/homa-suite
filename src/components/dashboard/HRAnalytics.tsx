import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Building2,
  MapPin,
  Briefcase,
  Clock,
  Calendar,
  Globe,
  TrendingUp, // (kept if you’ll add trend badges later)
  TrendingDown,
} from "lucide-react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";

interface WorkforceAnalytics {
  // Workforce Composition
  totalStaff: number;
  topDepartments: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  topLocations: Array<{ location: string; count: number; percentage: number }>;
  topJobTitles: Array<{ title: string; count: number; percentage: number }>;

  // Employment Status & Categories
  activeStaff: number;
  inactiveStaff: number;
  seasonalStaff: number;
  fullTimeStaff: number;

  // Tenure & Service
  avgYearsOfService: number;
  newHires2025: number;
  longTermStaff: number; // 5+ years

  // Managerial Oversight
  managersCount: number;
  avgSpanOfControl: number;

  // Geographic Insights
  crossStateBorder: number;
  topLivedStates: Array<{ state: string; count: number }>;
  topWorkedStates: Array<{ state: string; count: number }>;
}

export function HRAnalytics() {
  const { externalStaff, stats, statsLoading } = useExternalStaff();
  const [analytics, setAnalytics] = useState<WorkforceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!statsLoading && externalStaff.length > 0) {
      setLoading(true);

      const activeStaffArr = externalStaff.filter(
        (staff) => !staff["TERMINATION DATE"]
      );
      const totalStaff = externalStaff.length;
      const activeCount = activeStaffArr.length;
      const denom = Math.max(activeCount, 1); // avoid division by zero

      // 1. Workforce Composition Analysis
      const departmentCounts = activeStaffArr.reduce((acc, staff) => {
        const dept = staff["HOME DEPARTMENT"] || "Unknown";
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const locationCounts = activeStaffArr.reduce((acc, staff) => {
        const location = staff["LOCATION"] || "Unknown";
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const jobTitleCounts = activeStaffArr.reduce((acc, staff) => {
        const title = staff["JOB TITLE"] || "Unknown";
        acc[title] = (acc[title] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 2. Employment Status & Categories
      const seasonalStaff = activeStaffArr.filter(
        (staff) =>
          staff["WORKER CATEGORY"]?.includes("SEAS") ||
          staff["POSITION STATUS"]?.includes("Seasonal")
      ).length;

      const fullTimeStaff = activeStaffArr.filter(
        (staff) =>
          staff["WORKER CATEGORY"]?.includes("FT") ||
          staff["POSITION STATUS"]?.includes("Full")
      ).length;

      // 3. Tenure & Service Analysis
      const yearsOfService = activeStaffArr
        .map((staff) => parseFloat(staff["YEARS OF SERVICE"] || "0"))
        .filter((years) => !isNaN(years));

      const avgYearsOfService =
        yearsOfService.length > 0
          ? yearsOfService.reduce((sum, years) => sum + years, 0) /
            yearsOfService.length
          : 0;

      const newHires2025 = activeStaffArr.filter((staff) => {
        const hireDate = staff["HIRE DATE"];
        return hireDate && new Date(hireDate).getFullYear() === 2025;
      }).length;

      const longTermStaff = yearsOfService.filter((years) => years >= 5).length;

      // 4. Managerial Oversight
      const managerCounts = activeStaffArr.reduce((acc, staff) => {
        const manager = staff["REPORTS TO NAME"];
        if (manager && manager.trim() !== "") {
          acc[manager] = (acc[manager] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const managersCount = Object.keys(managerCounts).length;
      const totalReports = Object.values(managerCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      const avgSpanOfControl =
        managersCount > 0 ? totalReports / managersCount : 0;

      // 5. Geographic Analysis
      const crossStateBorder = activeStaffArr.filter((staff) => {
        const livedState = staff["LIVED-IN STATE"];
        const workedState = staff["WORKED IN STATE"];
        return livedState && workedState && livedState !== workedState;
      }).length;

      const livedStateCounts = activeStaffArr.reduce((acc, staff) => {
        const state = staff["LIVED-IN STATE"];
        if (state && state.trim() !== "") {
          acc[state] = (acc[state] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const workedStateCounts = activeStaffArr.reduce((acc, staff) => {
        const state = staff["WORKED IN STATE"];
        if (state && state.trim() !== "") {
          acc[state] = (acc[state] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Create top lists
      const topDepartments = Object.entries(departmentCounts)
        .map(([department, count]) => ({
          department,
          count,
          percentage: Math.round((count / denom) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topLocations = Object.entries(locationCounts)
        .map(([location, count]) => ({
          location,
          count,
          percentage: Math.round((count / denom) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      const topJobTitles = Object.entries(jobTitleCounts)
        .map(([title, count]) => ({
          title,
          count,
          percentage: Math.round((count / denom) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topLivedStates = Object.entries(livedStateCounts)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      const topWorkedStates = Object.entries(workedStateCounts)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      setAnalytics({
        totalStaff,
        topDepartments,
        topLocations,
        topJobTitles,
        activeStaff: activeCount,
        inactiveStaff: totalStaff - activeCount,
        seasonalStaff,
        fullTimeStaff,
        avgYearsOfService: Math.round(avgYearsOfService * 10) / 10,
        newHires2025,
        longTermStaff,
        managersCount,
        avgSpanOfControl: Math.round(avgSpanOfControl * 10) / 10,
        crossStateBorder,
        topLivedStates,
        topWorkedStates,
      });

      setLoading(false);
    }
  }, [externalStaff, stats, statsLoading]);

  if (loading || !analytics) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-600" />
          <h3 className="text-sm font-medium text-slate-900">
            Human Resources Analytics
          </h3>
          <Badge variant="secondary" className="text-xs">
            Loading...
          </Badge>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="border-slate-200 bg-white">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-6 bg-slate-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pct = (num: number, den: number) =>
    Math.round(((den === 0 ? 0 : num / den) * 100));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">
          Human Resources Analytics
        </h3>
        <Badge variant="secondary" className="text-xs">
          Workforce Insights
        </Badge>
      </div>

      {/* Key Workforce Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KWAME version: Active Staff card */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Active Staff</p>
              <Users className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">
              {analytics.activeStaff.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {pct(analytics.activeStaff, analytics.totalStaff)}% of total workforce
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">
                Avg Years Service
              </p>
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">
              {analytics.avgYearsOfService} years
            </p>
            <p className="text-xs text-muted-foreground">
              {analytics.longTermStaff} staff with 5+ years
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">
                New Hires 2025
              </p>
              <Calendar className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">
              {analytics.newHires2025}
            </p>
            <p className="text-xs text-muted-foreground">
              {pct(analytics.newHires2025, analytics.activeStaff)}% of active staff
            </p>
          </CardContent>
        </Card>

        {/* KWAME version: Hiring Trends card */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Hiring Trends</p>
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-500">
                  +{analytics.newHires2025}
                </p>
                <p className="text-xs text-muted-foreground">New hires</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-500">
                  -{analytics.inactiveStaff}
                </p>
                <p className="text-xs text-muted-foreground">Terminated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workforce Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Departments */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">
                Top Departments
              </h4>
            </div>
            <div className="space-y-2">
              {analytics.topDepartments.map((dept, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground truncate flex-1 mr-2">
                    {dept.department}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {dept.count}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {dept.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">
                Top Locations
              </h4>
            </div>
            <div className="space-y-2">
              {analytics.topLocations.map((location, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground truncate flex-1 mr-2">
                    {location.location}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {location.count}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {location.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Job Titles */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">
                Top Job Titles
              </h4>
            </div>
            <div className="space-y-2">
              {analytics.topJobTitles.map((title, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground truncate flex-1 mr-2">
                    {title.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {title.count}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {title.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employment Categories & Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Employment Categories */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">
                Employment Categories
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-foreground">
                  {analytics.seasonalStaff}
                </p>
                <p className="text-xs text-muted-foreground">
                  Seasonal Workers
                </p>
                <p className="text-xs text-muted-foreground">
                  {pct(analytics.seasonalStaff, analytics.activeStaff)}% of active
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-foreground">
                  {analytics.fullTimeStaff}
                </p>
                <p className="text-xs text-muted-foreground">Full-Time Staff</p>
                <p className="text-xs text-muted-foreground">
                  {pct(analytics.fullTimeStaff, analytics.activeStaff)}% of active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Structure */}
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">
                Management Structure
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-foreground">
                  {analytics.managersCount}
                </p>
                <p className="text-xs text-muted-foreground">Total Managers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-foreground">
                  {analytics.avgSpanOfControl}
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg Span of Control
                </p>
                <p className="text-xs text-muted-foreground">
                  reports per manager
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optional geo callout (uses Globe icon already imported) */}
      <Card className="bg-background border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Cross-State Workers
            </p>
            <Globe className="h-3 w-3 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground">
            {analytics.crossStateBorder}
          </p>
          <p className="text-xs text-muted-foreground">
            {pct(analytics.crossStateBorder, analytics.activeStaff)}% commute across states
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
