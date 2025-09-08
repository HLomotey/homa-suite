-- Add computed expenditure fields based on expected_revenue
-- Monthly gross wages/salaries is 68% of expected revenue
ALTER TABLE projections ADD COLUMN IF NOT EXISTS monthly_gross_wages_salaries DECIMAL(12,2) GENERATED ALWAYS AS (
    expected_revenue * 0.68
) STORED;

-- Monthly gross income is the remaining 32% of expected revenue
ALTER TABLE projections ADD COLUMN IF NOT EXISTS monthly_gross_income DECIMAL(12,2) GENERATED ALWAYS AS (
    expected_revenue * 0.32
) STORED;

-- Add other computed expenditure fields based on percentages of monthly_gross_wages_salaries
ALTER TABLE projections ADD COLUMN IF NOT EXISTS payroll_taxes DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.08
) STORED;

ALTER TABLE projections ADD COLUMN IF NOT EXISTS admin_cost DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.10
) STORED;

ALTER TABLE projections ADD COLUMN IF NOT EXISTS management_payroll_expenses DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.03
) STORED;

ALTER TABLE projections ADD COLUMN IF NOT EXISTS estimated_other DECIMAL(12,2) DEFAULT 0;

ALTER TABLE projections ADD COLUMN IF NOT EXISTS employee_engagement DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.02
) STORED;

ALTER TABLE projections ADD COLUMN IF NOT EXISTS health_insurance_benefits DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.06
) STORED;

ALTER TABLE projections ADD COLUMN IF NOT EXISTS travel DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.015
) STORED;

ALTER TABLE projections ADD COLUMN IF NOT EXISTS other_benefits DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.02
) STORED;

-- Add indexes for the new expenditure fields
CREATE INDEX IF NOT EXISTS idx_projections_monthly_gross_wages ON projections(monthly_gross_wages_salaries);
CREATE INDEX IF NOT EXISTS idx_projections_monthly_gross_income ON projections(monthly_gross_income);

-- Add comments for the new expenditure fields
COMMENT ON COLUMN projections.monthly_gross_wages_salaries IS 'Monthly gross wages and salaries expenditure (68% of expected revenue)';
COMMENT ON COLUMN projections.monthly_gross_income IS 'Monthly gross income (32% of expected revenue)';
COMMENT ON COLUMN projections.payroll_taxes IS 'Payroll taxes expenditure (8% of monthly gross wages/salaries)';
COMMENT ON COLUMN projections.admin_cost IS 'Administrative cost expenditure (10% of monthly gross wages/salaries)';
COMMENT ON COLUMN projections.management_payroll_expenses IS 'Management payroll expenses (3% of monthly gross wages/salaries)';
COMMENT ON COLUMN projections.estimated_other IS 'Estimated other expenses (manual entry)';
COMMENT ON COLUMN projections.employee_engagement IS 'Employee engagement expenses (2% of monthly gross wages/salaries)';
COMMENT ON COLUMN projections.health_insurance_benefits IS 'Health insurance benefits expenditure (6% of monthly gross wages/salaries)';
COMMENT ON COLUMN projections.travel IS 'Travel expenses (1.5% of monthly gross wages/salaries)';
COMMENT ON COLUMN projections.other_benefits IS 'Other benefits expenditure (2% of monthly gross wages/salaries)';

-- One-time update to populate expenditure fields for existing records based on expected_revenue
-- Since these are now computed columns, we need to drop and recreate them as regular columns first,
-- then update the values, then convert back to computed columns

-- Temporarily drop computed columns and recreate as regular columns for the update
ALTER TABLE projections DROP COLUMN IF EXISTS monthly_gross_wages_salaries;
ALTER TABLE projections DROP COLUMN IF EXISTS monthly_gross_income;
ALTER TABLE projections DROP COLUMN IF EXISTS payroll_taxes;
ALTER TABLE projections DROP COLUMN IF EXISTS admin_cost;
ALTER TABLE projections DROP COLUMN IF EXISTS management_payroll_expenses;
ALTER TABLE projections DROP COLUMN IF EXISTS employee_engagement;
ALTER TABLE projections DROP COLUMN IF EXISTS health_insurance_benefits;
ALTER TABLE projections DROP COLUMN IF EXISTS travel;
ALTER TABLE projections DROP COLUMN IF EXISTS other_benefits;

-- Add them back as regular columns temporarily
ALTER TABLE projections ADD COLUMN monthly_gross_wages_salaries DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projections ADD COLUMN monthly_gross_income DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projections ADD COLUMN payroll_taxes DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projections ADD COLUMN admin_cost DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projections ADD COLUMN management_payroll_expenses DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projections ADD COLUMN employee_engagement DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projections ADD COLUMN health_insurance_benefits DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projections ADD COLUMN travel DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projections ADD COLUMN other_benefits DECIMAL(12,2) DEFAULT 0;

-- Update existing records with calculated values
UPDATE projections 
SET 
    monthly_gross_wages_salaries = expected_revenue * 0.68,
    monthly_gross_income = expected_revenue * 0.32,
    payroll_taxes = (expected_revenue * 0.68) * 0.08,
    admin_cost = (expected_revenue * 0.68) * 0.10,
    management_payroll_expenses = (expected_revenue * 0.68) * 0.03,
    employee_engagement = (expected_revenue * 0.68) * 0.02,
    health_insurance_benefits = (expected_revenue * 0.68) * 0.06,
    travel = (expected_revenue * 0.68) * 0.015,
    other_benefits = (expected_revenue * 0.68) * 0.02,
    updated_at = NOW()
WHERE expected_revenue IS NOT NULL AND expected_revenue > 0;

-- Now convert them back to computed columns
ALTER TABLE projections DROP COLUMN monthly_gross_wages_salaries;
ALTER TABLE projections ADD COLUMN monthly_gross_wages_salaries DECIMAL(12,2) GENERATED ALWAYS AS (
    expected_revenue * 0.68
) STORED;

ALTER TABLE projections DROP COLUMN monthly_gross_income;
ALTER TABLE projections ADD COLUMN monthly_gross_income DECIMAL(12,2) GENERATED ALWAYS AS (
    expected_revenue * 0.32
) STORED;

ALTER TABLE projections DROP COLUMN payroll_taxes;
ALTER TABLE projections ADD COLUMN payroll_taxes DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.08
) STORED;

ALTER TABLE projections DROP COLUMN admin_cost;
ALTER TABLE projections ADD COLUMN admin_cost DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.10
) STORED;

ALTER TABLE projections DROP COLUMN management_payroll_expenses;
ALTER TABLE projections ADD COLUMN management_payroll_expenses DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.03
) STORED;

ALTER TABLE projections DROP COLUMN employee_engagement;
ALTER TABLE projections ADD COLUMN employee_engagement DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.02
) STORED;

ALTER TABLE projections DROP COLUMN health_insurance_benefits;
ALTER TABLE projections ADD COLUMN health_insurance_benefits DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.06
) STORED;

ALTER TABLE projections DROP COLUMN travel;
ALTER TABLE projections ADD COLUMN travel DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.015
) STORED;

ALTER TABLE projections DROP COLUMN other_benefits;
ALTER TABLE projections ADD COLUMN other_benefits DECIMAL(12,2) GENERATED ALWAYS AS (
    (expected_revenue * 0.68) * 0.02
) STORED;
