import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Search, UserPlus } from "lucide-react";
import { FrontendBillingStaff } from "../../integration/supabase/types/billing";

interface StaffListProps {
  staff: FrontendBillingStaff[];
  isLoading: boolean;
  onAddStaff?: () => void;
}

export function StaffList({ staff, isLoading, onAddStaff }: StaffListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStaff = staff.filter((staffMember) => {
    return (
      staffMember.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Card className="border-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" />
            <Input
              type="search"
              placeholder="Search staff..."
              className="pl-8 bg-black/40 border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={onAddStaff} className="shrink-0">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading staff data...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-center">
            <p className="text-white/60 mb-2">No staff members found</p>
            <Button variant="outline" onClick={onAddStaff}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>
        ) : (
          <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow>
                  <TableHead className="text-white/60">Name</TableHead>
                  <TableHead className="text-white/60">Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staffMember) => (
                  <TableRow
                    key={staffMember.id}
                    className="hover:bg-white/5 cursor-pointer"
                  >
                    <TableCell className="font-medium">{staffMember.name}</TableCell>
                    <TableCell>{staffMember.department}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
