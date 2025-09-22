import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase';
import { Location, FrontendLocation, mapDatabaseLocationToFrontend } from '@/integration/supabase/types/location';

/**
 * Hook for managing company locations
 */
export const useLocation = () => {
  const [locations, setLocations] = useState<FrontendLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all locations for the current organization
   */
  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching locations...');

      // Make sure we have a clean state before fetching
      const { data, error } = await supabase
        .from('company_locations')
        .select('*')
        .order('name');

      console.log('Fetch response:', { data, error });

      if (error) {
        throw error;
      }

      // Always set locations, even if empty
      const frontendLocations = Array.isArray(data) 
        ? data.map((location: Location) => mapDatabaseLocationToFrontend(location))
        : [];
        
      console.log('Mapped locations:', frontendLocations);
      setLocations(frontendLocations);
      
      // Return the data for immediate use if needed
      return frontendLocations;
    } catch (err: unknown) {
      console.error('Error fetching locations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
      // Set empty array on error to avoid undefined issues
      setLocations([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new location
   */
  const createLocation = async (location: Omit<FrontendLocation, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Creating location with data:', location);

      // Convert frontend fields to database fields
      const dbLocation = {
        name: location.name,
        address: location.address,
        city: location.city,
        state: location.state,
        zip_code: location.zipCode,
        country: location.country,
        phone: location.phone || '',  // Ensure null values are handled
        email: location.email || '',  // Ensure null values are handled
        is_active: location.isActive
      };

      console.log('Mapped to database fields:', dbLocation);

      const { data, error } = await supabase
        .from('company_locations')
        .insert(dbLocation)
        .select()
        .single();

      console.log('Create response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data) {
        const frontendLocation = mapDatabaseLocationToFrontend(data as Location);
        console.log('Created location:', frontendLocation);
        setLocations([...locations, frontendLocation]);
        return frontendLocation;
      }
    } catch (err: unknown) {
      console.error('Error creating location:', err);
      setError(err instanceof Error ? err.message : 'Failed to create location');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing location
   */
  const updateLocation = async (id: string, location: Partial<Omit<FrontendLocation, 'id'>>) => {
    try {
      setLoading(true);
      setError(null);

      // Convert frontend fields to database fields
      const dbFields: Record<string, unknown> = {};
      
      // Map each field explicitly to ensure correct naming
      if (location.name !== undefined) dbFields.name = location.name;
      if (location.address !== undefined) dbFields.address = location.address;
      if (location.city !== undefined) dbFields.city = location.city;
      if (location.state !== undefined) dbFields.state = location.state;
      if (location.zipCode !== undefined) dbFields.zip_code = location.zipCode;
      if (location.country !== undefined) dbFields.country = location.country;
      if (location.phone !== undefined) dbFields.phone = location.phone;
      if (location.email !== undefined) dbFields.email = location.email;
      if (location.isActive !== undefined) dbFields.is_active = location.isActive;

      const { data, error } = await supabase
        .from('company_locations')
        .update(dbFields)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const updatedLocation = mapDatabaseLocationToFrontend(data as Location);
        setLocations(locations.map(loc => loc.id === id ? updatedLocation : loc));
        return updatedLocation;
      }
    } catch (err: unknown) {
      console.error('Error updating location:', err);
      setError(err instanceof Error ? err.message : 'Failed to update location');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a location
   */
  const deleteLocation = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('company_locations')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setLocations(locations.filter(location => location.id !== id));
      return true;
    } catch (err: unknown) {
      console.error('Error deleting location:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete location');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load locations on component mount
  useEffect(() => {
    const loadLocations = async () => {
      console.log('useLocation - Initial load starting');
      await fetchLocations();
      console.log('useLocation - Initial load complete, locations:', locations);
    };
    
    loadLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    locations,
    loading,
    error,
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation
  };
};

export default useLocation;
