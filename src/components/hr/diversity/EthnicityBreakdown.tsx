import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function EthnicityBreakdown() {
  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Ethnicity Breakdown</CardTitle>
          <Button variant="ghost" size="sm">
            Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          {/* Donut chart visualization */}
          <div className="flex items-center justify-center h-full">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Segment 1 - 40% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="20"
                  strokeDasharray="251.2 452.4"
                  strokeDashoffset="0"
                />
                {/* Segment 2 - 25% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray="157.1 452.4"
                  strokeDashoffset="-251.2"
                />
                {/* Segment 3 - 20% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="20"
                  strokeDasharray="125.6 452.4"
                  strokeDashoffset="-408.3"
                />
                {/* Segment 4 - 15% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#8b5cf6"
                  strokeWidth="20"
                  strokeDasharray="94.2 452.4"
                  strokeDashoffset="-533.9"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="var(--background)"
                />
              </svg>
            </div>
            <div className="flex flex-col space-y-2 ml-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-xs">White (40%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs">Asian (25%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                <span className="text-xs">Hispanic (20%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-xs">Other (15%)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
