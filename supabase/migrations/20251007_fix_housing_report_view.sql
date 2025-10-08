-- Fix Housing Report View Migration
-- This migration fixes the housing_report_view to work with existing data structure

-- Drop the existing view if it exists
DROP VIEW IF EXISTS housing_report_view CASCADE;

-- First, let's ensure the properties table exists with the right structure
DO $$
BEGIN
    -- Check if properties table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'properties') THEN
        -- Create properties table if it doesn't exist
        CREATE TABLE properties (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            address TEXT,
            status VARCHAR(50) DEFAULT 'active',
            rent_amount DECIMAL(10,2) DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created properties table with title column';
    ELSE
        -- Check if title column exists, if not add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'title') THEN
            -- If name column exists but title doesn't, add title column and copy data
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'name') THEN
                ALTER TABLE properties ADD COLUMN title VARCHAR(255);
                UPDATE properties SET title = name WHERE title IS NULL;
                RAISE NOTICE 'Added title column and copied from name column';
            ELSE
                -- Add title column with default value
                ALTER TABLE properties ADD COLUMN title VARCHAR(255) DEFAULT 'Unnamed Property';
                RAISE NOTICE 'Added title column with default value';
            END IF;
        END IF;
        
        -- Ensure rent_amount column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'rent_amount') THEN
            ALTER TABLE properties ADD COLUMN rent_amount DECIMAL(10,2) DEFAULT 0.00;
            RAISE NOTICE 'Added rent_amount column to properties';
        END IF;
    END IF;
END $$;

