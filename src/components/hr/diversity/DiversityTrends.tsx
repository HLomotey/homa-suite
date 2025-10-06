import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Loader2 } from "lucide-react";
import { useDiversityAnalytics } from "@/hooks/diversity/useDiversityAnalytics";

interface DiversityTrendsProps {
  timeRange?: string;
  department?: string;
}

export function DiversityTrends({ timeRange = "6m", department = "all" }: DiversityTrendsProps) {
  const { trends, metrics, loading } = useDiversityAnalytics(timeRange, department);

  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Diversity Trends</CardTitle>
            <CardDescription>
              Real diversity metrics from external staff data ({metrics.totalActive} active staff)
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            View Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">
                  {metrics.genderDiversity}%
                </div>
                <div className="text-sm text-muted-foreground">Gender Diversity</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Non-male representation
                </div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.ethnicDiversity.toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Ethnic Diversity</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Estimated diversity index
                </div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {trends.length > 1 ? 
                    (trends[trends.length - 1]?.genderDiversity - 
                     trends[trends.length - 2]?.genderDiversity > 0 ? '+' : '') +
                    (trends[trends.length - 1]?.genderDiversity - 
                     trends[trends.length - 2]?.genderDiversity).toFixed(1) + '%'
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-muted-foreground">YoY Change</div>
                <div className="text-xs text-muted-foreground mt-1">
                  From last year
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="h-[300px]">
              <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
                <div className="flex-1 flex items-end px-4 pt-6 pb-2 relative">
                  {/* X-axis years */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
                    {trends.map(data => (
                      <span key={data.year}>{data.year}</span>
                    ))}
                  </div>
                  
                  {/* Y-axis percentages */}
                  <div className="absolute top-0 left-0 bottom-0 flex flex-col justify-between py-4 text-xs text-muted-foreground">
                    <span>50%</span>
                    <span>40%</span>
                    <span>30%</span>
                    <span>20%</span>
                    <span>10%</span>
                    <span>0%</span>
                  </div>
                  
                  {/* Dynamic Line Chart */}
                  <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
                    {trends.length > 1 && (
                      <>
                        {/* Gender diversity line */}
                        <path 
                          d={trends.map((data, index) => {
                            const x = (index / (trends.length - 1)) * 250 + 25;
                            const y = 180 - (data.genderDiversity / 50) * 160;
                            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')}
                          fill="none" 
                          stroke="#ec4899" 
                          strokeWidth="2"
                        />
                        {trends.map((data, index) => {
                          const x = (index / (trends.length - 1)) * 250 + 25;
                          const y = 180 - (data.genderDiversity / 50) * 160;
                          return (
                            <circle key={`gender-${index}`} cx={x} cy={y} r="3" fill="#ec4899">
                              <title>Gender Diversity {data.year}: {data.genderDiversity}%</title>
                            </circle>
                          );
                        })}
                        
                        {/* Ethnic diversity line (estimated) */}
                        <path 
                          d={trends.map((data, index) => {
                            const x = (index / (trends.length - 1)) * 250 + 25;
                            const y = 180 - (data.ethnicDiversity / 50) * 160;
                            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')}
                          fill="none" 
                          stroke="#8b5cf6" 
                          strokeWidth="2"
                        />
                        {trends.map((data, index) => {
                          const x = (index / (trends.length - 1)) * 250 + 25;
                          const y = 180 - (data.ethnicDiversity / 50) * 160;
                          return (
                            <circle key={`ethnic-${index}`} cx={x} cy={y} r="3" fill="#8b5cf6">
                              <title>Ethnic Diversity {data.year}: {data.ethnicDiversity}% (estimated)</title>
                            </circle>
                          );
                        })}
                      </>
                    )}
                  </svg>
                </div>
                <div className="h-8 flex items-center justify-between px-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-pink-500 mr-1"></div>
                      <span>Gender Diversity (Real Data)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                      <span>Ethnic Diversity (Estimated)</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on {metrics.totalActive} active staff records
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Diversity analytics based on real external staff data with {metrics.totalActive} active employees
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
