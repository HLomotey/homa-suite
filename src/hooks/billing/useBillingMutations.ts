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
      
      // Check current user authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }
      console.log('👤 Current user:', user.id, user.email);

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

      // Check for dependencies and delete them first
      const { data: deductions, error: deductionError } = await supabase
        .from('billing_deductions')
        .select('id')
        .eq('billing_id', id);

      if (deductions && deductions.length > 0) {
        console.log('⚠️ Found billing deductions, deleting them first:', deductions.length);
        
        // Delete deductions first
        const { error: deleteDeductionsError } = await supabase
          .from('billing_deductions')
          .delete()
          .eq('billing_id', id);

        if (deleteDeductionsError) {
          console.error('❌ Failed to delete billing deductions:', deleteDeductionsError);
          throw new Error(`Failed to delete related deductions: ${deleteDeductionsError.message}`);
        }
        
        console.log('✅ Deleted billing deductions successfully');
      }

      // Perform the delete with explicit table permissions
      const { error, data } = await supabase
        .from('billing')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Delete operation failed:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Provide more specific error messages
        if (error.code === '42501') {
          throw new Error('Permission denied. Please check your user permissions.');
        } else if (error.code === '23503') {
          throw new Error('Cannot delete record due to foreign key constraints.');
        } else if (error.code === '42P01') {
          throw new Error('Table not found or access denied.');
        } else {
          throw new Error(`Delete failed: ${error.message} (Code: ${error.code})`);
        }
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
