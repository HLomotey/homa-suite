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
 * Fetch all Housing & Transportation with optional filtering
 */
export async function fetchStaffBenefits(filters?: {
  status?: BenefitStatus;
  benefit_type?: BenefitType;
  staff_id?: string;
  staff_location_id?: string;
}): Promise<FrontendStaffBenefit[]> {
  console.log('fetchStaffBenefits called with filters:', filters);
  
  try {
    let query = supabase
      .from('staff_benefits')
      .select('*')
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

    console.log('Executing staff_benefits query...');
    const { data, error } = await query;

    if (error) {
      console.error('Supabase error in fetchStaffBenefits:', error);
      throw new Error(`Failed to fetch Housing & Transportation: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('No Housing & Transportation data found');
      return [];
    }

  // Get unique staff IDs and location IDs for batch fetching
  const staffIds = [...new Set(data.map(b => b.staff_id).filter(Boolean))];
  const locationIds = [...new Set(data.map(b => b.staff_location_id).filter(Boolean))];

  // Fetch external staff data
  let staffData: any[] = [];
  if (staffIds.length > 0) {
    const { data: staffResult, error: staffError } = await supabase
      .from('external_staff')
      .select('"PAYROLL FIRST NAME", "PAYROLL LAST NAME", "WORK E-MAIL", "HOME DEPARTMENT", "JOB TITLE", id')
      .in('id', staffIds);
    
    if (!staffError) {
      staffData = staffResult || [];
    }
  }

  // Fetch location data
  let locationData: any[] = [];
  if (locationIds.length > 0) {
    const { data: locationResult, error: locationError } = await supabase
      .from('staff_locations')
      .select('id, location_description')
      .in('id', locationIds);
    
    if (!locationError) {
      locationData = locationResult || [];
    }
  }

  // Create lookup maps
  const staffMap = new Map(staffData.map(s => [s.id, s]));
  const locationMap = new Map(locationData.map(l => [l.id, l]));

  // Enhance benefits with related data
  return data.map(benefit => {
    const staff = staffMap.get(benefit.staff_id);
    const location = locationMap.get(benefit.staff_location_id);

    return {
      ...benefit,
      staff_name: staff ? 
        `${staff["PAYROLL FIRST NAME"] || ""} ${staff["PAYROLL LAST NAME"] || ""}`.trim() : 
        null,
      staff_email: staff?.["WORK E-MAIL"] || null,
      staff_department: staff?.["HOME DEPARTMENT"] || null,
      staff_job_title: staff?.["JOB TITLE"] || null,
      staff_location_name: location?.location_description || null,
    };
  });
  } catch (error) {
    console.error('Error in fetchStaffBenefits:', error);
    throw error;
  }
}

/**
 * Fetch Housing & Transportation for a specific staff member
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
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch staff benefit: ${error.message}`);
  }

  // Fetch related data separately
  let staff = null;
  let location = null;

  if (data.staff_id) {
    const { data: staffResult } = await supabase
      .from('external_staff')
      .select('"PAYROLL FIRST NAME", "PAYROLL LAST NAME", "WORK E-MAIL", "HOME DEPARTMENT", "JOB TITLE"')
      .eq('id', data.staff_id)
      .single();
    staff = staffResult;
  }

  if (data.staff_location_id) {
    const { data: locationResult } = await supabase
      .from('staff_locations')
      .select('location_description')
      .eq('id', data.staff_location_id)
      .single();
    location = locationResult;
  }

  return {
    ...data,
    staff_name: staff ? 
      `${staff["PAYROLL FIRST NAME"] || ""} ${staff["PAYROLL LAST NAME"] || ""}`.trim() : 
      null,
    staff_email: staff?.["WORK E-MAIL"] || null,
    staff_department: staff?.["HOME DEPARTMENT"] || null,
    staff_job_title: staff?.["JOB TITLE"] || null,
    staff_location_name: location?.location_description || null,
  };
}

/**
 * Create a new staff benefit
 */
export async function createStaffBenefit(benefit: CreateStaffBenefit): Promise<FrontendStaffBenefit> {
  console.log('Creating staff benefit with data:', benefit);
  
  // Clean up date and UUID fields - convert empty strings to null
  const cleanBenefit = {
    ...benefit,
    effective_date: benefit.effective_date || null,
    expiry_date: benefit.expiry_date || null,
    staff_location_id: benefit.staff_location_id || null,
    approved_by: benefit.approved_by || null,
  };
  
  const { data, error } = await supabase
    .from('staff_benefits')
    .insert([cleanBenefit])
    .select('*')
    .single();

  if (error) {
    console.error('Supabase error details:', error);
    throw new Error(`Failed to create staff benefit: ${error.message} (Code: ${error.code})`);
  }

  // Fetch related data separately
  let staff = null;
  let location = null;

  if (data.staff_id) {
    const { data: staffResult } = await supabase
      .from('external_staff')
      .select('"PAYROLL FIRST NAME", "PAYROLL LAST NAME", "WORK E-MAIL", "HOME DEPARTMENT", "JOB TITLE"')
      .eq('id', data.staff_id)
      .single();
    staff = staffResult;
  }

  if (data.staff_location_id) {
    const { data: locationResult } = await supabase
      .from('staff_locations')
      .select('location_description')
      .eq('id', data.staff_location_id)
      .single();
    location = locationResult;
  }

  return {
    ...data,
    staff_name: staff ? 
      `${staff["PAYROLL FIRST NAME"] || ""} ${staff["PAYROLL LAST NAME"] || ""}`.trim() : 
      null,
    staff_email: staff?.["WORK E-MAIL"] || null,
    staff_department: staff?.["HOME DEPARTMENT"] || null,
    staff_job_title: staff?.["JOB TITLE"] || null,
    staff_location_name: location?.location_description || null,
  };
}

/**
 * Update an existing staff benefit
 */
export async function updateStaffBenefit(id: string, updates: UpdateStaffBenefit): Promise<FrontendStaffBenefit> {
  // Clean up date and UUID fields - convert empty strings to null
  const cleanUpdates = {
    ...updates,
    effective_date: updates.effective_date === "" ? null : updates.effective_date,
    expiry_date: updates.expiry_date === "" ? null : updates.expiry_date,
    staff_location_id: updates.staff_location_id === "" ? null : updates.staff_location_id,
    updated_by: updates.updated_by === "" ? null : updates.updated_by,
    approved_by: updates.approved_by === "" ? null : updates.approved_by,
  };
  
  const { data, error } = await supabase
    .from('staff_benefits')
    .update(cleanUpdates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update staff benefit: ${error.message}`);
  }

  // Fetch related data separately
  let staff = null;
  let location = null;

  if (data.staff_id) {
    const { data: staffResult } = await supabase
      .from('external_staff')
      .select('"PAYROLL FIRST NAME", "PAYROLL LAST NAME", "WORK E-MAIL", "HOME DEPARTMENT", "JOB TITLE"')
      .eq('id', data.staff_id)
      .single();
    staff = staffResult;
  }

  if (data.staff_location_id) {
    const { data: locationResult } = await supabase
      .from('staff_locations')
      .select('location_description')
      .eq('id', data.staff_location_id)
      .single();
    location = locationResult;
  }

  return {
    ...data,
    staff_name: staff ? 
      `${staff["PAYROLL FIRST NAME"] || ""} ${staff["PAYROLL LAST NAME"] || ""}`.trim() : 
      null,
    staff_email: staff?.["WORK E-MAIL"] || null,
    staff_department: staff?.["HOME DEPARTMENT"] || null,
    staff_job_title: staff?.["JOB TITLE"] || null,
    staff_location_name: location?.location_description || null,
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
 * Fetch Housing & Transportation statistics
 */
export async function fetchStaffBenefitsStats(): Promise<StaffBenefitStats> {
  const { data, error } = await supabase
    .from('staff_benefits')
    .select('benefit_type, status, staff_id');

  if (error) {
    throw new Error(`Failed to fetch Housing & Transportation stats: ${error.message}`);
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
