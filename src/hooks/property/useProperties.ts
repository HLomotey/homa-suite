import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integration/supabase/client";
import { Property, FrontendProperty, mapDatabasePropertyToFrontend } from "@/integration/supabase/types/property";

export const useProperties = () => {
  const [properties, setProperties] = useState<FrontendProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all properties
  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          company_locations(*),
          billing_staff(legal_name)
        `)
        .order("title");

      if (error) throw error;

      const mappedProperties = (data || []).map(mapDatabasePropertyToFrontend);
      setProperties(mappedProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    isLoading,
    refetch: fetchProperties
  };
};

export default useProperties;
