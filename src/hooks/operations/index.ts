/**
 * Operations module index file
 * Exports all operations-related API functions and hooks
 */

// Re-export API functions
export {
  fetchJobOrders,
  fetchJobOrderById,
  createJobOrder,
  updateJobOrder,
  deleteJobOrder,
  fetchJobOrdersByStatus,
  fetchJobOrdersByClient,
  fetchRegionPerformance,
  fetchTopPerformers,
  fetchTopPerformersByRegion,
  fetchClientSatisfaction,
  fetchJobOrderTrends,
  fetchTimeToFillTrends,
  fetchJobTypes,
  updateRegionPerformance,
  updateClientSatisfaction,
  updateJobOrderTrend
} from './api';

// Re-export hooks
export {
  useJobOrders,
  useJobOrder,
  useCreateJobOrder,
  useUpdateJobOrder,
  useDeleteJobOrder,
  useJobOrdersByStatus,
  useJobOrdersByClient,
  useRegionPerformance,
  useUpdateRegionPerformance,
  useTopPerformers,
  useTopPerformersByRegion,
  useClientSatisfaction,
  useUpdateClientSatisfaction,
  useJobOrderTrends,
  useUpdateJobOrderTrend,
  useTimeToFillTrends,
  useJobTypes
} from './useOperations';
