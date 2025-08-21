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
import { Plus, Pencil, Trash2 } from "lucide-react";
import useLocation from "@/hooks/transport/useLocation";
import useStaffLocation from "@/hooks/transport/useStaffLocation";
import { FrontendStaffLocation, StaffLocationFormData } from "@/integration/supabase/types/staffLocation";
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
