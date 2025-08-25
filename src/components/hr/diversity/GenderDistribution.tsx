import { useState, useEffect } from "react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function GenderDistribution() {
  const { externalStaff, statsLoading } = useExternalStaff();
  const [genderData, setGenderData] = useState<{male: number, female: number, other: number}>({male: 0, female: 0, other: 0});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!statsLoading && externalStaff.length > 0) {
      setLoading(true);
      
      // Count staff by gender
      let maleCount = 0;
      let femaleCount = 0;
      let otherCount = 0;
      
      externalStaff.forEach(staff => {
        const gender = staff["GENDER (SELF-ID)"]?.toLowerCase();
        if (gender === "male") {
          maleCount++;
        } else if (gender === "female") {
          femaleCount++;
        } else {
          otherCount++;
        }
      });
      
      setGenderData({ male: maleCount, female: femaleCount, other: otherCount });
      setLoading(false);
    }
  }, [externalStaff, statsLoading]);
  
  // Calculate percentages
  const total = genderData.male + genderData.female + genderData.other;
  const malePercentage = total > 0 ? Math.round((genderData.male / total) * 100) : 0;
  const femalePercentage = total > 0 ? Math.round((genderData.female / total) * 100) : 0;
  const otherPercentage = total > 0 ? 100 - malePercentage - femalePercentage : 0;
  
  // Calculate stroke dasharray and dashoffset for pie chart segments
  const circumference = 2 * Math.PI * 40; // 2πr where r=40
  const maleDasharray = (malePercentage / 100) * circumference;
  const femaleDasharray = (femalePercentage / 100) * circumference;
  const otherDasharray = (otherPercentage / 100) * circumference;
  
  const maleDashoffset = 0;
  const femaleDashoffset = -maleDasharray;
  const otherDashoffset = -(maleDasharray + femaleDasharray);
  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Gender Distribution</CardTitle>
          <Button variant="ghost" size="sm">
            Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center">
          {loading ? (
            <div className="text-muted-foreground">Loading gender data...</div>
          ) : (
            <>
              {/* Pie chart visualization */}
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Male segment */}
                  {malePercentage > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="40"
                      strokeDasharray={`${maleDasharray} ${circumference}`}
                      strokeDashoffset={`${maleDashoffset}`}
                    />
                  )}
                  {/* Female segment */}
                  {femalePercentage > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#ec4899"
                      strokeWidth="40"
                      strokeDasharray={`${femaleDasharray} ${circumference}`}
                      strokeDashoffset={`${femaleDashoffset}`}
                    />
                  )}
                  {/* Other segment */}
                  {otherPercentage > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#a855f7"
                      strokeWidth="40"
                      strokeDasharray={`${otherDasharray} ${circumference}`}
                      strokeDashoffset={`${otherDashoffset}`}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs">
                  <div className="text-center">
                    <div className="font-medium">Gender Ratio</div>
                    <div className="text-muted-foreground">
                      {malePercentage}% / {femalePercentage}%{otherPercentage > 0 ? ` / ${otherPercentage}%` : ''}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Male ({malePercentage}%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                  <span className="text-sm">Female ({femalePercentage}%)</span>
                </div>
                {otherPercentage > 0 && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-sm">Other ({otherPercentage}%)</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
