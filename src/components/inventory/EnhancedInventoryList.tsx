/**
 * Enhanced InventoryList component
 * Displays inventory items with advanced filtering, categorization, and property-specific features
 */

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Filter,
  Package,
  DollarSign,
  Calendar,
  MapPin,
  Eye,
  BarChart3
} from "lucide-react";
import { useInventoryItems, useInventoryStockByProperty } from "../../hooks/inventory";
import { 
  FrontendInventoryItem, 
  FrontendInventoryStock, 
  InventoryCategory,
  InventoryCondition,
  InventoryStatus 
} from "../../integration/supabase/types/inventory";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface EnhancedInventoryListProps {
  propertyId: string;
  onAddItem: () => void;
  onEditItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddTransaction: (itemId: string) => void;
  onViewDetails: (itemId: string) => void;
}

type ViewMode = 'table' | 'cards' | 'categories';

interface InventoryItemWithStock extends FrontendInventoryItem {
  currentStock: number;
  reservedQuantity: number;
  availableQuantity: number;
  roomLocation: string | null;
  belowMinimum: boolean;
  belowReorder: boolean;
  stockValue: number;
}

export function EnhancedInventoryList({
  propertyId,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAddTransaction,
  onViewDetails,
}: EnhancedInventoryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showLowStock, setShowLowStock] = useState(false);
  
  const { items, loading: itemsLoading, error: itemsError } = useInventoryItems();
  const { stock, loading: stockLoading, error: stockError } = useInventoryStockByProperty(propertyId);

  // Combine items with their stock information
  const inventoryWithStock = useMemo(() => {
    if (!items || !stock) return [];

    return items.map((item): InventoryItemWithStock => {
      const stockItem = stock.find((s) => s.itemId === item.id);
      const currentStock = stockItem?.quantity || 0;
      const reservedQuantity = stockItem?.reservedQuantity || 0;
      const availableQuantity = stockItem?.availableQuantity || currentStock - reservedQuantity;
      const stockValue = (item.unitCost || 0) * currentStock;
      
      return {
        ...item,
        currentStock,
        reservedQuantity,
        availableQuantity,
        roomLocation: stockItem?.roomLocation || null,
        belowMinimum: currentStock < item.minStockLevel,
        belowReorder: item.reorderPoint ? currentStock <= item.reorderPoint : false,
        stockValue,
      };
    });
  }, [items, stock]);

  // Filter items based on search query and filters
  const filteredItems = useMemo(() => {
    let filtered = inventoryWithStock;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.categoryId?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.model?.toLowerCase().includes(query) ||
          item.sku?.toLowerCase().includes(query) ||
          item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.categoryId === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Condition filter
    if (selectedCondition !== "all") {
      filtered = filtered.filter(item => item.condition === selectedCondition);
    }

    // Low stock filter
    if (showLowStock) {
      filtered = filtered.filter(item => item.belowMinimum || item.belowReorder);
    }

    return filtered;
  }, [inventoryWithStock, searchQuery, selectedCategory, selectedStatus, selectedCondition, showLowStock]);

  // Group items by category for category view
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, InventoryItemWithStock[]> = {};
    filteredItems.forEach(item => {
      if (!grouped[item.categoryId]) {
        grouped[item.categoryId] = [];
      }
      grouped[item.categoryId].push(item);
    });
    return grouped;
  }, [filteredItems]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalItems = filteredItems.length;
    const totalValue = filteredItems.reduce((sum, item) => sum + item.stockValue, 0);
    const lowStockItems = filteredItems.filter(item => item.belowMinimum).length;
    const activeItems = filteredItems.filter(item => item.status === 'Active').length;
    
    return { totalItems, totalValue, lowStockItems, activeItems };
  }, [filteredItems]);

  // Get unique categories, statuses, and conditions for filters
  const categories = useMemo(() => {
    const cats = Array.from(new Set(inventoryWithStock.map(item => item.categoryId).filter(Boolean)));
    return cats.sort();
  }, [inventoryWithStock]);

  const statuses = useMemo(() => {
    const stats = Array.from(new Set(inventoryWithStock.map(item => item.status)));
    return stats.sort();
  }, [inventoryWithStock]);

  const conditions = useMemo(() => {
    const conds = Array.from(new Set(inventoryWithStock.map(item => item.condition)));
    return conds.sort();
  }, [inventoryWithStock]);

  // Loading state
  const isLoading = itemsLoading || stockLoading;
  const hasError = itemsError || stockError;

  const getStatusBadgeVariant = (status: InventoryStatus) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'secondary';
      case 'Disposed': return 'destructive';
      case 'Lost': return 'destructive';
      case 'Stolen': return 'destructive';
      case 'Under_Repair': return 'outline';
      default: return 'secondary';
    }
  };

  const getConditionBadgeVariant = (condition: InventoryCondition) => {
    switch (condition) {
      case 'New': return 'default';
      case 'Excellent': return 'default';
      case 'Good': return 'secondary';
      case 'Fair': return 'outline';
      case 'Poor': return 'destructive';
      case 'Needs_Repair': return 'destructive';
      case 'Damaged': return 'destructive';
      default: return 'secondary';
    }
  };

  const ItemCard = ({ item }: { item: InventoryItemWithStock }) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <CardDescription className="mt-1">
              {item.brand && item.model ? `${item.brand} ${item.model}` : item.description}
            </CardDescription>
          </div>
          <div className="flex gap-1 ml-2">
            <Button variant="outline" size="icon" onClick={() => onViewDetails(item.id)} title="View details">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onEditItem(item.id)} title="Edit item">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant={getStatusBadgeVariant(item.status)}>
            {item.status.replace(/_/g, ' ')}
          </Badge>
          <Badge variant={getConditionBadgeVariant(item.condition)}>
            {item.condition.replace(/_/g, ' ')}
          </Badge>
          {item.belowMinimum && (
            <Badge variant="destructive">Low Stock</Badge>
          )}
          {item.belowReorder && (
            <Badge variant="outline">Reorder</Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>{item.currentStock} {item.unit}</span>
          </div>
          {item.unitCost && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>${item.stockValue.toFixed(2)}</span>
            </div>
          )}
          {item.roomLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{item.roomLocation}</span>
            </div>
          )}
          {item.purchaseDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(item.purchaseDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddTransaction(item.id)}
            className="flex-1"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Transaction
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDeleteItem(item.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Items</p>
                <p className="text-2xl font-bold">{summaryStats.totalItems}</p>
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
                <p className="text-2xl font-bold">${summaryStats.totalValue.toFixed(0)}</p>
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
                <p className="text-2xl font-bold">{summaryStats.lowStockItems}</p>
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
                <p className="text-2xl font-bold">{summaryStats.activeItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                Manage inventory items and stock levels for this property
              </CardDescription>
            </div>
            <Button onClick={onAddItem} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items, brands, models, SKU, tags..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showLowStock ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowLowStock(!showLowStock)}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Low Stock
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category?.replace?.(/_/g, ' ') || category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {conditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasError && (
            <div className="flex items-center gap-2 p-4 text-red-500 bg-red-50 rounded-md mb-4">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load inventory data. Please try again.</p>
            </div>
          )}

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <TabsList className="mb-4">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="cards">Card View</TabsTrigger>
              <TabsTrigger value="categories">By Category</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Brand/Model</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(5).fill(0).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          {Array(8).fill(0).map((_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton className="h-6 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          {searchQuery || selectedCategory !== "all" || selectedStatus !== "all" || selectedCondition !== "all" || showLowStock
                            ? "No items match your search criteria"
                            : "No inventory items found. Add your first item!"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.categoryId?.replace?.(/_/g, ' ') || '—'}</TableCell>
                          <TableCell>
                            {item.brand && item.model ? `${item.brand} ${item.model}` : item.brand || item.model || "—"}
                          </TableCell>
                          <TableCell>{item.sku || "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {item.currentStock} {item.unit}
                              {item.belowMinimum && (
                                <Badge variant="destructive" className="text-xs">Low</Badge>
                              )}
                              {item.belowReorder && (
                                <Badge variant="outline" className="text-xs">Reorder</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.unitCost ? `$${item.stockValue.toFixed(2)}` : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs">
                                {item.status.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="outline" size="icon" onClick={() => onViewDetails(item.id)} title="View details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => onAddTransaction(item.id)} title="Add transaction">
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => onEditItem(item.id)} title="Edit item">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => onDeleteItem(item.id)} title="Delete item">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="cards">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(6).fill(0).map((_, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery || selectedCategory !== "all" || selectedStatus !== "all" || selectedCondition !== "all" || showLowStock
                    ? "No items match your search criteria"
                    : "No inventory items found. Add your first item!"}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories">
              {isLoading ? (
                <div className="space-y-6">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index}>
                      <Skeleton className="h-8 w-48 mb-4" />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array(3).fill(0).map((_, cardIndex) => (
                          <Card key={cardIndex}>
                            <CardHeader>
                              <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent>
                              <Skeleton className="h-16 w-full" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : Object.keys(itemsByCategory).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No inventory items found. Add your first item!
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(itemsByCategory).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        {category.replace(/_/g, ' ')}
                        <Badge variant="secondary">{items.length}</Badge>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => (
                          <ItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
