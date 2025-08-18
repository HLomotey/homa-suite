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
  FrontendInventoryItem,
  FrontendInventoryStock,
  FrontendInventoryTransaction,
  FrontendInventorySupplier,
  FrontendInventoryPurchaseOrder,
  FrontendInventoryPurchaseOrderItem,
  mapDatabaseInventoryItemToFrontend,
  mapDatabaseInventoryStockToFrontend,
  mapDatabaseInventoryTransactionToFrontend,
  mapDatabaseInventorySupplierToFrontend,
  mapDatabaseInventoryPurchaseOrderToFrontend,
  mapDatabaseInventoryPurchaseOrderItemToFrontend,
  InventoryTransactionType,
  PurchaseOrderStatus
} from "../../integration/supabase/types/inventory";

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

    const mappedData = (data as InventoryItem[]).map(mapDatabaseInventoryItemToFrontend);
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

  return mapDatabaseInventoryItemToFrontend(data as InventoryItem);
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
    category: item.category,
    unit: item.unit,
    min_stock_level: item.minStockLevel
  };

  const { data, error } = await supabase
    .from("inventory_items")
    .insert(dbItem)
    .select()
    .single();

  if (error) {
    console.error("Error creating inventory item:", error);
    throw new Error(error.message);
  }

  return mapDatabaseInventoryItemToFrontend(data as InventoryItem);
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
  if (item.category !== undefined) dbItem.category = item.category;
  if (item.unit !== undefined) dbItem.unit = item.unit;
  if (item.minStockLevel !== undefined) dbItem.min_stock_level = item.minStockLevel;

  const { data, error } = await supabase
    .from("inventory_items")
    .update(dbItem)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating inventory item with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseInventoryItemToFrontend(data as InventoryItem);
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
      .order("last_updated", { ascending: false });

    if (error) {
      console.error(`Error fetching inventory stock for property ${propertyId}:`, error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      console.warn(`No inventory stock found for property ${propertyId}`);
      return [];
    }

    // Map the joined data
    const mappedData = data.map((item: any) => {
      const stockItem = mapDatabaseInventoryStockToFrontend(item);
      if (item.inventory_items) {
        stockItem.item = mapDatabaseInventoryItemToFrontend(item.inventory_items);
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
    const { data, error } = await supabase
      .from("inventory_stock")
      .update({
        quantity: quantity,
        last_updated: new Date().toISOString()
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
    const { data, error } = await supabase
      .from("inventory_stock")
      .insert({
        property_id: propertyId,
        item_id: itemId,
        quantity: quantity,
        last_updated: new Date().toISOString()
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
      frontendTransaction.item = mapDatabaseInventoryItemToFrontend(transaction.inventory_items);
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
  const { data: stockData, error: stockError } = await supabase
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

  // Begin a transaction
  const { data, error } = await supabase.rpc('create_inventory_transaction', {
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
    console.error("Error creating inventory transaction:", error);
    throw new Error(error.message);
  }

  // Update the stock level
  await updateInventoryStock(transaction.propertyId, transaction.itemId, newQuantity);

  // Fetch the created transaction
  const { data: createdTransaction, error: fetchError } = await supabase
    .from("inventory_transactions")
    .select("*")
    .eq("id", data.id)
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

  const { data, error } = await supabase
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

  const { data, error } = await supabase
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

  // Map the joined data
  const mappedData = data.map((order: any) => {
    const frontendOrder = mapDatabaseInventoryPurchaseOrderToFrontend(order);
    if (order.inventory_suppliers) {
      frontendOrder.supplier = mapDatabaseInventorySupplierToFrontend(order.inventory_suppliers);
    }
    return frontendOrder;
  });

  return mappedData;
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
  const frontendOrder = mapDatabaseInventoryPurchaseOrderToFrontend(orderData);
  if (orderData.inventory_suppliers) {
    frontendOrder.supplier = mapDatabaseInventorySupplierToFrontend(orderData.inventory_suppliers);
  }

  // Map the items
  frontendOrder.items = itemsData.map((item: any) => {
    const frontendItem = mapDatabaseInventoryPurchaseOrderItemToFrontend(item);
    if (item.inventory_items) {
      frontendItem.item = mapDatabaseInventoryItemToFrontend(item.inventory_items);
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

  // Create the purchase order
  const dbOrder = {
    supplier_id: order.supplierId,
    property_id: order.propertyId,
    order_date: new Date().toISOString(),
    expected_delivery_date: order.expectedDeliveryDate,
    status: order.status,
    total_amount: totalAmount,
    notes: order.notes,
    created_by: order.createdBy
  };

  const { data: createdOrder, error: orderError } = await supabase
    .from("inventory_purchase_orders")
    .insert(dbOrder)
    .select()
    .single();

  if (orderError) {
    console.error("Error creating purchase order:", orderError);
    throw new Error(orderError.message);
  }

  // Create the purchase order items
  const dbItems = items.map(item => ({
    purchase_order_id: createdOrder.id,
    item_id: item.itemId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    received_quantity: item.receivedQuantity || 0
  }));

  const { data: createdItems, error: itemsError } = await supabase
    .from("inventory_purchase_order_items")
    .insert(dbItems)
    .select();

  if (itemsError) {
    console.error("Error creating purchase order items:", itemsError);
    // Rollback the purchase order
    await supabase.from("inventory_purchase_orders").delete().eq("id", createdOrder.id);
    throw new Error(itemsError.message);
  }

  // Return the created purchase order with items
  const frontendOrder = mapDatabaseInventoryPurchaseOrderToFrontend(createdOrder as InventoryPurchaseOrder);
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
  const { data, error } = await supabase
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
    const newReceivedQuantity = poItem.received_quantity + receivedItem.quantity;
    
    // Update the purchase order item
    const { error: updateError } = await supabase
      .from("inventory_purchase_order_items")
      .update({ received_quantity: newReceivedQuantity })
      .eq("id", poItem.id);

    if (updateError) {
      console.error(`Error updating received quantity for item ${poItem.id}:`, updateError);
      throw new Error(updateError.message);
    }

    // Create an inventory transaction for the received items
    await createInventoryTransaction({
      propertyId: orderData.property_id,
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
    if (item.received_quantity < item.quantity) {
      allItemsReceived = false;
    }
    if (item.received_quantity > 0) {
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
