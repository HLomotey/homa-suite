-- Add rent_amount field to properties table
-- This migration adds a rent_amount column to track monthly rent for properties

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS rent_amount DECIMAL(10,2) DEFAULT 0.00;

-- Add comment for documentation
COMMENT ON COLUMN public.properties.rent_amount IS 'Monthly rent amount for the property in USD';

-- Update existing properties to have a default rent amount if needed
-- (You may want to set specific values based on your business logic)
UPDATE public.properties 
SET rent_amount = 0.00 
WHERE rent_amount IS NULL;

-- Add constraint to ensure rent amount is not negative
ALTER TABLE public.properties 
ADD CONSTRAINT properties_rent_amount_check 
CHECK (rent_amount >= 0);
