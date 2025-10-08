-- Script to delete duplicate records from external_staff table
-- This script identifies duplicates based on ASSOCIATE ID and keeps the most recent record
-- Created: 2025-09-24

-- First, let's analyze the current state of duplicates
DO $$
DECLARE
    total_records INTEGER;
    unique_associate_ids INTEGER;
    duplicate_count INTEGER;
BEGIN
    -- Get total records
    SELECT COUNT(*) INTO total_records FROM public.external_staff;
    
    -- Get unique ASSOCIATE IDs (excluding NULL values)
    SELECT COUNT(DISTINCT "ASSOCIATE ID") INTO unique_associate_ids 
    FROM public.external_staff 
    WHERE "ASSOCIATE ID" IS NOT NULL AND "ASSOCIATE ID" != '';
    
    -- Calculate duplicates
    duplicate_count := total_records - unique_associate_ids;
    
    RAISE NOTICE 'EXTERNAL STAFF DUPLICATE ANALYSIS:';
    RAISE NOTICE '- Total records: %', total_records;
    RAISE NOTICE '- Unique ASSOCIATE IDs: %', unique_associate_ids;
    RAISE NOTICE '- Potential duplicates: %', duplicate_count;
    RAISE NOTICE '----------------------------------------';
END $$;

-- Show detailed duplicate analysis
WITH duplicate_analysis AS (
    SELECT 
        "ASSOCIATE ID",
        COUNT(*) as record_count,
        STRING_AGG(DISTINCT "PAYROLL FIRST NAME" || ' ' || "PAYROLL LAST NAME", ', ') as names,
        MIN(created_at) as first_created,
        MAX(created_at) as last_created
    FROM public.external_staff 
    WHERE "ASSOCIATE ID" IS NOT NULL AND "ASSOCIATE ID" != ''
    GROUP BY "ASSOCIATE ID"
    HAVING COUNT(*) > 1
)
SELECT 
    "ASSOCIATE ID",
    record_count,
    names,
    first_created,
    last_created,
    (last_created - first_created) as time_span
FROM duplicate_analysis
ORDER BY record_count DESC, "ASSOCIATE ID";

-- Create a backup table before deletion (optional but recommended)
DO $$
BEGIN
    -- Drop backup table if it exists to avoid conflicts
    DROP TABLE IF EXISTS public.external_staff_backup_before_dedup;
    
    -- Create fresh backup
    CREATE TABLE public.external_staff_backup_before_dedup AS
    SELECT * FROM public.external_staff;
    
    RAISE NOTICE 'Backup table created: external_staff_backup_before_dedup';
END $$;

-- Method 1: Delete duplicates keeping the most recent record (based on created_at)
-- This is the safest approach as it preserves the most recently imported data
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Create a temporary table with IDs to delete
    CREATE TEMP TABLE temp_duplicates_to_delete AS
    WITH ranked_records AS (
        SELECT 
            id,
            "ASSOCIATE ID",
            "PAYROLL FIRST NAME",
            "PAYROLL LAST NAME",
            created_at,
            ROW_NUMBER() OVER (
                PARTITION BY "ASSOCIATE ID" 
                ORDER BY created_at DESC, updated_at DESC, id DESC
            ) as rn
        FROM public.external_staff
        WHERE "ASSOCIATE ID" IS NOT NULL AND "ASSOCIATE ID" != ''
    )
    SELECT id, "ASSOCIATE ID", "PAYROLL FIRST NAME", "PAYROLL LAST NAME", created_at
    FROM ranked_records 
    WHERE rn > 1;
    
    -- Delete the duplicates
    DELETE FROM public.external_staff 
    WHERE id IN (SELECT id FROM temp_duplicates_to_delete);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % duplicate records based on ASSOCIATE ID', deleted_count;
    
    -- Clean up temp table
    DROP TABLE temp_duplicates_to_delete;
END $$;

-- Handle records with NULL or empty ASSOCIATE ID separately
-- These might be legitimate different records, so we'll be more conservative
DO $$
DECLARE
    null_deleted_count INTEGER;
