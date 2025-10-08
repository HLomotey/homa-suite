-- Global Inventory Stock Management System Migration
-- Redesigns inventory system for global stock with property assignments

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
  'Available',
  'Issued',
  'Reserved',
  'Under_Repair',
  'Disposed',
  'Lost',
  'Stolen'
);

-- Create issuance status enum
CREATE TYPE issuance_status AS ENUM (
  'Issued',
  'Returned',
  'Partially_Returned',
  'Lost',
  'Damaged'
);

-- Enhanced inventory_suppliers table
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
  country VARCHAR(100),
  postal_code VARCHAR(20),
  tax_id VARCHAR(100),
  payment_terms TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Global inventory_items table (no property dependency)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES inventory_categories(id),
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  
  -- Stock Management
  total_quantity INTEGER DEFAULT 0,
  available_quantity INTEGER DEFAULT 0,
  issued_quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  minimum_stock_level INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  
  -- Pricing
  unit_cost DECIMAL(10,2),
  unit_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Physical Properties
  weight DECIMAL(10,3),
  dimensions_length DECIMAL(10,2),
  dimensions_width DECIMAL(10,2),
  dimensions_height DECIMAL(10,2),
  dimension_unit VARCHAR(10) DEFAULT 'cm',
  
  -- Condition and Status
  condition inventory_condition DEFAULT 'New',
  status inventory_status DEFAULT 'Available',
  
  -- Purchase Information
  supplier_id UUID REFERENCES inventory_suppliers(id),
  purchase_date DATE,
  warranty_expiry_date DATE,
  
  -- Additional Information
  location VARCHAR(255), -- Storage location
  tags TEXT[], -- Array of tags for flexible categorization
  notes TEXT,
  image_urls TEXT[], -- Array of image URLs
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Property item issuances table
CREATE TABLE IF NOT EXISTS inventory_property_issuances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Issuance Details
  quantity_issued INTEGER NOT NULL CHECK (quantity_issued > 0),
  quantity_returned INTEGER DEFAULT 0 CHECK (quantity_returned >= 0),
  quantity_outstanding INTEGER GENERATED ALWAYS AS (quantity_issued - quantity_returned) STORED,
  
  -- Status and Dates
  status issuance_status DEFAULT 'Issued',
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_return_date DATE,
  actual_return_date DATE,
  
  -- Personnel
  issued_by UUID REFERENCES auth.users(id),
  issued_to_person VARCHAR(255), -- Person at property who received items
  returned_by UUID REFERENCES auth.users(id),
  
  -- Condition tracking
  condition_at_issuance inventory_condition DEFAULT 'Good',
  condition_at_return inventory_condition,
  
  -- Additional Information
  purpose TEXT, -- Why items were issued
  location_at_property VARCHAR(255), -- Where items are located at property
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_return_quantity CHECK (quantity_returned <= quantity_issued),
  CONSTRAINT return_date_after_issue CHECK (actual_return_date IS NULL OR actual_return_date >= issued_date)
);

-- Inventory transactions table for stock movements
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  
  -- Transaction Details
  transaction_type VARCHAR(50) NOT NULL, -- 'Purchase', 'Issue', 'Return', 'Adjustment', 'Disposal'
  quantity INTEGER NOT NULL, -- Positive for additions, negative for subtractions
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  
  -- Related Records
  property_id UUID REFERENCES properties(id), -- For issuances/returns
  issuance_id UUID REFERENCES inventory_property_issuances(id), -- Link to issuance
  supplier_id UUID REFERENCES inventory_suppliers(id), -- For purchases
  purchase_order_id UUID, -- Reference to purchase order if exists
  
  -- Transaction Context
  reference_number VARCHAR(100), -- Invoice, PO number, etc.
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS inventory_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(100) NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES inventory_suppliers(id),
  
  -- Order Details
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'Draft', -- 'Draft', 'Sent', 'Confirmed', 'Partially_Received', 'Received', 'Cancelled'
  
  -- Totals
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Additional Information
  delivery_address TEXT,
  terms_and_conditions TEXT,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Purchase order line items
CREATE TABLE IF NOT EXISTS inventory_purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES inventory_purchase_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id), -- May be null for new items
  
  -- Item Details (for new items or overrides)
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT,
  sku VARCHAR(100),
  
  -- Quantities and Pricing
  quantity_ordered INTEGER NOT NULL CHECK (quantity_ordered > 0),
  quantity_received INTEGER DEFAULT 0 CHECK (quantity_received >= 0),
  unit_cost DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(12,2) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
  
  -- Status
  status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Partially_Received', 'Received', 'Cancelled'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items(is_active);

CREATE INDEX IF NOT EXISTS idx_property_issuances_item ON inventory_property_issuances(item_id);
CREATE INDEX IF NOT EXISTS idx_property_issuances_property ON inventory_property_issuances(property_id);
CREATE INDEX IF NOT EXISTS idx_property_issuances_status ON inventory_property_issuances(status);
CREATE INDEX IF NOT EXISTS idx_property_issuances_date ON inventory_property_issuances(issued_date);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_property ON inventory_transactions(property_id);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON inventory_purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON inventory_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON inventory_purchase_orders(order_date);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_categories_updated_at BEFORE UPDATE ON inventory_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_property_issuances_updated_at BEFORE UPDATE ON inventory_property_issuances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_suppliers_updated_at BEFORE UPDATE ON inventory_suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_purchase_orders_updated_at BEFORE UPDATE ON inventory_purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update item stock quantities when issuances change
CREATE OR REPLACE FUNCTION update_item_stock_quantities()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stock quantities for the affected item
    UPDATE inventory_items 
    SET 
        issued_quantity = (
            SELECT COALESCE(SUM(quantity_outstanding), 0)
            FROM inventory_property_issuances 
            WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
            AND status IN ('Issued', 'Partially_Returned')
        ),
        available_quantity = total_quantity - (
            SELECT COALESCE(SUM(quantity_outstanding), 0)
            FROM inventory_property_issuances 
            WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
            AND status IN ('Issued', 'Partially_Returned')
        ) - reserved_quantity
    WHERE id = COALESCE(NEW.item_id, OLD.item_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_on_issuance_change
    AFTER INSERT OR UPDATE OR DELETE ON inventory_property_issuances
    FOR EACH ROW EXECUTE FUNCTION update_item_stock_quantities();

-- Insert default categories
INSERT INTO inventory_categories (name, description, color_code, icon_name, sort_order) VALUES
('Furniture', 'Furniture items for properties', '#8B4513', 'Armchair', 1),
('Electronics', 'Electronic devices and appliances', '#4169E1', 'Zap', 2),
('Appliances', 'Kitchen and household appliances', '#32CD32', 'ChefHat', 3),
('Maintenance', 'Tools and maintenance equipment', '#FF6347', 'Wrench', 4),
('Cleaning', 'Cleaning supplies and equipment', '#20B2AA', 'Spray', 5),
('Safety', 'Safety and security equipment', '#FFD700', 'Shield', 6),
('Office', 'Office supplies and equipment', '#9370DB', 'FileText', 7),
('Outdoor', 'Garden and outdoor equipment', '#228B22', 'Home', 8)
ON CONFLICT (name) DO NOTHING;

-- Grant permissions (adjust based on your RLS policies)
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_property_issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_purchase_order_items ENABLE ROW LEVEL SECURITY;
