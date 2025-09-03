-- Enhanced Inventory System Migration
-- Creates comprehensive inventory management tables for property management

-- Create inventory_categories table for dynamic category management
CREATE TABLE IF NOT EXISTS inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES inventory_categories(id),
  color_code VARCHAR(7), -- Hex color code for UI
  icon_name VARCHAR(50), -- Icon identifier for UI
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create inventory condition enum
CREATE TYPE inventory_condition AS ENUM (
  'New',
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Needs_Repair',
  'Damaged'
);

-- Create inventory status enum
CREATE TYPE inventory_status AS ENUM (
  'Active',
  'Inactive',
  'Disposed',
  'Lost',
  'Stolen',
  'Under_Repair'
);

-- Enhanced inventory_suppliers table (create first since it's referenced by items)
CREATE TABLE IF NOT EXISTS inventory_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company_registration VARCHAR(100),
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  website VARCHAR(255),
  tax_id VARCHAR(100),
  payment_terms VARCHAR(100),
  credit_limit DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES inventory_categories(id),
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
  min_stock_level INTEGER NOT NULL DEFAULT 0,
  max_stock_level INTEGER,
  reorder_point INTEGER,
  unit_cost DECIMAL(10,2),
  current_value DECIMAL(10,2),
  purchase_date DATE,
  invoice_number VARCHAR(100),
  receipt_number VARCHAR(100),
  supplier_id UUID REFERENCES inventory_suppliers(id),
  warranty_expiry DATE,
  condition inventory_condition DEFAULT 'New',
  status inventory_status DEFAULT 'Active',
  location_notes TEXT,
  tags TEXT[], -- Array of tags for flexible categorization
  specifications JSONB, -- Flexible field for item specifications
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enhanced inventory_stock table with location tracking
CREATE TABLE IF NOT EXISTS inventory_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  room_location VARCHAR(100), -- Specific room/location within property
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0, -- For items reserved but not yet issued
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  last_counted_date DATE,
  last_counted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, item_id, room_location)
);

-- Enhanced inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('received', 'issued', 'adjusted', 'transferred', 'returned', 'disposed')),
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  from_location VARCHAR(100),
  to_location VARCHAR(100),
  reference_number VARCHAR(100), -- PO number, invoice number, etc.
  notes TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Enhanced inventory_purchase_orders table
CREATE TABLE IF NOT EXISTS inventory_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(100) UNIQUE NOT NULL,
  supplier_id UUID REFERENCES inventory_suppliers(id),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'partial', 'delivered', 'cancelled')),
  subtotal DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  shipping_cost DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_terms VARCHAR(100),
  delivery_address TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced inventory_purchase_order_items table
CREATE TABLE IF NOT EXISTS inventory_purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES inventory_purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  received_quantity INTEGER DEFAULT 0,
  remaining_quantity INTEGER GENERATED ALWAYS AS (quantity - received_quantity) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory asset tracking table for high-value items
