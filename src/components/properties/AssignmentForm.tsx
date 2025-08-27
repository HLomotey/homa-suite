import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2, ChevronDown } from "lucide-react";
import {
  FrontendAssignment,
  AssignmentStatus,
  PaymentStatus,
} from "@/integration/supabase/types";
import { FrontendTenant } from "@/integration/supabase/types/tenant";
import { useToast } from "@/components/ui/use-toast";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { FrontendExternalStaff } from "@/integration/supabase/types/external-staff";

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
  const { externalStaff, loading, fetchAllExternalStaff, setStatus } =
    useExternalStaff();

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

  // State for tenant name search functionality
  const [tenantSearchQuery, setTenantSearchQuery] = React.useState(
    assignment?.tenantName || ""
  );
  const [showTenantSuggestions, setShowTenantSuggestions] =
    React.useState(false);
  const [filteredStaff, setFilteredStaff] = React.useState<
    FrontendExternalStaff[]
  >([]);

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

  // Fetch all external staff without status filtering on component mount
  React.useEffect(() => {
    // Remove status filtering to show all staff regardless of status
    setStatus(null);
    // Fetch all external staff without pagination limits for unrestricted search
    fetchAllExternalStaff();
  }, [setStatus]);

  // Debug logging for external staff data
  React.useEffect(() => {
    console.log("AssignmentForm - External Staff Data:", externalStaff);
    // Check if Afua is in the data
    const afuaStaff = externalStaff.filter(
      (staff) =>
        (staff["PAYROLL FIRST NAME"] || "").toLowerCase().includes("afua") ||
        (staff["PAYROLL LAST NAME"] || "").toLowerCase().includes("afua")
    );
    console.log("AssignmentForm - Afua Staff Found:", afuaStaff);
  }, [externalStaff]);

  // Enhanced filter staff based on tenant search query with comprehensive wildcard search
  React.useEffect(() => {
    if (!tenantSearchQuery.trim()) {
      setFilteredStaff([]);
      return;
    }

    const query = tenantSearchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/); // Split query into individual words for better matching
    
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
      
      // Create comprehensive searchable text
      const searchableText = `${firstName} ${lastName} ${fullName} ${reverseName} ${jobTitle} ${email} ${department} ${employeeId} ${location} ${manager}`.toLowerCase();
      
      // Enhanced wildcard search - check if ALL query words match any part of the staff information
      const matchesAllWords = queryWords.every(word => 
        searchableText.includes(word) ||
        firstName.includes(word) ||
        lastName.includes(word) ||
        fullName.includes(word) ||
        reverseName.includes(word) ||
        jobTitle.includes(word) ||
        email.includes(word) ||
        department.includes(word) ||
        employeeId.includes(word) ||
        location.includes(word) ||
        manager.includes(word)
      );
      
      // Also check for partial matches and fuzzy matching
      const matchesQuery = 
        matchesAllWords ||
        searchableText.includes(query) ||
        firstName.startsWith(query) ||
        lastName.startsWith(query) ||
        fullName.startsWith(query) ||
        reverseName.startsWith(query);
        
      return matchesQuery;
    });

    // Sort results by relevance - exact matches first, then partial matches
    const sortedFiltered = filtered.sort((a, b) => {
      const aFirstName = (a["PAYROLL FIRST NAME"] || "").toLowerCase();
      const aLastName = (a["PAYROLL LAST NAME"] || "").toLowerCase();
      const aFullName = `${aFirstName} ${aLastName}`.trim();
      
      const bFirstName = (b["PAYROLL FIRST NAME"] || "").toLowerCase();
      const bLastName = (b["PAYROLL LAST NAME"] || "").toLowerCase();
      const bFullName = `${bFirstName} ${bLastName}`.trim();
      
      // Prioritize exact name matches
      if (aFullName === query && bFullName !== query) return -1;
      if (bFullName === query && aFullName !== query) return 1;
      
      // Then prioritize starts with matches
      if (aFullName.startsWith(query) && !bFullName.startsWith(query)) return -1;
      if (bFullName.startsWith(query) && !aFullName.startsWith(query)) return 1;
      
      // Finally sort alphabetically
      return aFullName.localeCompare(bFullName);
    });

    setFilteredStaff(sortedFiltered); // Show all matching suggestions without limits
  }, [tenantSearchQuery, externalStaff]);

  // Handle tenant name input change
  const handleTenantSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTenantSearchQuery(value);
    setFormData((prev) => ({ ...prev, tenantName: value }));
    setShowTenantSuggestions(value.trim().length > 0);
  };

  // Handle tenant suggestion selection
  const handleTenantSuggestionSelect = (staff: FrontendExternalStaff) => {
    const firstName = staff["PAYROLL FIRST NAME"] || "";
    const lastName = staff["PAYROLL LAST NAME"] || "";
    const fullName = `${firstName} ${lastName}`.trim();

    setTenantSearchQuery(fullName);
    setFormData((prev) => ({
      ...prev,
      tenantName: fullName,
      tenantId: staff.id, // Optionally set tenant ID if needed
    }));
    setShowTenantSuggestions(false);
  };

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
                htmlFor="tenantName"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
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
                    onFocus={() =>
                      setShowTenantSuggestions(
                        tenantSearchQuery.trim().length > 0
                      )
                    }
                    onBlur={() => {
                      // Delay hiding suggestions to allow for selection
                      setTimeout(() => setShowTenantSuggestions(false), 200);
                    }}
                    placeholder="Type to search staff names..."
                    className="pr-8"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  {/* Suggestions dropdown */}
                  {showTenantSuggestions && filteredStaff.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredStaff.map((staff) => {
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
                              e.preventDefault(); // Prevent input blur
                              handleTenantSuggestionSelect(staff);
                            }}
                          >
                            <div className="font-medium">{fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              {jobTitle}
                              {department && ` • ${department}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* No results message */}
                  {showTenantSuggestions &&
                    tenantSearchQuery.trim().length > 0 &&
                    filteredStaff.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3">
                        <div className="text-sm text-muted-foreground">
                          No staff members found matching "{tenantSearchQuery}"
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="staffId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
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
                    options={externalStaff.map(
                      (staff): SearchableSelectOption => {
                        const firstName = staff["PAYROLL FIRST NAME"] || "";
                        const lastName = staff["PAYROLL LAST NAME"] || "";
                        const jobTitle = staff["JOB TITLE"] || "";
                        const email = staff["WORK E-MAIL"] || "";
                        const department = staff["HOME DEPARTMENT"] || "";
                        const employeeId = staff["EMPLOYEE ID"] || "";
                        const location = staff["LOCATION"] || "";
                        const manager = staff["MANAGER"] || "";

                        // Create comprehensive variations for enhanced search matching
                        const fullName = `${firstName} ${lastName}`.trim();
                        const reverseName = `${lastName} ${firstName}`.trim();
                        const firstInitialLastName = firstName
                          ? `${firstName[0]}. ${lastName}`.trim()
                          : "";
                        const lastInitialFirstName = lastName
                          ? `${lastName[0]}. ${firstName}`.trim()
                          : "";

                        // Additional variations for comprehensive search
                        const firstNameOnly = firstName.trim();
                        const lastNameOnly = lastName.trim();
                        const initials = firstName && lastName 
                          ? `${firstName[0]}${lastName[0]}`.toUpperCase()
                          : "";

                        return {
                          value: staff.id,
                          label: `${firstName} ${lastName}${jobTitle ? ` - ${jobTitle}` : ""}${department ? ` (${department})` : ""}`,
                          searchText: `${firstName} ${lastName} ${fullName} ${reverseName} ${firstInitialLastName} ${lastInitialFirstName} ${firstNameOnly} ${lastNameOnly} ${initials} ${jobTitle} ${email} ${department} ${employeeId} ${location} ${manager}`,
                        };
                      }
                    )}
                    value={formData.staffId}
                    placeholder="Search and select external staff member..."
                    emptyMessage="No external staff members found."
                    onValueChange={(value) => {
                      const selectedStaff = externalStaff.find(
                        (s) => s.id === value
                      );
                      setFormData((prev) => ({
                        ...prev,
                        staffId: value,
                        staffName: selectedStaff
                          ? `${selectedStaff["PAYROLL FIRST NAME"] || ""} ${
                              selectedStaff["PAYROLL LAST NAME"] || ""
                            }`.trim()
                          : "",
                      }));
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
                  options={properties.map(
                    (property): SearchableSelectOption => {
                      const title = property.title || "";
                      const address = property.address || "";
                      const id = property.id || "";
                      
                      // Create comprehensive search text for properties
                      const titleWords = title.toLowerCase().split(/\s+/);
                      const addressWords = address.toLowerCase().split(/\s+/);
                      const allWords = [...titleWords, ...addressWords].join(" ");
                      
                      return {
                        value: property.id,
                        label: `${title}${address ? ` - ${address}` : ""}`,
                        searchText: `${title} ${address} ${allWords} ${id}`,
                      };
                    }
                  )}
                  value={formData.propertyId}
                  placeholder="Search and select property..."
                  emptyMessage="No properties found."
                  onValueChange={(value) => {
                    const selectedProperty = properties.find(
                      (p) => p.id === value
                    );
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
                  options={filteredRooms.map(
                    (room): SearchableSelectOption => {
                      const name = room.name || "";
                      const id = room.id || "";
                      const propertyId = room.propertyId || "";
                      
                      // Create comprehensive search text for rooms
                      const nameWords = name.toLowerCase().split(/\s+/);
                      const allWords = nameWords.join(" ");
                      
                      return {
                        value: room.id,
                        label: name,
                        searchText: `${name} ${allWords} ${id} ${propertyId}`,
                      };
                    }
                  )}
                  value={formData.roomId}
                  placeholder={
                    !formData.propertyId
                      ? "Select a property first..."
                      : "Search and select room..."
                  }
                  emptyMessage={
                    !formData.propertyId
                      ? "Please select a property first."
                      : "No rooms found."
                  }
                  disabled={!formData.propertyId}
                  onValueChange={(value) => {
                    const selectedRoom = filteredRooms.find(
                      (r) => r.id === value
                    );
                    setFormData((prev) => ({
                      ...prev,
                      roomId: value,
                      roomName: selectedRoom?.name || "",
                    }));
                  }}
                />
              </div>
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
