/**
 * Month-End Reports types for Operations Call functionality
 */

export type ReportStatus = "draft" | "submitted" | "approved";
export type ActionItemStatus = "open" | "in_progress" | "done";

export interface MonthEndReport {
  id: string;
  
  // Meta information
  property_id?: string;
  property_name: string;
  start_date: string;
  end_date: string;
  prepared_by?: string;
  status: ReportStatus;
  
  // Summary tab
  headline: string;
  narrative: string;
  key_risks?: string[];
  key_wins?: string[];
  
  // Hotel Occupancy tab
  occupancy_start_pct?: number;
  occupancy_end_pct?: number;
  avg_occupancy_pct?: number;
  occupancy_notes?: string;
  
  // Guest Room Cleanliness tab
  cleanliness_score?: number;
  inspection_count?: number;
  issues_found?: number;
  cleanliness_comments?: string;
  
  // Staffing & Notes tab
  training_updates?: string;
  absenteeism_notes?: string;
  incidents?: string;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface MonthEndReportGroup {
  id: string;
  report_id: string;
  group_name: string;
  arrival_date: string;
  departure_date: string;
  rooms_blocked: number;
  notes?: string;
  
  // Audit fields
  created_at: string;
  updated_at: string;
}

export interface MonthEndReportActionItem {
  id: string;
  report_id: string;
  title: string;
  owner?: string;
  due_date?: string;
  status: ActionItemStatus;
  
  // Audit fields
  created_at: string;
  updated_at: string;
}

// Create interfaces
export interface CreateMonthEndReport extends Omit<MonthEndReport, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {}

export interface UpdateMonthEndReport extends Partial<Omit<MonthEndReport, 'id' | 'created_at' | 'created_by'>> {}

export interface CreateMonthEndReportGroup extends Omit<MonthEndReportGroup, 'id' | 'created_at' | 'updated_at'> {}

export interface UpdateMonthEndReportGroup extends Partial<Omit<MonthEndReportGroup, 'id' | 'created_at'>> {}

export interface CreateMonthEndReportActionItem extends Omit<MonthEndReportActionItem, 'id' | 'created_at' | 'updated_at'> {}

export interface UpdateMonthEndReportActionItem extends Partial<Omit<MonthEndReportActionItem, 'id' | 'created_at'>> {}

// Frontend interface with additional computed fields
export interface FrontendMonthEndReport extends MonthEndReport {
  // Related data
  groups?: MonthEndReportGroup[];
  action_items?: MonthEndReportActionItem[];
  
  // Computed fields
  prepared_by_name?: string;
  approved_by_name?: string;
  total_rooms_blocked?: number;
  open_action_items?: number;
  completed_action_items?: number;
}

// Form data interfaces for React Hook Form
export interface MonthEndReportFormData {
  // Meta information
  property_id?: string;
  property_name: string;
  start_date: string;
  end_date: string;
  
  // Summary tab
  headline: string;
  narrative: string;
  key_risks: string[];
  key_wins: string[];
  
  // Hotel Occupancy tab
  occupancy_start_pct?: number;
  occupancy_end_pct?: number;
  avg_occupancy_pct?: number;
  occupancy_notes?: string;
  
  // Guest Room Cleanliness tab
  cleanliness_score?: number;
  inspection_count?: number;
  issues_found?: number;
  cleanliness_comments?: string;
  
  // Staffing & Notes tab
  training_updates?: string;
  absenteeism_notes?: string;
  incidents?: string;
  
  // Dynamic lists
  groups: GroupFormData[];
  action_items: ActionItemFormData[];
}

export interface GroupFormData {
  id?: string;
  group_name: string;
  arrival_date: string;
  departure_date: string;
  rooms_blocked: number;
  notes?: string;
}

export interface ActionItemFormData {
  id?: string;
  title: string;
  owner?: string;
  due_date?: string;
  status: ActionItemStatus;
}

// Statistics interface
export interface MonthEndReportStats {
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
export interface MonthEndReportFilters {
  status?: ReportStatus;
  property_id?: string;
  start_date?: string;
  end_date?: string;
  prepared_by?: string;
}

// Property interface for dropdown
export interface PropertyOption {
  id?: string;
  name: string;
  location?: string;
}
