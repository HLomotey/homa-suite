/**
 * Hook for managing global inventory items
 */

import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/use-toast';
import { FrontendInventoryItem } from '../../integration/supabase/types/inventory';
import { supabase } from '../../integration/supabase';
import { mapInventoryItemToFrontend } from '../../integration/supabase/types/inventory';

export function useInventoryItems() {
  const [items, setItems] = useState<FrontendInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('inventory_items')
        .select(`
          *,
          inventory_categories!category_id (
            id,
            name,
            color_code,
            icon_name
          )
        `)
        .order('name');

      if (fetchError) {
        throw fetchError;
      }

      const mappedItems = data?.map(mapInventoryItemToFrontend) || [];
      setItems(mappedItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory items';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const refetch = () => {
    fetchItems();
  };

  return {
    items,
    loading,
    error,
    refetch,
  };
}
