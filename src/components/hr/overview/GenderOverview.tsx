import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function GenderOverview() {
  return (
    <Card className="col-span-3 bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Employee gender breakdown</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-8">
            View Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          {/* Pie chart visualization */}
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Male segment - 55% */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="40"
                strokeDasharray="251.2 452.4"
                strokeDashoffset="0"
              />
              {/* Female segment - 45% */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#ec4899"
                strokeWidth="40"
                strokeDasharray="201.1 452.4"
                strokeDashoffset="-251.2"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs">
              <div className="text-center">
                <div className="font-medium">Gender Ratio</div>
                <div className="text-muted-foreground">55% / 45%</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-2 ml-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm">Male (55%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
              <span className="text-sm">Female (45%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
