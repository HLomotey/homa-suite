import * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { FrontendBillingStaff } from "@/integration/supabase/types/billing";

// Import modular components
import { PersonalInfoTab } from "./PersonalInfoTab";
import { WorkInfoTab } from "./WorkInfoTab";
import { EEODataTab } from "./EEODataTab";
import { CompensationTab } from "./CompensationTab";

interface StaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    formData:
      | Omit<FrontendBillingStaff, "id">
      | ({ id: string } & Partial<Omit<FrontendBillingStaff, "id">>)
  ) => void;
  isLoading?: boolean;
  staff?: FrontendBillingStaff;
}

export function StaffForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  staff,
}: StaffFormProps) {
  const isEditing = !!staff;
  const [activeTab, setActiveTab] = React.useState<string>("personal");

  // Memoize the active tab change handler to prevent unnecessary re-renders
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Reset to first tab when form opens
  useEffect(() => {
    if (open) {
      setActiveTab("personal");
    }
  }, [open]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(e.currentTarget);

      if (isEditing && staff) {
        // For editing, include ID and only changed fields
        const data: { id: string } & Partial<Omit<FrontendBillingStaff, "id">> =
          {
            id: staff.id,
            // Personal Information
            legalName: formData.get("legalName") as string,
            preferredName:
              (formData.get("preferredName") as string) || undefined,
            birthName: (formData.get("birthName") as string) || undefined,

            // Contact Information
            email: formData.get("email") as string,
            phoneNumber: (formData.get("phoneNumber") as string) || undefined,
            address: (formData.get("address") as string) || undefined,

            // Emergency Contacts
            emergencyContactName:
              (formData.get("emergencyContactName") as string) || undefined,
            emergencyContactPhone:
              (formData.get("emergencyContactPhone") as string) || undefined,
            emergencyContactRelationship:
              (formData.get("emergencyContactRelationship") as string) ||
              undefined,

            // Personal Details
            maritalStatus:
              (formData.get("maritalStatus") as string) || undefined,

            // EEO Data
            gender: (formData.get("gender") as string) || undefined,
            ethnicityRace:
              (formData.get("ethnicityRace") as string) || undefined,
            veteranStatus:
              (formData.get("veteranStatus") as string) || undefined,
            disabilityStatus:
              (formData.get("disabilityStatus") as string) || undefined,

            // Work-Related Information
            employeeId: (formData.get("employeeId") as string) || undefined,
            jobTitle: formData.get("jobTitle") as string,
            department: formData.get("department") as string,
            location: (formData.get("location") as string) || undefined,
            staffLocationId:
              (formData.get("staffLocationId") as string) || undefined,
            employmentStatus: formData.get("employmentStatus") as string,
            hireDate: formData.get("hireDate") as string,
            terminationDate:
              (formData.get("terminationDate") as string) || undefined,

            // Compensation Information
            salary: formData.get("salary")
              ? Number(formData.get("salary"))
              : undefined,
            hourlyRate: formData.get("hourlyRate")
              ? Number(formData.get("hourlyRate"))
              : undefined,
          };

        onSubmit(data);
      } else {
        // For creating new staff
        const data: Omit<FrontendBillingStaff, "id"> = {
          // Personal Information
          legalName: formData.get("legalName") as string,
          preferredName: (formData.get("preferredName") as string) || undefined,
          birthName: (formData.get("birthName") as string) || undefined,

          // Contact Information
          email: formData.get("email") as string,
          phoneNumber: (formData.get("phoneNumber") as string) || undefined,
          address: (formData.get("address") as string) || undefined,

          // Emergency Contacts
          emergencyContactName:
            (formData.get("emergencyContactName") as string) || undefined,
          emergencyContactPhone:
            (formData.get("emergencyContactPhone") as string) || undefined,
          emergencyContactRelationship:
            (formData.get("emergencyContactRelationship") as string) ||
            undefined,

          // Personal Details
          maritalStatus: (formData.get("maritalStatus") as string) || undefined,

          // EEO Data
          gender: (formData.get("gender") as string) || undefined,
          ethnicityRace: (formData.get("ethnicityRace") as string) || undefined,
          veteranStatus: (formData.get("veteranStatus") as string) || undefined,
          disabilityStatus:
            (formData.get("disabilityStatus") as string) || undefined,

          // Work-Related Information
          employeeId: (formData.get("employeeId") as string) || undefined,
          jobTitle: formData.get("jobTitle") as string,
          department: formData.get("department") as string,
          location: (formData.get("location") as string) || undefined,
          staffLocationId:
            (formData.get("staffLocationId") as string) || undefined,
          employmentStatus: formData.get("employmentStatus") as string,
          hireDate: formData.get("hireDate") as string,
          terminationDate:
            (formData.get("terminationDate") as string) || undefined,

          // Compensation Information
          salary: formData.get("salary")
            ? Number(formData.get("salary"))
            : undefined,
          hourlyRate: formData.get("hourlyRate")
            ? Number(formData.get("hourlyRate"))
            : undefined,
        };

        onSubmit(data);
      }

      onOpenChange(false);
    },
    [isEditing, staff, onSubmit, onOpenChange]
  );

  // Memoize the form content to prevent unnecessary re-renders
  const formContent = useMemo(
    () => (
      <form onSubmit={handleSubmit} className="mt-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="work">Work Info</TabsTrigger>
            <TabsTrigger value="eeo">EEO Data</TabsTrigger>
            <TabsTrigger value="compensation">Compensation</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-4 mt-4">
            <PersonalInfoTab staff={staff} />
          </TabsContent>

          {/* Work Information Tab */}
          <TabsContent value="work" className="space-y-4 mt-4">
            <WorkInfoTab staff={staff} />
          </TabsContent>

          {/* EEO Data Tab */}
          <TabsContent value="eeo" className="space-y-4 mt-4">
            <EEODataTab staff={staff} />
          </TabsContent>

          {/* Compensation Tab */}
          <TabsContent value="compensation" className="space-y-4 mt-4">
            <CompensationTab staff={staff} />
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Update Staff Member"
            ) : (
              "Create Staff Member"
            )}
          </Button>
        </div>
      </form>
    ),
    [activeTab, handleTabChange, handleSubmit, isEditing, isLoading, staff]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[700px] sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Edit Staff Member" : "New Staff Member"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Edit comprehensive staff member details."
              : "Add a new staff member with comprehensive information."}
          </SheetDescription>
        </SheetHeader>

        {formContent}
      </SheetContent>
    </Sheet>
  );
}
