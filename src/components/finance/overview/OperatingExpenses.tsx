import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function OperatingExpenses() {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Operating Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">$1.2M</div>
          <div className="flex items-center text-sm text-orange-500">
            <span>+3.5% vs LM</span>
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          $1.16M previous month
        </div>
      </CardContent>
    </Card>
  );
}