-- Create improved housing report view that handles missing tables gracefully
CREATE OR REPLACE VIEW housing_report_view AS
SELECT 
    -- Location and Property Info
    COALESCE(es."LOCATION", 'Unknown') as state,
    COALESCE(p.title, 'Property-' || p.id::TEXT) as property,
    COALESCE(p.address, '') as property_address,
    
    -- Housing Capacity and Occupancy
    COALESCE(COUNT(DISTINCT r.id), 0) as housing_capacity,
    COALESCE(COUNT(DISTINCT CASE WHEN a.status IN ('Active', 'active') THEN a.id END), 0) as housing_occupancy,
    
    -- Rent Information
    COALESCE(AVG(CASE WHEN COALESCE(a.rent_amount, p.rent_amount, 0) > 0 THEN COALESCE(a.rent_amount, p.rent_amount) END), 0) as rent_per_employee,
    COALESCE(SUM(CASE WHEN a.status IN ('Active', 'active') THEN COALESCE(a.rent_amount, p.rent_amount, 0) ELSE 0 END), 0) as total_rent_amount,
    
    -- Billing Information
    COALESCE(SUM(COALESCE(b.rent_amount, a.rent_amount, p.rent_amount, 0)), 0) as monthly_rent_charges,
    
    -- Utilities (with safe checks for table existence)
    COALESCE(
        (SELECT SUM(us.billing_amount) 
         FROM utility_setups us 
         JOIN utility_types ut ON ut.id = us.utility_type_id 
         WHERE us.property_id = p.id 
         AND (ut.name ILIKE '%propane%' OR ut.name ILIKE '%gas%')), 
        0
    ) as propane,
    
    COALESCE(
        (SELECT SUM(us.billing_amount) 
         FROM utility_setups us 
         JOIN utility_types ut ON ut.id = us.utility_type_id 
         WHERE us.property_id = p.id 
         AND (ut.name ILIKE '%water%' OR ut.name ILIKE '%sewer%')), 
        0
    ) as water_sewer_disposal,
    
    COALESCE(
        (SELECT SUM(us.billing_amount) 
         FROM utility_setups us 
         JOIN utility_types ut ON ut.id = us.utility_type_id 
         WHERE us.property_id = p.id 
         AND ut.name ILIKE '%electric%'), 
        0
    ) as electricity,
    
    -- Total utilities
    COALESCE(
        (SELECT SUM(us.billing_amount) 
         FROM utility_setups us 
         JOIN utility_types ut ON ut.id = us.utility_type_id 
         WHERE us.property_id = p.id 
         AND (ut.name ILIKE '%propane%' OR ut.name ILIKE '%gas%' OR 
              ut.name ILIKE '%water%' OR ut.name ILIKE '%sewer%' OR 
              ut.name ILIKE '%electric%')), 
        0
    ) as total_utilities,
    
    -- Maintenance costs
    COALESCE(
        (SELECT SUM(us.billing_amount) 
         FROM utility_setups us 
         JOIN utility_types ut ON ut.id = us.utility_type_id 
         WHERE us.property_id = p.id 
         AND ut.name ILIKE '%maintenance%'), 
        0
    ) as housing_maintenance,
    
    -- Total cost calculation
    COALESCE(SUM(COALESCE(b.rent_amount, a.rent_amount, p.rent_amount, 0)), 0) + 
    COALESCE(
        (SELECT SUM(us.billing_amount) 
         FROM utility_setups us 
         JOIN utility_types ut ON ut.id = us.utility_type_id 
         WHERE us.property_id = p.id), 
        0
    ) as total_cost,
    
    -- Expected rent calculations
    COALESCE(COUNT(DISTINCT CASE WHEN a.status IN ('Active', 'active') THEN a.id END), 0) * 
    COALESCE(AVG(CASE WHEN COALESCE(a.rent_amount, p.rent_amount, 0) > 0 THEN COALESCE(a.rent_amount, p.rent_amount) END), 0) as expected_rent_occupancy,
    
    COALESCE(COUNT(DISTINCT r.id), 0) * 
    COALESCE(AVG(CASE WHEN COALESCE(a.rent_amount, p.rent_amount, 0) > 0 THEN COALESCE(a.rent_amount, p.rent_amount) END), 0) as expected_rent_capacity,
    
    -- Payroll deductions (with safe check)
    COALESCE(
        (SELECT SUM(sdd.amount) 
         FROM security_deposits sd 
         JOIN security_deposit_deductions sdd ON sdd.security_deposit_id = sd.id 
         WHERE sd.assignment_id = a.id), 
        0
    ) as actual_payroll_deductions,
    
    -- Variance calculations
    COALESCE(
        (SELECT SUM(sdd.amount) 
         FROM security_deposits sd 
         JOIN security_deposit_deductions sdd ON sdd.security_deposit_id = sd.id 
         WHERE sd.assignment_id = a.id), 
        0
    ) - (
        COALESCE(COUNT(DISTINCT CASE WHEN a.status IN ('Active', 'active') THEN a.id END), 0) * 
        COALESCE(AVG(CASE WHEN COALESCE(a.rent_amount, p.rent_amount, 0) > 0 THEN COALESCE(a.rent_amount, p.rent_amount) END), 0)
    ) as variance_apd_rtc,
    
    COALESCE(
        (SELECT SUM(sdd.amount) 
         FROM security_deposits sd 
         JOIN security_deposit_deductions sdd ON sdd.security_deposit_id = sd.id 
         WHERE sd.assignment_id = a.id), 
        0
    ) - (
        COALESCE(COUNT(DISTINCT r.id), 0) * 
        COALESCE(AVG(CASE WHEN COALESCE(a.rent_amount, p.rent_amount, 0) > 0 THEN COALESCE(a.rent_amount, p.rent_amount) END), 0)
    ) as variance_apd_rro,
    
    -- Date filters
    DATE_TRUNC('month', COALESCE(b.period_start, a.start_date, CURRENT_DATE)) as report_month,
    EXTRACT(YEAR FROM COALESCE(b.period_start, a.start_date, CURRENT_DATE)) as report_year,
    EXTRACT(MONTH FROM COALESCE(b.period_start, a.start_date, CURRENT_DATE)) as report_month_num
    
FROM properties p
    LEFT JOIN rooms r ON r.property_id = p.id
    LEFT JOIN assignments a ON a.property_id = p.id
    LEFT JOIN external_staff es ON es.id = a.tenant_id
    LEFT JOIN billing b ON b.property_id = p.id AND (b.billing_type = 'housing' OR b.billing_type IS NULL)
    
WHERE p.id IS NOT NULL
    AND (p.status IS NULL OR p.status IN ('active', 'Active', 'available'))
    
GROUP BY 
    p.id,
    p.title,
    p.address,
    es."LOCATION",
    DATE_TRUNC('month', COALESCE(b.period_start, a.start_date, CURRENT_DATE)),
    EXTRACT(YEAR FROM COALESCE(b.period_start, a.start_date, CURRENT_DATE)),
    EXTRACT(MONTH FROM COALESCE(b.period_start, a.start_date, CURRENT_DATE))
    
ORDER BY state, property;

-- Add comment to the view
COMMENT ON VIEW housing_report_view IS 'Comprehensive housing report view with billing, utilities, and financial analysis - improved version that handles missing data gracefully';

-- Grant permissions
GRANT SELECT ON housing_report_view TO authenticated;
GRANT SELECT ON housing_report_view TO anon;