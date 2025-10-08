import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { Department } from "./DepartmentDetail";

interface DepartmentsListProps {
  departments: Department[];
  onSelectDepartment: (department: Department) => void;
}

export function DepartmentsList({ departments, onSelectDepartment }: DepartmentsListProps) {
  const [sortField, setSortField] = useState<keyof Department>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Handle sort click
  const handleSort = (field: keyof Department) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Filter departments based on search query
  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort departments based on sort field and direction
  const sortedDepartments = [...filteredDepartments].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    // Handle string comparisons
    if (typeof fieldA === "string" && typeof fieldB === "string") {
      // Handle percentage strings
      if (fieldA.includes("%") && fieldB.includes("%")) {
        const numA = parseFloat(fieldA);
        const numB = parseFloat(fieldB);
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }
      
      // Handle budget strings
      if (fieldA.includes("$") && fieldB.includes("$")) {
        const numA = parseFloat(fieldA.replace(/[^0-9.]/g, ''));
        const numB = parseFloat(fieldB.replace(/[^0-9.]/g, ''));
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }
      
      // Regular string comparison
      return sortDirection === "asc" 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    }
    
    // Handle number comparisons
    if (typeof fieldA === "number" && typeof fieldB === "number") {
      return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA;
    }
    
    return 0;
  });
  
  // Get total metrics
  const totalHeadcount = departments.reduce((sum, dept) => sum + dept.headcount, 0);
  const avgTurnoverRate = departments.length > 0 ? (departments.reduce((sum, dept) => sum + parseFloat(dept.turnoverRate), 0) / departments.length).toFixed(1) + "%" : "0.0%";
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Active Staff</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{totalHeadcount}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Avg. Turnover Rate</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{avgTurnoverRate}</div>
            <p className="text-xs text-muted-foreground">Company-wide</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search departments..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" /> Filter
          </Button>
        </div>
        <Button size="sm">+ Add Department</Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Department
                {sortField === "name" && (
                  sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("headcount")}
              >
                Active Staff
                {sortField === "headcount" && (
                  sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("turnoverRate")}
              >
                Turnover Rate
                {sortField === "turnoverRate" && (
                  sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />
                )}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">View Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDepartments.map((department) => (
              <TableRow 
                key={department.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectDepartment(department)}
              >
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold">{department.headcount}</span>
                    <span className="text-sm text-muted-foreground">staff</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${
                    parseFloat(department.turnoverRate) > 15 ? 'text-red-600' :
                    parseFloat(department.turnoverRate) > 10 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {department.turnoverRate}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    department.status === "Growing" ? "default" : 
                    department.status === "Stable" ? "outline" : 
                    "destructive"
                  } className={department.status === "Growing" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                    {department.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDepartment(department);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sortedDepartments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No departments found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
