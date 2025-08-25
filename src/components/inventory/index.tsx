/**
 * Inventory management main component
 * Integrates all inventory components and provides tab navigation
 */

import { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { InventoryList } from "./InventoryList";
import { InventoryItemForm } from "./InventoryItemForm";
import { InventoryTransactions } from "./InventoryTransactions";
import { TransactionForm } from "./TransactionForm";
import { PurchaseOrders } from "./PurchaseOrders";
import { Suppliers } from "./Suppliers";
import { SupplierForm } from "./SupplierForm";
import { PurchaseOrderForm } from "./PurchaseOrderForm";
import { useToast } from "../ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useDeleteInventoryItem, useDeleteInventorySupplier } from "../../hooks/inventory";
import { fetchProperties } from "../../hooks/property/api";
import { FrontendProperty } from "../../integration/supabase/types";
import { Loader2 } from "lucide-react";
import SearchableSelect, { SearchableSelectOption } from "../ui/searchable-select";

interface InventoryProps {
  propertyId?: string; // Make propertyId optional
}

export function Inventory({ propertyId: initialPropertyId }: InventoryProps) {
  // State for properties
  const [properties, setProperties] = useState<FrontendProperty[]>([]);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(initialPropertyId);
  
  // Fetch properties
  useEffect(() => {
    const getProperties = async () => {
      setLoadingProperties(true);
      try {
        const data = await fetchProperties();
        setProperties(data);
        
        // If no property is selected and we have properties, select the first one
        if (!selectedPropertyId && data.length > 0) {
          setSelectedPropertyId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast({
          title: "Error",
          description: "Failed to load properties. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingProperties(false);
      }
    };
    
    getProperties();
  }, []);
  
  // Update selectedPropertyId if initialPropertyId changes
  useEffect(() => {
    if (initialPropertyId) {
      setSelectedPropertyId(initialPropertyId);
    }
  }, [initialPropertyId]);
  const { toast } = useToast();
  const { deleteItem, loading: deleteItemLoading } = useDeleteInventoryItem();
  const { deleteSupplier, loading: deleteSupplierLoading } = useDeleteInventorySupplier();

  // State for dialogs
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [isPurchaseOrderFormOpen, setIsPurchaseOrderFormOpen] = useState(false);
  const [isDeleteItemDialogOpen, setIsDeleteItemDialogOpen] = useState(false);
  const [isDeleteSupplierDialogOpen, setIsDeleteSupplierDialogOpen] = useState(false);
  
  // Selected item/supplier/order state
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>();
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();

  // Tab state
  const [activeTab, setActiveTab] = useState("items");

  // Handle add item
  const handleAddItem = () => {
    setSelectedItemId(undefined);
    setIsItemFormOpen(true);
  };

  // Handle edit item
  const handleEditItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsItemFormOpen(true);
  };

  // Handle delete item
  const handleDeleteItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsDeleteItemDialogOpen(true);
  };

  // Confirm delete item
  const confirmDeleteItem = async () => {
    if (!selectedItemId) return;
    
    try {
      await deleteItem(selectedItemId);
      toast({
        title: "Item deleted",
        description: "The inventory item has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete inventory item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteItemDialogOpen(false);
    }
  };

  // Handle add transaction
  const handleAddTransaction = (itemId?: string) => {
    setSelectedItemId(itemId);
    setIsTransactionFormOpen(true);
  };

  // Handle add purchase order
  const handleAddPurchaseOrder = () => {
    setSelectedOrderId(undefined);
    setIsPurchaseOrderFormOpen(true);
  };

  // Handle view purchase order
  const handleViewPurchaseOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsPurchaseOrderFormOpen(true);
  };

  // Handle receive purchase order
  const handleReceivePurchaseOrder = (orderId: string) => {
    // Set the selected order ID and open the form
    setSelectedOrderId(orderId);
    // For now, show a toast until the receive functionality is implemented
    toast({
      title: "Feature coming soon",
      description: "Receiving purchase order items will be available in the next update.",
    });
  };

  // Handle add supplier
  const handleAddSupplier = () => {
    setSelectedSupplierId(undefined);
    setIsSupplierFormOpen(true);
  };

  // Handle edit supplier
  const handleEditSupplier = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setIsSupplierFormOpen(true);
  };

  // Handle delete supplier
  const handleDeleteSupplier = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setIsDeleteSupplierDialogOpen(true);
  };

  // Confirm delete supplier
  const confirmDeleteSupplier = async () => {
    if (!selectedSupplierId) return;
    
    try {
      await deleteSupplier(selectedSupplierId);
      toast({
        title: "Supplier deleted",
        description: "The supplier has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete supplier. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteSupplierDialogOpen(false);
    }
  };

  // Handle item form success
  const handleItemFormSuccess = () => {
    // Refresh data if needed
  };

  // Handle supplier form success
  const handleSupplierFormSuccess = () => {
    // Refresh data if needed
    setActiveTab("suppliers");
  };

  // Handle purchase order form success
  const handlePurchaseOrderFormSuccess = () => {
    // Refresh data if needed
    setActiveTab("purchase-orders");
  };

  // Handle transaction form success
  const handleTransactionFormSuccess = () => {
    // Refresh data if needed
    setActiveTab("transactions");
  };

  // Handle property change
  const handlePropertyChange = (value: string) => {
    setSelectedPropertyId(value);
  };
  
  return (
    <div className="space-y-4">
      {/* Property Selector */}
      <div className="bg-black/20 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">Property</h2>
            {loadingProperties ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading properties...</span>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-amber-400">No properties found. Please add a property first.</div>
            ) : (
              <SearchableSelect
                value={selectedPropertyId}
                onValueChange={handlePropertyChange}
                options={properties.map((property) => ({
                  value: property.id,
                  label: property.title,
                  searchText: `${property.title} ${property.address || ''} ${property.type || ''} ${property.status || ''}`
                }))}
                placeholder="Search for a property..."
                emptyMessage="No properties found"
                className="w-full md:w-[300px]"
              />
            )}
          </div>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-[500px]">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="mt-6">
          {selectedPropertyId ? (
            <InventoryList
              propertyId={selectedPropertyId}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onAddTransaction={handleAddTransaction}
            />
          ) : (
            <div className="p-4 bg-black/40 backdrop-blur-md rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Inventory Items</h2>
              <p className="text-white/60 mb-4">Please select a property to manage its inventory items.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-6">
          {selectedPropertyId ? (
            <InventoryTransactions
              propertyId={selectedPropertyId}
              onAddTransaction={() => handleAddTransaction()}
            />
          ) : (
            <div className="p-4 bg-black/40 backdrop-blur-md rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Inventory Transactions</h2>
              <p className="text-white/60 mb-4">Please select a property to manage its inventory transactions.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="purchase-orders" className="mt-6">
          {selectedPropertyId ? (
            <PurchaseOrders
              propertyId={selectedPropertyId}
              onAddPurchaseOrder={handleAddPurchaseOrder}
              onViewPurchaseOrder={handleViewPurchaseOrder}
              onReceivePurchaseOrder={handleReceivePurchaseOrder}
            />
          ) : (
            <div className="p-4 bg-black/40 backdrop-blur-md rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Purchase Orders</h2>
              <p className="text-white/60 mb-4">Please select a property to manage its purchase orders.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="suppliers" className="mt-6">
          <Suppliers
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        </TabsContent>
      </Tabs>

      {/* Item Form */}
      <InventoryItemForm
        isOpen={isItemFormOpen}
        onClose={() => setIsItemFormOpen(false)}
        itemId={selectedItemId}
        onSuccess={handleItemFormSuccess}
      />

      {/* Transaction Form */}
      <TransactionForm
        isOpen={isTransactionFormOpen}
        onClose={() => setIsTransactionFormOpen(false)}
        propertyId={selectedPropertyId || ""}
        initialItemId={selectedItemId}
        onSuccess={handleTransactionFormSuccess}
      />

      {/* Supplier Form */}
      <SupplierForm
        isOpen={isSupplierFormOpen}
        onClose={() => setIsSupplierFormOpen(false)}
        supplierId={selectedSupplierId}
        onSuccess={handleSupplierFormSuccess}
      />

      {/* Purchase Order Form */}
      <PurchaseOrderForm
        isOpen={isPurchaseOrderFormOpen}
        onClose={() => setIsPurchaseOrderFormOpen(false)}
        propertyId={selectedPropertyId || ""}
        orderId={selectedOrderId}
        onSuccess={handlePurchaseOrderFormSuccess}
      />

      {/* Delete Item Confirmation Dialog */}
      <AlertDialog open={isDeleteItemDialogOpen} onOpenChange={setIsDeleteItemDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this inventory item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteItemLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteItem} 
              disabled={deleteItemLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Supplier Confirmation Dialog */}
      <AlertDialog open={isDeleteSupplierDialogOpen} onOpenChange={setIsDeleteSupplierDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this supplier? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSupplierLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSupplier} 
              disabled={deleteSupplierLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
