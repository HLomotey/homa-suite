import React, { useState, useEffect, useMemo } from "react";
// Removed API-calling hooks
// import { useBillingPeriods } from "@/hooks/utility";
// Mock data and hooks for utility readings since the actual hooks were removed
// Removed useQuery import to prevent API calls
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FrontendUtilityReading,
  FrontendUtilitySetup,
  FrontendBillingPeriod,
} from "@/integration/supabase/types/utility";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, Gauge } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UtilityReadingFormData {
  utilitySetupId: string;
  billingPeriodId: string;
  readingDate: string;
  previousReading: number | null;
  currentReading: number;
  consumption?: number | null;
  unitCost?: number | null;
  totalCost?: number | null;
  isEstimated?: boolean;
  notes: string | null;
}

interface UtilityReadingsListProps {
  propertyId?: string;
}

const defaultFormData: UtilityReadingFormData = {
  utilitySetupId: "",
  billingPeriodId: "",
  readingDate: format(new Date(), "yyyy-MM-dd"),
  previousReading: null,
  currentReading: 0,
  totalCost: null,
  isEstimated: false,
  notes: "",
};

export function UtilityReadingsList({
  propertyId = "",
}: UtilityReadingsListProps) {
  // Mock utility setups data since the hooks were removed
  const [allUtilitySetups, setAllUtilitySetups] = useState<FrontendUtilitySetup[]>([
    {
      id: "setup1",
      propertyId: "prop1",
      propertyName: "Property 1",
      utilityTypeId: "ut1",
      utilityTypeName: "Electricity",
      meterNumber: "E12345",
      accountNumber: "ACC-001",
      providerName: "Energy Co",
      providerContact: "support@energyco.com",
      billingPeriodId: "bp1",
      billingDate: "2025-01-15",
      isActive: true,
      notes: "Main building electricity"
    } as FrontendUtilitySetup,
    {
      id: "setup2",
      propertyId: "prop1",
      propertyName: "Property 1",
      utilityTypeId: "ut2",
      utilityTypeName: "Water",
      meterNumber: "W54321",
      accountNumber: "ACC-002",
      providerName: "Water Works",
      providerContact: "support@waterworks.com",
      billingPeriodId: "bp1",
      billingDate: "2025-01-10",
      isActive: true,
      notes: "Main water supply"
    } as FrontendUtilitySetup
  ]);
  const [propertyUtilitySetups, setPropertyUtilitySetups] = useState<FrontendUtilitySetup[]>([]);
  
  // Mock billing periods data instead of using the hook
  const [billingPeriods, setBillingPeriods] = useState([
    { id: "bp1", name: "January 2025", startDate: "2025-01-01", endDate: "2025-01-31", status: "active" },
    { id: "bp2", name: "February 2025", startDate: "2025-02-01", endDate: "2025-02-28", status: "active" },
    { id: "bp3", name: "March 2025", startDate: "2025-03-01", endDate: "2025-03-31", status: "active" },
  ]);
  
  // Mock readings data
  const [allReadings, setAllReadings] = useState<FrontendUtilityReading[]>([
    {
      id: "reading1",
      utilitySetupId: "setup1",
      propertyName: "Property 1",
      utilityTypeName: "Electricity",
      billingPeriodId: "bp1",
      billingPeriodName: "January 2025",
      readingDate: "2025-01-20",
      previousReading: 1000,
      currentReading: 1250,
      consumption: 250,
      unitCost: 0.15,
      totalCost: 37.50,
      isEstimated: false,
      notes: "Regular monthly reading"
    } as FrontendUtilityReading,
    {
      id: "reading2",
      utilitySetupId: "setup2",
      propertyName: "Property 1",
      utilityTypeName: "Water",
      billingPeriodId: "bp1",
      billingPeriodName: "January 2025",
      readingDate: "2025-01-15",
      previousReading: 500,
      currentReading: 550,
      consumption: 50,
      unitCost: 1.20,
      totalCost: 60.00,
      isEstimated: false,
      notes: "Regular monthly reading"
    } as FrontendUtilityReading
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use property-filtered utility setups if propertyId is provided
  const utilitySetups =
    propertyId && propertyUtilitySetups
      ? propertyUtilitySetups
      : allUtilitySetups;

  const [selectedSetupId, setSelectedSetupId] = useState<string>("all");
  const [selectedBillingPeriodId, setSelectedBillingPeriodId] = useState<string>("all");

  // Update selectedSetupId when propertyId changes and we have setups for that property
  useEffect(() => {
    if (
      propertyId &&
      propertyUtilitySetups &&
      propertyUtilitySetups.length > 0
    ) {
      setSelectedSetupId(propertyUtilitySetups[0].id);
    } else {
      setSelectedSetupId("all");
    }
  }, [propertyId, propertyUtilitySetups]);

  const filteredReadings = useMemo(() => {
    let filtered = [...(allReadings || [])];

    if (selectedSetupId && selectedSetupId !== "all") {
      filtered = filtered.filter(
        (reading) => reading.utilitySetupId === selectedSetupId
      );
    }

    if (selectedBillingPeriodId && selectedBillingPeriodId !== "all") {
      filtered = filtered.filter(
        (reading) => reading.billingPeriodId === selectedBillingPeriodId
      );
    }

    return filtered;
  }, [allReadings, selectedSetupId, selectedBillingPeriodId]);

  // Mock mutation hooks
  const queryClient = useQueryClient();
  
  const createUtilityReading = useMutation({
    mutationFn: (readingData: any) => {
      // Mock implementation
      console.log('Creating utility reading:', readingData);
      return Promise.resolve({ ...readingData, id: `mock-${Date.now()}` });
    },
    onSuccess: () => {
      toast.success("This is a mock implementation. The utility reading hooks have been removed.");
    }
  });
  
  const updateUtilityReading = useMutation({
    mutationFn: ({ id, readingData }: { id: string; readingData: any }) => {
      // Mock implementation
      console.log('Updating utility reading:', id, readingData);
      return Promise.resolve({ ...readingData, id });
    },
    onSuccess: () => {
      toast.success("This is a mock implementation. The utility reading hooks have been removed.");
    }
  });
  
  const deleteUtilityReading = useMutation({
    mutationFn: (id: string) => {
      // Mock implementation
      console.log('Deleting utility reading:', id);
      return Promise.resolve(id);
    },
    onSuccess: () => {
      toast.success("This is a mock implementation. The utility reading hooks have been removed.");
    }
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReading, setSelectedReading] =
    useState<FrontendUtilityReading | null>(null);
  const [formData, setFormData] =
    useState<UtilityReadingFormData>(defaultFormData);

  const handleSetupChange = (setupId: string) => {
    setSelectedSetupId(setupId);
    if (setupId && setupId !== "all") {
      setSelectedBillingPeriodId("all");
    }
  };

  const handleBillingPeriodChange = (periodId: string) => {
    setSelectedBillingPeriodId(periodId);
    if (periodId && periodId !== "all") {
      setSelectedSetupId("all");
    }
  };

  const handleCreateDialogOpen = () => {
    setFormData({
      ...defaultFormData,
      utilitySetupId: selectedSetupId || "",
      billingPeriodId: selectedBillingPeriodId || "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditDialogOpen = (reading: FrontendUtilityReading) => {
    setSelectedReading(reading);
    setFormData({
      utilitySetupId: reading.utilitySetupId,
      billingPeriodId: reading.billingPeriodId,
      readingDate: reading.readingDate,
      previousReading: reading.previousReading,
      currentReading: reading.currentReading,
      totalCost: reading.totalCost,
      isEstimated: reading.isEstimated || false,
      notes: reading.notes,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteDialogOpen = (reading: FrontendUtilityReading) => {
    setSelectedReading(reading);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle numeric inputs
    if (
      name === "currentReading" ||
      name === "previousReading" ||
      name === "totalCost" ||
      name === "unitCost"
    ) {
      const numValue = value === "" ? null : Number(value);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else if (name === "isEstimated") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUtilityReading.mutateAsync({
        utilitySetupId: formData.utilitySetupId,
        billingPeriodId: formData.billingPeriodId,
        readingDate: formData.readingDate,
        previousReading: formData.previousReading,
        currentReading: formData.currentReading,
        consumption: formData.consumption || null,
        unitCost: formData.unitCost || null,
        totalCost: formData.totalCost,
        isEstimated: formData.isEstimated || false,
        notes: formData.notes,
      });
      setIsCreateDialogOpen(false);
      toast.success("Utility reading created successfully");
    } catch (error) {
      toast.error("Failed to create utility reading");
      console.error(error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReading) return;

    try {
      await updateUtilityReading.mutateAsync({
        id: selectedReading.id,
        readingData: {
          utilitySetupId: formData.utilitySetupId,
          billingPeriodId: formData.billingPeriodId,
          readingDate: formData.readingDate,
          previousReading: formData.previousReading,
          currentReading: formData.currentReading,
          consumption: formData.consumption || null,
          unitCost: formData.unitCost || null,
          totalCost: formData.totalCost,
          isEstimated: formData.isEstimated,
          notes: formData.notes,
        },
      });
      setIsEditDialogOpen(false);
      toast.success("Utility reading updated successfully");
    } catch (error) {
      toast.error("Failed to update utility reading");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!selectedReading) return;

    try {
      await deleteUtilityReading.mutateAsync(selectedReading.id);
      setIsDeleteDialogOpen(false);
      toast.success("Utility reading deleted successfully");
    } catch (error) {
      toast.error("Failed to delete utility reading");
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const getSetupDisplayName = (setupId: string): string => {
    const setup = utilitySetups?.find((s) => s.id === setupId);
    if (!setup) return "Unknown Setup";
    return `${setup.propertyName || "Property"} - ${
      setup.utilityTypeName || "Utility"
    }`;
  };

  const getBillingPeriodName = (periodId: string): string => {
    const period = billingPeriods?.find((p) => p.id === periodId);
    return period ? period.name : "Unknown Period";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">Loading utility readings...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-4 text-red-500">
        Error loading utility readings
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Utility Readings</CardTitle>
        <CardDescription>
          Record and manage utility consumption readings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="w-1/3">
            <Select value={selectedSetupId} onValueChange={handleSetupChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by utility setup" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Setups</SelectItem>
                {utilitySetups?.map((setup) => (
                  <SelectItem key={setup.id} value={setup.id}>
                    {setup.propertyName || "Property"} -{" "}
                    {setup.utilityTypeName || "Utility"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-1/3">
            <Select
              value={selectedBillingPeriodId}
              onValueChange={handleBillingPeriodChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by billing period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                {billingPeriods?.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-grow flex justify-end">
            <Button onClick={handleCreateDialogOpen}>
              <Plus className="mr-2 h-4 w-4" /> Add Reading
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utility Setup</TableHead>
              <TableHead>Billing Period</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Reading</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReadings && filteredReadings.length > 0 ? (
              filteredReadings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell className="font-medium">
                    {reading.utilityTypeName
                      ? `${reading.propertyName} - ${reading.utilityTypeName}`
                      : getSetupDisplayName(reading.utilitySetupId)}
                  </TableCell>
                  <TableCell>
                    {reading.billingPeriodName ||
                      getBillingPeriodName(reading.billingPeriodId)}
                  </TableCell>
                  <TableCell>{formatDate(reading.readingDate)}</TableCell>
                  <TableCell>{reading.currentReading}</TableCell>
                  <TableCell>
                    {reading.totalCost
                      ? `$${reading.totalCost.toFixed(2)}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDialogOpen(reading)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDialogOpen(reading)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No utility readings found
                  {selectedSetupId && " for this utility setup"}
                  {selectedBillingPeriodId && " for this billing period"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Utility Reading</DialogTitle>
            <DialogDescription>
              Record a new utility consumption reading
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="utilitySetupId" className="text-right">
                  Utility Setup
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.utilitySetupId}
                    onValueChange={(value) =>
                      handleSelectChange("utilitySetupId", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select utility setup" />
                    </SelectTrigger>
                    <SelectContent>
                      {utilitySetups?.map((setup) => (
                        <SelectItem key={setup.id} value={setup.id}>
                          {setup.propertyName || "Property"} -{" "}
                          {setup.utilityTypeName || "Utility"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="billingPeriodId" className="text-right">
                  Billing Period
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.billingPeriodId}
                    onValueChange={(value) =>
                      handleSelectChange("billingPeriodId", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing period" />
                    </SelectTrigger>
                    <SelectContent>
                      {billingPeriods?.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="readingDate" className="text-right">
                  Reading Date
                </Label>
                <Input
                  id="readingDate"
                  name="readingDate"
                  type="date"
                  value={formData.readingDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currentReading" className="text-right">
                  Reading Value
                </Label>
                <Input
                  id="currentReading"
                  name="currentReading"
                  type="number"
                  step="0.01"
                  value={formData.currentReading}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="previousReading" className="text-right">
                  Previous Reading
                </Label>
                <Input
                  id="previousReading"
                  name="previousReading"
                  type="number"
                  step="0.01"
                  value={
                    formData.previousReading === null
                      ? ""
                      : formData.previousReading
                  }
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="totalCost" className="text-right">
                  Cost
                </Label>
                <Input
                  id="totalCost"
                  name="totalCost"
                  type="number"
                  step="0.01"
                  value={formData.totalCost === null ? "" : formData.totalCost}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isEstimated" className="text-right">
                  Estimated Reading
                </Label>
                <div className="col-span-3 flex items-center">
                  <input
                    id="isEstimated"
                    name="isEstimated"
                    type="checkbox"
                    checked={formData.isEstimated || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isEstimated: e.target.checked,
                      }))
                    }
                    className="mr-2 h-4 w-4"
                    aria-label="Estimated Reading"
                    title="Check if this is an estimated reading"
                  />
                  <span className="text-sm text-gray-500">
                    Check if this is an estimated reading
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createUtilityReading.isPending}>
                {createUtilityReading.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Utility Reading</DialogTitle>
            <DialogDescription>
              Update utility reading details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-utilitySetupId" className="text-right">
                  Utility Setup
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.utilitySetupId}
                    onValueChange={(value) =>
                      handleSelectChange("utilitySetupId", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select utility setup" />
                    </SelectTrigger>
                    <SelectContent>
                      {utilitySetups?.map((setup) => (
                        <SelectItem key={setup.id} value={setup.id}>
                          {setup.propertyName || "Property"} -{" "}
                          {setup.utilityTypeName || "Utility"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-billingPeriodId" className="text-right">
                  Billing Period
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.billingPeriodId}
                    onValueChange={(value) =>
                      handleSelectChange("billingPeriodId", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing period" />
                    </SelectTrigger>
                    <SelectContent>
                      {billingPeriods?.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-readingDate" className="text-right">
                  Reading Date
                </Label>
                <Input
                  id="edit-readingDate"
                  name="readingDate"
                  type="date"
                  value={formData.readingDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-currentReading" className="text-right">
                  Reading Value
                </Label>
                <Input
                  id="edit-currentReading"
                  name="currentReading"
                  type="number"
                  step="0.01"
                  value={formData.currentReading}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-previousReading" className="text-right">
                  Previous Reading
                </Label>
                <Input
                  id="edit-previousReading"
                  name="previousReading"
                  type="number"
                  step="0.01"
                  value={
                    formData.previousReading === null
                      ? ""
                      : formData.previousReading
                  }
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-totalCost" className="text-right">
                  Cost
                </Label>
                <Input
                  id="edit-totalCost"
                  name="totalCost"
                  type="number"
                  step="0.01"
                  value={formData.totalCost === null ? "" : formData.totalCost}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-isEstimated" className="text-right">
                  Estimated Reading
                </Label>
                <div className="col-span-3 flex items-center">
                  <input
                    id="edit-isEstimated"
                    name="isEstimated"
                    type="checkbox"
                    checked={formData.isEstimated || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isEstimated: e.target.checked,
                      }))
                    }
                    className="mr-2 h-4 w-4"
                    aria-label="Estimated Reading"
                    title="Check if this is an estimated reading"
                  />
                  <span className="text-sm text-gray-500">
                    Check if this is an estimated reading
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="edit-notes"
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Optional"
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
              <Button type="submit" disabled={updateUtilityReading.isPending}>
                {updateUtilityReading.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Utility Reading</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this utility reading? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedReading && (
              <p>
                You are about to delete the utility reading for{" "}
                <strong>
                  {selectedReading.utilityTypeName ||
                    getSetupDisplayName(selectedReading.utilitySetupId)}
                </strong>{" "}
                on <strong>{formatDate(selectedReading.readingDate)}</strong>
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
              disabled={deleteUtilityReading.isPending}
            >
              {deleteUtilityReading.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
