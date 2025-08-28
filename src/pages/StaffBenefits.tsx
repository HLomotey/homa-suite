import React, { useState } from "react";
import { StaffBenefitsList } from "@/components/staff-benefits/StaffBenefitsList";
import { StaffBenefitForm } from "@/components/staff-benefits/StaffBenefitForm";
import { FrontendStaffBenefit } from "@/integration/supabase/types/staff-benefits";
import { useStaffBenefits } from "@/hooks/staff-benefits/useStaffBenefits";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type ViewMode = "list" | "add" | "edit" | "view";

export default function StaffBenefits() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedBenefit, setSelectedBenefit] =
    useState<FrontendStaffBenefit | null>(null);
  const { createBenefit, updateBenefit, fetchBenefits } = useStaffBenefits();

  const handleAddBenefit = () => {
    setSelectedBenefit(null);
    setViewMode("add");
  };

  const handleEditBenefit = (benefit: FrontendStaffBenefit) => {
    setSelectedBenefit(benefit);
    setViewMode("edit");
  };

  const handleViewBenefit = (benefit: FrontendStaffBenefit) => {
    setSelectedBenefit(benefit);
    setViewMode("view");
  };

  const handleSaveBenefit = async (
    benefitData: Omit<FrontendStaffBenefit, "id">
  ) => {
    try {
      if (viewMode === "add") {
        await createBenefit(benefitData as any);
      } else if (viewMode === "edit" && selectedBenefit) {
        await updateBenefit(selectedBenefit.id, benefitData as any);
      }

      // Refresh the list and go back to list view
      await fetchBenefits();
      setViewMode("list");
      setSelectedBenefit(null);
    } catch (error) {
      console.error("Error saving benefit:", error);
    }
  };

  const handleCancel = () => {
    setViewMode("list");
    setSelectedBenefit(null);
  };

  const isSheetOpen = viewMode === "add" || viewMode === "edit";

  return (
    <div className="space-y-6 p-6">
      <StaffBenefitsList
        onAddBenefit={handleAddBenefit}
        onEditBenefit={handleEditBenefit}
        onViewBenefit={handleViewBenefit}
      />

      {/* Sheet for Add/Edit Form */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => !open && handleCancel()}>
        <SheetContent className="w-[800px] sm:max-w-[800px]">
          <SheetHeader>
            <SheetTitle>
              {viewMode === "add" ? "Add New Housing and Transport Allocation" : "Edit Housing and Transport Allocation"}
            </SheetTitle>
            <SheetDescription>
              {viewMode === "add" 
                ? "Create a new housing and transport allocation for a staff member."
                : "Update the housing and transport allocation details."
              }
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <StaffBenefitForm
              benefit={selectedBenefit || undefined}
              onSave={handleSaveBenefit}
              onCancel={handleCancel}
            />
          </div>
        </SheetContent>
      </Sheet>

      {viewMode === "view" && selectedBenefit && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                Housing and Transport Allocation Details
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditBenefit(selectedBenefit)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Staff Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedBenefit.staff_name || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedBenefit.staff_email || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Department:</span>{" "}
                    {selectedBenefit.staff_department || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Job Title:</span>{" "}
                    {selectedBenefit.staff_job_title || "N/A"}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Allocation Details</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    {selectedBenefit.benefit_type}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    {selectedBenefit.status}
                  </div>
                  <div>
                    <span className="font-medium">Allocation Type:</span>{" "}
                    {selectedBenefit.benefit_type.charAt(0).toUpperCase() +
                      selectedBenefit.benefit_type.slice(1)}
                  </div>
                  <div>
                    <span className="font-medium">Effective Date:</span>{" "}
                    {selectedBenefit.effective_date}
                  </div>
                  {selectedBenefit.expiry_date && (
                    <div>
                      <span className="font-medium">Expiry Date:</span>{" "}
                      {selectedBenefit.expiry_date}
                    </div>
                  )}
                </div>
              </div>

              {selectedBenefit.benefit_type === "housing" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Housing Allocation
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <span className="font-medium text-blue-900">
                          Housing Allocated
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        This staff member has been allocated housing
                        accommodation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedBenefit.benefit_type === "transportation" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Transport Allocation
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <span className="font-medium text-green-900">
                          Transport Allocated
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        This staff member has been allocated transportation
                        support.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedBenefit.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Notes</h3>
                <p className="text-gray-700">{selectedBenefit.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
