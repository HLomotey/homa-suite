import { useState } from "react";
import { BillingStats } from "./BillingStats";
import { BillingList } from "./BillingList";
import { BillingDetail } from "./BillingDetail";
import { BillingForm } from "./BillingForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useBills, useBillingStaff, useCreateBill } from "../../hooks/billing";
import { FrontendBill, BillStatus } from "../../integration/supabase/types/billing";

export function Billing() {
  const { bills, loading: billsLoading, error: billsError, refetch: refetchBills } = useBills();
  const { staff, loading: staffLoading, error: staffError } = useBillingStaff();
  const { create: createBill, loading: createLoading } = useCreateBill();
  
  const [selectedBill, setSelectedBill] = useState<FrontendBill | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
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
                />
                <BillingForm
                  open={isFormOpen}
                  onOpenChange={setIsFormOpen}
                  onSubmit={handleAddBill}
                  staff={staff}
                  isLoading={createLoading}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
