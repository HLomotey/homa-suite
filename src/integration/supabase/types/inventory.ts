/**
 * Inventory types for Supabase integration
 * These types define the inventory management structure and related interfaces
 */

import { Json } from './database';

/**
 * Inventory item interface representing the inventory_items table in Supabase
 */
export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  unit: string;
  min_stock_level: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * Inventory stock interface representing the inventory_stock table in Supabase
 */
export interface InventoryStock {
  id: string;
  property_id: string;
  item_id: string;
  quantity: number;
  last_updated: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Inventory transaction type enum
 */
export type InventoryTransactionType = 'received' | 'issued' | 'adjusted';

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
 * Frontend inventory item type
 */
export interface FrontendInventoryItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  unit: string;
  minStockLevel: number;
}

/**
 * Frontend inventory stock type
 */
export interface FrontendInventoryStock {
  id: string;
  propertyId: string;
  itemId: string;
  quantity: number;
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
export const mapDatabaseInventoryItemToFrontend = (dbItem: InventoryItem): FrontendInventoryItem => {
  return {
    id: dbItem.id,
    name: dbItem.name,
    description: dbItem.description,
    category: dbItem.category,
    unit: dbItem.unit,
    minStockLevel: dbItem.min_stock_level
  };
};

/**
 * Maps a database inventory stock to the frontend format
 */
export const mapDatabaseInventoryStockToFrontend = (dbStock: InventoryStock): FrontendInventoryStock => {
  return {
    id: dbStock.id,
    propertyId: dbStock.property_id,
    itemId: dbStock.item_id,
    quantity: dbStock.quantity,
    lastUpdated: dbStock.last_updated
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
