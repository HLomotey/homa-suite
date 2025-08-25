import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search, X, Check, User } from "lucide-react";
import useLocation from "@/hooks/transport/useLocation";
import useStaffLocation from "@/hooks/transport/useStaffLocation";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { FrontendStaffLocation, StaffLocationFormData } from "@/integration/supabase/types/staffLocation";
import { FrontendExternalStaff } from "@/integration/supabase/types/external-staff";
import { supabaseAdmin } from "@/integration/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StaffLocationsTab() {
  const { locations } = useLocation();
  const {
    staffLocations,
    loading,
    error,
    fetchStaffLocations,
    createStaffLocation,
    updateStaffLocation,
    deleteStaffLocation,
  } = useStaffLocation();
  const { externalStaff, loading: loadingExternalStaff } = useExternalStaff();
  
  // External staff search state
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FrontendExternalStaff[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Function to search external staff by manager ID
  const searchExternalStaffByManager = async (query: string, managerId?: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // Use supabaseAdmin to bypass RLS policies
      const { data, error } = await supabaseAdmin
        .from('external_staff')
        .select('*')
        .or(`"PAYROLL FIRST NAME".ilike.%${query}%,"PAYROLL LAST NAME".ilike.%${query}%,"WORK E-MAIL".ilike.%${query}%`)
        .eq('"REPORTS TO NAME"', managerId || '')
        .limit(10);
      
      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching external staff:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Effect to trigger search when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      // You can replace 'current-manager-id' with the actual manager ID from context or props
      searchExternalStaffByManager(debouncedSearchTerm, 'current-manager-id');
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);
  
  // Handle staff selection
  const handleStaffSelect = (staff: FrontendExternalStaff) => {
    setFormData(prev => ({
      ...prev,
      externalStaffId: staff.id,
      externalStaffName: `${staff["PAYROLL FIRST NAME"] || ''} ${staff["PAYROLL LAST NAME"] || ''}`.trim(),
    }));
    setOpenCombobox(false);
    setSearchTerm("");
  };

  // Form states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaffLocation, setSelectedStaffLocation] = useState<FrontendStaffLocation | null>(null);
  const [formData, setFormData] = useState({
    mode: "add", // "add" or "edit"
    companyLocationId: "",
    locationCode: "",
    locationDescription: "",
    isActive: true,
    externalStaffId: "",
    externalStaffName: "",
  });

  // Fetch staff locations on component mount
  useEffect(() => {
    fetchStaffLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      companyLocationId: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const resetForm = () => {
    setFormData({
      mode: "add",
      companyLocationId: "",
      locationCode: "",
      locationDescription: "",
      isActive: true,
      externalStaffId: "",
      externalStaffName: "",
    });
  };

  const openAddSheet = () => {
    resetForm();
    setFormData(prev => ({ ...prev, mode: "add" }));
    setIsSheetOpen(true);
  };

  const openEditSheet = (staffLocation: FrontendStaffLocation) => {
    setSelectedStaffLocation(staffLocation);
    setFormData({
      mode: "edit",
      companyLocationId: staffLocation.companyLocationId,
      locationCode: staffLocation.locationCode,
      locationDescription: staffLocation.locationDescription,
      isActive: staffLocation.isActive,
      externalStaffId: staffLocation.externalStaffId || "",
      externalStaffName: staffLocation.externalStaffName || "",
    });
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (staffLocation: FrontendStaffLocation) => {
    setSelectedStaffLocation(staffLocation);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveStaffLocation = async () => {
    try {
      const locationData: StaffLocationFormData = {
        companyLocationId: formData.companyLocationId,
        locationCode: formData.locationCode,
        locationDescription: formData.locationDescription,
        isActive: formData.isActive,
        externalStaffId: formData.externalStaffId,
        externalStaffName: formData.externalStaffName,
      };
      
      if (formData.mode === "add") {
        await createStaffLocation(locationData);
      } else {
        if (!selectedStaffLocation) return;
        await updateStaffLocation(selectedStaffLocation.id, locationData);
      }
      
      setIsSheetOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving staff location:", error);
    }
  };

  const handleDeleteStaffLocation = async () => {
    if (!selectedStaffLocation) return;
    
    try {
      await deleteStaffLocation(selectedStaffLocation.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting staff location:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Staff Locations</h3>
        <Button className="flex items-center gap-2" onClick={openAddSheet}>
          <Plus className="h-4 w-4" />
          <span>Add Staff Location</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4">{error}</div>
      ) : staffLocations.length === 0 ? (
        <div className="text-center text-muted-foreground p-8">
          No staff locations found. Add your first staff location to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Location</TableHead>
              <TableHead>Location Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>External Staff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffLocations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">{location.companyLocationName}</TableCell>
                <TableCell>{location.locationCode}</TableCell>
                <TableCell>{location.locationDescription}</TableCell>
                <TableCell>
                  {location.externalStaffName ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{location.externalStaffName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      location.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {location.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditSheet(location)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(location)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Staff Location Form Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{formData.mode === "add" ? "Add New Staff Location" : "Edit Staff Location"}</SheetTitle>
            <SheetDescription>
              {formData.mode === "add" 
                ? "Enter the details for the new staff location." 
                : "Update the details for this staff location."}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="companyLocationId">Company Location</Label>
              <Select
                value={formData.companyLocationId}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* External Staff Searchable Input */}
            <div className="space-y-2">
              <Label htmlFor="externalStaffId">External Staff</Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                  >
                    {formData.externalStaffName ? (
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {formData.externalStaffName}
                      </span>
                    ) : (
                      "Select staff member..."
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search staff..." 
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>
                        {isSearching ? (
                          <div className="flex items-center justify-center p-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                        ) : (
                          "No staff found."
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {searchResults.map((staff) => (
                          <CommandItem
                            key={staff.id}
                            value={`${staff["PAYROLL FIRST NAME"]} ${staff["PAYROLL LAST NAME"]}`}
                            onSelect={() => handleStaffSelect(staff)}
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            <span>
                              {staff["PAYROLL FIRST NAME"]} {staff["PAYROLL LAST NAME"]}
                            </span>
                            {staff["WORK E-MAIL"] && (
                              <span className="text-xs text-muted-foreground ml-auto">
                                {staff["WORK E-MAIL"]}
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {formData.externalStaffId && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    Staff ID: {formData.externalStaffId}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        externalStaffId: "",
                        externalStaffName: "",
                      }));
                    }}
                    className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locationCode">Location Code</Label>
              <Input
                id="locationCode"
                name="locationCode"
                value={formData.locationCode}
                onChange={handleInputChange}
                placeholder="MAIN-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationDescription">Location Description</Label>
              <Input
                id="locationDescription"
                name="locationDescription"
                value={formData.locationDescription}
                onChange={handleInputChange}
                placeholder="Main Office - First Floor"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isActive">Active Location</Label>
            </div>
          </div>
          <SheetFooter className="sm:justify-end">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button onClick={handleSaveStaffLocation}>
              {formData.mode === "add" ? "Save Location" : "Update Location"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Staff Location Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this staff location? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{selectedStaffLocation?.companyLocationName}</p>
            <p className="text-sm text-muted-foreground">
              {selectedStaffLocation?.locationCode} - {selectedStaffLocation?.locationDescription}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStaffLocation}>
              Delete Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StaffLocationsTab;
