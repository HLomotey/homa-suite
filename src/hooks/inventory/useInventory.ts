/**
 * Inventory hooks for Supabase integration
 * These hooks provide data fetching and state management for inventory data
 */

import { useState, useEffect, useCallback } from "react";
import {
  FrontendInventoryItem,
  FrontendInventoryStock,
  FrontendInventoryTransaction,
  FrontendInventorySupplier,
  FrontendInventoryPurchaseOrder,
  FrontendInventoryPurchaseOrderItem,
  InventoryTransactionType,
  PurchaseOrderStatus
} from "../../integration/supabase/types/inventory";
import * as inventoryApi from "./api";

// ==================== Inventory Items Hooks ====================

/**
 * Hook for fetching all inventory items
 * @returns Object containing inventory items data, loading state, error state, and refetch function
 */
export const useInventoryItems = () => {
  const [items, setItems] = useState<FrontendInventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryApi.fetchInventoryItems();
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { items, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single inventory item by ID
 * @param id Inventory item ID
 * @returns Object containing inventory item data, loading state, error state, and refetch function
 */
export const useInventoryItem = (id: string) => {
  const [item, setItem] = useState<FrontendInventoryItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await inventoryApi.fetchInventoryItemById(id);
      setItem(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { item, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new inventory item
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateInventoryItem = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdItem, setCreatedItem] = useState<FrontendInventoryItem | null>(null);

  const create = useCallback(
    async (itemData: Omit<FrontendInventoryItem, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await inventoryApi.createInventoryItem(itemData);
        setCreatedItem(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error, createdItem };
};

/**
 * Hook for updating an inventory item
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateInventoryItem = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedItem, setUpdatedItem] = useState<FrontendInventoryItem | null>(null);

  const update = useCallback(
    async (
      id: string,
      itemData: Partial<Omit<FrontendInventoryItem, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await inventoryApi.updateInventoryItem(id, itemData);
        setUpdatedItem(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { update, loading, error, updatedItem };
};

/**
 * Hook for deleting an inventory item
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteInventoryItem = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteItem = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await inventoryApi.deleteInventoryItem(id);
      setIsDeleted(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteItem, loading, error, isDeleted };
};

// ==================== Inventory Stock Hooks ====================

/**
 * Hook for fetching inventory stock for a specific property
 * @param propertyId Property ID
 * @returns Object containing inventory stock data, loading state, error state, and refetch function
 */
export const useInventoryStockByProperty = (propertyId: string) => {
  const [stock, setStock] = useState<FrontendInventoryStock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await inventoryApi.fetchInventoryStockByProperty(propertyId);
      setStock(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stock, loading, error, refetch: fetchData };
};

/**
 * Hook for updating inventory stock
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateInventoryStock = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedStock, setUpdatedStock] = useState<FrontendInventoryStock | null>(null);

  const update = useCallback(
    async (propertyId: string, itemId: string, quantity: number) => {
      try {
        setLoading(true);
        setError(null);
        const data = await inventoryApi.updateInventoryStock(propertyId, itemId, quantity);
        setUpdatedStock(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { update, loading, error, updatedStock };
};

// ==================== Inventory Transactions Hooks ====================

/**
 * Hook for fetching inventory transactions for a specific property
 * @param propertyId Property ID
 * @returns Object containing inventory transactions data, loading state, error state, and refetch function
 */
export const useInventoryTransactionsByProperty = (propertyId: string) => {
  const [transactions, setTransactions] = useState<FrontendInventoryTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await inventoryApi.fetchInventoryTransactionsByProperty(propertyId);
      setTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { transactions, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new inventory transaction
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateInventoryTransaction = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdTransaction, setCreatedTransaction] = useState<FrontendInventoryTransaction | null>(null);

  const create = useCallback(
    async (transactionData: Omit<FrontendInventoryTransaction, "id" | "previousQuantity" | "newQuantity" | "transactionDate">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await inventoryApi.createInventoryTransaction(transactionData);
        setCreatedTransaction(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error, createdTransaction };
};

// ==================== Inventory Suppliers Hooks ====================

/**
 * Hook for fetching all inventory suppliers
 * @returns Object containing inventory suppliers data, loading state, error state, and refetch function
 */
export const useInventorySuppliers = () => {
  const [suppliers, setSuppliers] = useState<FrontendInventorySupplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryApi.fetchInventorySuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { suppliers, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new inventory supplier
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateInventorySupplier = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdSupplier, setCreatedSupplier] = useState<FrontendInventorySupplier | null>(null);

  const create = useCallback(
    async (supplierData: Omit<FrontendInventorySupplier, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await inventoryApi.createInventorySupplier(supplierData);
        setCreatedSupplier(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error, createdSupplier };
};

/**
 * Hook for updating an inventory supplier
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateInventorySupplier = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedSupplier, setUpdatedSupplier] = useState<FrontendInventorySupplier | null>(null);

  const update = useCallback(
    async (
      id: string,
      supplierData: Partial<Omit<FrontendInventorySupplier, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await inventoryApi.updateInventorySupplier(id, supplierData);
        setUpdatedSupplier(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { update, loading, error, updatedSupplier };
};

/**
 * Hook for deleting an inventory supplier
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteInventorySupplier = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteSupplier = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await inventoryApi.deleteInventorySupplier(id);
      setIsDeleted(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteSupplier, loading, error, isDeleted };
};

// ==================== Purchase Orders Hooks ====================

/**
 * Hook for fetching purchase orders for a specific property
 * @param propertyId Property ID
 * @returns Object containing purchase orders data, loading state, error state, and refetch function
 */
export const usePurchaseOrdersByProperty = (propertyId: string) => {
  const [orders, setOrders] = useState<FrontendInventoryPurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await inventoryApi.fetchPurchaseOrdersByProperty(propertyId);
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { orders, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single purchase order with its items
 * @param id Purchase order ID
 * @returns Object containing purchase order data, loading state, error state, and refetch function
 */
export const usePurchaseOrder = (id: string) => {
  const [order, setOrder] = useState<FrontendInventoryPurchaseOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await inventoryApi.fetchPurchaseOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { order, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new purchase order
 * @returns Object containing create function, loading state, and error state
 */
export const useCreatePurchaseOrder = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdOrder, setCreatedOrder] = useState<FrontendInventoryPurchaseOrder | null>(null);

  const create = useCallback(
    async (
      orderData: Omit<FrontendInventoryPurchaseOrder, "id" | "orderDate">,
      items: Omit<FrontendInventoryPurchaseOrderItem, "id" | "purchaseOrderId">[]
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await inventoryApi.createPurchaseOrder(orderData, items);
        setCreatedOrder(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error, createdOrder };
};

/**
 * Hook for updating a purchase order status
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdatePurchaseOrderStatus = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedOrder, setUpdatedOrder] = useState<FrontendInventoryPurchaseOrder | null>(null);

  const updateStatus = useCallback(
    async (id: string, status: PurchaseOrderStatus) => {
      try {
        setLoading(true);
        setError(null);
        const data = await inventoryApi.updatePurchaseOrderStatus(id, status);
        setUpdatedOrder(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateStatus, loading, error, updatedOrder };
};

/**
 * Hook for receiving items from a purchase order
 * @returns Object containing receive function, loading state, and error state
 */
export const useReceivePurchaseOrderItems = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isReceived, setIsReceived] = useState<boolean>(false);

  const receive = useCallback(
    async (
      purchaseOrderId: string,
      receivedItems: { itemId: string, quantity: number }[]
    ) => {
      try {
        setLoading(true);
        setError(null);
        await inventoryApi.receivePurchaseOrderItems(purchaseOrderId, receivedItems);
        setIsReceived(true);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { receive, loading, error, isReceived };
};
