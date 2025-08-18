/**
 * SupplierForm component
 * Form for creating and editing inventory suppliers
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
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";
import { FrontendInventorySupplier } from "../../integration/supabase/types/inventory";
import { 
  createInventorySupplier, 
  updateInventorySupplier, 
  fetchInventorySuppliers 
} from "../../hooks/inventory/api";

// Form schema validation
const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId?: string; // If provided, we're editing an existing supplier
  onSuccess: () => void;
}

export function SupplierForm({
  isOpen,
  onClose,
  supplierId,
  onSuccess,
}: SupplierFormProps) {
  const { toast } = useToast();
  const isEditing = !!supplierId;
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  const [supplier, setSupplier] = useState<FrontendInventorySupplier | null>(null);

  // Fetch supplier data when editing
  useEffect(() => {
    const fetchSupplier = async () => {
      if (isEditing && supplierId) {
        setIsLoading(true);
        try {
          const suppliers = await fetchInventorySuppliers();
          const foundSupplier = suppliers.find(s => s.id === supplierId);
          if (foundSupplier) {
            setSupplier(foundSupplier);
          }
        } catch (error) {
          console.error("Error fetching supplier:", error);
          toast({
            title: "Error",
            description: "Failed to load supplier data. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSupplier();
  }, [isEditing, supplierId, toast]);

  // Form setup
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  // Populate form when editing and supplier data is loaded
  useEffect(() => {
    if (isEditing && supplier) {
      form.reset({
        name: supplier.name,
        contactPerson: supplier.contactPerson || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
      });
    }
  }, [form, isEditing, supplier]);

  // Form submission handler
  const onSubmit = async (values: SupplierFormValues) => {
    try {
      const supplierData = {
        ...values,
        name: values.name || "", // Ensure name is not undefined
        contactPerson: values.contactPerson || null,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
      };
      
      if (isEditing && supplierId) {
        await updateInventorySupplier(supplierId, supplierData);
        toast({
          title: "Supplier updated",
          description: "The supplier has been updated successfully.",
        });
      } else {
        await createInventorySupplier(supplierData);
        toast({
          title: "Supplier created",
          description: "The new supplier has been created successfully.",
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} supplier. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Supplier" : "Add Supplier"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the details of this supplier."
              : "Add a new supplier to your inventory system."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Supplier name" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Contact person name" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Supplier address"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
