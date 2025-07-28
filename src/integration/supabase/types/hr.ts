/**
 * HR types for Supabase integration
 * These types define the HR structure and related interfaces
 */

import { Json } from './database';

/**
 * Department interface representing the hr_departments table in Supabase
 */
export interface HRDepartment {
  id: number;
  name: string;
  headcount: number;
  manager: string;
  open_positions: number;
  turnover_rate: string;
  avg_tenure: string;
  budget: string;
  status: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * DepartmentStatus enum
 */
export type DepartmentStatus = 'Growing' | 'Stable' | 'Downsizing';

/**
 * JobListing interface representing the hr_job_listings table in Supabase
 */
export interface JobListing {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  posted_date: string;
  applications: number;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * JobStatus enum
 */
export type JobStatus = 'Open' | 'Closed' | 'Filled';

/**
 * JobType enum
 */
export type HRJobType = 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship';

/**
 * Employee interface representing the hr_employees table in Supabase
 */
export interface Employee {
  id: number;
  name: string;
  department_id: number;
  position: string;
  hire_date: string;
  salary: number;
  status: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * EmployeeStatus enum
 */
export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated';

/**
 * DiversityMetrics interface representing the hr_diversity_metrics table in Supabase
 */
export interface DiversityMetrics {
  id: number;
  department_id: number;
  gender_distribution: Json;
  ethnicity_breakdown: Json;
  age_demographics: Json;
  reporting_period: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend department type that matches the structure in DepartmentDetail.tsx
 */
export interface FrontendHRDepartment {
  id: number;
  name: string;
  headcount: number;
  manager: string;
  openPositions: number;
  turnoverRate: string;
  avgTenure: string;
  budget: string;
  status: DepartmentStatus;
}

/**
 * Frontend job listing type that matches the structure in JobListings.tsx
 */
export interface FrontendJobListing {
  id: number;
  title: string;
  department: string;
  location: string;
  type: HRJobType;
  experience: string;
  postedDate: string;
  applications: number;
  status: JobStatus;
  description?: string;
}

/**
 * Frontend employee type
 */
export interface FrontendEmployee {
  id: number;
  name: string;
  departmentId: number;
  position: string;
  hireDate: string;
  salary: number;
  status: EmployeeStatus;
}

/**
 * Frontend diversity metrics type
 */
export interface FrontendDiversityMetrics {
  id: number;
  departmentId: number;
  genderDistribution: Record<string, number>;
  ethnicityBreakdown: Record<string, number>;
  ageDemographics: Record<string, number>;
  reportingPeriod: string;
}

/**
 * Maps a database department to the frontend department format
 */
export const mapDatabaseHRDepartmentToFrontend = (dbDepartment: HRDepartment): FrontendHRDepartment => {
  return {
    id: dbDepartment.id,
    name: dbDepartment.name,
    headcount: dbDepartment.headcount,
    manager: dbDepartment.manager,
    openPositions: dbDepartment.open_positions,
    turnoverRate: dbDepartment.turnover_rate,
    avgTenure: dbDepartment.avg_tenure,
    budget: dbDepartment.budget,
    status: dbDepartment.status as DepartmentStatus
  };
};

/**
 * Maps a database job listing to the frontend job listing format
 */
export const mapDatabaseJobListingToFrontend = (dbJobListing: JobListing): FrontendJobListing => {
  return {
    id: dbJobListing.id,
    title: dbJobListing.title,
    department: dbJobListing.department,
    location: dbJobListing.location,
    type: dbJobListing.type as HRJobType,
    experience: dbJobListing.experience,
    postedDate: dbJobListing.posted_date,
    applications: dbJobListing.applications,
    status: dbJobListing.status as JobStatus,
    description: dbJobListing.description || undefined
  };
};

/**
 * Maps a database employee to the frontend employee format
 */
export const mapDatabaseEmployeeToFrontend = (dbEmployee: Employee): FrontendEmployee => {
  return {
    id: dbEmployee.id,
    name: dbEmployee.name,
    departmentId: dbEmployee.department_id,
    position: dbEmployee.position,
    hireDate: dbEmployee.hire_date,
    salary: dbEmployee.salary,
    status: dbEmployee.status as EmployeeStatus
  };
};

/**
 * Maps a database diversity metrics to the frontend format
 */
export const mapDatabaseDiversityMetricsToFrontend = (
  dbMetrics: DiversityMetrics
): FrontendDiversityMetrics => {
  return {
    id: dbMetrics.id,
    departmentId: dbMetrics.department_id,
    genderDistribution: dbMetrics.gender_distribution as Record<string, number>,
    ethnicityBreakdown: dbMetrics.ethnicity_breakdown as Record<string, number>,
    ageDemographics: dbMetrics.age_demographics as Record<string, number>,
    reportingPeriod: dbMetrics.reporting_period
  };
};
