-- Job Order Tracking System Migration
-- Creates tables for comprehensive job order management with state tracking
-- References staff_location for company information and users for access control

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing entities if they exist (in reverse dependency order)
DROP VIEW IF EXISTS job_orders_with_details CASCADE;
DROP TABLE IF EXISTS job_order_notifications CASCADE;
DROP TABLE IF EXISTS job_order_audit_log CASCADE;
DROP TABLE IF EXISTS job_order_placements CASCADE;
DROP TABLE IF EXISTS job_order_positions CASCADE;
DROP TABLE IF EXISTS job_orders CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

DROP FUNCTION IF EXISTS trigger_generate_job_order_number() CASCADE;
DROP FUNCTION IF EXISTS update_job_order_timestamps() CASCADE;
DROP FUNCTION IF EXISTS log_job_order_audit() CASCADE;
DROP FUNCTION IF EXISTS update_job_order_seats_filled() CASCADE;
DROP FUNCTION IF EXISTS generate_job_order_number() CASCADE;

DROP TYPE IF EXISTS priority_level CASCADE;
DROP TYPE IF EXISTS placement_status CASCADE;
DROP TYPE IF EXISTS job_order_status CASCADE;

-- Job Order Status Enum
CREATE TYPE job_order_status AS ENUM (
    'DRAFT',
    'SUBMITTED', 
    'APPROVAL_PENDING',
    'APPROVED',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CLOSED',
    'CANCELLED',
    'REJECTED'
);

-- Placement Status Enum
CREATE TYPE placement_status AS ENUM (
    'TENTATIVE',
    'CONFIRMED',
    'STARTED',
    'ENDED'
);

-- Priority Level Enum
CREATE TYPE priority_level AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);

-- Main Job Orders Table
CREATE TABLE job_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    job_order_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Organization & Location
    organization_id UUID NOT NULL REFERENCES staff_locations(id) ON DELETE RESTRICT,
    site_location VARCHAR(255),
    
    -- Request Details
    seats_requested INTEGER NOT NULL CHECK (seats_requested > 0),
    seats_filled INTEGER DEFAULT 0 CHECK (seats_filled >= 0),
    
    -- Dates
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    requested_start_date DATE,
    due_date DATE,
    fill_by_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status & Priority
    status job_order_status DEFAULT 'DRAFT' NOT NULL,
    priority priority_level DEFAULT 'MEDIUM',
    
    -- People
    requestor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    hr_coordinator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Recruiter/Account Manager
    
    -- Additional Information
    notes TEXT,
    approval_notes TEXT,
    rejection_reason TEXT,
    completion_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (
        (requested_start_date IS NULL OR due_date IS NULL OR requested_start_date <= due_date) AND
        (fill_by_date IS NULL OR requested_at <= fill_by_date)
    ),
    CONSTRAINT valid_seats CHECK (seats_filled <= seats_requested),
    CONSTRAINT valid_completion CHECK (
        (status != 'COMPLETED' OR completed_at IS NOT NULL) AND
        (status != 'CLOSED' OR closed_at IS NOT NULL)
    )
);

-- Position Breakdown Table (optional breakdown of roles/shifts)
CREATE TABLE job_order_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_order_id UUID NOT NULL REFERENCES job_orders(id) ON DELETE CASCADE,
    
    -- Position Details
    role_title VARCHAR(255) NOT NULL,
    shift_type VARCHAR(100), -- e.g., "Day Shift", "Night Shift", "Weekend"
    site_location VARCHAR(255),
    
    -- Seat Information
    seats_requested INTEGER NOT NULL CHECK (seats_requested > 0),
    seats_filled INTEGER DEFAULT 0 CHECK (seats_filled >= 0),
    
    -- Requirements
    requirements TEXT,
    hourly_rate DECIMAL(10,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_position_seats CHECK (seats_filled <= seats_requested)
);

-- Placements Table (tracks individual seat fills)
CREATE TABLE job_order_placements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_order_id UUID NOT NULL REFERENCES job_orders(id) ON DELETE CASCADE,
    position_id UUID REFERENCES job_order_positions(id) ON DELETE SET NULL,
    
    -- Placement Details
    candidate_name VARCHAR(255),
    candidate_email VARCHAR(255),
    candidate_phone VARCHAR(50),
    
    -- Status & Dates
    status placement_status DEFAULT 'TENTATIVE' NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    start_date DATE,
    end_date DATE,
    
    -- Additional Information
    notes TEXT,
    hourly_rate DECIMAL(10,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    CONSTRAINT valid_placement_dates CHECK (
        (start_date IS NULL OR end_date IS NULL OR start_date <= end_date) AND
        (status != 'CONFIRMED' OR confirmed_at IS NOT NULL) AND
        (status != 'STARTED' OR start_date IS NOT NULL)
    )
);

