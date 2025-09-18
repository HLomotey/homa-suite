import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Grid3X3,
  Table as TableIcon,
  FileSpreadsheet,
  Briefcase,
  Calendar
} from 'lucide-react';
import { JobOrderStatus, PriorityLevel, JobOrderWithDetails } from '@/types/job-order';
import { format } from 'date-fns';
import { downloadExcelFile } from '@/utils/excelJSHelper';
import { cn } from '@/lib/utils';

// Job Orders List Component
export const JobOrderList = ({
  jobOrders,
  onEdit,
  onDelete,
  onAddJobOrder,
  onViewDetails,
  onSelect,
}: {
  jobOrders: JobOrderWithDetails[];
  onEdit: (jobOrder: JobOrderWithDetails) => void;
  onDelete: (id: string) => void;
  onAddJobOrder: () => void;
  onViewDetails?: (jobOrder: JobOrderWithDetails) => void;
  onSelect?: (jobOrderId: string) => void;
}) => {

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobOrderStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'ALL'>('ALL');
  const [isExporting, setIsExporting] = useState(false);

  // Filter job orders based on search and filters
  const filteredJobOrders = jobOrders.filter(jobOrder => {
    const matchesSearch = 
      jobOrder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobOrder.job_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobOrder.organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || jobOrder.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || jobOrder.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: JobOrderStatus) => {
    const statusConfig = {
      'DRAFT': { color: 'bg-gray-500', icon: Edit },
      'SUBMITTED': { color: 'bg-blue-500', icon: Clock },
      'APPROVAL_PENDING': { color: 'bg-yellow-500', icon: Clock },
      'APPROVED': { color: 'bg-green-500', icon: CheckCircle },
      'IN_PROGRESS': { color: 'bg-blue-600', icon: Clock },
      'ON_HOLD': { color: 'bg-orange-500', icon: AlertTriangle },
      'COMPLETED': { color: 'bg-green-600', icon: CheckCircle },
      'CLOSED': { color: 'bg-gray-600', icon: XCircle },
      'CANCELLED': { color: 'bg-red-500', icon: XCircle },
      'REJECTED': { color: 'bg-red-600', icon: XCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    const priorityConfig = {
      'LOW': 'bg-green-100 text-green-800',
      'MEDIUM': 'bg-blue-100 text-blue-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'URGENT': 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={priorityConfig[priority]}>
        {priority}
      </Badge>
    );
  };

  // Function to export job orders to Excel
  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Prepare data for export
      const exportData = filteredJobOrders.map(jobOrder => ({
        'Job Order #': jobOrder.job_order_number,
        'Title': jobOrder.title,
        'Organization': jobOrder.organization_name || 'N/A',
        'Status': jobOrder.status.replace('_', ' '),
        'Priority': jobOrder.priority,
        'Seats Requested': jobOrder.seats_requested,
        'Seats Filled': jobOrder.seats_filled,
        'Fill Percentage': `${jobOrder.fill_percentage.toFixed(1)}%`,
        'Due Date': jobOrder.due_date ? format(new Date(jobOrder.due_date), 'MMM dd, yyyy') : 'N/A',
        'Created Date': format(new Date(jobOrder.created_at), 'MMM dd, yyyy'),
        'Description': jobOrder.description || ''
      }));
      
      // Generate and download Excel file
      await downloadExcelFile(exportData, `job_orders_export_${new Date().toISOString().split('T')[0]}.xlsx`, 'Job Orders');
      
      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Job Order Management
          </h2>
          <p className="text-white/60">Manage and track job orders across your organization</p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={cn(
                "rounded-md",
                viewMode === "table"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={exportToExcel} variant="outline" disabled={isExporting} className="mr-2">
            {isExporting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to Excel
              </>
            )}
          </Button>
          <Button onClick={onAddJobOrder}>
            <Plus className="h-4 w-4 mr-2" />
            Add Job Order
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search job orders..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="bg-background border border-input rounded-md px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as JobOrderStatus | 'ALL')}
            aria-label="Filter job orders by status"
            title="Filter job orders by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVAL_PENDING">Approval Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            className="bg-background border border-input rounded-md px-3 py-2 text-sm"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityLevel | 'ALL')}
            aria-label="Filter job orders by priority"
            title="Filter job orders by priority"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Job Order Cards or Table */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobOrders.map((jobOrder) => (
            <JobOrderCard
              key={jobOrder.id}
              jobOrder={jobOrder}
              onEdit={() => onEdit(jobOrder)}
              onDelete={() => onDelete(jobOrder.id)}
              onViewDetails={onViewDetails ? () => onViewDetails(jobOrder) : undefined}
              onSelect={onSelect}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Order #</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Fill %</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {filteredJobOrders.length === 0 ? 'No job orders found' : 'No job orders match your filters'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredJobOrders.map((jobOrder) => (
                <TableRow 
                  key={jobOrder.id} 
                  className={cn(
                    "cursor-pointer hover:bg-black/20",
                    jobOrder.is_overdue ? 'bg-red-950/20' : ''
                  )}
                  onClick={() => onSelect && onSelect(jobOrder.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {jobOrder.job_order_number}
                      {jobOrder.is_overdue && (
                        <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{jobOrder.title}</div>
                      {jobOrder.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {jobOrder.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{jobOrder.organization_name || 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(jobOrder.status)}</TableCell>
                  <TableCell>{getPriorityBadge(jobOrder.priority)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {jobOrder.seats_filled} / {jobOrder.seats_requested}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(jobOrder.fill_percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm">{jobOrder.fill_percentage.toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {jobOrder.due_date ? (
                      <div className={`text-sm ${jobOrder.is_overdue ? 'text-red-600 font-medium' : ''}`}>
                        {format(new Date(jobOrder.due_date), 'MMM dd, yyyy')}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onViewDetails && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(jobOrder);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(jobOrder);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(jobOrder.id);
                        }}
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
        </div>
      )}
    </div>
  );
};

// Job Order Card Component
const JobOrderCard = ({
  jobOrder,
  onEdit,
  onDelete,
  onViewDetails,
  onSelect,
  getStatusBadge,
  getPriorityBadge,
}: {
  jobOrder: JobOrderWithDetails;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails?: () => void;
  onSelect?: (jobOrderId: string) => void;
  getStatusBadge: (status: JobOrderStatus) => React.ReactNode;
  getPriorityBadge: (priority: PriorityLevel) => React.ReactNode;
}) => {
  return (
    <div 
      className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors" 
      onClick={() => onSelect && onSelect(jobOrder.id)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-white/80">{jobOrder.job_order_number}</span>
            {jobOrder.is_overdue && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="flex gap-2">
            {getStatusBadge(jobOrder.status)}
            {getPriorityBadge(jobOrder.priority)}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2">
          {jobOrder.title}
        </h3>
        
        {jobOrder.description && (
          <p className="text-white/60 text-sm mb-3 line-clamp-2">
            {jobOrder.description}
          </p>
        )}
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Organization:</span>
            <span className="text-white">{jobOrder.organization_name || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Seats:</span>
            <span className="text-white">{jobOrder.seats_filled} / {jobOrder.seats_requested}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Fill Rate:</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${Math.min(jobOrder.fill_percentage, 100)}%` }}
                />
              </div>
              <span className="text-white text-xs">{jobOrder.fill_percentage.toFixed(0)}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-white/60 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {jobOrder.due_date ? (
              <span className={jobOrder.is_overdue ? 'text-red-400 font-medium' : ''}>
                Due {format(new Date(jobOrder.due_date), 'MMM dd, yyyy')}
              </span>
            ) : (
              'No due date'
            )}
          </div>
          <div className="flex gap-1">
            {onViewDetails && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobOrderList;
