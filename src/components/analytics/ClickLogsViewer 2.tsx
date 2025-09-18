import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Download, Search, X } from "lucide-react";
import { ClickLogService } from "@/integration/supabase/services/clickLogService";
import { FrontendClickLog } from "@/integration/supabase/types/click-logs";
import { useAuth } from "@/components/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

export function ClickLogsViewer() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [clickLogs, setClickLogs] = useState<FrontendClickLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<FrontendClickLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;
  
  // Filter state
  const [filters, setFilters] = useState({
    userId: '',
    startDate: '',
    endDate: '',
    action: '',
    componentName: ''
  });
  
  // Date picker state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  const clickLogService = ClickLogService.getInstance();
  
  // Check if user has permission to view logs
  const canViewAllLogs = hasPermission('admin.view_logs');
  
  // Fetch logs based on current filters and pagination
  const fetchLogs = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let logs: FrontendClickLog[] = [];
      
      if (canViewAllLogs) {
        // Admin can search all logs with filters
        logs = await clickLogService.searchClickLogs({
          userId: filters.userId || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          action: filters.action || undefined,
          componentName: filters.componentName || undefined,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage
        });
      } else {
        // Regular users can only see their own logs
        logs = await clickLogService.fetchUserClickLogs(
          user.id,
          itemsPerPage,
          (currentPage - 1) * itemsPerPage
        );
      }
      
      setClickLogs(logs);
      
      // For simplicity, we're setting a fixed number of pages
      // In a real app, you'd calculate this based on total count from the API
      setTotalPages(Math.ceil(logs.length / itemsPerPage) || 1);
    } catch (err) {
      setError('Failed to fetch click logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch on component mount
  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user, currentPage]);
  
  // Apply filters
  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    fetchLogs();
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      userId: '',
      startDate: '',
      endDate: '',
      action: '',
      componentName: ''
    });
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
    fetchLogs();
  };
  
  // Handle date selection
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setFilters({
        ...filters,
        startDate: format(date, 'yyyy-MM-dd')
      });
    }
    setStartDateOpen(false);
  };
  
  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      setFilters({
        ...filters,
        endDate: format(date, 'yyyy-MM-dd')
      });
    }
    setEndDateOpen(false);
  };
  
  // View log details
  const handleViewDetails = (log: FrontendClickLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };
  
  // Export logs as CSV
  const handleExportCSV = () => {
    if (!clickLogs.length) return;
    
    // Create CSV content
    const headers = [
      'ID', 'User ID', 'Timestamp', 'IP Address', 'Country', 'City',
      'URL', 'Element ID', 'Element Class', 'Action', 'Component', 'Page Title'
    ];
    
    const csvRows = [
      headers.join(','),
      ...clickLogs.map(log => [
        log.id,
        log.userId,
        log.timestamp,
        log.ipAddress || '',
        log.location?.country || '',
        log.location?.city || '',
        log.url || '',
        log.elementId || '',
        log.elementClass || '',
        log.action || '',
        log.componentName || '',
        log.pageTitle || ''
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `click-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch (e) {
      return timestamp;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Click Logs</CardTitle>
          <CardDescription>
            View and analyze user interactions across the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {canViewAllLogs && (
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={filters.userId}
                  onChange={(e) => setFilters({...filters, userId: e.target.value})}
                  placeholder="Filter by user ID"
                />
              </div>
            )}
            
            <div>
              <Label>Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>End Date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                value={filters.action}
                onChange={(e) => setFilters({...filters, action: e.target.value})}
                placeholder="Filter by action"
              />
            </div>
            
            <div>
              <Label htmlFor="componentName">Component</Label>
              <Input
                id="componentName"
                value={filters.componentName}
                onChange={(e) => setFilters({...filters, componentName: e.target.value})}
                placeholder="Filter by component"
              />
            </div>
          </div>
          
          <div className="flex justify-between mb-6">
            <div className="flex space-x-2">
              <Button onClick={handleApplyFilters} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleResetFilters} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
            
            <Button variant="outline" onClick={handleExportCSV} disabled={loading || !clickLogs.length}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {/* Logs table */}
          {loading ? (
            <div className="text-center py-8">Loading click logs...</div>
          ) : clickLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No click logs found matching the current filters
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    {canViewAllLogs && <TableHead>User</TableHead>}
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead className="w-[100px]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clickLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                      {canViewAllLogs && <TableCell className="font-mono text-xs">{log.userId.substring(0, 8)}...</TableCell>}
                      <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                      <TableCell>
                        {log.location ? `${log.location.city || ''}, ${log.location.country || ''}` : 'N/A'}
                      </TableCell>
                      <TableCell>{log.action || 'N/A'}</TableCell>
                      <TableCell>{log.componentName || 'N/A'}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={log.pageTitle || ''}>
                        {log.pageTitle || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && clickLogs.length > 0 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Log details dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Click Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user interaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Timestamp</h4>
                  <p>{formatTimestamp(selectedLog.timestamp)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">User ID</h4>
                  <p className="font-mono text-xs">{selectedLog.userId}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">IP Address</h4>
                  <p>{selectedLog.ipAddress || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                  <p>
                    {selectedLog.location ? (
                      <>
                        {selectedLog.location.city && `${selectedLog.location.city}, `}
                        {selectedLog.location.region && `${selectedLog.location.region}, `}
                        {selectedLog.location.country || 'Unknown'}
                        {selectedLog.location.latitude && selectedLog.location.longitude && (
                          <span className="block text-xs text-muted-foreground">
                            ({selectedLog.location.latitude}, {selectedLog.location.longitude})
                          </span>
                        )}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Action</h4>
                  <p>{selectedLog.action || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Component</h4>
                  <p>{selectedLog.componentName || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">URL</h4>
                <p className="break-all">{selectedLog.url || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Page Title</h4>
                <p>{selectedLog.pageTitle || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Element ID</h4>
                <p>{selectedLog.elementId || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Element Class</h4>
                <p>{selectedLog.elementClass || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">User Agent</h4>
                <p className="text-xs font-mono break-all">{selectedLog.userAgent || 'N/A'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
