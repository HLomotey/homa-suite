/**
 * Inventory management main component
 * Integrates all inventory components and provides tab navigation
 */

import { useState } from "react";
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
import { useToast } from "../ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useDeleteInventoryItem, useDeleteInventorySupplier } from "../../hooks/inventory";

interface InventoryProps {
  propertyId: string;
}

export function Inventory({ propertyId }: InventoryProps) {
  const { toast } = useToast();
  const { deleteItem, loading: deleteItemLoading } = useDeleteInventoryItem();
  const { deleteSupplier, loading: deleteSupplierLoading } = useDeleteInventorySupplier();

  // State for dialogs
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isDeleteItemDialogOpen, setIsDeleteItemDialogOpen] = useState(false);
  const [isDeleteSupplierDialogOpen, setIsDeleteSupplierDialogOpen] = useState(false);
  
  // Selected item/supplier state
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>();

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
    // This would open a purchase order form dialog
    toast({
      title: "Feature coming soon",
      description: "Purchase order creation will be available in the next update.",
    });
  };

  // Handle view purchase order
  const handleViewPurchaseOrder = (orderId: string) => {
    // This would open a purchase order details dialog
    toast({
      title: "Feature coming soon",
      description: "Purchase order details will be available in the next update.",
    });
  };

  // Handle receive purchase order
  const handleReceivePurchaseOrder = (orderId: string) => {
    // This would open a receive items dialog
    toast({
      title: "Feature coming soon",
      description: "Receiving purchase order items will be available in the next update.",
    });
  };

  // Handle add supplier
  const handleAddSupplier = () => {
    // This would open a supplier form dialog
    toast({
      title: "Feature coming soon",
      description: "Supplier creation will be available in the next update.",
    });
  };

  // Handle edit supplier
  const handleEditSupplier = (supplierId: string) => {
    // This would open a supplier form dialog with the supplier data
    toast({
      title: "Feature coming soon",
      description: "Supplier editing will be available in the next update.",
    });
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

  // Handle transaction form success
  const handleTransactionFormSuccess = () => {
    // Refresh data if needed
    setActiveTab("transactions");
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-[500px]">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="mt-6">
          <InventoryList
            propertyId={propertyId}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onAddTransaction={handleAddTransaction}
          />
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-6">
          <InventoryTransactions
            propertyId={propertyId}
            onAddTransaction={() => handleAddTransaction()}
          />
        </TabsContent>
        
        <TabsContent value="purchase-orders" className="mt-6">
          <PurchaseOrders
            propertyId={propertyId}
            onAddPurchaseOrder={handleAddPurchaseOrder}
            onViewPurchaseOrder={handleViewPurchaseOrder}
            onReceivePurchaseOrder={handleReceivePurchaseOrder}
          />
        </TabsContent>
        
        <TabsContent value="suppliers" className="mt-6">
          <Suppliers
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        </TabsContent>
      </Tabs>

      {/* Item Form Dialog */}
      <InventoryItemForm
        isOpen={isItemFormOpen}
        onClose={() => setIsItemFormOpen(false)}
        itemId={selectedItemId}
        onSuccess={handleItemFormSuccess}
      />

      {/* Transaction Form Dialog */}
      <TransactionForm
        isOpen={isTransactionFormOpen}
        onClose={() => setIsTransactionFormOpen(false)}
        propertyId={propertyId}
        initialItemId={selectedItemId}
        onSuccess={handleTransactionFormSuccess}
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
