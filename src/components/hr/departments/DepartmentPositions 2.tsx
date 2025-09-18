import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight } from "lucide-react";

interface DepartmentPositionsProps {
  department: {
    id: number;
    name: string;
    openPositions: number;
  };
}

// Mock open positions data
const mockPositions = [
  {
    id: 1,
    title: "Senior Software Engineer",
    level: "Senior",
    postedDate: "2025-07-01",
    applications: 28
  },
  {
    id: 2,
    title: "Product Manager",
    level: "Mid",
    postedDate: "2025-07-05",
    applications: 42
  },
  {
    id: 3,
    title: "UX Designer",
    level: "Junior",
    postedDate: "2025-07-10",
    applications: 35
  },
  {
    id: 4,
    title: "DevOps Engineer",
    level: "Senior",
    postedDate: "2025-07-15",
    applications: 19
  }
];

export function DepartmentPositions({ department }: DepartmentPositionsProps) {
  // Get positions based on department
  const positions = mockPositions.slice(0, department.openPositions);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Open Positions ({department.openPositions})</h3>
        <Button size="sm">+ Add Position</Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Posted Date</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((position) => (
              <TableRow key={position.id}>
                <TableCell className="font-medium">{position.title}</TableCell>
                <TableCell>{position.level}</TableCell>
                <TableCell>{position.postedDate}</TableCell>
                <TableCell>{position.applications}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {positions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No open positions in this department.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
