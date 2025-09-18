-- Create table for pending eligibility assessments awaiting finance approval
-- This separates the eligibility assessment from the final refund decision

-- Create eligibility assessment status enum
DO $$ BEGIN
    CREATE TYPE eligibility_assessment_status AS ENUM ('pending_finance_approval', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create eligibility assessments table
CREATE TABLE IF NOT EXISTS security_deposit_eligibility_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    security_deposit_id UUID NOT NULL REFERENCES security_deposits(id) ON DELETE CASCADE,
    
    -- Assessment data from eligibility form
    assessment_data JSONB NOT NULL,
    calculated_result JSONB NOT NULL, -- refund amount, recommendation, etc.
    
    -- Assessment metadata
    assessed_by UUID NOT NULL REFERENCES auth.users(id),
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Finance approval status
    status eligibility_assessment_status DEFAULT 'pending_finance_approval',
    finance_approved_by UUID REFERENCES auth.users(id),
    finance_approved_at TIMESTAMP WITH TIME ZONE,
    finance_approval_notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT unique_assessment_per_deposit UNIQUE(security_deposit_id)
);

-- Create view for finance approval queue (eligibility assessments)
CREATE OR REPLACE VIEW eligibility_finance_approval_queue AS
SELECT 
    ea.*,
    -- Get assessor name
    COALESCE(
        assessor_profile.full_name,
        assessor_profile.email,
        'Unknown User'
    ) as assessed_by_name,
    -- Get finance approver name
    COALESCE(
        finance_profile.full_name,
        finance_profile.email,
        'Unknown User'
    ) as finance_approved_by_name,
    -- Security deposit and assignment info
    sd.total_amount as deposit_amount,
    sd.payment_status as deposit_payment_status,
    a.tenant_name,
    a.property_name,
    a.room_name,
    a.start_date as assignment_start_date,
    a.end_date as assignment_end_date
FROM security_deposit_eligibility_assessments ea
LEFT JOIN security_deposits sd ON ea.security_deposit_id = sd.id
LEFT JOIN assignments a ON sd.assignment_id = a.id
LEFT JOIN profiles assessor_profile ON ea.assessed_by = assessor_profile.id
LEFT JOIN profiles finance_profile ON ea.finance_approved_by = finance_profile.id;

-- Create function to submit eligibility assessment for finance approval
CREATE OR REPLACE FUNCTION submit_eligibility_for_finance_approval(
    security_deposit_id_param UUID,
    assessment_data_param JSONB,
    calculated_result_param JSONB,
    assessed_by_param UUID
)
RETURNS UUID AS $$
DECLARE
    assessment_id UUID;
BEGIN
    -- Insert eligibility assessment
    INSERT INTO security_deposit_eligibility_assessments (
        security_deposit_id,
        assessment_data,
        calculated_result,
        assessed_by,
        status
    ) VALUES (
        security_deposit_id_param,
        assessment_data_param,
        calculated_result_param,
        assessed_by_param,
        'pending_finance_approval'
    )
    ON CONFLICT (security_deposit_id) 
    DO UPDATE SET
        assessment_data = EXCLUDED.assessment_data,
        calculated_result = EXCLUDED.calculated_result,
        assessed_by = EXCLUDED.assessed_by,
        assessed_at = NOW(),
        status = 'pending_finance_approval',
        updated_at = NOW(),
        updated_by = EXCLUDED.assessed_by
    RETURNING id INTO assessment_id;
    
    -- Add audit trail entry
    INSERT INTO security_deposit_audit_trail (
        security_deposit_id,
        action_type,
        action_description,
        action_data,
        performed_by
    ) VALUES (
        security_deposit_id_param,
        'Eligibility Assessment Submitted',
        'Eligibility assessment submitted to Finance Manager for approval',
        jsonb_build_object(
            'assessment_id', assessment_id,
            'refund_amount', calculated_result_param->>'refundAmount'
        ),
        assessed_by_param
    );
    
    RETURN assessment_id;
END;
$$ LANGUAGE plpgsql;

