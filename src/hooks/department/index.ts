/**
 * Department module index file
 * Exports all department-related API functions and hooks
 */

// Re-export API functions
export {
  fetchDepartments,
  fetchDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  searchDepartmentsByName
} from './api';

// Re-export hooks
export {
  useDepartments,
  useDepartment,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useSearchDepartments
} from './useDepartment';
