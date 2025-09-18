import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/client';
import { 
  JobOrder, 
  JobOrderWithDetails, 
  CreateJobOrderRequest, 
  UpdateJobOrderRequest,
  JobOrderStatus 
} from '@/types/job-order';

export const useJobOrders = () => {
  const [jobOrders, setJobOrders] = useState<JobOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('job_orders_with_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setJobOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobOrders();
  }, []);

  const createJobOrder = async (jobOrderData: CreateJobOrderRequest) => {
    try {
      const { data, error: createError } = await supabase
        .from('job_orders')
        .insert([jobOrderData])
        .select()
        .single();

      if (createError) throw createError;

      await fetchJobOrders(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create job order');
    }
  };

  const updateJobOrder = async (jobOrderData: UpdateJobOrderRequest) => {
    try {
      const { data, error: updateError } = await supabase
        .from('job_orders')
        .update(jobOrderData)
        .eq('id', jobOrderData.id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchJobOrders(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update job order');
    }
  };

  const deleteJobOrder = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('job_orders')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchJobOrders(); // Refresh the list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete job order');
    }
  };

  const updateJobOrderStatus = async (id: string, status: JobOrderStatus, notes?: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'COMPLETED') {
        updateData.completed_at = new Date().toISOString();
        if (notes) updateData.completion_notes = notes;
      } else if (status === 'CLOSED') {
        updateData.closed_at = new Date().toISOString();
      } else if (status === 'REJECTED') {
        if (notes) updateData.rejection_reason = notes;
      } else if (status === 'APPROVED') {
        if (notes) updateData.approval_notes = notes;
      }

      const { data, error: updateError } = await supabase
        .from('job_orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchJobOrders(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update job order status');
    }
  };

  return {
    jobOrders,
    loading,
    error,
    fetchJobOrders,
    createJobOrder,
    updateJobOrder,
    deleteJobOrder,
    updateJobOrderStatus
  };
};

export const useJobOrder = (id: string) => {
  const [jobOrder, setJobOrder] = useState<JobOrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('job_orders_with_details')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      setJobOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobOrder();
    }
  }, [id]);

  return {
    jobOrder,
    loading,
    error,
    fetchJobOrder
  };
};
