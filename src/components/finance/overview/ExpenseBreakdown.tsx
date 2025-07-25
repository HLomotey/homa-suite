import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ExpenseBreakdown() {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Monthly expenses by category</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8"
            onClick={() => navigate('/finance/expenses')}
          >
            View Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Placeholder for the pie chart */}
        <div className="h-[200px] w-full rounded-md flex items-center justify-center">
          <div className="relative h-[150px] w-[150px]">
            {/* This would be replaced with a real chart component */}
            <div className="absolute inset-0 rounded-full border-8 border-blue-500/70"></div>
            <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-green-500/70 border-r-green-500/70"></div>
            <div className="absolute inset-0 rounded-full border-8 border-transparent border-b-orange-500/70 border-l-orange-500/70"></div>
            <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-yellow-500/70 rotate-[210deg]"></div>
            
            {/* Legend */}
            <div className="absolute top-[160px] left-[-50px] w-[250px] flex flex-wrap justify-center gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                <span>Salaries 50%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                <span>Operations 25%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                <span>Marketing 15%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                <span>Other 10%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
