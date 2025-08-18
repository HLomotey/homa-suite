/**
 * InventoryItemForm component
 * Form for creating and editing inventory items
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";
import { FrontendInventoryItem } from "../../integration/supabase/types/inventory";
import { useCreateInventoryItem, useUpdateInventoryItem, useInventoryItem } from "../../hooks/inventory";

// Form schema validation
const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  minimumStockLevel: z.coerce.number().int().min(0, "Minimum stock level must be a positive number"),
});

type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

interface InventoryItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  itemId?: string; // If provided, we're editing an existing item
  onSuccess: () => void;
}

export function InventoryItemForm({
  isOpen,
  onClose,
  itemId,
  onSuccess,
}: InventoryItemFormProps) {
  const { toast } = useToast();
  const isEditing = !!itemId;
  
  // Hooks for API operations
  const { create, loading: createLoading } = useCreateInventoryItem();
  const { update, loading: updateLoading } = useUpdateInventoryItem();
  const { item, loading: itemLoading } = useInventoryItem(itemId || "");

  // Form setup
  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      unit: "",
      minimumStockLevel: 0,
    },
  });

  // Populate form when editing and item data is loaded
  useEffect(() => {
    if (isEditing && item) {
      form.reset({
        name: item.name,
        description: item.description || "",
        category: item.category || "",
        unit: item.unit,
        minimumStockLevel: item.minimumStockLevel,
      });
    }
  }, [form, isEditing, item]);

  // Form submission handler
  const onSubmit = async (values: InventoryItemFormValues) => {
    try {
      if (isEditing && itemId) {
        await update(itemId, values);
        toast({
          title: "Item updated",
          description: "The inventory item has been updated successfully.",
        });
      } else {
        await create(values);
        toast({
          title: "Item created",
          description: "The new inventory item has been created successfully.",
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} inventory item. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Loading state for the form
  const isLoading = createLoading || updateLoading || (isEditing && itemLoading);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this inventory item."
              : "Add a new item to your inventory."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Item name" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Item description (optional)"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Category (optional)"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., kg, pcs, liters" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="minimumStockLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Stock Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    The minimum quantity that should be maintained in stock.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
