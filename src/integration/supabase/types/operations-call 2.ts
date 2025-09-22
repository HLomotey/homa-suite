/**
 * Operations Call (Ops Call) types for monthly operational reports
 */

export type OpsCallStatus = "draft" | "submitted" | "approved";

export interface OpsCall {
  id: string;
  
  // Basic Information
  hotel_site: string;
  start_date: string;
  end_date: string;
  status: OpsCallStatus;
  
  // Summary Section
  headline: string;
  narrative: string;
  
  // Occupancy Section
  start_occupancy_pct?: number;
  end_occupancy_pct?: number;
  average_occupancy_pct?: number;
  occupancy_notes?: string;
  
  // Cleanliness Section
  cleanliness_score?: number;
  cleanliness_notes?: string;
  
  // Groups Section
  groups_notes?: string;
  
  // Staffing Section
  staffing_notes?: string;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  approved_by?: string;
  approved_at?: string;
}

// Create and Update interfaces
export interface CreateOpsCall extends Omit<OpsCall, 'id' | 'created_at' | 'updated_at' | 'updated_by'> {}

export interface UpdateOpsCall extends Partial<Omit<OpsCall, 'id' | 'created_at' | 'created_by'>> {}

// Frontend interface with additional computed fields
export interface FrontendOpsCall extends OpsCall {
  // Computed fields
  property_name?: string;
  created_by_name?: string;
  approved_by_name?: string;
}

// Form data interface for React Hook Form
export interface OpsCallFormData {
  // Basic Information
  hotel_site: string;
  start_date: string;
  end_date: string;
  
  // Summary Section
  headline: string;
  narrative: string;
  
  // Occupancy Section
  start_occupancy_pct?: number;
  end_occupancy_pct?: number;
  average_occupancy_pct?: number;
  occupancy_notes?: string;
  
  // Cleanliness Section
  cleanliness_score?: number;
  cleanliness_notes?: string;
  
  // Groups Section
  groups_notes?: string;
  
  // Staffing Section
  staffing_notes?: string;
}

// Statistics interface
export interface OpsCallStats {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
  this_month: number;
  last_month: number;
  avg_occupancy: number;
  avg_cleanliness_score: number;
}

// Filter interface
export interface OpsCallFilters {
  status?: OpsCallStatus;
  hotel_site?: string;
  start_date?: string;
  end_date?: string;
  created_by?: string;
}
