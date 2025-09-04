/**
 * Inventory API functions for Supabase integration
 * These functions handle direct communication with Supabase for inventory data
 */

import { supabase } from "../../integration/supabase/client";
import {
  InventoryItem,
  InventoryStock,
  InventoryTransaction,
  InventorySupplier,
  InventoryPurchaseOrder,
  InventoryPurchaseOrderItem,
  InventoryCategory,
  FrontendInventoryItem,
  FrontendInventoryStock,
  FrontendInventoryTransaction,
  FrontendInventorySupplier,
  FrontendInventoryPurchaseOrder,
  FrontendInventoryPurchaseOrderItem,
  FrontendInventoryCategory,
  mapInventoryItemToFrontend,
  mapDatabaseInventoryStockToFrontend,
  mapDatabaseInventoryTransactionToFrontend,
  mapDatabaseInventorySupplierToFrontend,
  mapDatabaseInventoryPurchaseOrderToFrontend,
  mapDatabaseInventoryPurchaseOrderItemToFrontend,
  InventoryTransactionType,
  PurchaseOrderStatus
} from "../../integration/supabase/types/inventory";

// Type assertion helper to work around Supabase type generation issues
const db = supabase as any;

// ==================== Inventory Items API ====================

/**
 * Fetch all inventory items
 * @returns Promise with array of inventory items
 */
