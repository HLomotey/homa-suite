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
  FileText
} from "lucide-react";
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

  const getStatusBadge = (status: ReportStatus) => {
    const variants = {
      draft: "secondary",
      submitted: "default",
      approved: "default"
    } as const;

    const colors = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800"
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Month-End Reports</CardTitle>
              <CardDescription>
                Manage and review monthly operational reports
              </CardDescription>
            </div>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReportStatus | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleFilterChange}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>

          {/* Reports Table */}
          {loading ? (
            <div className="text-center py-8">Loading reports...</div>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthEndReportsList;
