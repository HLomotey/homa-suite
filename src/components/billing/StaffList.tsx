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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, UserPlus, MoreHorizontal, Pencil, Trash2, Loader2, Settings, Eye, EyeOff, Upload } from "lucide-react";
import { FrontendBillingStaff } from "../../integration/supabase/types/billing";
import { StaffForm } from "./StaffForm";

import { useToast } from "@/components/ui/use-toast";
import ColumnCustomizer, { ColumnOption } from "./ColumnCustomizer";

interface StaffListProps {
  staff: FrontendBillingStaff[];
  isLoading: boolean;
  onCreateStaff: (staff: Omit<FrontendBillingStaff, "id">) => Promise<void>;
  onUpdateStaff: (id: string, staff: Partial<Omit<FrontendBillingStaff, "id">>) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
  onBulkCreateStaff?: (staff: Omit<FrontendBillingStaff, "id">[]) => Promise<void>;
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
  onBulkCreateStaff,
  isCreating = false,
  isUpdating = false,
  isDeleting = false
}: StaffListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<FrontendBillingStaff | undefined>(undefined);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [isColumnCustomizerOpen, setIsColumnCustomizerOpen] = useState(false);
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const { toast } = useToast();

  // Define all available columns for the staff table
  const [columns, setColumns] = useState<ColumnOption[]>([
    // Personal Information
    { id: "legalName", label: "Legal Name", visible: true },
    { id: "preferredName", label: "Preferred Name", visible: false },
    { id: "email", label: "Email", visible: true },
    { id: "phoneNumber", label: "Phone Number", visible: false },
    { id: "address", label: "Address", visible: false },
    { id: "maritalStatus", label: "Marital Status", visible: false },
    
    // Emergency Contacts
    { id: "emergencyContactName", label: "Emergency Contact", visible: false },
    { id: "emergencyContactPhone", label: "Emergency Phone", visible: false },
    { id: "emergencyContactRelationship", label: "Emergency Relationship", visible: false },
    
    // Work Information
    { id: "employeeId", label: "Employee ID", visible: true },
    { id: "jobTitle", label: "Job Title", visible: true },
    { id: "department", label: "Department", visible: true },
    { id: "location", label: "Location", visible: false },
    { id: "employmentStatus", label: "Employment Status", visible: true },
    { id: "hireDate", label: "Hire Date", visible: true },
    { id: "terminationDate", label: "Termination Date", visible: false },
    
    // EEO Data
    { id: "gender", label: "Gender", visible: false },
    { id: "ethnicityRace", label: "Ethnicity/Race", visible: false },
    { id: "veteranStatus", label: "Veteran Status", visible: false },
    { id: "disabilityStatus", label: "Disability Status", visible: false },
    
    // Compensation
    { id: "salary", label: "Annual Salary", visible: false },
    { id: "hourlyRate", label: "Hourly Rate", visible: false },
  ]);

  // Get visible columns for table rendering
  const visibleColumns = columns.filter(col => col.visible);

  // Helper function to get cell value for a column
  const getCellValue = (staffMember: FrontendBillingStaff, columnId: string): React.ReactNode => {
    switch (columnId) {
      case "legalName":
        return staffMember.legalName || "Unknown Staff";
      case "preferredName":
        return staffMember.preferredName || "-";
      case "email":
        return staffMember.email || "-";
      case "phoneNumber":
        return staffMember.phoneNumber || "-";
      case "address":
        return staffMember.address ? (
          <span className="truncate max-w-[200px] block" title={staffMember.address}>
            {staffMember.address}
          </span>
        ) : "-";
      case "maritalStatus":
        return staffMember.maritalStatus || "-";
      case "emergencyContactName":
        return staffMember.emergencyContactName || "-";
      case "emergencyContactPhone":
        return staffMember.emergencyContactPhone || "-";
      case "emergencyContactRelationship":
        return staffMember.emergencyContactRelationship || "-";
      case "employeeId":
        return staffMember.employeeId || "-";
      case "jobTitle":
        return staffMember.jobTitle || "-";
      case "department":
        return staffMember.department || "-";
      case "location":
        return staffMember.location || "-";
      case "employmentStatus":
        return (
          <Badge variant={staffMember.employmentStatus === "Full-time" ? "default" : "secondary"}>
            {staffMember.employmentStatus || "-"}
          </Badge>
        );
      case "hireDate":
        return staffMember.hireDate ? new Date(staffMember.hireDate).toLocaleDateString() : "-";
      case "terminationDate":
        return staffMember.terminationDate ? (
          <Badge variant="destructive">
            {new Date(staffMember.terminationDate).toLocaleDateString()}
          </Badge>
        ) : "-";
      case "gender":
        return staffMember.gender || "-";
      case "ethnicityRace":
        return staffMember.ethnicityRace || "-";
      case "veteranStatus":
        return staffMember.veteranStatus || "-";
      case "disabilityStatus":
        return staffMember.disabilityStatus || "-";
      case "salary":
        return staffMember.salary ? `$${staffMember.salary.toLocaleString()}` : "-";
      case "hourlyRate":
        return staffMember.hourlyRate ? `$${staffMember.hourlyRate}/hr` : "-";
      default:
        return "-";
    }
  };

  // Enhanced search functionality to search across multiple fields
  const filteredStaff = staff.filter((staffMember) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      (staffMember.legalName || "").toLowerCase().includes(searchTerm) ||
      (staffMember.preferredName || "").toLowerCase().includes(searchTerm) ||
      (staffMember.email || "").toLowerCase().includes(searchTerm) ||
      (staffMember.employeeId || "").toLowerCase().includes(searchTerm) ||
      (staffMember.jobTitle || "").toLowerCase().includes(searchTerm) ||
      (staffMember.department || "").toLowerCase().includes(searchTerm) ||
      (staffMember.location || "").toLowerCase().includes(searchTerm)
    );
  });

  // Handle column customizer changes
  const handleColumnChange = (updatedColumns: ColumnOption[]) => {
    setColumns(updatedColumns);
    setIsColumnCustomizerOpen(false);
  };
  
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
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsColumnCustomizerOpen(true)} 
              variant="outline" 
              className="shrink-0"
            >
              <Settings className="h-4 w-4 mr-2" />
              Columns
            </Button>
            {onBulkCreateStaff && (
              <Button 
                onClick={() => setIsExcelUploadOpen(true)} 
                variant="outline" 
                className="shrink-0"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Excel
              </Button>
            )}
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/40">
                  <TableRow>
                    {visibleColumns.map((column) => (
                      <TableHead key={column.id} className="text-white/60 whitespace-nowrap">
                        {column.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-white/60 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staffMember) => (
                    <TableRow
                      key={staffMember.id}
                      className="hover:bg-white/5"
                    >
                      {visibleColumns.map((column) => (
                        <TableCell key={column.id} className="whitespace-nowrap">
                          {getCellValue(staffMember, column.id)}
                        </TableCell>
                      ))}
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

      {/* Column Customizer Sheet */}
      <Sheet open={isColumnCustomizerOpen} onOpenChange={setIsColumnCustomizerOpen}>
        <SheetContent className="max-w-[600px] sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>Customize Staff Table Columns</SheetTitle>
            <SheetDescription>
              Select which columns to display in the staff table. You can show or hide columns based on your needs.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <ColumnCustomizer
              columns={columns}
              onChange={handleColumnChange}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Excel Upload Sheet */}
      {onBulkCreateStaff && (
        <Sheet open={isExcelUploadOpen} onOpenChange={setIsExcelUploadOpen}>
          <SheetContent className="max-w-[1200px] sm:max-w-[1200px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Upload Staff Data from Excel</SheetTitle>
              <SheetDescription>
                Upload an Excel file containing staff information to add multiple staff members at once.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Staff Excel Upload</h3>
                <p className="text-muted-foreground mb-4">
                  Staff Excel uploads have been moved to the central Excel uploads page for better organization.
                </p>
                <Button 
                  onClick={() => {
                    setIsExcelUploadOpen(false);
                    window.location.href = '/excel-uploads';
                  }}
                  className="w-full"
                >
                  Go to Excel Uploads Page
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </Card>
  );
}
