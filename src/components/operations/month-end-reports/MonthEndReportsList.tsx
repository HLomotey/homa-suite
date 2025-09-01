import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Send, 
  CheckCircle,
  Calendar,
  Building,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  Grid3X3,
  Table as TableIcon
} from "lucide-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { cn } from "@/lib/utils";
import { useMonthEndReports } from "@/hooks/month-end-reports/useMonthEndReports";
import {
  FrontendMonthEndReport,
  ReportStatus,
  MonthEndReportFilters
} from "@/integration/supabase/types/month-end-reports";

export interface MonthEndReportsListProps {
  onCreateNew: () => void;
  onEdit: (report: FrontendMonthEndReport) => void;
  onView: (report: FrontendMonthEndReport) => void;
  onDelete: (id: string) => void;
  onSubmit: (id: string) => void;
  onApprove: (id: string) => void;
}

export const MonthEndReportsList: React.FC<MonthEndReportsListProps> = ({
  onCreateNew,
  onEdit,
  onView,
  onDelete,
  onSubmit,
  onApprove
}) => {
  const { reports, loading, stats, fetchReports } = useMonthEndReports();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [filteredReports, setFilteredReports] = useState<FrontendMonthEndReport[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [isExporting, setIsExporting] = useState(false);

  // Filter reports based on search and status
  useEffect(() => {
    let filtered = reports;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report =>
        report.property_name.toLowerCase().includes(query) ||
        report.headline.toLowerCase().includes(query) ||
        report.narrative.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchQuery, statusFilter]);

  const handleFilterChange = () => {
    const filters: MonthEndReportFilters = {};
    if (statusFilter !== "all") {
      filters.status = statusFilter;
    }
    fetchReports(filters);
  };

  // Function to export reports to Excel
  const exportToExcel = () => {
    try {
      setIsExporting(true);
      
      // Prepare data for export
      const exportData = filteredReports.map(report => ({
        'Property': report.property_name,
        'Period': `${formatDate(report.start_date)} - ${formatDate(report.end_date)}`,
        'Headline': report.headline,
        'Status': report.status,
        'Occupancy': report.avg_occupancy_pct ? `${report.avg_occupancy_pct.toFixed(1)}%` : '-',
        'Groups': report.groups?.length || 0,
        'Open Actions': report.open_action_items || 0,
        'Completed Actions': report.completed_action_items || 0,
        'Created': formatDate(report.created_at),
        'Updated': formatDate(report.updated_at)
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Month-End Reports');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Save file
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, `month_end_reports_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "draft":
          return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        case "submitted":
          return "bg-blue-500/20 text-blue-500 border-blue-500/30";
        case "approved":
          return "bg-green-500/20 text-green-500 border-green-500/30";
        default:
          return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      }
    };

    return (
      <Badge className={`${getStatusColor(status)} border`} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Operations Call (Ops Call)
          </h2>
          <p className="text-white/60">Manage and review monthly operational reports</p>
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
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.this_month} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground">
              {stats.draft} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avg_occupancy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cleanliness</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.avg_cleanliness_score * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Quality score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="bg-background border border-input rounded-md px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "all")}
            aria-label="Filter reports by status"
            title="Filter reports by status"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Reports Grid or Table */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-white/60">Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {reports.length === 0 ? "No reports found. Create your first report!" : "No reports match your filters."}
            </div>
          ) : (
            filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onEdit={() => onEdit(report)}
                onView={() => onView(report)}
                onDelete={() => onDelete(report.id)}
                onSubmit={() => onSubmit(report.id)}
                onApprove={() => onApprove(report.id)}
                getStatusBadge={getStatusBadge}
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          {loading ? (
            <div className="text-center py-8 text-white/60">Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {reports.length === 0 ? "No reports found. Create your first report!" : "No reports match your filters."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Headline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Groups</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{report.property_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(report.start_date)} - {formatDate(report.end_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={report.headline}>
                        {report.headline}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(report.status)}
                    </TableCell>
                    <TableCell>
                      {report.avg_occupancy_pct ? `${report.avg_occupancy_pct.toFixed(1)}%` : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{report.groups?.length || 0}</span>
                        {report.total_rooms_blocked && report.total_rooms_blocked > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({report.total_rooms_blocked} rooms)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {report.open_action_items && report.open_action_items > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {report.open_action_items} open
                          </Badge>
                        )}
                        {report.completed_action_items && report.completed_action_items > 0 && (
                          <Badge variant="outline" className="text-xs bg-green-50">
                            {report.completed_action_items} done
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(report)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          {report.status !== "approved" && (
                            <DropdownMenuItem onClick={() => onEdit(report)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {report.status === "draft" && (
                            <DropdownMenuItem onClick={() => onSubmit(report.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Submit
                            </DropdownMenuItem>
                          )}
                          {report.status === "submitted" && (
                            <DropdownMenuItem onClick={() => onApprove(report.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {report.status === "draft" && (
                            <DropdownMenuItem 
                              onClick={() => onDelete(report.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
};

// Report Card Component for Grid View
const ReportCard = ({
  report,
  onEdit,
  onView,
  onDelete,
  onSubmit,
  onApprove,
  getStatusBadge,
  formatDate,
}: {
  report: FrontendMonthEndReport;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  getStatusBadge: (status: ReportStatus) => JSX.Element;
  formatDate: (dateString: string) => string;
}) => {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">
            {report.property_name}
          </h3>
          {getStatusBadge(report.status)}
        </div>
        
        <p className="text-white/60 text-sm mb-2 flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(report.start_date)} - {formatDate(report.end_date)}
        </p>
        
        <p className="text-white/60 text-sm mb-3 line-clamp-2">
          {report.headline}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span className="flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {report.avg_occupancy_pct ? `${report.avg_occupancy_pct.toFixed(1)}%` : "-"}
            </span>
            <span className="flex items-center">
              <Building className="h-3 w-3 mr-1" />
              {report.groups?.length || 0} groups
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-white/60">
            {report.open_action_items && report.open_action_items > 0 && (
              <span className="text-amber-400">{report.open_action_items} open actions</span>
            )}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {report.status !== "approved" && (
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
            )}
            {report.status === "draft" && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthEndReportsList;
