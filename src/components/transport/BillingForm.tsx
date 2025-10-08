import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { 
  FrontendTransportBilling, 
  FrontendBillingPeriod,
  TransportBillingStatus 
} from "@/integration/supabase/types/billing";
import { useTransportStaff } from "@/hooks/transport/useTransport";
import { useBillingPeriod } from "@/hooks/transport/useBillingPeriod";
import { useVehicles } from "@/hooks/transport/useTransport";
import { FrontendVehicle } from "@/integration/supabase/types/transport";

// Location data - would ideally come from a hook but using static data for now
const locations = [
  { id: "loc-1", name: "Main Campus" },
  { id: "loc-2", name: "East Wing" },
  { id: "loc-3", name: "West Wing" },
];

// Form schema
const formSchema = z.object({
  billingPeriodId: z.string().min(1, "Billing period is required"),
  staffId: z.string().min(1, "Staff is required"),
  locationId: z.string().min(1, "Location is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().optional(),
  status: z.enum(["Draft", "Pending", "Paid", "Overdue", "Cancelled"]),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  paidDate: z.date().optional().nullable(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BillingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data?: Omit<FrontendTransportBilling, "id">) => void;
  editingBilling?: FrontendTransportBilling | null;
}

export function BillingForm({
  open,
  onOpenChange,
  onSuccess,
  editingBilling,
}: BillingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch data using hooks
  const { staff, loading: staffLoading } = useTransportStaff();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { billingPeriods, loading: periodsLoading } = useBillingPeriod();
  
  // Initialize form with default values or editing values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editingBilling
      ? {
          billingPeriodId: editingBilling.billingPeriodId,
          staffId: editingBilling.staffId,
          locationId: editingBilling.locationId,
          vehicleId: editingBilling.vehicleId,
          amount: editingBilling.amount,
          description: editingBilling.description || "",
          status: editingBilling.status,
          dueDate: new Date(editingBilling.dueDate),
          paidDate: editingBilling.paidDate ? new Date(editingBilling.paidDate) : null,
          paymentReference: editingBilling.paymentReference || "",
          notes: editingBilling.notes || "",
        }
      : {
          billingPeriodId: "",
          staffId: "",
          locationId: "",
          vehicleId: "",
          amount: 0,
          description: "",
          status: "Draft" as TransportBillingStatus,
          dueDate: new Date(),
          paidDate: null,
          paymentReference: "",
          notes: "",
        },
  });
  
  // Reset form when editing billing changes
  useEffect(() => {
    if (editingBilling) {
      form.reset({
        billingPeriodId: editingBilling.billingPeriodId,
        staffId: editingBilling.staffId,
        locationId: editingBilling.locationId,
        vehicleId: editingBilling.vehicleId,
        amount: editingBilling.amount,
        description: editingBilling.description || "",
        status: editingBilling.status,
        dueDate: new Date(editingBilling.dueDate),
        paidDate: editingBilling.paidDate ? new Date(editingBilling.paidDate) : null,
        paymentReference: editingBilling.paymentReference || "",
        notes: editingBilling.notes || "",
      });
    } else {
      form.reset({
        billingPeriodId: "",
        staffId: "",
        locationId: "",
        vehicleId: "",
        amount: 0,
        description: "",
        status: "Draft" as TransportBillingStatus,
        dueDate: new Date(),
        paidDate: null,
        paymentReference: "",
        notes: "",
      });
    }
  }, [editingBilling, form]);

  // Watch status field to conditionally show paid date and reference
  const watchStatus = form.watch("status");
  const showPaymentFields = watchStatus === "Paid";

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Transform form data to match API expectations if needed
      const billingData: Omit<FrontendTransportBilling, "id"> = {
        billingPeriodId: data.billingPeriodId,
        staffId: data.staffId,
        locationId: data.locationId,
        vehicleId: data.vehicleId,
        amount: data.amount,
        description: data.description,
        status: data.status,
        dueDate: data.dueDate.toISOString(),
        paidDate: data.paidDate ? data.paidDate.toISOString() : undefined,
        paymentReference: data.paymentReference,
        notes: data.notes,
        // Add additional fields with display information
        billingPeriodName: billingPeriods.find(p => p.id === data.billingPeriodId)?.name || "",
        staffName: staff.find(s => s.id === data.staffId)?.name || "",
        locationName: locations.find(l => l.id === data.locationId)?.name || "",
        vehicleInfo: vehicles.find(v => v.id === data.vehicleId)?.plateNumber || "",
      };
      
      // Submit the data via the parent component's handler
      onSuccess(billingData);
      
      // Form handling is now done by the parent component
      setIsSubmitting(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting billing:", error);
      toast({
        title: "Error",
        description: `Failed to ${editingBilling ? "update" : "create"} billing. Please try again.`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-black/90 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>
            {editingBilling ? "Edit Billing Entry" : "Create Billing Entry"}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {editingBilling
              ? "Update the billing entry details below."
              : "Enter the details for the new billing entry."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billingPeriodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Period</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-black/50 border-white/20">
                          <SelectValue placeholder="Select billing period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black/90 border-white/20">
                        {periodsLoading ? (
                          <SelectItem value="loading">Loading periods...</SelectItem>
                        ) : billingPeriods.length > 0 ? (
                          billingPeriods.map((period) => (
                            <SelectItem key={period.id} value={period.id}>
                              {period.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none">No billing periods available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-black/50 border-white/20">
                          <SelectValue placeholder="Select staff" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black/90 border-white/20">
                        {staffLoading ? (
                          <SelectItem value="loading">Loading staff...</SelectItem>
                        ) : staff.length > 0 ? (
                          staff.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none">No staff available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-black/50 border-white/20">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black/90 border-white/20">
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
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
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-black/50 border-white/20">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black/90 border-white/20">
                        {vehiclesLoading ? (
                          <SelectItem value="loading">Loading vehicles...</SelectItem>
                        ) : vehicles.length > 0 ? (
                          vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.model} ({vehicle.plateNumber})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none">No vehicles available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        className="bg-black/50 border-white/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-black/50 border-white/20">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black/90 border-white/20">
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal bg-black/50 border-white/20 ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-black/90 border-white/20" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showPaymentFields && (
                <>
                  <FormField
                    control={form.control}
                    name="paidDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Payment Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal bg-black/50 border-white/20 ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-black/90 border-white/20" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Reference</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., PAY-123456"
                            {...field}
                            className="bg-black/50 border-white/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description"
                      {...field}
                      className="bg-black/50 border-white/20"
                    />
                  </FormControl>
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
                      placeholder="Additional notes"
                      {...field}
                      className="bg-black/50 border-white/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-white/20"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingBilling ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
