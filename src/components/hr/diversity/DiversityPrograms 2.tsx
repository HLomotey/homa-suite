import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function DiversityPrograms() {
  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Diversity Programs</CardTitle>
            <CardDescription>Ongoing initiatives and their impact</CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Women in Leadership</h4>
              <div className="text-sm text-green-500">+12% YoY</div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Program to increase female representation in leadership positions
            </p>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Target: 40%</span>
              <span>Current: 35%</span>
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Inclusive Hiring</h4>
              <div className="text-sm text-green-500">+8% YoY</div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Initiative to reduce bias in hiring processes
            </p>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Target: 100%</span>
              <span>Current: 75%</span>
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Mentorship Program</h4>
              <div className="text-sm text-amber-500">+3% YoY</div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Cross-cultural mentorship for career development
            </p>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Target: 80%</span>
              <span>Current: 60%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
