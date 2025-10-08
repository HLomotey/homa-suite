-- Migration: Add company account support to staff locations
-- This migration adds company_account_id field to staff_locations table
-- and creates history table if it doesn't exist

-- Add company_account_id column to staff_locations table
ALTER TABLE staff_locations 
ADD COLUMN company_account_id INTEGER REFERENCES company_accounts(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_locations_company_account_id 
ON staff_locations(company_account_id);

-- Create staff_locations_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS staff_locations_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_location_id UUID NOT NULL,
    company_location_id UUID,
    location_code TEXT,
    location_description TEXT,
    is_active BOOLEAN,
    external_staff_id UUID,
    manager_id UUID,
    company_account_id INTEGER,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by TEXT,
    change_type TEXT CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or replace the staff locations view to include company account information
CREATE OR REPLACE VIEW staff_locations_view AS
SELECT 
    sl.id,
    sl.company_location_id,
    cl.name as company_location_name,
    sl.location_code,
    sl.location_description,
    sl.is_active,
    sl.external_staff_id,
    sl.manager_id,
    COALESCE(
        es."PAYROLL FIRST NAME" || ' ' || es."PAYROLL LAST NAME",
        ''
    ) as manager_name,
    sl.company_account_id,
    ca.name as company_account_name,
    sl.created_at,
    sl.updated_at
FROM staff_locations sl
LEFT JOIN company_locations cl ON sl.company_location_id = cl.id
LEFT JOIN external_staff es ON sl.manager_id = es.id
LEFT JOIN company_accounts ca ON sl.company_account_id = ca.id;

-- Update the trigger function to include company_account_id in history tracking
CREATE OR REPLACE FUNCTION track_staff_location_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO staff_locations_history (
            staff_location_id,
            company_location_id,
            location_code,
            location_description,
            is_active,
            external_staff_id,
            manager_id,
            company_account_id,
            changed_at,
            changed_by,
            change_type,
            new_values
        ) VALUES (
            NEW.id,
            NEW.company_location_id,
            NEW.location_code,
            NEW.location_description,
            NEW.is_active,
            NEW.external_staff_id,
            NEW.manager_id,
            NEW.company_account_id,
            NOW(),
            auth.uid()::text,
            'INSERT',
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO staff_locations_history (
            staff_location_id,
            company_location_id,
            location_code,
            location_description,
            is_active,
            external_staff_id,
            manager_id,
            company_account_id,
            changed_at,
            changed_by,
            change_type,
            old_values,
            new_values
        ) VALUES (
            NEW.id,
            NEW.company_location_id,
            NEW.location_code,
            NEW.location_description,
            NEW.is_active,
            NEW.external_staff_id,
            NEW.manager_id,
            NEW.company_account_id,
            NOW(),
            auth.uid()::text,
            'UPDATE',
            row_to_json(OLD),
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO staff_locations_history (
            staff_location_id,
            company_location_id,
            location_code,
            location_description,
            is_active,
            external_staff_id,
            manager_id,
            company_account_id,
            changed_at,
            changed_by,
            change_type,
            old_values
        ) VALUES (
            OLD.id,
            OLD.company_location_id,
            OLD.location_code,
            OLD.location_description,
            OLD.is_active,
            OLD.external_staff_id,
            OLD.manager_id,
            OLD.company_account_id,
            NOW(),
            auth.uid()::text,
            'DELETE',
            row_to_json(OLD)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON staff_locations_view TO authenticated;
GRANT SELECT ON company_accounts TO authenticated;
