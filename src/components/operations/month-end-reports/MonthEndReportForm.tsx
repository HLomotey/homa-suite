import React, { useState, useEffect, useCallback } from "react";
import useStaffLocation from "@/hooks/transport/useStaffLocation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  Hotel,
  Sparkles,
  Users,
  Target
} from "lucide-react";

// Import modular components
import { ReportMetadata } from "./components/shared/ReportMetadata";
import { FormActions } from "./components/shared/FormActions";
import { SummaryTab } from "./components/summary/SummaryTab";
import { OccupancyTab } from "./components/occupancy/OccupancyTab";
import { CleanlinessTab } from "./components/cleanliness/CleanlinessTab";
import { GroupsTab } from "./components/groups/GroupsTab";
import { StaffingTab } from "./components/staffing/StaffingTab";

import {
  monthEndReportSchema,
  MonthEndReportFormData
} from "./schemas/monthEndReportSchema";
import {
  FrontendMonthEndReport,
  ReportStatus,
  PropertyOption
} from "@/integration/supabase/types/month-end-reports";

export interface MonthEndReportFormProps {
  report?: FrontendMonthEndReport;
  onSave: (data: MonthEndReportFormData) => Promise<void>;
  onSubmit?: (id: string) => Promise<void>;
  onApprove?: (id: string) => Promise<void>;
  onCancel: () => void;
  properties?: PropertyOption[];
  staffLocations?: any[];
  isLoading?: boolean;
}

export const MonthEndReportForm: React.FC<MonthEndReportFormProps> = ({
  report,
  onSave,
  onSubmit,
  onApprove,
  onCancel,
  properties = [],
  staffLocations = [],
  isLoading = false
}) => {
  const { staffLocations: hookStaffLocations } = useStaffLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("summary");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const form = useForm<MonthEndReportFormData>({
    resolver: zodResolver(monthEndReportSchema),
    defaultValues: {
      hotel_site: report?.hotel_site || "",
      property_id: report?.property_id || "",
      start_date: report?.start_date || new Date().toISOString().split("T")[0],
      end_date: report?.end_date || new Date().toISOString().split("T")[0],
      headline: report?.headline || "",
      narrative: report?.narrative || "",
      key_risks: report?.key_risks || [],
      key_wins: report?.key_wins || [],
      occupancy_start_pct: report?.occupancy_start_pct || undefined,
      occupancy_end_pct: report?.occupancy_end_pct || undefined,
      avg_occupancy_pct: report?.avg_occupancy_pct || undefined,
      occupancy_notes: report?.occupancy_notes || "",
      cleanliness_score: report?.cleanliness_score || undefined,
      inspection_count: report?.inspection_count || undefined,
      issues_found: report?.issues_found || undefined,
      cleanliness_comments: report?.cleanliness_comments || "",
      training_updates: report?.training_updates || "",
      absenteeism_notes: report?.absenteeism_notes || "",
      incidents: report?.incidents || "",
      groups: report?.groups?.map(g => ({
        id: g.id,
        group_name: g.group_name,
        arrival_date: g.arrival_date,
        departure_date: g.departure_date,
        rooms_blocked: g.rooms_blocked,
        notes: g.notes
      })) || [],
      action_items: report?.action_items?.map(a => ({
        id: a.id,
        title: a.title,
        owner: a.owner,
        due_date: a.due_date,
        status: a.status
      })) || []
    }
  });


  // Auto-save functionality
  const triggerAutoSave = useCallback(async () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        const formData = form.getValues();
        await onSave(formData);
        setLastSaved(new Date());
        toast({
          title: "Auto-saved",
          description: `Saved at ${new Date().toLocaleTimeString()}`,
          duration: 2000
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 3000);

    setAutoSaveTimeout(timeout);
  }, [form, onSave, autoSaveTimeout, toast]);

  // Watch for form changes to trigger auto-save
  useEffect(() => {
    const subscription = form.watch(() => {
      triggerAutoSave();
    });
    return () => subscription.unsubscribe();
  }, [form, triggerAutoSave]);

  // Calculate average occupancy when start/end values change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "occupancy_start_pct" || name === "occupancy_end_pct") {
        const start = value.occupancy_start_pct;
        const end = value.occupancy_end_pct;
        if (start !== undefined && end !== undefined) {
          const avg = (start + end) / 2;
          form.setValue("avg_occupancy_pct", Number(avg.toFixed(2)));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleManualSave = async () => {
    try {
      const formData = form.getValues();
      await onSave(formData);
      setLastSaved(new Date());
      toast({
        title: "Saved",
        description: "Report saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive"
      });
    }
  };

  const handleSubmitReport = async () => {
    if (!report?.id || !onSubmit) return;
    
    try {
      await onSubmit(report.id);
      toast({
        title: "Submitted",
        description: "Report submitted for approval"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive"
      });
    }
  };

  const handleApproveReport = async () => {
    if (!report?.id || !onApprove) return;
    
    try {
      await onApprove(report.id);
      toast({
        title: "Approved",
        description: "Report approved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve report",
        variant: "destructive"
      });
    }
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

  const isReadOnly = report?.status === "approved";

  return (
    <div className="h-full flex flex-col">
      {/* Form Actions Component */}
      <FormActions
        reportId={report?.id}
        status={report?.status}
        isLoading={isLoading}
        lastSaved={lastSaved}
        onSave={handleManualSave}
        onSubmit={handleSubmitReport}
        onApprove={handleApproveReport}
        onCancel={onCancel}
      />

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Report Metadata Component */}
        <ReportMetadata 
          form={form} 
          isReadOnly={isReadOnly} 
          properties={properties}
          staffLocations={hookStaffLocations} 
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Summary
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
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <SummaryTab form={form} isReadOnly={isReadOnly} />
          </TabsContent>

          <TabsContent value="occupancy" className="space-y-6">
            <OccupancyTab form={form} isReadOnly={isReadOnly} />
          </TabsContent>

          <TabsContent value="cleanliness" className="space-y-6">
            <CleanlinessTab form={form} isReadOnly={isReadOnly} />
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <GroupsTab form={form} isReadOnly={isReadOnly} />
          </TabsContent>

          <TabsContent value="staffing" className="space-y-6">
            <StaffingTab form={form} isReadOnly={isReadOnly} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MonthEndReportForm;
