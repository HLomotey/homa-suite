import { useState, useEffect } from "react";
import { supabase } from "@/integration/supabase/client";
import { FrontendStaffLocation, StaffLocation, StaffLocationFormData } from "@/integration/supabase/types/staffLocation";
import { FrontendLocation } from "@/integration/supabase/types/location";
import useLocation from "./useLocation";

export default function useStaffLocation() {
  const [staffLocations, setStaffLocations] = useState<FrontendStaffLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const { locations, loading: locationsLoading, fetchLocations } = useLocation();

  const fetchStaffLocations = async () => {
    console.log('fetchStaffLocations called, locationsLoading:', locationsLoading);
    
    // If we don't have locations yet, fetch them first
    if (locationsLoading || locations.length === 0) {
      console.log('Locations not ready, fetching locations first');
      await fetchLocations();
    }
    
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching staff locations from supabase');
      const { data, error } = await supabase
        .from("staff_locations")
        .select("*");
      
      console.log('Staff locations response:', { data, error });
      
      if (error) throw error;
      
      // Always set staff locations, even if empty
      if (!data || data.length === 0) {
        console.log('No staff locations found, setting empty array');
        setStaffLocations([]);
        setInitialized(true);
        setLoading(false);
        return [];
      }
      
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

      console.log('Mapped staff locations:', mappedData);
      setStaffLocations(mappedData);
      setInitialized(true);
      setLoading(false);
      return mappedData;
    } catch (err) {
      console.error("Error fetching staff locations:", err);
      setError("Failed to fetch staff locations");
      setStaffLocations([]);
      setInitialized(true);
      setLoading(false);
      return [];
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

  // Auto-fetch staff locations when locations are loaded
  useEffect(() => {
    console.log('useEffect triggered - locationsLoading:', locationsLoading, 'locations:', locations.length);
    
    // If locations are loaded and we haven't initialized staff locations yet
    if (!locationsLoading && locations.length > 0 && !initialized) {
      console.log('Locations loaded, auto-fetching staff locations');
      fetchStaffLocations();
    }
  }, [locationsLoading, locations, initialized]);
  
  // Force initialization after a timeout if still not initialized
  useEffect(() => {
    if (!initialized) {
      const timer = setTimeout(() => {
        if (!initialized) {
          console.log('Forcing staff locations fetch after timeout');
          fetchStaffLocations();
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [initialized]);

  return {
    staffLocations,
    loading: loading || (locationsLoading && !initialized), // Only show loading if not initialized
    error,
    fetchStaffLocations,
    createStaffLocation,
    updateStaffLocation,
    deleteStaffLocation,
    initialized
  };
}
