import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DiversityGoals() {
  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Diversity Goals & Metrics</CardTitle>
            <CardDescription>Track progress against company diversity targets</CardDescription>
          </div>
          <Button>Set New Goals</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Gender Balance</h4>
              <span className="text-sm font-medium">45% / 50%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Target: 50% female representation by 2025
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Leadership Diversity</h4>
              <span className="text-sm font-medium">32% / 40%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Target: 40% diverse leadership by 2025
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Pay Equity</h4>
              <span className="text-sm font-medium">96% / 100%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Target: 100% pay equity across all demographics
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
