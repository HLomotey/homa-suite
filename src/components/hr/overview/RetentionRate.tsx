import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function RetentionRate() {
  return (
    <Card className="col-span-3 bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Employee Retention Rate</CardTitle>
            <CardDescription>Monthly retention rate trends</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-8">
            View Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {/* Line chart visualization */}
          <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
            <div className="flex-1 flex items-end px-4 pt-6 pb-2 relative">
              {/* X-axis months */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
              
              {/* Y-axis percentages */}
              <div className="absolute top-0 left-0 bottom-0 flex flex-col justify-between py-4 text-xs text-muted-foreground">
                <span>100%</span>
                <span>95%</span>
                <span>90%</span>
                <span>85%</span>
                <span>80%</span>
              </div>
              
              {/* Line chart path - simplified representation */}
              <svg className="w-full h-full" style={{ paddingLeft: '30px', paddingBottom: '20px' }}>
                <path 
                  d="M 0,50 L 50,30 L 100,45 L 150,20 L 200,35 L 250,30" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2"
                />
                <circle cx="0" cy="50" r="3" fill="#10b981" />
                <circle cx="50" cy="30" r="3" fill="#10b981" />
                <circle cx="100" cy="45" r="3" fill="#10b981" />
                <circle cx="150" cy="20" r="3" fill="#10b981" />
                <circle cx="200" cy="35" r="3" fill="#10b981" />
                <circle cx="250" cy="30" r="3" fill="#10b981" />
              </svg>
            </div>
            <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span>Retention Rate</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
