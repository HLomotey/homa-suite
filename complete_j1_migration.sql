-- Complete J-1 Tracking System Migration
-- This file contains everything needed to set up the J-1 Tracking system
-- Run this entire script in your Supabase SQL Editor

-- ============================================================================
-- 1. DROP EXISTING TABLES AND TYPES (Clean slate)
-- ============================================================================

DROP VIEW IF EXISTS j1_dashboard_view CASCADE;
DROP TABLE IF EXISTS j1_flow_status CASCADE;
DROP TABLE IF EXISTS j1_participants CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TYPE IF EXISTS onboarding_status CASCADE;
DROP TYPE IF EXISTS completion_status CASCADE;
DROP FUNCTION IF EXISTS get_j1_statistics() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- 2. CREATE COUNTRIES TABLE AND POPULATE
-- ============================================================================

-- Create countries table
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE, -- ISO 3166-1 alpha-2 country code
    region TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_countries_name ON countries(name);
CREATE INDEX idx_countries_code ON countries(code);

-- Insert all world countries
INSERT INTO countries (name, code, region) VALUES
-- Africa
('Algeria', 'DZ', 'Africa'),
('Angola', 'AO', 'Africa'),
('Benin', 'BJ', 'Africa'),
('Botswana', 'BW', 'Africa'),
('Burkina Faso', 'BF', 'Africa'),
('Burundi', 'BI', 'Africa'),
('Cameroon', 'CM', 'Africa'),
('Cape Verde', 'CV', 'Africa'),
('Central African Republic', 'CF', 'Africa'),
('Chad', 'TD', 'Africa'),
('Comoros', 'KM', 'Africa'),
('Congo', 'CG', 'Africa'),
('Democratic Republic of the Congo', 'CD', 'Africa'),
('Djibouti', 'DJ', 'Africa'),
('Egypt', 'EG', 'Africa'),
('Equatorial Guinea', 'GQ', 'Africa'),
('Eritrea', 'ER', 'Africa'),
('Eswatini', 'SZ', 'Africa'),
('Ethiopia', 'ET', 'Africa'),
('Gabon', 'GA', 'Africa'),
('Gambia', 'GM', 'Africa'),
('Ghana', 'GH', 'Africa'),
('Guinea', 'GN', 'Africa'),
('Guinea-Bissau', 'GW', 'Africa'),
('Ivory Coast', 'CI', 'Africa'),
('Kenya', 'KE', 'Africa'),
('Lesotho', 'LS', 'Africa'),
('Liberia', 'LR', 'Africa'),
('Libya', 'LY', 'Africa'),
('Madagascar', 'MG', 'Africa'),
('Malawi', 'MW', 'Africa'),
('Mali', 'ML', 'Africa'),
('Mauritania', 'MR', 'Africa'),
('Mauritius', 'MU', 'Africa'),
('Morocco', 'MA', 'Africa'),
('Mozambique', 'MZ', 'Africa'),
('Namibia', 'NA', 'Africa'),
('Niger', 'NE', 'Africa'),
('Nigeria', 'NG', 'Africa'),
('Rwanda', 'RW', 'Africa'),
('Sao Tome and Principe', 'ST', 'Africa'),
('Senegal', 'SN', 'Africa'),
('Seychelles', 'SC', 'Africa'),
('Sierra Leone', 'SL', 'Africa'),
('Somalia', 'SO', 'Africa'),
('South Africa', 'ZA', 'Africa'),
('South Sudan', 'SS', 'Africa'),
('Sudan', 'SD', 'Africa'),
('Tanzania', 'TZ', 'Africa'),
('Togo', 'TG', 'Africa'),
('Tunisia', 'TN', 'Africa'),
('Uganda', 'UG', 'Africa'),
('Zambia', 'ZM', 'Africa'),
('Zimbabwe', 'ZW', 'Africa'),

