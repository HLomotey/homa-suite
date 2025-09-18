import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function FinanceBudgeting() {
  const budgetItems = [
    {
      department: "Marketing",
      allocated: 250000,
      spent: 175000,
      remaining: 75000,
      status: "on-track"
    },
    {
      department: "Operations",
      allocated: 500000,
      spent: 425000,
      remaining: 75000,
      status: "warning"
    },
    {
      department: "Research & Development",
      allocated: 350000,
      spent: 200000,
      remaining: 150000,
      status: "on-track"
    },
    {
      department: "Human Resources",
      allocated: 180000,
      spent: 160000,
      remaining: 20000,
      status: "critical"
    },
    {
      department: "IT Infrastructure",
      allocated: 220000,
      spent: 120000,
      remaining: 100000,
      status: "on-track"
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Budget Management</h2>
      <p className="text-sm text-muted-foreground">Track and manage departmental budgets</p>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Department Budgets</CardTitle>
          <CardDescription>Current fiscal year budget tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {budgetItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{item.department}</span>
                    <div className="text-xs text-muted-foreground">
                      ${item.spent.toLocaleString()} of ${item.allocated.toLocaleString()}
                    </div>
                  </div>
                  <Badge 
                    variant={
                      item.status === "on-track" ? "outline" : 
                      item.status === "warning" ? "secondary" : 
                      "destructive"
                    }
                  >
                    {item.status === "on-track" ? "On Track" : 
                     item.status === "warning" ? "Warning" : "Critical"}
                  </Badge>
                </div>
                <Progress 
                  value={(item.spent / item.allocated) * 100} 
                  className={
                    item.status === "on-track" ? "bg-green-100" : 
                    item.status === "warning" ? "bg-yellow-100" : 
                    "bg-red-100"
                  }
                />
                <div className="text-xs text-right text-muted-foreground">
                  Remaining: ${item.remaining.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
