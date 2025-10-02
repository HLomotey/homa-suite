/**
 * Complaint list component for displaying and filtering complaints
 */

import React, { useState, useEffect } from "react";
import { useComplaints } from "@/hooks/complaints";
import { ComplaintStatus, ComplaintPriority, ComplaintAssetType } from "@/integration/supabase/types/complaints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Loader2, Search, Filter, Plus, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth";
import { ComplaintForm } from "./ComplaintForm";

// Status badge colors
const statusColors: Record<ComplaintStatus, string> = {
  open: "bg-blue-500",
  in_progress: "bg-yellow-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
  escalated: "bg-red-500",
};

// Extended status colors for UI display (includes non-standard statuses)
const extendedStatusColors: Record<string, string> = {
  ...statusColors,
  reopened: "bg-red-500",
};

// Priority badge colors
const priorityColors: Record<ComplaintPriority, string> = {
  low: "bg-gray-400",
  medium: "bg-blue-400",
  high: "bg-orange-500",
  urgent: "bg-red-600",
};

// Extended priority colors for UI display (includes non-standard priorities)
const extendedPriorityColors: Record<string, string> = {
  ...priorityColors,
  critical: "bg-red-600",
};

interface ComplaintListProps {
  onCreateNew?: () => void;
  onViewDetail?: (id: string) => void;
}

export function ComplaintList({ onCreateNew, onViewDetail }: ComplaintListProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Sheet state for slide-in form
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<ComplaintPriority | "all">("all");
  const [assetTypeFilter, setAssetTypeFilter] = useState<ComplaintAssetType | "all">("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Build filters for the API
  const buildFilters = () => {
    const filters: any = {};
    
    if (searchQuery) {
      filters.search = searchQuery;
    }
    
    if (statusFilter !== "all") {
      filters.status = statusFilter;
    }
    
    if (priorityFilter !== "all") {
      filters.priority = priorityFilter;
    }
    
    if (assetTypeFilter !== "all") {
      filters.assetType = assetTypeFilter;
    }
    
    // If user is not an admin, only show their complaints
    // Check for admin role in user metadata
    const isAdmin = currentUser?.user?.app_metadata?.role === 'admin' || currentUser?.user?.user_metadata?.isAdmin;
    if (currentUser && !isAdmin) {
      filters.createdBy = currentUser.user.id;
    }
    
    return filters;
  };
  
  // Fetch complaints with filters
  const { complaints, isLoading, refetch } = useComplaints(buildFilters());
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, assetTypeFilter]);
  
  // Calculate pagination
  const totalItems = complaints?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedComplaints = complaints?.slice(startIndex, endIndex) || [];
  
  // Handle view detail
  const handleViewDetail = (id: string) => {
    if (onViewDetail) {
      onViewDetail(id);
    } else {
      navigate(`/complaints/${id}`);
    }
  };

  // Handle create new complaint
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      setIsFormOpen(true);
    }
  };

  // Handle form success
  const handleFormSuccess = (id: string) => {
    setIsFormOpen(false);
    refetch(); // Refresh the complaints list
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsFormOpen(false);
  };
  
  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // Show ellipsis if current page is far from start
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Always show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              isActive={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    
    return items;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Complaints</CardTitle>
            <CardDescription>
              View and manage all complaints in the system
            </CardDescription>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Complaint
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ComplaintStatus | "all")}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as ComplaintPriority | "all")}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={assetTypeFilter}
              onValueChange={(value) => setAssetTypeFilter(value as ComplaintAssetType | "all")}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Complaints Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading complaints...</span>
          </div>
        ) : complaints && complaints.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedComplaints.map((complaint) => (
                  <TableRow 
                    key={complaint.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewDetail(complaint.id)}
                  >
                    <TableCell className="font-medium">
                      {complaint.title}
                      {complaint.slaBreach && (
                        <Badge variant="destructive" className="ml-2">SLA Breach</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[complaint.status]}>
                        {complaint.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[complaint.priority]}>
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          {complaint.assetType}
                        </span>
                        <span>{complaint.assetName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{complaint.categoryName}</TableCell>
                    <TableCell>
                      {complaint.assignedToName || 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      {complaint.createdAt ? format(new Date(complaint.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {complaint.dueDate ? format(new Date(complaint.dueDate), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No complaints found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all" || priorityFilter !== "all" || assetTypeFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "No complaints have been submitted yet"}
            </p>
            <Button onClick={handleCreateNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create New Complaint
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Pagination */}
      {complaints && complaints.length > itemsPerPage && (
        <CardFooter>
          <Pagination className="w-full justify-center">
            <PaginationContent>
              <PaginationPrevious
                onClick={() => currentPage > 1 && setCurrentPage((prev) => Math.max(1, prev - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
              
              {renderPaginationItems()}
              
              <PaginationNext
                onClick={() => currentPage < totalPages && setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}

      {/* Slide-in Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full p-0">
          <ComplaintForm 
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </SheetContent>
      </Sheet>
    </Card>
  );
}
