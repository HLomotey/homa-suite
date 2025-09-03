/**
 * Enhanced Inventory types for Supabase integration
 * These types define the comprehensive inventory management structure and related interfaces
 */

import { Json } from './database';

/**
 * Inventory category interface for dynamic categories
 */
export interface InventoryCategory {
  id: string;
  name: string;
  description: string | null;
  parent_category_id: string | null;
  color_code: string | null;
  icon_name: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
}

/**
 * Frontend inventory category type
 */
export interface FrontendInventoryCategory {
  id: string;
  name: string;
  description: string | null;
  parentCategoryId: string | null;
  colorCode: string | null;
  iconName: string | null;
  isActive: boolean;
  sortOrder: number;
  parentCategory?: FrontendInventoryCategory; // For joined queries
  subCategories?: FrontendInventoryCategory[]; // For hierarchical display
}

/**
 * Inventory condition enum
 */
export type InventoryCondition = 
  | 'New'
  | 'Excellent'
  | 'Good'
  | 'Fair'
  | 'Poor'
  | 'Needs_Repair'
  | 'Damaged';

/**
 * Inventory status enum
 */
export type InventoryStatus = 
  | 'Available'
  | 'Issued'
  | 'Reserved'
  | 'Under_Repair'
  | 'Disposed'
  | 'Lost'
  | 'Stolen';

/**
 * Issuance status enum
 */
export type IssuanceStatus = 
  | 'Issued'
  | 'Returned'
  | 'Partially_Returned'
  | 'Lost'
  | 'Damaged';

/**
 * Global inventory item interface representing the inventory_items table in Supabase
 */
export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  sku: string | null;
  barcode: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  
  // Stock Management
  total_quantity: number;
  available_quantity: number;
  issued_quantity: number;
  reserved_quantity: number;
  minimum_stock_level: number;
  reorder_point: number;
  
  // Pricing
  unit_cost: number | null;
  unit_price: number | null;
  currency: string;
  
  // Physical Properties
  weight: number | null;
  dimensions_length: number | null;
  dimensions_width: number | null;
  dimensions_height: number | null;
  dimension_unit: string;
  
  // Condition and Status
  condition: InventoryCondition;
  status: InventoryStatus;
  
  // Purchase Information
  supplier_id: string | null;
  purchase_date: string | null;
  warranty_expiry_date: string | null;
  
  // Additional Information
  location: string | null; // Storage location
  tags: string[] | null;
  notes: string | null;
  image_urls: string[] | null;
  
  // Metadata
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
}

/**
 * Property item issuance interface representing the inventory_property_issuances table
 */
export interface InventoryPropertyIssuance {
  id: string;
  item_id: string;
  property_id: string;
  
  // Issuance Details
  quantity_issued: number;
  quantity_returned: number;
  quantity_outstanding: number;
  
  // Status and Dates
  status: IssuanceStatus;
  issued_date: string;
  expected_return_date: string | null;
  actual_return_date: string | null;
  
  // Personnel
  issued_by: string | null;
  issued_to_person: string | null;
  returned_by: string | null;
  
  // Condition tracking
  condition_at_issuance: InventoryCondition;
  condition_at_return: InventoryCondition | null;
  
  // Additional Information
  purpose: string | null;
  location_at_property: string | null;
  notes: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
}

/**
 * Frontend property item issuance type
 */
export interface FrontendInventoryPropertyIssuance {
  id: string;
  itemId: string;
  propertyId: string;
  
  // Issuance Details
  quantityIssued: number;
  quantityReturned: number;
  quantityOutstanding: number;
  
  // Status and Dates
  status: IssuanceStatus;
  issuedDate: string;
  expectedReturnDate: string | null;
  actualReturnDate: string | null;
  
  // Personnel
  issuedBy: string | null;
  issuedToPerson: string | null;
  returnedBy: string | null;
  
  // Condition tracking
  conditionAtIssuance: InventoryCondition;
  conditionAtReturn: InventoryCondition | null;
  
  // Additional Information
  purpose: string | null;
  locationAtProperty: string | null;
  notes: string | null;
  
  // Related data for joined queries
  item?: FrontendInventoryItem;
  property?: any; // Property type from properties module
}

/**
 * Enhanced inventory stock interface representing the inventory_stock table in Supabase
 */
