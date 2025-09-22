import React, { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integration/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface StaffLocationSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

interface StaffLocation {
  id: string;
  location_code: string;
  location_description: string;
  company_locations?: { name: string };
}

// Hardcoded fallback data
const FALLBACK_LOCATIONS: StaffLocation[] = [
  { id: '1', location_code: 'LOC001', location_description: 'Main Office' },
  { id: '2', location_code: 'LOC002', location_description: 'Branch Office' },
  { id: '3', location_code: 'LOC003', location_description: 'Remote Location' }
];

export const StaffLocationSelect = React.memo(({
  value,
  onValueChange
}: StaffLocationSelectProps) => {
  const [locations, setLocations] = useState<StaffLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch locations
  const fetchLocations = useCallback(async (forceRefresh = false) => {
    // Set loading state
    setLoading(true);
    setError(null);
    
    try {
      console.log('StaffLocationSelect: Fetching staff locations...');
      
      const { data, error } = await supabase
        .from('staff_locations')
        .select('*')
        .limit(20);

      console.log('Staff locations response:', { data, error });

      if (error) {
        console.error('StaffLocationSelect: Database error:', error);
        setError(error.message);
        // Use fallback data
        setLocations(FALLBACK_LOCATIONS);
      } else if (data && data.length > 0) {
        // Use real data
        setLocations(data);
      } else {
        // No data returned, use fallback
        console.log('No locations found, using fallback data');
        setLocations(FALLBACK_LOCATIONS);
      }
    } catch (err) {
      console.error('StaffLocationSelect: Fetch error:', err);
      setError('Failed to fetch locations');
      setLocations(FALLBACK_LOCATIONS);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchLocations(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <label
          htmlFor="staffLocationId"
          className="block text-sm font-medium text-gray-700"
        >
          Staff Location
        </label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={loading}
          className="h-6 w-6 p-0"
          title="Refresh locations"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      
      <Select
        value={value || undefined}
        onValueChange={(selectedValue) => onValueChange?.(selectedValue || "")}
      >
        <SelectTrigger className="w-full mt-2 h-10">
          <SelectValue placeholder="Select staff location..." />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="loading" disabled>Loading locations...</SelectItem>
          ) : error ? (
            <>
              <SelectItem value="error" disabled>Error loading locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.location_code} - {location.location_description}
                </SelectItem>
              ))}
            </>
          ) : locations.length > 0 ? (
            locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.location_code} - {location.location_description}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>No locations available</SelectItem>
          )}
        </SelectContent>
      </Select>
      
      {loading && <p className="text-xs text-muted-foreground mt-1">Loading locations...</p>}
      {error && (
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-red-500">Error: {error}</p>
          <Button 
            variant="link" 
            size="sm" 
            onClick={handleRefresh} 
            className="text-xs p-0 h-4"
          >
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
});

StaffLocationSelect.displayName = "StaffLocationSelect";
