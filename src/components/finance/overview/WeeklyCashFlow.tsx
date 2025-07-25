import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function WeeklyCashFlow() {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Weekly Cash Flow</CardTitle>
            <CardDescription>Cash inflow vs outflow by week</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8"
            onClick={() => navigate('/finance/cash-flow')}
          >
            View Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Placeholder for the bar chart */}
        <div className="h-[200px] w-full rounded-md p-6 flex items-end justify-between gap-4">
          {/* Week 1 */}
          <div className="flex flex-col items-center gap-1 w-1/5">
            <div className="w-full h-[80px] bg-red-500/70 rounded-t-sm"></div>
            <div className="w-full h-[100px] bg-green-500/70 rounded-t-sm"></div>
            <span className="text-xs text-muted-foreground mt-2">Week 1</span>
          </div>
          
          {/* Week 2 */}
          <div className="flex flex-col items-center gap-1 w-1/5">
            <div className="w-full h-[70px] bg-red-500/70 rounded-t-sm"></div>
            <div className="w-full h-[120px] bg-green-500/70 rounded-t-sm"></div>
            <span className="text-xs text-muted-foreground mt-2">Week 2</span>
          </div>
          
          {/* Week 3 */}
          <div className="flex flex-col items-center gap-1 w-1/5">
            <div className="w-full h-[90px] bg-red-500/70 rounded-t-sm"></div>
            <div className="w-full h-[80px] bg-green-500/70 rounded-t-sm"></div>
            <span className="text-xs text-muted-foreground mt-2">Week 3</span>
          </div>
          
          {/* Week 4 */}
          <div className="flex flex-col items-center gap-1 w-1/5">
            <div className="w-full h-[85px] bg-red-500/70 rounded-t-sm"></div>
            <div className="w-full h-[110px] bg-green-500/70 rounded-t-sm"></div>
            <span className="text-xs text-muted-foreground mt-2">Week 4</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500/70 rounded-sm mr-1"></div>
            <span>Inflow</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500/70 rounded-sm mr-1"></div>
            <span>Outflow</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
