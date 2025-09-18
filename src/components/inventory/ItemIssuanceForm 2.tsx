/**
 * ItemIssuanceForm component
 * Form for issuing inventory items to properties
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
import { Loader2, Package, Building } from "lucide-react";
import { FrontendInventoryItem, FrontendInventoryPropertyIssuance, InventoryCondition } from "../../integration/supabase/types/inventory";
import { supabase } from "../../integration/supabase/client";
import { Property, FrontendProperty, mapDatabasePropertyToFrontend } from "../../integration/supabase/types/property";
import { useInventoryItems } from "../../hooks/inventory";
import { useProperties } from "../../hooks/property/useProperties";

// Form validation schema
const issuanceSchema = z.object({
  itemId: z.string().min(1, "Please select an item"),
  propertyId: z.string().min(1, "Please select a property"),
  quantityIssued: z.coerce.number().min(1, "Quantity must be at least 1"),
  issuedToPerson: z.string().optional(),
  purpose: z.string().optional(),
  locationAtProperty: z.string().optional(),
  expectedReturnDate: z.string().optional(),
  conditionAtIssuance: z.enum(['New', 'Excellent', 'Good', 'Fair', 'Poor', 'Needs_Repair', 'Damaged'] as const),
  notes: z.string().optional(),
});

type IssuanceFormValues = z.infer<typeof issuanceSchema>;

interface ItemIssuanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedItemId?: string;
  preSelectedPropertyId?: string;
}

export function ItemIssuanceForm({
  isOpen,
  onClose,
  onSuccess,
  preSelectedItemId,
  preSelectedPropertyId,
}: ItemIssuanceFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Load data
  const { items } = useInventoryItems();
  const { properties } = useProperties();

  // Filter available items (only those with available quantity > 0)
  const availableItems = items.filter(item => item.availableQuantity > 0);

  // Form setup
  const form = useForm<IssuanceFormValues>({
    resolver: zodResolver(issuanceSchema),
    defaultValues: {
      itemId: preSelectedItemId || "",
      propertyId: preSelectedPropertyId || "",
      quantityIssued: 1,
      issuedToPerson: "",
      purpose: "",
      locationAtProperty: "",
      expectedReturnDate: "",
      conditionAtIssuance: "Good",
      notes: "",
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        itemId: preSelectedItemId || "",
        propertyId: preSelectedPropertyId || "",
        quantityIssued: 1,
        issuedToPerson: "",
        purpose: "",
        locationAtProperty: "",
        expectedReturnDate: "",
        conditionAtIssuance: "Good",
        notes: "",
      });
    }
  }, [isOpen, form, preSelectedItemId, preSelectedPropertyId]);

  // Get selected item details
  const selectedItemId = form.watch("itemId");
  const selectedItem = availableItems.find(item => item.id === selectedItemId);
  const maxQuantity = selectedItem?.availableQuantity || 0;

  // Form submission handler
  const onSubmit = async (values: IssuanceFormValues) => {
    setIsLoading(true);
    try {
      // TODO: Implement item issuance API call
      console.log('Issue item:', values);
      
      toast({
        title: "Item issued successfully",
        description: `${values.quantityIssued} ${selectedItem?.name} issued to property.`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to issue item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Issue Item to Property
          </SheetTitle>
          <SheetDescription>
            Issue inventory items from global stock to a specific property.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            {/* Item Selection */}
            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item to issue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{item.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              Available: {item.availableQuantity}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Property Selection */}
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {property.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantityIssued"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={maxQuantity}
                      placeholder="Enter quantity to issue"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {selectedItem && `Available: ${maxQuantity} ${selectedItem.name}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Issued To Person */}
            <FormField
              control={form.control}
              name="issuedToPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issued To (Person)</FormLabel>
                  <FormControl>
                    <Input placeholder="Name of person receiving items" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Purpose */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Input placeholder="Reason for issuing items" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location at Property */}
            <FormField
              control={form.control}
              name="locationAtProperty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location at Property</FormLabel>
                  <FormControl>
                    <Input placeholder="Where items will be located" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expected Return Date */}
            <FormField
              control={form.control}
              name="expectedReturnDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Return Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Condition at Issuance */}
            <FormField
              control={form.control}
              name="conditionAtIssuance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition at Issuance *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                      <SelectItem value="Needs_Repair">Needs Repair</SelectItem>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this issuance"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Issue Item
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