-- Audit Log Table (tracks all state changes and important events)
CREATE TABLE job_order_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_order_id UUID NOT NULL REFERENCES job_orders(id) ON DELETE CASCADE,
    
    -- Event Details
    event_type VARCHAR(50) NOT NULL, -- 'STATUS_CHANGE', 'ASSIGNMENT', 'AMENDMENT', 'COMMENT', etc.
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    
    -- Context
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional Data (JSON for flexibility)
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Notifications Table (for job order specific notifications)
CREATE TABLE job_order_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_order_id UUID NOT NULL REFERENCES job_orders(id) ON DELETE CASCADE,
    
    -- Notification Details
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'APPROVAL_REQUEST', 'SLA_WARNING', 'COMPLETION', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Note: user_roles table is handled by the main RBAC system
-- This table definition is commented out to avoid conflicts with the main RBAC migration
-- The main RBAC system uses UUID for role_id, not BIGINT

-- User Roles Junction Table (links users with roles) - DISABLED
-- This functionality is provided by the main RBAC system in 20250820_role_based_access_control.sql
/*
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,  -- Changed from BIGINT to UUID
    
    -- Assignment Details
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, role_id)
);
*/

-- Indexes for Performance
CREATE INDEX idx_job_orders_organization ON job_orders(organization_id);
CREATE INDEX idx_job_orders_status ON job_orders(status);
CREATE INDEX idx_job_orders_owner ON job_orders(owner_id);
CREATE INDEX idx_job_orders_coordinator ON job_orders(hr_coordinator_id);
CREATE INDEX idx_job_orders_due_date ON job_orders(due_date);
CREATE INDEX idx_job_orders_fill_by_date ON job_orders(fill_by_date);
CREATE INDEX idx_job_orders_created_at ON job_orders(created_at);

CREATE INDEX idx_job_order_positions_job_order ON job_order_positions(job_order_id);
CREATE INDEX idx_job_order_placements_job_order ON job_order_placements(job_order_id);
CREATE INDEX idx_job_order_placements_status ON job_order_placements(status);

CREATE INDEX idx_job_order_audit_log_job_order ON job_order_audit_log(job_order_id);
CREATE INDEX idx_job_order_audit_log_timestamp ON job_order_audit_log(timestamp);

CREATE INDEX idx_job_order_notifications_recipient ON job_order_notifications(recipient_id);
CREATE INDEX idx_job_order_notifications_unread ON job_order_notifications(recipient_id, is_read) WHERE is_read = FALSE;

-- Indexes for user_roles table are handled by the main RBAC system
-- CREATE INDEX idx_user_roles_user ON user_roles(user_id);
-- CREATE INDEX idx_user_roles_role ON user_roles(role_id);
-- CREATE INDEX idx_user_roles_active ON user_roles(user_id, is_active) WHERE is_active = TRUE;

-- Functions for Business Logic

