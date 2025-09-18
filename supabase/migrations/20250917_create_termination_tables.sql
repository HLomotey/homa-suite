-- Create termination management system
-- Created: 2025-09-17

-- Create enums
CREATE TYPE termination_status AS ENUM (
    'draft', 'pending_manager_approval', 'pending_hr_approval', 
    'approved', 'rejected', 'completed'
);

CREATE TYPE separation_type AS ENUM (
    'voluntary', 'involuntary', 'layoff', 'retirement', 
    'end_of_contract', 'death', 'other'
);

CREATE TYPE termination_reason AS ENUM (
    'resignation', 'better_opportunity', 'personal_reasons', 'relocation',
    'performance_issues', 'misconduct', 'attendance_issues', 'policy_violation',
    'restructuring', 'budget_cuts', 'position_elimination', 'retirement_voluntary',
    'death', 'other'
);

CREATE TYPE rehire_eligibility AS ENUM (
    'eligible', 'not_eligible', 'conditional', 'under_review'
);

CREATE TYPE direct_deposit_action AS ENUM (
    'keep_active', 'cancel_immediately', 'cancel_after_final_pay', 
    'update_account', 'no_action_needed'
);

-- Create main termination_requests table
CREATE TABLE termination_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Employee Information (references external_staff "ASSOCIATE ID")
    employee_associate_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    employee_email VARCHAR(255),
    employee_department VARCHAR(255),
    employee_job_title VARCHAR(255),
    
    -- Manager Information
    manager_associate_id VARCHAR(50),
    manager_name VARCHAR(255),
    
    -- Termination Details
    effective_date DATE NOT NULL,
    last_day_worked DATE NOT NULL,
    separation_type separation_type NOT NULL,
    reason_for_leaving termination_reason NOT NULL,
    rehire_eligible rehire_eligibility NOT NULL DEFAULT 'under_review',
    direct_deposit_action direct_deposit_action NOT NULL DEFAULT 'cancel_after_final_pay',
    
    -- Status and Workflow
    status termination_status NOT NULL DEFAULT 'draft',
    
    -- Approval Tracking
    manager_approved_at TIMESTAMPTZ,
    manager_approved_by VARCHAR(50),
    hr_approved_at TIMESTAMPTZ,
    hr_approved_by VARCHAR(50),
    
    -- Processing Status
    adp_processed BOOLEAN DEFAULT FALSE,
    adp_processed_at TIMESTAMPTZ,
    adp_processed_by VARCHAR(50),
    
    -- Comments
    notes TEXT,
    manager_comments TEXT,
    hr_comments TEXT,
    rejection_reason TEXT,
    
    -- Audit Fields
    initiated_by VARCHAR(50) NOT NULL,
    initiated_by_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_effective_date_after_last_day CHECK (effective_date >= last_day_worked)
);

-- Create indexes
CREATE INDEX idx_termination_requests_employee_associate_id ON termination_requests(employee_associate_id);
CREATE INDEX idx_termination_requests_status ON termination_requests(status);
CREATE INDEX idx_termination_requests_effective_date ON termination_requests(effective_date);
CREATE INDEX idx_termination_requests_initiated_by ON termination_requests(initiated_by);

-- Create update timestamp trigger
CREATE TRIGGER update_termination_requests_updated_at
    BEFORE UPDATE ON termination_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE termination_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on termination_requests" ON termination_requests
    FOR ALL USING (auth.role() = 'authenticated');

-- Add comments
COMMENT ON TABLE termination_requests IS 'Employee termination requests and workflow management';
COMMENT ON COLUMN termination_requests.employee_associate_id IS 'References external_staff ASSOCIATE ID';
COMMENT ON COLUMN termination_requests.manager_associate_id IS 'References external_staff ASSOCIATE ID for manager';
