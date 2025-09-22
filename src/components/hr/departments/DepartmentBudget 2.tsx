import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface DepartmentBudgetProps {
  department: {
    id: number;
    name: string;
    budget: string;
    headcount: number;
  };
}

export function DepartmentBudget({ department }: DepartmentBudgetProps) {
  // Calculate budget metrics
  const budgetValue = parseInt(department.budget.replace(/[^0-9.]/g, '')) * 1000000;
  const perEmployeeBudget = Math.round(budgetValue / department.headcount);
  const salaryAllocation = Math.round(budgetValue * 0.75);
  const trainingAllocation = Math.round(budgetValue * 0.08);
  const benefitsAllocation = Math.round(budgetValue * 0.12);
  const otherAllocation = Math.round(budgetValue * 0.05);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{department.budget}</div>
            <p className="text-xs text-green-500">+8% from last year</p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Per Employee</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">${(perEmployeeBudget).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Annual allocation</p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Spent YTD</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">58%</div>
            <p className="text-xs text-muted-foreground">On track</p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">${Math.round(budgetValue * 0.42).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">For this fiscal year</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle className="text-sm">Budget Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {/* Donut chart visualization */}
              <div className="flex items-center justify-center h-full">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Segment 1 - 75% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="20"
                      strokeDasharray="471 628"
                      strokeDashoffset="0"
                    />
                    {/* Segment 2 - 12% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray="75.36 628"
                      strokeDashoffset="-471"
                    />
                    {/* Segment 3 - 8% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="20"
                      strokeDasharray="50.24 628"
                      strokeDashoffset="-546.36"
                    />
                    {/* Segment 4 - 5% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#8b5cf6"
                      strokeWidth="20"
                      strokeDasharray="31.4 628"
                      strokeDashoffset="-596.6"
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
                    <span className="text-xs">Salaries (75%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs">Benefits (12%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-xs">Training (8%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-xs">Other (5%)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle className="text-sm">Budget Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              {/* Line chart visualization */}
              <div className="w-full h-full bg-background border-border rounded-md flex flex-col">
                <div className="flex-1 flex items-end px-4 pt-6 pb-2 relative">
                  {/* X-axis quarters */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
                    <span>Q1</span>
                    <span>Q2</span>
                    <span>Q3</span>
                    <span>Q4</span>
                  </div>
                  
                  {/* Line chart path - simplified representation */}
                  <svg className="w-full h-full" style={{ paddingLeft: '30px', paddingBottom: '20px' }}>
                    <path 
                      d="M 0,150 L 75,120 L 150,140 L 225,80" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="2"
                    />
                    <circle cx="0" cy="150" r="3" fill="#3b82f6" />
                    <circle cx="75" cy="120" r="3" fill="#3b82f6" />
                    <circle cx="150" cy="140" r="3" fill="#3b82f6" />
                    <circle cx="225" cy="80" r="3" fill="#3b82f6" />
                    
                    {/* Previous year comparison line */}
                    <path 
                      d="M 0,170 L 75,160 L 150,130 L 225,100" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2"
                      strokeDasharray="4"
                    />
                    <circle cx="0" cy="170" r="3" fill="#10b981" />
                    <circle cx="75" cy="160" r="3" fill="#10b981" />
                    <circle cx="150" cy="130" r="3" fill="#10b981" />
                    <circle cx="225" cy="100" r="3" fill="#10b981" />
                  </svg>
                </div>
                <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span>Current Year</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span>Previous Year</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-background border-border">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-sm">Budget Breakdown</CardTitle>
          <Button variant="outline" size="sm">Export</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Allocation</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>% Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Salaries</TableCell>
                <TableCell>${salaryAllocation.toLocaleString()}</TableCell>
                <TableCell>${Math.round(salaryAllocation * 0.6).toLocaleString()}</TableCell>
                <TableCell>${Math.round(salaryAllocation * 0.4).toLocaleString()}</TableCell>
                <TableCell>60%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Benefits</TableCell>
                <TableCell>${benefitsAllocation.toLocaleString()}</TableCell>
                <TableCell>${Math.round(benefitsAllocation * 0.55).toLocaleString()}</TableCell>
                <TableCell>${Math.round(benefitsAllocation * 0.45).toLocaleString()}</TableCell>
                <TableCell>55%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Training</TableCell>
                <TableCell>${trainingAllocation.toLocaleString()}</TableCell>
                <TableCell>${Math.round(trainingAllocation * 0.45).toLocaleString()}</TableCell>
                <TableCell>${Math.round(trainingAllocation * 0.55).toLocaleString()}</TableCell>
                <TableCell>45%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Other</TableCell>
                <TableCell>${otherAllocation.toLocaleString()}</TableCell>
                <TableCell>${Math.round(otherAllocation * 0.7).toLocaleString()}</TableCell>
                <TableCell>${Math.round(otherAllocation * 0.3).toLocaleString()}</TableCell>
                <TableCell>70%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
