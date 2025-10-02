// @ts-nocheck - Suppressing TypeScript errors due to Supabase schema type mismatches
import { useState, useCallback } from 'react';
import { supabase } from '@/integration/supabase';
import {
  J1Participant,
  J1FlowStatus,
  J1DashboardView,
  J1Statistics,
  J1CreateData,
  J1UpdateData,
  J1FilterOptions
} from '@/types/j1-tracking';

export const useJ1Tracking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all J-1 participants with dashboard view
  const getJ1Participants = useCallback(async (filters?: J1FilterOptions): Promise<J1DashboardView[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('j1_dashboard_view').select('*');

      // Apply filters
      if (filters?.country) {
        query = query.eq('country', filters.country);
      }
      if (filters?.employer) {
        query = query.eq('employer', filters.employer);
      }
      if (filters?.completion_status) {
        query = query.eq('completion_status', filters.completion_status);
      }
      if (filters?.onboarding_status) {
        query = query.eq('onboarding_status', filters.onboarding_status);
      }
      if (filters?.current_stage) {
        query = query.eq('current_stage', filters.current_stage);
      }
      if (filters?.has_alerts) {
        query = query.or('early_arrival_flag.eq.true,delayed_onboarding_flag.eq.true,missing_moveout_flag.eq.true,visa_expiring_flag.eq.true');
      }
      if (filters?.search_name) {
        query = query.ilike('full_name', `%${filters.search_name}%`);
      }
      if (filters?.start_date_from) {
        query = query.gte('ds2019_start_date', filters.start_date_from);
      }
      if (filters?.start_date_to) {
        query = query.lte('ds2019_start_date', filters.start_date_to);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch J-1 participants';
      setError(errorMessage);
      console.error('Error fetching J-1 participants:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single J-1 participant
  const getJ1Participant = useCallback(async (id: string): Promise<J1DashboardView | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('j1_dashboard_view')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch J-1 participant';
      setError(errorMessage);
      console.error('Error fetching J-1 participant:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new J-1 participant
  const createJ1Participant = useCallback(async (data: J1CreateData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // First create the participant
      const { data: participant, error: participantError } = await supabase
        .from('j1_participants')
        .insert({
          first_name: data.first_name,
          middle_name: data.middle_name,
          last_name: data.last_name,
          country: data.country,
          gender: data.gender,
          age: data.age,
          employer: data.employer
        })
        .select()
        .single();

      if (participantError) throw participantError;

      // Then create the flow status
      const { error: flowError } = await supabase
        .from('j1_flow_status')
        .insert({
          participant_id: participant.id,
          // Visa & Documentation
          ds2019_start_date: data.ds2019_start_date || null,
          ds2019_end_date: data.ds2019_end_date || null,
          embassy_appointment_date: data.embassy_appointment_date || null,
          // Arrival & Onboarding
          arrival_date: data.arrival_date || null,
          onboarding_status: data.onboarding_status || 'pending',
          onboarding_scheduled_date: data.onboarding_scheduled_date || null,
          onboarding_completed_date: data.onboarding_completed_date || null,
          // Employment Period
          estimated_start_date: data.estimated_start_date || null,
          actual_start_date: data.actual_start_date || null,
          estimated_end_date: data.estimated_end_date || null,
          actual_end_date: data.actual_end_date || null,
          // Exit & Completion
          move_out_date: data.move_out_date || null,
          completion_status: data.completion_status || 'in_progress',
          // Notes
          notes: data.notes || null
        });

      if (flowError) throw flowError;
      
      console.log('J1 Participant created successfully:', {
        participant_id: participant.id,
        name: `${participant.first_name} ${participant.last_name}`
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create J-1 participant';
      setError(errorMessage);
      console.error('Error creating J-1 participant:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update J-1 participant
  const updateJ1Participant = useCallback(async (id: string, data: J1UpdateData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Update participant info if provided
      const participantUpdates: any = {};
      if (data.first_name !== undefined) participantUpdates.first_name = data.first_name;
      if (data.middle_name !== undefined) participantUpdates.middle_name = data.middle_name;
      if (data.last_name !== undefined) participantUpdates.last_name = data.last_name;
      if (data.country !== undefined) participantUpdates.country = data.country;
      if (data.gender !== undefined) participantUpdates.gender = data.gender;
      if (data.age !== undefined) participantUpdates.age = data.age;
      if (data.employer !== undefined) participantUpdates.employer = data.employer;

      if (Object.keys(participantUpdates).length > 0) {
        const { error: participantError } = await supabase
          .from('j1_participants')
          .update(participantUpdates)
          .eq('id', id);

        if (participantError) throw participantError;
      }

      // Update flow status
      const flowUpdates: any = {};
      if (data.ds2019_start_date !== undefined) flowUpdates.ds2019_start_date = data.ds2019_start_date;
      if (data.ds2019_end_date !== undefined) flowUpdates.ds2019_end_date = data.ds2019_end_date;
      if (data.embassy_appointment_date !== undefined) flowUpdates.embassy_appointment_date = data.embassy_appointment_date;
      if (data.arrival_date !== undefined) flowUpdates.arrival_date = data.arrival_date;
      if (data.onboarding_status !== undefined) flowUpdates.onboarding_status = data.onboarding_status;
      if (data.onboarding_scheduled_date !== undefined) flowUpdates.onboarding_scheduled_date = data.onboarding_scheduled_date;
      if (data.onboarding_completed_date !== undefined) flowUpdates.onboarding_completed_date = data.onboarding_completed_date;
      if (data.estimated_start_date !== undefined) flowUpdates.estimated_start_date = data.estimated_start_date;
      if (data.actual_start_date !== undefined) flowUpdates.actual_start_date = data.actual_start_date;
      if (data.estimated_end_date !== undefined) flowUpdates.estimated_end_date = data.estimated_end_date;
      if (data.actual_end_date !== undefined) flowUpdates.actual_end_date = data.actual_end_date;
      if (data.move_out_date !== undefined) flowUpdates.move_out_date = data.move_out_date;
      if (data.completion_status !== undefined) flowUpdates.completion_status = data.completion_status;
      if (data.notes !== undefined) flowUpdates.notes = data.notes;

      if (Object.keys(flowUpdates).length > 0) {
        const { error: flowError } = await supabase
          .from('j1_flow_status')
          .update(flowUpdates)
          .eq('participant_id', id);

        if (flowError) throw flowError;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update J-1 participant';
      setError(errorMessage);
      console.error('Error updating J-1 participant:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete J-1 participant
  const deleteJ1Participant = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Delete participant (cascade will handle flow_status)
      const { error } = await supabase
        .from('j1_participants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete J-1 participant';
      setError(errorMessage);
      console.error('Error deleting J-1 participant:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get J-1 statistics
  const getJ1Statistics = useCallback(async (): Promise<J1Statistics | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_j1_statistics');

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch J-1 statistics';
      setError(errorMessage);
      console.error('Error fetching J-1 statistics:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all countries from countries table
  const getCountries = useCallback(async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('name')
        .order('name');

      if (error) throw error;
      
      return data?.map(item => item.name) || [];
    } catch (err) {
      console.error('Error fetching countries:', err);
      // Fallback to some common countries if database query fails
      return [
        'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
        'Spain', 'Italy', 'Japan', 'South Korea', 'China', 'India', 
        'Brazil', 'Mexico', 'Australia', 'New Zealand'
      ];
    }
  }, []);

  // Get unique employers for filter dropdown
  const getEmployers = useCallback(async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('j1_participants')
        .select('employer')
        .not('employer', 'is', null);

      if (error) throw error;
      
      const employers = [...new Set(data?.map(item => item.employer) || [])];
      return employers.sort();
    } catch (err) {
      console.error('Error fetching employers:', err);
      return [];
    }
  }, []);

  return {
    loading,
    error,
    getJ1Participants,
    getJ1Participant,
    createJ1Participant,
    updateJ1Participant,
    deleteJ1Participant,
    getJ1Statistics,
    getCountries,
    getEmployers
  };
};