-- Create function for finance approval of eligibility assessment
CREATE OR REPLACE FUNCTION finance_approve_eligibility_assessment(
    assessment_id_param UUID,
    approved_by_param UUID,
    approval_notes_param TEXT DEFAULT NULL,
    is_approved_param BOOLEAN DEFAULT TRUE
)
RETURNS BOOLEAN AS $$
DECLARE
    new_status eligibility_assessment_status;
    assessment_record RECORD;
BEGIN
    -- Set approval status
    new_status := CASE WHEN is_approved_param THEN 'approved' ELSE 'rejected' END;
    
    -- Update assessment status
    UPDATE security_deposit_eligibility_assessments 
    SET 
        status = new_status,
        finance_approved_by = approved_by_param,
        finance_approved_at = NOW(),
        finance_approval_notes = approval_notes_param,
        updated_by = approved_by_param,
        updated_at = NOW()
    WHERE id = assessment_id_param
    RETURNING * INTO assessment_record;
    
    -- If approved, create the refund decision
    IF is_approved_param THEN
        INSERT INTO security_deposit_refund_decisions (
            security_deposit_id,
            assessment_data,
            decision_type,
            refund_amount,
            total_deductions,
            approved_by,
            created_by,
            updated_by
        ) VALUES (
            assessment_record.security_deposit_id,
            assessment_record.assessment_data,
            CASE 
                WHEN (assessment_record.calculated_result->>'refundAmount')::DECIMAL > 0 THEN 'Approved'
                ELSE 'Denied'
            END,
            COALESCE((assessment_record.calculated_result->>'refundAmount')::DECIMAL, 0),
            COALESCE((assessment_record.calculated_result->>'totalDeductions')::DECIMAL, 0),
            assessment_record.assessed_by,
            approved_by_param,
            approved_by_param
        );
    END IF;
    
    -- Add audit trail entry
    INSERT INTO security_deposit_audit_trail (
        security_deposit_id,
        action_type,
        action_description,
        action_data,
        performed_by
    ) VALUES (
        assessment_record.security_deposit_id,
        CASE WHEN is_approved_param THEN 'Finance Approved Assessment' ELSE 'Finance Rejected Assessment' END,
        CASE WHEN is_approved_param 
             THEN 'Eligibility assessment approved by Finance Manager - refund decision created' 
             ELSE 'Eligibility assessment rejected by Finance Manager' 
        END,
        jsonb_build_object(
            'assessment_id', assessment_id_param,
            'approval_notes', approval_notes_param,
            'is_approved', is_approved_param
        ),
        approved_by_param
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_eligibility_assessments_status ON security_deposit_eligibility_assessments(status);
CREATE INDEX IF NOT EXISTS idx_eligibility_assessments_deposit_id ON security_deposit_eligibility_assessments(security_deposit_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_assessments_assessed_at ON security_deposit_eligibility_assessments(assessed_at DESC);

-- Create RLS policies
ALTER TABLE security_deposit_eligibility_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view eligibility assessments" ON security_deposit_eligibility_assessments;
CREATE POLICY "Users can view eligibility assessments" ON security_deposit_eligibility_assessments
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert eligibility assessments" ON security_deposit_eligibility_assessments;
CREATE POLICY "Users can insert eligibility assessments" ON security_deposit_eligibility_assessments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update eligibility assessments" ON security_deposit_eligibility_assessments;
CREATE POLICY "Users can update eligibility assessments" ON security_deposit_eligibility_assessments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON eligibility_finance_approval_queue TO authenticated;
GRANT EXECUTE ON FUNCTION submit_eligibility_for_finance_approval(UUID, JSONB, JSONB, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION finance_approve_eligibility_assessment(UUID, UUID, TEXT, BOOLEAN) TO authenticated;

-- Add comments
COMMENT ON TABLE security_deposit_eligibility_assessments IS 'Stores eligibility assessments pending finance approval';
COMMENT ON VIEW eligibility_finance_approval_queue IS 'View showing eligibility assessments with user names for finance approval workflows';
COMMENT ON FUNCTION submit_eligibility_for_finance_approval IS 'Submit an eligibility assessment to Finance Manager for approval';
COMMENT ON FUNCTION finance_approve_eligibility_assessment IS 'Finance Manager approval/rejection of eligibility assessments';

SELECT 'Eligibility assessments table and workflow created successfully' as status;
