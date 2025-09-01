import { useState, useEffect } from "react";
import { supabase } from "@/integration/supabase/client";
import { FrontendStaffLocation, StaffLocationFormData, FrontendStaffLocationHistory } from "@/integration/supabase/types/staffLocation";

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
            name
          ),
          manager:external_staff (
            id,
            "PAYROLL FIRST NAME",
            "PAYROLL LAST NAME"
          )
        `)
        .order('location_code');

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

      const { data: newLocation, error } = await supabase
        .from("staff_locations")
        .insert([{
          company_location_id: data.companyLocationId,
          location_code: data.locationCode,
          location_description: data.locationDescription,
          is_active: data.isActive,
          external_staff_id: data.externalStaffId,
          manager_id: data.managerId
        }])
        .select(`
          *,
          company_locations (
            name
          ),
          manager:external_staff (
            id,
            "PAYROLL FIRST NAME",
            "PAYROLL LAST NAME"
          )
        `)
        .single();
      
      if (error) throw error;

      const frontendLocation: FrontendStaffLocation = {
        id: newLocation.id,
        companyLocationId: newLocation.company_location_id,
        companyLocationName: newLocation.company_locations?.name || "Unknown",
        locationCode: newLocation.location_code,
        locationDescription: newLocation.location_description,
        isActive: newLocation.is_active,
        externalStaffId: newLocation.external_staff_id,
        managerId: newLocation.manager_id,
        managerName: newLocation.manager ? `${newLocation.manager.first_name} ${newLocation.manager.last_name}` : undefined,
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

      const { data: updatedLocation, error } = await supabase
        .from("staff_locations")
        .update({
          company_location_id: data.companyLocationId,
          location_code: data.locationCode,
          location_description: data.locationDescription,
          is_active: data.isActive,
          external_staff_id: data.externalStaffId,
          manager_id: data.managerId,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select(`
          *,
          company_locations (
            name
          ),
          manager:external_staff (
            id,
            "PAYROLL FIRST NAME",
            "PAYROLL LAST NAME"
          )
        `)
        .single();
      
      if (error) throw error;

      const frontendLocation: FrontendStaffLocation = {
        id: updatedLocation.id,
        companyLocationId: updatedLocation.company_location_id,
        companyLocationName: updatedLocation.company_locations?.name || "Unknown",
        locationCode: updatedLocation.location_code,
        locationDescription: updatedLocation.location_description,
        isActive: updatedLocation.is_active,
        externalStaffId: updatedLocation.external_staff_id,
        managerId: updatedLocation.manager_id,
        managerName: updatedLocation.manager ? `${updatedLocation.manager.first_name} ${updatedLocation.manager.last_name}` : undefined,
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
        .order("changed_at", { ascending: false });

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
