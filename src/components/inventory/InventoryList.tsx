/**
 * InventoryList component
 * Displays a list of inventory items with their current stock levels for a property
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
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { PlusCircle, Search, Edit, Trash2, AlertCircle } from "lucide-react";
import { useInventoryItems, useInventoryStockByProperty } from "../../hooks/inventory";
import { FrontendInventoryItem, FrontendInventoryStock } from "../../integration/supabase/types/inventory";
import { Skeleton } from "../ui/skeleton";

interface InventoryListProps {
  propertyId: string;
  onAddItem: () => void;
  onEditItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddTransaction: (itemId: string) => void;
}

export function InventoryList({
  propertyId,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAddTransaction,
}: InventoryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { items, loading: itemsLoading, error: itemsError } = useInventoryItems();
  const { stock, loading: stockLoading, error: stockError } = useInventoryStockByProperty(propertyId);

  // Combine items with their stock information
  const inventoryWithStock = useMemo(() => {
    if (!items || !stock) return [];

    return items.map((item) => {
      const stockItem = stock.find((s) => s.itemId === item.id);
      return {
        ...item,
        currentStock: stockItem?.quantity || 0,
        belowMinimum: stockItem ? stockItem.quantity < item.minStockLevel : true,
      };
    });
  }, [items, stock]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return inventoryWithStock;

    const query = searchQuery.toLowerCase();
    return inventoryWithStock.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    );
  }, [inventoryWithStock, searchQuery]);

  // Loading state
  const isLoading = itemsLoading || stockLoading;
  const hasError = itemsError || stockError;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              Manage inventory items and stock levels for this property
            </CardDescription>
          </div>
          <Button onClick={onAddItem} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {hasError && (
          <div className="flex items-center gap-2 p-4 text-red-500 bg-red-50 rounded-md mb-4">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load inventory data. Please try again.</p>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Min. Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-6 w-[180px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[60px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-6 w-[60px] ml-auto" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-6 w-[60px] ml-auto" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    {searchQuery
                      ? "No items match your search criteria"
                      : "No inventory items found. Add your first item!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category || "—"}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.currentStock}
                        {item.belowMinimum && (
                          <Badge variant="destructive" className="text-xs">
                            Low
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.minStockLevel}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onAddTransaction(item.id)}
                          title="Add transaction"
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEditItem(item.id)}
                          title="Edit item"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDeleteItem(item.id)}
                          title="Delete item"
                        >
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
      </CardContent>
    </Card>
  );
}
