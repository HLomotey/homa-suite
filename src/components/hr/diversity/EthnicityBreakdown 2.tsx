import { useState, useEffect } from "react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function EthnicityBreakdown() {
  const { externalStaff, statsLoading } = useExternalStaff();
  const [ethnicityData, setEthnicityData] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  
  // Define colors for different ethnicities
  const ethnicityColors: {[key: string]: string} = {
    "White": "#3b82f6", // blue
    "Asian": "#10b981", // green
    "Hispanic": "#f59e0b", // amber
    "Black": "#8b5cf6", // purple
    "Native American": "#ec4899", // pink
    "Pacific Islander": "#06b6d4", // cyan
    "Two or More": "#f43f5e", // rose
    "Other": "#64748b", // slate
    "Prefer not to say": "#9ca3af" // gray
  };
  
  useEffect(() => {
    if (!statsLoading && externalStaff.length > 0) {
      setLoading(true);
      
      // Count staff by ethnicity
      const ethnicityCount: {[key: string]: number} = {};
      
      externalStaff.forEach(staff => {
        let ethnicity = staff["ETHNICITY"] || "Prefer not to say";
        
        // Normalize ethnicity values
        if (typeof ethnicity === 'string') {
          ethnicity = ethnicity.trim();
          
          // Map common variations to standard categories
          if (/white|caucasian/i.test(ethnicity)) {
            ethnicity = "White";
          } else if (/asian|chinese|japanese|korean|indian|vietnamese/i.test(ethnicity)) {
            ethnicity = "Asian";
          } else if (/hispanic|latino|latina|mexican|spanish/i.test(ethnicity)) {
            ethnicity = "Hispanic";
          } else if (/black|african/i.test(ethnicity)) {
            ethnicity = "Black";
          } else if (/native american|american indian|indigenous/i.test(ethnicity)) {
            ethnicity = "Native American";
          } else if (/pacific islander|hawaiian/i.test(ethnicity)) {
            ethnicity = "Pacific Islander";
          } else if (/two or more|mixed|multiple/i.test(ethnicity)) {
            ethnicity = "Two or More";
          } else if (!ethnicity || /prefer not|decline|unknown/i.test(ethnicity)) {
            ethnicity = "Prefer not to say";
          } else {
            ethnicity = "Other";
          }
        } else {
          ethnicity = "Prefer not to say";
        }
        
        ethnicityCount[ethnicity] = (ethnicityCount[ethnicity] || 0) + 1;
      });
      
      // Sort ethnicities by count (descending)
      const sortedData: {[key: string]: number} = {};
      Object.entries(ethnicityCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([ethnicity, count]) => {
          sortedData[ethnicity] = count;
        });
      
      setEthnicityData(sortedData);
      setLoading(false);
    }
  }, [externalStaff, statsLoading]);
  
  // Calculate percentages and chart parameters
  const total = Object.values(ethnicityData).reduce((sum, count) => sum + count, 0);
  const ethnicityPercentages: {[key: string]: number} = {};
  
  Object.entries(ethnicityData).forEach(([ethnicity, count]) => {
    ethnicityPercentages[ethnicity] = total > 0 ? Math.round((count / total) * 100) : 0;
  });
  
  // Calculate stroke dasharray and dashoffset for donut chart segments
  const circumference = 2 * Math.PI * 40; // 2πr where r=40
  let dashoffset = 0;
  const chartSegments = Object.entries(ethnicityPercentages).map(([ethnicity, percentage]) => {
    const dasharray = (percentage / 100) * circumference;
    const segment = {
      ethnicity,
      percentage,
      dasharray,
      dashoffset,
      color: ethnicityColors[ethnicity] || "#9ca3af" // default to gray if no color defined
    };
    dashoffset -= dasharray;
    return segment;
  });
  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Ethnicity Breakdown</CardTitle>
          <Button variant="ghost" size="sm">
            Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading ethnicity data...</p>
            </div>
          ) : (
            /* Donut chart visualization */
            <div className="flex items-center justify-center h-full">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {chartSegments.map((segment, index) => (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth="20"
                      strokeDasharray={`${segment.dasharray} ${circumference}`}
                      strokeDashoffset={`${segment.dashoffset}`}
                    />
                  ))}
                  <circle
                    cx="50"
                    cy="50"
                    r="30"
                    fill="var(--background)"
                  />
                </svg>
              </div>
              <div className="flex flex-col space-y-2 ml-4 max-h-[180px] overflow-y-auto">
                {chartSegments.map((segment, index) => (
                  <div key={index} className="flex items-center">
                    {/* eslint-disable-next-line react/forbid-dom-props */}
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: segment.color }}
                    ></div>
                    <span className="text-xs">{segment.ethnicity} ({segment.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
