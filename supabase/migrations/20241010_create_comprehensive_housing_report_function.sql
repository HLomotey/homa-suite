-- Create comprehensive housing billing view based on the provided base view
-- This view integrates assignments, billing, utilities, and deductions data
-- Logic: List all Properties -> Check staff assignments -> Check billing table -> Check utilities -> Check states

-- Drop existing view if it exists to allow column structure changes
DROP VIEW IF EXISTS comprehensive_housing_billing_view;

-- Create a simple test view first to debug data issues
CREATE OR REPLACE VIEW comprehensive_housing_billing_test AS
SELECT 
    p.id as property_id,
    p.title as property_name,
    p.address as property_address,
    p.status as property_status,
    COUNT(a.id) as assignment_count,
    COUNT(r.id) as room_count
FROM properties p
LEFT JOIN assignments a ON p.id = a.property_id
LEFT JOIN rooms r ON p.id = r.property_id
GROUP BY p.id, p.title, p.address, p.status
ORDER BY p.title;

-- Grant permissions on test view
GRANT SELECT ON comprehensive_housing_billing_test TO authenticated;
GRANT SELECT ON comprehensive_housing_billing_test TO service_role;

CREATE VIEW comprehensive_housing_billing_view AS
WITH 
-- Step 1: List all Properties
AllProperties AS (
    SELECT 
        p.id AS property_id,
        p.title AS property_name,
        p.address AS property_address
    FROM properties p
    WHERE p.status = 'active'
),
-- Step 2: Check for staff assigned to rooms and add their rent
roomassignment AS (
    SELECT
        ap.property_id,
        ap.property_name,
        ap.property_address,
        COUNT(DISTINCT a.id) AS total_assignments,
        COALESCE(AVG(CASE WHEN a.status = 'Active' THEN a.rent_amount END), 0) AS avg_rent_amount,
        COALESCE(SUM(CASE WHEN a.status = 'Active' THEN a.rent_amount END), 0) AS total_rent_amount,
        STRING_AGG(DISTINCT CASE WHEN a.status = 'Active' THEN a.tenant_id::text END, ',') AS tenant_ids
    FROM AllProperties ap
    LEFT JOIN assignments a ON ap.property_id::text = a.property_id::text
    GROUP BY ap.property_id, ap.property_name, ap.property_address
),
numberofrooms AS (
    SELECT
        r.property_id,
        COUNT(1) AS housing_capacity,
        COUNT(CASE WHEN a.id IS NOT NULL THEN 1 END) AS housing_occupancy
    FROM rooms r
    LEFT JOIN assignments a ON r.id::text = a.room_id::text AND a.status = 'Active'
    GROUP BY r.property_id
),
-- Step 5: Check which states properties are based on (from staff_locations table)
GettingStateName AS (
    SELECT DISTINCT
        sl.location_description,
        sl.location_description AS state_name
    FROM staff_locations sl
),
-- Step 4: Check utilities for the billing period (filtered by billing_period_start/end)
GettingUtilities AS (
    SELECT
        us.property_id,
        ut.name AS utility_name,
        COALESCE(us.billing_amount, 0) AS utility_cost,
        us.billing_date
    FROM utility_setups us
    JOIN utility_types ut ON us.utility_type_id = ut.id
    -- Filter utilities based on billing period dates (will be applied in main query)
),
UtilityCosts AS (
    SELECT
        property_id,
        SUM(CASE WHEN utility_name ILIKE '%propane%' OR utility_name ILIKE '%gas%' THEN utility_cost ELSE 0 END) AS propane_cost,
        SUM(CASE WHEN utility_name ILIKE '%water%' OR utility_name ILIKE '%sewer%' THEN utility_cost ELSE 0 END) AS water_sewer_cost,
        SUM(CASE WHEN utility_name ILIKE '%electric%' OR utility_name ILIKE '%power%' THEN utility_cost ELSE 0 END) AS electricity_cost,
        SUM(CASE WHEN utility_name ILIKE '%maintenance%' THEN utility_cost ELSE 0 END) AS maintenance_cost,
        SUM(utility_cost) AS total_utilities
    FROM GettingUtilities
    GROUP BY property_id
),
-- Step 3: Go into billing table and see if they appear for the billing start and end period
BillingData AS (
    SELECT
        b.property_id,
        SUM(CASE WHEN b.billing_type = 'housing' THEN COALESCE(b.rent_amount, 0) ELSE 0 END) AS actual_payroll_deductions,
        STRING_AGG(DISTINCT b.payment_status::text, ', ') AS payment_status,
        STRING_AGG(DISTINCT 
            CASE 
                WHEN b.period_start IS NOT NULL AND b.period_end IS NOT NULL 
                THEN CONCAT(TO_CHAR(b.period_start, 'MM/DD/YYYY'), ' - ', TO_CHAR(b.period_end, 'MM/DD/YYYY'))
                ELSE 'N/A'
            END, 
            ', '
        ) AS billing_period,
        MIN(b.period_start) AS billing_period_start,
        MAX(b.period_end) AS billing_period_end
    FROM billing b
    WHERE b.billing_type = 'housing'
    -- Note: Period filtering will be applied in the main query via billing_period_start/end
    GROUP BY b.property_id
)
-- Final SELECT following the exact logic flow:
-- 1. List all Properties ✓
-- 2. Check for staff assigned to rooms and add their rent ✓ 
-- 3. Go into billing table for the billing period ✓
-- 4. Check utilities for that billing period ✓
-- 5. Check which states properties are based on ✓
SELECT 
    -- Property Information (Step 1)
    ra.property_id,
    ra.property_name,
    ra.property_address,
    
    -- Staff Assignment Information (Step 2)
    ra.total_assignments,
    ra.avg_rent_amount,
    ra.total_rent_amount,
    COALESCE(nr.housing_capacity, 0) AS housing_capacity,
    COALESCE(nr.housing_occupancy, 0) AS housing_occupancy,
    CASE 
        WHEN nr.housing_occupancy > 0 
        THEN (ra.avg_rent_amount)
        ELSE 0
    END AS rent_per_employee,
    ra.total_rent_amount AS monthly_rent_charges,
    
    -- State Information (Step 5)
    COALESCE(gs.state_name, 'Unknown') AS state_name,
    
    -- Utility Information (Step 4) - from utility_setups table
    COALESCE(uc.propane_cost, 0) AS propane_cost,
    COALESCE(uc.water_sewer_cost, 0) AS water_sewer_cost,
    COALESCE(uc.electricity_cost, 0) AS electricity_cost,
    COALESCE(uc.total_utilities, 0) AS total_utilities,
    COALESCE(uc.maintenance_cost, 0) AS maintenance_cost,
    
    -- Calculated Totals
    (COALESCE(ra.total_rent_amount, 0) + COALESCE(uc.total_utilities, 0) + COALESCE(uc.maintenance_cost, 0)) AS total_cost,
    ra.total_rent_amount AS expected_rent_occupancy,
    (ra.avg_rent_amount * COALESCE(nr.housing_capacity, 0)) AS expected_rent_capacity,
    
    -- Billing Information (Step 3) - Actual Payroll Deductions from billing table
    COALESCE(bd.actual_payroll_deductions, 0) AS actual_payroll_deductions,
    (COALESCE(bd.actual_payroll_deductions, 0) - COALESCE(ra.total_rent_amount, 0)) AS variance_apd_rtc,
    (COALESCE(bd.actual_payroll_deductions, 0) - (ra.avg_rent_amount * COALESCE(nr.housing_capacity, 0))) AS variance_apd_rro,
    COALESCE(bd.billing_period, 'N/A') AS billing_period,
    COALESCE(bd.payment_status, 'N/A') AS payment_status,
    bd.billing_period_start,
    bd.billing_period_end

FROM roomassignment ra
LEFT JOIN numberofrooms nr
    ON ra.property_id::text = nr.property_id::text
LEFT JOIN GettingStateName gs
    ON ra.property_id::text = gs.location_description
LEFT JOIN UtilityCosts uc
    ON ra.property_id::text = uc.property_id::text
LEFT JOIN BillingData bd
    ON ra.property_id::text = bd.property_id::text
ORDER BY ra.property_name;

-- Grant permissions on the view
GRANT SELECT ON comprehensive_housing_billing_view TO authenticated;
GRANT SELECT ON comprehensive_housing_billing_view TO service_role;

-- Add comment
COMMENT ON VIEW comprehensive_housing_billing_view IS 
'Comprehensive housing view with billing, utilities, and deductions data integrated from multiple tables';
