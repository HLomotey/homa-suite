-- Fix payment_status constraint issue in assignments table
-- Migration: 20250914_fix_payment_status_constraint.sql

-- The payment_status column should be completely removed from assignments table
-- since it's no longer used in the application logic.

DO $$ 
BEGIN
    -- Check if payment_status column exists in assignments table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'payment_status'
        AND table_schema = 'public'
    ) THEN
        -- Drop the column completely
        ALTER TABLE assignments DROP COLUMN payment_status;
        
        RAISE NOTICE 'Dropped payment_status column from assignments table';
        
        -- Also check if the payment_status_enum type exists and drop it if unused
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
            -- Check if any other tables use this enum
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE udt_name = 'payment_status_enum'
                AND table_schema = 'public'
            ) THEN
                DROP TYPE payment_status_enum;
                RAISE NOTICE 'Dropped unused payment_status_enum type';
            END IF;
        END IF;
    ELSE
        -- If it doesn't exist, the column was already removed
        RAISE NOTICE 'payment_status column does not exist in assignments table (expected)';
    END IF;
END $$;