-- Asia
('Afghanistan', 'AF', 'Asia'),
('Armenia', 'AM', 'Asia'),
('Azerbaijan', 'AZ', 'Asia'),
('Bahrain', 'BH', 'Asia'),
('Bangladesh', 'BD', 'Asia'),
('Bhutan', 'BT', 'Asia'),
('Brunei', 'BN', 'Asia'),
('Cambodia', 'KH', 'Asia'),
('China', 'CN', 'Asia'),
('Cyprus', 'CY', 'Asia'),
('Georgia', 'GE', 'Asia'),
('India', 'IN', 'Asia'),
('Indonesia', 'ID', 'Asia'),
('Iran', 'IR', 'Asia'),
('Iraq', 'IQ', 'Asia'),
('Israel', 'IL', 'Asia'),
('Japan', 'JP', 'Asia'),
('Jordan', 'JO', 'Asia'),
('Kazakhstan', 'KZ', 'Asia'),
('Kuwait', 'KW', 'Asia'),
('Kyrgyzstan', 'KG', 'Asia'),
('Laos', 'LA', 'Asia'),
('Lebanon', 'LB', 'Asia'),
('Malaysia', 'MY', 'Asia'),
('Maldives', 'MV', 'Asia'),
('Mongolia', 'MN', 'Asia'),
('Myanmar', 'MM', 'Asia'),
('Nepal', 'NP', 'Asia'),
('North Korea', 'KP', 'Asia'),
('Oman', 'OM', 'Asia'),
('Pakistan', 'PK', 'Asia'),
('Palestine', 'PS', 'Asia'),
('Philippines', 'PH', 'Asia'),
('Qatar', 'QA', 'Asia'),
('Saudi Arabia', 'SA', 'Asia'),
('Singapore', 'SG', 'Asia'),
('South Korea', 'KR', 'Asia'),
('Sri Lanka', 'LK', 'Asia'),
('Syria', 'SY', 'Asia'),
('Taiwan', 'TW', 'Asia'),
('Tajikistan', 'TJ', 'Asia'),
('Thailand', 'TH', 'Asia'),
('Timor-Leste', 'TL', 'Asia'),
('Turkey', 'TR', 'Asia'),
('Turkmenistan', 'TM', 'Asia'),
('United Arab Emirates', 'AE', 'Asia'),
('Uzbekistan', 'UZ', 'Asia'),
('Vietnam', 'VN', 'Asia'),
('Yemen', 'YE', 'Asia'),

-- Europe
('Albania', 'AL', 'Europe'),
('Andorra', 'AD', 'Europe'),
('Austria', 'AT', 'Europe'),
('Belarus', 'BY', 'Europe'),
('Belgium', 'BE', 'Europe'),
('Bosnia and Herzegovina', 'BA', 'Europe'),
('Bulgaria', 'BG', 'Europe'),
('Croatia', 'HR', 'Europe'),
('Czech Republic', 'CZ', 'Europe'),
('Denmark', 'DK', 'Europe'),
('Estonia', 'EE', 'Europe'),
('Finland', 'FI', 'Europe'),
('France', 'FR', 'Europe'),
('Germany', 'DE', 'Europe'),
('Greece', 'GR', 'Europe'),
('Hungary', 'HU', 'Europe'),
('Iceland', 'IS', 'Europe'),
('Ireland', 'IE', 'Europe'),
('Italy', 'IT', 'Europe'),
('Latvia', 'LV', 'Europe'),
('Liechtenstein', 'LI', 'Europe'),
('Lithuania', 'LT', 'Europe'),
('Luxembourg', 'LU', 'Europe'),
('Malta', 'MT', 'Europe'),
('Moldova', 'MD', 'Europe'),
('Monaco', 'MC', 'Europe'),
('Montenegro', 'ME', 'Europe'),
('Netherlands', 'NL', 'Europe'),
('North Macedonia', 'MK', 'Europe'),
('Norway', 'NO', 'Europe'),
('Poland', 'PL', 'Europe'),
('Portugal', 'PT', 'Europe'),
('Romania', 'RO', 'Europe'),
('Russia', 'RU', 'Europe'),
('San Marino', 'SM', 'Europe'),
('Serbia', 'RS', 'Europe'),
('Slovakia', 'SK', 'Europe'),
('Slovenia', 'SI', 'Europe'),
('Spain', 'ES', 'Europe'),
('Sweden', 'SE', 'Europe'),
('Switzerland', 'CH', 'Europe'),
('Ukraine', 'UA', 'Europe'),
('United Kingdom', 'GB', 'Europe'),
('Vatican City', 'VA', 'Europe'),

-- North America
('Antigua and Barbuda', 'AG', 'North America'),
('Bahamas', 'BS', 'North America'),
('Barbados', 'BB', 'North America'),
('Belize', 'BZ', 'North America'),
('Canada', 'CA', 'North America'),
('Costa Rica', 'CR', 'North America'),
('Cuba', 'CU', 'North America'),
('Dominica', 'DM', 'North America'),
('Dominican Republic', 'DO', 'North America'),
('El Salvador', 'SV', 'North America'),
('Grenada', 'GD', 'North America'),
('Guatemala', 'GT', 'North America'),
('Haiti', 'HT', 'North America'),
('Honduras', 'HN', 'North America'),
('Jamaica', 'JM', 'North America'),
('Mexico', 'MX', 'North America'),
('Nicaragua', 'NI', 'North America'),
('Panama', 'PA', 'North America'),
('Saint Kitts and Nevis', 'KN', 'North America'),
('Saint Lucia', 'LC', 'North America'),
('Saint Vincent and the Grenadines', 'VC', 'North America'),
('Trinidad and Tobago', 'TT', 'North America'),
('United States', 'US', 'North America'),

