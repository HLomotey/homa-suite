import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { FrontendStaffLocation } from "@/integration/supabase/types/staffLocation";
import { supabase } from "@/integration/supabase/client";
import useStaffLocation from "@/hooks/transport/useStaffLocation";

interface StaffLocationSelectProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  label?: string;
  required?: boolean;
}

export const StaffLocationSelect = React.memo(({
  defaultValue = "",
  onChange,
  name = "staffLocationId",
  label = "Location",
  required = false
}: StaffLocationSelectProps) => {
  // State for direct fetching as fallback
  const [directStaffLocations, setDirectStaffLocations] = useState<FrontendStaffLocation[]>([]);
  const [directLoading, setDirectLoading] = useState<boolean>(false);
  
  // Use the hook for primary data source
  const { staffLocations, loading: hookLoading, initialized } = useStaffLocation();
  
  // Memoize the locations to prevent unnecessary re-renders
  const locations = useMemo(() => {
    // Use hook data if available, otherwise use direct data
    return staffLocations.length > 0 ? staffLocations : directStaffLocations;
  }, [staffLocations, directStaffLocations]);
  
  // Memoize loading state
  const isLoading = useMemo(() => {
    return (hookLoading && !initialized) || directLoading;
  }, [hookLoading, initialized, directLoading]);

  // Direct fetch function as a fallback
  const fetchDirectStaffLocations = useCallback(async () => {
    console.log('StaffLocationSelect - direct fetching staff locations');
    setDirectLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("staff_locations")
        .select("*, company_locations(name)");
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const mappedData = data.map((item) => ({
          id: item.id,
          companyLocationId: item.company_location_id,
          companyLocationName: item.company_locations?.name || "Unknown",
          locationCode: item.location_code,
          locationDescription: item.location_description,
          isActive: item.is_active,
        }));
        
        setDirectStaffLocations(mappedData);
      } else {
        setDirectStaffLocations([]);
      }
    } catch (err) {
      console.error("Error direct fetching staff locations:", err);
    } finally {
      setDirectLoading(false);
    }
  }, []);

  // Fetch data when component mounts
  useEffect(() => {
    // Only fetch directly if hook data isn't available after a short delay
    const timer = setTimeout(() => {
      if (staffLocations.length === 0 && !directStaffLocations.length) {
        fetchDirectStaffLocations();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [staffLocations.length, fetchDirectStaffLocations]);

  // Handle change with memoized callback
  const handleValueChange = useCallback((value: string) => {
    if (onChange) {
      onChange(value);
    }
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
      <Select 
        name={name}
        defaultValue={defaultValue} 
        onValueChange={handleValueChange}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue 
            placeholder={isLoading ? "Loading locations..." : "Select staff location"} 
          />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading locations...
              </div>
            </SelectItem>
          ) : locations.length > 0 ? (
            locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.locationCode} - {location.locationDescription}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>No locations found</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
});

StaffLocationSelect.displayName = "StaffLocationSelect";
