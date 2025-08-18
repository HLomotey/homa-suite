import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, RefreshCw, Activity, DollarSign, Users, TrendingUp, Calendar, Filter, AlertCircle } from "lucide-react";
import { format, subDays } from "date-fns";
import { useStaffTransactionLogs, useStaffWithTransactionLogs } from "@/hooks/staffTransactionLog/useStaffTransactionLog";
import { 
  FrontendStaffTransactionLog,
  getTransactionTypeDisplayName,
  getTransactionCategoryDisplayName,
  getTransactionTypeColor,
  getTransactionCategoryBadgeColor
} from "@/integration/supabase/types/staffTransactionLog";

interface StaffTransactionLogProps {
  selectedStaffId?: string;
}

export const StaffTransactionLog: React.FC<StaffTransactionLogProps> = ({
  selectedStaffId,
}) => {
  // State for filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch staff transaction logs
  const { data: transactions, isLoading: logsLoading, error: logsError } = useStaffTransactionLogs({
    staffId: selectedStaffId,
  });

  // Fetch staff list
  const { data: staffList, isLoading: staffLoading, error: staffError } = useStaffWithTransactionLogs();

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(transaction => {
      // Search filter
      const matchesSearch = 
        searchQuery === "" ||
        transaction.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.performedByName && transaction.performedByName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Type filter
      const matchesType = typeFilter === "all" || transaction.transactionType === typeFilter;
      
      // Category filter
      const matchesCategory = categoryFilter === "all" || transaction.transactionCategory === categoryFilter;
      
      // Date filter
      let matchesDate = true;
      if (dateRange !== "all") {
        const transactionDate = new Date(transaction.timestamp);
        const now = new Date();
        
        if (dateRange === "today") {
          matchesDate = transactionDate.toDateString() === now.toDateString();
        } else if (dateRange === "week") {
          matchesDate = transactionDate >= subDays(now, 7);
        } else if (dateRange === "month") {
          matchesDate = transactionDate >= subDays(now, 30);
        }
      }
      
      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter, dateRange]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
  }, [filteredTransactions]);

  const handleExport = () => {
    const csvContent = [
      ["Date", "Staff", "Type", "Category", "Description", "Amount", "Performed By"].join(","),
      ...filteredTransactions.map(transaction => [
        new Date(transaction.timestamp).toLocaleDateString(),
        transaction.staffName,
        transaction.transactionType,
        transaction.transactionCategory,
        `"${transaction.description.replace(/"/g, '""')}"`,
        transaction.amount || 0,
        transaction.performedByName || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `staff-transactions-${new Date().toISOString().split('T')[0]}.csv`);
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
          <h2 className="text-3xl font-bold text-white">Staff Transaction Log</h2>
          <p className="text-white/60">Comprehensive log of all staff-related activities</p>
        </div>
        <div className="flex gap-2">
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
                <p className="text-sm text-white/60">Total Transactions</p>
                <p className="text-2xl font-bold text-white">{filteredTransactions.length}</p>
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
                <p className="text-2xl font-bold text-white">{filteredTransactions.length > 0 ? new Set(filteredTransactions.map(t => t.staffId)).size : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-white/60">Most Active Type</p>
                <p className="text-lg font-bold text-white">
                  {filteredTransactions.length > 0 
                    ? Object.entries(filteredTransactions.reduce((acc, t) => {
                        acc[t.transactionType] = (acc[t.transactionType] || 0) + 1;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

            {/* Transaction Type Filter */}
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as "all" | "billing" | "payroll" | "assignment" | "profile_update" | "system")}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="profile_update">Profile Update</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as "all" | "payment" | "salary" | "bonus" | "deduction" | "room_change" | "status_change")}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
                <SelectItem value="deduction">Deduction</SelectItem>
                <SelectItem value="room_change">Room Change</SelectItem>
                <SelectItem value="status_change">Status Change</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as typeof dateRange)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Log Table */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Transaction History</CardTitle>
          <CardDescription className="text-white/60">
            {filteredTransactions.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading || staffLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-white/60" />
              <span className="ml-2 text-white/60">Loading transactions...</span>
            </div>
          ) : logsError || staffError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-white/80 font-medium">Error loading transaction data</p>
              <p className="text-white/60 mt-2">{logsError?.message || staffError?.message || 'Please try refreshing the page'}</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No transactions found matching your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/80">Date</TableHead>
                    <TableHead className="text-white/80">Time</TableHead>
                    <TableHead className="text-white/80">Staff Member</TableHead>
                    <TableHead className="text-white/80">Type</TableHead>
                    <TableHead className="text-white/80">Category</TableHead>
                    <TableHead className="text-white/80">Description</TableHead>
                    <TableHead className="text-white/80">Amount</TableHead>
                    <TableHead className="text-white/80">Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-white/90">
                        {format(new Date(transaction.timestamp), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-white/90">
                        {format(new Date(transaction.timestamp), "HH:mm")}
                      </TableCell>
                      <TableCell className="text-white/90 font-medium">
                        {transaction.staffName}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getTransactionTypeColor(transaction.transactionType)}
                        >
                          {getTransactionTypeDisplayName(transaction.transactionType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTransactionCategoryBadgeColor(transaction.transactionCategory)}>
                          {getTransactionCategoryDisplayName(transaction.transactionCategory)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/90 max-w-md">
                        <div className="truncate" title={transaction.description}>
                          {transaction.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/90">
                        {transaction.amount ? (
                          <span className="font-medium">
                            ${transaction.amount.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-white/40">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-white/60">
                        {transaction.performedByName}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
