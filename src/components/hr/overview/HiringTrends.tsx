import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function HiringTrends() {
  return (
    <Card className="col-span-4 bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Hiring Trends</CardTitle>
            <CardDescription>Monthly hires and time to hire</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-8">
            View Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {/* Bar chart visualization */}
          <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
            <div className="flex-1 flex items-end px-4 pt-6 pb-2 space-x-6 justify-around">
              {/* Jan */}
              <div className="flex flex-col items-center space-x-1">
                <div className="flex items-end space-x-1">
                  <div className="bg-amber-500 w-8 rounded-t-md" style={{ height: '120px' }}></div>
                  <div className="bg-purple-500 w-8 rounded-t-md" style={{ height: '180px' }}></div>
                </div>
                <span className="text-xs mt-1">Jan</span>
              </div>
              
              {/* Feb */}
              <div className="flex flex-col items-center space-x-1">
                <div className="flex items-end space-x-1">
                  <div className="bg-amber-500 w-8 rounded-t-md" style={{ height: '100px' }}></div>
                  <div className="bg-purple-500 w-8 rounded-t-md" style={{ height: '150px' }}></div>
                </div>
                <span className="text-xs mt-1">Feb</span>
              </div>
              
              {/* Mar */}
              <div className="flex flex-col items-center space-x-1">
                <div className="flex items-end space-x-1">
                  <div className="bg-amber-500 w-8 rounded-t-md" style={{ height: '150px' }}></div>
                  <div className="bg-purple-500 w-8 rounded-t-md" style={{ height: '200px' }}></div>
                </div>
                <span className="text-xs mt-1">Mar</span>
              </div>
              
              {/* Apr */}
              <div className="flex flex-col items-center space-x-1">
                <div className="flex items-end space-x-1">
                  <div className="bg-amber-500 w-8 rounded-t-md" style={{ height: '130px' }}></div>
                  <div className="bg-purple-500 w-8 rounded-t-md" style={{ height: '170px' }}></div>
                </div>
                <span className="text-xs mt-1">Apr</span>
              </div>
              
              {/* May */}
              <div className="flex flex-col items-center space-x-1">
                <div className="flex items-end space-x-1">
                  <div className="bg-amber-500 w-8 rounded-t-md" style={{ height: '180px' }}></div>
                  <div className="bg-purple-500 w-8 rounded-t-md" style={{ height: '220px' }}></div>
                </div>
                <span className="text-xs mt-1">May</span>
              </div>
              
              {/* Jun */}
              <div className="flex flex-col items-center space-x-1">
                <div className="flex items-end space-x-1">
                  <div className="bg-amber-500 w-8 rounded-t-md" style={{ height: '160px' }}></div>
                  <div className="bg-purple-500 w-8 rounded-t-md" style={{ height: '190px' }}></div>
                </div>
                <span className="text-xs mt-1">Jun</span>
              </div>
            </div>
            <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                <span>Time to Hire</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                <span>New Hires</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
