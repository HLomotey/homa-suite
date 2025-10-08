-- Create projection status enum
CREATE TYPE projection_status AS ENUM ('DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'APPROVED', 'ARCHIVED');

-- Create projection priority enum
CREATE TYPE projection_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Create projections table
CREATE TABLE IF NOT EXISTS projections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_id UUID NOT NULL,
    location_description VARCHAR(255) NOT NULL,
    billing_period_id UUID NOT NULL,
    billing_period_name VARCHAR(255) NOT NULL,
    expected_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
    expected_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
    actual_hours DECIMAL(10,2) DEFAULT 0,
    actual_revenue DECIMAL(12,2) DEFAULT 0,
    status projection_status NOT NULL DEFAULT 'DRAFT',
    priority projection_priority NOT NULL DEFAULT 'MEDIUM',
    projection_date DATE NOT NULL,
    review_date DATE,
    estimator_percentage DECIMAL(5,2) DEFAULT 0,
    estimated_hours DECIMAL(10,2) GENERATED ALWAYS AS (
        CASE 
            WHEN estimator_percentage IS NOT NULL AND estimator_percentage != 0 
            THEN expected_hours * (1 + estimator_percentage / 100)
            ELSE expected_hours
        END
    ) STORED,
    estimated_revenue DECIMAL(12,2) GENERATED ALWAYS AS (
        CASE 
            WHEN estimator_percentage IS NOT NULL AND estimator_percentage != 0 
            THEN expected_revenue * (1 + estimator_percentage / 100)
            ELSE expected_revenue
        END
    ) STORED,
    variance_percentage DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_projections_location FOREIGN KEY (location_id) REFERENCES company_locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_projections_billing_period FOREIGN KEY (billing_period_id) REFERENCES billing_periods(id) ON DELETE RESTRICT,
    CONSTRAINT fk_projections_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE RESTRICT
);

-- Create indexes for better performance
CREATE INDEX idx_projections_location_id ON projections(location_id);
CREATE INDEX idx_projections_billing_period_id ON projections(billing_period_id);
CREATE INDEX idx_projections_status ON projections(status);
CREATE INDEX idx_projections_priority ON projections(priority);
CREATE INDEX idx_projections_created_by ON projections(created_by);
CREATE INDEX idx_projections_projection_date ON projections(projection_date);
CREATE INDEX idx_projections_review_date ON projections(review_date);
CREATE INDEX idx_projections_created_at ON projections(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_projections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_projections_updated_at
    BEFORE UPDATE ON projections
    FOR EACH ROW
    EXECUTE FUNCTION update_projections_updated_at();

-- Enable Row Level Security
ALTER TABLE projections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all projections" ON projections
    FOR SELECT USING (true);

CREATE POLICY "Users can insert projections" ON projections
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update projections they created" ON projections
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete projections they created" ON projections
    FOR DELETE USING (auth.uid() = created_by);

-- Add comments for documentation
COMMENT ON TABLE projections IS 'Organization projections with location, billing period, and revenue tracking';
COMMENT ON COLUMN projections.id IS 'Unique identifier for the projection';
COMMENT ON COLUMN projections.title IS 'Projection title/name';
COMMENT ON COLUMN projections.description IS 'Detailed projection description';
COMMENT ON COLUMN projections.location_id IS 'Reference to company location';
COMMENT ON COLUMN projections.location_description IS 'Cached location description for performance';
COMMENT ON COLUMN projections.billing_period_id IS 'Reference to billing period';
COMMENT ON COLUMN projections.billing_period_name IS 'Cached billing period name for performance';
COMMENT ON COLUMN projections.expected_hours IS 'Expected hours for the projection';
COMMENT ON COLUMN projections.expected_revenue IS 'Expected revenue from the projection';
COMMENT ON COLUMN projections.actual_hours IS 'Actual hours recorded for the projection';
COMMENT ON COLUMN projections.actual_revenue IS 'Actual revenue generated from the projection';
COMMENT ON COLUMN projections.status IS 'Current projection status';
COMMENT ON COLUMN projections.priority IS 'Projection priority level';
COMMENT ON COLUMN projections.projection_date IS 'Date for which the projection is made';
COMMENT ON COLUMN projections.review_date IS 'Date when projection should be reviewed';
COMMENT ON COLUMN projections.estimator_percentage IS 'Percentage increase/decrease for estimation';
COMMENT ON COLUMN projections.estimated_hours IS 'Calculated estimated hours based on estimator percentage';
COMMENT ON COLUMN projections.estimated_revenue IS 'Calculated estimated revenue based on estimator percentage';
COMMENT ON COLUMN projections.variance_percentage IS 'Variance percentage between expected and actual';
COMMENT ON COLUMN projections.notes IS 'Additional projection notes';
COMMENT ON COLUMN projections.created_at IS 'Timestamp when projection was created';
COMMENT ON COLUMN projections.updated_at IS 'Timestamp when projection was last updated';
COMMENT ON COLUMN projections.created_by IS 'User who created the projection';

-- Insert sample data for testing (optional)
-- INSERT INTO projects (
--     title, 
--     description, 
--     location_id, 
--     location_description,
--     billing_period_id,
--     billing_period_name,
--     expected_hours, 
--     expected_revenue, 
--     status, 
--     priority,
--     start_date,
--     end_date,
--     completion_percentage,
--     estimator_percentage,
--     created_by
-- ) VALUES 
-- (
--     'Hotel Renovation Project',
--     'Complete renovation of hotel lobby and guest rooms',
--     (SELECT id FROM company_locations LIMIT 1),
--     'Main Hotel Location',
--     (SELECT id FROM billing_periods WHERE status = 'ACTIVE' LIMIT 1),
--     'Q1 2025',
--     500.00,
--     75000.00,
--     'ACTIVE',
--     'HIGH',
--     '2025-01-01',
--     '2025-03-31',
--     25,
--     10.0,
--     (SELECT id FROM auth.users LIMIT 1)
-- );
