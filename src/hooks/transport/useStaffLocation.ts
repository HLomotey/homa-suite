import { useState } from "react";
import { supabase } from "@/integration/supabase/client";
import { FrontendStaffLocation, StaffLocation, StaffLocationFormData } from "@/integration/supabase/types/staffLocation";
import { FrontendLocation } from "@/integration/supabase/types/location";
import useLocation from "./useLocation";

export default function useStaffLocation() {
  const [staffLocations, setStaffLocations] = useState<FrontendStaffLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { locations } = useLocation();

  const fetchStaffLocations = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("staff_locations")
        .select("*");
      
      if (error) throw error;
      
      // Map the data to include company location names
      const mappedData = data.map((item: StaffLocation) => {
        const companyLocation = locations.find(
          (loc) => loc.id === item.company_location_id
        );
        return {
          id: item.id,
          companyLocationId: item.company_location_id,
          companyLocationName: companyLocation?.name || "Unknown",
          locationCode: item.location_code,
          locationDescription: item.location_description,
          isActive: item.is_active,
        };
      });

      setStaffLocations(mappedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching staff locations:", err);
      setError("Failed to fetch staff locations");
      setLoading(false);
    }
  };

  const createStaffLocation = async (data: StaffLocationFormData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: newLocation, error } = await supabase
        .from("staff_locations")
        .insert([{
          company_location_id: data.companyLocationId,
          location_code: data.locationCode,
          location_description: data.locationDescription,
          is_active: data.isActive
        }])
        .select()
        .single();
      
      if (error) throw error;

      // Map the new location to frontend format
      const companyLocation = locations.find(loc => loc.id === data.companyLocationId);
      const frontendLocation: FrontendStaffLocation = {
        id: newLocation.id,
        companyLocationId: newLocation.company_location_id,
        companyLocationName: companyLocation?.name || "Unknown",
        locationCode: newLocation.location_code,
        locationDescription: newLocation.location_description,
        isActive: newLocation.is_active
      };

      setStaffLocations(prev => [...prev, frontendLocation]);
      setLoading(false);
      return frontendLocation;
    } catch (err) {
      console.error("Error creating staff location:", err);
      setError("Failed to create staff location");
      setLoading(false);
      throw err;
    }
  };

  const updateStaffLocation = async (id: string, data: StaffLocationFormData) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("staff_locations")
        .update({
          company_location_id: data.companyLocationId,
          location_code: data.locationCode,
          location_description: data.locationDescription,
          is_active: data.isActive,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      
      if (error) throw error;

      // Update the local state
      setStaffLocations(prev => 
        prev.map(loc => 
          loc.id === id 
            ? {
                ...loc,
                companyLocationId: data.companyLocationId,
                locationCode: data.locationCode,
                locationDescription: data.locationDescription,
                isActive: data.isActive,
                companyLocationName: locations.find(l => l.id === data.companyLocationId)?.name,
              }
            : loc
        )
      );

      setLoading(false);
    } catch (err) {
      console.error("Error updating staff location:", err);
      setError("Failed to update staff location");
      setLoading(false);
      throw err;
    }
  };

  const deleteStaffLocation = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("staff_locations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;

      // Update local state
      setStaffLocations(prev => prev.filter(loc => loc.id !== id));
      setLoading(false);
    } catch (err) {
      console.error("Error deleting staff location:", err);
      setError("Failed to delete staff location");
      setLoading(false);
      throw err;
    }
  };

  return {
    staffLocations,
    loading,
    error,
    fetchStaffLocations,
    createStaffLocation,
    updateStaffLocation,
    deleteStaffLocation,
  };
}
