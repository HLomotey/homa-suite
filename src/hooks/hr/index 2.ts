/**
 * HR module index file
 * Exports all HR-related API functions and hooks
 */

// Re-export API functions
export {
  fetchHRDepartments,
  fetchHRDepartmentById,
  createHRDepartment,
  updateHRDepartment,
  deleteHRDepartment,
  fetchHRDepartmentsByStatus,
  fetchJobListings,
  fetchJobListingById,
  createJobListing,
  updateJobListing,
  deleteJobListing,
  fetchJobListingsByStatus,
  fetchJobListingsByType,
  fetchJobListingsByDepartment,
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchEmployeesByDepartment,
  fetchEmployeesByStatus,
  fetchDiversityMetrics,
  updateDiversityMetrics
} from './api';

// Re-export hooks
export {
  useHRDepartments,
  useHRDepartment,
  useCreateHRDepartment,
  useUpdateHRDepartment,
  useDeleteHRDepartment,
  useHRDepartmentsByStatus,
  useJobListings,
  useJobListing,
  useCreateJobListing,
  useUpdateJobListing,
  useDeleteJobListing,
  useJobListingsByStatus,
  useJobListingsByType,
  useJobListingsByDepartment,
  useEmployees,
  useEmployee,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useEmployeesByDepartment,
  useEmployeesByStatus,
  useDiversityMetrics,
  useUpdateDiversityMetrics
} from './useHR';
