/**
 * Core API functions for the application
 * This file contains reusable API utilities and functions
 */

import { supabase } from "@/integration/supabase/client";

/**
 * Generic API response type
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Generic API error handler
 */
export function handleApiError(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Generic API success response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    success: true
  };
}

/**
 * Generic API error response
 */
export function createErrorResponse(error: string): ApiResponse {
  return {
    error,
    success: false
  };
}
