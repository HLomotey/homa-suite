import { useState, useEffect } from "react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function AgeDemographics() {
  const { externalStaff, statsLoading } = useExternalStaff();
  const [ageGroups, setAgeGroups] = useState<{[key: string]: number}>({
    "18-24": 0,
    "25-34": 0,
    "35-44": 0,
    "45-54": 0,
    "55+": 0
  });
  const [loading, setLoading] = useState(true);
  const [maxCount, setMaxCount] = useState(0);
  
  useEffect(() => {
    if (!statsLoading && externalStaff.length > 0) {
      setLoading(true);
      
      // Initialize age groups
      const ageData = {
        "18-24": 0,
        "25-34": 0,
        "35-44": 0,
        "45-54": 0,
        "55+": 0
      };
      
      // Calculate age from date of birth and count by age group
      const currentYear = new Date().getFullYear();
      
      externalStaff.forEach(staff => {
        if (staff["DATE OF BIRTH"]) {
          try {
            const birthDate = new Date(staff["DATE OF BIRTH"]);
            const age = currentYear - birthDate.getFullYear();
            
            // Assign to age group
            if (age < 25) {
              ageData["18-24"]++;
            } else if (age < 35) {
              ageData["25-34"]++;
            } else if (age < 45) {
              ageData["35-44"]++;
            } else if (age < 55) {
              ageData["45-54"]++;
            } else {
              ageData["55+"]++;
            }
          } catch (error) {
            // Skip invalid dates
            console.error("Invalid date format:", staff["DATE OF BIRTH"]);
          }
        }
      });
      
      // Find the maximum count for scaling the chart
      const max = Math.max(...Object.values(ageData));
      
      setAgeGroups(ageData);
      setMaxCount(max);
      setLoading(false);
    }
  }, [externalStaff, statsLoading]);
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
                {Object.entries(ageGroups).map(([ageGroup, count]) => {
                  // Calculate height based on count relative to max count (max height 140px)
                  const height = maxCount > 0 ? Math.max((count / maxCount) * 140, 10) : 10;
                  
                  return (
                    <div key={ageGroup} className="flex flex-col items-center">
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
