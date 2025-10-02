-- Quick Fix for J-1 Tracking System
-- Run this in Supabase SQL Editor to fix the immediate errors

-- Drop and recreate the view with proper column handling
DROP VIEW IF EXISTS j1_dashboard_view CASCADE;

-- Create a simple view that works with existing or new tables
CREATE OR REPLACE VIEW j1_dashboard_view AS
SELECT 
    p.id,
    p.first_name,
    p.middle_name,
    p.last_name,
    -- Computed full name
    CASE 
        WHEN p.middle_name IS NOT NULL AND p.middle_name != '' 
        THEN p.first_name || ' ' || p.middle_name || ' ' || p.last_name
        ELSE p.first_name || ' ' || p.last_name
    END as full_name,
    p.country,
    p.gender,
    p.age,
    p.employer,
    COALESCE(f.ds2019_start_date, NULL) as ds2019_start_date,
    COALESCE(f.ds2019_end_date, NULL) as ds2019_end_date,
    COALESCE(f.arrival_date, NULL) as arrival_date,
    COALESCE(f.onboarding_status, 'pending') as onboarding_status,
    COALESCE(f.actual_start_date, NULL) as actual_start_date,
    COALESCE(f.actual_end_date, NULL) as actual_end_date,
    COALESCE(f.move_out_date, NULL) as move_out_date,
    COALESCE(f.completion_status, 'in_progress') as completion_status,
    
    -- Calculated fields with safe defaults
    CASE 
        WHEN COALESCE(f.completion_status, 'in_progress') = 'completed' THEN 'Program Completed'
        WHEN f.actual_end_date IS NOT NULL THEN 'Employment Ended'
        WHEN f.actual_start_date IS NOT NULL THEN 'Employment Active'
        WHEN COALESCE(f.onboarding_status, 'pending') = 'completed' THEN 'Onboarding Complete'
        WHEN f.arrival_date IS NOT NULL THEN 'Arrived'
        WHEN f.ds2019_start_date IS NOT NULL THEN 'Documents Ready'
        ELSE 'Application Stage'
    END as current_stage,
    
    -- Progress percentage (0-100)
    CASE 
        WHEN COALESCE(f.completion_status, 'in_progress') = 'completed' THEN 100
        WHEN f.actual_end_date IS NOT NULL THEN 85
        WHEN f.actual_start_date IS NOT NULL THEN 70
        WHEN COALESCE(f.onboarding_status, 'pending') = 'completed' THEN 50
        WHEN f.arrival_date IS NOT NULL THEN 35
        WHEN f.ds2019_start_date IS NOT NULL THEN 20
        ELSE 0
    END as progress_percentage,
    
    -- Alert flags with safe defaults
    COALESCE(CASE WHEN f.arrival_date < f.ds2019_start_date THEN true ELSE false END, false) as early_arrival_flag,
    COALESCE(CASE WHEN f.arrival_date IS NOT NULL AND COALESCE(f.onboarding_status, 'pending') != 'completed' 
         AND f.arrival_date < CURRENT_DATE - INTERVAL '3 days' THEN true ELSE false END, false) as delayed_onboarding_flag,
    COALESCE(CASE WHEN f.actual_end_date IS NOT NULL AND f.move_out_date IS NULL THEN true ELSE false END, false) as missing_moveout_flag,
    COALESCE(CASE WHEN f.ds2019_end_date < CURRENT_DATE + INTERVAL '30 days' AND COALESCE(f.completion_status, 'in_progress') != 'completed' THEN true ELSE false END, false) as visa_expiring_flag,
    
    -- Days calculations with safe defaults
    CASE WHEN f.arrival_date IS NOT NULL AND f.actual_start_date IS NOT NULL 
         THEN f.actual_start_date - f.arrival_date ELSE NULL END as days_arrival_to_start,
    CASE WHEN f.ds2019_end_date IS NOT NULL 
         THEN f.ds2019_end_date - CURRENT_DATE ELSE NULL END as days_until_visa_expiry,
         
    -- Timestamps
    p.created_at,
    p.updated_at
         
FROM j1_participants p
LEFT JOIN j1_flow_status f ON p.id = f.participant_id;

-- Create the statistics function with error handling
CREATE OR REPLACE FUNCTION get_j1_statistics()
RETURNS JSON AS $$
DECLARE
    result JSON;
    table_exists BOOLEAN;
BEGIN
    -- Check if the view exists and has data
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'j1_dashboard_view'
    ) INTO table_exists;
    
    IF table_exists THEN
        SELECT json_build_object(
            'total_participants', COALESCE(COUNT(*), 0),
            'active_participants', COALESCE(COUNT(*) FILTER (WHERE completion_status = 'in_progress'), 0),
            'completed_participants', COALESCE(COUNT(*) FILTER (WHERE completion_status = 'completed'), 0),
            'early_exits', COALESCE(COUNT(*) FILTER (WHERE completion_status = 'early_exit'), 0),
            'pending_onboarding', COALESCE(COUNT(*) FILTER (WHERE onboarding_status = 'pending'), 0),
            'scheduled_onboarding', COALESCE(COUNT(*) FILTER (WHERE onboarding_status = 'scheduled'), 0),
            'completed_onboarding', COALESCE(COUNT(*) FILTER (WHERE onboarding_status = 'completed'), 0),
            'avg_days_arrival_to_start', COALESCE(AVG(days_arrival_to_start), 0),
            'participants_with_alerts', COALESCE(COUNT(*) FILTER (WHERE early_arrival_flag OR delayed_onboarding_flag OR missing_moveout_flag OR visa_expiring_flag), 0)
        )
        INTO result
        FROM j1_dashboard_view;
    ELSE
        -- Return default values if table doesn't exist
        SELECT json_build_object(
            'total_participants', 0,
            'active_participants', 0,
            'completed_participants', 0,
            'early_exits', 0,
            'pending_onboarding', 0,
            'scheduled_onboarding', 0,
            'completed_onboarding', 0,
            'avg_days_arrival_to_start', 0,
            'participants_with_alerts', 0
        ) INTO result;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Quick fix applied! J-1 Dashboard view recreated with safe column handling.';
    RAISE NOTICE '🔧 If tables don''t exist yet, run the complete migration next.';
END $$;
