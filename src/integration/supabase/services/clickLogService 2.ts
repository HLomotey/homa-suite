import { supabase } from "@/integration/supabase";
import { 
  DatabaseClickLog, 
  FrontendClickLog, 
  mapDatabaseClickLogToFrontend 
} from "@/integration/supabase/types/click-logs";
import { useAuth } from "@/components/auth";

// Service for handling click logs
export class ClickLogService {
  private static instance: ClickLogService;
  private ipInfo: { ip: string; location: any } | null = null;
  
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  public static getInstance(): ClickLogService {
    if (!ClickLogService.instance) {
      ClickLogService.instance = new ClickLogService();
    }
    return ClickLogService.instance;
  }
  
  // Fetch IP and location information
  private async fetchIpAndLocation(): Promise<{ ip: string; location: any }> {
    if (this.ipInfo) {
      return this.ipInfo;
    }
    
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      this.ipInfo = {
        ip: data.ip,
        location: {
          country: data.country_name,
          region: data.region,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude
        }
      };
      
      return this.ipInfo;
    } catch (error) {
      console.error('Error fetching IP and location:', error);
      return {
        ip: 'unknown',
        location: null
      };
    }
  }
  
  // Log a click event
  public async logClick(clickData: {
    elementId?: string;
    elementClass?: string;
    action: string;
    componentName?: string;
    pageTitle?: string;
  }): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('Cannot log click: User not authenticated');
        return;
      }
      
      const ipAndLocation = await this.fetchIpAndLocation();
      const userAgent = navigator.userAgent;
      const url = window.location.href;
      
      const { error } = await supabase.from('click_logs').insert({
        user_id: user.id,
        timestamp: new Date().toISOString(),
        ip_address: ipAndLocation.ip,
        location: ipAndLocation.location,
        url,
        element_id: clickData.elementId || null,
        element_class: clickData.elementClass || null,
        action: clickData.action,
        component_name: clickData.componentName || null,
        page_title: clickData.pageTitle || document.title,
        user_agent: userAgent
      });
      
      if (error) {
        console.error('Error logging click:', error);
      }
    } catch (error) {
      console.error('Error in logClick:', error);
    }
  }
  
  // Fetch click logs for a specific user
  public async fetchUserClickLogs(userId: string, limit = 100, offset = 0): Promise<FrontendClickLog[]> {
    try {
      const { data, error } = await supabase
        .from('click_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Error fetching user click logs:', error);
        return [];
      }
      
      return data.map(mapDatabaseClickLogToFrontend);
    } catch (error) {
      console.error('Error in fetchUserClickLogs:', error);
      return [];
    }
  }
  
  // Fetch all click logs (admin only)
  public async fetchAllClickLogs(limit = 100, offset = 0): Promise<FrontendClickLog[]> {
    try {
      const { data, error } = await supabase
        .from('click_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Error fetching all click logs:', error);
        return [];
      }
      
      return data.map(mapDatabaseClickLogToFrontend);
    } catch (error) {
      console.error('Error in fetchAllClickLogs:', error);
      return [];
    }
  }
  
  // Search click logs by various criteria
  public async searchClickLogs(params: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    action?: string;
    componentName?: string;
    limit?: number;
    offset?: number;
  }): Promise<FrontendClickLog[]> {
    try {
      let query = supabase.from('click_logs').select('*');
      
      if (params.userId) {
        query = query.eq('user_id', params.userId);
      }
      
      if (params.startDate) {
        query = query.gte('timestamp', params.startDate);
      }
      
      if (params.endDate) {
        query = query.lte('timestamp', params.endDate);
      }
      
      if (params.action) {
        query = query.eq('action', params.action);
      }
      
      if (params.componentName) {
        query = query.eq('component_name', params.componentName);
      }
      
      const { data, error } = await query
        .order('timestamp', { ascending: false })
        .range(
          params.offset || 0, 
          (params.offset || 0) + (params.limit || 100) - 1
        );
      
      if (error) {
        console.error('Error searching click logs:', error);
        return [];
      }
      
      return data.map(mapDatabaseClickLogToFrontend);
    } catch (error) {
      console.error('Error in searchClickLogs:', error);
      return [];
    }
  }
}
