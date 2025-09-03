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
import { EnhancedInventoryList } from "./EnhancedInventoryList";
import { EnhancedInventoryItemForm } from "./EnhancedInventoryItemForm";
import { CategoryList } from "./CategoryList";
import { CategoryForm } from "./CategoryForm";
import { ItemModule } from "./ItemModule";
import { ItemIssuanceForm } from "./ItemIssuanceForm";
import { PropertyIssuanceView } from "./PropertyIssuanceView";
import { StockReports } from "./StockReports";
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
  // Remove property dependency - global inventory system
}

export function Inventory({}: InventoryProps) {
  // State for properties (only for issuance selection)
  const [properties, setProperties] = useState<FrontendProperty[]>([]);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(true);
  const [selectedPropertyForView, setSelectedPropertyForView] = useState<string | undefined>();
  
  // Fetch properties for issuance and viewing
  useEffect(() => {
    const getProperties = async () => {
      setLoadingProperties(true);
      try {
        const data = await fetchProperties();
        setProperties(data);
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
  const { toast } = useToast();
  const { deleteItem, loading: deleteItemLoading } = useDeleteInventoryItem();
  const { deleteSupplier, loading: deleteSupplierLoading } = useDeleteInventorySupplier();

  // State for dialogs
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isIssuanceFormOpen, setIsIssuanceFormOpen] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [isPurchaseOrderFormOpen, setIsPurchaseOrderFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isDeleteItemDialogOpen, setIsDeleteItemDialogOpen] = useState(false);
  const [isDeleteSupplierDialogOpen, setIsDeleteSupplierDialogOpen] = useState(false);
  
  // Selected item/supplier/order state
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedTransactionType, setSelectedTransactionType] = useState<'in' | 'out' | undefined>();
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();

  // Tab state
  const [activeTab, setActiveTab] = useState<string>("item-module");

  // Handle item issuance
  const handleIssueItem = (itemId?: string) => {
    setSelectedItemId(itemId);
    setIsIssuanceFormOpen(true);
  };

  // Handle issuance form success
  const handleIssuanceFormSuccess = () => {
    // Refresh data if needed
    setActiveTab("items");
  };

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

  // Handle category form success
  const handleCategoryFormSuccess = () => {
    // Refresh data if needed
    setActiveTab("categories");
  };

  // Handle category actions
  const handleAddCategory = () => {
    setSelectedCategoryId(undefined);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsCategoryFormOpen(true);
  };


  // Handle property change for viewing issued items
  const handlePropertyChange = (value: string) => {
    setSelectedPropertyForView(value);
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-[840px]">
          <TabsTrigger value="item-module">Items Module</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="issuances">Property Items</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>
        
        
        <TabsContent value="item-module" className="mt-6">
          <ItemModule />
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <CategoryList
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
          />
        </TabsContent>
        
        <TabsContent value="issuances" className="mt-6">
          <PropertyIssuanceView
            selectedPropertyId={selectedPropertyForView}
            onPropertyChange={handlePropertyChange}
          />
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <StockReports />
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-6">
          <InventoryTransactions
            propertyId={selectedPropertyForView || ""}
            onAddTransaction={() => handleAddTransaction()}
          />
        </TabsContent>
        
        <TabsContent value="purchase-orders" className="mt-6">
          <PurchaseOrders
            propertyId={selectedPropertyForView || ""}
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

      {/* Item Form */}
      <EnhancedInventoryItemForm
        isOpen={isItemFormOpen}
        onClose={() => setIsItemFormOpen(false)}
        itemId={selectedItemId}
        onSuccess={handleItemFormSuccess}
      />

      {/* Transaction Form */}
      <TransactionForm
        isOpen={isTransactionFormOpen}
        onClose={() => setIsTransactionFormOpen(false)}
        propertyId={selectedPropertyForView || ""}
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
        propertyId={selectedPropertyForView || ""}
        orderId={selectedOrderId}
        onSuccess={handlePurchaseOrderFormSuccess}
      />

      {/* Item Issuance Form */}
      <ItemIssuanceForm
        isOpen={isIssuanceFormOpen}
        onClose={() => setIsIssuanceFormOpen(false)}
        onSuccess={handleIssuanceFormSuccess}
        preSelectedItemId={selectedItemId}
      />

      {/* Category Form */}
      <CategoryForm
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        categoryId={selectedCategoryId}
        onSuccess={handleCategoryFormSuccess}
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
