import { useState, useEffect } from "react";
import { BillingList } from "./BillingList";
import { BillingForm } from "./BillingForm";
import { FrontendTransportBilling } from "@/integration/supabase/types/billing";
import { useTransportBilling } from "@/hooks/transport/useTransportBilling";
import { useBillingPeriod } from "@/hooks/transport/useBillingPeriod";
import { toast } from "@/components/ui/use-toast";

export function TransportBilling() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBilling, setEditingBilling] = useState<FrontendTransportBilling | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  
  // Initialize hooks
  const { 
    billingEntries, 
    loading: billingLoading, 
    error: billingError,
    getBillingEntriesByPeriod,
    addBilling,
    editBilling,
    removeBilling
  } = useTransportBilling();
  
  const {
    billingPeriods,
    loading: periodsLoading,
    error: periodsError,
    getBillingPeriods
  } = useBillingPeriod();

  // Load billing periods on component mount
  useEffect(() => {
    getBillingPeriods();
  }, [getBillingPeriods]);

  // Load billing entries when a period is selected
  useEffect(() => {
    if (selectedPeriodId) {
      getBillingEntriesByPeriod(selectedPeriodId);
    }
  }, [selectedPeriodId, getBillingEntriesByPeriod]);

  // Handle opening form for new billing entry
  const handleNewBilling = () => {
    setEditingBilling(null);
    setIsFormOpen(true);
  };

  // Handle editing a billing entry
  const handleEditBilling = (billing: FrontendTransportBilling) => {
    setEditingBilling(billing);
    setIsFormOpen(true);
  };

  // Handle deleting a billing entry
  const handleDeleteBilling = async (id: string) => {
    try {
      await removeBilling(id);
      toast({
        title: "Success",
        description: "Billing entry deleted successfully",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete billing entry",
        variant: "destructive"
      });
    }
  };

  // This function is no longer needed as we're handling form submission in handleFormSuccess

  // Handle period selection change
  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriodId(periodId);
  };

  // Handle form submission from BillingForm
  const handleFormSuccess = (data?: Omit<FrontendTransportBilling, "id">) => {
    if (data) {
      if (editingBilling) {
        // Update existing billing
        editBilling(editingBilling.id, data)
          .then(() => {
            toast({
              title: "Success",
              description: "Billing entry updated successfully",
              variant: "default"
            });
            // Refresh data if a period is selected
            if (selectedPeriodId) {
              getBillingEntriesByPeriod(selectedPeriodId);
            }
          })
          .catch((error) => {
            toast({
              title: "Error",
              description: error instanceof Error ? error.message : "Failed to update billing entry",
              variant: "destructive"
            });
          });
      } else {
        // Create new billing
        addBilling(data)
          .then(() => {
            toast({
              title: "Success",
              description: "Billing entry created successfully",
              variant: "default"
            });
            // Refresh data if a period is selected
            if (selectedPeriodId) {
              getBillingEntriesByPeriod(selectedPeriodId);
            }
          })
          .catch((error) => {
            toast({
              title: "Error",
              description: error instanceof Error ? error.message : "Failed to create billing entry",
              variant: "destructive"
            });
          });
      }
    } else {
      // Just refresh data if no data was provided (e.g., form was closed without submission)
      if (selectedPeriodId) {
        getBillingEntriesByPeriod(selectedPeriodId);
      }
    }
  };

  return (
    <div className="space-y-4">
      <BillingList 
        onOpenForm={handleNewBilling}
        billingPeriods={billingPeriods}
        billingEntries={billingEntries}
        onEditBilling={handleEditBilling}
        onDeleteBilling={handleDeleteBilling}
        onPeriodChange={handlePeriodChange}
        loading={billingLoading}
        periodsLoading={periodsLoading}
      />
      
      <BillingForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
        editingBilling={editingBilling}
      />
    </div>
  );
}
