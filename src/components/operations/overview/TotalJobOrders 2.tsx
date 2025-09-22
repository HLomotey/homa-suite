import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, TrendingDown } from "lucide-react";

export function TotalJobOrders() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Job Orders
            </p>
            <p className="text-3xl font-bold text-orange-600">342</p>
            <p className="text-sm text-red-600 flex items-center mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              -3.8% from last month
            </p>
          </div>
          <Briefcase className="h-8 w-8 text-orange-600" />
        </div>
      </CardContent>
    </Card>
  );
}
