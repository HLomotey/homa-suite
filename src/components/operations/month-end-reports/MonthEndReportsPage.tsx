import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MonthEndReportTable } from "./MonthEndReportTable";
import { MonthEndReportSheetForm } from "./MonthEndReportSheetForm";
import { OccupancyTable } from "./tables/OccupancyTable";
import { CleanlinessTable } from "./tables/CleanlinessTable";
import { GroupsTable } from "./tables/GroupsTable";
import { StaffingTable } from "./tables/StaffingTable";
import { SummaryTable } from "./tables/SummaryTable";
import { MonthEndReportFormData } from "./schemas/monthEndReportSchema";
import {
  FrontendMonthEndReport,
  PropertyOption,
} from "@/integration/supabase/types/month-end-reports";
import { useMonthEndReports } from "@/hooks/operations/month-end-reports/useMonthEndReports";
import { useProperties } from "@/hooks/property/useProperties";
import {
  Loader2,
  FileText,
  Clock,
  TrendingUp,
  CheckCircle,
  Hotel,
  Sparkles,
  Users,
  Target,
  Building,
} from "lucide-react";

export const MonthEndReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all-reports");

  // Fetch reports and properties
  const {
    reports,
    isLoading: isLoadingReports,
    createReport,
    updateReport,
    submitReport,
    approveReport,
    deleteReport,
    refetch: refetchReports,
  } = useMonthEndReports();

  const { properties, isLoading: isLoadingProperties } = useProperties();

  // Map properties to the format expected by the form
  const propertyOptions: PropertyOption[] =
    properties?.map((property) => ({
      id: property.id,
      name: property.title,
    })) || [];

  // Calculate dashboard stats
  const totalReports = reports?.length || 0;
  const pendingApproval =
    reports?.filter((r) => r.status === "submitted").length || 0;
  const avgOccupancy =
    reports?.length > 0
      ? (
          reports.reduce((sum, r) => sum + (r.avg_occupancy_pct || 0), 0) /
          reports.length
        ).toFixed(1)
      : "0.0";
  const avgCleanliness =
    reports?.length > 0
      ? (
          reports.reduce((sum, r) => sum + (r.cleanliness_score || 0), 0) /
          reports.length
        ).toFixed(3)
      : "0.000";

  // Handle saving a report (create or update)
  const handleSaveReport = async (data: MonthEndReportFormData) => {
    try {
      await createReport(data);
      toast({
        title: "Success",
        description: "Report created successfully",
      });
      refetchReports();
    } catch (error) {
      console.error("Error saving report:", error);
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive",
      });
    }
  };

  const handleEditReport = async (data: any) => {
    console.log("Edit report:", data);
  };

  const handleDeleteReportFromTable = async (data: any) => {
    console.log("Delete report from table:", data);
  };

  // Handle submitting a report
  const handleSubmitReport = async (id: string) => {
    setIsLoading(true);
    try {
      await submitReport(id);
      toast({
        title: "Success",
        description: "Report submitted successfully",
      });
      refetchReports();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle approving a report
  const handleApproveReport = async (id: string) => {
    setIsLoading(true);
    try {
      await approveReport(id);
      toast({
        title: "Success",
        description: "Report approved successfully",
      });
      refetchReports();
    } catch (error) {
      console.error("Error approving report:", error);
      toast({
        title: "Error",
        description: "Failed to approve report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a report
  const handleDeleteReport = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteReport(id);
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
      refetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingReports || isLoadingProperties) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-6 space-y-6">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">
              Across all properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApproval}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOccupancy}%</div>
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
            <div className="text-2xl font-bold">{avgCleanliness}</div>
            <p className="text-xs text-muted-foreground">Quality score</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all-reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All Reports
          </TabsTrigger>
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

        <TabsContent value="all-reports" className="space-y-4">
          <MonthEndReportTable
            reports={reports || []}
            properties={propertyOptions}
            onSave={handleSaveReport}
            onSubmit={handleSubmitReport}
            onApprove={handleApproveReport}
            onDelete={handleDeleteReport}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4">
          <OccupancyTable
            reports={reports || []}
            onSave={handleSaveReport}
            onEdit={handleEditReport}
            onDelete={handleDeleteReportFromTable}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="cleanliness" className="space-y-4">
          <CleanlinessTable
            reports={reports || []}
            onSave={handleSaveReport}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <GroupsTable
            reports={reports || []}
            onSave={handleSaveReport}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="staffing" className="space-y-4">
          <StaffingTable
            reports={reports || []}
            onSave={handleSaveReport}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <SummaryTable
            reports={reports || []}
            onSave={handleSaveReport}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonthEndReportsPage;
