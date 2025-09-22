/**
 * StockReports component
 * Comprehensive reporting for stock levels, issuances, and inventory movements
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  Download,
  Calendar,
  Building,
  Users
} from "lucide-react";
import { FrontendInventoryItem } from "../../integration/supabase/types/inventory";
import { useInventoryItems } from "../../hooks/inventory/useInventoryItems";
import { useProperties } from "../../hooks/property/useProperties";

interface StockAlert {
  id: string;
  itemName: string;
  currentStock: number;
  minimumStock: number;
  severity: 'low' | 'critical';
}

interface IssuanceSummary {
  propertyId: string;
  propertyName: string;
  totalIssued: number;
  totalValue: number;
  overdueItems: number;
}

export function StockReports() {
  const [reportType, setReportType] = useState<'stock' | 'issuances' | 'movements'>('stock');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  const { items, loading } = useInventoryItems();
  const { properties } = useProperties();

  // Mock data for demonstration - replace with actual API calls
  const stockAlerts: StockAlert[] = useMemo(() => {
    return items
      .filter(item => item.availableQuantity <= item.minimumStockLevel)
      .map(item => ({
        id: item.id,
        itemName: item.name,
        currentStock: item.availableQuantity,
        minimumStock: item.minimumStockLevel,
        severity: item.availableQuantity === 0 ? 'critical' : 'low'
      }));
  }, [items]);

  const issuanceSummaries: IssuanceSummary[] = useMemo(() => {
    // Mock data - replace with actual issuance data
    return properties.map(property => ({
      propertyId: property.id,
      propertyName: property.title,
      totalIssued: Math.floor(Math.random() * 50),
      totalValue: Math.floor(Math.random() * 10000),
      overdueItems: Math.floor(Math.random() * 5)
    }));
  }, [properties]);

  const stockSummary = useMemo(() => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.totalQuantity * (item.unitCost || 0)), 0);
    const lowStockItems = stockAlerts.filter(alert => alert.severity === 'low').length;
    const criticalStockItems = stockAlerts.filter(alert => alert.severity === 'critical').length;
    const totalIssued = items.reduce((sum, item) => sum + item.issuedQuantity, 0);
    const totalAvailable = items.reduce((sum, item) => sum + item.availableQuantity, 0);

    return {
      totalItems,
      totalValue,
      lowStockItems,
      criticalStockItems,
      totalIssued,
      totalAvailable
    };
  }, [items, stockAlerts]);

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log('Exporting report:', reportType, dateRange);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading reports...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Inventory Reports & Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive stock levels, issuance tracking, and inventory movement reports
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={(value) => setDateRange(value as typeof dateRange)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockSummary.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              ${stockSummary.totalValue.toLocaleString()} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Available Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stockSummary.totalAvailable}</div>
            <p className="text-xs text-muted-foreground">
              Ready for issuance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Issued Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stockSummary.totalIssued}</div>
            <p className="text-xs text-muted-foreground">
              Currently at properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stockSummary.criticalStockItems + stockSummary.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              {stockSummary.criticalStockItems} critical, {stockSummary.lowStockItems} low
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={reportType} onValueChange={(value) => setReportType(value as typeof reportType)}>
        <TabsList>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="issuances">Property Issuances</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        {/* Stock Levels Report */}
        <TabsContent value="stock" className="space-y-4">
          {/* Stock Alerts */}
          {stockAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Stock Alerts ({stockAlerts.length})
                </CardTitle>
                <CardDescription>
                  Items that are low in stock or out of stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Minimum Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.itemName}</TableCell>
                        <TableCell>{alert.currentStock}</TableCell>
                        <TableCell>{alert.minimumStock}</TableCell>
                        <TableCell>
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.severity === 'critical' ? 'Out of Stock' : 'Low Stock'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* All Items Stock Report */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Levels Report</CardTitle>
              <CardDescription>
                Current stock levels for all inventory items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Total Qty</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category?.name || 'Uncategorized'}</TableCell>
                      <TableCell>{item.totalQuantity}</TableCell>
                      <TableCell className="text-green-600">{item.availableQuantity}</TableCell>
                      <TableCell className="text-blue-600">{item.issuedQuantity}</TableCell>
                      <TableCell>${(item.unitCost || 0).toFixed(2)}</TableCell>
                      <TableCell>${((item.totalQuantity * (item.unitCost || 0))).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Issuances Report */}
        <TabsContent value="issuances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Property Issuance Summary
              </CardTitle>
              <CardDescription>
                Items issued to each property and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Total Items Issued</TableHead>
                    <TableHead>Estimated Value</TableHead>
                    <TableHead>Overdue Returns</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issuanceSummaries.map((summary) => (
                    <TableRow key={summary.propertyId}>
                      <TableCell className="font-medium">{summary.propertyName}</TableCell>
                      <TableCell>{summary.totalIssued}</TableCell>
                      <TableCell>${summary.totalValue.toLocaleString()}</TableCell>
                      <TableCell>
                        {summary.overdueItems > 0 ? (
                          <Badge variant="destructive">{summary.overdueItems}</Badge>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={summary.overdueItems > 0 ? "destructive" : "default"}>
                          {summary.overdueItems > 0 ? "Has Overdue" : "Current"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Movements Report */}
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Stock Movement History
              </CardTitle>
              <CardDescription>
                Recent inventory transactions and movements ({dateRange})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Stock movement tracking will be available once transaction data is integrated</p>
                <p className="text-sm mt-2">This will show purchases, issuances, returns, and adjustments</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
