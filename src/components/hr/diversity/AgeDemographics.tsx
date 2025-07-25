import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function AgeDemographics() {
  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Age Demographics</CardTitle>
          <Button variant="ghost" size="sm">
            Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          {/* Bar chart visualization */}
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 flex items-end px-4 pt-6 pb-2 space-x-6 justify-around">
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-10 rounded-t-md" style={{ height: '40px' }}></div>
                <span className="text-xs mt-1">18-24</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-10 rounded-t-md" style={{ height: '120px' }}></div>
                <span className="text-xs mt-1">25-34</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-10 rounded-t-md" style={{ height: '90px' }}></div>
                <span className="text-xs mt-1">35-44</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-10 rounded-t-md" style={{ height: '60px' }}></div>
                <span className="text-xs mt-1">45-54</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-10 rounded-t-md" style={{ height: '30px' }}></div>
                <span className="text-xs mt-1">55+</span>
              </div>
            </div>
            <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
              <div className="flex-1">Age Groups</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
