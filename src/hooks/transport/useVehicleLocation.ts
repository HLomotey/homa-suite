import { useState } from 'react';
import { supabase } from '@/integration/supabase';
import { Vehicle, FrontendVehicle, mapDatabaseVehicleToFrontend } from '@/integration/supabase/types/vehicle';

/**
 * Hook for managing vehicle location assignments
 */
export const useVehicleLocation = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Assign a vehicle to a location
   * @param vehicleId - ID of the vehicle to assign
   * @param locationId - ID of the location to assign the vehicle to
   */
  const assignVehicleToLocation = async (vehicleId: string, locationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('vehicles')
        .update({ location_id: locationId })
        .eq('id', vehicleId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        return mapDatabaseVehicleToFrontend(data as Vehicle);
      }
      
      return null;
    } catch (err: unknown) {
      console.error('Error assigning vehicle to location:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign vehicle to location');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get all vehicles assigned to a specific location
   * @param locationId - ID of the location to get vehicles for
   */
  const getVehiclesByLocation = async (locationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('location_id', locationId);

      if (error) {
        throw error;
      }

      if (data) {
        return data.map((vehicle: Vehicle) => mapDatabaseVehicleToFrontend(vehicle));
      }
      
      return [];
    } catch (err: unknown) {
      console.error('Error fetching vehicles by location:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles by location');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get the location details for a specific vehicle
   * @param vehicleId - ID of the vehicle to get location for
   */
  const getVehicleLocation = async (vehicleId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('vehicles')
        .select('location_id')
        .eq('id', vehicleId)
        .single();

      if (error) {
        throw error;
      }

      if (data && data.location_id) {
        const { data: locationData, error: locationError } = await supabase
          .from('company_locations')
          .select('*')
          .eq('id', data.location_id)
          .single();

        if (locationError) {
          throw locationError;
        }

        return locationData;
      }
      
      return null;
    } catch (err: unknown) {
      console.error('Error fetching vehicle location:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicle location');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    assignVehicleToLocation,
    getVehiclesByLocation,
    getVehicleLocation
  };
};

export default useVehicleLocation;
