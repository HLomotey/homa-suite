import { useState, useEffect } from 'react';
import { 
  FrontendMonthEndReport, 
  CreateMonthEndReport, 
  UpdateMonthEndReport,
  MonthEndReportStats,
  ReportStatus,
  MonthEndReportFilters,
  MonthEndReportFormData,
  PropertyOption
} from '@/integration/supabase/types/month-end-reports';
import { MonthEndReportService } from '@/integration/supabase/services/monthEndReportService';
import { useToast } from '@/components/ui/use-toast';

export interface UseMonthEndReportsReturn {
  reports: FrontendMonthEndReport[];
  loading: boolean;
  error: string | null;
  stats: MonthEndReportStats;
  
  // Actions
  fetchReports: (filters?: MonthEndReportFilters) => Promise<void>;
  getReportById: (id: string) => Promise<FrontendMonthEndReport | null>;
  createReport: (report: MonthEndReportFormData) => Promise<FrontendMonthEndReport | null>;
  updateReport: (id: string, updates: MonthEndReportFormData) => Promise<FrontendMonthEndReport | null>;
  deleteReport: (id: string) => Promise<boolean>;
  submitReport: (id: string) => Promise<FrontendMonthEndReport | null>;
  approveReport: (id: string) => Promise<FrontendMonthEndReport | null>;
  refreshStats: () => Promise<void>;
}

export function useMonthEndReports(): UseMonthEndReportsReturn {
  const [reports, setReports] = useState<FrontendMonthEndReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MonthEndReportStats>({
    total: 0,
    draft: 0,
    submitted: 0,
    approved: 0,
    this_month: 0,
    last_month: 0,
    avg_occupancy: 0,
    avg_cleanliness_score: 0
  });
  const { toast } = useToast();

  const fetchReports = async (filters?: MonthEndReportFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await MonthEndReportService.getAllMonthEndReports(filters);
      setReports(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch month-end reports';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getReportById = async (id: string): Promise<FrontendMonthEndReport | null> => {
    try {
      setError(null);
      return await MonthEndReportService.getMonthEndReportById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch month-end report';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  const createReport = async (reportData: MonthEndReportFormData): Promise<FrontendMonthEndReport | null> => {
    try {
      setError(null);
      
      // Convert form data to create format
      const createData: CreateMonthEndReport = {
        property_id: reportData.property_id,
        property_name: reportData.property_name,
        start_date: reportData.start_date,
        end_date: reportData.end_date,
        status: 'draft',
        headline: reportData.headline,
        narrative: reportData.narrative,
        key_risks: reportData.key_risks,
        key_wins: reportData.key_wins,
        occupancy_start_pct: reportData.occupancy_start_pct,
        occupancy_end_pct: reportData.occupancy_end_pct,
        avg_occupancy_pct: reportData.avg_occupancy_pct,
        occupancy_notes: reportData.occupancy_notes,
        cleanliness_score: reportData.cleanliness_score,
        inspection_count: reportData.inspection_count,
        issues_found: reportData.issues_found,
        cleanliness_comments: reportData.cleanliness_comments,
        training_updates: reportData.training_updates,
        absenteeism_notes: reportData.absenteeism_notes,
        incidents: reportData.incidents
      };

      const newReport = await MonthEndReportService.createMonthEndReport(createData);
      
      // Create groups and action items
      if (reportData.groups && reportData.groups.length > 0) {
        for (const group of reportData.groups) {
          await MonthEndReportService.createReportGroup({
            report_id: newReport.id,
            group_name: group.group_name,
            arrival_date: group.arrival_date,
            departure_date: group.departure_date,
            rooms_blocked: group.rooms_blocked,
            notes: group.notes
          });
        }
      }

      if (reportData.action_items && reportData.action_items.length > 0) {
        for (const actionItem of reportData.action_items) {
          await MonthEndReportService.createActionItem({
            report_id: newReport.id,
            title: actionItem.title,
            owner: actionItem.owner,
            due_date: actionItem.due_date,
            status: actionItem.status
          });
        }
      }

      // Fetch the complete report with related data
      const completeReport = await MonthEndReportService.getMonthEndReportById(newReport.id);
      if (completeReport) {
        setReports(prev => [completeReport, ...prev]);
        toast({
          title: "Success",
          description: "Month-end report created successfully"
        });
        await refreshStats();
        return completeReport;
      }
      
      return newReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create month-end report';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  const updateReport = async (id: string, reportData: MonthEndReportFormData): Promise<FrontendMonthEndReport | null> => {
    try {
      setError(null);
      
      // Convert form data to update format
      const updateData: UpdateMonthEndReport = {
        property_id: reportData.property_id,
        property_name: reportData.property_name,
        start_date: reportData.start_date,
        end_date: reportData.end_date,
        headline: reportData.headline,
        narrative: reportData.narrative,
        key_risks: reportData.key_risks,
        key_wins: reportData.key_wins,
        occupancy_start_pct: reportData.occupancy_start_pct,
        occupancy_end_pct: reportData.occupancy_end_pct,
        avg_occupancy_pct: reportData.avg_occupancy_pct,
        occupancy_notes: reportData.occupancy_notes,
        cleanliness_score: reportData.cleanliness_score,
        inspection_count: reportData.inspection_count,
        issues_found: reportData.issues_found,
        cleanliness_comments: reportData.cleanliness_comments,
        training_updates: reportData.training_updates,
        absenteeism_notes: reportData.absenteeism_notes,
        incidents: reportData.incidents
      };

      const updatedReport = await MonthEndReportService.updateMonthEndReport(id, updateData);
      
      setReports(prev => prev.map(report => 
        report.id === id ? updatedReport : report
      ));
      
      toast({
        title: "Success",
        description: "Month-end report updated successfully"
      });
      await refreshStats();
      return updatedReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update month-end report';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteReport = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await MonthEndReportService.deleteMonthEndReport(id);
      setReports(prev => prev.filter(report => report.id !== id));
      toast({
        title: "Success",
        description: "Month-end report deleted successfully"
      });
      await refreshStats();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete month-end report';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  const submitReport = async (id: string): Promise<FrontendMonthEndReport | null> => {
    try {
      setError(null);
      const submittedReport = await MonthEndReportService.updateMonthEndReport(id, { status: 'submitted' });
      setReports(prev => prev.map(report => 
        report.id === id ? submittedReport : report
      ));
      toast({
        title: "Success",
        description: "Month-end report submitted for approval"
      });
      await refreshStats();
      return submittedReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit month-end report';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  const approveReport = async (id: string): Promise<FrontendMonthEndReport | null> => {
    try {
      setError(null);
      const approvedReport = await MonthEndReportService.updateMonthEndReport(id, { 
        status: 'approved',
        approved_at: new Date().toISOString()
      });
      setReports(prev => prev.map(report => 
        report.id === id ? approvedReport : report
      ));
      toast({
        title: "Success",
        description: "Month-end report approved successfully"
      });
      await refreshStats();
      return approvedReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve month-end report';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  const refreshStats = async () => {
    try {
      const newStats = await MonthEndReportService.getMonthEndReportStats();
      setStats(newStats);
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchReports();
    refreshStats();
  }, []);

  return {
    reports,
    loading,
    error,
    stats,
    fetchReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    submitReport,
    approveReport,
    refreshStats
  };
}
