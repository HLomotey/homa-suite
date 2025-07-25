import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RevenueProfitTrend() {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue vs Profit Trend</CardTitle>
            <CardDescription>Monthly revenue, expenses, and profit comparison</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8"
            onClick={() => navigate('/finance/revenue-trend')}
          >
            View Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Placeholder for the stacked area chart */}
        <div className="h-[200px] w-full rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 flex items-center justify-center">
          <div className="h-full w-full relative">
            {/* This would be replaced with a real chart component */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-blue-500/20 rounded-md"></div>
            <div className="absolute bottom-0 left-0 w-full h-2/3 bg-green-500/20 rounded-md"></div>
            <div className="absolute bottom-0 left-0 w-full h-full bg-purple-500/10 rounded-md"></div>
            
            {/* Month labels */}
            <div className="absolute bottom-[-20px] left-0 w-full flex justify-between text-xs text-muted-foreground">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
