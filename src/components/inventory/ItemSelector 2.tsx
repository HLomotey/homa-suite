/**
 * ItemSelector component
 * Reusable component for selecting inventory items with category filtering
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "../ui/use-toast";
import { Search, Package, Plus, Filter } from "lucide-react";
import { FrontendInventoryItem, FrontendInventoryCategory } from "../../integration/supabase/types/inventory";
import { useInventoryItems, useInventoryCategories } from "../../hooks/inventory";

interface ItemSelectorProps {
  selectedItems?: FrontendInventoryItem[];
  onItemSelect: (item: FrontendInventoryItem) => void;
  onItemRemove?: (itemId: string) => void;
  multiSelect?: boolean;
  showQuantity?: boolean;
  showAddNew?: boolean;
  onAddNew?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ItemSelector({
  selectedItems = [],
  onItemSelect,
  onItemRemove,
  multiSelect = false,
  showQuantity = false,
  showAddNew = true,
  onAddNew,
  placeholder = "Select items...",
  disabled = false,
}: ItemSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  
  const { items, loading: itemsLoading, refetch: refetchItems } = useInventoryItems();
  const { categories, loading: categoriesLoading } = useInventoryCategories();
  const { toast } = useToast();

  // Filter items based on search term and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategoryId === "all" || item.categoryId === selectedCategoryId;
    
    return matchesSearch && matchesCategory;
  });

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Uncategorized";
  };

  // Handle item selection
  const handleItemSelect = (item: FrontendInventoryItem) => {
    if (!multiSelect) {
      onItemSelect(item);
      setIsOpen(false);
      return;
    }

    // Check if item is already selected
    const isSelected = selectedItems.some(selected => selected.id === item.id);
    if (isSelected) {
      toast({
        title: "Item already selected",
        description: `${item.name} is already in your selection.`,
        variant: "destructive",
      });
      return;
    }

    onItemSelect(item);
  };

  // Handle add new item
  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected Items Display */}
      {multiSelect && selectedItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Items ({selectedItems.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <Badge
                key={item.id}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                <Package className="h-3 w-3" />
                <span>{item.name}</span>
                {showQuantity && (
                  <span className="text-xs opacity-70">
                    (Available: {item.availableQuantity})
                  </span>
                )}
                {onItemRemove && (
                  <button
                    onClick={() => onItemRemove(item.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Item Selector Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full justify-start text-left font-normal"
          >
            <Package className="mr-2 h-4 w-4" />
            {placeholder}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Inventory Items</DialogTitle>
            <DialogDescription>
              Choose items from your inventory. You can filter by category and search by name.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Filter Controls */}
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
                  <Filter className="mr-2 h-4 w-4" />
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

            {/* Add New Item Button */}
            {showAddNew && (
              <Button
                onClick={handleAddNew}
                variant="outline"
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Item
              </Button>
            )}

            {/* Items List */}
            <ScrollArea className="h-[400px]">
              {itemsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading items...</div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mb-4 opacity-50" />
                  <p>No items found</p>
                  {searchTerm && (
                    <p className="text-sm">Try adjusting your search or filters</p>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItems.some(selected => selected.id === item.id);
                    
                    return (
                      <Card
                        key={item.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleItemSelect(item)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-base">{item.name}</CardTitle>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline">
                              {getCategoryName(item.categoryId)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              {item.sku && (
                                <span className="text-muted-foreground">
                                  SKU: {item.sku}
                                </span>
                              )}
                              <span className="text-muted-foreground">
                                Status: {item.status}
                              </span>
                            </div>
                            {showQuantity && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  Available: {item.availableQuantity}
                                </span>
                                <span className="text-muted-foreground">
                                  / {item.totalQuantity} total
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
