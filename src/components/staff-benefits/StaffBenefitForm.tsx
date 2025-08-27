import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Loader2, Home, Car } from "lucide-react";
import {
  FrontendStaffBenefit,
  StaffBenefitFormData,
  BenefitType,
  BenefitStatus
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

  // FULL staff list (no status filter)
  const { externalStaff, loading: staffLoading, fetchAllExternalStaff, setStatus } = useExternalStaff();

  // Locations/useStaffBenefits stays unchanged
  const { staffLocations, loading: locationsLoading } = useStaffBenefits();

  const [formData, setFormData] = useState<StaffBenefitFormData>(() => ({
    staff_id: benefit?.staff_id || "",
    staff_location_id: benefit?.staff_location_id || "",
    benefit_type: (benefit?.benefit_type as BenefitType) || "housing",
    status: (benefit?.status as BenefitStatus) || "pending",
    effective_date: benefit?.effective_date || new Date().toISOString().split("T")[0],
    expiry_date: benefit?.expiry_date || "",
    notes: benefit?.notes || "",
  }));

  const [housingRequired, setHousingRequired] = useState<boolean>(false);
  const [transportationRequired, setTransportationRequired] = useState<boolean>(false);

  // Search UI state
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>("");
  const [showStaffSuggestions, setShowStaffSuggestions] = useState<boolean>(false);
  const [filteredStaff, setFilteredStaff] = useState<FrontendExternalStaff[]>([]);

  // === Load ALL staff on mount (no status restriction)
  useEffect(() => {
    setStatus(null);
    fetchAllExternalStaff();
  }, [setStatus, fetchAllExternalStaff]);

  // === Client-side filter across the full dataset — NO 10-item cap ===
  useEffect(() => {
    const q = staffSearchQuery.trim().toLowerCase();

    if (!q) {
      setFilteredStaff(externalStaff);
      return;
    }

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

      const blob = `${firstName} ${lastName} ${fullName} ${reverseName} ${jobTitle} ${email} ${department} ${employeeId} ${location} ${manager}`;

      const matchesAll = parts.every((p) =>
        blob.includes(p) ||
        firstName.startsWith(p) ||
        lastName.startsWith(p) ||
        fullName.startsWith(p) ||
        reverseName.startsWith(p)
      );

      return matchesAll;
    });

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
  }, [staffSearchQuery, externalStaff]);

  const handleBenefitTypeChange = (type: BenefitType, checked: boolean) => {
    if (type === "housing") setHousingRequired(checked);
    if (type === "transportation") setTransportationRequired(checked);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStaffSelect = (staff: FrontendExternalStaff) => {
    setFormData((prev) => ({
      ...prev,
      staff_id: staff.id,
      staff_location_id: "",
    }));
    setStaffSearchQuery(`${staff["PAYROLL FIRST NAME"] || ""} ${staff["PAYROLL LAST NAME"] || ""}`);
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
    if (!housingRequired && !transportationRequired) {
      toast({
        title: "Validation Error",
        description: "Please select at least one allocation type (housing or transportation).",
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
      if (housingRequired) benefitsToCreate.push({ ...formData, benefit_type: "housing" } as StaffBenefitFormData);
      if (transportationRequired) benefitsToCreate.push({ ...formData, benefit_type: "transportation" } as StaffBenefitFormData);

      for (const b of benefitsToCreate) {
        await onSave(b);
      }

      toast({
        title: "Success",
        description: `Housing and transport allocation${benefitsToCreate.length > 1 ? "s" : ""} ${benefit ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      console.error("Error saving staff benefit:", error);
      toast({
        title: "Error",
        description: "Failed to save housing and transport allocation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedStaff = externalStaff.find((s) => s.id === formData.staff_id);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-semibold">
          {benefit ? "Edit Housing and Transport Allocation" : "Add New Housing and Transport Allocation"}
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Staff Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Staff Information</CardTitle>
              <CardDescription>Select the staff member who requires housing and transport allocation</CardDescription>
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
                    }}
                    onFocus={() => setShowStaffSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowStaffSuggestions(false), 200)}
                    className="w-full"
                    autoComplete="off"
                  />
                  {staffLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}

                  {/* Scrollable, full results (no arbitrary cap) */}
                  {showStaffSuggestions && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-72 overflow-auto">
                      {(filteredStaff.length ? filteredStaff : externalStaff).length > 0 ? (
                        (filteredStaff.length ? filteredStaff : externalStaff).map((staff) => {
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
                              <div className="font-medium">{`${firstName} ${lastName}`.trim()}</div>
                              <div className="text-sm text-muted-foreground">
                                {email}{dept ? ` • ${dept}` : ""}{job ? ` • ${job}` : ""}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                          {staffLoading ? "Loading staff..." : "No staff found"}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Staff */}
                {selectedStaff && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="font-medium text-blue-900">{`${selectedStaff["PAYROLL FIRST NAME"] || ""} ${selectedStaff["PAYROLL LAST NAME"] || ""}`}</div>
                    <div className="text-sm text-blue-700">
                      {selectedStaff["WORK E-MAIL"]} • {selectedStaff["HOME DEPARTMENT"]} • {selectedStaff["JOB TITLE"]}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Allocation Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Allocation Requirements</CardTitle>
              <CardDescription>Select the allocation types required</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="housing_required"
                    checked={housingRequired}
                    onCheckedChange={(checked) => handleBenefitTypeChange("housing", checked as boolean)}
                  />
                  <div className="flex items-center space-x-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label htmlFor="housing_required" className="text-base font-medium cursor-pointer">
                        Housing Allocation
                      </Label>
                      <p className="text-sm text-muted-foreground">Staff requires housing accommodation</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="transportation_required"
                    checked={transportationRequired}
                    onCheckedChange={(checked) => handleBenefitTypeChange("transportation", checked as boolean)}
                  />
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-green-600" />
                    <div>
                      <Label htmlFor="transportation_required" className="text-base font-medium cursor-pointer">
                        Transport Allocation
                      </Label>
                      <p className="text-sm text-muted-foreground">Staff requires transportation support</p>
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
            <Button type="submit">{benefit ? "Update Allocation" : "Create Allocation"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffBenefitForm;
