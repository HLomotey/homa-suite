import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Hotel,
  Sparkles,
  Users,
  Target,
  Clock
} from "lucide-react";
import { useMonthEndReports } from "@/hooks/month-end-reports/useMonthEndReports";
import {
  FrontendMonthEndReport,
  ReportStatus,
  MonthEndReportFilters
} from "@/integration/supabase/types/month-end-reports";
import { OccupancyTable } from "./tables/OccupancyTable";
import { CleanlinessTable } from "./tables/CleanlinessTable";
import { GroupsTable } from "./tables/GroupsTable";
import { StaffingTable } from "./tables/StaffingTable";
import { SummaryTable } from "./tables/SummaryTable";

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
  const [activeTab, setActiveTab] = useState("occupancy");

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

  const handleSaveReport = async (data: any) => {
    // This will be handled by the parent container
    console.log("Save report:", data);
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
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.avg_cleanliness_score * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Quality score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="occupancy" className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            Occupancy
          </TabsTrigger>
          <TabsTrigger value="cleanliness" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Cleanliness
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="staffing" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Staffing
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Summary
          </TabsTrigger>
        </TabsList>


        <TabsContent value="occupancy" className="space-y-4">
          <OccupancyTable 
            reports={filteredReports}
            isLoading={loading}
            onSave={handleSaveReport}
          />
        </TabsContent>

        <TabsContent value="cleanliness" className="space-y-4">
          <CleanlinessTable 
            reports={filteredReports}
            isLoading={loading}
            onSave={handleSaveReport}
          />
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <GroupsTable 
            reports={filteredReports}
            isLoading={loading}
            onSave={handleSaveReport}
          />
        </TabsContent>

        <TabsContent value="staffing" className="space-y-4">
          <StaffingTable 
            reports={filteredReports}
            isLoading={loading}
            onSave={handleSaveReport}
          />
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <SummaryTable 
            reports={filteredReports}
            isLoading={loading}
            onSave={handleSaveReport}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonthEndReportsList;
