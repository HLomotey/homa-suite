import React, { useState } from "react";
import { JobOrderDashboard } from "./Dashboard";
import { JobOrderList } from "./JobOrderList";
import JobOrderForm from "./JobOrderForm";
import { useJobOrders } from "../../hooks/job-order/useJobOrder";
import { JobOrderWithDetails } from "../../types/job-order";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function JobOrders() {
  // Hooks for job order data and operations
  const { jobOrders, loading, error, fetchJobOrders, createJobOrder, updateJobOrder, deleteJobOrder } = useJobOrders();
  const { toast } = useToast();

  // State for job order form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentJobOrder, setCurrentJobOrder] = useState<JobOrderWithDetails | null>(null);
  const [selectedJobOrderId, setSelectedJobOrderId] = useState<string | null>(null);

  // Handle job order operations
  const handleAddJobOrder = () => {
    setCurrentJobOrder(null);
    setIsAddDialogOpen(true);
  };

  const handleEditJobOrder = (jobOrder: JobOrderWithDetails) => {
    setCurrentJobOrder(jobOrder);
    setSelectedJobOrderId(jobOrder.id);
    setIsEditDialogOpen(true);
  };

  const handleViewJobOrder = (jobOrder: JobOrderWithDetails) => {
    setCurrentJobOrder(jobOrder);
    setSelectedJobOrderId(jobOrder.id);
    setIsViewDialogOpen(true);
  };

  const handleDeleteJobOrder = async (id: string) => {
    try {
      await deleteJobOrder(id);
      toast({
        title: "Job order deleted",
        description: "The job order has been deleted successfully.",
      });
      await fetchJobOrders(); // Refresh the job orders list
    } catch (error) {
      console.error("Error deleting job order:", error);
      toast({
        title: "Error",
        description: "Failed to delete job order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateJobOrder = async (jobOrderData: any) => {
    try {
      await createJobOrder(jobOrderData);
      setIsAddDialogOpen(false);
      toast({
        title: "Job order created",
        description: "The job order has been created successfully.",
      });
      await fetchJobOrders(); // Refresh the job orders list
    } catch (error) {
      console.error("Error creating job order:", error);
      toast({
        title: "Error",
        description: "Failed to create job order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateJobOrder = async (id: string, jobOrderData: any) => {
    try {
      await updateJobOrder({ id, ...jobOrderData });
      setIsEditDialogOpen(false);
      toast({
        title: "Job order updated",
        description: "The job order has been updated successfully.",
      });
      await fetchJobOrders(); // Refresh the job orders list
    } catch (error) {
      console.error("Error updating job order:", error);
      toast({
        title: "Error",
        description: "Failed to update job order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <Tabs defaultValue="job-orders" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="job-orders">Job Orders</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="job-orders" className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-white/60">Loading job orders...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">Error loading job orders: {error}</p>
            </div>
          ) : (
            <JobOrderList
              jobOrders={jobOrders}
              onEdit={handleEditJobOrder}
              onDelete={handleDeleteJobOrder}
              onAddJobOrder={handleAddJobOrder}
              onViewDetails={handleViewJobOrder}
              onSelect={(jobOrderId) => setSelectedJobOrderId(jobOrderId)}
            />
          )}
        </TabsContent>
        
        <TabsContent value="dashboard">
          <JobOrderDashboard />
        </TabsContent>
      </Tabs>

      {/* Add Job Order Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Job Order</DialogTitle>
          </DialogHeader>
          <JobOrderForm
            onSubmit={handleCreateJobOrder}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Job Order Dialog */}
      {currentJobOrder && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job Order</DialogTitle>
            </DialogHeader>
            <JobOrderForm
              jobOrder={currentJobOrder}
              onSubmit={(data) => handleUpdateJobOrder(currentJobOrder.id, data)}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Job Order Dialog */}
      {currentJobOrder && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Job Order Details</DialogTitle>
            </DialogHeader>
            <JobOrderForm
              jobOrder={currentJobOrder}
              readOnly={true}
              onCancel={() => setIsViewDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
