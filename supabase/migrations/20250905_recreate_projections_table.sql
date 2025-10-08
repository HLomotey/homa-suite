-- Drop and recreate projections table migration
-- This ensures a clean slate for the projections functionality

-- Drop existing table and types if they exist
DROP TABLE IF EXISTS projections CASCADE;
DROP TYPE IF EXISTS projection_status CASCADE;
DROP TYPE IF EXISTS projection_priority CASCADE;

-- Create projection status enum
CREATE TYPE projection_status AS ENUM ('DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'APPROVED', 'ARCHIVED');

-- Create projection priority enum
CREATE TYPE projection_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Create projections table
CREATE TABLE projections (
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
    CONSTRAINT fk_projections_location FOREIGN KEY (location_id) REFERENCES staff_locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_projections_billing_period FOREIGN KEY (billing_period_id) REFERENCES billing_periods(id) ON DELETE RESTRICT,
    CONSTRAINT fk_projections_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE RESTRICT
);

-- Create indexes for better performance
CREATE INDEX idx_projections_location_id ON projections(location_id);
CREATE INDEX idx_projections_billing_period_id ON projections(billing_period_id);
CREATE INDEX idx_projections_created_by ON projections(created_by);
CREATE INDEX idx_projections_status ON projections(status);
CREATE INDEX idx_projections_priority ON projections(priority);
CREATE INDEX idx_projections_projection_date ON projections(projection_date);
CREATE INDEX idx_projections_created_at ON projections(created_at);

-- Enable Row Level Security
ALTER TABLE projections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view all projections
CREATE POLICY "Users can view projections" ON projections
    FOR SELECT USING (auth.role() = 'authenticated');

-- Users can insert projections they create
CREATE POLICY "Users can insert projections" ON projections
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update projections they created
CREATE POLICY "Users can update own projections" ON projections
    FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete projections they created
CREATE POLICY "Users can delete own projections" ON projections
    FOR DELETE USING (auth.uid() = created_by);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_projections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_projections_updated_at
    BEFORE UPDATE ON projections
    FOR EACH ROW
    EXECUTE FUNCTION update_projections_updated_at();

-- Add helpful comments
COMMENT ON TABLE projections IS 'Financial projections and revenue forecasting data';
COMMENT ON COLUMN projections.title IS 'Projection title or name';
COMMENT ON COLUMN projections.location_id IS 'Reference to company location';
COMMENT ON COLUMN projections.billing_period_id IS 'Reference to billing period';
COMMENT ON COLUMN projections.expected_hours IS 'Expected hours for this projection';
COMMENT ON COLUMN projections.expected_revenue IS 'Expected revenue for this projection';
COMMENT ON COLUMN projections.actual_hours IS 'Actual hours worked (filled after completion)';
COMMENT ON COLUMN projections.actual_revenue IS 'Actual revenue generated (filled after completion)';
COMMENT ON COLUMN projections.estimator_percentage IS 'Percentage adjustment for estimates (+/- percentage)';
COMMENT ON COLUMN projections.estimated_hours IS 'Computed estimated hours based on expected + estimator percentage';
COMMENT ON COLUMN projections.estimated_revenue IS 'Computed estimated revenue based on expected + estimator percentage';
COMMENT ON COLUMN projections.variance_percentage IS 'Variance between expected and actual (calculated)';

-- Verification
DO $$
BEGIN
    RAISE NOTICE 'Projections table recreated successfully with % columns', 
                 (SELECT count(*) FROM information_schema.columns WHERE table_name = 'projections');
END $$;
