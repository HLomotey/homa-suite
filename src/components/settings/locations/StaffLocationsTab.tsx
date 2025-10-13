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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Pencil,
  Trash2,
  User,
  X,
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Search,
  Building2,
} from "lucide-react";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import { useDebounce } from "../../../hooks/useDebounce";
import { useLocation } from "@/hooks/transport/useLocation";
import useStaffLocation from "@/hooks/transport/useStaffLocation";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { useCompanyAccounts } from "@/hooks/companyAccount/useCompanyAccounts";
import { FrontendExternalStaff } from "@/integration/supabase/types/external-staff";
import {
  FrontendStaffLocation,
  StaffLocationFormData,
} from "@/integration/supabase/types/staffLocation";
import { supabaseAdmin } from "@/integration/supabase/admin-client";
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
    createStaffLocation,
    updateStaffLocation,
    deleteStaffLocation,
    loading,
    error,
  } = useStaffLocation();
  const {
    externalStaff,
    loading: loadingExternalStaff,
    fetchExternalStaff,
    setStatus,
  } = useExternalStaff();
  const {
    companyAccounts,
    loading: loadingCompanyAccounts,
  } = useCompanyAccounts();

  // External staff search state
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FrontendExternalStaff[]>(
    []
  );
  const [openCombobox, setOpenCombobox] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Function to search external staff by manager ID
  const searchExternalStaffByManager = async (searchTerm: string) => {
    setIsSearching(true);
    try {
      // Use supabaseAdmin to bypass RLS policies
      const { data, error } = await supabaseAdmin
        .from("external_staff")
        .select("*")
        .or(
          `"PAYROLL FIRST NAME".ilike.%${searchTerm}%,"PAYROLL LAST NAME".ilike.%${searchTerm}%,"WORK E-MAIL".ilike.%${searchTerm}%`
        )
        .eq("REPORTS TO ID", "current-manager-id") // Replace with actual manager ID
        .limit(10);

      if (error) {
        console.error("Error searching external staff:", error);
        return;
      }

      setSearchResults(data as FrontendExternalStaff[]);
    } catch (error) {
      console.error("Error searching external staff:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // We already have externalStaff from the hook above

  // Effect to trigger search when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      // You can replace 'current-manager-id' with the actual manager ID from context or props
      searchExternalStaffByManager(debouncedSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  // Handle staff selection
  const handleStaffSelect = (staff: FrontendExternalStaff) => {
    setFormData((prev) => ({
      ...prev,
      externalStaffId: staff.id,
      externalStaffName: `${staff["PAYROLL FIRST NAME"] || ""} ${
        staff["PAYROLL LAST NAME"] || ""
      }`.trim(),
    }));
    setOpenCombobox(false);
    setSearchTerm("");
  };

  // Form states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaffLocation, setSelectedStaffLocation] =
    useState<FrontendStaffLocation | null>(null);
  const [formData, setFormData] = useState({
    mode: "add", // "add" or "edit"
    companyLocationId: "",
    locationCode: "",
    locationDescription: "",
    isActive: true,
    managerId: "",
    managerName: "",
    companyAccountId: "",
  });

  // Set external staff status to active and fetch on component mount
  useEffect(() => {
    // Set status to active to only show active staff
    setStatus("active");
    // Fetch Staff Information    fetchExternalStaff();
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

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
      managerId: "",
      managerName: "",
      companyAccountId: "none",
    });
  };

  const openAddSheet = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, mode: "add" }));
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
      managerId: staffLocation.managerId || "",
      managerName: staffLocation.managerName || "",
      companyAccountId: staffLocation.companyAccountId?.toString() || "none",
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
        managerId: formData.managerId,
        managerName: formData.managerName,
        companyAccountId: formData.companyAccountId && formData.companyAccountId !== "none" ? parseInt(formData.companyAccountId) : undefined,
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
          No staff locations found. Add your first staff location to get
          started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Location</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Company Account</TableHead>
              <TableHead>Location Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffLocations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">
                  {location.companyLocationName}
                </TableCell>
                <TableCell>
                  {location.state ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {location.state}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No state
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {location.derivedCompanyAccountName || location.companyAccountName ? (
                    <span>{location.derivedCompanyAccountName || location.companyAccountName}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No account assigned
                    </span>
                  )}
                </TableCell>
                <TableCell>{location.locationCode}</TableCell>
                <TableCell>{location.locationDescription}</TableCell>
                <TableCell>
                  {location.managerName ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span>{location.managerName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No manager
                    </span>
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
            <SheetTitle>
              {formData.mode === "add"
                ? "Add New Staff Location"
                : "Edit Staff Location"}
            </SheetTitle>
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

            <div className="space-y-2">
              <Label htmlFor="companyAccountId">Company Account</Label>
              {loadingCompanyAccounts ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading accounts...</span>
                </div>
              ) : (
                <Select
                  value={formData.companyAccountId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, companyAccountId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company account (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No account assigned</SelectItem>
                    {companyAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            #{account.id}
                          </span>
                          <span>{account.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>


            {/* Manager Searchable Input */}
            <div className="space-y-2">
              <Label htmlFor="manager">Manager</Label>
              {loadingExternalStaff ? (
                <div className="flex items-center space-x-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading managers...</span>
                </div>
              ) : (
                <div className="mt-2">
                  <SearchableSelect
                    options={externalStaff.map(
                      (staff): SearchableSelectOption => {
                        const firstName = staff["PAYROLL FIRST NAME"] || "";
                        const lastName = staff["PAYROLL LAST NAME"] || "";
                        const jobTitle = staff["JOB TITLE"] || "";
                        const email = staff["WORK E-MAIL"] || "";
                        const department = staff["HOME DEPARTMENT"] || "";

                        // Create variations of the name for better search matching
                        const fullName = `${firstName} ${lastName}`.trim();
                        const reverseName = `${lastName} ${firstName}`.trim();
                        const firstInitialLastName = firstName
                          ? `${firstName[0]}. ${lastName}`.trim()
                          : "";

                        // Additional variations to improve search matching
                        const firstNameOnly = firstName.trim();
                        const lastNameOnly = lastName.trim();

                        return {
                          value: staff.id,
                          label: `${firstName} ${lastName} - ${jobTitle}`,
                          searchText: `${firstName} ${lastName} ${reverseName} ${firstInitialLastName} ${firstNameOnly} ${lastNameOnly} ${jobTitle} ${email} ${department}`,
                        };
                      }
                    )}
                    value={formData.managerId}
                    placeholder="Search and select manager..."
                    emptyMessage="No managers found."
                    onValueChange={(value) => {
                      const selectedManager = externalStaff.find(
                        (s) => s.id === value
                      );
                      setFormData({
                        ...formData,
                        managerId: value,
                        managerName: selectedManager
                          ? `${selectedManager["PAYROLL FIRST NAME"] || ""} ${
                              selectedManager["PAYROLL LAST NAME"] || ""
                            }`.trim()
                          : "",
                      });
                    }}
                  />
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
          <SheetFooter>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveStaffLocation}>Save</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Staff Location Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this staff location? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">
              {selectedStaffLocation?.companyLocationName}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedStaffLocation?.locationCode} -{" "}
              {selectedStaffLocation?.locationDescription}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
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
