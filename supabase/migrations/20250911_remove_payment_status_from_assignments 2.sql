-- Remove payment_status field from assignments table
-- This field has been removed from the frontend and is no longer needed

-- Drop the payment_status column from assignments table
ALTER TABLE public.assignments DROP COLUMN IF EXISTS payment_status;

-- Drop the payment_status enum type if it exists and is no longer used
-- Note: Only drop if no other tables are using this enum
DO $$
BEGIN
    -- Check if the enum exists and if it's used by other tables
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        -- Check if any other tables use this enum (excluding assignments)
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns c
            JOIN pg_type t ON c.udt_name = t.typname
            WHERE t.typname = 'payment_status'
            AND c.table_name != 'assignments'
            AND c.table_schema = 'public'
        ) THEN
            -- Safe to drop the enum as no other tables use it
            DROP TYPE IF EXISTS payment_status;
        END IF;
    END IF;
END$$;
