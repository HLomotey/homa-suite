import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/client';
import { Projection, CreateProjectionRequest, UpdateProjectionRequest, ProjectionWithDetails } from '@/types/projection';
import { toast } from 'sonner';

export const useProjections = () => {
  const [projections, setProjections] = useState<ProjectionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjections = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projections')
        .select(`
          *,
          staff_locations!fk_projections_location (
            location_description
          ),
          billing_periods!fk_projections_billing_period (
            name,
            start_date,
            end_date
          )
        `)
        .order('billing_periods(start_date)', { ascending: true })
        .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

      if (error) {
        throw error;
      }

      const projectionsWithDetails: ProjectionWithDetails[] = data?.map((projection: any) => ({
        ...projection,
        location_description: projection.staff_locations?.location_description || projection.location_description,
        billing_period_start_date: projection.billing_periods?.start_date,
        billing_period_end_date: projection.billing_periods?.end_date,
      })) || [];

      setProjections(projectionsWithDetails);
    } catch (err: any) {
      console.error('Error fetching projections:', err);
      setError(err.message || 'Failed to fetch projections');
      toast.error('Failed to fetch projections');
    } finally {
      setLoading(false);
    }
  };

  const createProjection = async (projectionData: CreateProjectionRequest): Promise<Projection | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get location description
      const { data: locationData } = await supabase
        .from('staff_locations')
        .select('location_description')
        .eq('id', projectionData.location_id)
        .single();

      // Get billing period name
      const { data: billingPeriodData } = await supabase
        .from('billing_periods')
        .select('name')
        .eq('id', projectionData.billing_period_id)
        .single();

      const insertData = {
        ...projectionData,
        location_description: (locationData as any)?.location_description || '',
        billing_period_name: (billingPeriodData as any)?.name || '',
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from('projections')
        .insert(insertData as any)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Projection created successfully');
      await fetchProjections();
      return data;
    } catch (err: any) {
      console.error('Error creating projection:', err);
      toast.error(err.message || 'Failed to create projection');
      return null;
    }
  };

  const updateProjection = async (id: string, projectionData: UpdateProjectionRequest): Promise<Projection | null> => {
    try {
      let updateData: any = { ...projectionData };

      // Update location description if location_id changed
      if (projectionData.location_id) {
        const { data: locationData } = await supabase
          .from('staff_locations')
          .select('location_description')
          .eq('id', projectionData.location_id)
          .single();
        updateData.location_description = (locationData as any)?.location_description || '';
      }

      // Update billing period name if billing_period_id changed
      if (projectionData.billing_period_id) {
        const { data: billingPeriodData } = await supabase
          .from('billing_periods')
          .select('name')
          .eq('id', projectionData.billing_period_id)
          .single();
        updateData.billing_period_name = (billingPeriodData as any)?.name || '';
      }

      const { data, error } = await (supabase as any)
        .from('projections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Projection updated successfully');
      await fetchProjections();
      return data;
    } catch (err: any) {
      console.error('Error updating projection:', err);
      toast.error(err.message || 'Failed to update projection');
      return null;
    }
  };

  const deleteProjection = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('projections')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Projection deleted successfully');
      await fetchProjections();
      return true;
    } catch (err: any) {
      console.error('Error deleting projection:', err);
      toast.error(err.message || 'Failed to delete projection');
      return false;
    }
  };

  const getProjectionById = async (id: string): Promise<ProjectionWithDetails | null> => {
    try {
      const { data, error } = await supabase
        .from('projections')
        .select(`
          *,
          staff_locations!fk_projections_location (
            location_description
          ),
          billing_periods!fk_projections_billing_period (
            name,
            start_date,
            end_date
          )
        `)
        .eq('id', id)
        .single() as { data: any | null; error: any };

      if (error) {
        throw error;
      }

      return {
        ...data,
        location_description: data?.staff_locations?.location_description || data?.location_description,
        billing_period_start_date: data?.billing_periods?.start_date,
        billing_period_end_date: data?.billing_periods?.end_date,
      };
    } catch (err: any) {
      console.error('Error fetching projection:', err);
      toast.error(err.message || 'Failed to fetch projection');
      return null;
    }
  };

  useEffect(() => {
    fetchProjections();
  }, []);

  return {
    projections,
    loading,
    error,
    fetchProjections,
    createProjection,
    updateProjection,
    deleteProjection,
    getProjectionById,
  };
};
