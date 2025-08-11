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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, UserPlus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { FrontendBillingStaff } from "../../integration/supabase/types/billing";
import { StaffForm } from "./StaffForm";
import { useToast } from "@/components/ui/use-toast";

interface StaffListProps {
  staff: FrontendBillingStaff[];
  isLoading: boolean;
  onCreateStaff: (staff: Omit<FrontendBillingStaff, "id">) => Promise<void>;
  onUpdateStaff: (id: string, staff: Partial<Omit<FrontendBillingStaff, "id">>) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function StaffList({ 
  staff, 
  isLoading, 
  onCreateStaff,
  onUpdateStaff,
  onDeleteStaff,
  isCreating = false,
  isUpdating = false,
  isDeleting = false
}: StaffListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<FrontendBillingStaff | undefined>(undefined);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredStaff = staff.filter((staffMember) => {
    return (
      (staffMember.legalName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  const handleOpenForm = (staffMember?: FrontendBillingStaff) => {
    setSelectedStaff(staffMember);
    setIsFormOpen(true);
  };
  
  const handleSubmitForm = async (formData: Omit<FrontendBillingStaff, "id"> | { id: string } & Partial<Omit<FrontendBillingStaff, "id">>) => {
    try {
      if ('id' in formData) {
        // Update existing staff
        const { id, ...data } = formData;
        await onUpdateStaff(id, data);
        toast({
          title: "Staff updated",
          description: "Staff member has been updated successfully.",
        });
      } else {
        // Create new staff
        await onCreateStaff(formData);
        toast({
          title: "Staff created",
          description: "New staff member has been created successfully.",
        });
      }
    } catch (error) {
      console.error("Error submitting staff form:", error);
      toast({
        title: "Error",
        description: "There was an error processing your request.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteStaff = async (id: string) => {
    try {
      setStaffToDelete(id);
      await onDeleteStaff(id);
      toast({
        title: "Staff deleted",
        description: "Staff member has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the staff member.",
        variant: "destructive",
      });
    } finally {
      setStaffToDelete(null);
    }
  };

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
          <Button onClick={() => handleOpenForm()} className="shrink-0" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading staff data...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-4">
            <div className="text-white/60">No staff members found</div>
            <Button onClick={() => handleOpenForm()} className="shrink-0">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First Staff Member
            </Button>
          </div>
        ) : (
          <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow>
                  <TableHead className="text-white/60">Name</TableHead>
                  <TableHead className="text-white/60">Department</TableHead>
                  <TableHead className="text-white/60 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staffMember) => (
                  <TableRow
                    key={staffMember.id}
                    className="hover:bg-white/5"
                  >
                    <TableCell className="font-medium">{staffMember.legalName || "Unknown Staff"}</TableCell>
                    <TableCell>{staffMember.department}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenForm(staffMember)}
                            disabled={isUpdating}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteStaff(staffMember.id)}
                            className="text-red-500 focus:text-red-500"
                            disabled={isDeleting || staffToDelete === staffMember.id}
                          >
                            {staffToDelete === staffMember.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {/* Staff Form for adding/editing */}
      <StaffForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitForm}
        isLoading={isCreating || isUpdating}
        staff={selectedStaff}
      />
    </Card>
  );
}
