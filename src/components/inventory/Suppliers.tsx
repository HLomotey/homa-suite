/**
 * Suppliers component
 * Displays and manages inventory suppliers
 */

import { useState, useMemo, useEffect } from "react";
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
import { Search, AlertCircle, PlusCircle, Edit, Trash2, Phone, Mail } from "lucide-react";
import { fetchInventorySuppliers } from "../../hooks/inventory/api";
import { FrontendInventorySupplier } from "../../integration/supabase/types/inventory";
import { Skeleton } from "../ui/skeleton";

interface SuppliersProps {
  onAddSupplier: () => void;
  onEditSupplier: (supplierId: string) => void;
  onDeleteSupplier: (supplierId: string) => void;
}

export function Suppliers({
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
}: SuppliersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suppliers, setSuppliers] = useState<FrontendInventorySupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch suppliers
  useEffect(() => {
    const getSuppliers = async () => {
      setLoading(true);
      try {
        const data = await fetchInventorySuppliers();
        setSuppliers(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    getSuppliers();
  }, []);

  // Filter suppliers based on search query
  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];
    if (!searchQuery.trim()) return suppliers;

    const query = searchQuery.toLowerCase();
    return suppliers.filter((supplier) => {
      return (
        supplier.name.toLowerCase().includes(query) ||
        supplier.contactPerson?.toLowerCase().includes(query) ||
        supplier.email?.toLowerCase().includes(query) ||
        supplier.phone?.toLowerCase().includes(query) ||
        supplier.address?.toLowerCase().includes(query)
      );
    });
  }, [suppliers, searchQuery]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Suppliers</CardTitle>
            <CardDescription>
              Manage inventory suppliers for your properties
            </CardDescription>
          </div>
          <Button onClick={onAddSupplier} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" /> Add Supplier
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 text-red-500 bg-red-50 rounded-md mb-4">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load supplier data. Please try again.</p>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Details</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-6 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[120px]" />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-4 w-[120px]" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[180px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {searchQuery
                      ? "No suppliers match your search criteria"
                      : "No suppliers found. Add your first supplier!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson || "—"}</TableCell>
                    <TableCell>
                      {(supplier.email || supplier.phone) ? (
                        <div className="space-y-1">
                          {supplier.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{supplier.email}</span>
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{supplier.phone}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {supplier.address || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEditSupplier(supplier.id)}
                          title="Edit supplier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDeleteSupplier(supplier.id)}
                          title="Delete supplier"
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
