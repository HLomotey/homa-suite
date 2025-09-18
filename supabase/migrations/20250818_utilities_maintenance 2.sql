-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create utility_types table
CREATE TABLE IF NOT EXISTS utility_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    unit_of_measure TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
-- Create utility_setups table
CREATE TABLE IF NOT EXISTS utility_setups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL,
    utility_type_id UUID NOT NULL,
    meter_number TEXT,
    account_number TEXT,
    provider_name TEXT,
    provider_contact TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    FOREIGN KEY (utility_type_id) REFERENCES utility_types(id) ON DELETE CASCADE
);
-- Create billing_periods table
CREATE TABLE IF NOT EXISTS billing_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
-- Create utility_readings table
CREATE TABLE IF NOT EXISTS utility_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    utility_setup_id UUID NOT NULL,
    billing_period_id UUID NOT NULL,
    reading_date DATE NOT NULL,
    previous_reading NUMERIC(12, 2),
    current_reading NUMERIC(12, 2) NOT NULL,
    consumption NUMERIC(12, 2),
    unit_cost NUMERIC(12, 2),
    total_cost NUMERIC(12, 2),
    is_estimated BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    FOREIGN KEY (utility_setup_id) REFERENCES utility_setups(id) ON DELETE CASCADE,
    FOREIGN KEY (billing_period_id) REFERENCES billing_periods(id) ON DELETE CASCADE
);
-- Create utility_allocations table for distributing costs to rooms/properties
CREATE TABLE IF NOT EXISTS utility_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    utility_reading_id UUID NOT NULL,
    room_id UUID,
    allocation_percentage NUMERIC(5, 2) NOT NULL,
    allocated_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    FOREIGN KEY (utility_reading_id) REFERENCES utility_readings(id) ON DELETE CASCADE
);
-- Enable RLS on all tables
ALTER TABLE utility_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_allocations ENABLE ROW LEVEL SECURITY;
-- Create policies for all tables
DO $$ BEGIN -- Policies for utility_types
EXECUTE 'CREATE POLICY "Users can view utility types" ON utility_types FOR SELECT USING (true)';
EXECUTE 'CREATE POLICY "Users can insert utility types" ON utility_types FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
EXECUTE 'CREATE POLICY "Users can update utility types" ON utility_types FOR UPDATE USING (auth.role() = ''authenticated'')';
EXECUTE 'CREATE POLICY "Users can delete utility types" ON utility_types FOR DELETE USING (auth.role() = ''authenticated'')';
-- Policies for utility_setups
EXECUTE 'CREATE POLICY "Users can view utility setups" ON utility_setups FOR SELECT USING (true)';
EXECUTE 'CREATE POLICY "Users can insert utility setups" ON utility_setups FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
EXECUTE 'CREATE POLICY "Users can update utility setups" ON utility_setups FOR UPDATE USING (auth.role() = ''authenticated'')';
EXECUTE 'CREATE POLICY "Users can delete utility setups" ON utility_setups FOR DELETE USING (auth.role() = ''authenticated'')';
-- Policies for billing_periods
EXECUTE 'CREATE POLICY "Users can view billing periods" ON billing_periods FOR SELECT USING (true)';
EXECUTE 'CREATE POLICY "Users can insert billing periods" ON billing_periods FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
EXECUTE 'CREATE POLICY "Users can update billing periods" ON billing_periods FOR UPDATE USING (auth.role() = ''authenticated'')';
EXECUTE 'CREATE POLICY "Users can delete billing periods" ON billing_periods FOR DELETE USING (auth.role() = ''authenticated'')';
-- Policies for utility_readings
EXECUTE 'CREATE POLICY "Users can view utility readings" ON utility_readings FOR SELECT USING (true)';
EXECUTE 'CREATE POLICY "Users can insert utility readings" ON utility_readings FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
EXECUTE 'CREATE POLICY "Users can update utility readings" ON utility_readings FOR UPDATE USING (auth.role() = ''authenticated'')';
EXECUTE 'CREATE POLICY "Users can delete utility readings" ON utility_readings FOR DELETE USING (auth.role() = ''authenticated'')';
-- Policies for utility_allocations
EXECUTE 'CREATE POLICY "Users can view utility allocations" ON utility_allocations FOR SELECT USING (true)';
EXECUTE 'CREATE POLICY "Users can insert utility allocations" ON utility_allocations FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
EXECUTE 'CREATE POLICY "Users can update utility allocations" ON utility_allocations FOR UPDATE USING (auth.role() = ''authenticated'')';
EXECUTE 'CREATE POLICY "Users can delete utility allocations" ON utility_allocations FOR DELETE USING (auth.role() = ''authenticated'')';
END $$;
-- Create triggers for updating timestamps
CREATE TRIGGER update_utility_types_timestamp BEFORE
UPDATE ON utility_types FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_utility_setups_timestamp BEFORE
UPDATE ON utility_setups FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_billing_periods_timestamp BEFORE
UPDATE ON billing_periods FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_utility_readings_timestamp BEFORE
UPDATE ON utility_readings FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_utility_allocations_timestamp BEFORE
UPDATE ON utility_allocations FOR EACH ROW EXECUTE FUNCTION update_timestamp();
-- Add comments on tables for better documentation
COMMENT ON TABLE utility_types IS 'Types of utilities that can be tracked (electricity, water, gas, etc.)';
COMMENT ON TABLE utility_setups IS 'Configuration of utilities for properties';
COMMENT ON TABLE billing_periods IS 'Billing periods for utility readings';
COMMENT ON TABLE utility_readings IS 'Utility consumption readings for each billing period';
COMMENT ON TABLE utility_allocations IS 'Allocation of utility costs to rooms/properties';