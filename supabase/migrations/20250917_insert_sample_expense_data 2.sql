-- Insert sample expense data for testing and demonstration
-- This will help populate the dashboard with realistic data

-- First, let's get some property IDs to use (if they exist)
DO $$
DECLARE
    property_1 UUID;
    property_2 UUID;
    property_3 UUID;
BEGIN
    -- Try to get existing property IDs, or use random UUIDs if none exist
    SELECT id INTO property_1 FROM properties LIMIT 1 OFFSET 0;
    SELECT id INTO property_2 FROM properties LIMIT 1 OFFSET 1;
    SELECT id INTO property_3 FROM properties LIMIT 1 OFFSET 2;
    
    -- If no properties exist, create some sample ones for expense tracking
    IF property_1 IS NULL THEN
        INSERT INTO properties (id, name, address, rent_amount) 
        VALUES (gen_random_uuid(), 'Sample Property 1', '123 Main St', 1500.00)
        RETURNING id INTO property_1;
    END IF;
    
    IF property_2 IS NULL THEN
        INSERT INTO properties (id, name, address, rent_amount) 
        VALUES (gen_random_uuid(), 'Sample Property 2', '456 Oak Ave', 1800.00)
        RETURNING id INTO property_2;
    END IF;
    
    IF property_3 IS NULL THEN
        INSERT INTO properties (id, name, address, rent_amount) 
        VALUES (gen_random_uuid(), 'Sample Property 3', '789 Pine Rd', 2200.00)
        RETURNING id INTO property_3;
    END IF;

    -- Insert sample expense data for the last 6 months
    INSERT INTO finance_expenses (
        company, date, type, payee, category, subcategory, amount, currency, 
        property_id, department, description, approval_status
    ) VALUES
    -- Current month expenses
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '5 days', 'Expense', 'ABC Maintenance Co', 'maintenance', 'HVAC Repair', 450.00, 'USD', property_1, 'Operations', 'Emergency HVAC repair for unit 2A', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '3 days', 'Expense', 'City Utilities', 'utilities', 'Electricity', 320.75, 'USD', property_1, 'Operations', 'Monthly electricity bill', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '2 days', 'Expense', 'SecureGuard Services', 'security', 'Security System', 125.00, 'USD', property_2, 'Operations', 'Monthly security monitoring', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '1 day', 'Expense', 'CleanPro Services', 'cleaning', 'Common Area Cleaning', 280.00, 'USD', property_2, 'Operations', 'Weekly common area cleaning', 'pending'),
    
    -- Last month expenses
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '1 month' - INTERVAL '25 days', 'Expense', 'Insurance Plus', 'insurance', 'Property Insurance', 850.00, 'USD', property_1, 'Administration', 'Monthly property insurance premium', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '1 month' - INTERVAL '20 days', 'Expense', 'Green Landscaping', 'landscaping', 'Lawn Maintenance', 195.00, 'USD', property_3, 'Operations', 'Monthly landscaping service', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '1 month' - INTERVAL '15 days', 'Expense', 'QuickFix Repairs', 'repairs', 'Plumbing', 275.50, 'USD', property_2, 'Operations', 'Bathroom faucet replacement', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '1 month' - INTERVAL '10 days', 'Expense', 'Office Depot', 'office_supplies', 'Stationery', 89.99, 'USD', NULL, 'Administration', 'Office supplies and forms', 'approved'),
    
    -- 2 months ago
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '2 months' - INTERVAL '20 days', 'Expense', 'Legal Associates', 'legal_professional', 'Legal Consultation', 500.00, 'USD', NULL, 'Administration', 'Tenant dispute consultation', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '2 months' - INTERVAL '15 days', 'Expense', 'Marketing Pro', 'marketing', 'Online Advertising', 350.00, 'USD', property_3, 'Marketing', 'Facebook and Google ads for vacancy', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '2 months' - INTERVAL '10 days', 'Expense', 'City Utilities', 'utilities', 'Water/Sewer', 180.25, 'USD', property_1, 'Operations', 'Monthly water and sewer bill', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '2 months' - INTERVAL '5 days', 'Expense', 'ABC Maintenance Co', 'maintenance', 'Appliance Repair', 320.00, 'USD', property_2, 'Operations', 'Dishwasher repair in unit 1B', 'approved'),
    
    -- 3 months ago
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '3 months' - INTERVAL '25 days', 'Expense', 'Property Tax Office', 'taxes', 'Property Tax', 1200.00, 'USD', property_1, 'Administration', 'Quarterly property tax payment', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '3 months' - INTERVAL '20 days', 'Expense', 'Travel Express', 'travel', 'Property Inspection', 125.50, 'USD', NULL, 'Administration', 'Mileage for property inspections', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '3 months' - INTERVAL '15 days', 'Expense', 'Business Lunch Co', 'meals_entertainment', 'Client Meeting', 85.75, 'USD', NULL, 'Administration', 'Lunch meeting with potential tenant', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '3 months' - INTERVAL '10 days', 'Expense', 'CleanPro Services', 'cleaning', 'Deep Cleaning', 450.00, 'USD', property_3, 'Operations', 'Move-out deep cleaning service', 'approved'),
    
    -- 4 months ago
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '4 months' - INTERVAL '20 days', 'Expense', 'Green Landscaping', 'landscaping', 'Tree Trimming', 380.00, 'USD', property_2, 'Operations', 'Annual tree trimming service', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '4 months' - INTERVAL '15 days', 'Expense', 'Insurance Plus', 'insurance', 'Liability Insurance', 425.00, 'USD', NULL, 'Administration', 'Monthly liability insurance', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '4 months' - INTERVAL '10 days', 'Expense', 'ABC Maintenance Co', 'maintenance', 'Preventive Maintenance', 650.00, 'USD', property_1, 'Operations', 'Annual HVAC maintenance service', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '4 months' - INTERVAL '5 days', 'Expense', 'City Utilities', 'utilities', 'Gas', 95.40, 'USD', property_3, 'Operations', 'Monthly gas bill', 'approved'),
    
    -- 5 months ago
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '5 months' - INTERVAL '25 days', 'Expense', 'Office Depot', 'office_supplies', 'Computer Supplies', 156.99, 'USD', NULL, 'Administration', 'Printer ink and paper', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '5 months' - INTERVAL '20 days', 'Expense', 'QuickFix Repairs', 'repairs', 'Electrical', 425.00, 'USD', property_2, 'Operations', 'Electrical outlet installation', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '5 months' - INTERVAL '15 days', 'Expense', 'Marketing Pro', 'marketing', 'Print Materials', 180.00, 'USD', NULL, 'Marketing', 'Brochures and business cards', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '5 months' - INTERVAL '10 days', 'Expense', 'SecureGuard Services', 'security', 'Camera Installation', 750.00, 'USD', property_3, 'Operations', 'Security camera system upgrade', 'approved'),
    
    -- 6 months ago
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '6 months' - INTERVAL '20 days', 'Expense', 'Legal Associates', 'legal_professional', 'Contract Review', 300.00, 'USD', NULL, 'Administration', 'Lease agreement review', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '6 months' - INTERVAL '15 days', 'Expense', 'CleanPro Services', 'cleaning', 'Carpet Cleaning', 225.00, 'USD', property_1, 'Operations', 'Professional carpet cleaning', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '6 months' - INTERVAL '10 days', 'Expense', 'City Utilities', 'utilities', 'Electricity', 298.60, 'USD', property_2, 'Operations', 'Monthly electricity bill', 'approved'),
    ('HOMA Property Management', CURRENT_DATE - INTERVAL '6 months' - INTERVAL '5 days', 'Expense', 'Miscellaneous Vendor', 'other', 'Miscellaneous', 75.00, 'USD', NULL, 'Operations', 'Various small supplies', 'approved');

    -- Refresh the materialized view to include new data
    PERFORM refresh_finance_profit_loss_summary();
    
    RAISE NOTICE 'Sample expense data inserted successfully. Total expenses: %', 
        (SELECT COUNT(*) FROM finance_expenses);
        
END $$;