/**
 * Transport module index file
 * Exports all transport-related API functions and hooks
 */

// Re-export API functions
export {
  fetchVehicles,
  fetchVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  fetchVehiclesByStatus,
  fetchVehiclesByType,
  fetchTransportStaff,
  fetchTransportStats
} from './api';

// Re-export billing API functions
export {
  fetchBillingPeriods,
  fetchBillingPeriodById,
  createBillingPeriod,
  updateBillingPeriod,
  deleteBillingPeriod,
  fetchTransportBillings,
  fetchTransportBillingsByPeriod,
  createTransportBilling,
  updateTransportBilling,
  deleteTransportBilling,
  fetchTransportBillingRates,
  createTransportBillingRate,
  fetchTransportBillingUsage,
  createTransportBillingUsage
} from './billingApi';

// Re-export hooks
export {
  useVehicles,
  useVehicle,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  useVehiclesByStatus,
  useVehiclesByType,
  useTransportStaff,
  useTransportStats
} from './useTransport';

// Re-export billing hooks
export { useBillingPeriod } from './useBillingPeriod';
export { useTransportBilling } from './useTransportBilling';
