import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useRecruitmentAnalytics } from "@/hooks/recruitment/useRecruitmentAnalytics";

interface RecruitmentMetricsProps {
  timeRange: string;
  department: string;
}

export function RecruitmentMetrics({ timeRange, department }: RecruitmentMetricsProps) {
  const { departmentData, hiringTrends, sourceOfHire, funnelData, loading } = useRecruitmentAnalytics(timeRange, department);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Time to Hire by Department</CardTitle>
                <CardDescription>Average days to fill positions</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View Details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* Bar chart visualization */}
              <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
                <div className="flex-1 flex items-end px-4 pt-6 pb-2 space-x-6">
                  {loading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-sm text-muted-foreground">Loading department data...</div>
                    </div>
                  ) : (
                    departmentData.slice(0, 7).map((dept, index) => {
                      const maxHeight = 200;
                      const maxTime = Math.max(...departmentData.map(d => d.avgTimeToHire));
                      const height = Math.max(60, (dept.avgTimeToHire / maxTime) * maxHeight);
                      
                      return (
                        <div key={dept.department} className="flex flex-col items-center">
                          <div 
                            className="bg-blue-500 w-12 rounded-t-md" 
                            style={{ height: `${height}px` }}
                            title={`${dept.department}: ${dept.avgTimeToHire} days`}
                          ></div>
                          <span className="text-xs mt-1 text-center max-w-[60px] truncate" title={dept.department}>
                            {dept.department.length > 8 ? dept.department.substring(0, 8) + '...' : dept.department}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
                  <div className="flex-1">Departments</div>
                  <div className="flex items-center">
                    <span>Days to Hire</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Source of Hire</CardTitle>
                <CardDescription>Where successful candidates come from</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View Details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* Donut chart visualization */}
              <div className="flex items-center justify-center h-full">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Segment 1 - 35% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="20"
                      strokeDasharray="219.8 452.4"
                      strokeDashoffset="0"
                    />
                    {/* Segment 2 - 25% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray="157.1 452.4"
                      strokeDashoffset="-219.8"
                    />
                    {/* Segment 3 - 20% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="20"
                      strokeDasharray="125.6 452.4"
                      strokeDashoffset="-376.9"
                    />
                    {/* Segment 4 - 20% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#8b5cf6"
                      strokeWidth="20"
                      strokeDasharray="125.6 452.4"
                      strokeDashoffset="-502.5"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      fill="var(--background)"
                    />
                  </svg>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  {loading ? (
                    <div className="text-sm text-muted-foreground">Loading source data...</div>
                  ) : (
                    sourceOfHire.map((source, index) => {
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500'];
                      return (
                        <div key={source.source} className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2`}></div>
                          <span className="text-xs">{source.source} ({source.percentage}%)</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hiring Velocity</CardTitle>
                <CardDescription>Monthly hiring trends</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View Details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {/* Line chart visualization */}
              <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
                <div className="flex-1 flex items-end px-4 pt-6 pb-2 relative">
                  {/* X-axis months */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
                    {loading ? (
                      <span>Loading...</span>
                    ) : (
                      hiringTrends.map((trend, index) => (
                        <span key={index}>{trend.month}</span>
                      ))
                    )}
                  </div>
                  
                  {/* Line chart path - simplified representation */}
                  <svg className="w-full h-full" style={{ paddingLeft: '30px', paddingBottom: '20px' }}>
                    <path 
                      d="M 0,150 L 50,120 L 100,180 L 150,100 L 200,140 L 250,80" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="2"
                    />
                    <circle cx="0" cy="150" r="3" fill="#3b82f6" />
                    <circle cx="50" cy="120" r="3" fill="#3b82f6" />
                    <circle cx="100" cy="180" r="3" fill="#3b82f6" />
                    <circle cx="150" cy="100" r="3" fill="#3b82f6" />
                    <circle cx="200" cy="140" r="3" fill="#3b82f6" />
                    <circle cx="250" cy="80" r="3" fill="#3b82f6" />
                  </svg>
                </div>
                <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span>New Hires</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recruitment Funnel</CardTitle>
                <CardDescription>Conversion rates between stages</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View Details <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              {/* Funnel visualization */}
              <div className="w-full max-w-md space-y-4">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading funnel data...</div>
                ) : (
                  funnelData.map((stage, index) => (
                    <div key={stage.stage} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{stage.stage}</span>
                        <span>{stage.count} ({stage.percentage}%)</span>
                      </div>
                      <div 
                        className="mx-auto bg-blue-500 h-8 rounded-sm" 
                        style={{ width: `${Math.max(15, stage.percentage)}%` }}
                      ></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
