/**
 * PurchaseOrders component
 * Displays and manages purchase orders for a property
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
import { Search, AlertCircle, PlusCircle, Eye, CheckCircle } from "lucide-react";
import { usePurchaseOrdersByProperty, useInventorySuppliers } from "../../hooks/inventory";
import { FrontendInventoryPurchaseOrder, PurchaseOrderStatus } from "../../integration/supabase/types/inventory";
import { Skeleton } from "../ui/skeleton";
import { format } from "date-fns";

interface PurchaseOrdersProps {
  propertyId: string;
  onAddPurchaseOrder: () => void;
  onViewPurchaseOrder: (orderId: string) => void;
  onReceivePurchaseOrder: (orderId: string) => void;
}

export function PurchaseOrders({
  propertyId,
  onAddPurchaseOrder,
  onViewPurchaseOrder,
  onReceivePurchaseOrder,
}: PurchaseOrdersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { orders, loading: ordersLoading, error: ordersError } = usePurchaseOrdersByProperty(propertyId);
  const { suppliers, loading: suppliersLoading } = useInventorySuppliers();

  // Get status badge variant
  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case "DRAFT":
        return "secondary";
      case "ORDERED":
        return "warning";
      case "RECEIVED":
        return "success";
      case "CANCELLED":
        return "destructive";
      default:
        return "default";
    }
  };

  // Get status display name
  const getStatusDisplay = (status: PurchaseOrderStatus) => {
    switch (status) {
      case "DRAFT":
        return "Draft";
      case "ORDERED":
        return "Ordered";
      case "RECEIVED":
        return "Received";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Create a map of supplier IDs to names for quick lookup
  const suppliersMap = useMemo(() => {
    if (!suppliers) return new Map();
    return new Map(suppliers.map((supplier) => [supplier.id, supplier.name]));
  }, [suppliers]);

  // Filter purchase orders based on search query
  const filteredOrders = useMemo(() => {
    if (!orders || !suppliersMap) return [];
    if (!searchQuery.trim()) return orders;

    const query = searchQuery.toLowerCase();
    return orders.filter((order) => {
      const supplierName = suppliersMap.get(order.supplierId)?.toLowerCase() || "";
      const orderNumber = order.orderNumber?.toLowerCase() || "";
      const status = order.status.toLowerCase();
      
      return (
        supplierName.includes(query) ||
        orderNumber.includes(query) ||
        status.includes(query)
      );
    });
  }, [orders, suppliersMap, searchQuery]);

  // Loading state
  const isLoading = ordersLoading || suppliersLoading;
  const hasError = ordersError;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Purchase Orders</CardTitle>
            <CardDescription>
              Manage purchase orders for this property
            </CardDescription>
          </div>
          <Button onClick={onAddPurchaseOrder} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" /> New Purchase Order
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search purchase orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {hasError && (
          <div className="flex items-center gap-2 p-4 text-red-500 bg-red-50 rounded-md mb-4">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load purchase order data. Please try again.</p>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expected Delivery</TableHead>
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
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    {searchQuery
                      ? "No purchase orders match your search criteria"
                      : "No purchase orders found. Create your first purchase order!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber || `PO-${order.id.slice(0, 8)}`}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.orderDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {suppliersMap.get(order.supplierId) || "Unknown Supplier"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(order.status)}>
                        {getStatusDisplay(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.expectedDeliveryDate
                        ? format(new Date(order.expectedDeliveryDate), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onViewPurchaseOrder(order.id)}
                          title="View order"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === "ORDERED" && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onReceivePurchaseOrder(order.id)}
                            title="Receive items"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
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
