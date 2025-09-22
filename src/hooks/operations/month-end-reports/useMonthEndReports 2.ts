import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integration/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import {
  FrontendMonthEndReport,
  MonthEndReportGroup,
  MonthEndReportActionItem,
  ReportStatus,
  ActionItemStatus,
} from "@/integration/supabase/types/month-end-reports";
import { MonthEndReportFormData } from "@/components/operations/month-end-reports/schemas/monthEndReportSchema";

// Database types for Supabase tables
interface MonthEndReportDB {
  id: string;
  property_id: string;
  hotel_site: string;
  start_date: string;
  end_date: string;
  headline: string;
  narrative: string;
  key_risks: string; // Note: This is a string in DB but string[] in frontend
  key_wins: string; // Note: This is a string in DB but string[] in frontend
  occupancy_start_pct: number;
  occupancy_end_pct: number;
  avg_occupancy_pct: number;
  occupancy_notes: string;
  cleanliness_score: number;
  inspection_count: number;
  issues_found: number;
  cleanliness_comments: string;
  training_updates: string;
  absenteeism_notes: string;
  incidents: string;
  status: string;
  created_at: string;
  updated_at: string;
  prepared_by?: string;
  updated_by?: string;
  approved_by?: string;
  approved_at?: string;
  groups?: MonthEndReportGroupDB[];
  action_items?: MonthEndReportActionItemDB[];
}

