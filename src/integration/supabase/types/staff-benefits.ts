/**
 * Housing & Transportation types for housing and Transportation Assignments */

export type BenefitType = "housing" | "transportation" | "flight_agreement" | "bus_card";
export type BenefitStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface StaffBenefitStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  suspended: number;
  housingBenefits: number;
  transportationBenefits: number;
  flightAgreementBenefits: number;
  busCardBenefits: number;
}

export interface StaffBenefit {
  id: string;
  staff_id: string;
  staff_location_id?: string;
  benefit_type: BenefitType;
  status: BenefitStatus;
  
  // General fields
  effective_date: string;
  expiry_date?: string;
  notes?: string;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface CreateStaffBenefit extends Omit<StaffBenefit, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {}

export interface UpdateStaffBenefit extends Partial<Omit<StaffBenefit, 'id' | 'created_at' | 'created_by'>> {}

// Frontend interface with additional computed fields and staff info
export interface FrontendStaffBenefit extends StaffBenefit {
  // Computed fields from joins
  staff_name?: string;
  staff_email?: string;
  staff_department?: string;
  staff_job_title?: string;
  staff_location_name?: string;
  staff_location_address?: string;
}

// Form data interface for the benefit form
export interface StaffBenefitFormData {
  staff_id: string;
  staff_location_id?: string;
  benefit_type: BenefitType;
  status?: BenefitStatus;
  
  // General fields
  effective_date: string;
  expiry_date?: string;
  notes?: string;
}
