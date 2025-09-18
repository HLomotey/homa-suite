import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp } from "lucide-react";

export function FillRate() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Fill Rate
            </p>
            <p className="text-3xl font-bold text-green-600">87%</p>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.3% from last month
            </p>
          </div>
          <Target className="h-8 w-8 text-green-600" />
        </div>
      </CardContent>
    </Card>
  );
}
