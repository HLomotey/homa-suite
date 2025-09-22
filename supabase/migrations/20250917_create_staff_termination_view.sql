-- Create a comprehensive view for staff termination processing
-- This view joins external_staff with staff_locations to get manager information

CREATE OR REPLACE VIEW staff_termination_view AS
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_termination_view_staff_id 
ON external_staff(id);

CREATE INDEX IF NOT EXISTS idx_staff_termination_view_company_code 
ON external_staff("COMPANY CODE");

CREATE INDEX IF NOT EXISTS idx_staff_termination_view_location 
ON external_staff("LOCATION");

CREATE INDEX IF NOT EXISTS idx_staff_termination_view_position_status 
ON external_staff("POSITION STATUS");

CREATE INDEX IF NOT EXISTS idx_staff_termination_view_termination_date 
ON external_staff("TERMINATION DATE");

-- Grant permissions
GRANT SELECT ON staff_termination_view TO authenticated;

-- Add comments for documentation
COMMENT ON VIEW staff_termination_view IS 'Comprehensive view joining external staff with their locations and managers for termination processing';

-- Create a function to get staff with their managers for termination
CREATE OR REPLACE FUNCTION get_staff_for_termination(
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

-- Create a function to get managers for a specific location
CREATE OR REPLACE FUNCTION get_managers_for_location(
    p_location_code TEXT DEFAULT NULL
)
RETURNS TABLE (
    manager_id UUID,
    manager_full_name TEXT,
    manager_work_email TEXT,
    manager_job_title TEXT,
    location_code TEXT,
    location_description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        stv.manager_id,
        stv.manager_full_name,
        stv.manager_work_email,
        stv.manager_job_title,
        stv.location_code,
        stv.location_description
    FROM staff_termination_view stv
    WHERE 
        stv.manager_id IS NOT NULL
        AND (p_location_code IS NULL OR UPPER(TRIM(stv.location_code)) = UPPER(TRIM(p_location_code)))
    ORDER BY stv.manager_full_name;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_staff_for_termination(TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_managers_for_location(TEXT) TO authenticated;