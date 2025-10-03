import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { useDiversityAnalytics } from "@/hooks/diversity/useDiversityAnalytics";

interface DiversityProgramsProps {
  timeRange?: string;
  department?: string;
}

export function DiversityPrograms({ timeRange = "6m", department = "all" }: DiversityProgramsProps) {
  const { programs, loading } = useDiversityAnalytics(timeRange, department);
  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Diversity Programs</CardTitle>
            <CardDescription>Ongoing initiatives and their impact</CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Loading program data...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {programs.map((program, index) => {
              const progressPercentage = (program.current / program.target) * 100;
              const statusColor = program.status === 'on-track' ? 'text-green-500' : 
                                program.status === 'ahead' ? 'text-blue-500' : 'text-amber-500';
              const barColor = program.status === 'on-track' ? 'bg-green-500' : 
                             program.status === 'ahead' ? 'bg-blue-500' : 'bg-amber-500';
              const TrendIcon = program.yoyChange > 0 ? TrendingUp : TrendingDown;
              
              return (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{program.name}</h4>
                    <div className={`text-sm ${statusColor} flex items-center`}>
                      <TrendIcon className="h-3 w-3 mr-1" />
                      {program.yoyChange > 0 ? '+' : ''}{program.yoyChange}% YoY
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {program.description}
                  </p>
                  <div className="mt-2 w-full bg-muted rounded-full h-2">
                    <div 
                      className={`${barColor} h-2 rounded-full`} 
                      style={{ width: `${Math.min(100, progressPercentage)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>Target: {program.target}%</span>
                    <span>Current: {program.current}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
