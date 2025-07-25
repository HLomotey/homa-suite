import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronRight } from "lucide-react";

interface DepartmentEmployeesProps {
  department: {
    id: number;
    name: string;
  };
}

// Mock employee data
const mockEmployees = [
  {
    id: 1,
    name: "Alex Johnson",
    position: "Senior Engineer",
    tenure: "4 years",
    status: "Active"
  },
  {
    id: 2,
    name: "Maria Garcia",
    position: "Team Lead",
    tenure: "5 years",
    status: "Active"
  },
  {
    id: 3,
    name: "David Kim",
    position: "Software Engineer",
    tenure: "2 years",
    status: "Active"
  },
  {
    id: 4,
    name: "Sarah Williams",
    position: "Product Manager",
    tenure: "3 years",
    status: "Active"
  },
  {
    id: 5,
    name: "James Wilson",
    position: "UX Designer",
    tenure: "1 year",
    status: "Active"
  }
];

export function DepartmentEmployees({ department }: DepartmentEmployeesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter employees based on search query
  const filteredEmployees = mockEmployees.filter(employee => 
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
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.tenure}</TableCell>
                <TableCell>
                  <Badge variant="outline">{employee.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No employees found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
