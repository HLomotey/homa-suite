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
import { downloadExcelFile } from '@/utils/excelJSHelper';
import { saveAs } from 'file-saver';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { SlideInFormWithActions } from "@/components/utilities";
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

// Utility Type Selection interface
interface UtilityTypeSelection {
  utilityTypeId: string;
  selected: boolean;
  amount: number;
}

// Bill Form Data interface for multiple utility types
interface MultiBillFormData {
  propertyId: string;
  billingPeriodId: string;
  billingDate: string;
  notes: string;
  utilityTypes: UtilityTypeSelection[];
}

// Default form data
const defaultMultiFormData: MultiBillFormData = {
  propertyId: "",
  billingPeriodId: "",
  billingDate: format(new Date(), "yyyy-MM-dd"),
  notes: "",
  utilityTypes: [],
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
  const [formData, setFormData] = useState<MultiBillFormData>(defaultMultiFormData);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle property selection and initialize utility types
  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propertyId = e.target.value;
    
    // Initialize utility types when property is selected (only active ones)
    const activeUtilityTypes = utilityTypes?.filter(type => type.isActive) || [];
    const initialUtilityTypes = activeUtilityTypes.map(type => ({
      utilityTypeId: type.id,
      selected: false,
      amount: 0
    }));
    
    setFormData(prev => ({
      ...prev,
      propertyId,
      utilityTypes: initialUtilityTypes
    }));
  };

  // Handle utility type checkbox changes
  const handleUtilityTypeChange = (utilityTypeId: string, field: 'selected' | 'amount', value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      utilityTypes: prev.utilityTypes.map(ut => 
        ut.utilityTypeId === utilityTypeId 
          ? { ...ut, [field]: value }
          : ut
      )
    }));
  };
  
  // Handle opening edit dialog
  const handleEditDialogOpen = (bill: FrontendUtilitySetup) => {
    setSelectedBill(bill);
    // For edit mode, we'll use the old single-bill form data structure
    // This is a temporary solution - ideally we'd have a separate edit form
    // Filter to only active utility types for edit mode
    const activeUtilityTypes = utilityTypes?.filter(type => type.isActive) || [];
    const editFormData = {
      propertyId: bill.propertyId,
      billingPeriodId: bill.billingPeriodId || "",
      billingDate: bill.billingDate || format(new Date(), "yyyy-MM-dd"),
      notes: bill.notes || "",
      utilityTypes: activeUtilityTypes.map(type => ({
        utilityTypeId: type.id,
        selected: type.id === bill.utilityTypeId,
        amount: type.id === bill.utilityTypeId ? (bill.billingAmount || 0) : 0
      }))
    };
    setFormData(editFormData);
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

  // Handle form submission for creating multiple bills
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.propertyId || !formData.billingPeriodId || !formData.billingDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Get selected utility types with amounts
    const selectedUtilities = formData.utilityTypes.filter(ut => ut.selected && ut.amount > 0);
    
    if (selectedUtilities.length === 0) {
      toast.error("Please select at least one utility type with an amount");
      return;
    }
    
    try {
      // Create bills for each selected utility type
      const billPromises = selectedUtilities.map(utility => 
        new Promise((resolve, reject) => {
          createBill.mutate({
            propertyId: formData.propertyId,
            utilityTypeId: utility.utilityTypeId,
            billingPeriodId: formData.billingPeriodId,
            billingDate: formData.billingDate,
            billingAmount: utility.amount,
            notes: formData.notes,
            isActive: true,
            meterNumber: null,
            accountNumber: null,
            providerName: null,
            providerContact: null
          }, {
            onSuccess: resolve,
            onError: reject
          });
        })
      );
      
      await Promise.all(billPromises);
      
      // Reset form and close dialog
      setFormData(defaultMultiFormData);
      setIsDialogOpen(false);
      toast.success(`${selectedUtilities.length} utility bill(s) added successfully`);
      
    } catch (error) {
      toast.error(`Error adding bills: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Handle form submission for editing an existing bill
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.propertyId || !formData.billingPeriodId || !formData.billingDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Get the selected utility type for edit mode
    const selectedUtility = formData.utilityTypes.find(ut => ut.selected);
    if (!selectedUtility || selectedUtility.amount <= 0) {
      toast.error("Please select a utility type with an amount");
      return;
    }
    
    if (selectedBill) {
      // Update existing bill
      updateBill.mutate({
        id: selectedBill.id,
        billData: {
          propertyId: formData.propertyId,
          utilityTypeId: selectedUtility.utilityTypeId,
          billingPeriodId: formData.billingPeriodId,
          billingDate: formData.billingDate,
          billingAmount: selectedUtility.amount,
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
  const exportToExcel = async () => {
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
      
      // Generate and download Excel file
      await downloadExcelFile(exportData, `utility_bills_export_${new Date().toISOString().split('T')[0]}.xlsx`, 'Utility Bills');
      
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

      {/* Create Slide-in Form */}
      <SlideInFormWithActions
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Add Utility Bill"
        description="Create a new utility bill for a property"
        size="lg"
        position="right"
        onSubmit={handleCreateSubmit}
        actions={[
          {
            label: 'Cancel',
            onClick: () => setIsDialogOpen(false),
            variant: 'outline'
          },
          {
            label: createBill.isPending ? 'Creating...' : 'Create',
            onClick: () => {},
            variant: 'default',
            disabled: createBill.isPending,
            loading: createBill.isPending
          }
        ]}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="propertyId" className="text-white">Property *</Label>
            <select
              id="propertyId"
              name="propertyId"
              value={formData.propertyId}
              onChange={handlePropertyChange}
              className="w-full flex h-10 rounded-md border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm"
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
          
          {/* Show utility types as checkboxes only after property is selected */}
          {formData.propertyId && (
            <>
              <div className="space-y-4">
                <Label className="text-white text-lg font-semibold">Utility Types *</Label>
                <p className="text-sm text-gray-400">Select the utility types and enter amounts for this billing period</p>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {formData.utilityTypes.length === 0 ? (
                    <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-200 text-sm">
                        No active utility types found. Please create utility types first in the Utility Types management section.
                      </p>
                    </div>
                  ) : (
                    formData.utilityTypes.map((utilityType) => {
                      const typeInfo = utilityTypes?.find(t => t.id === utilityType.utilityTypeId);
                      if (!typeInfo) return null;
                      
                      return (
                        <div key={utilityType.utilityTypeId} className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="flex items-center space-x-3 flex-1">
                            <input
                              type="checkbox"
                              id={`utility-${utilityType.utilityTypeId}`}
                              checked={utilityType.selected}
                              onChange={(e) => handleUtilityTypeChange(utilityType.utilityTypeId, 'selected', e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <Label htmlFor={`utility-${utilityType.utilityTypeId}`} className="text-white font-medium cursor-pointer">
                              {typeInfo.name}
                            </Label>
                            {/* Icon placeholder - utility types don't have icons in current schema */}
                            <Zap className="h-4 w-4 text-gray-400" />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-sm">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={utilityType.amount || ''}
                              onChange={(e) => handleUtilityTypeChange(utilityType.utilityTypeId, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              disabled={!utilityType.selected}
                              className={`w-24 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 ${
                                !utilityType.selected ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {/* Summary of selected utilities */}
                {formData.utilityTypes.some(ut => ut.selected) && (
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-200 text-sm font-medium mb-2">Selected Utilities:</p>
                    <div className="space-y-1">
                      {formData.utilityTypes
                        .filter(ut => ut.selected && ut.amount > 0)
                        .map(ut => {
                          const typeInfo = utilityTypes?.find(t => t.id === ut.utilityTypeId);
                          return (
                            <div key={ut.utilityTypeId} className="flex justify-between text-sm">
                              <span className="text-blue-100">{typeInfo?.name}</span>
                              <span className="text-blue-100 font-medium">${ut.amount.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      <div className="border-t border-blue-500/30 pt-2 mt-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-blue-100">Total:</span>
                          <span className="text-blue-100">
                            ${formData.utilityTypes
                              .filter(ut => ut.selected)
                              .reduce((sum, ut) => sum + (ut.amount || 0), 0)
                              .toFixed(2)
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="billingPeriodId" className="text-white">Billing Period *</Label>
                <select
                  id="billingPeriodId"
                  name="billingPeriodId"
                  value={formData.billingPeriodId}
                  onChange={handleInputChange}
                  className="w-full flex h-10 rounded-md border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm"
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
              
              <div className="space-y-2">
                <Label htmlFor="billingDate" className="text-white">Billing Date *</Label>
                <Input
                  id="billingDate"
                  name="billingDate"
                  type="date"
                  value={formData.billingDate}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Optional notes for all bills"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
            </>
          )}
        </div>
      </SlideInFormWithActions>

      {/* Edit Slide-in Form */}
      <SlideInFormWithActions
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Utility Bill"
        description="Update the utility bill details"
        size="lg"
        position="right"
        onSubmit={handleEditSubmit}
        actions={[
          {
            label: 'Cancel',
            onClick: () => setIsEditDialogOpen(false),
            variant: 'outline'
          },
          {
            label: updateBill.isPending ? 'Updating...' : 'Update',
            onClick: () => {},
            variant: 'default',
            disabled: updateBill.isPending,
            loading: updateBill.isPending
          }
        ]}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-propertyId" className="text-white">Property *</Label>
            <select
              id="edit-propertyId"
              name="propertyId"
              value={formData.propertyId}
              onChange={handlePropertyChange}
              className="w-full flex h-10 rounded-md border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm"
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
          
          {/* Show utility types as checkboxes for edit mode */}
          {formData.propertyId && (
            <>
              <div className="space-y-4">
                <Label className="text-white text-lg font-semibold">Utility Type *</Label>
                <p className="text-sm text-gray-400">Select the utility type and enter amount</p>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {formData.utilityTypes.map((utilityType) => {
                    const typeInfo = utilityTypes?.find(t => t.id === utilityType.utilityTypeId);
                    if (!typeInfo) return null;
                    
                    return (
                      <div key={utilityType.utilityTypeId} className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-3 flex-1">
                          <input
                            type="checkbox"
                            id={`edit-utility-${utilityType.utilityTypeId}`}
                            checked={utilityType.selected}
                            onChange={(e) => handleUtilityTypeChange(utilityType.utilityTypeId, 'selected', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <Label htmlFor={`edit-utility-${utilityType.utilityTypeId}`} className="text-white font-medium cursor-pointer">
                            {typeInfo.name}
                          </Label>
                          <Zap className="h-4 w-4 text-gray-400" />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={utilityType.amount || ''}
                            onChange={(e) => handleUtilityTypeChange(utilityType.utilityTypeId, 'amount', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            disabled={!utilityType.selected}
                            className={`w-24 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 ${
                              !utilityType.selected ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-billingPeriodId" className="text-white">Billing Period *</Label>
                <select
                  id="edit-billingPeriodId"
                  name="billingPeriodId"
                  value={formData.billingPeriodId}
                  onChange={handleInputChange}
                  className="w-full flex h-10 rounded-md border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm"
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
              
              <div className="space-y-2">
                <Label htmlFor="edit-billingDate" className="text-white">Billing Date *</Label>
                <Input
                  id="edit-billingDate"
                  name="billingDate"
                  type="date"
                  value={formData.billingDate}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-notes" className="text-white">Notes</Label>
                <Input
                  id="edit-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Optional notes"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
            </>
          )}
        </div>
      </SlideInFormWithActions>

      {/* Delete Slide-in Form */}
      <SlideInFormWithActions
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Utility Bill"
        description="Are you sure you want to delete this utility bill? This action cannot be undone."
        size="md"
        position="right"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setIsDeleteDialogOpen(false),
            variant: 'outline'
          },
          {
            label: deleteBill.isPending ? 'Deleting...' : 'Delete',
            onClick: handleDelete,
            variant: 'destructive',
            disabled: deleteBill.isPending,
            loading: deleteBill.isPending
          }
        ]}
      >
        <div className="space-y-4">
          {selectedBill && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-200">
                You are about to delete the utility bill for{" "}
                <strong className="font-semibold text-red-100">
                  {properties?.find(p => p.id === selectedBill.propertyId)?.title || "Unknown Property"}
                </strong>
              </p>
              <p className="text-xs text-red-300 mt-2">
                This action cannot be undone.
              </p>
            </div>
          )}
        </div>
      </SlideInFormWithActions>
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
