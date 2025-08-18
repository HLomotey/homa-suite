/**
 * TransactionForm component
 * Form for creating inventory transactions (receive, issue, adjust)
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
import { Loader2 } from "lucide-react";
import { 
  useInventoryItems, 
  useCreateInventoryTransaction, 
  useInventoryStockByProperty 
} from "../../hooks/inventory";
import { 
  FrontendInventoryItem, 
  InventoryTransactionType 
} from "../../integration/supabase/types/inventory";

// Form schema validation
const transactionSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  transactionType: z.enum(["received", "issued", "adjusted"] as const),
  quantity: z.coerce.number().int().positive("Quantity must be a positive number"),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  initialItemId?: string; // Optional: pre-select an item
  onSuccess: () => void;
}

export function TransactionForm({
  isOpen,
  onClose,
  propertyId,
  initialItemId,
  onSuccess,
}: TransactionFormProps) {
  const { toast } = useToast();
  const { items, loading: itemsLoading } = useInventoryItems();
  const { stock, loading: stockLoading } = useInventoryStockByProperty(propertyId);
  const { create, loading: createLoading } = useCreateInventoryTransaction();
  const [selectedItem, setSelectedItem] = useState<FrontendInventoryItem | null>(null);
  const [currentStock, setCurrentStock] = useState<number>(0);

  // Form setup
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      itemId: initialItemId || "",
      transactionType: "received",
      quantity: 1,
      notes: "",
    },
  });

  // Watch for changes to itemId and transactionType
  const watchItemId = form.watch("itemId");
  const watchTransactionType = form.watch("transactionType");

  // Update selected item and current stock when itemId changes
  useEffect(() => {
    if (watchItemId && items) {
      const item = items.find(i => i.id === watchItemId);
      setSelectedItem(item || null);
      
      if (stock) {
        const stockItem = stock.find(s => s.itemId === watchItemId);
        setCurrentStock(stockItem?.quantity || 0);
      }
    }
  }, [watchItemId, items, stock]);

  // Set initial item if provided
  useEffect(() => {
    if (initialItemId && isOpen) {
      form.setValue("itemId", initialItemId);
    }
  }, [initialItemId, form, isOpen]);

  // Form submission handler
  const onSubmit = async (values: TransactionFormValues) => {
    try {
      await create({
        propertyId,
        itemId: values.itemId,
        transactionType: values.transactionType,
        quantity: values.quantity,
        notes: values.notes,
        createdBy: "system", // Default value for now, can be updated with actual user ID
      });
      
      toast({
        title: "Transaction created",
        description: "The inventory transaction has been recorded successfully.",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create inventory transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Loading state for the form
  const isLoading = itemsLoading || stockLoading || createLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Inventory Transaction</DialogTitle>
          <DialogDescription>
            Record a new inventory transaction for this property.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading || !!initialItemId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedItem && (
              <div className="text-sm text-muted-foreground">
                Current stock: {currentStock} {selectedItem.unit}
              </div>
            )}

            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                      <SelectItem value="adjusted">Adjusted</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {watchTransactionType === "received"
                      ? "Add items to inventory"
                      : watchTransactionType === "issued"
                      ? "Remove items from inventory"
                      : "Adjust inventory count"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  {watchTransactionType === "issued" && currentStock < field.value && (
                    <p className="text-sm text-red-500">
                      Warning: This will result in negative stock
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Transaction notes (optional)"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
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
                Create Transaction
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
