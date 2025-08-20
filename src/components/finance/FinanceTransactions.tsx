import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { ROUTES } from "@/routes/constants";
import { Upload, Trash2, Loader2, Search, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integration/supabase/client";
import { toast } from "sonner";

interface Invoice {
  id: string;
  client_name: string;
  invoice_number: string;
  date_issued: string;
  invoice_status: string;
  item_description: string;
  quantity: number;
  tax_1_type: string | null;
  line_total: string;
  currency: string;
}

export function FinanceTransactions() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Fetch invoices with pagination and search
  const {
    data: invoicesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["finance-invoices", currentPage, itemsPerPage, searchTerm],
    queryFn: async () => {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;

      let query = supabase
        .from("finance_invoices")
        .select("*", { count: "exact" })
        .order("date_issued", { ascending: false });

      // Apply search filter if search term exists
      if (searchTerm.trim()) {
        query = query.or(
          `invoice_number.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,invoice_status.ilike.%${searchTerm}%,item_description.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query.range(start, end);

      if (error) throw error;
      return { invoices: data as Invoice[], totalCount: count || 0 };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("finance_invoices")
        .delete()
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["finance-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["revenue-metrics"] });
      setSelectedIds([]);
      toast.success(`Successfully deleted ${selectedIds.length} invoice(s)`);
    },
    onError: (error) => {
      toast.error(`Failed to delete invoices: ${error.message}`);
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && invoicesData?.invoices) {
      setSelectedIds(invoicesData.invoices.map((inv) => inv.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedIds.length} invoice(s)? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(selectedIds);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleExport = async () => {
    try {
      // Fetch all data for export (without pagination)
      let query = supabase
        .from("finance_invoices")
        .select("*")
        .order("date_issued", { ascending: false });

      if (searchTerm.trim()) {
        query = query.or(
          `invoice_number.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,invoice_status.ilike.%${searchTerm}%,item_description.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      // Convert to CSV
      const headers = [
        "Client Name",
        "Invoice #",
        "Date",
        "Invoice Status",
        "Item Description",
        "Quantity",
        "Tax 1 Type",
        "Amount",
        "Currency",
      ];
      const csvContent = [
        headers.join(","),
        ...data.map((invoice) =>
          [
            `"${invoice.client_name}"`,
            `"${invoice.invoice_number}"`,
            `"${formatDate(invoice.date_issued)}"`,
            `"${invoice.invoice_status}"`,
            `"${invoice.item_description}"`,
            `"${invoice.quantity}"`,
            `"${invoice.tax_1_type || "N/A"}"`,

            `"${invoice.currency}"`,
          ].join(",")
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `finance_transactions_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Transactions exported successfully");
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  const formatCurrency = (value: string): string => {
    const num = parseFloat(value);
    return `$${num.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      case "sent":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Financial Transactions
        </h2>
        <Card className="bg-background border-border">
          <CardContent className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading transactions...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Financial Transactions
        </h2>
        <Card className="bg-background border-border">
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-red-500">
              Error loading transactions: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { invoices = [], totalCount = 0 } = invoicesData || {};
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Financial Transactions
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage invoices and financial transactions ({totalCount} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {selectedIds.length} item
              {selectedIds.length > 1 ? "s" : ""}
            </Button>
          )}
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button asChild variant="default">
            <Link
              to={ROUTES.FINANCE_UPLOAD}
              className="flex items-center gap-2"
            >
              <Upload size={16} />
              Upload Transactions
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">per page</span>
        </div>
      </div>

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
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Invoice Status</TableHead>
                <TableHead>Item Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Tax 1 Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(invoice.id)}
                      onCheckedChange={(checked) =>
                        handleSelectItem(invoice.id, checked as boolean)
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
                  <TableCell className="text-center">
                    {invoice.quantity}
                  </TableCell>
                  <TableCell>{invoice.tax_1_type || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(invoice.line_total)}
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
