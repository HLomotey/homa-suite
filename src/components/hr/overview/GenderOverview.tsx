import { useState, useEffect } from "react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function GenderOverview() {
  const navigate = useNavigate();
  const { externalStaff, loading } = useExternalStaff();
  
  // Calculate gender distribution
  const [genderData, setGenderData] = useState<{male: number, female: number, other: number}>({male: 0, female: 0, other: 0});
  const [genderPercentages, setGenderPercentages] = useState<{male: number, female: number, other: number}>({male: 0, female: 0, other: 0});
  
  useEffect(() => {
    if (!loading && externalStaff.length > 0) {
      const genderCounts = {male: 0, female: 0, other: 0};
      
      externalStaff.forEach(staff => {
        const gender = staff["GENDER (SELF-ID)"]?.toLowerCase() || "";
        if (gender.includes("male") && !gender.includes("female")) {
          genderCounts.male++;
        } else if (gender.includes("female")) {
          genderCounts.female++;
        } else {
          genderCounts.other++;
        }
      });
      
      setGenderData(genderCounts);
      
      const total = genderCounts.male + genderCounts.female + genderCounts.other;
      if (total > 0) {
        setGenderPercentages({
          male: Math.round((genderCounts.male / total) * 100),
          female: Math.round((genderCounts.female / total) * 100),
          other: Math.round((genderCounts.other / total) * 100)
        });
      }
    }
  }, [externalStaff, loading]);
  
  return (
    <Card className="col-span-3 bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Employee gender breakdown</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8"
            onClick={() => navigate('/hr/overview/gender')}
          >
            View Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading gender data...</p>
            </div>
          ) : (
            <>
              {/* Pie chart visualization */}
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Calculate stroke dasharray and offset for pie chart segments */}
                  {/* Male segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="40"
                    strokeDasharray={`${genderPercentages.male * 2.51} 251.2`}
                    strokeDashoffset="0"
                  />
                  {/* Female segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#ec4899"
                    strokeWidth="40"
                    strokeDasharray={`${genderPercentages.female * 2.51} 251.2`}
                    strokeDashoffset={`-${genderPercentages.male * 2.51}`}
                  />
                  {/* Other segment */}
                  {genderPercentages.other > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="40"
                      strokeDasharray={`${genderPercentages.other * 2.51} 251.2`}
                      strokeDashoffset={`-${(genderPercentages.male + genderPercentages.female) * 2.51}`}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs">
                  <div className="text-center">
                    <div className="font-medium">Gender Ratio</div>
                    <div className="text-muted-foreground">
                      {genderPercentages.male}% / {genderPercentages.female}%
                      {genderPercentages.other > 0 ? ` / ${genderPercentages.other}%` : ''}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Male ({genderPercentages.male}%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                  <span className="text-sm">Female ({genderPercentages.female}%)</span>
                </div>
                {genderPercentages.other > 0 && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                    <span className="text-sm">Other ({genderPercentages.other}%)</span>
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
