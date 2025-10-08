-- Create inventory transaction function
CREATE OR REPLACE FUNCTION public.create_inventory_transaction(
  p_property_id UUID,
  p_item_id UUID,
  p_transaction_type TEXT,
  p_quantity INTEGER,
  p_previous_quantity INTEGER,
  p_new_quantity INTEGER,
  p_notes TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  -- Insert the transaction record
  INSERT INTO inventory_transactions (
    property_id,
    item_id,
    transaction_type,
    quantity,
    previous_quantity,
    new_quantity,
    notes,
    created_by
  ) VALUES (
    p_property_id,
    p_item_id,
    p_transaction_type,
    p_quantity,
    p_previous_quantity,
    p_new_quantity,
    p_notes,
    p_created_by
  )
  RETURNING id INTO v_transaction_id;
  
  -- Return the transaction ID
  RETURN jsonb_build_object('id', v_transaction_id);
END;
$$;
