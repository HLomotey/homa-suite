import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useExternalStaff,
  StaffStatus,
  PaginationState,
  StaffStats,
} from "@/hooks/external-staff/useExternalStaff";
import { ExternalStaffSlideForm } from "@/components/external-staff/ExternalStaffSlideForm";
import { ExternalStaffExcelUpload } from "@/components/external-staff/ExternalStaffExcelUpload";
import { ExternalStaffStats } from "@/components/external-staff/ExternalStaffStats";
import { HistoricalExternalStaff } from "@/components/external-staff/HistoricalExternalStaff";
import { ExternalStaffExportDialog } from "@/components/external-staff/ExternalStaffExportDialog";
import { FrontendExternalStaff } from "@/integration/supabase/types/external-staff";
import { Plus, Search, Edit, Trash2, Upload, Download, CheckSquare, Square, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExternalStaff() {
  const {
    externalStaff,
    loading,
    statsLoading,
    totalCount,
    pagination,
    setPagination,
    status,
    setStatus,
    stats,
    createExternalStaff,
    updateExternalStaff,
    deleteExternalStaff,
    bulkDeleteExternalStaff,
    fetchStats,
    exportToExcel,
    exportData,
  } = useExternalStaff();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [editingStaff, setEditingStaff] = useState<
    FrontendExternalStaff | undefined
  >();
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [terminationPeriodFilter, setTerminationPeriodFilter] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Get date range bounds for filtering
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

  // Client-side filtering for search and date ranges
  const filteredStaff = externalStaff.filter((staff) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        staff["PAYROLL FIRST NAME"]?.toLowerCase().includes(searchLower) ||
        staff["PAYROLL LAST NAME"]?.toLowerCase().includes(searchLower) ||
        staff["JOB TITLE"]?.toLowerCase().includes(searchLower) ||
        staff["COMPANY CODE"]?.toLowerCase().includes(searchLower) ||
        staff["LOCATION"]?.toLowerCase().includes(searchLower) ||
        staff["BUSINESS UNIT"]?.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    // Date range filter based on hire date
    if (dateRangeFilter !== "all") {
      const bounds = getDateRangeBounds(dateRangeFilter);
      if (bounds && staff["HIRE DATE"]) {
        const hireDate = new Date(staff["HIRE DATE"]);
        if (hireDate < bounds.start || hireDate > bounds.end) {
          return false;
        }
      }
    }

    // Termination period filter
    if (terminationPeriodFilter !== "all") {
      const bounds = getDateRangeBounds(terminationPeriodFilter);
      if (bounds && staff["TERMINATION DATE"]) {
        const termDate = new Date(staff["TERMINATION DATE"]);
        if (termDate < bounds.start || termDate > bounds.end) {
          return false;
        }
      } else if (terminationPeriodFilter !== "all" && !staff["TERMINATION DATE"]) {
        // If filtering by termination period but staff has no termination date, exclude them
        return false;
      }
    }

    // Department filter
    if (selectedDepartment) {
      const staffDepartment = staff["HOME DEPARTMENT"] || staff["DEPARTMENT"];
      if (staffDepartment !== selectedDepartment) {
        return false;
      }
    }

    return true;
  });

  // Calculate pagination values
  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, pageIndex: newPage });
  };

  // Handle page size changes
  const handlePageSizeChange = (newSize: string) => {
    setPagination({ pageIndex: 0, pageSize: parseInt(newSize) });
  };

  // Handle status tab changes
  const handleStatusChange = (newStatus: StaffStatus) => {
    setStatus(newStatus);
    setPagination({ ...pagination, pageIndex: 0 }); // Reset to first page when changing tabs
  };

  const handleCreateStaff = async (data: Partial<FrontendExternalStaff>) => {
    setFormLoading(true);
    try {
      const result = await createExternalStaff(data);
      if (result) {
        setShowForm(false);
        setEditingStaff(undefined);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStaff = async (data: Partial<FrontendExternalStaff>) => {
    if (!editingStaff) return;

    setFormLoading(true);
    try {
      const result = await updateExternalStaff(editingStaff.id, data);
      if (result) {
        setShowForm(false);
        setEditingStaff(undefined);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Staff Member",
      description: "Are you sure you want to delete this external staff member? This action cannot be undone.",
      onConfirm: async () => {
        await deleteExternalStaff(id);
      },
    });
  };

  // Handle individual checkbox selection
  const handleStaffSelect = (staffId: string, checked: boolean) => {
    if (checked) {
      setSelectedStaffIds(prev => [...prev, staffId]);
    } else {
      setSelectedStaffIds(prev => prev.filter(id => id !== staffId));
    }
  };

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    setIsSelectAllChecked(checked);
    if (checked) {
      setSelectedStaffIds(filteredStaff.map(staff => staff.id));
    } else {
      setSelectedStaffIds([]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedStaffIds.length === 0) {
      toast.error("Please select staff members to delete");
      return;
    }

    setConfirmDialog({
      open: true,
      title: "Delete Multiple Staff Members",
      description: `Are you sure you want to delete ${selectedStaffIds.length} selected staff member${selectedStaffIds.length > 1 ? 's' : ''}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          // Use the optimized bulk delete function
          const result = await bulkDeleteExternalStaff(selectedStaffIds);
          
          if (result) {
            // Clear selections after successful deletion
            setSelectedStaffIds([]);
            setIsSelectAllChecked(false);
          }
        } catch (error) {
          console.error("Bulk delete error:", error);
          toast.error("Failed to delete some staff members");
        }
      },
    });
  };

  const handleEditStaff = (staff: FrontendExternalStaff) => {
    setEditingStaff(staff);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStaff(undefined);
  };

  const handleExportToExcel = () => {
    // Export filtered data if there's a search term or filters applied, otherwise export all current data
    const hasFilters = searchTerm || dateRangeFilter !== "all" || terminationPeriodFilter !== "all" || selectedDepartment;
    
    if (hasFilters) {
      // Export only the filtered data visible to the user
      exportToExcel(filteredStaff);
    } else {
      // Export all data for the current status tab
      exportToExcel();
    }
  };

  const handleAdvancedExport = (data: FrontendExternalStaff[], format: string, fields: string[]) => {
    exportData(data, format, fields);
  };

  // Get selected staff records for export dialog
  const selectedStaffRecords = externalStaff.filter(staff => selectedStaffIds.includes(staff.id));

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">External Staff</h1>
          <p className="text-muted-foreground">
            Manage external staff members and their information
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowExcelUpload(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import Excel
          </Button>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              onClick={handleExportToExcel}
              className="flex items-center gap-2"
              disabled={loading || filteredStaff.length === 0}
            >
              <Download className="h-4 w-4" />
              Quick Export
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowExportDialog(true)}
              className="flex items-center gap-2"
              disabled={loading || externalStaff.length === 0}
            >
              <Download className="h-4 w-4" />
              Advanced Export
            </Button>
          </div>
          {selectedStaffIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete ({selectedStaffIds.length})
            </Button>
          )}
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <ExternalStaffStats 
        stats={stats} 
        loading={statsLoading} 
        onDepartmentFilter={setSelectedDepartment}
        selectedDepartment={selectedDepartment}
        onStatusChange={(newStatus) => handleStatusChange(newStatus as StaffStatus)}
      />

      {/* Main Tabs for Current vs Historical */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current Staff</TabsTrigger>
          <TabsTrigger value="historical">Historical Records</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <CardTitle>Staff Information ({filteredStaff.length})</CardTitle>
                  {selectedDepartment && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Department: {selectedDepartment}
                    </Badge>
                  )}
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              {/* Date Range Filters */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filters</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hire Date Range Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hire Date Period</label>
                    <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                      <SelectTrigger>
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
                  </div>
                  
                  {/* Termination Period Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Termination Period</label>
                    <Select value={terminationPeriodFilter} onValueChange={setTerminationPeriodFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Staff</SelectItem>
                        <SelectItem value="this-week">Terminated This Week</SelectItem>
                        <SelectItem value="previous-week">Terminated Previous Week</SelectItem>
                        <SelectItem value="this-month">Terminated This Month</SelectItem>
                        <SelectItem value="previous-month">Terminated Previous Month</SelectItem>
                        <SelectItem value="current-month">Terminated Current Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs
                value={status}
                onValueChange={(value) => handleStatusChange(value as StaffStatus)}
                className="mb-6"
              >
                <TabsList>
                  <TabsTrigger value="all">All Staff</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="terminated">Terminated</TabsTrigger>
                </TabsList>
              </Tabs>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectAll(!isSelectAllChecked)}
                        className="p-0 h-6 w-6"
                      >
                        {isSelectAllChecked ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm
                          ? "No staff members found matching your search."
                          : "No external staff members found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStaffSelect(staff.id, !selectedStaffIds.includes(staff.id))}
                            className="p-0 h-6 w-6"
                          >
                            {selectedStaffIds.includes(staff.id) ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {staff["PAYROLL FIRST NAME"]}{" "}
                              {staff["PAYROLL LAST NAME"]}
                            </div>
                            {staff["PAYROLL MIDDLE NAME"] && (
                              <div className="text-sm text-muted-foreground">
                                Middle: {staff["PAYROLL MIDDLE NAME"]}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {staff["JOB TITLE"] && (
                              <div>{staff["JOB TITLE"]}</div>
                            )}
                            {staff["JOB CLASS"] && (
                              <div className="text-sm text-muted-foreground">
                                Class: {staff["JOB CLASS"]}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{staff["COMPANY CODE"] || "-"}</TableCell>
                        <TableCell>{staff["LOCATION"] || "-"}</TableCell>
                        <TableCell>
                          <div>
                            {staff["HOME PHONE"] && (
                              <div>{staff["HOME PHONE"]}</div>
                            )}
                            {staff["WORK PHONE"] &&
                              staff["WORK PHONE"] !== staff["HOME PHONE"] && (
                                <div className="text-sm text-muted-foreground">
                                  Work: {staff["WORK PHONE"]}
                                </div>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(staff["HIRE DATE"])}</TableCell>
                        <TableCell>
                          {staff["TERMINATION DATE"] ? (
                            <Badge variant="destructive">Terminated</Badge>
                          ) : (
                            <Badge variant="default">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStaff(staff)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStaff(staff.id)}
                              className="text-destructive hover:text-destructive"
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

              {/* Pagination and Items Per Page Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Items per page
                  </span>
                  <Select
                    value={pagination.pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue
                        placeholder={pagination.pageSize.toString()}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground mr-2">
                    Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
                    {Math.min(
                      (pagination.pageIndex + 1) * pagination.pageSize,
                      totalCount
                    )}{" "}
                    of {totalCount}
                  </span>

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handlePageChange(
                              Math.max(0, pagination.pageIndex - 1)
                            )
                          }
                          className={
                            pagination.pageIndex === 0
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {/* First Page */}
                      {pagination.pageIndex > 1 && (
                        <PaginationItem>
                          <PaginationLink onClick={() => handlePageChange(0)}>
                            1
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      {/* Ellipsis if needed */}
                      {pagination.pageIndex > 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {/* Previous Page */}
                      {pagination.pageIndex > 0 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() =>
                              handlePageChange(pagination.pageIndex - 1)
                            }
                          >
                            {pagination.pageIndex}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      {/* Current Page */}
                      <PaginationItem>
                        <PaginationLink isActive>
                          {pagination.pageIndex + 1}
                        </PaginationLink>
                      </PaginationItem>

                      {/* Next Page */}
                      {pagination.pageIndex < pageCount - 1 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() =>
                              handlePageChange(pagination.pageIndex + 1)
                            }
                          >
                            {pagination.pageIndex + 2}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      {/* Ellipsis if needed */}
                      {pagination.pageIndex < pageCount - 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {/* Last Page */}
                      {pagination.pageIndex < pageCount - 2 &&
                        pageCount > 1 && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(pageCount - 1)}
                            >
                              {pageCount}
                            </PaginationLink>
                          </PaginationItem>
                        )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handlePageChange(
                              Math.min(pageCount - 1, pagination.pageIndex + 1)
                            )
                          }
                          className={
                            pagination.pageIndex >= pageCount - 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical">
          <HistoricalExternalStaff />
        </TabsContent>
      </Tabs>

      <ExternalStaffSlideForm
        staff={editingStaff}
        onSubmit={editingStaff ? handleUpdateStaff : handleCreateStaff}
        onClose={handleCloseForm}
        open={showForm}
        loading={formLoading}
      />

      {showExcelUpload && (
        <ExternalStaffExcelUpload
          onClose={() => setShowExcelUpload(false)}
        />
      )}

      <ExternalStaffExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        allStaff={externalStaff}
        filteredStaff={filteredStaff}
        selectedStaff={selectedStaffRecords}
        onExport={handleAdvancedExport}
        currentStatus={status}
      />

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}
