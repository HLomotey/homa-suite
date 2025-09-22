import { useState, useEffect, useMemo } from "react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  UserMinus,
  Clock,
  BarChart,
  PieChart,
  Calendar,
  Download,
  ChevronRight,
  Filter,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { HROverview } from "@/components/hr/HROverview";
import { HRDepartments } from "@/components/hr/HRDepartments";
import { HRDiversity } from "@/components/hr/HRDiversity";
import { HRRecruitment } from "@/components/hr/HRRecruitment";
import { TerminationModule } from "@/components/termination/TerminationModule";

export default function HR() {
  const [activeTab, setActiveTab] = useState("overview");
  const { stats, statsLoading, externalStaff } = useExternalStaff();

  // Calculate comprehensive trend data for 12 months
  const trendAnalysis = useMemo(() => {
    if (!externalStaff.length) return { monthlyData: [], metrics: {} };

    const now = new Date();
    const monthlyData = [];
    
    // Generate 12 months of data
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      // Calculate active staff at end of month
      const activeAtMonth = externalStaff.filter(staff => {
        const hireDate = staff["HIRE DATE"] ? new Date(staff["HIRE DATE"]) : null;
        const termDate = staff["TERMINATION DATE"] ? new Date(staff["TERMINATION DATE"]) : null;
        
        return hireDate && hireDate < nextMonthDate && (!termDate || termDate >= nextMonthDate);
      }).length;
      
      // Calculate inactive staff at end of month
      const inactiveAtMonth = externalStaff.filter(staff => {
        const termDate = staff["TERMINATION DATE"] ? new Date(staff["TERMINATION DATE"]) : null;
        
        return termDate && termDate < nextMonthDate;
      }).length;
      
      // Calculate new hires in month
      const monthHires = externalStaff.filter(staff => {
        if (!staff["HIRE DATE"]) return false;
        const hireDate = new Date(staff["HIRE DATE"]);
        return hireDate >= monthDate && hireDate < nextMonthDate;
      }).length;
      
      // Calculate terminations in month
      const monthTerminations = externalStaff.filter(staff => {
        if (!staff["TERMINATION DATE"]) return false;
        const termDate = new Date(staff["TERMINATION DATE"]);
        return termDate >= monthDate && termDate < nextMonthDate;
      }).length;
      
      monthlyData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        active: activeAtMonth,
        inactive: inactiveAtMonth,
        hires: monthHires,
        terminations: monthTerminations,
        netChange: monthHires - monthTerminations,
        turnoverRate: activeAtMonth > 0 ? ((monthTerminations / activeAtMonth) * 100).toFixed(1) : "0.0"
      });
    }
    
    // Calculate additional metrics
    const totalHires = monthlyData.reduce((sum, month) => sum + month.hires, 0);
    const totalTerminations = monthlyData.reduce((sum, month) => sum + month.terminations, 0);
    const avgMonthlyHires = (totalHires / 12).toFixed(1);
    const avgMonthlyTerminations = (totalTerminations / 12).toFixed(1);
    const netGrowth = totalHires - totalTerminations;
    const avgTurnoverRate = (monthlyData.reduce((sum, month) => sum + parseFloat(month.turnoverRate), 0) / 12).toFixed(1);
    
    // Calculate growth trend (comparing last 3 months to previous 3 months)
    const recent3Months = monthlyData.slice(-3);
    const previous3Months = monthlyData.slice(-6, -3);
    const recentAvgActive = recent3Months.reduce((sum, month) => sum + month.active, 0) / 3;
    const previousAvgActive = previous3Months.reduce((sum, month) => sum + month.active, 0) / 3;
    const growthTrend = previousAvgActive > 0 ? ((recentAvgActive - previousAvgActive) / previousAvgActive * 100).toFixed(1) : "0.0";
    
    return {
      monthlyData,
      metrics: {
        totalHires,
        totalTerminations,
        avgMonthlyHires,
        avgMonthlyTerminations,
        netGrowth,
        avgTurnoverRate,
        growthTrend: parseFloat(growthTrend)
      }
    };
  }, [externalStaff]);

  return (
    <div className="flex-1 h-full p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">HR Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Headcount
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats.totalCount}</div>
            <p className="text-xs text-muted-foreground">External staff members</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Staff
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats.active}</div>
            <p className="text-xs text-green-500">
              {statsLoading ? "..." : `${stats.totalCount > 0 ? Math.round((stats.active / stats.totalCount) * 100) : 0}% of total`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminated Staff</CardTitle>
            <UserMinus className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats.terminated}</div>
            <p className="text-xs text-red-500">
              {statsLoading ? "..." : `${stats.totalCount > 0 ? Math.round((stats.terminated / stats.totalCount) * 100) : 0}% of total`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Net Growth
            </CardTitle>
            {trendAnalysis.metrics.growthTrend >= 0 ? 
              <TrendingUp className="h-4 w-4 text-green-500" /> : 
              <TrendingDown className="h-4 w-4 text-red-500" />
            }
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : (trendAnalysis.metrics.netGrowth > 0 ? "+" : "") + trendAnalysis.metrics.netGrowth}
            </div>
            <p className={`text-xs ${trendAnalysis.metrics.growthTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {statsLoading ? "..." : `${trendAnalysis.metrics.growthTrend >= 0 ? '+' : ''}${trendAnalysis.metrics.growthTrend}% trend`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Turnover
            </CardTitle>
            <BarChart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : trendAnalysis.metrics.avgTurnoverRate + "%"}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly average
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Hires
            </CardTitle>
            <UserPlus className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats.newThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">
              In the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workforce Trend Analysis */}
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Workforce Trend Analysis</CardTitle>
          <CardDescription>12-month active vs inactive staff trends with comprehensive metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Line Chart Visualization */}
              <div className="h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 800 200">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="66.67" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 66.67 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="800" height="200" fill="url(#grid)" />
                  
                  {/* Calculate max value for scaling */}
                  {(() => {
                    const maxActive = Math.max(...trendAnalysis.monthlyData.map(d => d.active));
                    const maxInactive = Math.max(...trendAnalysis.monthlyData.map(d => d.inactive));
                    const maxValue = Math.max(maxActive, maxInactive);
                    const scaleY = (value) => 180 - (value / maxValue) * 160;
                    const scaleX = (index) => 50 + (index * (700 / (trendAnalysis.monthlyData.length - 1)));
                    
                    // Generate path for active staff line
                    const activePath = trendAnalysis.monthlyData.map((d, i) => 
                      `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.active)}`
                    ).join(' ');
                    
                    // Generate path for inactive staff line
                    const inactivePath = trendAnalysis.monthlyData.map((d, i) => 
                      `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.inactive)}`
                    ).join(' ');
                    
                    return (
                      <>
                        {/* Active staff line */}
                        <path d={activePath} fill="none" stroke="#10b981" strokeWidth="3" />
                        {/* Inactive staff line */}
                        <path d={inactivePath} fill="none" stroke="#ef4444" strokeWidth="3" />
                        
                        {/* Data points */}
                        {trendAnalysis.monthlyData.map((d, i) => (
                          <g key={i}>
                            <circle cx={scaleX(i)} cy={scaleY(d.active)} r="4" fill="#10b981" />
                            <circle cx={scaleX(i)} cy={scaleY(d.inactive)} r="4" fill="#ef4444" />
                            
                            {/* Month labels */}
                            <text x={scaleX(i)} y="195" textAnchor="middle" fontSize="10" fill="#6b7280">
                              {d.month}
                            </text>
                          </g>
                        ))}
                        
                        {/* Y-axis labels */}
                        <text x="10" y="25" fontSize="10" fill="#6b7280">{maxValue}</text>
                        <text x="10" y="105" fontSize="10" fill="#6b7280">{Math.round(maxValue/2)}</text>
                        <text x="10" y="185" fontSize="10" fill="#6b7280">0</text>
                      </>
                    );
                  })()}
                </svg>
              </div>
              
              {/* Legend and Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-0.5 bg-green-500"></div>
                      <span className="text-sm text-muted-foreground">Active Staff</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-0.5 bg-red-500"></div>
                      <span className="text-sm text-muted-foreground">Inactive Staff</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Hires (12mo)</p>
                      <p className="text-lg font-semibold text-green-600">{trendAnalysis.metrics.totalHires}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Terminations (12mo)</p>
                      <p className="text-lg font-semibold text-red-600">{trendAnalysis.metrics.totalTerminations}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Avg Monthly Hires</p>
                      <p className="text-lg font-semibold text-blue-600">{trendAnalysis.metrics.avgMonthlyHires}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Monthly Terms</p>
                      <p className="text-lg font-semibold text-orange-600">{trendAnalysis.metrics.avgMonthlyTerminations}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Workforce Growth Trend</p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${trendAnalysis.metrics.growthTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trendAnalysis.metrics.growthTrend >= 0 ? '+' : ''}{trendAnalysis.metrics.growthTrend}%
                      </span>
                      {trendAnalysis.metrics.growthTrend >= 0 ? 
                        <TrendingUp className="h-4 w-4 text-green-600" /> : 
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Comparing last 3 months to previous 3 months
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-background border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="diversity">Diversity</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="termination">Termination</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <HROverview />
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <HRDepartments />
        </TabsContent>

        <TabsContent value="diversity" className="space-y-4">
          <HRDiversity />
        </TabsContent>

        <TabsContent value="recruitment" className="space-y-4">
          <HRRecruitment />
        </TabsContent>

        <TabsContent value="termination" className="space-y-4">
          <TerminationModule />
        </TabsContent>
      </Tabs>
    </div>
  );
}
