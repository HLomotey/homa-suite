/**
 * External Staff types - using exact database column names throughout
 * These column names match the database exactly
 */

export interface ExternalStaff {
  id: string;
  "PAYROLL LAST NAME": string | null;
  "PAYROLL FIRST NAME": string | null;
  "PAYROLL MIDDLE NAME": string | null;
  "GENERATION SUFFIX": string | null;
  "GENDER (SELF-ID)": string | null;
  "BIRTH DATE": string | null;
  "PRIMARY ADDRESS LINE 1": string | null;
  "PRIMARY ADDRESS LINE 2": string | null;
  "PRIMARY ADDRESS LINE 3": string | null;
  "LIVED-IN STATE": string | null;
  "WORKED IN STATE": string | null;
  "PERSONAL E-MAIL": string | null;
  "WORK E-MAIL": string | null;
  "HOME PHONE": string | null;
  "WORK PHONE": string | null;
  "POSITION ID": string | null;
  "ASSOCIATE ID": string | null;
  "FILE NUMBER": string | null;
  "COMPANY CODE": string | null;
  "JOB TITLE": string | null;
  "BUSINESS UNIT": string | null;
  "HOME DEPARTMENT": string | null;
  "LOCATION": string | null;
  "WORKER CATEGORY": string | null;
  "POSITION STATUS": string | null;
  "HIRE DATE": string | null;
  "REHIRE DATE": string | null;
  "TERMINATION DATE": string | null;
  "YEARS OF SERVICE": string | null;
  "REPORTS TO NAME": string | null;
  "JOB CLASS": string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExternalStaff extends Omit<ExternalStaff, "id" | "created_at" | "updated_at"> {}

export interface UpdateExternalStaff extends Partial<Omit<ExternalStaff, "id" | "created_at">> {}

// Use the same interface for frontend to eliminate mapping complexity
export type FrontendExternalStaff = ExternalStaff;
