/**
 * PropertyIssuanceView component
 * Shows items issued to a specific property
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import { useToast } from "../ui/use-toast";
import { 
  Search, 
  Package, 
  Calendar, 
  User, 
  MapPin, 
  ArrowLeft,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { FrontendInventoryPropertyIssuance, IssuanceStatus } from "../../integration/supabase/types/inventory";
import { useProperties } from "../../hooks/property/useProperties";

interface PropertyIssuanceViewProps {
  selectedPropertyId?: string;
  onPropertyChange: (propertyId: string) => void;
  onReturnItem?: (issuanceId: string) => void;
}

export function PropertyIssuanceView({
  selectedPropertyId,
  onPropertyChange,
  onReturnItem,
}: PropertyIssuanceViewProps) {
  const { toast } = useToast();
  const { properties } = useProperties();
  
  // Mock data - replace with actual hook when API is ready
  const [issuances, setIssuances] = useState<FrontendInventoryPropertyIssuance[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IssuanceStatus | "all">("all");

  // Get selected property details
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  // Filter issuances based on search and status
  const filteredIssuances = useMemo(() => {
    return issuances.filter(issuance => {
      const matchesSearch = !searchQuery || 
        (issuance.itemId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        issuance.issuedToPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issuance.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || issuance.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [issuances, searchQuery, statusFilter]);

  // Group issuances by status
  const issuancesByStatus = useMemo(() => {
    const groups = {
      issued: filteredIssuances.filter(i => i.status === 'Issued'),
      returned: filteredIssuances.filter(i => i.status === 'Returned'),
      overdue: filteredIssuances.filter(i => 
        i.status === 'Issued' && 
        i.expectedReturnDate && 
        new Date(i.expectedReturnDate) < new Date()
      ),
    };
    return groups;
  }, [filteredIssuances]);

  // Handle item return
  const handleReturnItem = async (issuanceId: string) => {
    try {
      // TODO: Implement return item API call
      console.log('Return item:', issuanceId);
      
      if (onReturnItem) {
        onReturnItem(issuanceId);
      }
      
      toast({
        title: "Item returned",
        description: "Item has been successfully returned to inventory.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to return item. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: IssuanceStatus, expectedReturnDate?: string) => {
    if (status === 'Returned') return 'default';
    if (status === 'Issued' && expectedReturnDate && new Date(expectedReturnDate) < new Date()) {
      return 'destructive';
    }
    return 'secondary';
  };

  // Get status display text
  const getStatusDisplay = (status: IssuanceStatus, expectedReturnDate?: string) => {
    if (status === 'Returned') return 'Returned';
    if (status === 'Issued' && expectedReturnDate && new Date(expectedReturnDate) < new Date()) {
      return 'Overdue';
    }
    return 'Issued';
  };

  if (!selectedPropertyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Property Item Assignments
          </CardTitle>
          <CardDescription>
            Select a property to view items issued to it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPropertyId || ""} onValueChange={onPropertyChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a property to view issued items" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Property Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPropertyChange("")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items Issued to {selectedProperty?.title}
                </CardTitle>
                <CardDescription>
                  Track and manage items assigned to this property
                </CardDescription>
              </div>
            </div>
            <Select value={selectedPropertyId} onValueChange={onPropertyChange}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Currently Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {issuancesByStatus.issued.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overdue Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {issuancesByStatus.overdue.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Returned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {issuancesByStatus.returned.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search items, person, or purpose..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as IssuanceStatus | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Issued">Issued</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Issuances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Issued Items</CardTitle>
          <CardDescription>
            {filteredIssuances.length} item{filteredIssuances.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredIssuances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items issued to this property</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued To</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Expected Return</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssuances.map((issuance) => (
                  <TableRow key={issuance.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">Item {issuance.itemId}</div>
                        <div className="text-sm text-muted-foreground">
                          Condition: {issuance.conditionAtIssuance}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{issuance.quantityIssued}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(issuance.status, issuance.expectedReturnDate)}>
                        {getStatusDisplay(issuance.status, issuance.expectedReturnDate)}
                        {issuance.status === 'Issued' && 
                         issuance.expectedReturnDate && 
                         new Date(issuance.expectedReturnDate) < new Date() && (
                          <AlertTriangle className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {issuance.issuedToPerson && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {issuance.issuedToPerson}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{issuance.purpose || '-'}</TableCell>
                    <TableCell>
                      {issuance.locationAtProperty && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {issuance.locationAtProperty}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {issuance.expectedReturnDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(issuance.expectedReturnDate).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {issuance.status === 'Issued' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReturnItem(issuance.id)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Return
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
