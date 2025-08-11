import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { FrontendVehicle, VehicleStatus } from "@/integration/supabase/types/vehicle";
import { SheetTitle, SheetDescription } from "@/components/ui/sheet";

// Vehicle Form Component
export interface VehicleFormProps {
  vehicle?: FrontendVehicle;
  onSave: (vehicle: Omit<FrontendVehicle, "id">) => void;
  onCancel: () => void;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  onSave,
  onCancel,
}) => {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = React.useState<Omit<FrontendVehicle, "id">>({
    state: vehicle?.state || "",
    address: vehicle?.address || "",
    make: vehicle?.make || "",
    model: vehicle?.model || "",
    vin: vehicle?.vin || "",
    year: vehicle?.year || currentYear,
    color: vehicle?.color || "",
    licensePlate: vehicle?.licensePlate || "",
    status: vehicle?.status || "Active",
    purchaseDate: vehicle?.purchaseDate || new Date().toISOString().split("T")[0],
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
        name === "year"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <SheetTitle className="text-lg font-semibold">
            {vehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {vehicle ? "Update the details for this vehicle." : "Fill in the details to create a new vehicle."}
          </SheetDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="make"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Make
                </label>
                <Input
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="model"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Model
                </label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="vin"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                VIN
              </label>
              <Input
                id="vin"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="year"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Year
                </label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  className="mt-2"
                  min={1900}
                  max={currentYear + 1}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="color"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Color
                </label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="licensePlate"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  License Plate
                </label>
                <Input
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="state"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  State
                </label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
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
                  {(['Active', 'Inactive', 'Maintenance', 'Sold'] as VehicleStatus[]).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Address
              </label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="purchaseDate"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Purchase Date
              </label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save Vehicle</Button>
      </div>
    </div>
  );
};

export default VehicleForm;
