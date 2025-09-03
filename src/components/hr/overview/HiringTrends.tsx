import { useState, useEffect } from "react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HiringTrends() {
  const navigate = useNavigate();
  const { stats, statsLoading, externalStaff } = useExternalStaff();
  
  // State for monthly hiring data
  const [monthlyHires, setMonthlyHires] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [timeToHire, setTimeToHire] = useState<number[]>([15, 18, 22, 19, 25, 21]); // Average days to hire
  
  useEffect(() => {
    if (!statsLoading && externalStaff.length > 0) {
      // Calculate monthly hires for the last 6 months
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      
      // Initialize monthly counts
      const monthCounts = Array(6).fill(0);
      
      // Count hires by month
      externalStaff.forEach(staff => {
        if (staff["HIRE DATE"]) {
          const hireDate = new Date(staff["HIRE DATE"]);
          if (hireDate >= sixMonthsAgo) {
            // Calculate months ago (0 = current month, 5 = 5 months ago)
            const monthsAgo = now.getMonth() - hireDate.getMonth() + 
              (now.getFullYear() - hireDate.getFullYear()) * 12;
            
            if (monthsAgo >= 0 && monthsAgo < 6) {
              // Reverse index (5 = oldest month, 0 = current month)
              const index = 5 - monthsAgo;
              monthCounts[index]++;
            }
          }
        }
      });
      
      setMonthlyHires(monthCounts);
    }
  }, [externalStaff, statsLoading]);
  
  return (
    <Card className="col-span-4 bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Hiring Trends</CardTitle>
            <CardDescription>Monthly hires and time to hire</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8"
            onClick={() => navigate('/hr/overview/hiring')}
          >
            View Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {/* Bar chart visualization */}
          <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
            {statsLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Loading hiring data...</p>
              </div>
            ) : (
              <div className="flex-1 flex items-end px-4 pt-6 pb-2 space-x-6 justify-around">
                {/* Generate month bars dynamically */}
                {monthlyHires.map((hireCount, index) => {
                  // Calculate heights based on values
                  // Scale: 10px per hire for purple bars, fixed scale for amber
                  const hireHeight = Math.max(hireCount * 10, 10); // Min height of 10px
                  const timeHeight = timeToHire[index] * 4; // 4px per day
                  
                  // Get month name
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                  const monthName = monthNames[index];
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="flex items-end space-x-1">
                        {/* eslint-disable-next-line react/forbid-dom-props -- Dynamic chart height requires inline styles */}
                        <div 
                          className="bg-green-500 rounded-t-md" style={{ height: `${timeHeight}px` }}></div>
                        {/* eslint-disable-next-line react/forbid-dom-props -- Dynamic chart height requires inline styles */}
                        <div 
                          className="bg-purple-500 w-8 rounded-t-md flex items-center justify-center text-xs text-white font-medium" 
                          style={{ height: `${hireHeight}px` }}
                        >
                          {hireCount}
                        </div>
                      </div>
                      <span className="text-xs mt-1">{monthName}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                <span>Time to Hire</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                <span>New Hires</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
