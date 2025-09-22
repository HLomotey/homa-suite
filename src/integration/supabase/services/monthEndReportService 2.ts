import { supabase } from '../index';
import { 
  MonthEndReport,
  MonthEndReportGroup,
  MonthEndReportActionItem,
  FrontendMonthEndReport,
  CreateMonthEndReport,
  UpdateMonthEndReport,
  CreateMonthEndReportGroup,
  UpdateMonthEndReportGroup,
  CreateMonthEndReportActionItem,
  UpdateMonthEndReportActionItem,
  MonthEndReportFilters,
  MonthEndReportStats
} from '../types/month-end-reports';

/**
 * Interface for month-end report with joined data
 */
interface MonthEndReportWithJoins extends MonthEndReport {
  groups?: MonthEndReportGroup[];
  action_items?: MonthEndReportActionItem[];
}

/**
 * Service for managing Operations Call Meeting Report in the system
 */
export const MonthEndReportService = {
  /**
   * Get all Operations Call Meeting Report with optional filtering
   * @param filters - Optional filters to apply
   * @returns Promise with array of Operations Call Meeting Report
   */
  getAllMonthEndReports: async (filters?: MonthEndReportFilters): Promise<FrontendMonthEndReport[]> => {
    try {
      let query = supabase
        .from('month_end_reports')
        .select(`
          *,
          groups:month_end_report_groups(*),
          action_items:month_end_report_action_items(*)
        `)
        .order('start_date', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.property_id) {
        query = query.eq('property_id', filters.property_id);
      }
      if (filters?.start_date) {
        query = query.gte('start_date', filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte('end_date', filters.end_date);
      }
      if (filters?.prepared_by) {
        query = query.eq('prepared_by', filters.prepared_by);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching Operations Call Meeting Report:', error);
        throw error;
      }

      if (!data) return [];

      return data.map((report: MonthEndReportWithJoins) => {
        const frontendReport: FrontendMonthEndReport = {
          ...report,
          groups: report.groups || [],
          action_items: report.action_items || [],
          total_rooms_blocked: report.groups?.reduce((sum, group) => sum + group.rooms_blocked, 0) || 0,
          open_action_items: report.action_items?.filter(item => item.status !== 'done').length || 0,
          completed_action_items: report.action_items?.filter(item => item.status === 'done').length || 0
        };
        
        return frontendReport;
      });
    } catch (err) {
      console.error('Error in getAllMonthEndReports:', err);
      throw err;
    }
  },

  /**
   * Get a month-end report by ID
   * @param id - Month-end report ID
   * @returns Promise with month-end report data
   */
  getMonthEndReportById: async (id: string): Promise<FrontendMonthEndReport | null> => {
    try {
      const { data, error } = await supabase
        .from('month_end_reports')
        .select(`
          *,
          groups:month_end_report_groups(*),
          action_items:month_end_report_action_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching month-end report with ID ${id}:`, error);
        throw error;
      }

      if (!data) return null;

      const frontendReport: FrontendMonthEndReport = {
        ...data,
        groups: data.groups || [],
        action_items: data.action_items || [],
        total_rooms_blocked: data.groups?.reduce((sum: number, group: MonthEndReportGroup) => sum + group.rooms_blocked, 0) || 0,
        open_action_items: data.action_items?.filter((item: MonthEndReportActionItem) => item.status !== 'done').length || 0,
        completed_action_items: data.action_items?.filter((item: MonthEndReportActionItem) => item.status === 'done').length || 0
      };
      
      return frontendReport;
    } catch (err) {
      console.error(`Error in getMonthEndReportById for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Create a new month-end report
   * @param report - Month-end report data to create
   * @returns Promise with created month-end report data
   */
  createMonthEndReport: async (report: CreateMonthEndReport): Promise<FrontendMonthEndReport> => {
    try {
      const { data, error } = await supabase
        .from('month_end_reports')
        .insert(report)
        .select()
        .single();

      if (error) {
        console.error('Error creating month-end report:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned after creating month-end report');
      }

      const frontendReport: FrontendMonthEndReport = {
        ...data,
        groups: [],
        action_items: [],
        total_rooms_blocked: 0,
        open_action_items: 0,
        completed_action_items: 0
      };
      
      return frontendReport;
    } catch (err) {
      console.error('Error in createMonthEndReport:', err);
      throw err;
    }
  },

  /**
   * Update an existing month-end report
   * @param id - Month-end report ID
   * @param report - Updated month-end report data
   * @returns Promise with updated month-end report data
   */
  updateMonthEndReport: async (id: string, report: UpdateMonthEndReport): Promise<FrontendMonthEndReport> => {
    try {
      const { data, error } = await supabase
        .from('month_end_reports')
        .update({
          ...report,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          groups:month_end_report_groups(*),
          action_items:month_end_report_action_items(*)
        `)
        .single();

      if (error) {
        console.error(`Error updating month-end report with ID ${id}:`, error);
        throw error;
      }

      if (!data) {
        throw new Error(`No data returned after updating month-end report with ID ${id}`);
      }

      const frontendReport: FrontendMonthEndReport = {
        ...data,
        groups: data.groups || [],
        action_items: data.action_items || [],
        total_rooms_blocked: data.groups?.reduce((sum: number, group: MonthEndReportGroup) => sum + group.rooms_blocked, 0) || 0,
        open_action_items: data.action_items?.filter((item: MonthEndReportActionItem) => item.status !== 'done').length || 0,
        completed_action_items: data.action_items?.filter((item: MonthEndReportActionItem) => item.status === 'done').length || 0
      };
      
      return frontendReport;
    } catch (err) {
      console.error(`Error in updateMonthEndReport for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Delete a month-end report
   * @param id - Month-end report ID
   * @returns Promise with success status
   */
  deleteMonthEndReport: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('month_end_reports')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting month-end report with ID ${id}:`, error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error(`Error in deleteMonthEndReport for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Create a group for a month-end report
   * @param group - Group data to create
   * @returns Promise with created group data
   */
  createReportGroup: async (group: CreateMonthEndReportGroup): Promise<MonthEndReportGroup> => {
    try {
      const { data, error } = await supabase
        .from('month_end_report_groups')
        .insert(group)
        .select()
        .single();

      if (error) {
        console.error('Error creating report group:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned after creating report group');
      }

      return data;
    } catch (err) {
      console.error('Error in createReportGroup:', err);
      throw err;
    }
  },

  /**
   * Update a report group
   * @param id - Group ID
   * @param group - Updated group data
   * @returns Promise with updated group data
   */
  updateReportGroup: async (id: string, group: UpdateMonthEndReportGroup): Promise<MonthEndReportGroup> => {
    try {
      const { data, error } = await supabase
        .from('month_end_report_groups')
        .update({
          ...group,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating report group with ID ${id}:`, error);
        throw error;
      }

      if (!data) {
        throw new Error(`No data returned after updating report group with ID ${id}`);
      }

      return data;
    } catch (err) {
      console.error(`Error in updateReportGroup for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Delete a report group
   * @param id - Group ID
   * @returns Promise with success status
   */
  deleteReportGroup: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('month_end_report_groups')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting report group with ID ${id}:`, error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error(`Error in deleteReportGroup for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Create an action item for a month-end report
   * @param actionItem - Action item data to create
   * @returns Promise with created action item data
   */
  createActionItem: async (actionItem: CreateMonthEndReportActionItem): Promise<MonthEndReportActionItem> => {
    try {
      const { data, error } = await supabase
        .from('month_end_report_action_items')
        .insert(actionItem)
        .select()
        .single();

      if (error) {
        console.error('Error creating action item:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned after creating action item');
      }

      return data;
    } catch (err) {
      console.error('Error in createActionItem:', err);
      throw err;
    }
  },

  /**
   * Update an action item
   * @param id - Action item ID
   * @param actionItem - Updated action item data
   * @returns Promise with updated action item data
   */
  updateActionItem: async (id: string, actionItem: UpdateMonthEndReportActionItem): Promise<MonthEndReportActionItem> => {
    try {
      const { data, error } = await supabase
        .from('month_end_report_action_items')
        .update({
          ...actionItem,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating action item with ID ${id}:`, error);
        throw error;
      }

      if (!data) {
        throw new Error(`No data returned after updating action item with ID ${id}`);
      }

      return data;
    } catch (err) {
      console.error(`Error in updateActionItem for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Delete an action item
   * @param id - Action item ID
   * @returns Promise with success status
   */
  deleteActionItem: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('month_end_report_action_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting action item with ID ${id}:`, error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error(`Error in deleteActionItem for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Get month-end report statistics
   * @returns Promise with statistics data
   */
  getMonthEndReportStats: async (): Promise<MonthEndReportStats> => {
    try {
      const { data, error } = await supabase
        .from('month_end_reports')
        .select('status, start_date, avg_occupancy_pct, cleanliness_score');

      if (error) {
        console.error('Error fetching month-end report stats:', error);
        throw error;
      }

      if (!data) {
        return {
          total: 0,
          draft: 0,
          submitted: 0,
          approved: 0,
          this_month: 0,
          last_month: 0,
          avg_occupancy: 0,
          avg_cleanliness_score: 0
        };
      }

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const stats: MonthEndReportStats = {
        total: data.length,
        draft: data.filter(r => r.status === 'draft').length,
        submitted: data.filter(r => r.status === 'submitted').length,
        approved: data.filter(r => r.status === 'approved').length,
        this_month: data.filter(r => new Date(r.start_date) >= thisMonth).length,
        last_month: data.filter(r => {
          const startDate = new Date(r.start_date);
          return startDate >= lastMonth && startDate < thisMonth;
        }).length,
        avg_occupancy: data.reduce((sum, r) => sum + (r.avg_occupancy_pct || 0), 0) / data.length || 0,
        avg_cleanliness_score: data.reduce((sum, r) => sum + (r.cleanliness_score || 0), 0) / data.length || 0
      };

      return stats;
    } catch (err) {
      console.error('Error in getMonthEndReportStats:', err);
      throw err;
    }
  }
};

export default MonthEndReportService;