export const fetchInventoryItems = async (): Promise<FrontendInventoryItem[]> => {
  console.log("Fetching inventory items from Supabase...");
  
  try {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .order("name");

    console.log("Supabase inventory items query result:", { data, error });

    if (error) {
      console.error("Error fetching inventory items:", error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      console.warn("No inventory items found in database");
      return [];
    }

    const mappedData = (data as InventoryItem[]).map(mapInventoryItemToFrontend);
    console.log("Mapped inventory items data:", mappedData);
    
    return mappedData;
  } catch (err) {
    console.error("Exception in fetchInventoryItems:", err);
    throw err;
  }
};

/**
 * Fetch a single inventory item by ID
 * @param id Inventory item ID
 * @returns Promise with inventory item data
 */
export const fetchInventoryItemById = async (
  id: string
): Promise<FrontendInventoryItem> => {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching inventory item with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapInventoryItemToFrontend(data as InventoryItem);
};

/**
 * Create a new inventory item
 * @param item Inventory item data to create
 * @returns Promise with created inventory item data
 */
export const createInventoryItem = async (
  item: Omit<FrontendInventoryItem, "id">
): Promise<FrontendInventoryItem> => {
  // Convert frontend item to database format
  const dbItem = {
    name: item.name,
    description: item.description,
    category_id: item.categoryId,
    minimum_stock_level: item.minimumStockLevel
  };

  const { data, error } = await db
    .from("inventory_items")
    .insert(dbItem)
    .select()
    .single();

  if (error) {
    console.error("Error creating inventory item:", error);
    throw new Error(error.message);
  }

  return mapInventoryItemToFrontend(data as InventoryItem);
};

/**
 * Update an existing inventory item
 * @param id Inventory item ID
 * @param item Inventory item data to update
 * @returns Promise with updated inventory item data
 */
export const updateInventoryItem = async (
  id: string,
  item: Partial<Omit<FrontendInventoryItem, "id">>
): Promise<FrontendInventoryItem> => {
  // Convert frontend item to database format
  const dbItem: any = {};

  if (item.name !== undefined) dbItem.name = item.name;
  if (item.description !== undefined) dbItem.description = item.description;
  if (item.categoryId !== undefined) dbItem.category_id = item.categoryId;
  if (item.minimumStockLevel !== undefined) dbItem.minimum_stock_level = item.minimumStockLevel;

  const { data, error } = await db
    .from("inventory_items")
    .update(dbItem)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating inventory item with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapInventoryItemToFrontend(data as InventoryItem);
};

/**
 * Delete an inventory item
 * @param id Inventory item ID
 * @returns Promise with success status
 */
export const deleteInventoryItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from("inventory_items").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting inventory item with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

// ==================== Inventory Stock API ====================

/**
 * Fetch inventory stock for a specific property
 * @param propertyId Property ID
 * @returns Promise with array of inventory stock items
 */
export const fetchInventoryStockByProperty = async (
  propertyId: string
): Promise<FrontendInventoryStock[]> => {
  console.log(`Fetching inventory stock for property ${propertyId}...`);
  
  try {
    const { data, error } = await supabase
      .from("inventory_stock")
      .select(`
        *,
        inventory_items (*)
      `)
      .eq("property_id", propertyId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(`Error fetching inventory stock for property ${propertyId}:`, error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      // This is normal for new properties, so we'll return an empty array without a warning
      return [];
    }

    // Map the joined data
    const mappedData = data.map((item: any) => {
      const stockItem = mapDatabaseInventoryStockToFrontend(item);
      if (item.inventory_items) {
        stockItem.item = mapInventoryItemToFrontend(item.inventory_items);
      }
      return stockItem;
    });

    return mappedData;
  } catch (err) {
    console.error("Exception in fetchInventoryStockByProperty:", err);
    throw err;
  }
};

/**
 * Fetch inventory stock for a specific item across all properties
 * @param itemId Item ID
 * @returns Promise with array of inventory stock items
 */
export const fetchInventoryStockByItem = async (
  itemId: string
): Promise<FrontendInventoryStock[]> => {
  const { data, error } = await supabase
    .from("inventory_stock")
    .select("*")
    .eq("item_id", itemId)
    .order("last_updated", { ascending: false });

  if (error) {
    console.error(`Error fetching inventory stock for item ${itemId}:`, error);
    throw new Error(error.message);
  }

  return (data as InventoryStock[]).map(mapDatabaseInventoryStockToFrontend);
};

/**
 * Update inventory stock quantity
 * @param propertyId Property ID
 * @param itemId Item ID
 * @param quantity New quantity
 * @returns Promise with updated inventory stock data
 */
export const updateInventoryStock = async (
  propertyId: string,
  itemId: string,
  quantity: number
): Promise<FrontendInventoryStock> => {
  // First check if stock entry exists
  const { data: existingStock, error: fetchError } = await supabase
    .from("inventory_stock")
    .select("*")
    .eq("property_id", propertyId)
    .eq("item_id", itemId)
    .maybeSingle();

  if (fetchError) {
    console.error(`Error fetching inventory stock for property ${propertyId} and item ${itemId}:`, fetchError);
    throw new Error(fetchError.message);
  }

  if (existingStock) {
    // Update existing stock
    const { data, error } = await db
      .from("inventory_stock")
      .update({
        quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq("property_id", propertyId)
      .eq("item_id", itemId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating inventory stock for property ${propertyId} and item ${itemId}:`, error);
      throw new Error(error.message);
    }

    return mapDatabaseInventoryStockToFrontend(data as InventoryStock);
  } else {
    // Create new stock entry
    const { data, error } = await db
      .from("inventory_stock")
      .insert({
        property_id: propertyId,
        item_id: itemId,
        quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error(`Error creating inventory stock for property ${propertyId} and item ${itemId}:`, error);
      throw new Error(error.message);
    }

    return mapDatabaseInventoryStockToFrontend(data as InventoryStock);
  }
};

// ==================== Inventory Transactions API ====================

/**
 * Fetch inventory transactions for a specific property
 * @param propertyId Property ID
 * @returns Promise with array of inventory transactions
 */
export const fetchInventoryTransactionsByProperty = async (
  propertyId: string
): Promise<FrontendInventoryTransaction[]> => {
  const { data, error } = await supabase
    .from("inventory_transactions")
    .select(`
      *,
      inventory_items (*)
    `)
    .eq("property_id", propertyId)
    .order("transaction_date", { ascending: false });

  if (error) {
    console.error(`Error fetching inventory transactions for property ${propertyId}:`, error);
    throw new Error(error.message);
  }

  // Map the joined data
  const mappedData = data.map((transaction: any) => {
    const frontendTransaction = mapDatabaseInventoryTransactionToFrontend(transaction);
    if (transaction.inventory_items) {
      frontendTransaction.item = mapInventoryItemToFrontend(transaction.inventory_items);
    }
    return frontendTransaction;
  });

  return mappedData;
};

/**
 * Create a new inventory transaction
 * @param transaction Transaction data to create
 * @returns Promise with created transaction data
 */
export const createInventoryTransaction = async (
  transaction: Omit<FrontendInventoryTransaction, "id" | "previousQuantity" | "newQuantity" | "transactionDate">
): Promise<FrontendInventoryTransaction> => {
  // First get the current stock level
  const { data: stockData, error: stockError } = await db
    .from("inventory_stock")
    .select("quantity")
    .eq("property_id", transaction.propertyId)
    .eq("item_id", transaction.itemId)
    .maybeSingle();

  if (stockError) {
    console.error(`Error fetching current stock level:`, stockError);
    throw new Error(stockError.message);
  }

  const previousQuantity = stockData ? stockData.quantity : 0;
  let newQuantity = previousQuantity;

  // Calculate new quantity based on transaction type
  switch (transaction.transactionType) {
    case 'received':
      newQuantity = previousQuantity + transaction.quantity;
      break;
    case 'issued':
      newQuantity = previousQuantity - transaction.quantity;
      if (newQuantity < 0) {
        throw new Error("Cannot issue more items than available in stock");
      }
      break;
    case 'adjusted':
      newQuantity = transaction.quantity; // For adjustments, quantity is the new total
      break;
  }

  // Try to use the stored procedure first
  let transactionId: string | undefined;
  
  try {
    const { data, error } = await db.rpc('create_inventory_transaction', {
      p_property_id: transaction.propertyId,
      p_item_id: transaction.itemId,
      p_transaction_type: transaction.transactionType,
      p_quantity: transaction.quantity,
      p_previous_quantity: previousQuantity,
      p_new_quantity: newQuantity,
      p_notes: transaction.notes,
      p_created_by: transaction.createdBy
    });

    if (error) {
      throw error;
    }
    
    transactionId = data?.id;
  } catch (rpcError) {
    console.warn("RPC function not available, falling back to direct table insertion", rpcError);
    
    // Fallback: Insert directly into the table
    const { data: insertData, error: insertError } = await db
      .from("inventory_transactions")
      .insert({
        property_id: transaction.propertyId,
        item_id: transaction.itemId,
        transaction_type: transaction.transactionType,
        quantity: transaction.quantity,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        notes: transaction.notes,
        created_by: transaction.createdBy
      })
      .select("id")
      .single();
      
    if (insertError) {
      console.error("Error creating inventory transaction:", insertError);
      throw new Error(insertError.message);
    }
    
    transactionId = insertData.id;
  }

  // Update the stock level
  await updateInventoryStock(transaction.propertyId, transaction.itemId, newQuantity);

  // Fetch the created transaction
  const { data: createdTransaction, error: fetchError } = await supabase
    .from("inventory_transactions")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (fetchError) {
    console.error("Error fetching created transaction:", fetchError);
    throw new Error(fetchError.message);
  }

  return mapDatabaseInventoryTransactionToFrontend(createdTransaction as InventoryTransaction);
};

// ==================== Inventory Suppliers API ====================

/**
 * Fetch all inventory suppliers
 * @returns Promise with array of inventory suppliers
 */
export const fetchInventorySuppliers = async (): Promise<FrontendInventorySupplier[]> => {
  const { data, error } = await supabase
    .from("inventory_suppliers")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching inventory suppliers:", error);
    throw new Error(error.message);
  }

  return (data as InventorySupplier[]).map(mapDatabaseInventorySupplierToFrontend);
};

/**
 * Create a new inventory supplier
 * @param supplier Supplier data to create
 * @returns Promise with created supplier data
 */
export const createInventorySupplier = async (
  supplier: Omit<FrontendInventorySupplier, "id">
): Promise<FrontendInventorySupplier> => {
  const dbSupplier = {
    name: supplier.name,
    contact_person: supplier.contactPerson,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address
  };

  const { data, error } = await db
    .from("inventory_suppliers")
    .insert(dbSupplier)
    .select()
    .single();

  if (error) {
    console.error("Error creating inventory supplier:", error);
    throw new Error(error.message);
  }

  return mapDatabaseInventorySupplierToFrontend(data as InventorySupplier);
};

/**
 * Update an existing inventory supplier
 * @param id Supplier ID
 * @param supplier Supplier data to update
 * @returns Promise with updated supplier data
 */
export const updateInventorySupplier = async (
  id: string,
  supplier: Partial<Omit<FrontendInventorySupplier, "id">>
): Promise<FrontendInventorySupplier> => {
  const dbSupplier: any = {};

  if (supplier.name !== undefined) dbSupplier.name = supplier.name;
  if (supplier.contactPerson !== undefined) dbSupplier.contact_person = supplier.contactPerson;
  if (supplier.email !== undefined) dbSupplier.email = supplier.email;
  if (supplier.phone !== undefined) dbSupplier.phone = supplier.phone;
  if (supplier.address !== undefined) dbSupplier.address = supplier.address;

  const { data, error } = await db
    .from("inventory_suppliers")
    .update(dbSupplier)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating inventory supplier with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseInventorySupplierToFrontend(data as InventorySupplier);
};

/**
 * Delete an inventory supplier
 * @param id Supplier ID
 * @returns Promise with success status
 */
export const deleteInventorySupplier = async (id: string): Promise<void> => {
  const { error } = await supabase.from("inventory_suppliers").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting inventory supplier with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

// ==================== Purchase Orders API ====================

/**
 * Fetch purchase orders for a specific property
 * @param propertyId Property ID
 * @returns Promise with array of purchase orders
 */
export const fetchPurchaseOrdersByProperty = async (
  propertyId: string
): Promise<FrontendInventoryPurchaseOrder[]> => {
  console.log(`Fetching purchase orders for property: ${propertyId}`);
  
  // Validate propertyId parameter
  if (!propertyId || propertyId.trim() === '') {
    console.warn("Empty or invalid propertyId provided, returning empty array");
    return [];
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(propertyId)) {
    console.warn(`Invalid UUID format for propertyId: ${propertyId}, returning empty array`);
    return [];
  }
  
  try {
    // First check if the table exists by doing a simple count query
    const { count, error: countError } = await supabase
      .from("inventory_purchase_orders")
      .select("*", { count: 'exact', head: true });

    if (countError) {
      console.error("Table access error:", countError);
      // If the table doesn't exist or we can't access it, return empty array
      if (countError.code === '42P01' || countError.message.includes('does not exist')) {
        console.warn("inventory_purchase_orders table does not exist, returning empty array");
        return [];
      }
      throw new Error(`Database access error: ${countError.message}`);
    }

    console.log(`Table exists with ${count} total records`);

    const { data, error } = await supabase
      .from("inventory_purchase_orders")
      .select(`
        *,
        inventory_suppliers (*)
      `)
      .eq("property_id", propertyId)
      .order("order_date", { ascending: false });

    if (error) {
      console.error(`Error fetching purchase orders for property ${propertyId}:`, error);
      throw new Error(error.message);
    }

    console.log(`Found ${data?.length || 0} purchase orders for property ${propertyId}`);

    if (!data || data.length === 0) {
      return [];
    }

    // Map the joined data
    const mappedData = data.map((order: any) => {
      const frontendOrder = mapDatabaseInventoryPurchaseOrderToFrontend(order);
      if (order.inventory_suppliers) {
        frontendOrder.supplier = mapDatabaseInventorySupplierToFrontend(order.inventory_suppliers);
      }
      return frontendOrder;
    });

    return mappedData;
  } catch (err) {
    console.error("Exception in fetchPurchaseOrdersByProperty:", err);
    throw err;
  }
};

/**
 * Fetch a single purchase order with its items
 * @param id Purchase order ID
 * @returns Promise with purchase order data including items
 */
export const fetchPurchaseOrderById = async (
  id: string
): Promise<FrontendInventoryPurchaseOrder> => {
  // Fetch the purchase order
  const { data: orderData, error: orderError } = await supabase
    .from("inventory_purchase_orders")
    .select(`
      *,
      inventory_suppliers (*)
    `)
    .eq("id", id)
    .single();

  if (orderError) {
    console.error(`Error fetching purchase order with ID ${id}:`, orderError);
    throw new Error(orderError.message);
  }

  // Fetch the purchase order items
  const { data: itemsData, error: itemsError } = await supabase
    .from("inventory_purchase_order_items")
    .select(`
      *,
      inventory_items (*)
    `)
    .eq("purchase_order_id", id);

  if (itemsError) {
    console.error(`Error fetching items for purchase order ${id}:`, itemsError);
    throw new Error(itemsError.message);
  }

  // Map the data
  const frontendOrder = mapDatabaseInventoryPurchaseOrderToFrontend(orderData as any);
  if ((orderData as any).inventory_suppliers) {
    frontendOrder.supplier = mapDatabaseInventorySupplierToFrontend((orderData as any).inventory_suppliers);
  }

  // Map the items
  frontendOrder.items = itemsData.map((item: any) => {
    const frontendItem = mapDatabaseInventoryPurchaseOrderItemToFrontend(item);
    if (item.inventory_items) {
      frontendItem.item = mapInventoryItemToFrontend(item.inventory_items);
    }
    return frontendItem;
  });

  return frontendOrder;
};

/**
 * Create a new purchase order
 * @param order Purchase order data to create
 * @param items Purchase order items to create
 * @returns Promise with created purchase order data
 */
export const createPurchaseOrder = async (
  order: Omit<FrontendInventoryPurchaseOrder, "id" | "orderDate">,
  items: Omit<FrontendInventoryPurchaseOrderItem, "id" | "purchaseOrderId">[]
): Promise<FrontendInventoryPurchaseOrder> => {
  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const { data: orderData, error } = await db
    .from("inventory_purchase_orders")
    .insert({
      supplier_id: order.supplierId,
      property_id: order.propertyId,
      order_date: new Date().toISOString(),
      expected_delivery_date: order.expectedDeliveryDate,
      status: order.status,
      total_amount: totalAmount,
      notes: order.notes,
      created_by: order.createdBy
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating purchase order:", error);
    throw new Error(error.message);
  }

  if (!orderData) {
    throw new Error("Failed to create purchase order - no data returned");
  }

  // Create the purchase order items
  const dbItems = items.map(item => ({
    purchase_order_id: orderData.id,
    item_id: item.itemId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    received_quantity: item.receivedQuantity || 0
  }));

  const { data: createdItems, error: itemsError } = await db
    .from("inventory_purchase_order_items")
    .insert(dbItems)
    .select();

  if (itemsError) {
    console.error("Error creating purchase order items:", itemsError);
    // Rollback the purchase order
    await supabase.from("inventory_purchase_orders").delete().eq("id", orderData.id);
    throw new Error(itemsError.message);
  }

  // Return the created purchase order with items
  const frontendOrder = mapDatabaseInventoryPurchaseOrderToFrontend(orderData as InventoryPurchaseOrder);
  frontendOrder.items = (createdItems as InventoryPurchaseOrderItem[]).map(mapDatabaseInventoryPurchaseOrderItemToFrontend);

  return frontendOrder;
};

/**
 * Update a purchase order status
 * @param id Purchase order ID
 * @param status New status
 * @returns Promise with updated purchase order data
 */
export const updatePurchaseOrderStatus = async (
  id: string,
  status: PurchaseOrderStatus
): Promise<FrontendInventoryPurchaseOrder> => {
  const { data, error } = await db
    .from("inventory_purchase_orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating purchase order status for ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseInventoryPurchaseOrderToFrontend(data as InventoryPurchaseOrder);
};

// ===== CATEGORY MANAGEMENT API FUNCTIONS =====

/**
 * Create a new inventory category
 * @param category Category data to create
 * @returns Promise with created category data
 */
export const createInventoryCategory = async (
  category: Omit<FrontendInventoryCategory, "id">
): Promise<FrontendInventoryCategory> => {
  const { data, error } = await db
    .from("inventory_categories")
    .insert({
      name: category.name,
      description: category.description,
      parent_category_id: category.parentCategoryId,
      color_code: category.colorCode,
      icon_name: category.iconName,
      is_active: category.isActive,
      sort_order: category.sortOrder,
      created_by: null
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating inventory category:", error);
    throw new Error(error.message);
  }

  return mapDatabaseInventoryCategoryToFrontend(data as InventoryCategory);
};

/**
 * Update an existing inventory category
 * @param id Category ID
 * @param category Updated category data
 * @returns Promise with updated category data
 */
export const updateInventoryCategory = async (
  id: string,
  category: Partial<Omit<FrontendInventoryCategory, "id">>
): Promise<FrontendInventoryCategory> => {
  const updateData: any = {};
  
  if (category.name !== undefined) updateData.name = category.name;
  if (category.description !== undefined) updateData.description = category.description;
  if (category.parentCategoryId !== undefined) updateData.parent_category_id = category.parentCategoryId;
  if (category.colorCode !== undefined) updateData.color_code = category.colorCode;
  if (category.iconName !== undefined) updateData.icon_name = category.iconName;
  if (category.isActive !== undefined) updateData.is_active = category.isActive;
  if (category.sortOrder !== undefined) updateData.sort_order = category.sortOrder;

  const { data, error } = await db
    .from("inventory_categories")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating inventory category ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseInventoryCategoryToFrontend(data as InventoryCategory);
};

/**
 * Delete an inventory category
 * @param id Category ID
 * @returns Promise that resolves when category is deleted
 */
export const deleteInventoryCategory = async (id: string): Promise<void> => {
  const { error } = await db
    .from("inventory_categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting inventory category ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Get all inventory categories
 * @returns Promise with array of categories
 */
export const getInventoryCategories = async (): Promise<FrontendInventoryCategory[]> => {
  const { data, error } = await db
    .from("inventory_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching inventory categories:", error);
    throw new Error(error.message);
  }

  return (data as InventoryCategory[]).map(mapDatabaseInventoryCategoryToFrontend);
};

/**
 * Get a single inventory category by ID
 * @param id Category ID
 * @returns Promise with category data
 */
export const getInventoryCategory = async (id: string): Promise<FrontendInventoryCategory> => {
  const { data, error } = await db
    .from("inventory_categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching inventory category ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseInventoryCategoryToFrontend(data as InventoryCategory);
};

/**
 * Get categories with hierarchical structure (parent-child relationships)
 * @returns Promise with hierarchical category data
 */
export const getInventoryCategoriesHierarchy = async (): Promise<FrontendInventoryCategory[]> => {
  const { data, error } = await db
    .from("inventory_categories")
    .select(`
      *,
      parent_category:inventory_categories!parent_category_id(*)
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching inventory categories hierarchy:", error);
    throw new Error(error.message);
  }

  return (data as any[]).map((item) => {
    const category = mapDatabaseInventoryCategoryToFrontend(item as InventoryCategory);
    if (item.parent_category) {
      category.parentCategory = mapDatabaseInventoryCategoryToFrontend(item.parent_category);
    }
    return category;
  });
};

/**
 * Map database inventory category to frontend format
 */
const mapDatabaseInventoryCategoryToFrontend = (dbCategory: InventoryCategory): FrontendInventoryCategory => {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description,
    parentCategoryId: dbCategory.parent_category_id,
    colorCode: dbCategory.color_code,
    iconName: dbCategory.icon_name,
    isActive: dbCategory.is_active,
    sortOrder: dbCategory.sort_order,
  };
};

/**
 * Receive items from a purchase order
 * @param purchaseOrderId Purchase order ID
 * @param receivedItems Items received with quantities
 * @returns Promise with success status
 */
export const receivePurchaseOrderItems = async (
  purchaseOrderId: string,
  receivedItems: { itemId: string, quantity: number }[]
): Promise<void> => {
  // Get the purchase order
  const { data: orderData, error: orderError } = await supabase
    .from("inventory_purchase_orders")
    .select("*")
    .eq("id", purchaseOrderId)
    .single();

  if (orderError) {
    console.error(`Error fetching purchase order with ID ${purchaseOrderId}:`, orderError);
    throw new Error(orderError.message);
  }

  // Get the purchase order items
  const { data: poItems, error: poItemsError } = await supabase
    .from("inventory_purchase_order_items")
    .select("*")
    .eq("purchase_order_id", purchaseOrderId);

  if (poItemsError) {
    console.error(`Error fetching items for purchase order ${purchaseOrderId}:`, poItemsError);
    throw new Error(poItemsError.message);
  }

  // Update each received item
  for (const receivedItem of receivedItems) {
    const poItem = poItems.find((item: any) => item.item_id === receivedItem.itemId);
    
    if (!poItem) {
      console.error(`Item ${receivedItem.itemId} not found in purchase order ${purchaseOrderId}`);
      continue;
    }

    // Update the received quantity
    const newReceivedQuantity = (poItem as any).received_quantity + receivedItem.quantity;
    
    // Update the purchase order item
    const { data: updatedItem, error: updateError } = await db
      .from("inventory_purchase_order_items")
      .update({ received_quantity: newReceivedQuantity })
      .eq("id", (poItem as any).id)
      .select()
      .single();

    if (updateError) {
      console.error(`Error updating received quantity for item ${(poItem as any).id}:`, updateError);
      throw new Error(updateError.message);
    }

    // Create an inventory transaction for the received items
    await createInventoryTransaction({
      propertyId: (orderData as any).property_id,
      itemId: receivedItem.itemId,
      transactionType: 'received',
      quantity: receivedItem.quantity,
      notes: `Received from PO #${purchaseOrderId}`,
      createdBy: null
    });
  }

  // Check if all items are fully received
  const { data: updatedItems, error: checkError } = await supabase
    .from("inventory_purchase_order_items")
    .select("*")
    .eq("purchase_order_id", purchaseOrderId);

  if (checkError) {
    console.error(`Error checking updated items for purchase order ${purchaseOrderId}:`, checkError);
    throw new Error(checkError.message);
  }

  // Determine if the order is fully received, partially received, or still ordered
  let allItemsReceived = true;
  let anyItemReceived = false;

  for (const item of updatedItems) {
    if ((item as any).received_quantity < (item as any).quantity) {
      allItemsReceived = false;
    }
    if ((item as any).received_quantity > 0) {
      anyItemReceived = true;
    }
  }

  // Update the purchase order status
  let newStatus: PurchaseOrderStatus = 'ordered';
  if (allItemsReceived) {
    newStatus = 'delivered';
  } else if (anyItemReceived) {
    newStatus = 'partial';
  }

  await updatePurchaseOrderStatus(purchaseOrderId, newStatus);
};
