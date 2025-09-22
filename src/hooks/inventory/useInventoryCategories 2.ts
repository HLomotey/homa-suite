/**
 * React hooks for inventory category management
 * These hooks provide easy-to-use interfaces for category CRUD operations
 */

import { useState, useEffect } from 'react';
import { 
  createInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
  getInventoryCategories,
  getInventoryCategory,
  getInventoryCategoriesHierarchy
} from './api';
import { FrontendInventoryCategory } from '../../integration/supabase/types/inventory';

/**
 * Hook for managing inventory categories list
 */
export const useInventoryCategories = (hierarchical: boolean = false) => {
  const [categories, setCategories] = useState<FrontendInventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = hierarchical 
        ? await getInventoryCategoriesHierarchy()
        : await getInventoryCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Error fetching inventory categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [hierarchical]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};

/**
 * Hook for managing a single inventory category
 */
export const useInventoryCategory = (id: string | null) => {
  const [category, setCategory] = useState<FrontendInventoryCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventoryCategory(categoryId);
      setCategory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category');
      console.error('Error fetching inventory category:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategory(id);
    } else {
      setCategory(null);
      setLoading(false);
    }
  }, [id]);

  return {
    category,
    loading,
    error,
    refetch: id ? () => fetchCategory(id) : () => {}
  };
};

/**
 * Hook for creating inventory categories
 */
export const useCreateInventoryCategory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (categoryData: Omit<FrontendInventoryCategory, "id">) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createInventoryCategory(categoryData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      setError(errorMessage);
      console.error('Error creating inventory category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    loading,
    error
  };
};

/**
 * Hook for updating inventory categories
 */
export const useUpdateInventoryCategory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (
    id: string, 
    categoryData: Partial<Omit<FrontendInventoryCategory, "id">>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateInventoryCategory(id, categoryData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      setError(errorMessage);
      console.error('Error updating inventory category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    update,
    loading,
    error
  };
};

/**
 * Hook for deleting inventory categories
 */
export const useDeleteInventoryCategory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteInventoryCategory(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      setError(errorMessage);
      console.error('Error deleting inventory category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    delete: deleteCategory,
    loading,
    error
  };
};

/**
 * Hook for comprehensive category management
 * Combines all CRUD operations in a single hook
 */
export const useInventoryCategoryManager = () => {
  const { categories, loading: listLoading, error: listError, refetch } = useInventoryCategories();
  const { create, loading: createLoading, error: createError } = useCreateInventoryCategory();
  const { update, loading: updateLoading, error: updateError } = useUpdateInventoryCategory();
  const { delete: deleteCategory, loading: deleteLoading, error: deleteError } = useDeleteInventoryCategory();

  const createAndRefetch = async (categoryData: Omit<FrontendInventoryCategory, "id">) => {
    const result = await create(categoryData);
    await refetch();
    return result;
  };

  const updateAndRefetch = async (
    id: string, 
    categoryData: Partial<Omit<FrontendInventoryCategory, "id">>
  ) => {
    const result = await update(id, categoryData);
    await refetch();
    return result;
  };

  const deleteAndRefetch = async (id: string) => {
    await deleteCategory(id);
    await refetch();
  };

  return {
    categories,
    loading: listLoading || createLoading || updateLoading || deleteLoading,
    error: listError || createError || updateError || deleteError,
    create: createAndRefetch,
    update: updateAndRefetch,
    delete: deleteAndRefetch,
    refetch
  };
};
