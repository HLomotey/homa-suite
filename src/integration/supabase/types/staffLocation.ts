export interface StaffLocation {
  id: string;
  company_location_id: string;
  location_code: string;
  location_description: string;
  is_active: boolean;
  external_staff_id?: string;
  manager_id?: string;
  company_account_id?: number;
  state?: string;
  company_account_name?: string;
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
  externalStaffId?: string;
  externalStaffName?: string;
  managerId?: string;
  managerName?: string;
  companyAccountId?: number;
  companyAccountName?: string;
  state?: string;
  derivedCompanyAccountName?: string;
}

export interface StaffLocationFormData {
  companyLocationId: string;
  locationCode: string;
  locationDescription: string;
  isActive: boolean;
  managerId?: string;
  managerName?: string;
  companyAccountId?: number;
}

// History tracking interfaces
export interface StaffLocationHistory {
  id: string;
  staff_location_id: string;
  company_location_id: string;
  location_code: string;
  location_description: string;
  is_active: boolean;
  external_staff_id?: string;
  manager_id?: string;
  company_account_id?: number;
  changed_at: string;
  changed_by?: string;
  change_type: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
}

export interface FrontendStaffLocationHistory {
  id: string;
  staffLocationId: string;
  companyLocationId: string;
  locationCode: string;
  locationDescription: string;
  isActive: boolean;
  externalStaffId?: string;
  managerId?: string;
  managerName?: string;
  companyAccountId?: number;
  companyAccountName?: string;
  changedAt: string;
  changedBy?: string;
  changeType: 'INSERT' | 'UPDATE' | 'DELETE';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}
