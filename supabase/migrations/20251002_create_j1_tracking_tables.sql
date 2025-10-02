-- Create J-1 Tracking System Tables
-- Migration: 20251002_create_j1_tracking_tables.sql

-- Drop existing tables and types if they exist
DROP VIEW IF EXISTS j1_dashboard_view CASCADE;
DROP TABLE IF EXISTS j1_flow_status CASCADE;
DROP TABLE IF EXISTS j1_participants CASCADE;
DROP TYPE IF EXISTS onboarding_status CASCADE;
DROP TYPE IF EXISTS completion_status CASCADE;
DROP FUNCTION IF EXISTS get_j1_statistics() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create enum types for J-1 tracking
CREATE TYPE onboarding_status AS ENUM ('pending', 'scheduled', 'completed');
CREATE TYPE completion_status AS ENUM ('in_progress', 'completed', 'early_exit');

-- Create j1_participants table
CREATE TABLE j1_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    country TEXT NOT NULL,
    gender TEXT,
    age INTEGER,
    employer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create j1_flow_status table
CREATE TABLE j1_flow_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES j1_participants(id) ON DELETE CASCADE,
    
    -- Document & Visa Stage
    ds2019_start_date DATE,
    ds2019_end_date DATE,
    embassy_appointment_date DATE,
    
    -- Arrival & Onboarding Stage
    arrival_date DATE,
    onboarding_status onboarding_status DEFAULT 'pending',
    onboarding_scheduled_date DATE,
    onboarding_completed_date DATE,
    
    -- Employment Stage
    estimated_start_date DATE,
    actual_start_date DATE,
    estimated_end_date DATE,
    actual_end_date DATE,
    
    -- Exit Stage
    move_out_date DATE,
    completion_status completion_status DEFAULT 'in_progress',
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_ds2019_dates CHECK (ds2019_end_date >= ds2019_start_date),
    CONSTRAINT valid_employment_dates CHECK (actual_end_date IS NULL OR actual_start_date IS NULL OR actual_end_date >= actual_start_date),
    CONSTRAINT arrival_after_ds2019_start CHECK (arrival_date IS NULL OR ds2019_start_date IS NULL OR arrival_date >= ds2019_start_date - INTERVAL '30 days')
);

