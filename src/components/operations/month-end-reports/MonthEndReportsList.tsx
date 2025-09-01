import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
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
  Clock,
} from "lucide-react";
import { useOpsCall } from "@/hooks/operations/ops-call/useOpsCall";
import {
  FrontendOpsCall,
  OpsCallStatus,
  OpsCallFilters,
} from "@/integration/supabase/types/operations-call";
import { OccupancyTable } from "./tables/OccupancyTable";
import { CleanlinessTable } from "./tables/CleanlinessTable";
import { GroupsTable } from "./tables/GroupsTable";
import { StaffingTable } from "./tables/StaffingTable";
import { SummaryTable } from "./tables/SummaryTable";

export interface MonthEndReportsListProps {
  onCreateNew: () => void;
  onEdit: (report: FrontendOpsCall) => void;
  onView: (report: FrontendOpsCall) => void;
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
  onApprove,
}) => {
  const {
    opsCalls: reports,
    loading,
    stats,
    fetchOpsCalls: fetchReports,
  } = useOpsCall();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OpsCallStatus | "all">(
    "all"
  );
  const [filteredReports, setFilteredReports] = useState<FrontendOpsCall[]>([]);
  const [activeTab, setActiveTab] = useState("occupancy");

  // Load ops calls on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports based on search and status
  useEffect(() => {
    let filtered = reports;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.hotel_site.toLowerCase().includes(query) ||
          report.headline.toLowerCase().includes(query) ||
          report.narrative.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchQuery, statusFilter]);

  const handleFilterChange = () => {
    const filters: OpsCallFilters = {};
    if (statusFilter !== "all") {
      filters.status = statusFilter;
    }
    fetchReports(filters);
  };

  const handleSaveReport = async (data: any) => {
    // This will be handled by the parent container
    console.log("Save report:", data);
  };

  const handleEditReport = async (data: any) => {
    // This will be handled by the parent container
    console.log("Edit report:", data);
  };

  const handleDeleteReport = async (data: any) => {
    // This will be handled by the parent container
    console.log("Delete report:", data);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header / Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Operations Call (Ops Call)</h2>
          <p className="text-muted-foreground">
            Manage and review monthly operational reports
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.this_month || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <span className="font-medium">{reports[0]?.hotel_site}</span>
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.submitted || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.draft || 0} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avg_occupancy ? stats.avg_occupancy.toFixed(1) : "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground">Across all reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Cleanliness
            </CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avg_cleanliness_score
                ? (stats.avg_cleanliness_score * 100).toFixed(1)
                : "0.0"}
              %
            </div>
            <p className="text-xs text-muted-foreground">Quality score</p>
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
            onEdit={handleEditReport}
            onDelete={handleDeleteReport}
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
