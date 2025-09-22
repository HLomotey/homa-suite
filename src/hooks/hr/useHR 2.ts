/**
 * HR hooks for Supabase integration
 * These hooks provide data fetching and state management for HR data
 */

import { useState, useEffect, useCallback } from "react";
import {
  FrontendHRDepartment,
  FrontendJobListing,
  FrontendEmployee,
  FrontendDiversityMetrics,
  DepartmentStatus,
  JobStatus,
  HRJobType,
  EmployeeStatus
} from "../../integration/supabase/types";
import * as hrApi from "./api";

/**
 * Hook for fetching all HR departments
 * @returns Object containing departments data, loading state, error state, and refetch function
 */
export const useHRDepartments = () => {
  const [departments, setDepartments] = useState<FrontendHRDepartment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.fetchHRDepartments();
      setDepartments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { departments, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single HR department by ID
 * @param id Department ID
 * @returns Object containing department data, loading state, error state, and refetch function
 */
export const useHRDepartment = (id: number) => {
  const [department, setDepartment] = useState<FrontendHRDepartment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.fetchHRDepartmentById(id);
      setDepartment(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { department, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new HR department
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateHRDepartment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdDepartment, setCreatedDepartment] = useState<FrontendHRDepartment | null>(null);

  const create = useCallback(
    async (departmentData: Omit<FrontendHRDepartment, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await hrApi.createHRDepartment(departmentData);
        setCreatedDepartment(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error, createdDepartment };
};

/**
 * Hook for updating an HR department
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateHRDepartment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedDepartment, setUpdatedDepartment] = useState<FrontendHRDepartment | null>(null);

  const update = useCallback(
    async (
      id: number,
      departmentData: Partial<Omit<FrontendHRDepartment, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await hrApi.updateHRDepartment(id, departmentData);
        setUpdatedDepartment(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { update, loading, error, updatedDepartment };
};

/**
 * Hook for deleting an HR department
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteHRDepartment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteDepartment = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await hrApi.deleteHRDepartment(id);
      setIsDeleted(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteDepartment, loading, error, isDeleted };
};

/**
 * Hook for fetching HR departments by status
 * @param status Department status to filter by
 * @returns Object containing departments data, loading state, error state, and refetch function
 */
export const useHRDepartmentsByStatus = (status: DepartmentStatus) => {
  const [departments, setDepartments] = useState<FrontendHRDepartment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.fetchHRDepartmentsByStatus(status);
      setDepartments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { departments, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching all job listings
 * @returns Object containing job listings data, loading state, error state, and refetch function
 */
export const useJobListings = () => {
  const [jobListings, setJobListings] = useState<FrontendJobListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.fetchJobListings();
      setJobListings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { jobListings, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single job listing by ID
 * @param id Job listing ID
 * @returns Object containing job listing data, loading state, error state, and refetch function
 */
export const useJobListing = (id: number) => {
  const [jobListing, setJobListing] = useState<FrontendJobListing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.fetchJobListingById(id);
      setJobListing(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { jobListing, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new job listing
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateJobListing = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdJobListing, setCreatedJobListing] = useState<FrontendJobListing | null>(null);

  const create = useCallback(
    async (jobListingData: Omit<FrontendJobListing, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await hrApi.createJobListing(jobListingData);
        setCreatedJobListing(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error, createdJobListing };
};

/**
 * Hook for updating a job listing
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateJobListing = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedJobListing, setUpdatedJobListing] = useState<FrontendJobListing | null>(null);

  const update = useCallback(
    async (
      id: number,
      jobListingData: Partial<Omit<FrontendJobListing, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await hrApi.updateJobListing(id, jobListingData);
        setUpdatedJobListing(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { update, loading, error, updatedJobListing };
};

/**
 * Hook for deleting a job listing
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteJobListing = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteJobListing = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await hrApi.deleteJobListing(id);
      setIsDeleted(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteJobListing, loading, error, isDeleted };
};

/**
 * Hook for fetching job listings by status
 * @param status Job status to filter by
 * @returns Object containing job listings data, loading state, error state, and refetch function
 */
export const useJobListingsByStatus = (status: JobStatus) => {
  const [jobListings, setJobListings] = useState<FrontendJobListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.fetchJobListingsByStatus(status);
      setJobListings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { jobListings, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching job listings by type
 * @param type Job type to filter by
 * @returns Object containing job listings data, loading state, error state, and refetch function
 */
export const useJobListingsByType = (type: HRJobType) => {
  const [jobListings, setJobListings] = useState<FrontendJobListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.fetchJobListingsByType(type);
      setJobListings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { jobListings, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching job listings by department
 * @param department Department name to filter by
 * @returns Object containing job listings data, loading state, error state, and refetch function
 */
export const useJobListingsByDepartment = (department: string) => {
  const [jobListings, setJobListings] = useState<FrontendJobListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.fetchJobListingsByDepartment(department);
      setJobListings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [department]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { jobListings, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching all employees
 * @returns Object containing employees data, loading state, error state, and refetch function
 */
export const useEmployees = () => {
  const [employees, setEmployees] = useState<FrontendEmployee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.fetchEmployees();
      setEmployees(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { employees, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single employee by ID
 * @param id Employee ID
 * @returns Object containing employee data, loading state, error state, and refetch function
 */
export const useEmployee = (id: number) => {
  const [employee, setEmployee] = useState<FrontendEmployee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.fetchEmployeeById(id);
      setEmployee(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { employee, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new employee
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateEmployee = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdEmployee, setCreatedEmployee] = useState<FrontendEmployee | null>(null);

  const create = useCallback(
    async (employeeData: Omit<FrontendEmployee, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await hrApi.createEmployee(employeeData);
        setCreatedEmployee(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error, createdEmployee };
};

/**
 * Hook for updating an employee
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateEmployee = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedEmployee, setUpdatedEmployee] = useState<FrontendEmployee | null>(null);

  const update = useCallback(
    async (
      id: number,
      employeeData: Partial<Omit<FrontendEmployee, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await hrApi.updateEmployee(id, employeeData);
        setUpdatedEmployee(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { update, loading, error, updatedEmployee };
};

/**
 * Hook for deleting an employee
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteEmployee = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteEmployee = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await hrApi.deleteEmployee(id);
      setIsDeleted(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteEmployee, loading, error, isDeleted };
};

/**
 * Hook for fetching employees by department ID
 * @param departmentId Department ID to filter by
 * @returns Object containing employees data, loading state, error state, and refetch function
 */
export const useEmployeesByDepartment = (departmentId: number) => {
  const [employees, setEmployees] = useState<FrontendEmployee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.fetchEmployeesByDepartment(departmentId);
      setEmployees(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { employees, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching employees by status
 * @param status Employee status to filter by
 * @returns Object containing employees data, loading state, error state, and refetch function
 */
export const useEmployeesByStatus = (status: EmployeeStatus) => {
  const [employees, setEmployees] = useState<FrontendEmployee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.fetchEmployeesByStatus(status);
      setEmployees(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { employees, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching diversity metrics for a department
 * @param departmentId Department ID to fetch metrics for
 * @returns Object containing diversity metrics data, loading state, error state, and refetch function
 */
export const useDiversityMetrics = (departmentId: number) => {
  const [diversityMetrics, setDiversityMetrics] = useState<FrontendDiversityMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!departmentId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.fetchDiversityMetrics(departmentId);
      setDiversityMetrics(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { diversityMetrics, loading, error, refetch: fetchData };
};

/**
 * Hook for updating diversity metrics
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateDiversityMetrics = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedMetrics, setUpdatedMetrics] = useState<FrontendDiversityMetrics | null>(null);

  const update = useCallback(
    async (metricsData: Omit<FrontendDiversityMetrics, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await hrApi.updateDiversityMetrics(metricsData);
        setUpdatedMetrics(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { update, loading, error, updatedMetrics };
};
