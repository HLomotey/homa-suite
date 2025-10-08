import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useDiversityAnalytics } from "@/hooks/diversity/useDiversityAnalytics";

interface AgeDemographicsProps {
  timeRange?: string;
  department?: string;
}

export function AgeDemographics({ timeRange = "6m", department = "all" }: AgeDemographicsProps) {
  const { ageGroupData, loading } = useDiversityAnalytics(timeRange, department);
  
  // Find the maximum count for scaling the chart
  const maxCount = Math.max(...Object.values(ageGroupData));
  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Age Demographics</CardTitle>
          <Button variant="ghost" size="sm">
            Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading age data...</p>
            </div>
          ) : (
            /* Bar chart visualization */
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 flex items-end px-4 pt-6 pb-2 space-x-6 justify-around">
                {Object.entries(ageGroupData).map(([ageGroup, count]) => {
                  // Calculate height based on count relative to max count (max height 140px)
                  const height = maxCount > 0 ? Math.max((count / maxCount) * 140, 10) : 10;
                  
                  return (
                    <div key={ageGroup} className="flex flex-col items-center">
                      {/* eslint-disable-next-line react/forbid-dom-props -- Dynamic chart height requires inline styles */}
                      <div className="relative bg-blue-500 w-10 rounded-t-md" style={{ height: `${height}px` }}>
                        <span className="absolute -top-5 text-xs">{count}</span>
                      </div>
                      <span className="text-xs mt-1">{ageGroup}</span>
                    </div>
                  );
                })}
              </div>
              <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
                <div className="flex-1">Age Groups</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