export interface InventoryStock {
  id: string;
  property_id: string;
  item_id: string;
  room_location: string | null;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  last_counted_date: string | null;
  last_counted_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Enhanced inventory transaction type enum
 */
export type InventoryTransactionType = 'received' | 'issued' | 'adjusted' | 'transferred' | 'returned' | 'disposed';

/**
 * Inventory transaction interface representing the inventory_transactions table in Supabase
 */
export interface InventoryTransaction {
  id: string;
  property_id: string;
  item_id: string;
  transaction_type: InventoryTransactionType;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  notes: string | null;
  transaction_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Inventory supplier interface representing the inventory_suppliers table in Supabase
 */
export interface InventorySupplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Purchase order status enum
 */
export type PurchaseOrderStatus = 'draft' | 'ordered' | 'partial' | 'delivered' | 'cancelled';

/**
 * Inventory purchase order interface representing the inventory_purchase_orders table in Supabase
 */
export interface InventoryPurchaseOrder {
  id: string;
  supplier_id: string | null;
  property_id: string;
  order_date: string;
  expected_delivery_date: string | null;
  status: PurchaseOrderStatus;
  total_amount: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Inventory purchase order item interface representing the inventory_purchase_order_items table in Supabase
 */
export interface InventoryPurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  received_quantity: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend inventory item type with camelCase properties
 */
export interface FrontendInventoryItem {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  sku: string | null;
  barcode: string | null;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  
  // Stock Management
  totalQuantity: number;
  availableQuantity: number;
  issuedQuantity: number;
  reservedQuantity: number;
  minimumStockLevel: number;
  reorderPoint: number;
  
  // Pricing
  unitCost: number | null;
  unitPrice: number | null;
  currency: string;
  
  // Physical Properties
  weight: number | null;
  dimensionsLength: number | null;
  dimensionsWidth: number | null;
  dimensionsHeight: number | null;
  dimensionUnit: string;
  
  // Condition and Status
  condition: InventoryCondition;
  status: InventoryStatus;
  
  // Purchase Information
  supplierId: string | null;
  purchaseDate: string | null;
  warrantyExpiryDate: string | null;
  
  // Additional Information
  location: string | null;
  tags: string[] | null;
  notes: string | null;
  imageUrls: string[] | null;
  
  // Metadata
  isActive: boolean;
  
