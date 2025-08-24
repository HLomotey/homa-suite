import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integration/supabase/client';
import { 
  ExternalStaff, 
  FrontendExternalStaff, 
  CreateExternalStaff, 
  UpdateExternalStaff,
  mapDatabaseExternalStaffToFrontend 
} from '../../integration/supabase/types/external-staff';

/**
 * Custom hook for external staff CRUD operations
 */
export const useExternalStaff = () => {
  const [externalStaff, setExternalStaff] = useState<FrontendExternalStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all external staff
   */
  const fetchExternalStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('external_staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData = data?.map(mapDatabaseExternalStaffToFrontend) || [];
      setExternalStaff(mappedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch external staff');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch external staff on mount
   */
  useEffect(() => {
    fetchExternalStaff();
  }, [fetchExternalStaff]);

  return {
    externalStaff,
    loading,
    error,
    refetch: fetchExternalStaff,
  };
};

/**
 * Custom hook for creating external staff
 */
export const useCreateExternalStaff = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdStaff, setCreatedStaff] = useState<FrontendExternalStaff | null>(null);

  const create = useCallback(async (staffData: CreateExternalStaff) => {
    setLoading(true);
    setError(null);
    setCreatedStaff(null);

    try {
      const { data, error } = await supabase
        .from('external_staff')
        .insert([staffData])
        .select()
        .single();

      if (error) throw error;

      const mappedData = mapDatabaseExternalStaffToFrontend(data);
      setCreatedStaff(mappedData);
      return mappedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create external staff';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    create,
    loading,
    error,
    createdStaff,
  };
};

/**
 * Custom hook for updating external staff
 */
export const useUpdateExternalStaff = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedStaff, setUpdatedStaff] = useState<FrontendExternalStaff | null>(null);

  const update = useCallback(async (staffData: UpdateExternalStaff) => {
    setLoading(true);
    setError(null);
    setUpdatedStaff(null);

    try {
      const { id, ...updateData } = staffData;
      
      const { data, error } = await supabase
        .from('external_staff')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const mappedData = mapDatabaseExternalStaffToFrontend(data);
      setUpdatedStaff(mappedData);
      return mappedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update external staff';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    update,
    loading,
    error,
    updatedStaff,
  };
};

/**
 * Custom hook for deleting external staff
 */
export const useDeleteExternalStaff = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteStaff = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('external_staff')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete external staff';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteStaff,
    loading,
    error,
  };
};

/**
 * Custom hook for fetching a single external staff member
 */
export const useExternalStaffById = (id: string | null) => {
  const [staff, setStaff] = useState<FrontendExternalStaff | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async (staffId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('external_staff')
        .select('*')
        .eq('id', staffId)
        .single();

      if (error) throw error;

      const mappedData = mapDatabaseExternalStaffToFrontend(data);
      setStaff(mappedData);
      return mappedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch external staff');
      setStaff(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchStaff(id);
    } else {
      setStaff(null);
    }
  }, [id, fetchStaff]);

  return {
    staff,
    loading,
    error,
    refetch: id ? () => fetchStaff(id) : undefined,
  };
};

/**
 * Custom hook for bulk creating external staff
 */
export const useBulkCreateExternalStaff = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdStaff, setCreatedStaff] = useState<FrontendExternalStaff[]>([]);

  const bulkCreate = useCallback(async (staffDataArray: CreateExternalStaff[]) => {
    setLoading(true);
    setError(null);
    setCreatedStaff([]);

    try {
      const { data, error } = await supabase
        .from('external_staff')
        .insert(staffDataArray)
        .select();

      if (error) throw error;

      const mappedData = data?.map(mapDatabaseExternalStaffToFrontend) || [];
      setCreatedStaff(mappedData);
      return mappedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk create external staff';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bulkCreate,
    loading,
    error,
    createdStaff,
  };
};

/**
 * Custom hook for searching external staff
 */
export const useSearchExternalStaff = () => {
  const [results, setResults] = useState<FrontendExternalStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchTerm: string, filters?: {
    department?: string;
    employmentStatus?: string;
    workLocation?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('external_staff')
        .select('*');

      // Add text search
      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,e_mail.ilike.%${searchTerm}%,external_staff_id.ilike.%${searchTerm}%`);
      }

      // Add filters
      if (filters?.department) {
        query = query.eq('department', filters.department);
      }
      if (filters?.employmentStatus) {
        query = query.eq('employment_status', filters.employmentStatus);
      }
      if (filters?.workLocation) {
        query = query.eq('work_location', filters.workLocation);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData = data?.map(mapDatabaseExternalStaffToFrontend) || [];
      setResults(mappedData);
      return mappedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search external staff');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    search,
    results,
    loading,
    error,
  };
};
