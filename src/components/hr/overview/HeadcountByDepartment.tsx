import { useState, useEffect } from "react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeadcountByDepartment() {
  const [timeRange, setTimeRange] = useState("6m");
  const navigate = useNavigate();
  const { stats, statsLoading } = useExternalStaff();
  
  // Calculate the maximum department count for scaling
  const maxDepartmentCount = statsLoading ? 100 : Math.max(
    ...stats.topDepartments.map(dept => dept.count)
  );
  
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
                stats.topDepartments.map((dept, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-blue-500 w-12 rounded-t-md" 
                      style={{ 
                        height: `${Math.max(30, (dept.count / maxDepartmentCount) * 250)}px` 
                      }}
                    ></div>
                    <span className="text-xs mt-1 max-w-16 truncate" title={dept.department}>
                      {dept.department || 'Unassigned'}
                    </span>
                    <span className="text-xs text-muted-foreground">{dept.count}</span>
                  </div>
                ))
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
