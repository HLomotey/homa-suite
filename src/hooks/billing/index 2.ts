/**
 * Billing module index file
 * Exports all billing-related API functions and hooks
 */

// Re-export API functions
export {
  fetchBills,
  fetchBillById,
  createBill,
  updateBill,
  deleteBill,
  fetchBillsByStatus,
  fetchBillsByType,
  fetchBillsByStaff,
  fetchBillingStaff,
  fetchBillingStats
} from './api';

// Re-export staff API functions
export {
  createStaff,
  updateStaff,
  deleteStaff
} from './staffApi';

// Re-export billing hooks
export {
  useBills,
  useBill,
  useCreateBill,
  useUpdateBill,
  useDeleteBill,
  useBillsByStatus,
  useBillsByType,
  useBillsByStaff,
  useBillingStaff,
  useBillingStats
} from './useBilling';

// Re-export staff hooks
export {
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff
} from './useStaff';
