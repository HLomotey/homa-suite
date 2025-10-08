import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Invoice } from "../types";
import { formatDate, getStatusVariant } from "../utils";

interface InvoiceTableProps {
  invoices: Invoice[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  selectedIds: string[];
  isLoading: boolean;
  error: Error | null;
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  onPageChange: (page: number) => void;
}

export function InvoiceTable({
  invoices,
  totalCount,
  currentPage,
  itemsPerPage,
  totalPages,
  selectedIds,
  isLoading,
  error,
  onSelectAll,
  onSelectItem,
  onPageChange,
}: InvoiceTableProps) {
  if (isLoading) {
    return (
      <Card className="bg-background border-border">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading transactions...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-background border-border">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-red-500">
            Error loading transactions: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <CardTitle>Invoice Transactions</CardTitle>
        <CardDescription>
          View and manage financial invoice transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedIds.length === invoices.length &&
                    invoices.length > 0
                  }
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead>Client Name</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Invoice Status</TableHead>
              <TableHead>Item Description</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Tax 1 Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(invoice.id)}
                    onCheckedChange={(checked) =>
                      onSelectItem(invoice.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {invoice.client_name}
                </TableCell>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>{formatDate(invoice.date_issued)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(invoice.invoice_status)}>
                    {invoice.invoice_status}
                  </Badge>
                </TableCell>
                <TableCell
                  className="max-w-xs truncate"
                  title={invoice.item_description}
                >
                  {invoice.item_description}
                </TableCell>
                <TableCell className="text-right">
                  {invoice.quantity}
                </TableCell>
                <TableCell className="text-right">
                  {invoice.tax_1_type || "0"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
              {totalCount} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
