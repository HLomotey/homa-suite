import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2, ChevronDown } from "lucide-react";
import {
  FrontendAssignment,
  AssignmentStatus,
  PaymentStatus,
} from "@/integration/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { FrontendExternalStaff } from "@/integration/supabase/types/external-staff";

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

  // IMPORTANT: this hook now paginates until **all** rows are fetched.
  const {
    externalStaff,
    loading,
    fetchAllExternalStaff,
    setStatus,
  } = useExternalStaff();

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

  // Search field state
  const [tenantSearchQuery, setTenantSearchQuery] = React.useState(
    assignment?.tenantName || ""
  );
  const [showTenantSuggestions, setShowTenantSuggestions] = React.useState(false);
  const [filteredStaff, setFilteredStaff] = React.useState<FrontendExternalStaff[]>([]);

  // Rooms filtered by selected property
  const filteredRooms = rooms.filter((room) => room.propertyId === formData.propertyId);

  // === Load ALL staff on mount, without status filter ===
  React.useEffect(() => {
    setStatus(null); // ensure we don't filter staff out
    fetchAllExternalStaff(); // paginated loop -> returns ALL rows in table
  }, [setStatus, fetchAllExternalStaff]);

  // Keep a fast, client-side filter for the suggestions box
  React.useEffect(() => {
    if (!tenantSearchQuery.trim()) {
      setFilteredStaff(externalStaff);
      return;
    }

    const q = tenantSearchQuery.toLowerCase().trim();
    const parts = q.split(/\s+/);

    const filtered = externalStaff.filter((staff) => {
      const firstName = (staff["PAYROLL FIRST NAME"] || "").toLowerCase();
      const lastName = (staff["PAYROLL LAST NAME"] || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      const reverseName = `${lastName} ${firstName}`.trim();
      const jobTitle = (staff["JOB TITLE"] || "").toLowerCase();
      const email = (staff["WORK E-MAIL"] || "").toLowerCase();
      const department = (staff["HOME DEPARTMENT"] || "").toLowerCase();
      const employeeId = (staff["EMPLOYEE ID"] || "").toLowerCase();
      const location = (staff["LOCATION"] || "").toLowerCase();
      const manager = (staff["MANAGER"] || "").toLowerCase();

      const blob =
        `${firstName} ${lastName} ${fullName} ${reverseName} ${jobTitle} ${email} ${department} ${employeeId} ${location} ${manager}`;

      const matchesAll = parts.every((p) =>
        blob.includes(p)
        || firstName.startsWith(p)
        || lastName.startsWith(p)
        || fullName.startsWith(p)
        || reverseName.startsWith(p)
      );

      return matchesAll;
    });

    filtered.sort((a, b) => {
      const aFull = `${(a["PAYROLL FIRST NAME"] || "").toLowerCase()} ${(a["PAYROLL LAST NAME"] || "").toLowerCase()}`.trim();
      const bFull = `${(b["PAYROLL FIRST NAME"] || "").toLowerCase()} ${(b["PAYROLL LAST NAME"] || "").toLowerCase()}`.trim();

      if (aFull === q && bFull !== q) return -1;
      if (bFull === q && aFull !== q) return 1;
      if (aFull.startsWith(q) && !bFull.startsWith(q)) return -1;
      if (bFull.startsWith(q) && !aFull.startsWith(q)) return 1;
      return aFull.localeCompare(bFull);
    });

    setFilteredStaff(filtered);
  }, [tenantSearchQuery, externalStaff]);

  // Handlers
  const handleTenantSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTenantSearchQuery(value);
    setFormData((prev) => ({ ...prev, tenantName: value }));
    setShowTenantSuggestions(true);
  };

  const handleTenantSuggestionSelect = (staff: FrontendExternalStaff) => {
    const firstName = staff["PAYROLL FIRST NAME"] || "";
    const lastName = staff["PAYROLL LAST NAME"] || "";
    const fullName = `${firstName} ${lastName}`.trim();

    setTenantSearchQuery(fullName);
    setFormData((prev) => ({
      ...prev,
      tenantName: fullName,
      tenantId: staff.id,
    }));
    setShowTenantSuggestions(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "propertyId") {
      const selectedProperty = properties.find((p) => p.id === value);
      setFormData((prev) => ({
        ...prev,
        propertyId: value,
        propertyName: selectedProperty?.title || "",
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
            {/* Tenant Name (type-to-search over ALL staff) */}
            <div>
              <label htmlFor="tenantName" className="text-sm font-medium leading-none">
                Tenant Name
              </label>
              {loading ? (
                <div className="flex items-center space-x-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading external staff...</span>
                </div>
              ) : (
                <div className="relative mt-2">
                  <Input
                    id="tenantName"
                    name="tenantName"
                    type="text"
                    value={tenantSearchQuery}
                    onChange={handleTenantSearchChange}
                    onFocus={() => setShowTenantSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTenantSuggestions(false), 200)}
                    placeholder="Type to search staff names..."
                    className="pr-8"
                    autoComplete="off"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  {showTenantSuggestions && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                      {(filteredStaff.length > 0 ? filteredStaff : externalStaff).map((staff) => {
                        const firstName = staff["PAYROLL FIRST NAME"] || "";
                        const lastName = staff["PAYROLL LAST NAME"] || "";
                        const jobTitle = staff["JOB TITLE"] || "";
                        const department = staff["HOME DEPARTMENT"] || "";
                        const fullName = `${firstName} ${lastName}`.trim();

                        return (
                          <div
                            key={staff.id}
                            className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground border-b border-border last:border-b-0"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleTenantSuggestionSelect(staff);
                            }}
                          >
                            <div className="font-medium">{fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              {jobTitle}{department && ` • ${department}`}
                            </div>
                          </div>
                        );
                      })}
                      {!externalStaff.length && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No staff found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Assigned Staff (optional) */}
            <div>
              <label htmlFor="staffId" className="text-sm font-medium leading-none">
                Assigned Staff (Optional)
              </label>
              {loading ? (
                <div className="flex items-center space-x-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading external staff...</span>
                </div>
              ) : (
                <div className="mt-2">
                  <SearchableSelect
                    options={externalStaff.map((staff): SearchableSelectOption => {
                      const firstName = staff["PAYROLL FIRST NAME"] || "";
                      const lastName = staff["PAYROLL LAST NAME"] || "";
                      const jobTitle = staff["JOB TITLE"] || "";
                      const email = staff["WORK E-MAIL"] || "";
                      const department = staff["HOME DEPARTMENT"] || "";
                      const employeeId = staff["EMPLOYEE ID"] || "";
                      const location = staff["LOCATION"] || "";
                      const manager = staff["MANAGER"] || "";
                      const fullName = `${firstName} ${lastName}`.trim();
                      const reverseName = `${lastName} ${firstName}`.trim();
                      const firstInitialLastName = firstName ? `${firstName[0]}. ${lastName}`.trim() : "";
                      const lastInitialFirstName = lastName ? `${lastName[0]}. ${firstName}`.trim() : "";
                      const initials = firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : "";

                      return {
                        value: staff.id,
                        label: `${fullName}${jobTitle ? ` - ${jobTitle}` : ""}${department ? ` (${department})` : ""}`,
                        searchText: `${firstName} ${lastName} ${fullName} ${reverseName} ${firstInitialLastName} ${lastInitialFirstName} ${initials} ${jobTitle} ${email} ${department} ${employeeId} ${location} ${manager}`,
                      };
                    })}
                    value={formData.staffId}
                    placeholder="Search and select external staff member..."
                    emptyMessage="No external staff members found."
                    onValueChange={(value) => {
                      const selectedStaff = externalStaff.find((s) => s.id === value);
                      setFormData((prev) => ({
                        ...prev,
                        staffId: value,
                        staffName: selectedStaff
                          ? `${selectedStaff["PAYROLL FIRST NAME"] || ""} ${selectedStaff["PAYROLL LAST NAME"] || ""}`.trim()
                          : "",
                      }));
                    }}
                  />
                </div>
              )}
            </div>

            {/* Property */}
            <div>
              <label htmlFor="propertyId" className="text-sm font-medium leading-none">
                Property
              </label>
              <div className="mt-2">
                <SearchableSelect
                  options={properties.map((property): SearchableSelectOption => {
                    const title = property.title || "";
                    const address = property.address || "";
                    const id = property.id || "";
                    return {
                      value: property.id,
                      label: `${title}${address ? ` - ${address}` : ""}`,
                      searchText: `${title} ${address} ${id}`,
                    };
                  })}
                  value={formData.propertyId}
                  placeholder="Search and select property..."
                  emptyMessage="No properties found."
                  onValueChange={(value) => {
                    const selectedProperty = properties.find((p) => p.id === value);
                    setFormData((prev) => ({
                      ...prev,
                      propertyId: value,
                      propertyName: selectedProperty?.title || "",
                      roomId: "",
                      roomName: "",
                    }));
                  }}
                />
              </div>
            </div>

            {/* Room */}
            <div>
              <label htmlFor="roomId" className="text-sm font-medium leading-none">
                Room
              </label>
              <div className="mt-2">
                <SearchableSelect
                  options={filteredRooms.map((room): SearchableSelectOption => ({
                    value: room.id,
                    label: room.name || "",
                    searchText: `${room.name || ""} ${room.id} ${room.propertyId}`,
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

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="text-sm font-medium leading-none">
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
                <label htmlFor="endDate" className="text-sm font-medium leading-none">
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

            {/* Rent + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="rentAmount" className="text-sm font-medium leading-none">
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
                <label htmlFor="status" className="text-sm font-medium leading-none">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label htmlFor="paymentStatus" className="text-sm font-medium leading-none">
                Payment Status
              </label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
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
