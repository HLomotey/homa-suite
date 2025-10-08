import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronRight } from "lucide-react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";

interface DepartmentEmployeesProps {
  department: {
    id: number;
    name: string;
  };
}

export function DepartmentEmployees({ department }: DepartmentEmployeesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { externalStaff, statsLoading } = useExternalStaff();
  
  // Filter staff by department and calculate tenure
  const departmentEmployees = useMemo(() => {
    return externalStaff
      .filter(staff => staff["HOME DEPARTMENT"] === department.name)
      .map(staff => {
        // Calculate tenure
        let tenure = "N/A";
        if (staff["HIRE DATE"]) {
          const hireDate = new Date(staff["HIRE DATE"]);
          const endDate = staff["TERMINATION DATE"] ? new Date(staff["TERMINATION DATE"]) : new Date();
          const tenureMs = endDate.getTime() - hireDate.getTime();
          const tenureYears = Math.floor(tenureMs / (1000 * 60 * 60 * 24 * 365.25));
          const tenureMonths = Math.floor((tenureMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
          
          if (tenureYears > 0) {
            tenure = `${tenureYears} year${tenureYears > 1 ? 's' : ''}`;
          } else if (tenureMonths > 0) {
            tenure = `${tenureMonths} month${tenureMonths > 1 ? 's' : ''}`;
          } else {
            tenure = "< 1 month";
          }
        }

        return {
          id: staff.id,
          name: `${staff["PAYROLL FIRST NAME"] || ""} ${staff["PAYROLL LAST NAME"] || ""}`.trim() || "Unknown",
          position: staff["JOB TITLE"] || "Unassigned",
          tenure,
          status: staff["TERMINATION DATE"] ? "Terminated" : "Active"
        };
      });
  }, [externalStaff, department.name]);
  
  // Filter employees based on search query
  const filteredEmployees = departmentEmployees.filter(employee => 
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    employee.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search employees..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-1" /> Filter
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Tenure</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statsLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Loading employees...
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.tenure}</TableCell>
                    <TableCell>
                      <Badge variant={employee.status === "Active" ? "outline" : "destructive"}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEmployees.length === 0 && !statsLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No employees found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
