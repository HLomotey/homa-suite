-- Create termination_requests table to track staff termination requests

-- Create enums for termination request fields
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

-- Create termination_requests table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_termination_requests_staff_id ON termination_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_termination_requests_manager_id ON termination_requests(manager_id);
CREATE INDEX IF NOT EXISTS idx_termination_requests_status ON termination_requests(status);
CREATE INDEX IF NOT EXISTS idx_termination_requests_submitted_at ON termination_requests(submitted_at);
CREATE INDEX IF NOT EXISTS idx_termination_requests_effective_date ON termination_requests(effective_termination_date);
CREATE INDEX IF NOT EXISTS idx_termination_requests_submitted_by ON termination_requests(submitted_by);

-- Enable RLS
ALTER TABLE termination_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view termination requests" 
ON termination_requests FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create termination requests" 
ON termination_requests FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND submitted_by = auth.uid());

CREATE POLICY "Users can update their own termination requests" 
ON termination_requests FOR UPDATE 
USING (auth.role() = 'authenticated' AND (submitted_by = auth.uid() OR processed_by = auth.uid()));

-- Create trigger for updated_at
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

CREATE TRIGGER update_termination_request_timestamp
    BEFORE UPDATE ON termination_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_termination_request_timestamp();

-- Create a comprehensive view for termination requests with staff and manager details
CREATE OR REPLACE VIEW termination_requests_detailed AS
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

-- Grant permissions on the view
GRANT SELECT ON termination_requests_detailed TO authenticated;

-- Create function to submit termination request
CREATE OR REPLACE FUNCTION submit_termination_request(
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
RETURNS UUID AS $$$
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

-- Create function to process termination request
CREATE OR REPLACE FUNCTION process_termination_request(
    p_request_id UUID,
    p_new_status termination_status,
    p_processing_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$$
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

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION submit_termination_request(UUID, UUID, DATE, DATE, separation_type, TEXT, BOOLEAN, direct_deposit_instruction, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION process_termination_request(UUID, termination_status, TEXT) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE termination_requests IS 'Tracks staff termination requests with workflow management';
COMMENT ON VIEW termination_requests_detailed IS 'Detailed view of termination requests with staff and manager information';
COMMENT ON FUNCTION submit_termination_request IS 'Submits a new termination request for a staff member';
COMMENT ON FUNCTION process_termination_request IS 'Processes a termination request (approve/reject/complete)';

-- Create notification trigger for new termination requests (optional)
CREATE OR REPLACE FUNCTION notify_termination_request()
RETURNS TRIGGER AS $$
BEGIN
    -- This could be extended to send notifications to managers or HR
    PERFORM pg_notify('termination_request_submitted', 
        json_build_object(
            'request_id', NEW.id,
            'staff_id', NEW.staff_id,
            'manager_id', NEW.manager_id,
            'submitted_by', NEW.submitted_by
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_termination_request_trigger
    AFTER INSERT ON termination_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_termination_request();