import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Download, RefreshCw, Activity, DollarSign, Users, TrendingUp, Calendar, Filter, AlertCircle, Plus } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import { useBillingLogs, useStaffWithBillingLogs } from "@/hooks/billing/useBillingLog";
import { BillingRow, PaymentStatus, BillingType } from "@/types/billing";
import { generateBillingForMonth } from "@/lib/billing/generateForMonth";
import { ManualBillingGenerator } from "@/components/billing/ManualBillingGenerator";
import { EditableBillingRow } from "@/components/billing/EditableBillingRow";
import { getBillingWindowsForMonth } from "@/lib/billing/semimonthly";

interface BillingLogProps {
  selectedStaffId?: string;
}

export const BillingLog: React.FC<BillingLogProps> = ({
  selectedStaffId,
}) => {
  // State for filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [billingPeriodFilter, setBillingPeriodFilter] = useState<string>("all");
  const [billingTypeFilter, setBillingTypeFilter] = useState<string>("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState({ searchQuery: "", tenantName: "" });
  const [terminationPeriodFilter, setTerminationPeriodFilter] = useState<string>("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // State for billing generation
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch billing logs
  const { data: billingRows, isLoading: logsLoading, error: logsError } = useBillingLogs({
    staffId: selectedStaffId,
  });

  // Fetch staff list
  const { data: staffList, isLoading: staffLoading, error: staffError } = useStaffWithBillingLogs();

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle billing generation
  const handleGenerateBilling = async () => {
    try {
      setIsGenerating(true);
      await generateBillingForMonth(parseInt(selectedYear), parseInt(selectedMonth));
      setIsGenerateDialogOpen(false);
      handleRefresh(); // Refresh the data after generation
    } catch (error) {
      console.error("Error generating billing:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate month options for the last 12 months and next 3 months
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = -12; i <= 3; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      options.push({
        value: `${year}-${month}`,
        label: monthName,
        year: year.toString(),
        month: month.toString()
      });
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();

  // Generate billing period options for the last 12 months
  const generateBillingPeriodOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = -12; i <= 0; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      // Generate first half (1st-15th)
      options.push({
        value: `${year}-${month.toString().padStart(2, '0')}-1`,
        label: `${monthName} (1st - 15th)`,
        year,
        month,
        period: 1
      });
      
      // Generate second half (16th-end)
      options.push({
        value: `${year}-${month.toString().padStart(2, '0')}-2`,
        label: `${monthName} (16th - End)`,
        year,
        month,
        period: 2
      });
    }
    
    return options.reverse(); // Show most recent first
  };

  const billingPeriodOptions = generateBillingPeriodOptions();

  // Get date range bounds
  const getDateRangeBounds = (range: string) => {
    const now = new Date();
    switch (range) {
      case "this-week":
        return {
          start: startOfWeek(now),
          end: endOfWeek(now)
        };
      case "previous-week":
        return {
          start: startOfWeek(subWeeks(now, 1)),
          end: endOfWeek(subWeeks(now, 1))
        };
      case "this-month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case "previous-month":
        return {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1))
        };
      case "current-month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      default:
        return null;
    }
  };

  // Filter billing rows based on search query and filters
  const filteredBillingRows = useMemo(() => {
    if (!billingRows) return [];
    
    return billingRows.filter((row) => {
      // Search filter
      const matchesSearch = !searchQuery || 
        row.tenantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.propertyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.roomName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Payment status filter
      const matchesStatus = typeFilter === "all" || row.paymentStatus === typeFilter;
      
      // Date range filter
      let matchesDateRange = true;
      if (dateRange !== "all") {
        const bounds = getDateRangeBounds(dateRange);
        if (bounds) {
          const periodStart = new Date(row.periodStart);
          const periodEnd = new Date(row.periodEnd);
          matchesDateRange = periodStart <= bounds.end && periodEnd >= bounds.start;
        }
      }
      
      // Billing period filter
      let matchesBillingPeriod = true;
      if (billingPeriodFilter !== "all") {
        const [year, month, period] = billingPeriodFilter.split('-');
        const billingYear = parseInt(year);
        const billingMonth = parseInt(month);
        const billingPeriodNum = parseInt(period);
        
        // Get the billing windows for the selected month
        const [firstWindow, secondWindow] = getBillingWindowsForMonth(billingYear, billingMonth);
        const selectedWindow = billingPeriodNum === 1 ? firstWindow : secondWindow;
        
        // Check if the row's period overlaps with the selected billing period
        const rowPeriodStart = new Date(row.periodStart);
        const rowPeriodEnd = new Date(row.periodEnd);
        const windowStart = selectedWindow.start.toJSDate();
        const windowEnd = selectedWindow.end.toJSDate();
        
        // Check for overlap: periods overlap if start1 <= end2 && start2 <= end1
        matchesBillingPeriod = 
          rowPeriodStart <= windowEnd && windowStart <= rowPeriodEnd;
      }
      
      // Billing type filter
      const matchesBillingType = billingTypeFilter === "all" || row.billingType === billingTypeFilter;
      
      // Termination period filter (placeholder for future implementation)
      const matchesTermination = terminationPeriodFilter === "all"; // TODO: Implement termination filtering
      
      return matchesSearch && matchesStatus && matchesDateRange && matchesBillingPeriod && matchesBillingType && matchesTermination;
    });
  }, [billingRows, searchQuery, typeFilter, dateRange, billingPeriodFilter, billingTypeFilter, terminationPeriodFilter]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return filteredBillingRows.reduce((sum, billingRow) => sum + billingRow.rentAmount, 0);
  }, [filteredBillingRows]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredBillingRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBillingRows = filteredBillingRows.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, dateRange, billingPeriodFilter, billingTypeFilter, terminationPeriodFilter]);

  const handleExport = () => {
    const csvContent = [
      ["Tenant Name", "Property", "Room", "Amount", "Billing Type", "Payment Status", "Assignment Status", "End Date", "Period Start", "Period End"].join(","),
      ...filteredBillingRows.map(billingRow => [
        billingRow.tenantName,
        billingRow.propertyName,
        billingRow.roomName || "",
        billingRow.rentAmount,
        billingRow.billingType,
        billingRow.paymentStatus,
        billingRow.assignmentStatus || "Unknown",
        (billingRow.assignmentEndDate && 
         (billingRow.assignmentStatus === "Expired" || billingRow.assignmentStatus === "Terminated")) 
          ? billingRow.assignmentEndDate : "",
        billingRow.periodStart,
        billingRow.periodEnd
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `billing-records-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Billing Log</h2>
          <p className="text-white/60">Comprehensive log of all staff billing records</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Generate Billing
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/95 border-white/20 max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Generate Billing Records</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <ManualBillingGenerator 
                  onBillingGenerated={(count) => {
                    setIsGenerateDialogOpen(false);
                    handleRefresh();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-white/60">Number of Tenants</p>
                <p className="text-2xl font-bold text-white">{filteredBillingRows.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-white/60">Total Amount</p>
                <p className="text-2xl font-bold text-white">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-white/60">Staff Members</p>
                <p className="text-2xl font-bold text-white">{filteredBillingRows.length > 0 ? new Set(filteredBillingRows.map(b => b.tenantId)).size : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-white/60">Most Common Status</p>
                <p className="text-lg font-bold text-white">
                  {filteredBillingRows.length > 0 
                    ? Object.entries(filteredBillingRows.reduce((acc, b) => {
                        acc[b.paymentStatus] = (acc[b.paymentStatus] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search billing records..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Tenant Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Filter by tenant name..."
                value={filters.tenantName}
                onChange={(e) => setFilters(prev => ({ ...prev, tenantName: e.target.value }))}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Staff Filter */}
            <Select value={selectedStaffId || "all"} onValueChange={(value) => {
                // Handle staff selection if needed
                console.log('Staff selected:', value === "all" ? "" : value);
              }}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {staffList?.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                )) || null}
              </SelectContent>
            </Select>

            {/* Payment Status Filter */}
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as "all" | PaymentStatus)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="waived">Waived</SelectItem>
              </SelectContent>
            </Select>


            {/* Date Range Filter */}
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as typeof dateRange)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="previous-week">Previous Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="previous-month">Previous Month</SelectItem>
                <SelectItem value="current-month">Current Month</SelectItem>
              </SelectContent>
            </Select>

            {/* Billing Period Filter */}
            <Select value={billingPeriodFilter} onValueChange={(value) => setBillingPeriodFilter(value)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Billing Periods" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">All Billing Periods</SelectItem>
                {billingPeriodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Billing Type Filter */}
            <Select value={billingTypeFilter} onValueChange={(value) => setBillingTypeFilter(value)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="housing">Housing</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="security_deposit">Security Deposit</SelectItem>
                <SelectItem value="bus_card">Bus Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Log Table */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Billing History</CardTitle>
          <CardDescription className="text-white/60">
            {filteredBillingRows.length} billing records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading || staffLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-white/60" />
              <span className="ml-2 text-white/60">Loading billing records...</span>
            </div>
          ) : logsError || staffError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-white/80 font-medium">Error loading billing data</p>
              <p className="text-white/60 mt-2">{logsError?.message || staffError?.message || 'Please try refreshing the page'}</p>
            </div>
          ) : filteredBillingRows.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No billing records found matching your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/80">Tenant Name</TableHead>
                    <TableHead className="text-white/80">Property</TableHead>
                    <TableHead className="text-white/80">Room</TableHead>
                    <TableHead className="text-white/80">Amount</TableHead>
                    <TableHead className="text-white/80">Type</TableHead>
                    <TableHead className="text-white/80">Payment Status</TableHead>
                    <TableHead className="text-white/80">Assignment Status</TableHead>
                    <TableHead className="text-white/80">End Date</TableHead>
                    <TableHead className="text-white/80">Period</TableHead>
                    <TableHead className="text-white/80">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBillingRows.map((billingRow) => (
                    <EditableBillingRow
                      key={billingRow.id}
                      billingRow={billingRow}
                      onUpdate={handleRefresh}
                      onDelete={handleRefresh}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredBillingRows.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">Rows per page:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-20 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-white/60">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredBillingRows.length)} of {filteredBillingRows.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Previous
                </Button>
                <span className="text-sm text-white/60 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
