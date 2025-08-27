import { supabase } from '@/integration/supabase/client';
import { 
  StaffBenefit, 
  CreateStaffBenefit, 
  UpdateStaffBenefit, 
  FrontendStaffBenefit,
  StaffBenefitStats,
  BenefitStatus,
  BenefitType 
} from '@/integration/supabase/types/staff-benefits';

/**
 * Fetch all staff benefits with optional filtering
 */
export async function fetchStaffBenefits(filters?: {
  status?: BenefitStatus;
  benefit_type?: BenefitType;
  staff_id?: string;
  staff_location_id?: string;
}): Promise<FrontendStaffBenefit[]> {
  let query = supabase
    .from('staff_benefits')
    .select(`
      *,
      external_staff (
        "PAYROLL FIRST NAME",
        "PAYROLL LAST NAME", 
        "WORK E-MAIL",
        "HOME DEPARTMENT",
        "JOB TITLE"
      ),
      staff_locations (
        location_description
      )
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.benefit_type) {
    query = query.eq('benefit_type', filters.benefit_type);
  }
  if (filters?.staff_id) {
    query = query.eq('staff_id', filters.staff_id);
  }
  if (filters?.staff_location_id) {
    query = query.eq('staff_location_id', filters.staff_location_id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch staff benefits: ${error.message}`);
  }

  // Enhance with computed fields from external staff
  return (data || []).map(benefit => ({
    ...benefit,
    staff_name: benefit.external_staff ? 
      `${benefit.external_staff["PAYROLL FIRST NAME"] || ""} ${benefit.external_staff["PAYROLL LAST NAME"] || ""}`.trim() : 
      null,
    staff_email: benefit.external_staff?.["WORK E-MAIL"] || null,
    staff_department: benefit.external_staff?.["HOME DEPARTMENT"] || null,
    staff_job_title: benefit.external_staff?.["JOB TITLE"] || null,
    staff_location_name: benefit.staff_locations?.location_description || null,
  }));
}

/**
 * Fetch staff benefits for a specific staff member
 */
export async function fetchStaffBenefitsByStaffId(staffId: string): Promise<FrontendStaffBenefit[]> {
  return fetchStaffBenefits({ staff_id: staffId });
}

/**
 * Fetch a single staff benefit by ID
 */
export async function fetchStaffBenefitById(id: string): Promise<FrontendStaffBenefit | null> {
  const { data, error } = await supabase
    .from('staff_benefits')
    .select(`
      *,
      external_staff (
        "PAYROLL FIRST NAME",
        "PAYROLL LAST NAME", 
        "WORK E-MAIL",
        "HOME DEPARTMENT",
        "JOB TITLE"
      ),
      staff_locations (
        location_description
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch staff benefit: ${error.message}`);
  }

  return {
    ...data,
    staff_name: data.external_staff ? 
      `${data.external_staff["PAYROLL FIRST NAME"] || ""} ${data.external_staff["PAYROLL LAST NAME"] || ""}`.trim() : 
      null,
    staff_email: data.external_staff?.["WORK E-MAIL"] || null,
    staff_department: data.external_staff?.["HOME DEPARTMENT"] || null,
    staff_job_title: data.external_staff?.["JOB TITLE"] || null,
    staff_location_name: data.staff_locations?.location_description || null,
  };
}

/**
 * Create a new staff benefit
 */
export async function createStaffBenefit(benefit: CreateStaffBenefit): Promise<FrontendStaffBenefit> {
  const { data, error } = await supabase
    .from('staff_benefits')
    .insert([benefit])
    .select(`
      *,
      external_staff (
        "PAYROLL FIRST NAME",
        "PAYROLL LAST NAME", 
        "WORK E-MAIL",
        "HOME DEPARTMENT",
        "JOB TITLE"
      ),
      staff_locations (
        location_description
      )
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create staff benefit: ${error.message}`);
  }

  return {
    ...data,
    staff_name: data.external_staff ? 
      `${data.external_staff["PAYROLL FIRST NAME"] || ""} ${data.external_staff["PAYROLL LAST NAME"] || ""}`.trim() : 
      null,
    staff_email: data.external_staff?.["WORK E-MAIL"] || null,
    staff_department: data.external_staff?.["HOME DEPARTMENT"] || null,
    staff_job_title: data.external_staff?.["JOB TITLE"] || null,
    staff_location_name: data.staff_locations?.location_description || null,
  };
}

/**
 * Update an existing staff benefit
 */
export async function updateStaffBenefit(id: string, updates: UpdateStaffBenefit): Promise<FrontendStaffBenefit> {
  const { data, error } = await supabase
    .from('staff_benefits')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      external_staff (
        "PAYROLL FIRST NAME",
        "PAYROLL LAST NAME", 
        "WORK E-MAIL",
        "HOME DEPARTMENT",
        "JOB TITLE"
      ),
      staff_locations (
        location_description
      )
    `)
    .single();

  if (error) {
    throw new Error(`Failed to update staff benefit: ${error.message}`);
  }

  return {
    ...data,
    staff_name: data.external_staff ? 
      `${data.external_staff["PAYROLL FIRST NAME"] || ""} ${data.external_staff["PAYROLL LAST NAME"] || ""}`.trim() : 
      null,
    staff_email: data.external_staff?.["WORK E-MAIL"] || null,
    staff_department: data.external_staff?.["HOME DEPARTMENT"] || null,
    staff_job_title: data.external_staff?.["JOB TITLE"] || null,
    staff_location_name: data.staff_locations?.location_description || null,
  };
}

/**
 * Delete a staff benefit
 */
export async function deleteStaffBenefit(id: string): Promise<void> {
  const { error } = await supabase
    .from('staff_benefits')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete staff benefit: ${error.message}`);
  }
}

/**
 * Approve a staff benefit
 */
export async function approveStaffBenefit(id: string): Promise<FrontendStaffBenefit> {
  return updateStaffBenefit(id, {
    status: 'active',
    approved_at: new Date().toISOString()
  });
}

/**
 * Suspend a staff benefit
 */
export async function suspendStaffBenefit(id: string): Promise<FrontendStaffBenefit> {
  return updateStaffBenefit(id, {
    status: 'suspended'
  });
}

/**
 * Fetch staff locations for dropdown
 */
export async function fetchStaffLocations() {
  const { data, error } = await supabase
    .from('staff_locations')
    .select('id, location_code, location_description')
    .eq('is_active', true)
    .order('location_description');

  if (error) {
    throw new Error(`Failed to fetch staff locations: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch staff benefits statistics
 */
export async function fetchStaffBenefitsStats(): Promise<StaffBenefitStats> {
  const { data, error } = await supabase
    .from('staff_benefits')
    .select('benefit_type, status, staff_id');

  if (error) {
    throw new Error(`Failed to fetch staff benefits stats: ${error.message}`);
  }

  // Get unique staff members who have benefits
  const uniqueStaff = new Set(data?.map(b => b.staff_id) || []);

  const stats: StaffBenefitStats = {
    total: uniqueStaff.size, // Count unique staff with benefits
    active: data?.filter(b => b.status === 'active').length || 0,
    pending: data?.filter(b => b.status === 'pending').length || 0,
    inactive: data?.filter(b => b.status === 'inactive').length || 0,
    suspended: data?.filter(b => b.status === 'suspended').length || 0,
    housingBenefits: data?.filter(b => b.benefit_type === 'housing').length || 0,
    transportationBenefits: data?.filter(b => b.benefit_type === 'transportation').length || 0,
  };

  return stats;
}
