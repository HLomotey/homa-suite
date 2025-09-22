import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users2 } from "lucide-react";

export function GenderOverview() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Gender Diversity
            </p>
            <p className="text-3xl font-bold text-purple-600">52/48</p>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +1.2% balanced
            </p>
          </div>
          <Users2 className="h-8 w-8 text-purple-600" />
        </div>
      </CardContent>
    </Card>
  );
}
