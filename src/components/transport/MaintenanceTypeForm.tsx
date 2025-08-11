import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { FrontendMaintenanceType, MaintenanceCategory } from "@/integration/supabase/types/maintenance-type";
import { SheetTitle, SheetDescription } from "@/components/ui/sheet";

// Maintenance Type Form Component
export interface MaintenanceTypeFormProps {
  maintenanceType?: FrontendMaintenanceType;
  onSave: (maintenanceType: Omit<FrontendMaintenanceType, "id">) => void;
  onCancel: () => void;
}

export const MaintenanceTypeForm: React.FC<MaintenanceTypeFormProps> = ({
  maintenanceType,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = React.useState<Omit<FrontendMaintenanceType, "id">>({
    name: maintenanceType?.name || "",
    description: maintenanceType?.description || "",
    category: maintenanceType?.category || "Routine",
    estimatedCost: maintenanceType?.estimatedCost || 0,
    estimatedDuration: maintenanceType?.estimatedDuration || 1,
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
        name === "estimatedCost" || name === "estimatedDuration"
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
            {maintenanceType ? "Edit Maintenance Type" : "Add New Maintenance Type"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {maintenanceType 
              ? "Update the details for this maintenance type." 
              : "Fill in the details to create a new maintenance type."}
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
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-2"
                rows={3}
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              >
                {(['Routine', 'Repair', 'Emergency', 'Inspection', 'Upgrade'] as MaintenanceCategory[]).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="estimatedCost"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Estimated Cost ($)
                </label>
                <Input
                  id="estimatedCost"
                  name="estimatedCost"
                  type="number"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  className="mt-2"
                  min={0}
                  step={0.01}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="estimatedDuration"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Estimated Duration (hours)
                </label>
                <Input
                  id="estimatedDuration"
                  name="estimatedDuration"
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={handleChange}
                  className="mt-2"
                  min={0.25}
                  step={0.25}
                  required
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save Maintenance Type</Button>
      </div>
    </div>
  );
};

export default MaintenanceTypeForm;
