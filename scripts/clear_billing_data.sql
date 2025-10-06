-- Script to safely delete all data from billing table and related tables
-- This script handles all foreign key constraints and dependencies
-- Created: 2025-10-05

-- WARNING: This script will permanently delete ALL billing data
-- Make sure you have a backup before running this script

-- Start transaction for safety
BEGIN;

-- Disable foreign key checks temporarily (PostgreSQL doesn't have this, so we'll delete in proper order)
-- Instead, we'll delete in the correct order to respect foreign key constraints

-- Step 1: Delete billing deductions first (references billing table)
DELETE FROM billing_deductions;
RAISE NOTICE 'Deleted % billing deductions', ROW_COUNT;

-- Step 2: Delete from billing table
DELETE FROM billing;
RAISE NOTICE 'Deleted % billing records', ROW_COUNT;

-- Step 3: Reset sequences if they exist
-- Reset billing table sequence (if using serial/auto-increment)
-- Note: Supabase/PostgreSQL typically uses UUID, but including this for completeness
DO $$
BEGIN
    -- Check if sequence exists and reset it
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'billing_id_seq') THEN
        ALTER SEQUENCE billing_id_seq RESTART WITH 1;
        RAISE NOTICE 'Reset billing_id_seq sequence';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'billing_deductions_id_seq') THEN
        ALTER SEQUENCE billing_deductions_id_seq RESTART WITH 1;
        RAISE NOTICE 'Reset billing_deductions_id_seq sequence';
    END IF;
END
$$;

-- Step 4: Verify deletion
DO $$
DECLARE
    billing_count INTEGER;
    deductions_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO billing_count FROM billing;
    SELECT COUNT(*) INTO deductions_count FROM billing_deductions;
    
    RAISE NOTICE 'Verification:';
    RAISE NOTICE '  - Billing records remaining: %', billing_count;
    RAISE NOTICE '  - Billing deductions remaining: %', deductions_count;
    
    IF billing_count = 0 AND deductions_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All billing data has been cleared';
    ELSE
        RAISE EXCEPTION 'ERROR: Some billing data still remains';
    END IF;
END
$$;

-- Commit the transaction
COMMIT;

RAISE NOTICE 'Billing data cleanup completed successfully';
