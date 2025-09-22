import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DepartmentOverviewProps {
  department: {
    id: number;
    name: string;
    headcount: number;
    manager: string;
    openPositions: number;
    turnoverRate: string;
    avgTenure: string;
    budget: string;
    status: string;
  };
}

export function DepartmentOverview({ department }: DepartmentOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle className="text-sm">Department Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Headcount Growth Chart</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle className="text-sm">Turnover Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Turnover Trend Chart</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle className="text-sm">Department Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
            <p className="text-muted-foreground">Org Chart Visualization</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
