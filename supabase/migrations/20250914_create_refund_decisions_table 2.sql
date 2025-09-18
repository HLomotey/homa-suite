-- Create refund decisions and audit trail table
-- This stores the complete eligibility assessment and decision history

-- Create refund decisions table
CREATE TABLE IF NOT EXISTS security_deposit_refund_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  security_deposit_id UUID NOT NULL REFERENCES security_deposits(id) ON DELETE CASCADE,
  
  -- Decision details
  decision_type VARCHAR(20) NOT NULL CHECK (decision_type IN ('Approved', 'Denied', 'Partial')),
  refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_deductions DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Assessment details (stored as JSONB for flexibility)
  assessment_data JSONB NOT NULL,
  
  -- Decision metadata
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  requires_hr_review BOOLEAN DEFAULT FALSE,
  hr_reviewed_by UUID REFERENCES auth.users(id),
  hr_reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Document tracking
  pdf_report_generated BOOLEAN DEFAULT FALSE,
  pdf_report_path TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_recipients TEXT[],
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create audit trail table for tracking all actions
CREATE TABLE IF NOT EXISTS security_deposit_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  security_deposit_id UUID NOT NULL REFERENCES security_deposits(id) ON DELETE CASCADE,
  refund_decision_id UUID REFERENCES security_deposit_refund_decisions(id) ON DELETE CASCADE,
  
  -- Action details
  action_type VARCHAR(50) NOT NULL,
  action_description TEXT NOT NULL,
  action_data JSONB,
  
  -- Actor information
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_refund_decisions_security_deposit_id ON security_deposit_refund_decisions(security_deposit_id);
CREATE INDEX IF NOT EXISTS idx_refund_decisions_approved_by ON security_deposit_refund_decisions(approved_by);
CREATE INDEX IF NOT EXISTS idx_refund_decisions_created_at ON security_deposit_refund_decisions(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_trail_security_deposit_id ON security_deposit_audit_trail(security_deposit_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_refund_decision_id ON security_deposit_audit_trail(refund_decision_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_performed_by ON security_deposit_audit_trail(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_trail_performed_at ON security_deposit_audit_trail(performed_at);

-- Enable RLS
ALTER TABLE security_deposit_refund_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposit_audit_trail ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view refund decisions" ON security_deposit_refund_decisions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create refund decisions" ON security_deposit_refund_decisions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update refund decisions" ON security_deposit_refund_decisions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view audit trail" ON security_deposit_audit_trail
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create audit entries" ON security_deposit_audit_trail
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create function to automatically create audit trail entries
CREATE OR REPLACE FUNCTION create_refund_decision_audit_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert audit entry for new refund decisions
  IF TG_OP = 'INSERT' THEN
    INSERT INTO security_deposit_audit_trail (
      security_deposit_id,
      refund_decision_id,
      action_type,
      action_description,
      action_data,
      performed_by
    ) VALUES (
      NEW.security_deposit_id,
      NEW.id,
      'Refund Decision Created',
      format('Decision: %s, Amount: $%s', NEW.decision_type, NEW.refund_amount),
      jsonb_build_object(
        'decision_type', NEW.decision_type,
        'refund_amount', NEW.refund_amount,
        'total_deductions', NEW.total_deductions,
        'requires_hr_review', NEW.requires_hr_review
      ),
      NEW.approved_by
    );
    RETURN NEW;
  END IF;
  
  -- Insert audit entry for updates
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO security_deposit_audit_trail (
      security_deposit_id,
      refund_decision_id,
      action_type,
      action_description,
      action_data,
      performed_by
    ) VALUES (
      NEW.security_deposit_id,
      NEW.id,
      'Refund Decision Updated',
      format('Decision updated: %s, Amount: $%s', NEW.decision_type, NEW.refund_amount),
      jsonb_build_object(
        'old_decision_type', OLD.decision_type,
        'new_decision_type', NEW.decision_type,
        'old_refund_amount', OLD.refund_amount,
        'new_refund_amount', NEW.refund_amount,
        'pdf_generated', NEW.pdf_report_generated,
        'email_sent', NEW.email_sent
      ),
      NEW.updated_by
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit trail
DROP TRIGGER IF EXISTS trigger_refund_decision_audit ON security_deposit_refund_decisions;
CREATE TRIGGER trigger_refund_decision_audit
  AFTER INSERT OR UPDATE ON security_deposit_refund_decisions
  FOR EACH ROW
  EXECUTE FUNCTION create_refund_decision_audit_entry();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_refund_decision_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_refund_decision_updated_at ON security_deposit_refund_decisions;
CREATE TRIGGER trigger_refund_decision_updated_at
  BEFORE UPDATE ON security_deposit_refund_decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_refund_decision_updated_at();

-- Add comments for documentation
COMMENT ON TABLE security_deposit_refund_decisions IS 'Stores refund decisions and eligibility assessments for security deposits';
COMMENT ON TABLE security_deposit_audit_trail IS 'Audit trail for all security deposit related actions';

COMMENT ON COLUMN security_deposit_refund_decisions.assessment_data IS 'Complete eligibility assessment data stored as JSONB';
COMMENT ON COLUMN security_deposit_refund_decisions.pdf_report_path IS 'Path to generated PDF report file';
COMMENT ON COLUMN security_deposit_refund_decisions.email_recipients IS 'Array of email addresses that received the report';

-- Insert test data verification
SELECT 'Refund decisions table created successfully' as status;
