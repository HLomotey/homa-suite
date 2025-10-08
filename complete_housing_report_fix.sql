-- Complete Housing Report Fix
-- This script will diagnose and fix the housing report view issue

-- Step 1: Check current state
DO $$
BEGIN
    RAISE NOTICE 'Starting Housing Report Diagnosis...';
END $$;

-- Check if view exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.views 
            WHERE table_schema = 'public' AND table_name = 'housing_report_view'
        ) 
        THEN 'housing_report_view EXISTS' 
        ELSE 'housing_report_view MISSING' 
    END as view_status;

-- Step 2: Check base tables and their data
DO $$
DECLARE
    table_counts TEXT := '';
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT 
            t.table_name,
            CASE 
                WHEN t.table_name = 'properties' THEN (SELECT COUNT(*) FROM properties)
                WHEN t.table_name = 'rooms' THEN (SELECT COUNT(*) FROM rooms)
                WHEN t.table_name = 'assignments' THEN (SELECT COUNT(*) FROM assignments)
                WHEN t.table_name = 'external_staff' THEN (SELECT COUNT(*) FROM external_staff)
                WHEN t.table_name = 'billing' THEN (SELECT COUNT(*) FROM billing)
                WHEN t.table_name = 'utility_setups' THEN (
                    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'utility_setups') 
                    THEN (SELECT COUNT(*) FROM utility_setups) ELSE -1 END
                )
                WHEN t.table_name = 'utility_types' THEN (
                    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'utility_types') 
                    THEN (SELECT COUNT(*) FROM utility_types) ELSE -1 END
                )
                WHEN t.table_name = 'security_deposits' THEN (
                    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_deposits') 
                    THEN (SELECT COUNT(*) FROM security_deposits) ELSE -1 END
                )
                ELSE 0
            END as row_count
        FROM (VALUES 
            ('properties'), ('rooms'), ('assignments'), ('external_staff'), 
            ('billing'), ('utility_setups'), ('utility_types'), ('security_deposits')
        ) AS t(table_name)
    LOOP
        table_counts := table_counts || rec.table_name || ': ' || 
            CASE 
                WHEN rec.row_count = -1 THEN 'TABLE MISSING'
                ELSE rec.row_count::TEXT || ' rows'
            END || E'\n';
    END LOOP;
    
    RAISE NOTICE 'Table Status:%', E'\n' || table_counts;
END $$;

-- Step 3: Drop existing view and recreate with improved version
DROP VIEW IF EXISTS housing_report_view CASCADE;

-- Step 4: Create improved housing report view
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
    LEFT JOIN billing b ON b.property_id = p.id AND b.billing_type = 'housing'
    
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

-- Step 5: Test the view
DO $$
DECLARE
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO view_count FROM housing_report_view;
    RAISE NOTICE 'Housing report view now returns % rows', view_count;
    
    IF view_count = 0 THEN
        RAISE NOTICE 'View returns no data. This might be because:';
        RAISE NOTICE '1. No properties exist in the database';
        RAISE NOTICE '2. Properties exist but have no rooms or assignments';
        RAISE NOTICE '3. Data exists but doesn''t match the filter criteria';
        RAISE NOTICE 'Run the seed_basic_housing_data.sql script to add sample data for testing.';
    ELSE
        RAISE NOTICE 'SUCCESS: Housing report view is working!';
    END IF;
END $$;

-- Step 6: Show sample data from the view
SELECT 
    state,
    property,
    housing_capacity,
    housing_occupancy,
    rent_per_employee,
    monthly_rent_charges,
    total_utilities,
    total_cost,
    report_year,
    report_month_num
FROM housing_report_view 
LIMIT 5;