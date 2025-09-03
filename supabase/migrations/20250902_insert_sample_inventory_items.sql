-- Migration: Insert sample inventory items
-- Created: 2025-09-02
-- Description: Populate inventory with common property items using existing schema

-- Insert inventory items using category_id references
INSERT INTO inventory_items (
  name,
  description,
  category_id,
  subcategory,
  brand,
  model,
  sku,
  barcode,
  unit,
  min_stock_level,
  max_stock_level,
  reorder_point,
  unit_cost,
  current_value,
  purchase_date,
  invoice_number,
  receipt_number,
  supplier_id,
  warranty_expiry,
  condition,
  status,
  location_notes,
  tags,
  specifications,
  images,
  created_at,
  updated_at
)
VALUES 
  -- Bedroom Items
  ('Bunkbed', 'Space-saving bunk bed for shared rooms', (SELECT id FROM inventory_categories WHERE name = 'Furniture'), 'Bedroom', NULL, NULL, 'BUNK-001', NULL, 'pcs', 1, 5, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Essential furniture for multi-occupancy rooms', ARRAY['bedroom', 'furniture', 'bed'], NULL, NULL, NOW(), NOW()),
  ('Mattress', 'Comfortable mattress for beds', (SELECT id FROM inventory_categories WHERE name = 'Furniture'), 'Bedroom', NULL, NULL, 'MATT-001', NULL, 'pcs', 2, 10, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Standard size mattress', ARRAY['bedroom', 'bedding', 'comfort'], NULL, NULL, NOW(), NOW()),
  ('Pillows', 'Soft pillows for comfortable sleep', (SELECT id FROM inventory_categories WHERE name = 'Bedding & Linens'), 'Bedroom', NULL, NULL, 'PILL-001', NULL, 'pcs', 4, 20, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Standard bed pillows', ARRAY['bedroom', 'bedding', 'comfort'], NULL, NULL, NOW(), NOW()),
  ('Bedsheet set/ comforter', 'Complete bedding set with sheets and comforter', (SELECT id FROM inventory_categories WHERE name = 'Bedding & Linens'), 'Bedroom', NULL, NULL, 'BEDS-001', NULL, 'set', 2, 10, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Includes sheets, pillowcases, and comforter', ARRAY['bedroom', 'bedding', 'linen'], NULL, NULL, NOW(), NOW()),
  ('Mattress cover', 'Protective cover for mattresses', (SELECT id FROM inventory_categories WHERE name = 'Bedding & Linens'), 'Bedroom', NULL, NULL, 'MATC-001', NULL, 'pcs', 2, 10, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Waterproof mattress protector', ARRAY['bedroom', 'bedding', 'protection'], NULL, NULL, NOW(), NOW()),
  
  -- Kitchen Items
  ('Utensils', 'Basic cooking utensils set', (SELECT id FROM inventory_categories WHERE name = 'Kitchen Utensils'), 'Cookware', NULL, NULL, 'UTEN-001', NULL, 'set', 1, 5, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Includes spatula, ladle, tongs, etc.', ARRAY['kitchen', 'cooking', 'utensils'], NULL, NULL, NOW(), NOW()),
  ('Cutlery set', 'Complete cutlery set for dining', (SELECT id FROM inventory_categories WHERE name = 'Kitchen Utensils'), 'Dining', NULL, NULL, 'CUTL-001', NULL, 'set', 1, 5, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Knives, forks, spoons set', ARRAY['kitchen', 'dining', 'cutlery'], NULL, NULL, NOW(), NOW()),
  ('Cooking ware', 'Pots and pans for cooking', (SELECT id FROM inventory_categories WHERE name = 'Kitchen Utensils'), 'Cookware', NULL, NULL, 'COOK-001', NULL, 'set', 1, 3, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Basic cookware set', ARRAY['kitchen', 'cooking', 'pots'], NULL, NULL, NOW(), NOW()),
  ('plates, bowl & cup', 'Basic dinnerware set', (SELECT id FROM inventory_categories WHERE name = 'Kitchen Utensils'), 'Dining', NULL, NULL, 'DINR-001', NULL, 'set', 1, 5, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Complete dining set for 4', ARRAY['kitchen', 'dining', 'dishes'], NULL, NULL, NOW(), NOW()),
  ('Kitchen Knife', 'Sharp kitchen knife for food preparation', (SELECT id FROM inventory_categories WHERE name = 'Kitchen Utensils'), 'Cookware', NULL, NULL, 'KNIF-001', NULL, 'pcs', 1, 3, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Multi-purpose kitchen knife', ARRAY['kitchen', 'cooking', 'knife'], NULL, NULL, NOW(), NOW()),
  
  -- Cleaning Items
  ('Vacuum cleaner', 'Electric vacuum cleaner for floors', (SELECT id FROM inventory_categories WHERE name = 'Appliances'), 'Cleaning', NULL, NULL, 'VACU-001', NULL, 'pcs', 1, 2, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Upright vacuum cleaner', ARRAY['cleaning', 'appliance', 'floor'], NULL, NULL, NOW(), NOW()),
  ('Broom and dustpan', 'Manual cleaning tools', (SELECT id FROM inventory_categories WHERE name = 'Cleaning Supplies'), 'Tools', NULL, NULL, 'BROO-001', NULL, 'set', 1, 5, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Traditional broom with dustpan', ARRAY['cleaning', 'manual', 'floor'], NULL, NULL, NOW(), NOW()),
  ('toilet paper', 'Bathroom tissue paper', (SELECT id FROM inventory_categories WHERE name = 'Cleaning Supplies'), 'Bathroom', NULL, NULL, 'TOIL-001', NULL, 'pack', 12, 50, 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Multi-roll pack', ARRAY['bathroom', 'hygiene', 'paper'], NULL, NULL, NOW(), NOW()),
  ('paper towel', 'Absorbent paper towels', (SELECT id FROM inventory_categories WHERE name = 'Cleaning Supplies'), 'Kitchen', NULL, NULL, 'PAPE-001', NULL, 'pack', 6, 20, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Kitchen paper towels', ARRAY['kitchen', 'cleaning', 'paper'], NULL, NULL, NOW(), NOW()),
  ('dishsoap', 'Liquid dish washing soap', (SELECT id FROM inventory_categories WHERE name = 'Cleaning Supplies'), 'Kitchen', NULL, NULL, 'DISH-001', NULL, 'bottle', 3, 10, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Grease-cutting dish soap', ARRAY['kitchen', 'cleaning', 'soap'], NULL, NULL, NOW(), NOW()),
  ('Sponge', 'Cleaning sponges for dishes', (SELECT id FROM inventory_categories WHERE name = 'Cleaning Supplies'), 'Kitchen', NULL, NULL, 'SPON-001', NULL, 'pack', 10, 30, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Multi-pack cleaning sponges', ARRAY['kitchen', 'cleaning', 'sponge'], NULL, NULL, NOW(), NOW()),
  ('Bathroom cleaner', 'Specialized bathroom cleaning solution', (SELECT id FROM inventory_categories WHERE name = 'Cleaning Supplies'), 'Bathroom', NULL, NULL, 'BATH-001', NULL, 'bottle', 2, 8, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Disinfectant bathroom cleaner', ARRAY['bathroom', 'cleaning', 'disinfectant'], NULL, NULL, NOW(), NOW()),
  ('Mob (Swiffer)', 'Floor cleaning mop system', (SELECT id FROM inventory_categories WHERE name = 'Cleaning Supplies'), 'Tools', NULL, NULL, 'SWIF-001', NULL, 'pcs', 1, 3, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Swiffer-style floor mop', ARRAY['cleaning', 'floor', 'mop'], NULL, NULL, NOW(), NOW()),
  ('Trash Bags', 'Garbage disposal bags', (SELECT id FROM inventory_categories WHERE name = 'Cleaning Supplies'), 'General', NULL, NULL, 'TRAS-001', NULL, 'pack', 20, 50, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Heavy-duty trash bags', ARRAY['cleaning', 'waste', 'bags'], NULL, NULL, NOW(), NOW()),
  
  -- Living Room Items
  ('Television', 'Flat screen TV for entertainment', (SELECT id FROM inventory_categories WHERE name = 'Electronics'), 'Entertainment', NULL, NULL, 'TV-001', NULL, 'pcs', 1, 2, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Smart TV with streaming capabilities', ARRAY['living room', 'entertainment', 'tv'], NULL, NULL, NOW(), NOW()),
  ('Couch', 'Comfortable seating furniture', (SELECT id FROM inventory_categories WHERE name = 'Furniture'), 'Living Room', NULL, NULL, 'COUC-001', NULL, 'pcs', 1, 3, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Multi-seat sofa', ARRAY['living room', 'furniture', 'seating'], NULL, NULL, NOW(), NOW()),
  ('Dining Table', 'Table for dining and activities', (SELECT id FROM inventory_categories WHERE name = 'Furniture'), 'Dining', NULL, NULL, 'TABL-001', NULL, 'pcs', 1, 2, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Seats 4-6 people', ARRAY['dining', 'furniture', 'table'], NULL, NULL, NOW(), NOW()),
  
  -- Appliances
  ('Microwave', 'Microwave oven for quick cooking', (SELECT id FROM inventory_categories WHERE name = 'Appliances'), 'Kitchen', NULL, NULL, 'MICR-001', NULL, 'pcs', 1, 2, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Countertop microwave oven', ARRAY['kitchen', 'appliance', 'cooking'], NULL, NULL, NOW(), NOW()),
  ('Grill', 'Electric or gas grill for cooking', (SELECT id FROM inventory_categories WHERE name = 'Appliances'), 'Kitchen', NULL, NULL, 'GRIL-001', NULL, 'pcs', 1, 2, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Indoor/outdoor grill', ARRAY['kitchen', 'appliance', 'grilling'], NULL, NULL, NOW(), NOW()),
  ('Fridge', 'Refrigerator for food storage', (SELECT id FROM inventory_categories WHERE name = 'Appliances'), 'Kitchen', NULL, NULL, 'FRID-001', NULL, 'pcs', 1, 2, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Full-size refrigerator', ARRAY['kitchen', 'appliance', 'refrigeration'], NULL, NULL, NOW(), NOW()),
  ('Iron with board', 'Clothes iron with ironing board', (SELECT id FROM inventory_categories WHERE name = 'Appliances'), 'Laundry', NULL, NULL, 'IRON-001', NULL, 'set', 1, 2, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Steam iron with foldable board', ARRAY['laundry', 'appliance', 'ironing'], NULL, NULL, NOW(), NOW()),
  
  -- Food & Beverages
  ('Drinking water', 'Bottled drinking water', (SELECT id FROM inventory_categories WHERE name = 'Other'), 'Beverages', NULL, NULL, 'WATR-001', NULL, 'pack', 24, 100, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Bottled water pack', ARRAY['food', 'beverages', 'water'], NULL, NULL, NOW(), NOW()),
  ('Soft drink', 'Carbonated beverages', (SELECT id FROM inventory_categories WHERE name = 'Other'), 'Beverages', NULL, NULL, 'SOFT-001', NULL, 'pack', 12, 50, 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Assorted soft drinks', ARRAY['food', 'beverages', 'soda'], NULL, NULL, NOW(), NOW()),
  ('Snack', 'Various snack items', (SELECT id FROM inventory_categories WHERE name = 'Other'), 'Snacks', NULL, NULL, 'SNAC-001', NULL, 'pack', 10, 30, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Mixed snack assortment', ARRAY['food', 'snacks', 'variety'], NULL, NULL, NOW(), NOW()),
  ('Noodles cup', 'Instant cup noodles', (SELECT id FROM inventory_categories WHERE name = 'Other'), 'Instant', NULL, NULL, 'NOOD-001', NULL, 'pack', 12, 50, 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', 'Active', 'Instant ramen cups', ARRAY['food', 'instant', 'noodles'], NULL, NULL, NOW(), NOW())
ON CONFLICT (sku) DO NOTHING;

-- Add a comment for tracking
COMMENT ON TABLE inventory_items IS 'Updated with sample property items - 2025-09-02';
