import { useState, useEffect } from "react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeadcountByDepartment() {
  const [timeRange, setTimeRange] = useState("6m");
  const navigate = useNavigate();
  const { externalStaff, statsLoading } = useExternalStaff();
  
  // Calculate department distribution from active staff
  const [departmentData, setDepartmentData] = useState<Array<{department: string, count: number, percentage: number}>>([]);
  
  useEffect(() => {
    if (!statsLoading && externalStaff.length > 0) {
      const activeStaff = externalStaff.filter(staff => !staff["TERMINATION DATE"]);
      
      const departmentCounts = activeStaff.reduce((acc, staff) => {
        const dept = staff["HOME DEPARTMENT"] || "Unassigned";
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const departments = Object.entries(departmentCounts)
        .map(([department, count]) => ({
          department,
          count,
          percentage: Math.round((count / activeStaff.length) * 100)
        }))
        .sort((a, b) => b.count - a.count);
      
      setDepartmentData(departments);
    }
  }, [externalStaff, statsLoading]);
  
  const maxDepartmentCount = departmentData.length > 0 ? Math.max(...departmentData.map(dept => dept.count)) : 100;
  
  return (
    <Card className="col-span-4 bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Headcount by Department</CardTitle>
            <CardDescription>Employee distribution across departments</CardDescription>
          </div>
          <Tabs 
            value={timeRange} 
            onValueChange={setTimeRange} 
            className="w-[200px]"
          >
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="3m">3M</TabsTrigger>
              <TabsTrigger value="6m">6M</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {/* Bar chart visualization */}
          <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
            <div className="flex-1 flex items-end px-4 pt-6 pb-2 space-x-6">
              {statsLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading department data...</p>
                </div>
              ) : (
                departmentData.slice(0, 8).map((dept, index) => {
                  return (
                    <div key={index} className="flex flex-col items-center">
                      {/* eslint-disable-next-line react/forbid-dom-props -- Dynamic chart height requires inline styles */}
                      <div 
                        className="bg-blue-500 rounded-t-md" 
                        style={{ 
                          height: `${Math.max(30, (dept.count / maxDepartmentCount) * 250)}px` 
                        }}
                      ></div>
                      <span className="text-xs mt-1 max-w-16 truncate" title={dept.department}>
                        {dept.department}
                      </span>
                      <span className="text-xs text-muted-foreground">{dept.count}</span>
                      <span className="text-xs text-slate-400">{dept.percentage}%</span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
              <div className="flex-1">Departments</div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => navigate('/hr/overview/headcount')}
              >
                View Details <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
