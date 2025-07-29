import { useState } from "react";
import { BillingStats } from "./BillingStats";
import { BillingList } from "./BillingList";
import { BillingDetail } from "./BillingDetail";
import { BillingForm } from "./BillingForm";
import { StaffList } from "./StaffList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useBills, useBillingStaff, useCreateBill, useCreateStaff, useUpdateStaff, useDeleteStaff } from "../../hooks/billing";
import { FrontendBill, FrontendBillingStaff, BillStatus } from "../../integration/supabase/types/billing";

export function Billing() {
  const { bills, loading: billsLoading, error: billsError, refetch: refetchBills } = useBills();
  const { staff, loading: staffLoading, error: staffError, refetch: refetchStaff } = useBillingStaff();
  const { create: createStaff, loading: createStaffLoading } = useCreateStaff();
  const { update: updateStaff, loading: updateStaffLoading } = useUpdateStaff();
  const { deleteStaff, loading: deleteStaffLoading } = useDeleteStaff();
  
  console.log('Billing index - staff data:', staff);
  console.log('Billing index - staffLoading:', staffLoading);
  console.log('Billing index - staffError:', staffError);
  const { create: createBill, loading: createLoading } = useCreateBill();
  
  const [selectedBill, setSelectedBill] = useState<FrontendBill | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [activeMainTab, setActiveMainTab] = useState("bills");

  const handleSelectBill = (bill: FrontendBill) => {
    setSelectedBill(bill);
  };

  const handleCloseBillDetail = () => {
    setSelectedBill(null);
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (formData: any) => {
    try {
      // Create a new bill with the form data
      const newBill: Omit<FrontendBill, 'id'> = {
        staffId: formData.staffId,
        amount: formData.amount,
        type: formData.type,
        status: 'pending' as BillStatus,
        dueDate: formData.dueDate,
        description: formData.description || null
      };

      // Add the new bill to the database
      await createBill(newBill);
      
      // Refresh the bills list
      refetchBills();
    } catch (error) {
      console.error("Error creating bill:", error);
    }
  };

  const handleAddBill = handleSubmitForm;

  const filteredBillsByTab = () => {
    if (activeTab === "all") return bills;
    return bills.filter((bill) => bill.status === activeTab);
  };

  return (
    <div className="w-full h-full">
      <div className="p-6 space-y-4">
        <h1 className="text-4xl font-bold text-white">Billing</h1>
        <p className="text-white/60">Manage staff billing and payments</p>

        {/* Stats always visible */}
        {billsLoading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading billing statistics...</p>
          </div>
        ) : billsError ? (
          <div className="flex justify-center items-center h-32 text-red-500">
            <p>Error loading billing statistics</p>
          </div>
        ) : (
          <BillingStats bills={bills} />
        )}

        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
          <TabsList className="bg-black/40 backdrop-blur-md border border-white/10 mb-4">
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bills" className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent
                value={activeTab}
                className="bg-black/40 border border-white/10 rounded-lg p-0"
              >
            {billsLoading || staffLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading billing data...</p>
              </div>
            ) : billsError || staffError ? (
              <div className="flex justify-center items-center h-64 text-red-500">
                <p>Error loading billing data</p>
              </div>
            ) : selectedBill ? (
              <BillingDetail
                bill={selectedBill}
                staff={staff.find((s) => s.id === selectedBill.staffId) || staff[0]}
                onBack={handleCloseBillDetail}
              />
            ) : (
              <>
                <BillingList
                  bills={filteredBillsByTab()}
                  staff={staff}
                  onOpenForm={handleOpenForm}
                  onSelectBill={handleSelectBill}
                  activeTab={activeTab}
                  onChangeTab={setActiveTab}
                />
                <BillingForm
                  open={isFormOpen}
                  onOpenChange={setIsFormOpen}
                  staff={staff}
                  onSubmit={handleAddBill}
                  isLoading={createLoading}
                />
              </>
            )}
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="staff" className="w-full">
            <div className="bg-black/40 border border-white/10 rounded-lg p-6">
              {staffLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading staff data...</p>
                </div>
              ) : staffError ? (
                <div className="flex justify-center items-center h-64 text-red-500">
                  <p>Error loading staff data</p>
                </div>
              ) : (
                <StaffList 
                  staff={staff} 
                  isLoading={staffLoading}
                  onCreateStaff={async (staffData) => {
                    await createStaff(staffData);
                    refetchStaff();
                  }}
                  onUpdateStaff={async (id, staffData) => {
                    await updateStaff(id, staffData);
                    refetchStaff();
                  }}
                  onDeleteStaff={async (id) => {
                    await deleteStaff(id);
                    refetchStaff();
                  }}
                  isCreating={createStaffLoading}
                  isUpdating={updateStaffLoading}
                  isDeleting={deleteStaffLoading}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