CREATE TABLE IF NOT EXISTS inventory_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  asset_tag VARCHAR(100) UNIQUE NOT NULL,
  serial_number VARCHAR(100),
  acquisition_date DATE,
  acquisition_cost DECIMAL(15,2),
  depreciation_rate DECIMAL(5,2), -- Annual depreciation rate as percentage
  current_book_value DECIMAL(15,2),
  insurance_value DECIMAL(15,2),
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  disposal_date DATE,
  disposal_reason TEXT,
  disposal_value DECIMAL(15,2),
  assigned_to VARCHAR(255), -- Staff member or department
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory audit log table
CREATE TABLE IF NOT EXISTS inventory_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_property ON inventory_stock(property_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_item ON inventory_stock(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_location ON inventory_stock(property_id, room_location);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_property ON inventory_transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_po_supplier ON inventory_purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_po_property ON inventory_purchase_orders(property_id);
CREATE INDEX IF NOT EXISTS idx_inventory_po_status ON inventory_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_inventory_assets_property ON inventory_assets(property_id);
CREATE INDEX IF NOT EXISTS idx_inventory_assets_tag ON inventory_assets(asset_tag);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_stock_updated_at BEFORE UPDATE ON inventory_stock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_transactions_updated_at BEFORE UPDATE ON inventory_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_suppliers_updated_at BEFORE UPDATE ON inventory_suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_purchase_orders_updated_at BEFORE UPDATE ON inventory_purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_purchase_order_items_updated_at BEFORE UPDATE ON inventory_purchase_order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_assets_updated_at BEFORE UPDATE ON inventory_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - can be enhanced based on specific requirements)
CREATE POLICY "Users can view all inventory items" ON inventory_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert inventory items" ON inventory_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update inventory items" ON inventory_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete inventory items" ON inventory_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view inventory stock" ON inventory_stock FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage inventory stock" ON inventory_stock FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view inventory transactions" ON inventory_transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can create inventory transactions" ON inventory_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view suppliers" ON inventory_suppliers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage suppliers" ON inventory_suppliers FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view purchase orders" ON inventory_purchase_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage purchase orders" ON inventory_purchase_orders FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view purchase order items" ON inventory_purchase_order_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage purchase order items" ON inventory_purchase_order_items FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view assets" ON inventory_assets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage assets" ON inventory_assets FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view audit log" ON inventory_audit_log FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default inventory categories
INSERT INTO inventory_categories (name, description, color_code, icon_name, sort_order) VALUES
('Furniture', 'Chairs, tables, beds, sofas, and other furniture items', '#8B4513', 'Armchair', 1),
('Appliances', 'Kitchen and household appliances', '#4169E1', 'Zap', 2),
('Electronics', 'TVs, computers, phones, and electronic devices', '#32CD32', 'Monitor', 3),
('Bedding & Linens', 'Sheets, pillows, blankets, and bedding items', '#FF69B4', 'Bed', 4),
('Kitchen Utensils', 'Cookware, cutlery, and kitchen tools', '#FF6347', 'ChefHat', 5),
('Cleaning Supplies', 'Detergents, cleaners, and cleaning equipment', '#00CED1', 'Spray', 6),
('Bathroom Fixtures', 'Toilets, sinks, showers, and bathroom accessories', '#87CEEB', 'Bath', 7),
('Lighting', 'Lamps, bulbs, and lighting fixtures', '#FFD700', 'Lightbulb', 8),
('Decor', 'Artwork, plants, and decorative items', '#DDA0DD', 'Palette', 9),
('Safety Equipment', 'Fire extinguishers, smoke detectors, first aid', '#FF4500', 'Shield', 10),
('HVAC Equipment', 'Heating, ventilation, and air conditioning', '#708090', 'Wind', 11),
('Plumbing Fixtures', 'Pipes, faucets, and plumbing components', '#4682B4', 'Wrench', 12),
('Tools & Hardware', 'Hand tools, power tools, and hardware', '#2F4F4F', 'Hammer', 13),
('Office Supplies', 'Paper, pens, and office equipment', '#696969', 'FileText', 14),
('Maintenance Supplies', 'Repair materials and maintenance items', '#8FBC8F', 'Settings', 15),
('Other', 'Miscellaneous items not fitting other categories', '#A9A9A9', 'Package', 16)
ON CONFLICT (name) DO NOTHING;

-- Add RLS policies for categories
CREATE POLICY "Users can view categories" ON inventory_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage categories" ON inventory_categories FOR ALL USING (auth.role() = 'authenticated');

-- Create function to automatically generate SKU
CREATE OR REPLACE FUNCTION generate_sku()
RETURNS TRIGGER AS $$
DECLARE
  category_name TEXT;
BEGIN
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    -- Get category name for SKU prefix
    SELECT name INTO category_name FROM inventory_categories WHERE id = NEW.category_id;
    IF category_name IS NULL THEN
      category_name := 'OTH';
    ELSE
      category_name := UPPER(LEFT(category_name, 3));
    END IF;
    NEW.sku := category_name || '-' || LPAD(nextval('inventory_sku_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for SKU generation
CREATE SEQUENCE IF NOT EXISTS inventory_sku_seq START 1000;

-- Create trigger for automatic SKU generation
CREATE TRIGGER generate_inventory_sku
  BEFORE INSERT ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION generate_sku();

-- Create function to update stock levels automatically
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert stock record
  INSERT INTO inventory_stock (property_id, item_id, quantity, updated_at)
  VALUES (NEW.property_id, NEW.item_id, NEW.new_quantity, NOW())
  ON CONFLICT (property_id, item_id, room_location)
  DO UPDATE SET 
    quantity = NEW.new_quantity,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update stock on transactions
CREATE TRIGGER update_stock_on_transaction
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_stock();
