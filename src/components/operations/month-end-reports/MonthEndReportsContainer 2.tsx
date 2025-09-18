import React, { useState } from "react";
import { MonthEndReportsList } from "./MonthEndReportsList";
import { MonthEndReports } from "./MonthEndReportForm";
import { useMonthEndReports } from "@/hooks/month-end-reports/useMonthEndReports";
import {
  FrontendMonthEndReport,
  MonthEndReportFormData
} from "@/integration/supabase/types/month-end-reports";

type ViewMode = "list" | "create" | "edit" | "view";

export const MonthEndReportsContainer: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedReport, setSelectedReport] = useState<FrontendMonthEndReport | null>(null);
  
  const {
    createReport,
    updateReport,
    deleteReport,
    submitReport,
    approveReport,
    fetchReports
  } = useMonthEndReports();

  const handleCreateNew = () => {
    setSelectedReport(null);
    setViewMode("create");
  };

  const handleEdit = (report: FrontendMonthEndReport) => {
    setSelectedReport(report);
    setViewMode("edit");
  };

  const handleView = (report: FrontendMonthEndReport) => {
    setSelectedReport(report);
    setViewMode("view");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      await deleteReport(id);
      await fetchReports();
    }
  };

  const handleSubmit = async (id: string) => {
    if (window.confirm("Are you sure you want to submit this report for approval?")) {
      await submitReport(id);
      await fetchReports();
    }
  };

  const handleApprove = async (id: string) => {
    if (window.confirm("Are you sure you want to approve this report?")) {
      await approveReport(id);
      await fetchReports();
    }
  };

  const handleSave = async (data: MonthEndReportFormData) => {
    if (selectedReport) {
      // Update existing report
      await updateReport(selectedReport.id, data);
    } else {
      // Create new report
      await createReport(data);
    }
    await fetchReports();
  };

  const handleFormSubmit = async (id: string) => {
    await submitReport(id);
    await fetchReports();
    setViewMode("list");
  };

  const handleFormApprove = async (id: string) => {
    await approveReport(id);
    await fetchReports();
    setViewMode("list");
  };

  const handleCancel = () => {
    setSelectedReport(null);
    setViewMode("list");
  };

  if (viewMode === "list") {
    return (
      <MonthEndReportsList
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
        onApprove={handleApprove}
      />
    );
  }

  return (
    <MonthEndReports
      properties={[]}
      staffLocations={[]}
    />
  );
};

export default MonthEndReportsContainer;
