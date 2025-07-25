import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function MonthlyRevenue() {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Monthly Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">$2.6M</div>
          <div className="flex items-center text-sm text-green-500">
            <span>+12.5% vs LM</span>
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          $2.3M previous month
        </div>
      </CardContent>
    </Card>
  );
}