BEGIN
    -- Create a temporary table with NULL ASSOCIATE ID duplicates to delete
    CREATE TEMP TABLE temp_null_duplicates_to_delete AS
    WITH null_associate_duplicates AS (
        SELECT 
            id,
            "PAYROLL FIRST NAME",
            "PAYROLL LAST NAME",
            "WORK E-MAIL",
            "PERSONAL E-MAIL",
            created_at,
            ROW_NUMBER() OVER (
                PARTITION BY 
                    COALESCE("PAYROLL FIRST NAME", ''),
                    COALESCE("PAYROLL LAST NAME", ''),
                    COALESCE("WORK E-MAIL", ''),
                    COALESCE("PERSONAL E-MAIL", '')
                ORDER BY created_at DESC, updated_at DESC, id DESC
            ) as rn
        FROM public.external_staff
        WHERE ("ASSOCIATE ID" IS NULL OR "ASSOCIATE ID" = '')
        AND (
            "PAYROLL FIRST NAME" IS NOT NULL OR 
            "PAYROLL LAST NAME" IS NOT NULL OR 
            "WORK E-MAIL" IS NOT NULL OR 
            "PERSONAL E-MAIL" IS NOT NULL
        )
    )
    SELECT id 
    FROM null_associate_duplicates 
    WHERE rn > 1
    AND "PAYROLL FIRST NAME" IS NOT NULL 
    AND "PAYROLL LAST NAME" IS NOT NULL;
    
    -- Delete the NULL ASSOCIATE ID duplicates
    DELETE FROM public.external_staff 
    WHERE id IN (SELECT id FROM temp_null_duplicates_to_delete);
    
    GET DIAGNOSTICS null_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % duplicate records with NULL/empty ASSOCIATE ID', null_deleted_count;
    
    -- Clean up temp table
    DROP TABLE temp_null_duplicates_to_delete;
END $$;

-- Final analysis after cleanup
DO $$
DECLARE
    final_total_records INTEGER;
    final_unique_associate_ids INTEGER;
    remaining_nulls INTEGER;
BEGIN
    -- Get final total records
    SELECT COUNT(*) INTO final_total_records FROM public.external_staff;
    
    -- Get final unique ASSOCIATE IDs
    SELECT COUNT(DISTINCT "ASSOCIATE ID") INTO final_unique_associate_ids 
    FROM public.external_staff 
    WHERE "ASSOCIATE ID" IS NOT NULL AND "ASSOCIATE ID" != '';
    
    -- Get remaining NULL ASSOCIATE IDs
    SELECT COUNT(*) INTO remaining_nulls 
    FROM public.external_staff 
    WHERE "ASSOCIATE ID" IS NULL OR "ASSOCIATE ID" = '';
    
    RAISE NOTICE 'FINAL RESULTS AFTER DEDUPLICATION:';
    RAISE NOTICE '- Total records remaining: %', final_total_records;
    RAISE NOTICE '- Unique ASSOCIATE IDs: %', final_unique_associate_ids;
    RAISE NOTICE '- Records with NULL/empty ASSOCIATE ID: %', remaining_nulls;
    RAISE NOTICE '----------------------------------------';
END $$;

-- Optional: Add a unique constraint to prevent future duplicates
-- Uncomment the following lines if you want to enforce uniqueness going forward
/*
DO $$
BEGIN
    ALTER TABLE public.external_staff 
    ADD CONSTRAINT unique_external_staff_associate_id 
    UNIQUE ("ASSOCIATE ID") 
    DEFERRABLE INITIALLY DEFERRED;
    
    RAISE NOTICE 'Added unique constraint on ASSOCIATE ID to prevent future duplicates';
END $$;
*/

-- Optional: Clean up backup table (uncomment if you want to remove the backup)
-- DROP TABLE IF EXISTS public.external_staff_backup_before_dedup;

-- Final completion message
DO $$
BEGIN
    RAISE NOTICE 'Deduplication script completed successfully!';
    RAISE NOTICE 'Backup table "external_staff_backup_before_dedup" has been preserved for safety.';
END $$;
