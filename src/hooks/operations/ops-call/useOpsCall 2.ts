import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integration/supabase/client";
import {
  OpsCall,
  FrontendOpsCall,
  CreateOpsCall,
  UpdateOpsCall,
  OpsCallFormData,
  OpsCallFilters,
  OpsCallStats,
  OpsCallStatus,
} from "@/integration/supabase/types/operations-call";

export const useOpsCall = () => {
  const { toast } = useToast();
  const [opsCalls, setOpsCalls] = useState<FrontendOpsCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<OpsCallStats | null>(null);

  // Fetch all ops calls with optional filters
  const fetchOpsCalls = async (filters?: OpsCallFilters) => {
    setLoading(true);
    try {
      // Apply filters
      let query = supabase
        .from("ops_calls")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.hotel_site) {
        query = query.ilike("hotel_site", `%${filters.hotel_site}%`);
      }
      if (filters?.start_date) {
        query = query.gte("start_date", filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte("end_date", filters.end_date);
      }
      if (filters?.created_by) {
        query = query.eq("created_by", filters.created_by);
      }

      const { data, error } = await query as { data: any[] | null; error: any };

      if (error) throw error;

      // Transform data to include computed fields
      const transformedData: FrontendOpsCall[] = data?.map((item: any) => ({
        ...item,
        created_by_name: null, // Will be populated separately if needed
        approved_by_name: null, // Will be populated separately if needed
      })) || [];

      setOpsCalls(transformedData);
    } catch (error) {
      console.error("Error fetching ops calls:", error);
      toast({
        title: "Error",
        description: "Failed to fetch ops calls",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new ops call
  const createOpsCall = async (data: OpsCallFormData): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const createData: CreateOpsCall = {
        ...data,
        status: "draft",
        created_by: user.id,
      };

      const { data: newOpsCall, error } = await (supabase
        .from("ops_calls") as any)
        .insert([createData])
        .select()
        .single() as { data: OpsCall | null; error: any };

      if (error) throw error;
      if (!newOpsCall) throw new Error("Failed to create ops call");

      toast({
        title: "Success",
        description: "Ops call created successfully",
      });

      // Refresh the list
      await fetchOpsCalls();
      
      return newOpsCall.id;
    } catch (error) {
      console.error("Error creating ops call:", error);
      toast({
        title: "Error",
        description: "Failed to create ops call",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update an existing ops call
  const updateOpsCall = async (id: string, data: Partial<OpsCallFormData>): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const updateData: UpdateOpsCall = {
        ...data,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase
        .from("ops_calls") as any)
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ops call updated successfully",
      });

      // Refresh the list
      await fetchOpsCalls();
      
      return true;
    } catch (error) {
      console.error("Error updating ops call:", error);
      toast({
        title: "Error",
        description: "Failed to update ops call",
        variant: "destructive",
      });
      return false;
    }
  };

  // Submit an ops call for approval
  const submitOpsCall = async (id: string): Promise<boolean> => {
    try {
      const { error } = await (supabase
        .from("ops_calls") as any)
        .update({ status: "submitted" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ops call submitted for approval",
      });

      // Refresh the list
      await fetchOpsCalls();
      
      return true;
    } catch (error) {
      console.error("Error submitting ops call:", error);
      toast({
        title: "Error",
        description: "Failed to submit ops call",
        variant: "destructive",
      });
      return false;
    }
  };

  // Approve an ops call
  const approveOpsCall = async (id: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await (supabase
        .from("ops_calls") as any)
        .update({
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ops call approved successfully",
      });

      // Refresh the list
      await fetchOpsCalls();
      
      return true;
    } catch (error) {
      console.error("Error approving ops call:", error);
      toast({
        title: "Error",
        description: "Failed to approve ops call",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete an ops call
  const deleteOpsCall = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("ops_calls")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ops call deleted successfully",
      });

      // Refresh the list
      await fetchOpsCalls();
      
      return true;
    } catch (error) {
      console.error("Error deleting ops call:", error);
      toast({
        title: "Error",
        description: "Failed to delete ops call",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get ops call statistics
  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("ops_calls")
        .select("status, start_occupancy_pct, end_occupancy_pct, average_occupancy_pct, cleanliness_score, created_at") as { data: any[] | null; error: any };

      if (error) throw error;

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      if (!data) {
        setStats({
          total: 0,
          draft: 0,
          submitted: 0,
          approved: 0,
          this_month: 0,
          last_month: 0,
          avg_occupancy: 0,
          avg_cleanliness_score: 0,
        });
        return;
      }

      const stats: OpsCallStats = {
        total: data.length,
        draft: data.filter(item => item.status === "draft").length,
        submitted: data.filter(item => item.status === "submitted").length,
        approved: data.filter(item => item.status === "approved").length,
        this_month: data.filter(item => new Date(item.created_at) >= thisMonth).length,
        last_month: data.filter(item => {
          const createdAt = new Date(item.created_at);
          return createdAt >= lastMonth && createdAt < thisMonth;
        }).length,
        avg_occupancy: data.reduce((sum, item) => {
          const avg = item.average_occupancy_pct || 0;
          return sum + avg;
        }, 0) / (data.length || 1),
        avg_cleanliness_score: data.reduce((sum, item) => {
          const score = item.cleanliness_score || 0;
          return sum + score;
        }, 0) / (data.length || 1),
      };

      setStats(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Get a single ops call by ID
  const getOpsCallById = async (id: string): Promise<FrontendOpsCall | null> => {
    try {
      const { data, error } = await supabase
        .from("ops_calls")
        .select(`
          *,
          created_by_profile:created_by(full_name),
          approved_by_profile:approved_by(full_name)
        `)
        .eq("id", id)
        .single() as { data: any | null; error: any };

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        created_by_name: data.created_by_profile?.full_name,
        approved_by_name: data.approved_by_profile?.full_name,
      };
    } catch (error) {
      console.error("Error fetching ops call:", error);
      return null;
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchOpsCalls();
    fetchStats();
  }, []);

  return {
    opsCalls,
    loading,
    stats,
    fetchOpsCalls,
    createOpsCall,
    updateOpsCall,
    submitOpsCall,
    approveOpsCall,
    deleteOpsCall,
    fetchStats,
    getOpsCallById,
  };
};
