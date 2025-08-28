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
import { FrontendExternalStaff } from "@/integration/supabase/types/external-staff";
import { Plus, Search, Edit, Trash2, Upload, Download, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
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

  // Client-side filtering for search only - pagination and active/inactive filtering is done server-side
  const filteredStaff = externalStaff.filter((staff) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      staff["PAYROLL FIRST NAME"]?.toLowerCase().includes(searchLower) ||
      staff["PAYROLL LAST NAME"]?.toLowerCase().includes(searchLower) ||
      staff["JOB TITLE"]?.toLowerCase().includes(searchLower) ||
      staff["COMPANY CODE"]?.toLowerCase().includes(searchLower) ||
      staff["LOCATION"]?.toLowerCase().includes(searchLower) ||
      staff["BUSINESS UNIT"]?.toLowerCase().includes(searchLower)
    );
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
    // Export filtered data if there's a search term, otherwise export all current data
    exportToExcel(searchTerm ? filteredStaff : undefined);
  };

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
          <Button 
            variant="outline" 
            onClick={handleExportToExcel}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
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
      <ExternalStaffStats stats={stats} loading={statsLoading} />

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
                <CardTitle>Staff Information ({totalCount})</CardTitle>
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