-- South America
('Argentina', 'AR', 'South America'),
('Bolivia', 'BO', 'South America'),
('Brazil', 'BR', 'South America'),
('Chile', 'CL', 'South America'),
('Colombia', 'CO', 'South America'),
('Ecuador', 'EC', 'South America'),
('Guyana', 'GY', 'South America'),
('Paraguay', 'PY', 'South America'),
('Peru', 'PE', 'South America'),
('Suriname', 'SR', 'South America'),
('Uruguay', 'UY', 'South America'),
('Venezuela', 'VE', 'South America'),

-- Oceania
('Australia', 'AU', 'Oceania'),
('Fiji', 'FJ', 'Oceania'),
('Kiribati', 'KI', 'Oceania'),
('Marshall Islands', 'MH', 'Oceania'),
('Micronesia', 'FM', 'Oceania'),
('Nauru', 'NR', 'Oceania'),
('New Zealand', 'NZ', 'Oceania'),
('Palau', 'PW', 'Oceania'),
('Papua New Guinea', 'PG', 'Oceania'),
('Samoa', 'WS', 'Oceania'),
('Solomon Islands', 'SB', 'Oceania'),
('Tonga', 'TO', 'Oceania'),
('Tuvalu', 'TV', 'Oceania'),
('Vanuatu', 'VU', 'Oceania');

-- ============================================================================
-- 3. CREATE J-1 TRACKING TABLES
-- ============================================================================

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
CREATE TRIGGER update_j1_participants_updated_at BEFORE UPDATE ON j1_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_j1_flow_status_updated_at BEFORE UPDATE ON j1_flow_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. CREATE DASHBOARD VIEW WITH CALCULATED FIELDS
-- ============================================================================

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
         THEN f.ds2019_end_date - CURRENT_DATE ELSE NULL END as days_until_visa_expiry,
         
    -- Add timestamps for ordering
    p.created_at,
    p.updated_at
         
FROM j1_participants p
LEFT JOIN j1_flow_status f ON p.id = f.participant_id;

-- ============================================================================
-- 5. CREATE STATISTICS FUNCTION
-- ============================================================================

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

-- ============================================================================
-- 6. INSERT SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample participants
INSERT INTO j1_participants (first_name, middle_name, last_name, country, gender, age, employer) VALUES
('Maria', 'Carmen', 'Rodriguez', 'Spain', 'Female', 22, 'Sunset Resort'),
('Ahmed', NULL, 'Hassan', 'Egypt', 'Male', 24, 'Ocean View Hotel'),
('Yuki', NULL, 'Tanaka', 'Japan', 'Female', 21, 'Mountain Lodge'),
('Pierre', 'Jean', 'Dubois', 'France', 'Male', 23, 'City Center Inn');

-- Insert sample flow status data
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

INSERT INTO j1_flow_status (participant_id, ds2019_start_date, ds2019_end_date, onboarding_status)
SELECT 
    id,
    CURRENT_DATE + INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '285 days',
    'pending'
FROM j1_participants
WHERE first_name = 'Yuki' AND last_name = 'Tanaka';

INSERT INTO j1_flow_status (participant_id, ds2019_start_date, ds2019_end_date, arrival_date, onboarding_status, actual_start_date, actual_end_date, completion_status)
SELECT 
    id,
    CURRENT_DATE - INTERVAL '180 days',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '160 days',
    'completed',
    CURRENT_DATE - INTERVAL '155 days',
    CURRENT_DATE - INTERVAL '35 days',
    'completed'
FROM j1_participants
WHERE first_name = 'Pierre' AND last_name = 'Dubois';

-- ============================================================================
-- 7. VERIFICATION AND SUCCESS MESSAGE
-- ============================================================================

DO $$
DECLARE
    country_count INTEGER;
    participant_count INTEGER;
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO country_count FROM countries;
    SELECT COUNT(*) INTO participant_count FROM j1_participants;
    SELECT COUNT(*) INTO view_count FROM j1_dashboard_view;
    
    RAISE NOTICE '✅ J-1 Tracking System Setup Complete!';
    RAISE NOTICE '📊 Countries loaded: %', country_count;
    RAISE NOTICE '👥 Sample participants: %', participant_count;
    RAISE NOTICE '📋 Dashboard view records: %', view_count;
    RAISE NOTICE '🚀 J-1 Tracking Monitor is ready to use!';
END $$;
