import React, { useState, useEffect, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  FileSpreadsheet,
  Download,
  Home,
  Zap,
  Calendar,
} from "lucide-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Import types and hooks
import { FrontendUtilitySetup, FrontendBillingPeriod, FrontendUtilityType } from "@/integration/supabase/types/utility";
import { FrontendProperty } from "@/integration/supabase/types/property";
// Use the new utility bills hooks implementation
import { useUtilityBills, useCreateUtilityBill, useUpdateUtilityBill, useDeleteUtilityBill } from "@/hooks/utility/useUtilityBills";
import { useBillingPeriods } from "@/hooks/utility/useBillingPeriod";
import { useProperties } from "@/hooks/property";
import { useUtilityTypes } from "@/hooks/utility";

// Bill Form Data interface
interface BillFormData {
  propertyId: string;
  utilityTypeId: string;
  billingPeriodId: string;
  billingDate: string;
  billingAmount: number;
  notes: string;
}

// Default form data
const defaultFormData: BillFormData = {
  propertyId: "",
  utilityTypeId: "",
  billingPeriodId: "",
  billingDate: format(new Date(), "yyyy-MM-dd"),
  billingAmount: 0,
  notes: "",
};

// Utility Payments List Component Props
interface UtilityPaymentsListProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Utility Payments List Component
export function UtilityPaymentsList({ isDialogOpen, setIsDialogOpen }: UtilityPaymentsListProps) {
  // Use real API calls with error handling
  const { data: utilityBills, isLoading: billsLoading, error: billsError } = useUtilityBills();
  const { properties, loading: propertiesLoading, error: propertiesError } = useProperties();
  const { data: utilityTypes, isLoading: typesLoading, error: typesError } = useUtilityTypes();
  const { data: billingPeriods, isLoading: periodsLoading, error: periodsError } = useBillingPeriods();
  
  // Combine loading states and errors
  const isDataLoading = billsLoading || propertiesLoading || typesLoading || periodsLoading;
  const apiError = billsError || propertiesError || typesError || periodsError || null;
  
  // Use real mutation hooks
  const createBill = useCreateUtilityBill();
  const updateBill = useUpdateUtilityBill();
  const deleteBill = useDeleteUtilityBill();
  
  // Show error toast if any API call fails
  useEffect(() => {
    if (apiError) {
      toast.error(`Error loading data: ${apiError.message || 'Unknown error'}`);
    }
  }, [apiError]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  
  // Use the props for dialog state instead of local state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<FrontendUtilitySetup | null>(null);
  const [formData, setFormData] = useState<BillFormData>(defaultFormData);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "billingAmount" ? parseFloat(value) : value
    }));
  };
  
  // Handle opening edit dialog
  const handleEditDialogOpen = (bill: FrontendUtilitySetup) => {
    setSelectedBill(bill);
    setFormData({
      propertyId: bill.propertyId,
      utilityTypeId: bill.utilityTypeId,
      billingPeriodId: bill.billingPeriodId || "",
      billingDate: bill.billingDate || format(new Date(), "yyyy-MM-dd"),
      billingAmount: bill.billingAmount || 0,
      notes: bill.notes || ""
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle opening delete dialog
  const handleDeleteDialogOpen = (bill: FrontendUtilitySetup) => {
    setSelectedBill(bill);
    setIsDeleteDialogOpen(true);
  };

  // Filter bills based on search query and status filter
  const filteredBills = useMemo(() => {
    if (!utilityBills) return [];
    
    return utilityBills.filter(bill => {
      const matchesSearch = searchQuery === "" || (
        properties?.find(p => p.id === bill.propertyId)?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        utilityTypes?.find(t => t.id === bill.utilityTypeId)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.billingAmount?.toString().includes(searchQuery.toLowerCase()) ||
        bill.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const matchesStatus = statusFilter === "all" || (
        statusFilter === "paid" && bill.notes?.includes("PAID") ||
        statusFilter === "unpaid" && !bill.notes?.includes("PAID")
      );
      
      return matchesSearch && matchesStatus;
    });
  }, [utilityBills, properties, utilityTypes, searchQuery, statusFilter]);

  // Handle form submission for creating a new bill
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.propertyId || !formData.utilityTypeId || !formData.billingPeriodId || !formData.billingDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Create new bill
    createBill.mutate({
      ...formData,
      isActive: true,
      meterNumber: null,
      accountNumber: null,
      providerName: null,
      providerContact: null
    }, {
      onSuccess: () => {
        // Reset form and close dialog
        setFormData({
          propertyId: "",
          utilityTypeId: "",
          billingPeriodId: "",
          billingDate: "",
          billingAmount: 0,
          notes: "",
        });
        setIsDialogOpen(false);
        toast.success("Bill added successfully");
      },
      onError: (error: Error) => {
        toast.error(`Error adding bill: ${error.message}`);
      }
    });
  };
  
  // Handle form submission for editing an existing bill
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.propertyId || !formData.utilityTypeId || !formData.billingPeriodId || !formData.billingDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (selectedBill) {
      // Update existing bill
      updateBill.mutate({
        id: selectedBill.id,
        billData: {
          propertyId: formData.propertyId,
          utilityTypeId: formData.utilityTypeId,
          billingPeriodId: formData.billingPeriodId,
          billingDate: formData.billingDate,
          billingAmount: formData.billingAmount,
          notes: formData.notes,
          isActive: true,
          meterNumber: selectedBill.meterNumber,
          accountNumber: selectedBill.accountNumber,
          providerName: selectedBill.providerName,
          providerContact: selectedBill.providerContact
        }
      }, {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          toast.success("Bill updated successfully");
        },
        onError: (error: Error) => {
          toast.error(`Error updating bill: ${error.message}`);
        }
      });
    }
  };

  const handleDelete = () => {
    if (!selectedBill) {
      toast.error("No bill selected for deletion");
      return;
    }
    
    deleteBill.mutate(selectedBill.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        toast.success("Utility bill deleted successfully");
      },
      onError: (error: Error) => {
        toast.error(`Error deleting bill: ${error.message}`);
      }
    });
  };

  // Function to export bills to Excel
  const exportToExcel = () => {
    try {
      setIsExporting(true);
      
      // Prepare data for export
      const exportData = filteredBills.map(bill => {
        const propertyName = properties?.find(p => p.id === bill.propertyId)?.title || "";
        const utilityTypeName = utilityTypes?.find(ut => ut.id === bill.utilityTypeId)?.name || "";
        const billingPeriodName = billingPeriods?.find(bp => bp.id === bill.billingPeriodId)?.name || "";
        
        return {
          'Property': propertyName,
          'Utility Type': utilityTypeName,
          'Billing Period': billingPeriodName,
          'Billing Date': bill.billingDate ? format(new Date(bill.billingDate), "MMM dd, yyyy") : "",
          'Amount': `$${bill.billingAmount?.toLocaleString() || 0}`,
          'Status': bill.notes?.startsWith("PAID:") ? "Paid" : "Unpaid",
          'Notes': bill.notes || ""
        };
      });
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Utility Bills');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Save file
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, `utility_bills_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setIsExporting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  if (isDataLoading) {
    return <div className="flex justify-center p-4">Loading utility bills...</div>;
  }

  if (apiError) {
    return <div className="flex justify-center p-4 text-red-500">Error loading utility bills</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Utility Payments
          </h2>
          <p className="text-white/60">Manage your utility bills</p>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={exportToExcel} variant="outline" disabled={isExporting || isDataLoading} className="mr-2">
            {isExporting || isDataLoading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to Excel
              </>
            )}
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bill
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="bg-background border border-input rounded-md px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter bills by status"
            title="Filter bills by status"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.length > 0 ? (
              filteredBills.map((bill) => {
                const propertyName = properties?.find(p => p.id === bill.propertyId)?.title || "Unknown Property";
                const utilityTypeName = utilityTypes?.find(ut => ut.id === bill.utilityTypeId)?.name || "Unknown Type";
                const billingPeriodName = billingPeriods?.find(bp => bp.id === bill.billingPeriodId)?.name || "Unknown Period";
                const isPaid = bill.notes?.startsWith("PAID:");
                
                return (
                  <TableRow key={bill.id} className="hover:bg-black/20">
                    <TableCell className="font-medium">{propertyName}</TableCell>
                    <TableCell>{utilityTypeName}</TableCell>
                    <TableCell>{billingPeriodName}</TableCell>
                    <TableCell>{formatDate(bill.billingDate)}</TableCell>
                    <TableCell>${bill.billingAmount?.toLocaleString() || 0}</TableCell>
                    <TableCell>
                      <StatusBadge status={isPaid ? "paid" : "unpaid"} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditDialogOpen(bill)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDialogOpen(bill)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No utility bills found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Utility Bill</DialogTitle>
            <DialogDescription>
              Create a new utility bill for a property
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="propertyId" className="text-right">
                  Property
                </Label>
                <select
                  id="propertyId"
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleInputChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  aria-label="Select Property"
                  title="Select Property"
                >
                  <option value="">Select a property</option>
                  {properties?.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="utilityTypeId" className="text-right">
                  Utility Type
                </Label>
                <select
                  id="utilityTypeId"
                  name="utilityTypeId"
                  value={formData.utilityTypeId}
                  onChange={handleInputChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  aria-label="Select Utility Type"
                  title="Select Utility Type"
                >
                  <option value="">Select a utility type</option>
                  {utilityTypes?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="billingPeriodId" className="text-right">
                  Billing Period
                </Label>
                <select
                  id="billingPeriodId"
                  name="billingPeriodId"
                  value={formData.billingPeriodId}
                  onChange={handleInputChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  aria-label="Select Billing Period"
                  title="Select Billing Period"
                >
                  <option value="">Select a billing period</option>
                  {billingPeriods?.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="billingDate" className="text-right">
                  Billing Date
                </Label>
                <Input
                  id="billingDate"
                  name="billingDate"
                  type="date"
                  value={formData.billingDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="billingAmount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="billingAmount"
                  name="billingAmount"
                  type="number"
                  step="0.01"
                  value={formData.billingAmount}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createBill.isPending}>
                {createBill.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Utility Bill</DialogTitle>
            <DialogDescription>
              Update the utility bill details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-propertyId" className="text-right">
                  Property
                </Label>
                <select
                  id="edit-propertyId"
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleInputChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  aria-label="Select Property"
                  title="Select Property"
                >
                  <option value="">Select a property</option>
                  {properties?.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-utilityTypeId" className="text-right">
                  Utility Type
                </Label>
                <select
                  id="edit-utilityTypeId"
                  name="utilityTypeId"
                  value={formData.utilityTypeId}
                  onChange={handleInputChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  aria-label="Select Utility Type"
                  title="Select Utility Type"
                >
                  <option value="">Select a utility type</option>
                  {utilityTypes?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-billingPeriodId" className="text-right">
                  Billing Period
                </Label>
                <select
                  id="edit-billingPeriodId"
                  name="billingPeriodId"
                  value={formData.billingPeriodId}
                  onChange={handleInputChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  aria-label="Select Billing Period"
                  title="Select Billing Period"
                >
                  <option value="">Select a billing period</option>
                  {billingPeriods?.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-billingDate" className="text-right">
                  Billing Date
                </Label>
                <Input
                  id="edit-billingDate"
                  name="billingDate"
                  type="date"
                  value={formData.billingDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-billingAmount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="edit-billingAmount"
                  name="billingAmount"
                  type="number"
                  step="0.01"
                  value={formData.billingAmount}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="edit-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateBill.isPending}>
                {updateBill.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Utility Bill</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this utility bill? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedBill && (
              <p>
                You are about to delete the utility bill for{" "}
                <strong>
                  {properties?.find(p => p.id === selectedBill.propertyId)?.title || "Unknown Property"}
                </strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteBill.isPending}
            >
              {deleteBill.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "unpaid":
        return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "overdue":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border`} variant="outline">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default UtilityPaymentsList;