interface MonthEndReportGroupDB {
  id: string;
  report_id: string;
  name: string; // Note: This is 'name' in DB but 'group_name' in frontend
  arrival_date?: string;
  departure_date?: string;
  rooms_blocked: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface MonthEndReportActionItemDB {
  id: string;
  report_id: string;
  description: string; // Note: This is 'description' in DB but 'title' in frontend
  assigned_to: string; // Note: This is 'assigned_to' in DB but 'owner' in frontend
  due_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useMonthEndReports = () => {
  const [reports, setReports] = useState<FrontendMonthEndReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all reports
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("month_end_reports")
        .select(
          `
          *,
          groups:month_end_report_groups(*),
          action_items:month_end_report_action_items(*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform to frontend format
      const frontendReports: FrontendMonthEndReport[] = (
        data as MonthEndReportDB[]
      ).map((report) => {
        // Transform groups to match MonthEndReportGroup interface
        const groups = (report.groups || []).map((group) => ({
          id: group.id,
          report_id: group.report_id,
          group_name: group.name, // Map name to group_name
          arrival_date: group.arrival_date || "",
          departure_date: group.departure_date || "",
          rooms_blocked: group.rooms_blocked,
          notes: group.notes,
          created_at: group.created_at,
          updated_at: group.updated_at,
        })) as MonthEndReportGroup[];

        // Transform action items to match MonthEndReportActionItem interface
        const actionItems = (report.action_items || []).map((item) => ({
          id: item.id,
          report_id: item.report_id,
          title: item.description, // Map description to title
          owner: item.assigned_to, // Map assigned_to to owner
          due_date: item.due_date,
          status: item.status as ActionItemStatus,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })) as MonthEndReportActionItem[];

        // Parse key_risks and key_wins from string to string[]
        const keyRisks = report.key_risks ? JSON.parse(report.key_risks) : [];
        const keyWins = report.key_wins ? JSON.parse(report.key_wins) : [];

        return {
          ...report,
          key_risks: keyRisks,
          key_wins: keyWins,
          status: report.status as ReportStatus,
          groups: groups,
          action_items: actionItems,
          // Calculate computed fields
          total_rooms_blocked:
            report.groups?.reduce(
              (sum, group) => sum + (group.rooms_blocked || 0),
              0
            ) || 0,
          open_action_items:
            report.action_items?.filter((item) => item.status !== "done")
              .length || 0,
          completed_action_items:
            report.action_items?.filter((item) => item.status === "done")
              .length || 0,
        } as FrontendMonthEndReport;
      });

      setReports(frontendReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new report
  const createReport = async (data: MonthEndReportFormData) => {
    try {
      // Insert the main report
      const { data: reportData, error: reportError } = await supabase
        .from("month_end_reports")
        .insert({
          property_id: data.property_id,
          hotel_site: data.hotel_site,
          start_date: data.start_date,
          end_date: data.end_date,
          headline: data.headline,
          narrative: data.narrative,
          key_risks: JSON.stringify(data.key_risks),
          key_wins: JSON.stringify(data.key_wins),
          occupancy_start_pct: data.occupancy_start_pct,
          occupancy_end_pct: data.occupancy_end_pct,
          avg_occupancy_pct: data.avg_occupancy_pct,
          occupancy_notes: data.occupancy_notes,
          cleanliness_score: data.cleanliness_score,
          inspection_count: data.inspection_count,
          issues_found: data.issues_found,
          cleanliness_comments: data.cleanliness_comments,
          training_updates: data.training_updates,
          absenteeism_notes: data.absenteeism_notes,
          incidents: data.incidents,
          status: "draft",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
        .select()
        .single();

      if (reportError) throw reportError;

      // We've already checked for errors, but let's be safe with TypeScript
      if (!reportData) {
        throw new Error("Failed to create report: No data returned");
      }
      const reportId = (reportData as any).id;

      // Insert groups if any
      if (data.groups && data.groups.length > 0) {
        const groupsToInsert = data.groups.map((group) => ({
          report_id: reportId,
          name: group.group_name, // Map group_name to name
          arrival_date: group.arrival_date,
          departure_date: group.departure_date,
          rooms_blocked: group.rooms_blocked,
          notes: group.notes || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: groupsError } = await supabase
          .from("month_end_report_groups")
          .insert(groupsToInsert as any);

        if (groupsError) throw groupsError;
      }

      // Insert action items if any
      if (data.action_items && data.action_items.length > 0) {
        const actionItemsToInsert = data.action_items.map((item) => ({
          report_id: reportId,
          description: item.title, // Map title to description
          assigned_to: item.owner || "", // Map owner to assigned_to
          due_date: item.due_date || "",
          status: item.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: actionItemsError } = await supabase
          .from("month_end_report_action_items")
          .insert(actionItemsToInsert as any);

        if (actionItemsError) throw actionItemsError;
      }

      // Refetch reports to update the list
      await fetchReports();

      return reportId;
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  };

  // Update an existing report
  const updateReport = async (id: string, data: MonthEndReportFormData) => {
    try {
      // Update the main report
      const { error: reportError } = await (supabase
        .from("month_end_reports") as any)
        .update({
          property_id: data.property_id,
          hotel_site: data.hotel_site,
          start_date: data.start_date,
          end_date: data.end_date,
          headline: data.headline,
          narrative: data.narrative,
          key_risks: JSON.stringify(data.key_risks),
          key_wins: JSON.stringify(data.key_wins),
          occupancy_start_pct: data.occupancy_start_pct,
          occupancy_end_pct: data.occupancy_end_pct,
          avg_occupancy_pct: data.avg_occupancy_pct,
          occupancy_notes: data.occupancy_notes,
          cleanliness_score: data.cleanliness_score,
          inspection_count: data.inspection_count,
          issues_found: data.issues_found,
          cleanliness_comments: data.cleanliness_comments,
          training_updates: data.training_updates,
          absenteeism_notes: data.absenteeism_notes,
          incidents: data.incidents,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (reportError) throw reportError;

      // Delete existing groups and insert new ones
      const { error: deleteGroupsError } = await supabase
        .from("month_end_report_groups")
        .delete()
        .eq("report_id", id);

      if (deleteGroupsError) throw deleteGroupsError;

      if (data.groups && data.groups.length > 0) {
        const groupsToInsert = data.groups.map((group) => ({
          report_id: id,
          name: group.group_name, // Map group_name to name
          arrival_date: group.arrival_date,
          departure_date: group.departure_date,
          rooms_blocked: group.rooms_blocked,
          notes: group.notes || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: groupsError } = await supabase
          .from("month_end_report_groups")
          .insert(groupsToInsert as any);

        if (groupsError) throw groupsError;
      }

      // Delete existing action items and insert new ones
      const { error: deleteActionItemsError } = await supabase
        .from("month_end_report_action_items")
        .delete()
        .eq("report_id", id);

      if (deleteActionItemsError) throw deleteActionItemsError;

      if (data.action_items && data.action_items.length > 0) {
        const actionItemsToInsert = data.action_items.map((item) => ({
          report_id: id,
          description: item.title, // Map title to description
          assigned_to: item.owner || "", // Map owner to assigned_to
          due_date: item.due_date || "",
          status: item.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: actionItemsError } = await supabase
          .from("month_end_report_action_items")
          .insert(actionItemsToInsert as any);

        if (actionItemsError) throw actionItemsError;
      }

      // Refetch reports to update the list
      await fetchReports();
    } catch (error) {
      console.error("Error updating report:", error);
      throw error;
    }
  };

  // Submit a report for approval
  const submitReport = async (id: string) => {
    try {
      const { error } = await (supabase
        .from("month_end_reports") as any)
        .update({
          status: "submitted" as ReportStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      // Refetch reports to update the list
      await fetchReports();

      toast({
        title: "Success",
        description: "Report submitted for approval",
      });
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Approve a submitted report
  const approveReport = async (id: string) => {
    try {
      const { error } = await (supabase
        .from("month_end_reports") as any)
        .update({
          status: "approved" as ReportStatus,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      // Refetch reports to update the list
      await fetchReports();

      toast({
        title: "Success",
        description: "Report approved",
      });
    } catch (error) {
      console.error("Error approving report:", error);
      toast({
        title: "Error",
        description: "Failed to approve report",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete a report
  const deleteReport = async (id: string) => {
    try {
      // Delete action items first (foreign key constraint)
      const { error: actionItemsError } = await supabase
        .from("month_end_report_action_items")
        .delete()
        .eq("report_id", id);

      if (actionItemsError) throw actionItemsError;

      // Delete groups (foreign key constraint)
      const { error: groupsError } = await supabase
        .from("month_end_report_groups")
        .delete()
        .eq("report_id", id);

      if (groupsError) throw groupsError;

      // Delete the main report
      const { error } = await supabase
        .from("month_end_reports")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Refetch reports to update the list
      await fetchReports();

      toast({
        title: "Success",
        description: "Report deleted",
      });
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Load reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    isLoading,
    createReport,
    updateReport,
    submitReport,
    approveReport,
    deleteReport,
    refetch: fetchReports,
  };
};

export default useMonthEndReports;