-- Create indexes for better performance
CREATE INDEX idx_j1_participants_country ON j1_participants(country);
CREATE INDEX idx_j1_participants_employer ON j1_participants(employer);
CREATE INDEX idx_j1_participants_names ON j1_participants(first_name, last_name);
CREATE INDEX idx_j1_flow_status_participant ON j1_flow_status(participant_id);
CREATE INDEX idx_j1_flow_status_dates ON j1_flow_status(ds2019_start_date, ds2019_end_date);
CREATE INDEX idx_j1_flow_status_completion ON j1_flow_status(completion_status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_j1_participants_updated_at 
    BEFORE UPDATE ON j1_participants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_j1_flow_status_updated_at 
    BEFORE UPDATE ON j1_flow_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for J-1 dashboard with calculated fields
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
    f.ds2019_start_date,
    f.ds2019_end_date,
    f.arrival_date,
    f.onboarding_status,
    f.actual_start_date,
    f.actual_end_date,
    f.move_out_date,
    f.completion_status,
    
    -- Calculated fields
    CASE 
        WHEN f.completion_status = 'completed' THEN 'Program Completed'
        WHEN f.actual_end_date IS NOT NULL THEN 'Employment Ended'
        WHEN f.actual_start_date IS NOT NULL THEN 'Employment Active'
        WHEN f.onboarding_status = 'completed' THEN 'Onboarding Complete'
        WHEN f.arrival_date IS NOT NULL THEN 'Arrived'
        WHEN f.ds2019_start_date IS NOT NULL THEN 'Documents Ready'
        ELSE 'Application Stage'
    END as current_stage,
    
    -- Progress percentage (0-100)
    CASE 
        WHEN f.completion_status = 'completed' THEN 100
        WHEN f.actual_end_date IS NOT NULL THEN 85
        WHEN f.actual_start_date IS NOT NULL THEN 70
        WHEN f.onboarding_status = 'completed' THEN 50
        WHEN f.arrival_date IS NOT NULL THEN 35
        WHEN f.ds2019_start_date IS NOT NULL THEN 20
        ELSE 0
    END as progress_percentage,
    
    -- Alert flags
    CASE WHEN f.arrival_date < f.ds2019_start_date THEN true ELSE false END as early_arrival_flag,
    CASE WHEN f.arrival_date IS NOT NULL AND f.onboarding_status != 'completed' 
         AND f.arrival_date < CURRENT_DATE - INTERVAL '3 days' THEN true ELSE false END as delayed_onboarding_flag,
    CASE WHEN f.actual_end_date IS NOT NULL AND f.move_out_date IS NULL THEN true ELSE false END as missing_moveout_flag,
    CASE WHEN f.ds2019_end_date < CURRENT_DATE + INTERVAL '30 days' AND f.completion_status != 'completed' THEN true ELSE false END as visa_expiring_flag,
    
    -- Days calculations
    CASE WHEN f.arrival_date IS NOT NULL AND f.actual_start_date IS NOT NULL 
         THEN f.actual_start_date - f.arrival_date ELSE NULL END as days_arrival_to_start,
    CASE WHEN f.ds2019_end_date IS NOT NULL 
         THEN f.ds2019_end_date - CURRENT_DATE ELSE NULL END as days_until_visa_expiry
         
FROM j1_participants p
LEFT JOIN j1_flow_status f ON p.id = f.participant_id;

-- Create function to get J-1 statistics
CREATE OR REPLACE FUNCTION get_j1_statistics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_participants', COUNT(*),
        'active_participants', COUNT(*) FILTER (WHERE completion_status = 'in_progress'),
        'completed_participants', COUNT(*) FILTER (WHERE completion_status = 'completed'),
        'early_exits', COUNT(*) FILTER (WHERE completion_status = 'early_exit'),
        'pending_onboarding', COUNT(*) FILTER (WHERE onboarding_status = 'pending'),
        'scheduled_onboarding', COUNT(*) FILTER (WHERE onboarding_status = 'scheduled'),
        'completed_onboarding', COUNT(*) FILTER (WHERE onboarding_status = 'completed'),
        'avg_days_arrival_to_start', AVG(days_arrival_to_start),
        'participants_with_alerts', COUNT(*) FILTER (WHERE early_arrival_flag OR delayed_onboarding_flag OR missing_moveout_flag OR visa_expiring_flag)
    )
    INTO result
    FROM j1_dashboard_view;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO j1_participants (first_name, middle_name, last_name, country, gender, age, employer) VALUES
('Maria', 'Carmen', 'Rodriguez', 'Spain', 'Female', 22, 'Sunset Resort'),
('Ahmed', NULL, 'Hassan', 'Egypt', 'Male', 24, 'Ocean View Hotel'),
('Yuki', NULL, 'Tanaka', 'Japan', 'Female', 21, 'Mountain Lodge'),
('Pierre', 'Jean', 'Dubois', 'France', 'Male', 23, 'City Center Inn');

-- Insert corresponding flow status data
INSERT INTO j1_flow_status (participant_id, ds2019_start_date, ds2019_end_date, arrival_date, onboarding_status, actual_start_date)
SELECT 
    id,
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '270 days',
    CURRENT_DATE - INTERVAL '20 days',
    'completed',
    CURRENT_DATE - INTERVAL '15 days'
FROM j1_participants
WHERE first_name = 'Maria' AND last_name = 'Rodriguez';

INSERT INTO j1_flow_status (participant_id, ds2019_start_date, ds2019_end_date, arrival_date, onboarding_status)
SELECT 
    id,
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '290 days',
    CURRENT_DATE - INTERVAL '5 days',
    'scheduled'
FROM j1_participants
WHERE first_name = 'Ahmed' AND last_name = 'Hassan';
