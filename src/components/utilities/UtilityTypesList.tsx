import React, { useState } from "react";
import {
  useUtilityTypes,
  useCreateUtilityType,
  useUpdateUtilityType,
  useDeleteUtilityType,
} from "@/hooks/utility";
import { FrontendUtilityType } from "@/integration/supabase/types/utility";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface UtilityTypeFormData {
  name: string;
  description: string | null;
  unitOfMeasure: string;
  isActive: boolean;
}

const defaultFormData: UtilityTypeFormData = {
  name: "",
  description: "",
  unitOfMeasure: "",
  isActive: true,
};

export function UtilityTypesList() {
  const { data: utilityTypes, isLoading, error } = useUtilityTypes();
  const createUtilityType = useCreateUtilityType();
  const updateUtilityType = useUpdateUtilityType();
  const deleteUtilityType = useDeleteUtilityType();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUtilityType, setSelectedUtilityType] =
    useState<FrontendUtilityType | null>(null);
  const [formData, setFormData] =
    useState<UtilityTypeFormData>(defaultFormData);

  const handleCreateDialogOpen = () => {
    setFormData(defaultFormData);
    setIsCreateDialogOpen(true);
  };

  const handleEditDialogOpen = (utilityType: FrontendUtilityType) => {
    setSelectedUtilityType(utilityType);
    setFormData({
      name: utilityType.name,
      description: utilityType.description,
      unitOfMeasure: utilityType.unitOfMeasure,
      isActive: utilityType.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteDialogOpen = (utilityType: FrontendUtilityType) => {
    setSelectedUtilityType(utilityType);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUtilityType.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      toast.success("Utility type created successfully");
    } catch (error) {
      toast.error("Failed to create utility type");
      console.error(error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUtilityType) return;

    try {
      await updateUtilityType.mutateAsync({
        id: selectedUtilityType.id,
        utilityTypeData: formData,
      });
      setIsEditDialogOpen(false);
      toast.success("Utility type updated successfully");
    } catch (error) {
      toast.error("Failed to update utility type");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!selectedUtilityType) return;

    try {
      await deleteUtilityType.mutateAsync(selectedUtilityType.id);
      setIsDeleteDialogOpen(false);
      toast.success("Utility type deleted successfully");
    } catch (error) {
      toast.error("Failed to delete utility type");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">Loading utility types...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-4 text-red-500">
        Error loading utility types
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Utility Types</CardTitle>
        <CardDescription>
          Manage utility types such as electricity, water, gas, etc.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={handleCreateDialogOpen}>
            <Plus className="mr-2 h-4 w-4" /> Add Utility Type
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Unit of Measure</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {utilityTypes && utilityTypes.length > 0 ? (
              utilityTypes.map((utilityType) => (
                <TableRow key={utilityType.id}>
                  <TableCell className="font-medium">
                    {utilityType.name}
                  </TableCell>
                  <TableCell>{utilityType.unitOfMeasure}</TableCell>
                  <TableCell>
                    <Badge
                      variant={utilityType.isActive ? "default" : "secondary"}
                    >
                      {utilityType.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDialogOpen(utilityType)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDialogOpen(utilityType)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No utility types found
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
            <DialogTitle>Add Utility Type</DialogTitle>
            <DialogDescription>
              Create a new utility type for tracking utilities.
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
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unitOfMeasure" className="text-right">
                  Unit of Measure
                </Label>
                <Input
                  id="unitOfMeasure"
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                  placeholder="kWh, m³, etc."
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Active
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Is this utility type active?
                  </label>
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
              <Button type="submit" disabled={createUtilityType.isPending}>
                {createUtilityType.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Utility Type</DialogTitle>
            <DialogDescription>
              Update the utility type details.
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
                <Label htmlFor="edit-unitOfMeasure" className="text-right">
                  Unit of Measure
                </Label>
                <Input
                  id="edit-unitOfMeasure"
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                  placeholder="kWh, m³, etc."
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-isActive" className="text-right">
                  Active
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox
                    id="edit-isActive"
                    checked={formData.isActive}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <label
                    htmlFor="edit-isActive"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Is this utility type active?
                  </label>
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
              <Button type="submit" disabled={updateUtilityType.isPending}>
                {updateUtilityType.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Utility Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this utility type? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUtilityType && (
              <p>
                You are about to delete the utility type:{" "}
                <strong>{selectedUtilityType.name}</strong>
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
              disabled={deleteUtilityType.isPending}
            >
              {deleteUtilityType.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
