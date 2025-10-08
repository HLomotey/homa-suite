import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import JobOrderDashboard from '@/components/job-order/Dashboard';
import JobOrderList from '@/components/job-order/JobOrderList';
import JobOrderForm from '@/components/job-order/JobOrderForm';
import { useJobOrders } from '@/hooks/job-order/useJobOrder';
import { CreateJobOrderRequest, JobOrderWithDetails } from '@/types/job-order';
import { toast } from 'sonner';

const JobOrdersPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJobOrder, setEditingJobOrder] = useState<JobOrderWithDetails | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const { jobOrders, createJobOrder, updateJobOrder, deleteJobOrder } = useJobOrders();

  const handleCreateNew = () => {
    setEditingJobOrder(null);
    setIsFormOpen(true);
  };

  const handleEdit = (jobOrder: JobOrderWithDetails) => {
    setEditingJobOrder(jobOrder);
    setIsFormOpen(true);
  };

  const handleViewDetails = (jobOrder: JobOrderWithDetails) => {
    // TODO: Implement job order details view
    console.log('View details for:', jobOrder);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job order?')) {
      try {
        await deleteJobOrder(id);
        toast.success('Job order deleted successfully');
      } catch (error) {
        toast.error('Failed to delete job order');
      }
    }
  };

  const handleFormSubmit = async (data: CreateJobOrderRequest) => {
    try {
      setFormLoading(true);
      
      if (editingJobOrder) {
        await updateJobOrder({ ...data, id: editingJobOrder.id });
        toast.success('Job order updated successfully');
      } else {
        await createJobOrder(data);
        toast.success('Job order created successfully');
      }
      
      setIsFormOpen(false);
      setEditingJobOrder(null);
    } catch (error) {
      toast.error(editingJobOrder ? 'Failed to update job order' : 'Failed to create job order');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingJobOrder(null);
  };

  return (
    <div className="w-full px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Order Management</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Job Order
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="list">Job Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <JobOrderDashboard />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <JobOrderList
            jobOrders={jobOrders}
            onAddJobOrder={handleCreateNew}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

      </Tabs>

      {/* Job Order Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-auto">
          <JobOrderForm
            jobOrder={editingJobOrder}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={formLoading}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default JobOrdersPage;
