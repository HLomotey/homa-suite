import React, { useState } from "react";
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
import { useHistoricalExternalStaff } from "@/hooks/external-staff/useHistoricalExternalStaff";
import { FrontendHistoryExternalStaff } from "@/integration/supabase/types/external-staff";
import { Search, History, Calendar } from "lucide-react";
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

export function HistoricalExternalStaff() {
  const {
    historicalStaff,
    loading,
    totalCount,
    pagination,
    setPagination,
  } = useHistoricalExternalStaff();
  
  const [searchTerm, setSearchTerm] = useState("");

  // Client-side filtering for search
  const filteredStaff = historicalStaff.filter((staff) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      staff["PAYROLL FIRST NAME"]?.toLowerCase().includes(searchLower) ||
      staff["PAYROLL LAST NAME"]?.toLowerCase().includes(searchLower) ||
      staff["JOB TITLE"]?.toLowerCase().includes(searchLower) ||
      staff["COMPANY CODE"]?.toLowerCase().includes(searchLower) ||
      staff["LOCATION"]?.toLowerCase().includes(searchLower) ||
      staff["BUSINESS UNIT"]?.toLowerCase().includes(searchLower) ||
      staff["ASSOCIATE ID"]?.toLowerCase().includes(searchLower)
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <History className="h-4 w-4" />
        <span className="text-sm">
          Historical records are created when key fields (Job Title, Department, Location, Position Status) change
        </span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historical External Staff Records ({totalCount})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search historical records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Associate ID</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Position Status</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Archived Date</TableHead>
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
                          ? "No historical records found matching your search."
                          : "No historical external staff records found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((staff) => (
                      <TableRow key={staff.id}>
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
                          <div className="font-mono text-sm">
                            {staff["ASSOCIATE ID"] || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {staff["JOB TITLE"] && (
                              <div className="font-medium">{staff["JOB TITLE"]}</div>
                            )}
                            {staff["JOB CLASS"] && (
                              <div className="text-sm text-muted-foreground">
                                Class: {staff["JOB CLASS"]}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {staff["HOME DEPARTMENT"] && (
                              <div>{staff["HOME DEPARTMENT"]}</div>
                            )}
                            {staff["BUSINESS UNIT"] && (
                              <div className="text-sm text-muted-foreground">
                                Unit: {staff["BUSINESS UNIT"]}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{staff["LOCATION"] || "-"}</TableCell>
                        <TableCell>
                          {staff["POSITION STATUS"] ? (
                            <Badge 
                              variant={
                                staff["POSITION STATUS"]?.toLowerCase().includes("active") 
                                  ? "default" 
                                  : staff["POSITION STATUS"]?.toLowerCase().includes("terminated")
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {staff["POSITION STATUS"]}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{staff["COMPANY CODE"] || "-"}</TableCell>
                        <TableCell>{formatDate(staff["HIRE DATE"])}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDateTime(staff.created_at)}</div>
                            <div className="text-muted-foreground">
                              (Archived)
                            </div>
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
    </div>
  );
}
