import { useState, useEffect } from "react";
import { supabase } from "@/integration/supabase/client";
import { FrontendStaffLocation, StaffLocationFormData, FrontendStaffLocationHistory } from "@/integration/supabase/types/staffLocation";
import type { Database } from "@/integration/supabase/types/database";

export default function useStaffLocation() {
  const [staffLocations, setStaffLocations] = useState<FrontendStaffLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching staff locations...');

      const { data, error } = await supabase
        .from("staff_locations")
        .select(`
          *,
          company_locations (
            name,
            state
          ),
          manager:external_staff (
            id,
            "PAYROLL FIRST NAME",
            "PAYROLL LAST NAME"
          ),
          company_accounts (
            id,
            name
          )
        `)
        .order('location_code') as { data: any[] | null; error: any };

      console.log('Staff locations response:', { data, error });

      if (error) {
        throw error;
      }

      // Always set staff locations, even if empty
      const frontendLocations = Array.isArray(data) 
        ? data.map((item: any) => ({
            id: item.id,
            companyLocationId: item.company_location_id,
            companyLocationName: item.company_locations?.name || "Unknown",
            locationCode: item.location_code,
            locationDescription: item.location_description,
            isActive: item.is_active,
            externalStaffId: item.external_staff_id,
            managerId: item.manager_id,
            managerName: item.manager ? `${item.manager["PAYROLL FIRST NAME"]} ${item.manager["PAYROLL LAST NAME"]}` : undefined,
            companyAccountId: item.company_account_id || undefined,
            companyAccountName: item.company_accounts?.name,
            state: item.state || item.company_locations?.state,
            derivedCompanyAccountName: item.company_account_name
          }))
        : [];
        
      console.log('Mapped staff locations:', frontendLocations);
      setStaffLocations(frontendLocations);
      
      return frontendLocations;
    } catch (err: unknown) {
      console.error('Error fetching staff locations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch staff locations');
      setStaffLocations([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createStaffLocation = async (data: StaffLocationFormData) => {
    try {
      setLoading(true);
      setError(null);

      const { data: newLocation, error } = await (supabase as any)
        .from("staff_locations")
        .insert({
          company_location_id: data.companyLocationId,
          location_code: data.locationCode,
          location_description: data.locationDescription,
          is_active: data.isActive,
          manager_id: data.managerId || null,
          company_account_id: data.companyAccountId || null
        })
        .select(`
          *,
          company_locations (
            name,
            state
          )
        `)
        .single();
      
      if (error) throw error;
      if (!newLocation) throw new Error("No data returned from insert");

      const frontendLocation: FrontendStaffLocation = {
        id: newLocation.id,
        companyLocationId: newLocation.company_location_id,
        companyLocationName: newLocation.company_locations?.name || "Unknown",
        locationCode: newLocation.location_code,
        locationDescription: newLocation.location_description,
        isActive: newLocation.is_active,
        externalStaffId: newLocation.external_staff_id,
        managerId: newLocation.manager_id,
        managerName: data.managerName,
        companyAccountId: newLocation.company_account_id || undefined,
        companyAccountName: newLocation.company_accounts?.name,
        state: newLocation.state || newLocation.company_locations?.state,
        derivedCompanyAccountName: newLocation.company_account_name,
      };

      setStaffLocations(prev => [...prev, frontendLocation]);
      return frontendLocation;
    } catch (err: unknown) {
      console.error("Error creating staff location:", err);
      setError(err instanceof Error ? err.message : "Failed to create staff location");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStaffLocation = async (id: string, data: StaffLocationFormData) => {
    try {
      setLoading(true);
      setError(null);

      const { data: updatedLocation, error } = await (supabase as any)
        .from("staff_locations")
        .update({
          company_location_id: data.companyLocationId,
          location_code: data.locationCode,
          location_description: data.locationDescription,
          is_active: data.isActive,
          manager_id: data.managerId || null,
          company_account_id: data.companyAccountId || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select(`
          *,
          company_locations (
            name,
            state
          ),
          company_accounts (
            id,
            name
          )
        `)
        .single();
      
      if (error) throw error;
      if (!updatedLocation) throw new Error("No data returned from update");

      const frontendLocation: FrontendStaffLocation = {
        id: updatedLocation.id,
        companyLocationId: updatedLocation.company_location_id,
        companyLocationName: updatedLocation.company_locations?.name || "Unknown",
        locationCode: updatedLocation.location_code,
        locationDescription: updatedLocation.location_description,
        isActive: updatedLocation.is_active,
        externalStaffId: updatedLocation.external_staff_id,
        managerId: updatedLocation.manager_id,
        managerName: data.managerName,
        companyAccountId: updatedLocation.company_account_id || undefined,
        companyAccountName: updatedLocation.company_accounts?.name,
        state: updatedLocation.state || updatedLocation.company_locations?.state,
        derivedCompanyAccountName: updatedLocation.company_account_name,
      };

      setStaffLocations(prev => 
        prev.map(loc => loc.id === id ? frontendLocation : loc)
      );

      return frontendLocation;
    } catch (err: unknown) {
      console.error("Error updating staff location:", err);
      setError(err instanceof Error ? err.message : "Failed to update staff location");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStaffLocation = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from("staff_locations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;

      setStaffLocations(prev => prev.filter(loc => loc.id !== id));
      return true;
    } catch (err: unknown) {
      console.error("Error deleting staff location:", err);
      setError(err instanceof Error ? err.message : "Failed to delete staff location");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffLocationHistory = async (staffLocationId: string): Promise<FrontendStaffLocationHistory[]> => {
    try {
      const { data, error } = await supabase
        .from("staff_locations_history")
        .select(`
          *,
          manager:external_staff (
            id,
            "PAYROLL FIRST NAME",
            "PAYROLL LAST NAME"
          )
        `)
        .eq("staff_location_id", staffLocationId)
        .order("changed_at", { ascending: false }) as { data: any[] | null; error: any };

      if (error) throw error;

      return Array.isArray(data) 
        ? data.map((item: any) => ({
            id: item.id,
            staffLocationId: item.staff_location_id,
            companyLocationId: item.company_location_id,
            locationCode: item.location_code,
            locationDescription: item.location_description,
            isActive: item.is_active,
            externalStaffId: item.external_staff_id,
            managerId: item.manager_id,
            managerName: item.manager ? `${item.manager["PAYROLL FIRST NAME"]} ${item.manager["PAYROLL LAST NAME"]}` : undefined,
            companyAccountId: item.company_account_id,
            companyAccountName: item.company_accounts?.name,
            changedAt: item.changed_at,
            changedBy: item.changed_by,
            changeType: item.change_type,
            oldValues: item.old_values,
            newValues: item.new_values,
          }))
        : [];
    } catch (err: unknown) {
      console.error("Error fetching staff location history:", err);
      throw err;
    }
  };

  // Load staff locations on component mount
  useEffect(() => {
    const loadStaffLocations = async () => {
      console.log('useStaffLocation - Initial load starting');
      await fetchStaffLocations();
      console.log('useStaffLocation - Initial load complete');
    };
    
    loadStaffLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    staffLocations,
    loading,
    error,
    fetchStaffLocations,
    createStaffLocation,
    updateStaffLocation,
    deleteStaffLocation,
    fetchStaffLocationHistory
  };
}
