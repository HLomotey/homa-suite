-- Simple script to delete all data from billing table
-- Handles foreign key constraints by deleting in correct order
-- Created: 2025-10-05

-- WARNING: This will permanently delete ALL billing data
-- Make sure you have a backup!

-- Delete in correct order to handle foreign key constraints
DELETE FROM billing_deductions;  -- Delete child records first
DELETE FROM billing;             -- Delete parent records

-- Verify deletion
SELECT 
    'billing' as table_name, 
    COUNT(*) as remaining_records 
FROM billing
UNION ALL
SELECT 
    'billing_deductions' as table_name, 
    COUNT(*) as remaining_records 
FROM billing_deductions;

-- Success message
SELECT 'Billing data deletion completed' as status;
