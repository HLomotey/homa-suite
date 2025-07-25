import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";

// Import tab components
import { DepartmentOverview } from "./DepartmentOverview";
import { DepartmentEmployees } from "./DepartmentEmployees";
import { DepartmentPositions } from "./DepartmentPositions";
import { DepartmentBudget } from "./DepartmentBudget";

export interface Department {
  id: number;
  name: string;
  headcount: number;
  manager: string;
  openPositions: number;
  turnoverRate: string;
  avgTenure: string;
  budget: string;
  status: string;
}

interface DepartmentDetailProps {
  department: Department;
  onClose: () => void;
}

export function DepartmentDetail({ department, onClose }: DepartmentDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={onClose} className="mb-2">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Departments
            </Button>
            <CardTitle className="text-xl">{department.name} Department</CardTitle>
            <CardDescription>Detailed department metrics and personnel</CardDescription>
          </div>
          <Badge variant={
            department.status === "Growing" ? "success" : 
            department.status === "Stable" ? "default" : 
            "destructive"
          }>
            {department.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-background border-border">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Headcount</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="text-2xl font-bold">{department.headcount}</div>
            </CardContent>
          </Card>
          <Card className="bg-background border-border">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="text-2xl font-bold">{department.openPositions}</div>
            </CardContent>
          </Card>
          <Card className="bg-background border-border">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="text-2xl font-bold">{department.turnoverRate}</div>
            </CardContent>
          </Card>
          <Card className="bg-background border-border">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Avg. Tenure</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="text-2xl font-bold">{department.avgTenure}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex border-b border-border">
          <Button 
            variant={activeTab === "overview" ? "default" : "ghost"} 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            data-state={activeTab === "overview" ? "active" : "inactive"}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </Button>
          <Button 
            variant={activeTab === "employees" ? "default" : "ghost"} 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            data-state={activeTab === "employees" ? "active" : "inactive"}
            onClick={() => setActiveTab("employees")}
          >
            Employees
          </Button>
          <Button 
            variant={activeTab === "positions" ? "default" : "ghost"} 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            data-state={activeTab === "positions" ? "active" : "inactive"}
            onClick={() => setActiveTab("positions")}
          >
            Open Positions
          </Button>
          <Button 
            variant={activeTab === "budget" ? "default" : "ghost"} 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            data-state={activeTab === "budget" ? "active" : "inactive"}
            onClick={() => setActiveTab("budget")}
          >
            Budget
          </Button>
        </div>
        
        {activeTab === "overview" && <DepartmentOverview department={department} />}
        {activeTab === "employees" && <DepartmentEmployees department={department} />}
        {activeTab === "positions" && <DepartmentPositions department={department} />}
        {activeTab === "budget" && <DepartmentBudget department={department} />}
      </CardContent>
    </Card>
  );
}
