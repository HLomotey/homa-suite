import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2, ChevronDown, Home, Car, Plane, CreditCard, DollarSign } from "lucide-react";
import {
  FrontendAssignment,
  AssignmentStatus,
  PaymentStatus,
  SecurityDeposit,
} from "@/integration/supabase/types/assignment";
import { useToast } from "@/components/ui/use-toast";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { FrontendExternalStaff } from "@/integration/supabase/types/external-staff";
import { useAuth } from "@/contexts/AuthContext";
import { FrontendRoom } from "@/integration/supabase/types/room";

export interface AssignmentFormProps {
  assignment?: FrontendAssignment;
  onSave: (assignment: Omit<FrontendAssignment, "id">) => void;
  onCancel: () => void;
  properties: { id: string; title: string; address: string }[];
  rooms: { id: string; name: string; propertyId: string; rentAmount?: number }[];
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  assignment,
  onSave,
  onCancel,
  properties,
  rooms,
}) => {
  const { toast } = useToast();
  const { hasRole } = useAuth();

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
  });

  // Search field state
  const [tenantSearchQuery, setTenantSearchQuery] = React.useState(
    assignment?.tenantName || ""
  );
  const [showTenantSuggestions, setShowTenantSuggestions] = React.useState(false);
  const [filteredStaff, setFilteredStaff] = React.useState<FrontendExternalStaff[]>([]);
  
  // Track if current selections are valid
  const [isValidTenant, setIsValidTenant] = React.useState(!!assignment?.tenantId);
  const [isValidStaff, setIsValidStaff] = React.useState(!!assignment?.staffId);

  // Benefit agreement states
  const [housingAgreement, setHousingAgreement] = React.useState(false);
  const [transportationAgreement, setTransportationAgreement] = React.useState(false);
  const [flightAgreement, setFlightAgreement] = React.useState(false);
  const [busCardAgreement, setBusCardAgreement] = React.useState(false);

  // Rent amount override states
  const [isRentOverrideEnabled, setIsRentOverrideEnabled] = React.useState(false);
  const [originalRentAmount, setOriginalRentAmount] = React.useState(0);

  // Security deposits state for all benefit types
  const [securityDeposits, setSecurityDeposits] = React.useState<{
    housing?: SecurityDeposit;
    transportation?: SecurityDeposit;
    flight_agreement?: SecurityDeposit;
    bus_card?: SecurityDeposit;
  }>({});

  // Helper function to create a new security deposit
  const createSecurityDeposit = (benefitType: 'housing' | 'transportation' | 'flight_agreement' | 'bus_card'): SecurityDeposit => ({
    benefitType,
    totalAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    paidDate: "",
    notes: "",
    deductionSchedule: []
  });

  // Helper function to generate deduction schedule
  const generateDeductionSchedule = (totalAmount: number, startDate: string) => {
    if (totalAmount <= 0 || !startDate) return [];
    
    const deductionAmount = totalAmount / 4;
    const start = new Date(startDate);
    
    return Array.from({ length: 4 }, (_, index) => {
      const scheduledDate = new Date(start);
      scheduledDate.setDate(scheduledDate.getDate() + (14 * (index + 1))); // Bi-weekly
      
      return {
        deductionNumber: index + 1,
        scheduledDate: scheduledDate.toISOString().split('T')[0],
        amount: deductionAmount,
        status: 'scheduled' as const
      };
    });
  };

  // Update deduction schedules when amounts or start date change
  React.useEffect(() => {
    if (!formData.startDate) return;
    
    setSecurityDeposits(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        const benefitType = key as keyof typeof updated;
        const deposit = updated[benefitType];
        if (deposit && deposit.totalAmount > 0) {
          updated[benefitType] = {
            ...deposit,
            deductionSchedule: generateDeductionSchedule(deposit.totalAmount, formData.startDate)
          };
        }
      });
      return updated;
    });
  }, [formData.startDate]);

  // Rooms filtered by selected property
  const filteredRooms = rooms.filter((room) => room.propertyId === formData.propertyId);

  // Initialize rent amount when component mounts or assignment changes
  React.useEffect(() => {
    if (assignment) {
      // If editing existing assignment, check if rent was overridden
      const currentRoom = rooms.find(r => r.id === assignment.roomId);
      const roomRentAmount = currentRoom?.rentAmount || 0;
      setOriginalRentAmount(roomRentAmount);
      
      // If assignment rent differs from room rent, assume it was overridden
      if (assignment.rentAmount !== roomRentAmount && roomRentAmount > 0) {
        setIsRentOverrideEnabled(true);
      }
    }
  }, [assignment, rooms]);

  // === Load ALL staff on mount, without status filter ===
  React.useEffect(() => {
    console.log('AssignmentForm: Loading all external staff...');
    setStatus(null); // ensure we don't filter staff out
    fetchAllExternalStaff() // paginated loop -> returns ALL rows in table
      .then(() => {
        console.log('AssignmentForm: Successfully loaded all staff data');
      })
      .catch(error => {
        console.error('AssignmentForm: Error loading staff data:', error);
        toast({
          title: "Error",
          description: "Failed to load staff data. Please try again.",
          variant: "destructive",
        });
      });
  }, [setStatus, fetchAllExternalStaff]);

  // Optimized client-side filtering for large datasets
  React.useEffect(() => {
    console.log(`Filtering ${externalStaff.length} staff records...`);
    const startTime = performance.now();
    
    if (!tenantSearchQuery.trim()) {
      // Limit to first 1000 records for performance when showing all
      const limitedStaff = externalStaff.slice(0, 1000);
      setFilteredStaff(limitedStaff);
      console.log(`Showing first ${limitedStaff.length} records (no filter)`); 
      return;
    }

    const q = tenantSearchQuery.toLowerCase().trim();
    const parts = q.split(/\s+/).filter(p => p.length > 0);
    
    if (parts.length === 0) {
      const limitedStaff = externalStaff.slice(0, 1000);
      setFilteredStaff(limitedStaff);
      return;
    }
    
    // Use more efficient filtering approach
    let filtered = externalStaff;
    
    // Apply each search term to progressively filter the results
    for (const part of parts) {
      filtered = filtered.filter((staff) => {
        const firstName = (staff["PAYROLL FIRST NAME"] || "").toLowerCase();
        const lastName = (staff["PAYROLL LAST NAME"] || "").toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        
        // Check most common fields first for performance
        if (firstName.includes(part) || lastName.includes(part) || fullName.includes(part)) {
          return true;
        }
        
        // Only check these fields if the above didn't match
        const jobTitle = (staff["JOB TITLE"] || "").toLowerCase();
        const department = (staff["HOME DEPARTMENT"] || "").toLowerCase();
        const location = (staff["LOCATION"] || "").toLowerCase();
        
        return jobTitle.includes(part) || department.includes(part) || location.includes(part);
      });
      
      // Early exit if we've filtered down to a reasonable number
      if (filtered.length < 100) break;
    }

    // Sort results by relevance
    if (filtered.length > 0) {
      filtered.sort((a, b) => {
        const aFirst = (a["PAYROLL FIRST NAME"] || "").toLowerCase();
        const aLast = (a["PAYROLL LAST NAME"] || "").toLowerCase();
        const bFirst = (b["PAYROLL FIRST NAME"] || "").toLowerCase();
        const bLast = (b["PAYROLL LAST NAME"] || "").toLowerCase();
        const aFull = `${aFirst} ${aLast}`.trim();
        const bFull = `${bFirst} ${bLast}`.trim();
        
        // Exact matches first
        if (aFull === q && bFull !== q) return -1;
        if (bFull === q && aFull !== q) return 1;
        
        // Then starts with matches
        if (aFull.startsWith(q) && !bFull.startsWith(q)) return -1;
        if (bFull.startsWith(q) && !aFull.startsWith(q)) return 1;
        
        // Then last name matches
        if (aLast.startsWith(parts[0]) && !bLast.startsWith(parts[0])) return -1;
        if (bLast.startsWith(parts[0]) && !aLast.startsWith(parts[0])) return 1;
        
        // Then first name matches
        if (aFirst.startsWith(parts[0]) && !bFirst.startsWith(parts[0])) return -1;
        if (bFirst.startsWith(parts[0]) && !aFirst.startsWith(parts[0])) return 1;
        
        // Default to alphabetical
        return aFull.localeCompare(bFull);
      });
    }
    
    // Limit results if there are too many
    const finalResults = filtered.length > 1000 ? filtered.slice(0, 1000) : filtered;
    setFilteredStaff(finalResults);
    
    const endTime = performance.now();
    console.log(`Filtered to ${finalResults.length} records in ${(endTime - startTime).toFixed(2)}ms`);
  }, [tenantSearchQuery, externalStaff]);

  // Handlers
  const handleTenantSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTenantSearchQuery(value);
    setShowTenantSuggestions(true);
    
    // Check if the typed value matches any staff member exactly
    const matchingStaff = externalStaff.find(staff => {
      const firstName = staff["PAYROLL FIRST NAME"] || "";
      const lastName = staff["PAYROLL LAST NAME"] || "";
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName.toLowerCase() === value.toLowerCase();
    });
    
    if (matchingStaff) {
      setFormData((prev) => ({ 
        ...prev, 
        tenantName: value,
        tenantId: matchingStaff.id 
      }));
      setIsValidTenant(true);
    } else {
      // Clear tenant ID if no exact match
      setFormData((prev) => ({ 
        ...prev, 
        tenantName: value,
        tenantId: "" 
      }));
      setIsValidTenant(false);
    }
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
    setIsValidTenant(true);
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
      const roomRentAmount = selectedRoom?.rentAmount || 0;
      
      setFormData((prev) => ({
        ...prev,
        roomId: value,
        roomName: selectedRoom?.name || "",
        rentAmount: isRentOverrideEnabled ? prev.rentAmount : roomRentAmount,
      }));
      
      // Store original rent amount for override functionality
      setOriginalRentAmount(roomRentAmount);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "rentAmount" ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate tenant
    if (!formData.tenantId) {
      toast({
        title: "Validation Error",
        description: "Please select a tenant.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.staffId) {
      toast({
        title: "Validation Error", 
        description: "Please select a staff member.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.propertyId) {
      toast({
        title: "Validation Error",
        description: "Please select a property.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.roomId) {
      toast({
        title: "Validation Error",
        description: "Please select a room.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.startDate) {
      toast({
        title: "Validation Error",
        description: "Please select a start date.",
        variant: "destructive",
      });
      return;
    }

    // Validate that at least one benefit agreement is selected
    if (!housingAgreement && !transportationAgreement && !flightAgreement && !busCardAgreement) {
      toast({
        title: "Validation Error",
        description: "Please select at least one benefit agreement.",
        variant: "destructive",
      });
      return;
    }

    // Validate security deposits for selected benefit agreements
    const benefitValidations = [
      { agreement: housingAgreement, type: 'housing', label: 'Housing' },
      { agreement: transportationAgreement, type: 'transportation', label: 'Transportation' },
      { agreement: flightAgreement, type: 'flight_agreement', label: 'Flight Agreement' },
      { agreement: busCardAgreement, type: 'bus_card', label: 'Bus Card' }
    ];

    for (const { agreement, type, label } of benefitValidations) {
      if (agreement) {
        const deposit = securityDeposits[type as keyof typeof securityDeposits];
        if (!deposit || deposit.totalAmount <= 0) {
          toast({
            title: "Validation Error",
            description: `Please enter a security deposit amount for the ${label} agreement.`,
            variant: "destructive",
          });
          return;
        }

        // Validate deduction schedule totals match deposit amount
        if (deposit.deductionSchedule.length > 0) {
          const totalDeductions = deposit.deductionSchedule.reduce((sum, deduction) => sum + deduction.amount, 0);
          if (Math.abs(totalDeductions - deposit.totalAmount) > 0.01) {
            toast({
              title: "Validation Error",
              description: `${label} deduction schedule total must equal the security deposit amount.`,
              variant: "destructive",
            });
            return;
          }
        }
      }
    }

    // Final validation: ensure staff exists in external staff list (if provided)
    if (formData.staffId) {
      const staffExists = externalStaff.some(staff => staff.id === formData.staffId);
      if (!staffExists) {
        toast({
          title: "Validation Error",
          description: "Selected staff member is not valid. Please select from the available list.",
          variant: "destructive",
        });
        return;
      }
    }


    try {
      // Include agreement data and security deposit in the assignment
      const assignmentWithAgreements = {
        ...formData,
        agreements: {
          housing: housingAgreement,
          transportation: transportationAgreement,
          flight_agreement: flightAgreement,
          bus_card: busCardAgreement,
        },
        securityDeposits: Object.values(securityDeposits).filter(deposit => deposit && deposit.totalAmount > 0)
      };
      onSave(assignmentWithAgreements);
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
                      setIsValidStaff(!!selectedStaff);
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
                    const roomRentAmount = selectedRoom?.rentAmount || 0;
                    
                    setFormData((prev) => ({
                      ...prev,
                      roomId: value,
                      roomName: selectedRoom?.name || "",
                      rentAmount: isRentOverrideEnabled ? prev.rentAmount : roomRentAmount,
                    }));
                    
                    // Store original rent amount for override functionality
                    setOriginalRentAmount(roomRentAmount);
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
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="rentAmount" className="text-sm font-medium leading-none">
                    Rent Amount ($)
                  </label>
                  {hasRole("Properties Manager") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!isRentOverrideEnabled) {
                          setIsRentOverrideEnabled(true);
                          toast({
                            title: "Override Enabled",
                            description: "You can now modify the rent amount. Original amount: $" + originalRentAmount,
                          });
                        } else {
                          setIsRentOverrideEnabled(false);
                          setFormData(prev => ({ ...prev, rentAmount: originalRentAmount }));
                          toast({
                            title: "Override Disabled",
                            description: "Rent amount reset to original room rate: $" + originalRentAmount,
                          });
                        }
                      }}
                      className="text-xs"
                    >
                      {isRentOverrideEnabled ? "Reset" : "Override"}
                    </Button>
                  )}
                </div>
                <Input
                  id="rentAmount"
                  name="rentAmount"
                  type="number"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  className="mt-2"
                  min={0}
                  required
                  readOnly={!isRentOverrideEnabled && !hasRole("Properties Manager")}
                  disabled={!isRentOverrideEnabled && !hasRole("Properties Manager")}
                />
                {!hasRole("Properties Manager") && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Rent amount is automatically populated from room data. Contact Properties Manager to override.
                  </p>
                )}
                {isRentOverrideEnabled && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠ Override active. Original room rate: ${originalRentAmount}
                  </p>
                )}
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


            {/* Benefit Agreements Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div>
                <h3 className="text-sm font-medium leading-none mb-2">
                  Benefit Agreements (Optional)
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Select any benefit agreements that apply to this assignment. All agreements are optional.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="housing_agreement"
                    checked={housingAgreement}
                    onCheckedChange={(checked) => setHousingAgreement(checked as boolean)}
                  />
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-blue-600" />
                    <div>
                      <Label
                        htmlFor="housing_agreement"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Housing Agreement
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Agree to housing terms and conditions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="transportation_agreement"
                    checked={transportationAgreement}
                    onCheckedChange={(checked) => setTransportationAgreement(checked as boolean)}
                  />
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-green-600" />
                    <div>
                      <Label
                        htmlFor="transportation_agreement"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Transportation Agreement
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Agree to transportation terms and conditions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="flight_agreement"
                    checked={flightAgreement}
                    onCheckedChange={(checked) => setFlightAgreement(checked as boolean)}
                  />
                  <div className="flex items-center space-x-2">
                    <Plane className="h-4 w-4 text-purple-600" />
                    <div>
                      <Label
                        htmlFor="flight_agreement"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Flight Agreement
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Agree to flight benefit terms and conditions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="bus_card_agreement"
                    checked={busCardAgreement}
                    onCheckedChange={(checked) => setBusCardAgreement(checked as boolean)}
                  />
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-orange-600" />
                    <div>
                      <Label
                        htmlFor="bus_card_agreement"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Bus Card Agreement
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Agree to bus card benefit terms and conditions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agreement Status Indicator */}
              {(housingAgreement || transportationAgreement || flightAgreement || busCardAgreement) && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs text-green-700">
                    ✓ Agreement confirmed for: {[
                      housingAgreement && "Housing",
                      transportationAgreement && "Transportation", 
                      flightAgreement && "Flight Agreement",
                      busCardAgreement && "Bus Card"
                    ].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* Benefit Charge Forms */}
            <div className="space-y-4">
              {[
                { agreement: housingAgreement, type: 'housing', label: 'Housing', icon: Home, color: 'blue', isDeposit: true },
                { agreement: transportationAgreement, type: 'transportation', label: 'Transportation', icon: Car, color: 'green', isDeposit: false },
                { agreement: flightAgreement, type: 'flight_agreement', label: 'Flight Agreement', icon: Plane, color: 'purple', isDeposit: false },
                { agreement: busCardAgreement, type: 'bus_card', label: 'Bus Card', icon: CreditCard, color: 'orange', isDeposit: false }
              ].map(({ agreement, type, label, icon: Icon, color, isDeposit }) => {
                if (!agreement) return null;

                const benefitType = type as keyof typeof securityDeposits;
                const deposit = securityDeposits[benefitType];

                const updateDeposit = (updates: Partial<SecurityDeposit>) => {
                  setSecurityDeposits(prev => ({
                    ...prev,
                    [benefitType]: {
                      ...createSecurityDeposit(type as SecurityDeposit['benefitType']),
                      ...prev[benefitType],
                      ...updates,
                      deductionSchedule: updates.totalAmount 
                        ? generateDeductionSchedule(updates.totalAmount, formData.startDate)
                        : prev[benefitType]?.deductionSchedule || []
                    }
                  }));
                };

                return (
                  <div key={type} className={`p-4 border border-${color}-200 rounded-lg bg-${color}-50`}>
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-5 w-5 text-${color}-600`} />
                      <h3 className="text-sm font-medium leading-none">
                        {label} {isDeposit ? 'Security Deposit' : 'Charge Amount'}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      Enter the {isDeposit ? 'security deposit details' : 'charge amount details'} for the {label.toLowerCase()} agreement.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium leading-none">
                          {isDeposit ? 'Deposit Amount ($) *' : 'Charge Amount ($) *'}
                        </label>
                        <Input
                          type="number"
                          value={deposit?.totalAmount || 0}
                          onChange={(e) => updateDeposit({ totalAmount: Number(e.target.value) })}
                          className="mt-2"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium leading-none">
                          Payment Method
                        </label>
                        <select
                          value={deposit?.paymentMethod || 'cash'}
                          onChange={(e) => updateDeposit({ paymentMethod: e.target.value as SecurityDeposit['paymentMethod'] })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                        >
                          <option value="cash">Cash</option>
                          <option value="check">Check</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium leading-none">
                          Payment Date
                        </label>
                        <Input
                          type="date"
                          value={deposit?.paidDate || ""}
                          onChange={(e) => updateDeposit({ 
                            paidDate: e.target.value,
                            paymentStatus: e.target.value !== "" ? 'paid' : 'pending'
                          })}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          checked={deposit?.paymentStatus === 'paid'}
                          onCheckedChange={(checked) => updateDeposit({
                            paymentStatus: checked ? 'paid' : 'pending',
                            paidDate: checked ? deposit?.paidDate || new Date().toISOString().split("T")[0] : ""
                          })}
                        />
                        <Label className="text-sm font-medium cursor-pointer">
                          {isDeposit ? 'Deposit has been paid' : 'Charge has been paid'}
                        </Label>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-medium leading-none">
                        Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={deposit?.notes || ""}
                        onChange={(e) => updateDeposit({ notes: e.target.value })}
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                        placeholder={`Additional notes about the ${label.toLowerCase()} ${isDeposit ? 'security deposit' : 'charge'}...`}
                      />
                    </div>

                    {/* Bi-Weekly Deduction Schedule - Only for Housing Security Deposit */}
                    {isDeposit && deposit && deposit.totalAmount > 0 && deposit.deductionSchedule.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium leading-none mb-3">
                          Bi-Weekly Deduction Schedule
                        </h4>
                        <div className="space-y-2">
                          {deposit.deductionSchedule.map((deduction, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                              <div className="flex items-center space-x-3">
                                <span className="text-xs font-medium text-gray-600">
                                  Deduction #{deduction.deductionNumber}
                                </span>
                                <span className="text-sm">
                                  ${deduction.amount.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {deduction.scheduledDate}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  deduction.status === 'scheduled' 
                                    ? 'bg-blue-100 text-blue-700'
                                    : deduction.status === 'deducted'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {deduction.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          <p>• Deductions will be automatically processed bi-weekly from payroll</p>
                          <p>• Each deduction: ${(deposit.totalAmount / 4).toFixed(2)}</p>
                          <p>• Total recovery period: 8 weeks</p>
                        </div>
                      </div>
                    )}

                    {/* Status Indicator */}
                    {deposit && deposit.totalAmount > 0 && (
                      <div className={`mt-3 p-2 rounded-md ${
                        deposit.paymentStatus === 'paid' 
                          ? "bg-green-50 border border-green-200" 
                          : "bg-yellow-50 border border-yellow-200"
                      }`}>
                        <p className={`text-xs ${
                          deposit.paymentStatus === 'paid' ? "text-green-700" : "text-yellow-700"
                        }`}>
                          {deposit.paymentStatus === 'paid' 
                            ? `✓ ${label} ${isDeposit ? 'security deposit' : 'charge'} of $${deposit.totalAmount} has been paid${deposit.paidDate ? ` on ${deposit.paidDate}` : ""} via ${deposit.paymentMethod}`
                            : `⚠ ${label} ${isDeposit ? 'security deposit' : 'charge'} of $${deposit.totalAmount} is pending payment via ${deposit.paymentMethod}`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
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
