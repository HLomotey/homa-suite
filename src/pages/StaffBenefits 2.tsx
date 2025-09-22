import React, { useState } from "react";
import { StaffBenefitsList } from "@/components/staff-benefits/StaffBenefitsList";
import { StaffBenefitForm } from "@/components/staff-benefits/StaffBenefitForm";
import { FrontendStaffBenefit } from "@/integration/supabase/types/staff-benefits";
import { useStaffBenefits } from "@/hooks/staff-benefits/useStaffBenefits";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  const isDialogOpen = viewMode === "add" || viewMode === "edit";

  return (
    <div className="space-y-6 p-6">
      <StaffBenefitsList
        onAddBenefit={handleAddBenefit}
        onEditBenefit={handleEditBenefit}
        onViewBenefit={handleViewBenefit}
      />

      {/* Dialog for Add/Edit Form */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewMode === "add" ? "Add New Housing and Transport Allocation" : "Edit Housing and Transport Allocation"}
            </DialogTitle>
            <DialogDescription>
              {viewMode === "add" 
                ? "Create a new housing and transport allocation for a staff member."
                : "Update the housing and transport allocation details."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <StaffBenefitForm
              benefit={selectedBenefit || undefined}
              onSave={handleSaveBenefit}
              onCancel={handleCancel}
            />
          </div>
        </DialogContent>
      </Dialog>

      {viewMode === "view" && selectedBenefit && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">
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
                <h3 className="text-lg font-medium mb-4 text-white">
                  Staff Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-blue-300">Name:</span>{" "}
                    <span className="text-gray-200">{selectedBenefit.staff_name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-300">Email:</span>{" "}
                    <span className="text-gray-200">{selectedBenefit.staff_email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-300">Department:</span>{" "}
                    <span className="text-gray-200">{selectedBenefit.staff_department || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-300">Job Title:</span>{" "}
                    <span className="text-gray-200">{selectedBenefit.staff_job_title || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 text-white">
                  Allocation Details
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-blue-300">Type:</span>{" "}
                    <span className="text-gray-200">{selectedBenefit.benefit_type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-300">Status:</span>{" "}
                    <span className="text-gray-200">{selectedBenefit.status}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-300">Allocation Type:</span>{" "}
                    <span className="text-gray-200">{selectedBenefit.benefit_type === "housing" ? "Housing" : "Transportation"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-300">Effective Date:</span>{" "}
                    <span className="text-gray-200">{selectedBenefit.effective_date}</span>
                  </div>
                  {selectedBenefit.expiry_date && (
                    <div>
                      <span className="font-medium text-blue-300">Expiry Date:</span>{" "}
                      <span className="text-gray-200">{selectedBenefit.expiry_date}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedBenefit.benefit_type === "housing" && (
                <div>
                  <h3 className="text-lg font-medium mb-4 text-white">
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
                  <h3 className="text-lg font-medium mb-4 text-white">
                    Transport Allocation
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="font-medium text-blue-100">
                          Transport Allocated
                        </span>
                      </div>
                      <p className="text-sm text-blue-200 mt-1">
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
                <h3 className="text-lg font-medium mb-2 text-white">Notes</h3>
                <p className="text-gray-300">{selectedBenefit.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
