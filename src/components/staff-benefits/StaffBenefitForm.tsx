import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Loader2, Home, Car, Plane, CreditCard } from "lucide-react";
import {
  FrontendStaffBenefit,
  StaffBenefitFormData,
  BenefitType,
  BenefitStatus,
} from "@/integration/supabase/types/staff-benefits";
import { FrontendExternalStaff } from "@/integration/supabase/types/external-staff";
import { useToast } from "@/components/ui/use-toast";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { useStaffBenefits } from "@/hooks/staff-benefits/useStaffBenefits";

export interface StaffBenefitFormProps {
  benefit?: FrontendStaffBenefit;
  onSave: (data: StaffBenefitFormData) => void;
  onCancel: () => void;
}

export const StaffBenefitForm: React.FC<StaffBenefitFormProps> = ({
  benefit,
  onSave,
  onCancel,
}) => {
  const { toast } = useToast();

  // Load external staff with active status filter for validation
  const {
    externalStaff,
    loading: staffLoading,
    fetchAllExternalStaff,
    setStatus,
  } = useExternalStaff();

  // Locations/useStaffBenefits stays unchanged
  const { staffLocations, loading: locationsLoading } = useStaffBenefits();

  // Debug logging
  console.log('StaffBenefitForm - staff data:', externalStaff);
  console.log('StaffBenefitForm - staffLoading:', staffLoading);
  console.log('StaffBenefitForm - staff is array:', Array.isArray(externalStaff));
  console.log('StaffBenefitForm - staff length:', externalStaff?.length);
  
  // Ensure staff is an array before filtering
  const staffArray = Array.isArray(externalStaff) ? externalStaff : [];
  console.log('StaffBenefitForm - staff termination dates:', staffArray.map(s => s["TERMINATION DATE"]));
  
  // Filter active staff - those without termination dates
  const activeStaff = staffArray.filter(member => 
    !member["TERMINATION DATE"] || member["TERMINATION DATE"] === null || member["TERMINATION DATE"] === ""
  );
  
  console.log('StaffBenefitForm - activeStaff:', activeStaff);
  console.log('StaffBenefitForm - activeStaff length:', activeStaff.length);

  // Search function for active staff only
  const searchStaff = (searchTerm: string) => {
    if (!searchTerm.trim()) return activeStaff || [];
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return (activeStaff || []).filter(
      (member) =>
        (member["PAYROLL FIRST NAME"] || "").toLowerCase().includes(lowercaseSearch) ||
        (member["PAYROLL LAST NAME"] || "").toLowerCase().includes(lowercaseSearch) ||
        (member["JOB TITLE"] || "").toLowerCase().includes(lowercaseSearch) ||
        (member["HOME DEPARTMENT"] || "").toLowerCase().includes(lowercaseSearch) ||
        (member["WORK E-MAIL"] || "").toLowerCase().includes(lowercaseSearch) ||
        (member["EMPLOYEE ID"] || "").toLowerCase().includes(lowercaseSearch) ||
        (member["LOCATION"] || "").toLowerCase().includes(lowercaseSearch)
    );
  };

  const [formData, setFormData] = useState<StaffBenefitFormData>(() => ({
    staff_id: benefit?.staff_id || "",
    staff_location_id: benefit?.staff_location_id || "",
    benefit_type: (benefit?.benefit_type as BenefitType) || "housing",
    status: (benefit?.status as BenefitStatus) || "pending",
    effective_date:
      benefit?.effective_date || new Date().toISOString().split("T")[0],
    expiry_date: benefit?.expiry_date || "",
    notes: benefit?.notes || "",
  }));

  const [housingRequired, setHousingRequired] = useState<boolean>(false);
  const [transportationRequired, setTransportationRequired] =
    useState<boolean>(false);
  const [flightAgreementRequired, setFlightAgreementRequired] =
    useState<boolean>(false);
  const [busCardRequired, setBusCardRequired] = useState<boolean>(false);

  // Search UI state
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>("");
  const [showStaffSuggestions, setShowStaffSuggestions] =
    useState<boolean>(false);
  const [filteredStaff, setFilteredStaff] = useState<FrontendExternalStaff[]>(
    []
  );

  // Load ALL staff on mount (no status restriction initially, then filter client-side)
  useEffect(() => {
    setStatus(null);
    fetchAllExternalStaff();
  }, [setStatus, fetchAllExternalStaff]);

  // Client-side filter for active staff only
  useEffect(() => {
    const q = staffSearchQuery.trim().toLowerCase();

    if (!q) {
      setFilteredStaff(activeStaff);
      return;
    }

    const filtered = searchStaff(q);

    // Relevance sort
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
  }, [staffSearchQuery, activeStaff]);

  const handleBenefitTypeChange = (type: BenefitType, checked: boolean) => {
    if (type === "housing") setHousingRequired(checked);
    if (type === "transportation") setTransportationRequired(checked);
    if (type === "flight_agreement") setFlightAgreementRequired(checked);
    if (type === "bus_card") setBusCardRequired(checked);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStaffSelect = (staff: FrontendExternalStaff) => {
    setFormData((prev) => ({
      ...prev,
      staff_id: staff.id,
      staff_location_id: "",
    }));
    setStaffSearchQuery(
      `${staff["PAYROLL FIRST NAME"] || ""} ${staff["PAYROLL LAST NAME"] || ""}`
    );
    setShowStaffSuggestions(false);
  };

  const validateForm = (): boolean => {
    if (!formData.staff_id) {
      toast({
        title: "Validation Error",
        description: "Please select a staff member",
        variant: "destructive",
      });
      return false;
    }

    // Validate that selected staff exists in external staff table
    const selectedStaff = externalStaff.find(s => s.id === formData.staff_id);
    if (!selectedStaff) {
      toast({
        title: "Validation Error",
        description: "Selected staff member is not found in the external staff table. Please select a valid staff member from the dropdown.",
        variant: "destructive",
      });
      return false;
    }

    // Additional validation: ensure the search query matches the selected staff
    const expectedName = `${selectedStaff["PAYROLL FIRST NAME"] || ""} ${selectedStaff["PAYROLL LAST NAME"] || ""}`.trim();
    if (staffSearchQuery.trim() !== expectedName) {
      toast({
        title: "Validation Error",
        description: "Please select a staff member from the dropdown. Manual entry is not allowed.",
        variant: "destructive",
      });
      return false;
    }

    // Additional validation: ensure staff is active (no termination date)
    if (selectedStaff["TERMINATION DATE"] && selectedStaff["TERMINATION DATE"] !== null && selectedStaff["TERMINATION DATE"] !== "") {
      toast({
        title: "Validation Error",
        description: "Selected staff member is not active (has termination date). Please select an active staff member.",
        variant: "destructive",
      });
      return false;
    }

    if (!housingRequired && !transportationRequired && !flightAgreementRequired && !busCardRequired) {
      toast({
        title: "Validation Error",
        description:
          "Please select at least one allocation type (housing, transportation, flight agreement, or bus card).",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const benefitsToCreate: StaffBenefitFormData[] = [];
      if (housingRequired)
        benefitsToCreate.push({
          ...formData,
          benefit_type: "housing",
        } as StaffBenefitFormData);
      if (transportationRequired)
        benefitsToCreate.push({
          ...formData,
          benefit_type: "transportation",
        } as StaffBenefitFormData);
      if (flightAgreementRequired)
        benefitsToCreate.push({
          ...formData,
          benefit_type: "flight_agreement",
        } as StaffBenefitFormData);
      if (busCardRequired)
        benefitsToCreate.push({
          ...formData,
          benefit_type: "bus_card",
        } as StaffBenefitFormData);

      for (const b of benefitsToCreate) {
        await onSave(b);
      }

      const benefitTypes = [];
      if (housingRequired) benefitTypes.push("housing");
      if (transportationRequired) benefitTypes.push("transportation");
      if (flightAgreementRequired) benefitTypes.push("flight agreement");
      if (busCardRequired) benefitTypes.push("bus card");

      toast({
        title: "Success",
        description: `${benefitTypes.join(", ")} allocation${
          benefitsToCreate.length > 1 ? "s" : ""
        } ${benefit ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      console.error("Error saving staff benefit:", error);
      toast({
        title: "Error",
        description:
          "Failed to save benefit allocation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedStaff = externalStaff.find((s) => s.id === formData.staff_id);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Staff Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Staff Information</CardTitle>
              <CardDescription>
                Select the staff member who requires housing and transport
                allocation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff_search">Staff Member *</Label>
                <div className="relative">
                  <Input
                    id="staff_search"
                    type="text"
                    placeholder="Search staff by name, email, department, job title, or ID..."
                    value={staffSearchQuery}
                    onChange={(e) => {
                      setStaffSearchQuery(e.target.value);
                      setShowStaffSuggestions(true);
                      
                      // Clear staff selection if user is typing (not selecting from dropdown)
                      // This ensures staff can only be selected from the dropdown
                      if (formData.staff_id) {
                        const currentStaff = externalStaff.find(s => s.id === formData.staff_id);
                        const expectedName = currentStaff ? 
                          `${currentStaff["PAYROLL FIRST NAME"] || ""} ${currentStaff["PAYROLL LAST NAME"] || ""}`.trim() : "";
                        
                        if (e.target.value !== expectedName) {
                          setFormData(prev => ({ ...prev, staff_id: "", staff_location_id: "" }));
                        }
                      }
                    }}
                    onFocus={() => setShowStaffSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowStaffSuggestions(false), 200)
                    }
                    className="w-full"
                    autoComplete="off"
                  />
                  {staffLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}

                  {/* Active staff suggestions with immediate feedback */}
                  {showStaffSuggestions && !staffLoading && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-72 overflow-auto">
                      {Array.isArray(activeStaff) && activeStaff.length > 0 ? (
                        staffSearchQuery.trim() ? (
                          searchStaff(staffSearchQuery).length > 0 ? (
                            searchStaff(staffSearchQuery).map((staff) => {
                              const firstName = staff["PAYROLL FIRST NAME"] || "";
                              const lastName = staff["PAYROLL LAST NAME"] || "";
                              const email = staff["WORK E-MAIL"] || "";
                              const dept = staff["HOME DEPARTMENT"] || "";
                              const job = staff["JOB TITLE"] || "";
                              return (
                                <div
                                  key={staff.id}
                                  className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b border-border last:border-b-0"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleStaffSelect(staff);
                                  }}
                                >
                                  <div className="font-medium">
                                    {`${firstName} ${lastName}`.trim()}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {email}
                                    {dept ? ` • ${dept}` : ""}
                                    {job ? ` • ${job}` : ""}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border-red-200">
                              <div className="font-medium">Staff not found</div>
                              <div className="text-xs mt-1">
                                No active staff member matches "{staffSearchQuery}". Please check the spelling or try a different search term.
                              </div>
                            </div>
                          )
                        ) : (
                          // Show all active staff when no search query
                          activeStaff.slice(0, 10).map((staff) => {
                            const firstName = staff["PAYROLL FIRST NAME"] || "";
                            const lastName = staff["PAYROLL LAST NAME"] || "";
                            const email = staff["WORK E-MAIL"] || "";
                            const dept = staff["HOME DEPARTMENT"] || "";
                            const job = staff["JOB TITLE"] || "";
                            return (
                              <div
                                key={staff.id}
                                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b border-border last:border-b-0"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleStaffSelect(staff);
                                }}
                              >
                                <div className="font-medium">
                                  {`${firstName} ${lastName}`.trim()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {email}
                                  {dept ? ` • ${dept}` : ""}
                                  {job ? ` • ${job}` : ""}
                                </div>
                              </div>
                            );
                          })
                        )
                      ) : (
                        <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border-red-200">
                          <div className="font-medium">No active staff available</div>
                          <div className="text-xs mt-1">
                            No active staff members found in the external staff table.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {staffLoading && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Loading staff...
                    </p>
                  )}
                </div>

                {/* Selected Staff */}
                {selectedStaff && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="font-medium text-blue-900">{`${
                      selectedStaff["PAYROLL FIRST NAME"] || ""
                    } ${selectedStaff["PAYROLL LAST NAME"] || ""}`}</div>
                    <div className="text-sm text-blue-700">
                      {selectedStaff["WORK E-MAIL"]} •{" "}
                      {selectedStaff["HOME DEPARTMENT"]} •{" "}
                      {selectedStaff["JOB TITLE"]}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Allocation Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Allocation Requirements
              </CardTitle>
              <CardDescription>
                Select the allocation types required
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="housing_required"
                    checked={housingRequired}
                    onCheckedChange={(checked) =>
                      handleBenefitTypeChange("housing", checked as boolean)
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label
                        htmlFor="housing_required"
                        className="text-base font-medium cursor-pointer"
                      >
                        Housing Allocation
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Staff requires housing accommodation
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="transportation_required"
                    checked={transportationRequired}
                    onCheckedChange={(checked) =>
                      handleBenefitTypeChange(
                        "transportation",
                        checked as boolean
                      )
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-green-600" />
                    <div>
                      <Label
                        htmlFor="transportation_required"
                        className="text-base font-medium cursor-pointer"
                      >
                        Transport Allocation
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Staff requires transportation support
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="flight_agreement_required"
                    checked={flightAgreementRequired}
                    onCheckedChange={(checked) =>
                      handleBenefitTypeChange("flight_agreement", checked as boolean)
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <Plane className="h-5 w-5 text-purple-600" />
                    <div>
                      <Label
                        htmlFor="flight_agreement_required"
                        className="text-base font-medium cursor-pointer"
                      >
                        Flight Agreement
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Staff requires flight agreement benefits
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="bus_card_required"
                    checked={busCardRequired}
                    onCheckedChange={(checked) =>
                      handleBenefitTypeChange("bus_card", checked as boolean)
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                    <div>
                      <Label
                        htmlFor="bus_card_required"
                        className="text-base font-medium cursor-pointer"
                      >
                        Bus Card Allocation
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Staff requires bus card benefits
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="effective_date">Effective Date *</Label>
                  <Input
                    id="effective_date"
                    name="effective_date"
                    type="date"
                    value={formData.effective_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    name="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    min={formData.effective_date}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional notes about the benefit requirement..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {benefit ? "Update Allocation" : "Create Allocation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffBenefitForm;
