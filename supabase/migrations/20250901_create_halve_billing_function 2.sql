-- Create function to halve all billing amounts
CREATE OR REPLACE FUNCTION halve_billing_amounts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Update all billing records to halve the rent amount
    UPDATE billing 
    SET rent_amount = rent_amount / 2.0,
        updated_at = NOW()
    WHERE rent_amount > 0;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$;
