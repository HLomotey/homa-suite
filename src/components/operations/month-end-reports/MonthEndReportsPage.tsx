import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { MonthEndReportTable } from "./MonthEndReportTable";
import { MonthEndReportSheetForm } from "./MonthEndReportSheetForm";
import { MonthEndReportFormData } from "./schemas/monthEndReportSchema";
import {
  FrontendMonthEndReport,
  PropertyOption,
} from "@/integration/supabase/types/month-end-reports";
import { useMonthEndReports } from "@/hooks/operations/month-end-reports/useMonthEndReports";
import { useProperties } from "@/hooks/property/useProperties";
import { Loader2 } from "lucide-react";

export const MonthEndReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
      name: property.name,
    })) || [];

  // Handle saving a report (create or update)
  const handleSaveReport = async (data: MonthEndReportFormData) => {
    setIsLoading(true);
    try {
      if (data.id) {
        await updateReport(data.id, data);
        toast({
          title: "Success",
          description: "Report updated successfully",
        });
      } else {
        await createReport(data);
        toast({
          title: "Success",
          description: "Report created successfully",
        });
      }
      refetchReports();
    } catch (error) {
      console.error("Error saving report:", error);
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Month-End Reports</h1>
      </div>

      <MonthEndReportTable
        reports={reports || []}
        properties={propertyOptions}
        onSave={handleSaveReport}
        onSubmit={handleSubmitReport}
        onApprove={handleApproveReport}
        onDelete={handleDeleteReport}
        isLoading={isLoading}
      />
    </div>
  );
};

export default MonthEndReportsPage;
