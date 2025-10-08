-- Complete fix for staff termination system
-- This migration creates everything in the correct order

-- Step 1: Create enums for termination request fields
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'separation_type') THEN
        CREATE TYPE separation_type AS ENUM ('voluntary', 'involuntary', 'layoff', 'retirement', 'other');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'direct_deposit_instruction') THEN
        CREATE TYPE direct_deposit_instruction AS ENUM ('stop', 'continue', 'change');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'termination_status') THEN
        CREATE TYPE termination_status AS ENUM ('pending', 'approved', 'rejected', 'processed');
    END IF;
END $$;

-- Step 2: Drop existing view and functions that depend on it
DROP VIEW IF EXISTS termination_requests_detailed CASCADE;
DROP FUNCTION IF EXISTS submit_termination_request(UUID, UUID, DATE, DATE, separation_type, TEXT, BOOLEAN, direct_deposit_instruction, TEXT) CASCADE;
DROP FUNCTION IF EXISTS process_termination_request(UUID, termination_status, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_staff_for_termination(TEXT, TEXT, BOOLEAN) CASCADE;
DROP VIEW IF EXISTS staff_termination_view CASCADE;

-- Step 3: Recreate the staff_termination_view with correct structure
CREATE VIEW staff_termination_view AS
WITH staff_with_best_location AS (
    SELECT DISTINCT ON (es.id)
        es.*,
        sl.id as staff_location_id,
        sl.location_code,
        sl.location_description,
        sl.is_active as location_is_active,
        sl.created_at as location_created_at,
        sl.manager_id,
        cl.id as company_location_id,
        cl.name as company_location_name,
        cl.address as company_location_address,
        cl.city as company_location_city,
        cl.state as company_location_state,
        cl.zip_code as company_location_zip
    FROM external_staff es
    LEFT JOIN staff_locations sl ON (
        -- Prioritize exact company code match first
        UPPER(TRIM(es."COMPANY CODE")) = UPPER(TRIM(sl.location_code))
        OR UPPER(TRIM(es."LOCATION")) = UPPER(TRIM(sl.location_description))
        OR UPPER(TRIM(es."LOCATION")) = UPPER(TRIM(sl.location_code))
    )
    LEFT JOIN company_locations cl ON sl.company_location_id = cl.id
    WHERE es."POSITION STATUS" IS NOT NULL
    ORDER BY es.id, 
        CASE 
            WHEN UPPER(TRIM(es."COMPANY CODE")) = UPPER(TRIM(sl.location_code)) THEN 1
            WHEN UPPER(TRIM(es."LOCATION")) = UPPER(TRIM(sl.location_description)) THEN 2
            WHEN UPPER(TRIM(es."LOCATION")) = UPPER(TRIM(sl.location_code)) THEN 3
            ELSE 4
        END
)
SELECT 
    -- External Staff Information
    swbl.id as staff_id,
    swbl."PAYROLL FIRST NAME" as first_name,
    swbl."PAYROLL LAST NAME" as last_name,
    swbl."PAYROLL MIDDLE NAME" as middle_name,
    TRIM(CONCAT(
        COALESCE(swbl."PAYROLL FIRST NAME", ''), 
        CASE WHEN swbl."PAYROLL MIDDLE NAME" IS NOT NULL THEN ' ' || swbl."PAYROLL MIDDLE NAME" ELSE '' END,
        CASE WHEN swbl."PAYROLL LAST NAME" IS NOT NULL THEN ' ' || swbl."PAYROLL LAST NAME" ELSE '' END
    )) as full_name,
    swbl."PERSONAL E-MAIL" as personal_email,
    swbl."WORK E-MAIL" as work_email,
    swbl."HOME PHONE" as home_phone,
    swbl."WORK PHONE" as work_phone,
    swbl."ASSOCIATE ID" as associate_id,
    swbl."FILE NUMBER" as file_number,
    swbl."COMPANY CODE" as company_code,
    swbl."JOB TITLE" as job_title,
    swbl."BUSINESS UNIT" as business_unit,
    swbl."HOME DEPARTMENT" as home_department,
    swbl."LOCATION" as location_name,
    swbl."WORKER CATEGORY" as worker_category,
    swbl."POSITION STATUS" as position_status,
    swbl."HIRE DATE" as hire_date,
    swbl."REHIRE DATE" as rehire_date,
    swbl."TERMINATION DATE" as termination_date,
    swbl."YEARS OF SERVICE" as years_of_service,
    swbl."REPORTS TO NAME" as reports_to_name,
    swbl."JOB CLASS" as job_class,
    swbl.created_at as staff_created_at,
    swbl.updated_at as staff_updated_at,
    
    -- Staff Location Information
    swbl.staff_location_id,
    swbl.location_code,
    swbl.location_description,
    swbl.location_is_active,
    swbl.location_created_at,
    
    -- Manager Information (from external_staff via staff_locations.manager_id)
    mgr.id as manager_id,
    mgr."PAYROLL FIRST NAME" as manager_first_name,
    mgr."PAYROLL LAST NAME" as manager_last_name,
    TRIM(CONCAT(
        COALESCE(mgr."PAYROLL FIRST NAME", ''), 
        CASE WHEN mgr."PAYROLL LAST NAME" IS NOT NULL THEN ' ' || mgr."PAYROLL LAST NAME" ELSE '' END
    )) as manager_full_name,
    mgr."WORK E-MAIL" as manager_work_email,
    mgr."PERSONAL E-MAIL" as manager_personal_email,
    mgr."JOB TITLE" as manager_job_title,
    mgr."POSITION STATUS" as manager_position_status,
    
    -- Company Location Information
    swbl.company_location_id,
    swbl.company_location_name,
    swbl.company_location_address,
    swbl.company_location_city,
    swbl.company_location_state,
    swbl.company_location_zip,
    
    -- Termination Status Indicators
    CASE 
        WHEN swbl."TERMINATION DATE" IS NOT NULL AND swbl."TERMINATION DATE" != '' THEN true
        ELSE false
    END as is_terminated,
    
    CASE 
        WHEN swbl."POSITION STATUS" = 'Active' THEN 'active'
        WHEN swbl."POSITION STATUS" = 'Terminated' THEN 'terminated'
        WHEN swbl."POSITION STATUS" = 'Leave of Absence' THEN 'leave'
        WHEN swbl."POSITION STATUS" = 'Suspended' THEN 'suspended'
        ELSE 'unknown'
    END as employment_status,
    
    -- Eligibility for termination processing (more lenient for testing)
    CASE 
        WHEN swbl."TERMINATION DATE" IS NOT NULL AND swbl."TERMINATION DATE" != '' THEN false
        WHEN swbl."POSITION STATUS" IS NOT NULL THEN true
        ELSE false
    END as eligible_for_termination

FROM staff_with_best_location swbl
LEFT JOIN external_staff mgr ON swbl.manager_id = mgr.id;

-- Step 4: Create termination_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS termination_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES external_staff(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES external_staff(id) ON DELETE SET NULL,
    effective_termination_date DATE NOT NULL,
    last_day_worked DATE NOT NULL,
    separation_type separation_type NOT NULL,
    reason_for_leaving TEXT NOT NULL,
    eligible_for_rehire BOOLEAN NOT NULL DEFAULT false,
    direct_deposit_instruction direct_deposit_instruction NOT NULL DEFAULT 'stop',
    additional_notes TEXT,
    
    -- Workflow tracking
    submitted_by UUID NOT NULL REFERENCES auth.users(id),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status termination_status NOT NULL DEFAULT 'pending',
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMPTZ,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT chk_termination_dates CHECK (last_day_worked <= effective_termination_date),
    CONSTRAINT chk_processed_fields CHECK (
        (status IN ('approved', 'rejected', 'processed') AND processed_by IS NOT NULL AND processed_at IS NOT NULL)
        OR (status = 'pending' AND processed_by IS NULL AND processed_at IS NULL)
    )
);

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_termination_requests_staff_id ON termination_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_termination_requests_manager_id ON termination_requests(manager_id);
CREATE INDEX IF NOT EXISTS idx_termination_requests_status ON termination_requests(status);
CREATE INDEX IF NOT EXISTS idx_termination_requests_submitted_at ON termination_requests(submitted_at);
CREATE INDEX IF NOT EXISTS idx_termination_requests_effective_date ON termination_requests(effective_termination_date);
CREATE INDEX IF NOT EXISTS idx_termination_requests_submitted_by ON termination_requests(submitted_by);

-- Step 6: Enable RLS and create policies
ALTER TABLE termination_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view termination requests" ON termination_requests;
    DROP POLICY IF EXISTS "Users can create termination requests" ON termination_requests;
    DROP POLICY IF EXISTS "Users can update their own termination requests" ON termination_requests;
    
    -- Create new policies
    CREATE POLICY "Users can view termination requests" 
    ON termination_requests FOR SELECT 
    USING (auth.role() = 'authenticated');

    CREATE POLICY "Users can create termination requests" 
    ON termination_requests FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated' AND submitted_by = auth.uid());

    CREATE POLICY "Users can update their own termination requests" 
    ON termination_requests FOR UPDATE 
    USING (auth.role() = 'authenticated' AND (submitted_by = auth.uid() OR processed_by = auth.uid()));
END $$;

-- Step 7: Create trigger function and trigger for updated_at
CREATE OR REPLACE FUNCTION update_termination_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Auto-set processed_at when status changes to approved/rejected/processed
    IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected', 'processed') THEN
        NEW.processed_at = NOW();
        NEW.processed_by = COALESCE(NEW.processed_by, auth.uid());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_termination_request_timestamp ON termination_requests;
CREATE TRIGGER update_termination_request_timestamp
    BEFORE UPDATE ON termination_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_termination_request_timestamp();

-- Step 8: Create the detailed view for termination requests
CREATE VIEW termination_requests_detailed AS
SELECT 
    tr.id,
    tr.staff_id,
    tr.manager_id,
    tr.effective_termination_date,
    tr.last_day_worked,
    tr.separation_type,
    tr.reason_for_leaving,
    tr.eligible_for_rehire,
    tr.direct_deposit_instruction,
    tr.additional_notes,
    tr.submitted_by,
    tr.submitted_at,
    tr.status,
    tr.processed_by,
    tr.processed_at,
    tr.created_at,
    tr.updated_at,
    
    -- Staff details
    stv.full_name as staff_full_name,
    stv.work_email as staff_work_email,
    stv.personal_email as staff_personal_email,
    stv.job_title as staff_job_title,
    stv.company_code as staff_company_code,
    stv.location_name as staff_location_name,
    stv.hire_date as staff_hire_date,
    stv.years_of_service as staff_years_of_service,
    
    -- Manager details
    stv.manager_full_name,
    stv.manager_work_email,
    stv.manager_job_title,
    
    -- Submitter details
    submitter.email as submitted_by_email,
    
    -- Processor details
    processor.email as processed_by_email

FROM termination_requests tr
LEFT JOIN staff_termination_view stv ON tr.staff_id = stv.staff_id
LEFT JOIN auth.users submitter ON tr.submitted_by = submitter.id
LEFT JOIN auth.users processor ON tr.processed_by = processor.id;

-- Step 9: Create the submit_termination_request function
CREATE FUNCTION submit_termination_request(
    p_staff_id UUID,
    p_manager_id UUID,
    p_effective_termination_date DATE,
    p_last_day_worked DATE,
    p_separation_type separation_type,
    p_reason_for_leaving TEXT,
    p_eligible_for_rehire BOOLEAN,
    p_direct_deposit_instruction direct_deposit_instruction,
    p_additional_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
BEGIN
    -- Validate that staff exists and is eligible for termination
    IF NOT EXISTS (
        SELECT 1 FROM staff_termination_view 
        WHERE staff_id = p_staff_id AND eligible_for_termination = true
    ) THEN
        RAISE EXCEPTION 'Staff member is not eligible for termination or does not exist';
    END IF;
    
    -- Insert termination request
    INSERT INTO termination_requests (
        staff_id,
        manager_id,
        effective_termination_date,
        last_day_worked,
        separation_type,
        reason_for_leaving,
        eligible_for_rehire,
        direct_deposit_instruction,
        additional_notes,
        submitted_by
    ) VALUES (
        p_staff_id,
        p_manager_id,
        p_effective_termination_date,
        p_last_day_worked,
        p_separation_type,
        p_reason_for_leaving,
        p_eligible_for_rehire,
        p_direct_deposit_instruction,
        p_additional_notes,
        auth.uid()
    ) RETURNING id INTO v_request_id;
    
    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create the process_termination_request function
CREATE FUNCTION process_termination_request(
    p_request_id UUID,
    p_new_status termination_status,
    p_processing_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_staff_id UUID;
    v_effective_date DATE;
BEGIN
    -- Validate request exists and is pending
    SELECT staff_id, effective_termination_date 
    INTO v_staff_id, v_effective_date
    FROM termination_requests 
    WHERE id = p_request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Termination request not found or already processed';
    END IF;
    
    -- Update request status
    UPDATE termination_requests 
    SET 
        status = p_new_status,
        processed_by = auth.uid(),
        processed_at = NOW(),
        additional_notes = COALESCE(p_processing_notes, additional_notes)
    WHERE id = p_request_id;
    
    -- If approved and processed, update the external_staff termination date
    IF p_new_status = 'processed' THEN
        UPDATE external_staff 
        SET 
            "TERMINATION DATE" = v_effective_date::TEXT,
            "POSITION STATUS" = 'Terminated',
            updated_at = NOW()
        WHERE id = v_staff_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create the get_staff_for_termination function
CREATE FUNCTION get_staff_for_termination(
    p_company_code TEXT DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_active_only BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    staff_id UUID,
    full_name TEXT,
    job_title TEXT,
    work_email TEXT,
    personal_email TEXT,
    company_code TEXT,
    location_name TEXT,
    manager_id UUID,
    manager_full_name TEXT,
    manager_work_email TEXT,
    employment_status TEXT,
    eligible_for_termination BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        stv.staff_id,
        stv.full_name,
        stv.job_title,
        stv.work_email,
        stv.personal_email,
        stv.company_code,
        stv.location_name,
        stv.manager_id,
        stv.manager_full_name,
        stv.manager_work_email,
        stv.employment_status,
        stv.eligible_for_termination
    FROM staff_termination_view stv
    WHERE 
        (p_company_code IS NULL OR UPPER(TRIM(stv.company_code)) = UPPER(TRIM(p_company_code)))
        AND (p_location IS NULL OR UPPER(TRIM(stv.location_name)) ILIKE '%' || UPPER(TRIM(p_location)) || '%')
        AND (NOT p_active_only OR stv.eligible_for_termination = true)
    ORDER BY stv.full_name;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Grant all necessary permissions
GRANT SELECT ON staff_termination_view TO authenticated;
GRANT SELECT ON termination_requests_detailed TO authenticated;
GRANT EXECUTE ON FUNCTION submit_termination_request(UUID, UUID, DATE, DATE, separation_type, TEXT, BOOLEAN, direct_deposit_instruction, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION process_termination_request(UUID, termination_status, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_staff_for_termination(TEXT, TEXT, BOOLEAN) TO authenticated;

-- Step 13: Add comments for documentation
COMMENT ON VIEW staff_termination_view IS 'Comprehensive view joining external staff with their locations and managers for termination processing';
COMMENT ON TABLE termination_requests IS 'Tracks staff termination requests with workflow management';
COMMENT ON VIEW termination_requests_detailed IS 'Detailed view of termination requests with staff and manager information';
COMMENT ON FUNCTION submit_termination_request IS 'Submits a new termination request for a staff member';
COMMENT ON FUNCTION process_termination_request IS 'Processes a termination request (approve/reject/complete)';
COMMENT ON FUNCTION get_staff_for_termination IS 'Gets staff eligible for termination with filtering options';