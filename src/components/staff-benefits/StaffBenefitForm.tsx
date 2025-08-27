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
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
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
  const { externalStaff, loading: staffLoading, fetchAllExternalStaff, setStatus } = useExternalStaff();
  const { staffLocations, loading: locationsLoading } = useStaffBenefits();

  const [formData, setFormData] = useState<StaffBenefitFormData>(() => ({
    staff_id: benefit?.staff_id || "",
    staff_location_id: benefit?.staff_location_id || "",
    benefit_type: benefit?.benefit_type || "housing",
    status: benefit?.status || "pending",
    
    // General fields
    effective_date: benefit?.effective_date || new Date().toISOString().split('T')[0],
    expiry_date: benefit?.expiry_date || "",
    notes: benefit?.notes || "",
  }));

  const [housingRequired, setHousingRequired] = useState(false);
  const [transportationRequired, setTransportationRequired] = useState(false);

  // State for staff search functionality
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [showStaffSuggestions, setShowStaffSuggestions] = useState(false);
  const [filteredStaff, setFilteredStaff] = useState<FrontendExternalStaff[]>([]);

  // Set external staff status to active and fetch all data on component mount
  useEffect(() => {
    setStatus("active");
    fetchAllExternalStaff();
  }, [setStatus, fetchAllExternalStaff]);

  // Filter staff based on search query
  useEffect(() => {
    if (staffSearchQuery.trim() === "") {
      setFilteredStaff(externalStaff.slice(0, 10)); // Show first 10 staff members
    } else {
      const filtered = externalStaff.filter((staff) =>
        `${staff["PAYROLL FIRST NAME"] || ""} ${staff["PAYROLL LAST NAME"] || ""}`.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        staff["WORK E-MAIL"]?.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        staff["HOME DEPARTMENT"]?.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        staff["JOB TITLE"]?.toLowerCase().includes(staffSearchQuery.toLowerCase())
      );
      setFilteredStaff(filtered.slice(0, 10)); // Limit to 10 results
    }
  }, [staffSearchQuery, externalStaff]);

  // Handle benefit type changes based on checkboxes (both can be selected)
  const handleBenefitTypeChange = (type: BenefitType, checked: boolean) => {
    if (type === "housing") {
      setHousingRequired(checked);
    } else if (type === "transportation") {
      setTransportationRequired(checked);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStaffSelect = (staff: FrontendExternalStaff) => {
    setFormData(prev => ({
      ...prev,
      staff_id: staff.id,
      staff_location_id: ""
    }));
    setStaffSearchQuery(`${staff["PAYROLL FIRST NAME"] || ""} ${staff["PAYROLL LAST NAME"] || ""}`);
    setShowStaffSuggestions(false);
  };

  // Validation function
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
        description: "Please select at least one benefit type (housing or transportation)",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Create separate benefit records for each selected type
      const benefitsToCreate = [];
      
      if (housingRequired) {
        benefitsToCreate.push({
          ...formData,
          benefit_type: "housing" as BenefitType
        });
      }
      
      if (transportationRequired) {
        benefitsToCreate.push({
          ...formData,
          benefit_type: "transportation" as BenefitType
        });
      }

      // Save each benefit separately
      for (const benefitData of benefitsToCreate) {
        await onSave(benefitData);
      }

      toast({
        title: "Success",
        description: `Staff benefit${benefitsToCreate.length > 1 ? 's' : ''} ${benefit ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving staff benefit:', error);
      toast({
        title: "Error",
        description: "Failed to save staff benefit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedStaff = externalStaff.find(staff => staff.id === formData.staff_id);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-semibold">
          {benefit ? "Edit Staff Benefit" : "Add New Staff Benefit"}
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
              <CardDescription>
                Select the staff member who requires benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff_search">Staff Member *</Label>
                <div className="relative">
                  <Input
                    id="staff_search"
                    type="text"
                    placeholder="Search staff by name, email, or department..."
                    value={staffSearchQuery}
                    onChange={(e) => {
                      setStaffSearchQuery(e.target.value);
                      setShowStaffSuggestions(true);
                    }}
                    onFocus={() => setShowStaffSuggestions(true)}
                    className="w-full"
                  />
                  {staffLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>

                {/* Staff Suggestions Dropdown */}
                {showStaffSuggestions && filteredStaff.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredStaff.map((staff) => (
                      <div
                        key={staff.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleStaffSelect(staff)}
                      >
                        <div className="font-medium">{`${staff["PAYROLL FIRST NAME"] || ""} ${staff["PAYROLL LAST NAME"] || ""}`}</div>
                        <div className="text-sm text-gray-600">
                          {staff["WORK E-MAIL"]} • {staff["HOME DEPARTMENT"]} • {staff["JOB TITLE"]}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Staff Display */}
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

          {/* Benefit Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Benefit Requirements</CardTitle>
              <CardDescription>
                Select the benefit types required (you can select housing, transportation, or both)
              </CardDescription>
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
                        Housing Required
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
                    onCheckedChange={(checked) => handleBenefitTypeChange("transportation", checked as boolean)}
                  />
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-green-600" />
                    <div>
                      <Label htmlFor="transportation_required" className="text-base font-medium cursor-pointer">
                        Transportation Required
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Staff requires transportation support
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
              {benefit ? "Update Benefit" : "Create Benefit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffBenefitForm;
