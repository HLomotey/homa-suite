import { useState } from 'react';
import { supabase } from '@/integration/supabase/client';
import { BillingRow, PaymentStatus } from '@/types/billing';
import { toast } from 'sonner';

export function useBillingMutations() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateBillingRecord = async (
    id: string,
    updates: {
      rentAmount?: number;
      paymentStatus?: PaymentStatus;
    }
  ) => {
    setIsUpdating(true);
    try {
      const { error } = await (supabase
        .from('billing') as any)
        .update({
          ...(updates.rentAmount !== undefined && { rent_amount: updates.rentAmount }),
          ...(updates.paymentStatus !== undefined && { payment_status: updates.paymentStatus }),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Billing record updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating billing record:', error);
      toast.error('Failed to update billing record');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteBillingRecord = async (id: string) => {
    setIsDeleting(true);
    try {
      console.log('🗑️ Attempting to delete billing record:', id);
      
      // First check if the record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('billing')
        .select('id, tenant_id, billing_type, period_start, period_end')
        .eq('id', id)
        .single();

      if (checkError) {
        console.error('❌ Error checking billing record:', checkError);
        throw new Error(`Record not found: ${checkError.message}`);
      }

      if (!existingRecord) {
        throw new Error('Billing record not found');
      }

      console.log('✅ Found billing record to delete:', existingRecord);

      // Perform the delete
      const { error, data } = await supabase
        .from('billing')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Delete operation failed:', error);
        throw error;
      }

      console.log('✅ Billing record deleted successfully:', data);
      toast.success('Billing record deleted successfully');
      return true;
    } catch (error: any) {
      console.error('💥 Error deleting billing record:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      toast.error(`Failed to delete billing record: ${errorMessage}`);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };


  return {
    updateBillingRecord,
    deleteBillingRecord,
    isUpdating,
    isDeleting
  };
}
