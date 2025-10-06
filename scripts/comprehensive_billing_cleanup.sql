-- Comprehensive Billing Data Cleanup Script
-- This script provides options for selective or complete billing data deletion
-- Handles all billing-related tables and their dependencies
-- Created: 2025-10-05

-- WARNING: This script will permanently delete billing data
-- ALWAYS backup your database before running this script

-- Configuration: Set these variables to control what gets deleted
-- Change to 'true' to enable deletion for each category
\set delete_billing_deductions 'true'
\set delete_billing_records 'true'
\set delete_flight_agreements 'true'
\set delete_transport_billing 'true'
\set reset_sequences 'true'

-- Start transaction for safety
BEGIN;

-- Create a temporary function to conditionally execute deletions
CREATE OR REPLACE FUNCTION conditional_delete(
    table_name TEXT,
    condition_var BOOLEAN,
    description TEXT
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    sql_query TEXT;
BEGIN
    IF condition_var THEN
        sql_query := 'DELETE FROM ' || table_name;
        EXECUTE sql_query;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from % (% table)', deleted_count, table_name, description;
    ELSE
        RAISE NOTICE 'Skipped deletion from % (% table) - disabled', table_name, description;
    END IF;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Display current record counts before deletion
DO $$
DECLARE
    billing_count INTEGER;
    deductions_count INTEGER;
    flight_agreements_count INTEGER;
    flight_deductions_count INTEGER;
    transport_billing_count INTEGER;
BEGIN
    -- Count existing records
    SELECT COUNT(*) INTO billing_count FROM billing WHERE 1=1;
    
    SELECT COUNT(*) INTO deductions_count 
    FROM billing_deductions WHERE 1=1;
    
    SELECT COUNT(*) INTO flight_agreements_count 
    FROM flight_agreements WHERE 1=1;
    
    SELECT COUNT(*) INTO flight_deductions_count 
    FROM flight_agreement_deductions WHERE 1=1;
    
    -- Check if transport billing tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transport_billing') THEN
        SELECT COUNT(*) INTO transport_billing_count FROM transport_billing WHERE 1=1;
    ELSE
        transport_billing_count := 0;
    END IF;
    
    RAISE NOTICE '=== CURRENT RECORD COUNTS ===';
    RAISE NOTICE 'Billing records: %', billing_count;
    RAISE NOTICE 'Billing deductions: %', deductions_count;
    RAISE NOTICE 'Flight agreements: %', flight_agreements_count;
    RAISE NOTICE 'Flight agreement deductions: %', flight_deductions_count;
    RAISE NOTICE 'Transport billing records: %', transport_billing_count;
    RAISE NOTICE '================================';
END
$$;

-- Step 1: Delete flight agreement deductions (references flight_agreements)
SELECT conditional_delete(
    'flight_agreement_deductions',
    :'delete_flight_agreements'::boolean,
    'Flight Agreement Deductions'
);

-- Step 2: Delete flight agreements
SELECT conditional_delete(
    'flight_agreements',
    :'delete_flight_agreements'::boolean,
    'Flight Agreements'
);

-- Step 3: Delete transport billing records (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transport_billing') THEN
        PERFORM conditional_delete(
            'transport_billing',
            :'delete_transport_billing'::boolean,
            'Transport Billing'
        );
    ELSE
        RAISE NOTICE 'Transport billing table does not exist - skipping';
    END IF;
END
$$;

-- Step 4: Delete billing deductions (references billing table)
SELECT conditional_delete(
    'billing_deductions',
    :'delete_billing_deductions'::boolean,
    'Billing Deductions'
);

-- Step 5: Delete main billing records
SELECT conditional_delete(
    'billing',
    :'delete_billing_records'::boolean,
    'Main Billing Records'
);

-- Step 6: Reset sequences if requested
DO $$
DECLARE
    seq_name TEXT;
    sequences_reset INTEGER := 0;
BEGIN
    IF :'reset_sequences'::boolean THEN
        -- Reset all billing-related sequences
        FOR seq_name IN 
            SELECT sequencename 
            FROM pg_sequences 
            WHERE schemaname = 'public' 
            AND (sequencename LIKE '%billing%' OR sequencename LIKE '%flight_agreement%')
        LOOP
            EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RESTART WITH 1';
            sequences_reset := sequences_reset + 1;
            RAISE NOTICE 'Reset sequence: %', seq_name;
        END LOOP;
        
        IF sequences_reset = 0 THEN
            RAISE NOTICE 'No billing-related sequences found to reset';
        ELSE
            RAISE NOTICE 'Reset % sequences', sequences_reset;
        END IF;
    ELSE
        RAISE NOTICE 'Sequence reset disabled - skipping';
    END IF;
END
$$;

-- Step 7: Final verification and summary
DO $$
DECLARE
    billing_count INTEGER;
    deductions_count INTEGER;
    flight_agreements_count INTEGER;
    flight_deductions_count INTEGER;
    transport_billing_count INTEGER;
BEGIN
    -- Count remaining records
    SELECT COUNT(*) INTO billing_count FROM billing WHERE 1=1;
    SELECT COUNT(*) INTO deductions_count FROM billing_deductions WHERE 1=1;
    SELECT COUNT(*) INTO flight_agreements_count FROM flight_agreements WHERE 1=1;
    SELECT COUNT(*) INTO flight_deductions_count FROM flight_agreement_deductions WHERE 1=1;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transport_billing') THEN
        SELECT COUNT(*) INTO transport_billing_count FROM transport_billing WHERE 1=1;
    ELSE
        transport_billing_count := 0;
    END IF;
    
    RAISE NOTICE '=== FINAL RECORD COUNTS ===';
    RAISE NOTICE 'Billing records: %', billing_count;
    RAISE NOTICE 'Billing deductions: %', deductions_count;
    RAISE NOTICE 'Flight agreements: %', flight_agreements_count;
    RAISE NOTICE 'Flight agreement deductions: %', flight_deductions_count;
    RAISE NOTICE 'Transport billing records: %', transport_billing_count;
    RAISE NOTICE '==============================';
    
    -- Check if cleanup was successful based on enabled options
    IF :'delete_billing_records'::boolean AND billing_count > 0 THEN
        RAISE EXCEPTION 'ERROR: Billing records still remain (% records)', billing_count;
    END IF;
    
    IF :'delete_billing_deductions'::boolean AND deductions_count > 0 THEN
        RAISE EXCEPTION 'ERROR: Billing deductions still remain (% records)', deductions_count;
    END IF;
    
    IF :'delete_flight_agreements'::boolean AND (flight_agreements_count > 0 OR flight_deductions_count > 0) THEN
        RAISE EXCEPTION 'ERROR: Flight agreement data still remains';
    END IF;
    
    RAISE NOTICE 'SUCCESS: Billing cleanup completed successfully';
END
$$;

-- Clean up temporary function
DROP FUNCTION conditional_delete(TEXT, BOOLEAN, TEXT);

-- Commit the transaction
COMMIT;

RAISE NOTICE 'Comprehensive billing cleanup completed';
