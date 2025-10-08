import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Eye, Calendar, DollarSign, User, FileText } from "lucide-react";

interface Invoice {
  id: string;
  client_name: string;
  invoice_number: string;
  line_total: number;
  date_issued: string;
  due_date?: string;
  invoice_status: string;
  tax_1_type?: string;
  description?: string;
}

interface InvoiceDetailsListProps {
  invoices: Invoice[];
  loading?: boolean;
  onInvoiceSelect?: (invoice: Invoice) => void;
}

export const InvoiceDetailsList: React.FC<InvoiceDetailsListProps> = ({
  invoices,
  loading = false,
  onInvoiceSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_issued');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = 
        invoice.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.invoice_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort invoices
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Invoice];
      let bValue: any = b[sortBy as keyof Invoice];

      if (sortBy === 'line_total') {
        aValue = parseFloat(aValue?.toString() || '0');
        bValue = parseFloat(bValue?.toString() || '0');
      } else if (sortBy === 'date_issued' || sortBy === 'due_date') {
        aValue = new Date(aValue || '').getTime();
        bValue = new Date(bValue || '').getTime();
      } else {
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [invoices, searchTerm, statusFilter, sortBy, sortOrder]);

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedInvoices, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedInvoices.length / itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-900/40 text-green-300 border-green-800/50', label: 'Paid' },
      pending: { color: 'bg-yellow-900/40 text-yellow-300 border-yellow-800/50', label: 'Pending' },
      overdue: { color: 'bg-red-900/40 text-red-300 border-red-800/50', label: 'Overdue' },
      sent: { color: 'bg-blue-900/40 text-blue-300 border-blue-800/50', label: 'Sent' },
      draft: { color: 'bg-gray-900/40 text-gray-300 border-gray-800/50', label: 'Draft' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
      { color: 'bg-gray-900/40 text-gray-300 border-gray-800/50', label: status };

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getAgingDays = (dateIssued: string) => {
    const today = new Date();
    const issueDate = new Date(dateIssued);
    return Math.floor((today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getAgingBadge = (days: number) => {
    if (days <= 30) return <Badge className="bg-green-900/40 text-green-300 border-green-800/50">Current</Badge>;
    if (days <= 60) return <Badge className="bg-yellow-900/40 text-yellow-300 border-yellow-800/50">31-60 days</Badge>;
    if (days <= 90) return <Badge className="bg-orange-900/40 text-orange-300 border-orange-800/50">61-90 days</Badge>;
    return <Badge className="bg-red-900/40 text-red-300 border-red-800/50">90+ days</Badge>;
  };

  const uniqueStatuses = [...new Set(invoices.map(inv => inv.invoice_status))];

  if (loading) {
    return (
      <Card className="bg-[#0a101f] border border-blue-900/30">
        <CardHeader>
          <CardTitle className="text-white">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-blue-800/20 rounded"></div>
            <div className="h-64 bg-blue-800/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0a101f] border border-blue-900/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-400" />
            Invoice Details ({filteredAndSortedInvoices.length} invoices)
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="bg-blue-800 hover:bg-blue-700 text-white border-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
              <Input
                placeholder="Search by client, invoice number, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-blue-900/20 border-blue-800/50 text-white placeholder-blue-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-blue-900/20 border-blue-800/50 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a101f] border-blue-800/50">
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status} className="text-white">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-blue-900/20 border-blue-800/50 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a101f] border-blue-800/50">
                <SelectItem value="date_issued" className="text-white">Date Issued</SelectItem>
                <SelectItem value="line_total" className="text-white">Amount</SelectItem>
                <SelectItem value="client_name" className="text-white">Client</SelectItem>
                <SelectItem value="invoice_status" className="text-white">Status</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-blue-800 hover:bg-blue-700 text-white border-blue-700"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border border-blue-800/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-blue-800/50 hover:bg-blue-900/20">
                <TableHead className="text-blue-300">Invoice #</TableHead>
                <TableHead className="text-blue-300">Client</TableHead>
                <TableHead className="text-blue-300">Amount</TableHead>
                <TableHead className="text-blue-300">Date Issued</TableHead>
                <TableHead className="text-blue-300">Status</TableHead>
                <TableHead className="text-blue-300">Aging</TableHead>
                <TableHead className="text-blue-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((invoice) => {
                const agingDays = getAgingDays(invoice.date_issued);
                return (
                  <TableRow 
                    key={invoice.id} 
                    className="border-blue-800/50 hover:bg-blue-900/20 cursor-pointer"
                    onClick={() => onInvoiceSelect?.(invoice)}
                  >
                    <TableCell className="text-white font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-blue-400" />
                        {invoice.client_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-semibold">
                      {formatCurrency(parseFloat(invoice.line_total?.toString() || '0'))}
                    </TableCell>
                    <TableCell className="text-blue-300">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                        {formatDate(invoice.date_issued)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.invoice_status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getAgingBadge(agingDays)}
                        <div className="text-xs text-blue-400">{agingDays} days</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInvoiceSelect?.(invoice);
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-blue-300 text-sm">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedInvoices.length)} of {filteredAndSortedInvoices.length} invoices
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="bg-blue-800 hover:bg-blue-700 text-white border-blue-700 disabled:opacity-50"
              >
                Previous
              </Button>
              <span className="text-blue-300 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="bg-blue-800 hover:bg-blue-700 text-white border-blue-700 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceDetailsList;
