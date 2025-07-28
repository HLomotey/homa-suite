/**
 * HR API functions for Supabase integration
 * These functions handle direct communication with Supabase for HR data
 */

import { supabase } from "../../integration/supabase/client";
import {
  HRDepartment,
  JobListing,
  Employee,
  DiversityMetrics,
  FrontendHRDepartment,
  FrontendJobListing,
  FrontendEmployee,
  FrontendDiversityMetrics,
  DepartmentStatus,
  JobStatus,
  HRJobType,
  EmployeeStatus,
  mapDatabaseHRDepartmentToFrontend,
  mapDatabaseJobListingToFrontend,
  mapDatabaseEmployeeToFrontend,
  mapDatabaseDiversityMetricsToFrontend
} from "../../integration/supabase/types";

/**
 * Fetch all HR departments from Supabase
 * @returns Promise with array of departments
 */
export const fetchHRDepartments = async (): Promise<FrontendHRDepartment[]> => {
  const { data, error } = await supabase
    .from("hr_departments")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching HR departments:", error);
    throw new Error(error.message);
  }

  return (data as HRDepartment[]).map(mapDatabaseHRDepartmentToFrontend);
};

/**
 * Fetch a single HR department by ID
 * @param id Department ID
 * @returns Promise with department data
 */