-- Function to generate job order number
CREATE OR REPLACE FUNCTION generate_job_order_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    sequence_num INTEGER;
    job_order_num TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(
        CASE 
            WHEN job_order_number ~ ('^JO-' || current_year || '-[0-9]+$')
            THEN CAST(SUBSTRING(job_order_number FROM LENGTH('JO-' || current_year || '-') + 1) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO sequence_num
    FROM job_orders;
    
    job_order_num := 'JO-' || current_year || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN job_order_num;
END;
$$ LANGUAGE plpgsql;

-- Function to update seats_filled count
CREATE OR REPLACE FUNCTION update_job_order_seats_filled()
RETURNS TRIGGER AS $$
BEGIN
    -- Update seats_filled in job_orders table
    UPDATE job_orders 
    SET seats_filled = (
        SELECT COUNT(*) 
        FROM job_order_placements 
        WHERE job_order_id = COALESCE(NEW.job_order_id, OLD.job_order_id)
        AND status IN ('CONFIRMED', 'STARTED')
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.job_order_id, OLD.job_order_id);
    
    -- Update seats_filled in job_order_positions table if position_id exists
    IF COALESCE(NEW.position_id, OLD.position_id) IS NOT NULL THEN
        UPDATE job_order_positions 
        SET seats_filled = (
            SELECT COUNT(*) 
            FROM job_order_placements 
            WHERE position_id = COALESCE(NEW.position_id, OLD.position_id)
            AND status IN ('CONFIRMED', 'STARTED')
        ),
        updated_at = NOW()
        WHERE id = COALESCE(NEW.position_id, OLD.position_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_job_order_audit()
RETURNS TRIGGER AS $$
DECLARE
    event_type_val TEXT;
    old_val TEXT;
    new_val TEXT;
    description_val TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        event_type_val := 'CREATED';
        new_val := NEW.status::TEXT;
        description_val := 'Job order created';
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            event_type_val := 'STATUS_CHANGE';
            old_val := OLD.status::TEXT;
            new_val := NEW.status::TEXT;
            description_val := 'Status changed from ' || OLD.status || ' to ' || NEW.status;
        ELSIF OLD.owner_id != NEW.owner_id OR (OLD.owner_id IS NULL AND NEW.owner_id IS NOT NULL) THEN
            event_type_val := 'ASSIGNMENT';
            old_val := OLD.owner_id::TEXT;
            new_val := NEW.owner_id::TEXT;
            description_val := 'Owner assigned';
        ELSE
            event_type_val := 'UPDATED';
            description_val := 'Job order updated';
        END IF;
    END IF;
    
    INSERT INTO job_order_audit_log (
        job_order_id, event_type, old_value, new_value, description, user_id
    ) VALUES (
        NEW.id, event_type_val, old_val, new_val, description_val, NEW.updated_by
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_job_order_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers

-- Auto-generate job order number on insert
CREATE OR REPLACE FUNCTION trigger_generate_job_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.job_order_number IS NULL OR NEW.job_order_number = '' THEN
        NEW.job_order_number := generate_job_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_job_order_number
    BEFORE INSERT ON job_orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_job_order_number();

-- Update seats_filled when placements change
CREATE TRIGGER trigger_update_seats_filled
    AFTER INSERT OR UPDATE OR DELETE ON job_order_placements
    FOR EACH ROW
    EXECUTE FUNCTION update_job_order_seats_filled();

-- Log audit events for job orders
CREATE TRIGGER trigger_job_order_audit
    AFTER INSERT OR UPDATE ON job_orders
    FOR EACH ROW
    EXECUTE FUNCTION log_job_order_audit();

-- Update timestamps
CREATE TRIGGER trigger_job_orders_updated_at
    BEFORE UPDATE ON job_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_job_order_timestamps();

CREATE TRIGGER trigger_job_order_positions_updated_at
    BEFORE UPDATE ON job_order_positions
    FOR EACH ROW
    EXECUTE FUNCTION update_job_order_timestamps();

CREATE TRIGGER trigger_job_order_placements_updated_at
    BEFORE UPDATE ON job_order_placements
    FOR EACH ROW
    EXECUTE FUNCTION update_job_order_timestamps();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE job_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_order_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_order_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_order_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_order_notifications ENABLE ROW LEVEL SECURITY;

-- Job Orders RLS Policies
CREATE POLICY "Users can view job orders from their organization" ON job_orders
    FOR SELECT USING (
        requestor_id = auth.uid()
        OR hr_coordinator_id = auth.uid()
        OR approver_id = auth.uid()
        OR owner_id = auth.uid()
        OR public.user_has_permission(auth.uid(), 'job-orders:view')
    );

CREATE POLICY "HR coordinators can create job orders" ON job_orders
    FOR INSERT WITH CHECK (
        public.user_has_permission(auth.uid(), 'job-orders:create')
    );

CREATE POLICY "Authorized users can update job orders" ON job_orders
    FOR UPDATE USING (
        hr_coordinator_id = auth.uid()
        OR owner_id = auth.uid()
        OR approver_id = auth.uid()
        OR public.user_has_permission(auth.uid(), 'job-orders:edit')
    );

-- Job Order Positions RLS Policies
CREATE POLICY "Users can view positions for accessible job orders" ON job_order_positions
    FOR SELECT USING (
        job_order_id IN (
            SELECT id FROM job_orders
            WHERE requestor_id = auth.uid()
            OR hr_coordinator_id = auth.uid()
            OR approver_id = auth.uid()
            OR owner_id = auth.uid()
            OR public.user_has_permission(auth.uid(), 'job-orders:view')
        )
    );

CREATE POLICY "Authorized users can manage positions" ON job_order_positions
    FOR ALL USING (
        job_order_id IN (
            SELECT id FROM job_orders
            WHERE hr_coordinator_id = auth.uid()
            OR owner_id = auth.uid()
            OR public.user_has_permission(auth.uid(), 'job-orders:edit')
        )
    );

-- Job Order Placements RLS Policies
CREATE POLICY "Users can view placements for accessible job orders" ON job_order_placements
    FOR SELECT USING (
        job_order_id IN (
            SELECT id FROM job_orders
            WHERE requestor_id = auth.uid()
            OR hr_coordinator_id = auth.uid()
            OR approver_id = auth.uid()
            OR owner_id = auth.uid()
            OR public.user_has_permission(auth.uid(), 'job-orders:view')
        )
    );

CREATE POLICY "Authorized users can manage placements" ON job_order_placements
    FOR ALL USING (
        job_order_id IN (
            SELECT id FROM job_orders
            WHERE hr_coordinator_id = auth.uid()
            OR owner_id = auth.uid()
            OR public.user_has_permission(auth.uid(), 'job-orders:edit')
        )
    );

-- Audit Log RLS Policies
CREATE POLICY "Users can view audit logs for accessible job orders" ON job_order_audit_log
    FOR SELECT USING (
        job_order_id IN (
            SELECT id FROM job_orders
            WHERE requestor_id = auth.uid()
            OR hr_coordinator_id = auth.uid()
            OR approver_id = auth.uid()
            OR owner_id = auth.uid()
            OR public.user_has_permission(auth.uid(), 'job-orders:view')
        )
    );

-- Notifications RLS Policies
CREATE POLICY "Users can view their own notifications" ON job_order_notifications
    FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON job_order_notifications
    FOR UPDATE USING (recipient_id = auth.uid());

-- Views for Common Queries

-- Job Orders with Organization Details
CREATE VIEW job_orders_with_details AS
SELECT 
    jo.*,
    sl.location_description as organization_name,
    sl.location_code as organization_location,
    requestor.email as requestor_name,
    coordinator.email as coordinator_name,
    approver.email as approver_name,
    owner.email as owner_name,
    (jo.seats_filled::FLOAT / jo.seats_requested::FLOAT * 100) as fill_percentage,
    CASE 
        WHEN jo.fill_by_date IS NOT NULL AND jo.fill_by_date < NOW() AND jo.status IN ('IN_PROGRESS', 'APPROVAL_PENDING', 'APPROVED')
        THEN TRUE 
        ELSE FALSE 
    END as is_overdue
FROM job_orders jo
LEFT JOIN staff_locations sl ON jo.organization_id = sl.id
LEFT JOIN auth.users requestor ON jo.requestor_id = requestor.id
LEFT JOIN auth.users coordinator ON jo.hr_coordinator_id = coordinator.id
LEFT JOIN auth.users approver ON jo.approver_id = approver.id
LEFT JOIN auth.users owner ON jo.owner_id = owner.id;

-- Job Order Summary Statistics
CREATE VIEW job_order_stats AS
SELECT 
    organization_id,
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_orders,
    COUNT(*) FILTER (WHERE status IN ('IN_PROGRESS', 'APPROVED')) as active_orders,
    COUNT(*) FILTER (WHERE fill_by_date < NOW() AND status IN ('IN_PROGRESS', 'APPROVAL_PENDING', 'APPROVED')) as overdue_orders,
    AVG(CASE WHEN completed_at IS NOT NULL THEN EXTRACT(DAYS FROM completed_at - requested_at) END) as avg_completion_days,
    SUM(seats_requested) as total_seats_requested,
    SUM(seats_filled) as total_seats_filled
FROM job_orders
GROUP BY organization_id;

-- Comments
COMMENT ON TABLE job_orders IS 'Main table for tracking job orders with full lifecycle management';
COMMENT ON TABLE job_order_positions IS 'Optional breakdown of positions within a job order for different roles/shifts';
COMMENT ON TABLE job_order_placements IS 'Individual seat placements and candidate tracking';
COMMENT ON TABLE job_order_audit_log IS 'Comprehensive audit trail for all job order changes';
COMMENT ON TABLE job_order_notifications IS 'Job order specific notifications for stakeholders';

COMMENT ON COLUMN job_orders.job_order_number IS 'Auto-generated unique identifier (JO-YYYY-0001)';
COMMENT ON COLUMN job_orders.seats_requested IS 'Total number of positions to fill';
COMMENT ON COLUMN job_orders.seats_filled IS 'Current number of confirmed/started placements';
COMMENT ON COLUMN job_orders.fill_by_date IS 'SLA deadline for completing all placements';
COMMENT ON COLUMN job_orders.organization_id IS 'References staff_locations table for client organization';
