import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { FrontendMaintenanceTransaction, TransactionStatus } from "@/integration/supabase/types/maintenance-transaction";
import { FrontendVehicle } from "@/integration/supabase/types/vehicle";
import { FrontendMaintenanceType } from "@/integration/supabase/types/maintenance-type";
import { SheetTitle, SheetDescription } from "@/components/ui/sheet";

// Maintenance Transaction Form Component
export interface MaintenanceTransactionFormProps {
  transaction?: FrontendMaintenanceTransaction;
  onSave: (transaction: Omit<FrontendMaintenanceTransaction, "id" | "vehicleInfo" | "maintenanceTypeName">) => void;
  onCancel: () => void;
  vehicles: FrontendVehicle[];
  maintenanceTypes: FrontendMaintenanceType[];
}

export const MaintenanceTransactionForm: React.FC<MaintenanceTransactionFormProps> = ({
  transaction,
  onSave,
  onCancel,
  vehicles,
  maintenanceTypes,
}) => {
  const [formData, setFormData] = React.useState<Omit<FrontendMaintenanceTransaction, "id" | "vehicleInfo" | "maintenanceTypeName">>({
    vehicleId: transaction?.vehicleId || (vehicles[0]?.id || ""),
    maintenanceTypeId: transaction?.maintenanceTypeId || (maintenanceTypes[0]?.id || ""),
    date: transaction?.date || new Date().toISOString().split("T")[0],
    issue: transaction?.issue || "",
    amount: transaction?.amount || 0,
    notes: transaction?.notes || "",
    performedBy: transaction?.performedBy || "",
    status: transaction?.status || "Scheduled",
    receiptUrl: transaction?.receiptUrl || null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]:
        name === "amount"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Get vehicle display name (year + make + model + license plate)
  const getVehicleDisplayName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return "Unknown Vehicle";
    return `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <SheetTitle className="text-lg font-semibold">
            {transaction ? "Edit Maintenance Record" : "Add New Maintenance Record"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {transaction 
              ? "Update the details for this maintenance record." 
              : "Fill in the details to create a new maintenance record."}
          </SheetDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="vehicleId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Vehicle
              </label>
              <select
                id="vehicleId"
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                required
              >
                {vehicles && vehicles.length > 0 ? (
                  vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {getVehicleDisplayName(vehicle.id)}
                    </option>
                  ))
                ) : (
                  <option value="">No vehicles available</option>
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="maintenanceTypeId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Maintenance Type
              </label>
              <select
                id="maintenanceTypeId"
                name="maintenanceTypeId"
                value={formData.maintenanceTypeId}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                required
              >
                {maintenanceTypes && maintenanceTypes.length > 0 ? (
                  maintenanceTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} - ${type.estimatedCost.toFixed(2)}
                    </option>
                  ))
                ) : (
                  <option value="">No maintenance types available</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="date"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Date
                </label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                >
                  {(['Scheduled', 'In Progress', 'Completed', 'Cancelled'] as TransactionStatus[]).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="issue"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Issue
              </label>
              <Input
                id="issue"
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Amount ($)
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                className="mt-2"
                min={0}
                step={0.01}
                required
              />
            </div>

            <div>
              <label
                htmlFor="performedBy"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Performed By
              </label>
              <Input
                id="performedBy"
                name="performedBy"
                value={formData.performedBy}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Notes
              </label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <label
                htmlFor="receiptUrl"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Receipt URL (optional)
              </label>
              <Input
                id="receiptUrl"
                name="receiptUrl"
                value={formData.receiptUrl || ""}
                onChange={handleChange}
                className="mt-2"
                placeholder="https://example.com/receipt.pdf"
              />
            </div>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save Maintenance Record</Button>
      </div>
    </div>
  );
};

export default MaintenanceTransactionForm;
