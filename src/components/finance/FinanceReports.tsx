import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FinanceReports() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Financial Reports</h2>
      <p className="text-sm text-muted-foreground">Access and generate financial reports</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Income Statement</CardTitle>
            <CardDescription>Monthly and quarterly income statements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View detailed income statements showing revenue, expenses, and profit margins.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Balance Sheet</CardTitle>
            <CardDescription>Current assets, liabilities, and equity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View the company's financial position with detailed balance sheets.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle>Cash Flow Statement</CardTitle>
            <CardDescription>Cash movement analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track cash inflows and outflows across operations, investing, and financing.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
