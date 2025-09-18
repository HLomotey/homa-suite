/**
 * ItemQuickAdd component
 * Quick form for adding items on-the-fly during purchase orders, issuance, etc.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { Loader2, Package } from "lucide-react";
import { FrontendInventoryItem } from "../../integration/supabase/types/inventory";
import { useInventoryCategories, useCreateInventoryItem } from "../../hooks/inventory";

// Quick add form schema
const quickAddSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Please select a category"),
  sku: z.string().optional(),
  minimumStockLevel: z.coerce.number().min(0, "Minimum stock level must be 0 or greater").optional(),
});

type QuickAddFormValues = z.infer<typeof quickAddSchema>;

interface ItemQuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: FrontendInventoryItem) => void;
  prefilledData?: Partial<QuickAddFormValues>;
}

export function ItemQuickAdd({
  isOpen,
  onClose,
  onSuccess,
  prefilledData,
}: ItemQuickAddProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { categories, loading: categoriesLoading } = useInventoryCategories();
  const { create } = useCreateInventoryItem();
  const { toast } = useToast();

  const form = useForm<QuickAddFormValues>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: {
      name: prefilledData?.name || "",
      description: prefilledData?.description || "",
      categoryId: prefilledData?.categoryId || "",
      sku: prefilledData?.sku || "",
      minimumStockLevel: prefilledData?.minimumStockLevel || 0,
    },
  });

  const onSubmit = async (values: QuickAddFormValues) => {
    try {
      setIsSubmitting(true);

      // Create minimal item data for quick add
      const itemData = {
        name: values.name,
        description: values.description || null,
        categoryId: values.categoryId,
        sku: values.sku || null,
        barcode: null,
        serialNumber: null,
        
        // Stock Management - defaults for quick add
        totalQuantity: 0,
        availableQuantity: 0,
        issuedQuantity: 0,
        reservedQuantity: 0,
        minimumStockLevel: values.minimumStockLevel || 0,
        reorderPoint: null,
        
        // Pricing - defaults
        unitCost: null,
        unitPrice: null,
        currency: "USD",
        
        // Physical Properties - defaults
        weight: null,
        dimensionsLength: null,
        dimensionsWidth: null,
        dimensionsHeight: null,
        dimensionUnit: "cm",
        
        // Dates - defaults
        purchaseDate: null,
        warrantyExpiryDate: null,
        
        // References - defaults
        supplierId: null,
        location: null,
        tags: null,
        notes: null,
        imageUrls: null,
        
        // Metadata
        isActive: true,
        status: 'Available' as const,
        condition: 'New' as const,
        brand: null,
        model: null,
      };

      const newItem = await create(itemData);
      
      toast({
        title: "Item created",
        description: `${values.name} has been added to your inventory.`,
      });

      onSuccess(newItem);
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create inventory item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Quick Add Item
          </DialogTitle>
          <DialogDescription>
            Add a new inventory item quickly. You can edit more details later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Item Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the item"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Loading categories...</span>
                        </div>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SKU */}
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Stock Keeping Unit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Minimum Stock Level */}
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
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Item
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
