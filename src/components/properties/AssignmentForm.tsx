import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2 } from "lucide-react";
import {
  FrontendAssignment,
  AssignmentStatus,
  PaymentStatus,
} from "@/integration/supabase/types";
import { FrontendTenant } from "@/integration/supabase/types/tenant";
import { useTenants } from "@/hooks/tenant";
import { useToast } from "@/components/ui/use-toast";
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select";
import { useStaff } from "@/hooks/billing/useStaff";

// Assignment Form Component
export interface AssignmentFormProps {
  assignment?: FrontendAssignment;
  onSave: (assignment: Omit<FrontendAssignment, "id">) => void;
  onCancel: () => void;
  properties: { id: string; title: string; address: string }[];
  rooms: { id: string; name: string; propertyId: string }[];
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  assignment,
  onSave,
  onCancel,
  properties,
  rooms,
}) => {
  const { toast } = useToast();
  const { tenants, loading: loadingTenants } = useTenants();
  const { staff, loading: loadingStaff } = useStaff();

  const [formData, setFormData] = React.useState<
    Omit<FrontendAssignment, "id">
  >({
    tenantName: assignment?.tenantName || "",
    tenantId: assignment?.tenantId || "",
    propertyId: assignment?.propertyId || properties[0]?.id || "",
    propertyName: assignment?.propertyName || properties[0]?.title || "",
    roomId: assignment?.roomId || "",
    roomName: assignment?.roomName || "",
    staffId: assignment?.staffId || "",
    staffName: assignment?.staffName || "",
    status: assignment?.status || ("Active" as AssignmentStatus),
    startDate: assignment?.startDate || new Date().toISOString().split("T")[0],
    endDate: assignment?.endDate || "",
    rentAmount: assignment?.rentAmount || 0,
    paymentStatus: assignment?.paymentStatus || ("Paid" as PaymentStatus),
  });

  // Filter rooms based on selected property
  const filteredRooms = rooms.filter(
    (room) => room.propertyId === formData.propertyId
  );

  // Debug logs
  React.useEffect(() => {
    console.log("AssignmentForm - Properties:", properties);
    console.log("AssignmentForm - Rooms:", rooms);
    console.log("AssignmentForm - Filtered Rooms:", filteredRooms);
  }, [properties, rooms, filteredRooms]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "propertyId") {
      const selectedProperty = properties.find((p) => p.id === value);
      setFormData((prev) => ({
        ...prev,
        propertyId: value,
        propertyName: selectedProperty?.title || "",
        // Clear room selection when property changes
        roomId: "",
        roomName: "",
      }));
    } else if (name === "roomId") {
      const selectedRoom = rooms.find((r) => r.id === value);
      setFormData((prev) => ({
        ...prev,
        roomId: value,
        roomName: selectedRoom?.name || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "rentAmount" ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.propertyId) {
      toast({
        title: "Validation Error",
        description: "Please select a property",
        variant: "destructive",
      });
      return;
    }

    if (!formData.roomId) {
      toast({
        title: "Validation Error",
        description: "Please select a room",
        variant: "destructive",
      });
      return;
    }

    // Submit form
    try {
      onSave(formData);
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast({
        title: "Error",
        description: "Failed to save assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-semibold">
          {assignment ? "Edit Assignment" : "Add New Assignment"}
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="tenantId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Tenant
              </label>
              {loadingTenants ? (
                <div className="flex items-center space-x-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading tenants...</span>
                </div>
              ) : (
                <div className="mt-2">
                  <SearchableSelect
                    options={tenants.map((tenant): SearchableSelectOption => ({
                      value: tenant.id,
                      label: `${tenant.firstName || ''} ${tenant.lastName || ''} - ${tenant.email || ''}`,
                      searchText: `${tenant.firstName || ''} ${tenant.lastName || ''} ${tenant.email || ''} ${tenant.phone || ''}`
                    }))}
                    value={formData.tenantId}
                    placeholder="Search and select tenant..."
                    emptyMessage="No tenants found."
                    onValueChange={(value) => {
                      const selectedTenant = tenants.find((t) => t.id === value);
                      if (selectedTenant) {
                        setFormData((prev) => ({
                          ...prev,
                          tenantId: selectedTenant.id,
                          tenantName: `${selectedTenant.firstName} ${selectedTenant.lastName}`,
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          tenantId: "",
                          tenantName: "",
                        }));
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="propertyId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Property
              </label>
              <div className="mt-2">
                <SearchableSelect
                  options={properties.map((property): SearchableSelectOption => ({
                    value: property.id,
                    label: `${property.title || ''} - ${property.address || ''}`,
                    searchText: `${property.title || ''} ${property.address || ''}`
                  }))}
                  value={formData.propertyId}
                  placeholder="Search and select property..."
                  emptyMessage="No properties found."
                  onValueChange={(value) => {
                    const selectedProperty = properties.find((p) => p.id === value);
                    setFormData((prev) => ({
                      ...prev,
                      propertyId: value,
                      propertyName: selectedProperty?.title || "",
                      // Clear room selection when property changes
                      roomId: "",
                      roomName: "",
                    }));
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="roomId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Room
              </label>
              <div className="mt-2">
                <SearchableSelect
                  options={filteredRooms.map((room): SearchableSelectOption => ({
                    value: room.id,
                    label: room.name || '',
                    searchText: room.name || ''
                  }))}
                  value={formData.roomId}
                  placeholder={!formData.propertyId ? "Select a property first..." : "Search and select room..."}
                  emptyMessage={!formData.propertyId ? "Please select a property first." : "No rooms found."}
                  disabled={!formData.propertyId}
                  onValueChange={(value) => {
                    const selectedRoom = filteredRooms.find((r) => r.id === value);
                    setFormData((prev) => ({
                      ...prev,
                      roomId: value,
                      roomName: selectedRoom?.name || "",
                    }));
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="staffId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Assigned Staff (Optional)
              </label>
              {loadingStaff ? (
                <div className="flex items-center space-x-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading staff...</span>
                </div>
              ) : (
                <div className="mt-2">
                  <SearchableSelect
                    options={staff.map((staffMember): SearchableSelectOption => ({
                      value: staffMember.id,
                      label: `${staffMember.name || ''} - ${staffMember.department || ''}`,
                      searchText: `${staffMember.name || ''} ${staffMember.department || ''}`
                    }))}
                    value={formData.staffId}
                    placeholder="Search and select staff member..."
                    emptyMessage="No staff members found."
                    onValueChange={(value) => {
                      const selectedStaff = staff.find((s) => s.id === value);
                      setFormData((prev) => ({
                        ...prev,
                        staffId: value,
                        staffName: selectedStaff?.name || "",
                      }));
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Start Date
                </label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  End Date
                </label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="mt-2"
                  min={formData.startDate}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="rentAmount"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Rent Amount ($)
                </label>
                <Input
                  id="rentAmount"
                  name="rentAmount"
                  type="number"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  className="mt-2"
                  min={0}
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
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="paymentStatus"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Payment Status
              </label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save Assignment</Button>
      </div>
    </div>
  );
};

export default AssignmentForm;
