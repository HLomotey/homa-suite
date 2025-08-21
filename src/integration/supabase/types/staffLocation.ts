export interface StaffLocation {
  id: string;
  company_location_id: string;
  location_code: string;
  location_description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface FrontendStaffLocation {
  id: string;
  companyLocationId: string;
  companyLocationName?: string;
  locationCode: string;
  locationDescription: string;
  isActive: boolean;
}

export interface StaffLocationFormData {
  companyLocationId: string;
  locationCode: string;
  locationDescription: string;
  isActive: boolean;
}
