import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function GrossMargin() {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Gross Margin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">58%</div>
          <div className="flex items-center text-sm text-blue-500">
            <span>+2.3% vs LM</span>
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          55.7% previous month
        </div>
      </CardContent>
    </Card>
  );
}
