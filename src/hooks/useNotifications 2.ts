import { useEffect, useState } from "react";
import { supabase } from "@/integration/supabase/client";
import { useAuth } from "@/components/auth";

export function useNotifications(limit = 10) {
  const { user } = useAuth();
  const userId = user?.id;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const queryFn = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) {
          // Check if it's a 404 error (table doesn't exist)
          if (error.code === "404" || error.code === "PGRST116") {
            console.warn("Notifications table may not exist yet:", error.message);
            return []; // Return empty array instead of throwing
          }
          throw error;
        }

        return data || [];
      } catch (error: any) {
        console.error("Error fetching notifications:", error?.message || error);
        return []; // Return empty array to prevent UI breaks
      }
    };

    queryFn()
      .then(setNotifications)
      .catch((error) => {
        setError(error.message);
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, [userId, limit]);

  return { notifications, loading, error };
}