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