  // Related data for joined queries
  category?: FrontendInventoryCategory;
  supplier?: FrontendInventorySupplier;
}

/**
 * Enhanced frontend inventory stock type
 */
export interface FrontendInventoryStock {
  id: string;
  propertyId: string;
  itemId: string;
  roomLocation: string | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastCountedDate: string | null;
  lastCountedBy: string | null;
  notes: string | null;
  lastUpdated: string;
  item?: FrontendInventoryItem; // For joined queries
}

/**
 * Frontend inventory transaction type
 */
export interface FrontendInventoryTransaction {
  id: string;
  propertyId: string;
  itemId: string;
  transactionType: InventoryTransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  notes: string | null;
  transactionDate: string;
  createdBy: string | null;
  item?: FrontendInventoryItem; // For joined queries
}

/**
 * Frontend inventory supplier type
 */
export interface FrontendInventorySupplier {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

/**
 * Frontend inventory purchase order type
 */
export interface FrontendInventoryPurchaseOrder {
  id: string;
  supplierId: string | null;
  propertyId: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  status: PurchaseOrderStatus;
  totalAmount: number | null;
  notes: string | null;
  createdBy: string | null;
  supplier?: FrontendInventorySupplier; // For joined queries
  items?: FrontendInventoryPurchaseOrderItem[]; // For joined queries
}

/**
 * Frontend inventory purchase order item type
 */
export interface FrontendInventoryPurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  receivedQuantity: number;
  item?: FrontendInventoryItem; // For joined queries
}

/**
 * Maps a database inventory item to the frontend format
 */
export const mapInventoryItemToFrontend = (item: any): FrontendInventoryItem => {
  const mappedItem: FrontendInventoryItem = {
    id: item.id,
    name: item.name,
    description: item.description,
    categoryId: item.category_id,
    sku: item.sku,
    barcode: item.barcode,
    brand: item.brand,
    model: item.model,
    serialNumber: item.serial_number,
    
    // Stock Management - handle both old and new schema
    totalQuantity: item.total_quantity || item.max_stock_level || 0,
    availableQuantity: item.available_quantity || item.max_stock_level || 0,
    issuedQuantity: item.issued_quantity || 0,
    reservedQuantity: item.reserved_quantity || 0,
    minimumStockLevel: item.minimum_stock_level || item.min_stock_level || 0,
    reorderPoint: item.reorder_point || item.min_stock_level || 0,
    
    // Pricing - handle both old and new schema
    unitCost: item.unit_cost || item.current_value || 0,
    unitPrice: item.unit_price || item.current_value || 0,
    currency: item.currency || 'USD',
    
    // Physical Properties
    weight: item.weight || null,
    dimensionsLength: item.dimensions_length || null,
    dimensionsWidth: item.dimensions_width || null,
    dimensionsHeight: item.dimensions_height || null,
    dimensionUnit: item.dimension_unit || 'cm',
    
    // Condition and Status
    condition: item.condition || 'New',
    status: item.status || 'Available',
    
    // Purchase Information
    supplierId: item.supplier_id || null,
    purchaseDate: item.purchase_date || null,
    warrantyExpiryDate: item.warranty_expiry_date || item.warranty_expiry || null,
    
    // Additional Information
    location: item.location || item.location_notes || null,
    tags: item.tags || null,
    notes: item.notes || null,
    imageUrls: item.image_urls || item.images || null,
    
    // Metadata
    isActive: item.is_active !== false, // Default to true if not specified
  };

  // Add category information if available from join
  if (item.inventory_categories) {
    mappedItem.category = {
      id: item.inventory_categories.id,
      name: item.inventory_categories.name,
      description: null,
      parentCategoryId: null,
      colorCode: item.inventory_categories.color_code,
      iconName: item.inventory_categories.icon_name,
      isActive: true,
      sortOrder: 0
    };
  }

  return mappedItem;
};

/**
 * Maps a database inventory stock to the frontend format
 */
export const mapDatabaseInventoryStockToFrontend = (dbStock: InventoryStock): FrontendInventoryStock => {
  return {
    id: dbStock.id,
    propertyId: dbStock.property_id,
    itemId: dbStock.item_id,
    roomLocation: dbStock.room_location,
    quantity: dbStock.quantity,
    reservedQuantity: dbStock.reserved_quantity,
    availableQuantity: dbStock.available_quantity,
    lastCountedDate: dbStock.last_counted_date,
    lastCountedBy: dbStock.last_counted_by,
    notes: dbStock.notes,
    lastUpdated: dbStock.updated_at || dbStock.created_at
  };
};

/**
 * Maps a database inventory transaction to the frontend format
 */
export const mapDatabaseInventoryTransactionToFrontend = (dbTransaction: InventoryTransaction): FrontendInventoryTransaction => {
  return {
    id: dbTransaction.id,
    propertyId: dbTransaction.property_id,
    itemId: dbTransaction.item_id,
    transactionType: dbTransaction.transaction_type,
    quantity: dbTransaction.quantity,
    previousQuantity: dbTransaction.previous_quantity,
    newQuantity: dbTransaction.new_quantity,
    notes: dbTransaction.notes,
    transactionDate: dbTransaction.transaction_date,
    createdBy: dbTransaction.created_by
  };
};

/**
 * Maps a database inventory supplier to the frontend format
 */
export const mapDatabaseInventorySupplierToFrontend = (dbSupplier: InventorySupplier): FrontendInventorySupplier => {
  return {
    id: dbSupplier.id,
    name: dbSupplier.name,
    contactPerson: dbSupplier.contact_person,
    email: dbSupplier.email,
    phone: dbSupplier.phone,
    address: dbSupplier.address
  };
};

/**
 * Maps a database inventory purchase order to the frontend format
 */
export const mapDatabaseInventoryPurchaseOrderToFrontend = (dbPurchaseOrder: InventoryPurchaseOrder): FrontendInventoryPurchaseOrder => {
  return {
    id: dbPurchaseOrder.id,
    supplierId: dbPurchaseOrder.supplier_id,
    propertyId: dbPurchaseOrder.property_id,
    orderDate: dbPurchaseOrder.order_date,
    expectedDeliveryDate: dbPurchaseOrder.expected_delivery_date,
    status: dbPurchaseOrder.status,
    totalAmount: dbPurchaseOrder.total_amount,
    notes: dbPurchaseOrder.notes,
    createdBy: dbPurchaseOrder.created_by
  };
};

/**
 * Maps a database inventory purchase order item to the frontend format
 */
export const mapDatabaseInventoryPurchaseOrderItemToFrontend = (dbItem: InventoryPurchaseOrderItem): FrontendInventoryPurchaseOrderItem => {
  return {
    id: dbItem.id,
    purchaseOrderId: dbItem.purchase_order_id,
    itemId: dbItem.item_id,
    quantity: dbItem.quantity,
    unitPrice: dbItem.unit_price,
    receivedQuantity: dbItem.received_quantity
  };
};
