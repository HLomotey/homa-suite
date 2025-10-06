import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase';

interface CompanyLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  is_active: boolean;
}

interface StaffLocation {
  id: string;
  location_code: string;
  location_description: string;
  is_active: boolean;
  company_location: CompanyLocation;
}

interface LocationOption {
  value: string;
  label: string;
  type: 'company' | 'staff' | 'external_staff';
}

export function useLocations() {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch company locations
        const { data: companyLocations, error: companyError } = await supabase
          .from('company_locations')
          .select('id, name, city, state, is_active')
          .eq('is_active', true)
          .order('name');

        if (companyError) {
          console.warn('Could not fetch company locations:', companyError);
        }

        // Fetch staff locations with company location details
        const { data: staffLocations, error: staffError } = await supabase
          .from('staff_locations')
          .select(`
            id,
            location_code,
            location_description,
            is_active,
            company_locations!inner(
              id,
              name,
              city,
              state,
              is_active
            )
          `)
          .eq('is_active', true)
          .eq('company_locations.is_active', true)
          .order('location_description');

        if (staffError) {
          console.warn('Could not fetch staff locations:', staffError);
        }

        // Fetch unique locations from external_staff table
        const { data: externalStaffLocations, error: externalError } = await supabase
          .from('external_staff')
          .select('LOCATION')
          .not('LOCATION', 'is', null)
          .not('LOCATION', 'eq', '')
          .eq('POSITION STATUS', 'Active');

        if (externalError) {
          console.warn('Could not fetch external staff locations:', externalError);
        }

        // Combine all locations into a single array
        const allLocations: LocationOption[] = [];

        // Add company locations
        if (companyLocations) {
          (companyLocations as any[]).forEach((location: any) => {
            allLocations.push({
              value: location.id,
              label: `${location.name} (${location.city}, ${location.state})`,
              type: 'company'
            });
          });
        }

        // Add staff locations
        if (staffLocations) {
          (staffLocations as any[]).forEach(location => {
            const companyLocation = location.company_locations;
            allLocations.push({
              value: location.id,
              label: `${location.location_description} - ${companyLocation.name}`,
              type: 'staff'
            });
          });
        }

        // Add unique external staff locations
        if (externalStaffLocations) {
          const uniqueExternalLocations = [...new Set(
            (externalStaffLocations as any[])
              .map((item: any) => item.LOCATION)
              .filter(Boolean)
          )];

          uniqueExternalLocations.forEach(locationName => {
            // Avoid duplicates with company/staff locations
            const exists = allLocations.some(loc => 
              loc.label.toLowerCase().includes(locationName.toLowerCase())
            );
            
            if (!exists) {
              allLocations.push({
                value: locationName,
                label: locationName,
                type: 'external_staff'
              });
            }
          });
        }

        // Sort all locations alphabetically
        allLocations.sort((a, b) => a.label.localeCompare(b.label));

        setLocations(allLocations);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch locations';
        setError(errorMessage);
        console.error('Error fetching locations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return {
    locations,
    isLoading,
    error
  };
}
