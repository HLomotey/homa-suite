/**
 * InventoryTransactions component
 * Displays and manages inventory transactions for a property
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
import { Search, AlertCircle, PlusCircle } from "lucide-react";
import { useInventoryTransactionsByProperty, useInventoryItems } from "../../hooks/inventory";
import { FrontendInventoryTransaction, InventoryTransactionType } from "../../integration/supabase/types/inventory";
import { Skeleton } from "../ui/skeleton";
import { format } from "date-fns";

interface InventoryTransactionsProps {
  propertyId: string;
  onAddTransaction: () => void;
}

export function InventoryTransactions({
  propertyId,
  onAddTransaction,
}: InventoryTransactionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { transactions, loading: transactionsLoading, error: transactionsError } = useInventoryTransactionsByProperty(propertyId);
  const { items, loading: itemsLoading } = useInventoryItems();

  // Get transaction type badge variant
  const getTransactionBadge = (type: InventoryTransactionType) => {
    switch (type.toLowerCase()) {
      case "received":
        return "default"; // Using default instead of success
      case "issued":
        return "destructive"; // Using destructive instead of warning
      case "adjusted":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Get transaction type display name
  const getTransactionTypeDisplay = (type: InventoryTransactionType) => {
    switch (type.toLowerCase()) {
      case "received":
        return "Received";
      case "issued":
        return "Issued";
      case "adjusted":
        return "Adjusted";
      default:
        return type;
    }
  };

  // Create a map of item IDs to names for quick lookup
  const itemsMap = useMemo(() => {
    if (!items) return new Map();
    return new Map(items.map((item) => [item.id, item.name]));
  }, [items]);

  // Filter transactions based on search query
  const filteredTransactions = useMemo(() => {
    if (!transactions || !itemsMap) return [];
    if (!searchQuery.trim()) return transactions;

    const query = searchQuery.toLowerCase();
    return transactions.filter((transaction) => {
      const itemName = itemsMap.get(transaction.itemId)?.toLowerCase() || "";
      const notes = transaction.notes?.toLowerCase() || "";
      const type = transaction.transactionType.toLowerCase();
      
      return (
        itemName.includes(query) ||
        notes.includes(query) ||
        type.includes(query)
      );
    });
  }, [transactions, itemsMap, searchQuery]);

  // Loading state
  const isLoading = transactionsLoading || itemsLoading;
  const hasError = transactionsError;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventory Transactions</CardTitle>
            <CardDescription>
              View and manage inventory transactions for this property
            </CardDescription>
          </div>
          <Button onClick={onAddTransaction} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" /> Add Transaction
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {hasError && (
          <div className="flex items-center gap-2 p-4 text-red-500 bg-red-50 rounded-md mb-4">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load transaction data. Please try again.</p>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Previous Stock</TableHead>
                <TableHead className="text-right">New Stock</TableHead>
                <TableHead>Notes</TableHead>
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
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-6 w-[60px] ml-auto" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-6 w-[60px] ml-auto" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-6 w-[60px] ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[120px]" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    {searchQuery
                      ? "No transactions match your search criteria"
                      : "No transactions found. Add your first transaction!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.transactionDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {itemsMap.get(transaction.itemId) || "Unknown Item"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTransactionBadge(transaction.transactionType)}>
                        {getTransactionTypeDisplay(transaction.transactionType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.previousQuantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.newQuantity}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.notes || "—"}
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