export const fetchHRDepartmentById = async (
  id: number
): Promise<FrontendHRDepartment> => {
  const { data, error } = await supabase
    .from("hr_departments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching HR department with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseHRDepartmentToFrontend(data as HRDepartment);
};

/**
 * Create a new HR department
 * @param department Department data to create
 * @returns Promise with created department data
 */
export const createHRDepartment = async (
  department: Omit<FrontendHRDepartment, "id">
): Promise<FrontendHRDepartment> => {
  // Convert frontend department to database format
  const dbDepartment = {
    name: department.name,
    headcount: department.headcount,
    manager: department.manager,
    open_positions: department.openPositions,
    turnover_rate: department.turnoverRate,
    avg_tenure: department.avgTenure,
    budget: department.budget,
    status: department.status
  };

  const { data, error } = await supabase
    .from("hr_departments")
    .insert(dbDepartment)
    .select()
    .single();

  if (error) {
    console.error("Error creating HR department:", error);
    throw new Error(error.message);
  }

  return mapDatabaseHRDepartmentToFrontend(data as HRDepartment);
};

/**
 * Update an existing HR department
 * @param id Department ID
 * @param department Department data to update
 * @returns Promise with updated department data
 */
export const updateHRDepartment = async (
  id: number,
  department: Partial<Omit<FrontendHRDepartment, "id">>
): Promise<FrontendHRDepartment> => {
  // Convert frontend department to database format
  const dbDepartment: any = {};
  
  if (department.name !== undefined) dbDepartment.name = department.name;
  if (department.headcount !== undefined) dbDepartment.headcount = department.headcount;
  if (department.manager !== undefined) dbDepartment.manager = department.manager;
  if (department.openPositions !== undefined) dbDepartment.open_positions = department.openPositions;
  if (department.turnoverRate !== undefined) dbDepartment.turnover_rate = department.turnoverRate;
  if (department.avgTenure !== undefined) dbDepartment.avg_tenure = department.avgTenure;
  if (department.budget !== undefined) dbDepartment.budget = department.budget;
  if (department.status !== undefined) dbDepartment.status = department.status;

  const { data, error } = await supabase
    .from("hr_departments")
    .update(dbDepartment)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating HR department with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseHRDepartmentToFrontend(data as HRDepartment);
};

/**
 * Delete an HR department
 * @param id Department ID
 * @returns Promise with success status
 */
export const deleteHRDepartment = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from("hr_departments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting HR department with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch HR departments by status
 * @param status Department status to filter by
 * @returns Promise with array of departments
 */
export const fetchHRDepartmentsByStatus = async (
  status: DepartmentStatus
): Promise<FrontendHRDepartment[]> => {
  const { data, error } = await supabase
    .from("hr_departments")
    .select("*")
    .eq("status", status)
    .order("name", { ascending: true });

  if (error) {
    console.error(`Error fetching HR departments with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as HRDepartment[]).map(mapDatabaseHRDepartmentToFrontend);
};

/**
 * Fetch all job listings from Supabase
 * @returns Promise with array of job listings
 */
export const fetchJobListings = async (): Promise<FrontendJobListing[]> => {
  const { data, error } = await supabase
    .from("hr_job_listings")
    .select("*")
    .order("posted_date", { ascending: false });

  if (error) {
    console.error("Error fetching job listings:", error);
    throw new Error(error.message);
  }

  return (data as JobListing[]).map(mapDatabaseJobListingToFrontend);
};

/**
 * Fetch a single job listing by ID
 * @param id Job listing ID
 * @returns Promise with job listing data
 */
export const fetchJobListingById = async (
  id: number
): Promise<FrontendJobListing> => {
  const { data, error } = await supabase
    .from("hr_job_listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching job listing with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseJobListingToFrontend(data as JobListing);
};

/**
 * Create a new job listing
 * @param jobListing Job listing data to create
 * @returns Promise with created job listing data
 */
export const createJobListing = async (
  jobListing: Omit<FrontendJobListing, "id">
): Promise<FrontendJobListing> => {
  // Convert frontend job listing to database format
  const dbJobListing = {
    title: jobListing.title,
    department: jobListing.department,
    location: jobListing.location,
    type: jobListing.type,
    experience: jobListing.experience,
    posted_date: jobListing.postedDate,
    applications: jobListing.applications,
    status: jobListing.status,
    description: jobListing.description || null
  };

  const { data, error } = await supabase
    .from("hr_job_listings")
    .insert(dbJobListing)
    .select()
    .single();

  if (error) {
    console.error("Error creating job listing:", error);
    throw new Error(error.message);
  }

  return mapDatabaseJobListingToFrontend(data as JobListing);
};

/**
 * Update an existing job listing
 * @param id Job listing ID
 * @param jobListing Job listing data to update
 * @returns Promise with updated job listing data
 */
export const updateJobListing = async (
  id: number,
  jobListing: Partial<Omit<FrontendJobListing, "id">>
): Promise<FrontendJobListing> => {
  // Convert frontend job listing to database format
  const dbJobListing: any = {};
  
  if (jobListing.title !== undefined) dbJobListing.title = jobListing.title;
  if (jobListing.department !== undefined) dbJobListing.department = jobListing.department;
  if (jobListing.location !== undefined) dbJobListing.location = jobListing.location;
  if (jobListing.type !== undefined) dbJobListing.type = jobListing.type;
  if (jobListing.experience !== undefined) dbJobListing.experience = jobListing.experience;
  if (jobListing.postedDate !== undefined) dbJobListing.posted_date = jobListing.postedDate;
  if (jobListing.applications !== undefined) dbJobListing.applications = jobListing.applications;
  if (jobListing.status !== undefined) dbJobListing.status = jobListing.status;
  if (jobListing.description !== undefined) dbJobListing.description = jobListing.description || null;

  const { data, error } = await supabase
    .from("hr_job_listings")
    .update(dbJobListing)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating job listing with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseJobListingToFrontend(data as JobListing);
};

/**
 * Delete a job listing
 * @param id Job listing ID
 * @returns Promise with success status
 */
export const deleteJobListing = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from("hr_job_listings")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting job listing with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch job listings by status
 * @param status Job status to filter by
 * @returns Promise with array of job listings
 */
export const fetchJobListingsByStatus = async (
  status: JobStatus
): Promise<FrontendJobListing[]> => {
  const { data, error } = await supabase
    .from("hr_job_listings")
    .select("*")
    .eq("status", status)
    .order("posted_date", { ascending: false });

  if (error) {
    console.error(`Error fetching job listings with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as JobListing[]).map(mapDatabaseJobListingToFrontend);
};

/**
 * Fetch job listings by type
 * @param type Job type to filter by
 * @returns Promise with array of job listings
 */
export const fetchJobListingsByType = async (
  type: HRJobType
): Promise<FrontendJobListing[]> => {
  const { data, error } = await supabase
    .from("hr_job_listings")
    .select("*")
    .eq("type", type)
    .order("posted_date", { ascending: false });

  if (error) {
    console.error(`Error fetching job listings with type ${type}:`, error);
    throw new Error(error.message);
  }

  return (data as JobListing[]).map(mapDatabaseJobListingToFrontend);
};

/**
 * Fetch job listings by department
 * @param department Department name to filter by
 * @returns Promise with array of job listings
 */
export const fetchJobListingsByDepartment = async (
  department: string
): Promise<FrontendJobListing[]> => {
  const { data, error } = await supabase
    .from("hr_job_listings")
    .select("*")
    .eq("department", department)
    .order("posted_date", { ascending: false });

  if (error) {
    console.error(`Error fetching job listings for department ${department}:`, error);
    throw new Error(error.message);
  }

  return (data as JobListing[]).map(mapDatabaseJobListingToFrontend);
};

/**
 * Fetch all employees from Supabase
 * @returns Promise with array of employees
 */
export const fetchEmployees = async (): Promise<FrontendEmployee[]> => {
  const { data, error } = await supabase
    .from("hr_employees")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching employees:", error);
    throw new Error(error.message);
  }

  return (data as Employee[]).map(mapDatabaseEmployeeToFrontend);
};

/**
 * Fetch a single employee by ID
 * @param id Employee ID
 * @returns Promise with employee data
 */
export const fetchEmployeeById = async (
  id: number
): Promise<FrontendEmployee> => {
  const { data, error } = await supabase
    .from("hr_employees")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching employee with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseEmployeeToFrontend(data as Employee);
};

/**
 * Create a new employee
 * @param employee Employee data to create
 * @returns Promise with created employee data
 */
export const createEmployee = async (
  employee: Omit<FrontendEmployee, "id">
): Promise<FrontendEmployee> => {
  // Convert frontend employee to database format
  const dbEmployee = {
    name: employee.name,
    department_id: employee.departmentId,
    position: employee.position,
    hire_date: employee.hireDate,
    salary: employee.salary,
    status: employee.status
  };

  const { data, error } = await supabase
    .from("hr_employees")
    .insert(dbEmployee)
    .select()
    .single();

  if (error) {
    console.error("Error creating employee:", error);
    throw new Error(error.message);
  }

  return mapDatabaseEmployeeToFrontend(data as Employee);
};

/**
 * Update an existing employee
 * @param id Employee ID
 * @param employee Employee data to update
 * @returns Promise with updated employee data
 */
export const updateEmployee = async (
  id: number,
  employee: Partial<Omit<FrontendEmployee, "id">>
): Promise<FrontendEmployee> => {
  // Convert frontend employee to database format
  const dbEmployee: any = {};
  
  if (employee.name !== undefined) dbEmployee.name = employee.name;
  if (employee.departmentId !== undefined) dbEmployee.department_id = employee.departmentId;
  if (employee.position !== undefined) dbEmployee.position = employee.position;
  if (employee.hireDate !== undefined) dbEmployee.hire_date = employee.hireDate;
  if (employee.salary !== undefined) dbEmployee.salary = employee.salary;
  if (employee.status !== undefined) dbEmployee.status = employee.status;

  const { data, error } = await supabase
    .from("hr_employees")
    .update(dbEmployee)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating employee with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseEmployeeToFrontend(data as Employee);
};

/**
 * Delete an employee
 * @param id Employee ID
 * @returns Promise with success status
 */
export const deleteEmployee = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from("hr_employees")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting employee with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch employees by department ID
 * @param departmentId Department ID to filter by
 * @returns Promise with array of employees
 */
export const fetchEmployeesByDepartment = async (
  departmentId: number
): Promise<FrontendEmployee[]> => {
  const { data, error } = await supabase
    .from("hr_employees")
    .select("*")
    .eq("department_id", departmentId)
    .order("name", { ascending: true });

  if (error) {
    console.error(`Error fetching employees for department ID ${departmentId}:`, error);
    throw new Error(error.message);
  }

  return (data as Employee[]).map(mapDatabaseEmployeeToFrontend);
};

/**
 * Fetch employees by status
 * @param status Employee status to filter by
 * @returns Promise with array of employees
 */
export const fetchEmployeesByStatus = async (
  status: EmployeeStatus
): Promise<FrontendEmployee[]> => {
  const { data, error } = await supabase
    .from("hr_employees")
    .select("*")
    .eq("status", status)
    .order("name", { ascending: true });

  if (error) {
    console.error(`Error fetching employees with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as Employee[]).map(mapDatabaseEmployeeToFrontend);
};

/**
 * Fetch diversity metrics for a department
 * @param departmentId Department ID to fetch metrics for
 * @returns Promise with diversity metrics data
 */
export const fetchDiversityMetrics = async (
  departmentId: number
): Promise<FrontendDiversityMetrics> => {
  const { data, error } = await supabase
    .from("hr_diversity_metrics")
    .select("*")
    .eq("department_id", departmentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error(`Error fetching diversity metrics for department ID ${departmentId}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseDiversityMetricsToFrontend(data as DiversityMetrics);
};

/**
 * Create or update diversity metrics for a department
 * @param metrics Diversity metrics data to create or update
 * @returns Promise with created/updated diversity metrics data
 */
export const updateDiversityMetrics = async (
  metrics: Omit<FrontendDiversityMetrics, "id">
): Promise<FrontendDiversityMetrics> => {
  // Convert frontend metrics to database format
  const dbMetrics = {
    department_id: metrics.departmentId,
    gender_distribution: metrics.genderDistribution,
    ethnicity_breakdown: metrics.ethnicityBreakdown,
    age_demographics: metrics.ageDemographics,
    reporting_period: metrics.reportingPeriod
  };

  // Check if metrics already exist for this department
  const { data: existingData, error: checkError } = await supabase
    .from("hr_diversity_metrics")
    .select("id")
    .eq("department_id", metrics.departmentId)
    .limit(1);

  if (checkError) {
    console.error(`Error checking existing diversity metrics:`, checkError);
    throw new Error(checkError.message);
  }

  let result;
  
  if (existingData && existingData.length > 0) {
    // Update existing metrics
    const { data, error } = await supabase
      .from("hr_diversity_metrics")
      .update(dbMetrics)
      .eq("id", existingData[0].id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating diversity metrics:`, error);
      throw new Error(error.message);
    }
    
    result = data;
  } else {
    // Create new metrics
    const { data, error } = await supabase
      .from("hr_diversity_metrics")
      .insert(dbMetrics)
      .select()
      .single();
      
    if (error) {
      console.error(`Error creating diversity metrics:`, error);
      throw new Error(error.message);
    }
    
    result = data;
  }

  return mapDatabaseDiversityMetricsToFrontend(result as DiversityMetrics);
};
