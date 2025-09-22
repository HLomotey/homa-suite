/**
 * Enhanced InventoryItemForm component
 * Comprehensive form for creating and editing inventory items with all required fields
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { 
  FrontendInventoryItem, 
  InventoryCategory, 
  InventoryCondition, 
  InventoryStatus 
} from "../../integration/supabase/types/inventory";
import { useCreateInventoryItem, useUpdateInventoryItem, useInventoryItem } from "../../hooks/inventory";

// Note: Categories are now loaded dynamically from the database
// This static list is kept as fallback for form validation
const FALLBACK_CATEGORIES = [
  'Furniture',
  'Appliances',
  'Electronics',
  'Bedding_Linens',
  'Kitchen_Utensils',
  'Cleaning_Supplies',
  'Bathroom_Fixtures',
  'Lighting',
  'Decor',
  'Safety_Equipment',
  'HVAC_Equipment',
  'Plumbing_Fixtures',
  'Tools_Hardware',
  'Office_Supplies',
  'Maintenance_Supplies',
  'Other'
];

// Inventory conditions for dropdown
const INVENTORY_CONDITIONS: InventoryCondition[] = [
  'New',
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Needs_Repair',
  'Damaged'
];

// Inventory statuses for dropdown
const INVENTORY_STATUSES: InventoryStatus[] = [
  'Available',
  'Issued',
  'Reserved',
  'Under_Repair',
  'Disposed',
  'Lost',
  'Stolen'
];

// Common units for dropdown
const COMMON_UNITS = [
  'pcs', 'set', 'pair', 'kg', 'g', 'lbs', 'oz',
  'liter', 'ml', 'gallon', 'bottle', 'box', 'pack',
  'roll', 'sheet', 'meter', 'feet', 'inch'
];

// Enhanced form schema validation
const enhancedInventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  minStockLevel: z.string().optional(),
  maxStockLevel: z.string().optional(),
  reorderPoint: z.string().optional(),
  reorderQuantity: z.string().optional(),
  unitCost: z.string().optional(),
  currentValue: z.string().optional(),
  purchaseDate: z.string().optional(),
  invoiceNumber: z.string().optional(),
  receiptNumber: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  condition: z.enum(INVENTORY_CONDITIONS as [InventoryCondition, ...InventoryCondition[]]),
  status: z.enum(INVENTORY_STATUSES as [InventoryStatus, ...InventoryStatus[]]),
  locationNotes: z.string().optional(),
  purchasePrice: z.string().optional(),
  warrantyInfo: z.string().optional(),
  notes: z.string().optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  isActive: z.boolean().optional(),
  images: z.any().optional(),
  specifications: z.string().optional(),
});

type EnhancedInventoryItemFormValues = z.infer<typeof enhancedInventoryItemSchema>;

interface EnhancedInventoryItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  itemId?: string;
  onSuccess: () => void;
}

export function EnhancedInventoryItemForm({
  isOpen,
  onClose,
  itemId,
  onSuccess,
}: EnhancedInventoryItemFormProps) {
  const { toast } = useToast();
  const isEditing = !!itemId;
  
  // State for tags management
  const [currentTag, setCurrentTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  
  // Hooks for API operations
  const { create, loading: createLoading } = useCreateInventoryItem();
  const { update, loading: updateLoading } = useUpdateInventoryItem();
  const { item, loading: itemLoading } = useInventoryItem(itemId || "");

  // Form setup
  const form = useForm<EnhancedInventoryItemFormValues>({
    resolver: zodResolver(enhancedInventoryItemSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      brand: "",
      model: "",
      sku: "",
      barcode: "",
      unit: "pcs",
      minStockLevel: "",
      maxStockLevel: "",
      reorderPoint: "",
      reorderQuantity: "",
      unitCost: "",
      currentValue: "",
      purchaseDate: "",
      invoiceNumber: "",
      receiptNumber: "",
      warrantyExpiry: "",
      condition: "New",
      status: "Available",
      locationNotes: "",
      purchasePrice: "",
      warrantyInfo: "",
      notes: "",
      tags: [],
      isActive: true,
      images: null,
      specifications: "",
    },
  });

  // Populate form when editing and item data is loaded
  useEffect(() => {
    if (isEditing && item) {
      form.reset({
        name: item.name,
        description: item.description || "",
        category: item?.categoryId || "",
        brand: item.brand || "",
        model: item.model || "",
        sku: item.sku || "",
        barcode: item.barcode || "",
        unit: "",
        minStockLevel: item?.minimumStockLevel?.toString() || "",
        maxStockLevel: "",
        reorderPoint: item?.reorderPoint?.toString() || "",
        reorderQuantity: "",
        unitCost: item.unitCost ? item.unitCost.toString() : "",
        currentValue: "",
        purchaseDate: item.purchaseDate || "",
        invoiceNumber: "",
        receiptNumber: "",
        warrantyExpiry: item.warrantyExpiryDate || "",
        condition: item.condition,
        status: item.status,
        locationNotes: item.location || "",
        purchasePrice: item.unitCost?.toString() || "",
        warrantyInfo: item.warrantyExpiryDate || "",
        notes: "",
        tags: item.tags || [],
        isActive: true,
        images: item.imageUrls,
        specifications: "",
      });
      setTags(item.tags || []);
    }
  }, [form, isEditing, item]);

  // Add tag function
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      const newTags = [...tags, currentTag.trim()];
      setTags(newTags);
      form.setValue("tags", newTags);
      setCurrentTag("");
    }
  };

  // Remove tag function
  const removeTag = (tagToRemove: string, index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
    form.setValue("tags", updatedTags);
  };

  // Form submission handler
  const onSubmit = async (values: EnhancedInventoryItemFormValues) => {
    try {
      // Parse specifications if provided
      let specifications = null;
      if (values.specifications?.trim()) {
        try {
          specifications = JSON.parse(values.specifications);
        } catch (e) {
          toast({
            title: "Invalid Specifications",
            description: "Specifications must be valid JSON format.",
            variant: "destructive",
          });
          return;
        }
      }

      // Prepare item data for API
      const itemData: Omit<FrontendInventoryItem, "id"> = {
        name: values.name || "",
        description: values.description || null,
        categoryId: values.category,
        sku: values.sku || null,
        barcode: values.barcode || null,
        brand: values.brand || null,
        model: values.model || null,
        serialNumber: null,
        
        // Stock Management
        totalQuantity: 0,
        availableQuantity: 0,
        issuedQuantity: 0,
        reservedQuantity: 0,
        minimumStockLevel: Number(values.minStockLevel) || 0,
        reorderPoint: Number(values.reorderPoint) || 0,
        
        // Pricing
        unitCost: Number(values.purchasePrice) || null,
        unitPrice: null,
        currency: "USD",
        
        // Physical Properties
        weight: null,
        dimensionsLength: null,
        dimensionsWidth: null,
        dimensionsHeight: null,
        dimensionUnit: "cm",
        
        // Condition and Status
        condition: values.condition,
        status: values.status,
        
        // Purchase Information
        supplierId: null,
        purchaseDate: values.purchaseDate || null,
        warrantyExpiryDate: values.warrantyInfo || null,
        
        // Additional Information
        location: values.notes || null,
        tags: Array.isArray(values.tags) ? values.tags : (typeof values.tags === 'string' ? values.tags.split(',').map(tag => tag.trim()) : []),
        notes: values.notes || null,
        imageUrls: values.images || null,
        
        // Metadata
        isActive: true,
      };

      if (isEditing && itemId) {
        await update(itemId, itemData);
        toast({
          title: "Item updated",
          description: "The inventory item has been updated successfully.",
        });
      } else {
        await create(itemData);
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Inventory Item" : "Add Inventory Item"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the details of this inventory item."
              : "Add a new item to your inventory with comprehensive details."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item name" {...field} disabled={isLoading} />
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
                        placeholder="Enter item description"
                        {...field}
                        disabled={isLoading}
                        rows={3}
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
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FALLBACK_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter subcategory" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter brand" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter model" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Identification Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Identification</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Auto-generated if empty" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormDescription>
                        Stock Keeping Unit (auto-generated if left empty)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter barcode" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Stock Management Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Stock Management</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMMON_UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minStockLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock Level *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxStockLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Stock Level</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Optional"
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
                  name="reorderPoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Point</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Optional"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Quantity at which to reorder
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Financial Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
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
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
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
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter invoice #" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receiptNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter receipt #" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Status & Condition Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status & Condition</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INVENTORY_CONDITIONS.map((condition) => (
                            <SelectItem key={condition} value={condition}>
                              {condition.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INVENTORY_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warrantyExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty Expiry</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <FormField
                control={form.control}
                name="locationNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter location or storage notes"
                        {...field}
                        disabled={isLoading}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags Section */}
              <div className="space-y-2">
                <FormLabel>Tags</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    disabled={isLoading}
                  />
                  <Button type="button" onClick={addTag} size="sm" disabled={isLoading}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag, index)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="specifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specifications (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"color": "blue", "dimensions": "10x20x5", "weight": "2kg"}'
                        {...field}
                        disabled={isLoading}
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter specifications in JSON format (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="mt-8">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Item" : "Create Item"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
