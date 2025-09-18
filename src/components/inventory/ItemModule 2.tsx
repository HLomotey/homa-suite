/**
 * ItemModule component
 * Centralized item management module with category organization
 */

import { useState, useMemo } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { Plus, Package, Search, Edit, Trash2, Eye, DollarSign, AlertCircle, BarChart3 } from "lucide-react";
import { FrontendInventoryItem, FrontendInventoryCategory } from "../../integration/supabase/types/inventory";
import { useInventoryItems, useInventoryCategories, useDeleteInventoryItem } from "../../hooks/inventory";
import { EnhancedInventoryItemForm } from "./EnhancedInventoryItemForm";
import { CategoryForm } from "./CategoryForm";
import { CategoryList } from "./CategoryList";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

interface ItemModuleProps {
  onItemSelect?: (item: FrontendInventoryItem) => void;
  selectionMode?: boolean;
  selectedItems?: FrontendInventoryItem[];
  multiSelect?: boolean;
}

export function ItemModule({
  onItemSelect,
  selectionMode = false,
  selectedItems = [],
  multiSelect = false,
}: ItemModuleProps) {
  const [activeTab, setActiveTab] = useState("items");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<string | undefined>();

  const { items, loading: itemsLoading, refetch: refetchItems } = useInventoryItems();
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useInventoryCategories();
  const { deleteItem, loading: deleteLoading } = useDeleteInventoryItem();
  const { toast } = useToast();

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategoryId === "all" || item.categoryId === selectedCategoryId;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => {
      const value = item.unitCost || 0;
      const quantity = item.totalQuantity || 0;
      return sum + (value * quantity);
    }, 0);
    
    const lowStockItems = items.filter(item => {
      const current = item.availableQuantity || 0;
      const minimum = item.minimumStockLevel || 0;
      return minimum > 0 && current <= minimum;
    }).length;
    
    const activeItems = items.filter(item => item.isActive && item.status === 'Available').length;
    
    return {
      totalItems,
      totalValue,
      lowStockItems,
      activeItems
    };
  }, [items]);

  // Get category info
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  // Handle item actions
  const handleAddItem = () => {
    setSelectedItemId(undefined);
    setIsItemFormOpen(true);
  };

  const handleEditItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsItemFormOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!selectedItemId) return;
    
    try {
      await deleteItem(selectedItemId);
      toast({
        title: "Item deleted",
        description: "The inventory item has been deleted successfully.",
      });
      refetchItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete inventory item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedItemId(undefined);
    }
  };

  const handleItemSelect = (item: FrontendInventoryItem) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  // Handle category actions
  const handleAddCategory = () => {
    setSelectedCategoryForEdit(undefined);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (categoryId: string) => {
    setSelectedCategoryForEdit(categoryId);
    setIsCategoryFormOpen(true);
  };

  // Handle form success
  const handleItemFormSuccess = () => {
    refetchItems();
    setIsItemFormOpen(false);
  };

  const handleCategoryFormSuccess = () => {
    refetchCategories();
    setIsCategoryFormOpen(false);
  };

  const isItemSelected = (itemId: string) => {
    return selectedItems.some(item => item.id === itemId);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Items</p>
                <p className="text-2xl font-bold">{dashboardMetrics.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold">${dashboardMetrics.totalValue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Low Stock</p>
                <p className="text-2xl font-bold">{dashboardMetrics.lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Active Items</p>
                <p className="text-2xl font-bold">{dashboardMetrics.activeItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          {/* Items Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Inventory Items</h3>
              <p className="text-sm text-muted-foreground">
                Manage your inventory items and their details
              </p>
            </div>
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items by name, description, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Grid */}
          {itemsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading items...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">No items found</h4>
              <p className="text-sm mb-4">
                {searchTerm || selectedCategoryId !== "all"
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first inventory item"
                }
              </p>
              {!searchTerm && selectedCategoryId === "all" && (
                <Button onClick={handleAddItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Item
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => {
                const category = getCategoryInfo(item.categoryId);
                const isSelected = isItemSelected(item.id);
                
                return (
                  <Card
                    key={item.id}
                    className={`transition-all hover:shadow-md ${
                      selectionMode ? 'cursor-pointer' : ''
                    } ${isSelected ? 'ring-2 ring-primary' : ''}`}
                    onClick={selectionMode ? () => handleItemSelect(item) : undefined}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-base line-clamp-1">
                            {item.name}
                          </CardTitle>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {!selectionMode && (
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(item.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {/* Category Badge */}
                        {category && (
                          <Badge variant="outline" className="text-xs">
                            <div className="w-2 h-2 rounded-full mr-1 bg-blue-500" />
                            {category.name}
                          </Badge>
                        )}
                        
                        {/* Item Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          {item.sku && (
                            <div>
                              <span className="font-medium">SKU:</span> {item.sku}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Status:</span> {item.status}
                          </div>
                          <div>
                            <span className="font-medium">Available:</span> {item.availableQuantity}
                          </div>
                          <div>
                            <span className="font-medium">Total:</span> {item.totalQuantity}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {/* Categories Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Item Categories</h3>
              <p className="text-sm text-muted-foreground">
                Organize your items with categories and subcategories
              </p>
            </div>
            <Button onClick={handleAddCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>

          {/* Categories List */}
          <CategoryList
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
          />
        </TabsContent>
      </Tabs>

      {/* Item Form Dialog */}
      <EnhancedInventoryItemForm
        isOpen={isItemFormOpen}
        onClose={() => setIsItemFormOpen(false)}
        itemId={selectedItemId}
        onSuccess={handleItemFormSuccess}
      />

      {/* Category Form Dialog */}
      <CategoryForm
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        categoryId={selectedCategoryForEdit}
        onSuccess={handleCategoryFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this inventory item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteItem} 
              disabled={deleteLoading}
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
