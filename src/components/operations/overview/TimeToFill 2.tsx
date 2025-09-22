import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function TimeToFill() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Avg Time to Fill
            </p>
            <p className="text-3xl font-bold text-blue-600">12</p>
            <p className="text-sm text-muted-foreground">
              days
            </p>
          </div>
          <Clock className="h-8 w-8 text-blue-600" />
        </div>
      </CardContent>
    </Card>
  );
}
