import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";

export function HeadcountByDepartment() {
  const [timeRange, setTimeRange] = useState("6m");
  
  return (
    <Card className="col-span-4 bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Headcount by Department</CardTitle>
            <CardDescription>Employee distribution across departments</CardDescription>
          </div>
          <Tabs 
            value={timeRange} 
            onValueChange={setTimeRange} 
            className="w-[200px]"
          >
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="3m">3M</TabsTrigger>
              <TabsTrigger value="6m">6M</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {/* Bar chart visualization */}
          <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
            <div className="flex-1 flex items-end px-4 pt-6 pb-2 space-x-6">
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '250px' }}></div>
                <span className="text-xs mt-1">Engineering</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '150px' }}></div>
                <span className="text-xs mt-1">Sales</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '80px' }}></div>
                <span className="text-xs mt-1">Marketing</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '50px' }}></div>
                <span className="text-xs mt-1">HR</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '70px' }}></div>
                <span className="text-xs mt-1">Finance</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '180px' }}></div>
                <span className="text-xs mt-1">Operations</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-12 rounded-t-md" style={{ height: '120px' }}></div>
                <span className="text-xs mt-1">Support</span>
              </div>
            </div>
            <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
              <div className="flex-1">Departments</div>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                View Details <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
