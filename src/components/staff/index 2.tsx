import { useState } from "react";
import { StaffList } from "../billing/StaffList";
import { useBillingStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from "../../hooks/billing";
import { FrontendBillingStaff } from "../../integration/supabase/types/billing";

export function Staff() {
  const { staff, loading: staffLoading, error: staffError, refetch: refetchStaff } = useBillingStaff();
  const { create: createStaff, loading: createStaffLoading } = useCreateStaff();
  const { update: updateStaff, loading: updateStaffLoading } = useUpdateStaff();
  const { deleteStaff, loading: deleteStaffLoading } = useDeleteStaff();
  
  console.log('Staff page - staff data:', staff);
  console.log('Staff page - staffLoading:', staffLoading);
  console.log('Staff page - staffError:', staffError);

  const handleCreateStaff = async (staffData: Omit<FrontendBillingStaff, 'id'>) => {
    try {
      await createStaff(staffData);
      refetchStaff();
    } catch (error) {
      console.error("Error creating staff:", error);
    }
  };

  const handleUpdateStaff = async (id: string, staffData: Partial<Omit<FrontendBillingStaff, 'id'>>) => {
    try {
      await updateStaff(id, staffData);
      refetchStaff();
    } catch (error) {
      console.error("Error updating staff:", error);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await deleteStaff(id);
      refetchStaff();
    } catch (error) {
      console.error("Error deleting staff:", error);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Staff Management</h1>
          <p className="text-white/60">Manage staff members and their information</p>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-lg">
          <StaffList
            staff={staff}
            isLoading={staffLoading}
            onCreateStaff={handleCreateStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
            isCreating={createStaffLoading}
            isUpdating={updateStaffLoading}
            isDeleting={deleteStaffLoading}
          />
        </div>
      </div>
    </div>
  );
}
