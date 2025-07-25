import { useState } from "react";
import { BillingStats } from "./BillingStats";
import { BillingList } from "./BillingList";
import { BillingDetail } from "./BillingDetail";
import { BillingForm } from "./BillingForm";
import { Bill, Staff, mockBills, mockStaff } from "./data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export function Billing() {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [staff] = useState<Staff[]>(mockStaff);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const handleSelectBill = (bill: Bill) => {
    setSelectedBill(bill);
  };

  const handleCloseBillDetail = () => {
    setSelectedBill(null);
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleSubmitForm = (formData: any) => {
    // Create a new bill with the form data
    const newBill: Bill = {
      id: (bills.length + 1).toString(),
      staffId: formData.staffId,
      amount: formData.amount,
      type: formData.type,
      status: "pending",
      dueDate: formData.dueDate,
    };

    // Add the new bill to the list
    setBills([...bills, newBill]);
  };

  const handleAddBill = (formData: any) => {
    // Create a new bill with the form data
    const newBill: Bill = {
      id: (bills.length + 1).toString(),
      staffId: formData.staffId,
      amount: formData.amount,
      type: formData.type,
      status: "pending",
      dueDate: formData.dueDate,
    };

    // Add the new bill to the list
    setBills([...bills, newBill]);
  };

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
        <BillingStats bills={bills} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent
            value={activeTab}
            className="bg-black/40 border border-white/10 rounded-lg p-0"
          >
            {selectedBill ? (
              <BillingDetail
                bill={selectedBill}
                staff={
                  staff.find((s) => s.id === selectedBill.staffId) ||
                  mockStaff[0]
                }
                onBack={() => setSelectedBill(null)}
              />
            ) : (
              <BillingList
                bills={filteredBillsByTab()}
                staff={staff}
                onOpenForm={() => setIsFormOpen(true)}
                onSelectBill={setSelectedBill}
                activeTab={activeTab}
                onChangeTab={setActiveTab}
              />
            )}
          </TabsContent>
        </Tabs>

        <BillingForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleAddBill}
          staff={staff}
        />
      </div>
    </div>
  );
}
