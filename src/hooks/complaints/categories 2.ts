/**
 * API functions for complaint categories and subcategories
 */

import { supabase } from "@/integration/supabase";
import { 
  ComplaintCategory, 
  ComplaintSubcategory,
  ComplaintAssetType
} from "@/integration/supabase/types/complaints";
import { PostgrestError } from "@supabase/supabase-js";

// Get complaint categories from the complaint_categories table
export const getComplaintCategories = async (
  assetType?: ComplaintAssetType
): Promise<{ data: ComplaintCategory[] | null; error: PostgrestError | null }> => {
  try {
    let query = supabase
      .from("complaint_categories")
      .select("*")
      .order("name");
    
    // Filter by asset type if provided
    if (assetType) {
      query = query.eq("asset_type", assetType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching complaint categories:", error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Unexpected error fetching complaint categories:", error);
    return { data: null, error: error as PostgrestError };
  }
};

// Get complaint subcategories from the complaint_subcategories table
export const getComplaintSubcategories = async (
  categoryId?: string,
  assetType?: ComplaintAssetType
): Promise<{ data: ComplaintSubcategory[] | null; error: PostgrestError | null }> => {
  try {
    let query = supabase
      .from("complaint_subcategories")
      .select("*")
      .order("name");
    
    // Filter by category if provided
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
    
    // Filter by asset type if provided
    if (assetType) {
      query = query.eq("asset_type", assetType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching complaint subcategories:", error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Unexpected error fetching complaint subcategories:", error);
    return { data: null, error: error as PostgrestError };
  }
};

// Get a single complaint category by ID
export const getComplaintCategoryById = async (
  id: string
): Promise<{ data: ComplaintCategory | null; error: PostgrestError | null }> => {
  try {
    const { data, error } = await supabase
      .from("complaint_categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching complaint category with ID ${id}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Unexpected error fetching complaint category with ID ${id}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Get a single complaint subcategory by ID
export const getComplaintSubcategoryById = async (
  id: string
): Promise<{ data: ComplaintSubcategory | null; error: PostgrestError | null }> => {
  try {
    const { data, error } = await supabase
      .from("complaint_subcategories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching complaint subcategory with ID ${id}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Unexpected error fetching complaint subcategory with ID ${id}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Get categories with their subcategories
export const getCategoriesWithSubcategories = async (
  assetType?: ComplaintAssetType
): Promise<{ 
  data: (ComplaintCategory & { subcategories: ComplaintSubcategory[] })[] | null; 
  error: PostgrestError | null 
}> => {
  try {
    let query = supabase
      .from("complaint_categories")
      .select(`
        *,
        subcategories:complaint_subcategories(*)
      `)
      .order("name");
    
    // Filter by asset type if provided
    if (assetType) {
      query = query.eq("asset_type", assetType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching categories with subcategories:", error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Unexpected error fetching categories with subcategories:", error);
    return { data: null, error: error as PostgrestError };
  }
};
