import React, { useState } from "react";
import {
  useBillingPeriods,
  useCreateBillingPeriod,
  useUpdateBillingPeriod,
  useDeleteBillingPeriod,
} from "@/hooks/utility";
import { FrontendBillingPeriod } from "@/integration/supabase/types/utility";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface BillingPeriodFormData {
  name: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
}

const defaultFormData: BillingPeriodFormData = {
  name: "",
  startDate: format(new Date(), "yyyy-MM-dd"),
  endDate: format(
    new Date(new Date().setMonth(new Date().getMonth() + 1)),
    "yyyy-MM-dd"
  ),
  status: 'ACTIVE',
};

export function BillingPeriodsList() {
  const { data: billingPeriods, isLoading, error } = useBillingPeriods();
  const createBillingPeriod = useCreateBillingPeriod();
  const updateBillingPeriod = useUpdateBillingPeriod();
  const deleteBillingPeriod = useDeleteBillingPeriod();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBillingPeriod, setSelectedBillingPeriod] =
    useState<FrontendBillingPeriod | null>(null);
  const [formData, setFormData] =
    useState<BillingPeriodFormData>(defaultFormData);

  const handleCreateDialogOpen = () => {
    setFormData(defaultFormData);
    setIsCreateDialogOpen(true);
  };

  const handleEditDialogOpen = (billingPeriod: FrontendBillingPeriod) => {
    setSelectedBillingPeriod(billingPeriod);
    setFormData({
      name: billingPeriod.name,
      startDate: billingPeriod.startDate,
      endDate: billingPeriod.endDate,
      status: billingPeriod.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteDialogOpen = (billingPeriod: FrontendBillingPeriod) => {
    setSelectedBillingPeriod(billingPeriod);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED') => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBillingPeriod.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      toast.success("Billing period created successfully");
    } catch (error) {
      toast.error("Failed to create billing period");
      console.error(error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillingPeriod) return;

    try {
      await updateBillingPeriod.mutateAsync({
        id: selectedBillingPeriod.id,
        billingPeriodData: formData,
      });
      setIsEditDialogOpen(false);
      toast.success("Billing period updated successfully");
    } catch (error) {
      toast.error("Failed to update billing period");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!selectedBillingPeriod) return;

    try {
      await deleteBillingPeriod.mutateAsync(selectedBillingPeriod.id);
      setIsDeleteDialogOpen(false);
      toast.success("Billing period deleted successfully");
    } catch (error) {
      toast.error("Failed to delete billing period");
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

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">Loading billing periods...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-4 text-red-500">
        Error loading billing periods
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Billing Periods</CardTitle>
        <CardDescription>
          Manage billing periods for utility readings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={handleCreateDialogOpen}>
            <Plus className="mr-2 h-4 w-4" /> Add Billing Period
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billingPeriods && billingPeriods.length > 0 ? (
              billingPeriods.map((billingPeriod) => (
                <TableRow key={billingPeriod.id}>
                  <TableCell className="font-medium">
                    {billingPeriod.name}
                  </TableCell>
                  <TableCell>{formatDate(billingPeriod.startDate)}</TableCell>
                  <TableCell>{formatDate(billingPeriod.endDate)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={billingPeriod.status === 'ACTIVE' ? "default" : 
                              billingPeriod.status === 'CLOSED' ? "secondary" : "outline"}
                    >
                      {billingPeriod.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDialogOpen(billingPeriod)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDialogOpen(billingPeriod)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No billing periods found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Billing Period</DialogTitle>
            <DialogDescription>
              Create a new billing period for utility readings
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                  placeholder="e.g., January 2024"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <div className="col-span-3">
                  <select 
                    id="status"
                    aria-label="Billing Period Status"
                    title="Billing Period Status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.status}
                    onChange={(e) => handleStatusChange(e.target.value as 'ACTIVE' | 'CLOSED' | 'ARCHIVED')}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
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
              <Button type="submit" disabled={createBillingPeriod.isPending}>
                {createBillingPeriod.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Billing Period</DialogTitle>
            <DialogDescription>
              Update the billing period details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-startDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="edit-startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-endDate" className="text-right">
                  End Date
                </Label>
                <Input
                  id="edit-endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <div className="col-span-3">
                  <select 
                    id="edit-status"
                    aria-label="Billing Period Status"
                    title="Billing Period Status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.status}
                    onChange={(e) => handleStatusChange(e.target.value as 'ACTIVE' | 'CLOSED' | 'ARCHIVED')}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
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
              <Button type="submit" disabled={updateBillingPeriod.isPending}>
                {updateBillingPeriod.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Billing Period</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this billing period? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedBillingPeriod && (
              <p>
                You are about to delete the billing period:{" "}
                <strong>{selectedBillingPeriod.name}</strong>
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
              disabled={deleteBillingPeriod.isPending}
            >
              {deleteBillingPeriod.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
