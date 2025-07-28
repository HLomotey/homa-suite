/**
 * Assignment module index file
 * Exports all assignment-related API functions and hooks
 */

// Re-export API functions
export {
  fetchAssignments,
  fetchAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  fetchAssignmentsByStatus,
  fetchAssignmentsByPaymentStatus,
  fetchAssignmentsByTenant,
  fetchAssignmentsByProperty
} from './api';

// Re-export hooks
export {
  useAssignments,
  useAssignment,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  useAssignmentsByStatus,
  useAssignmentsByPaymentStatus,
  useAssignmentsByTenant,
  useAssignmentsByProperty
} from './useAssignment';
