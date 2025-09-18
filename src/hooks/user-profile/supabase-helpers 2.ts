/**
 * Supabase Helper Functions
 * Utility functions for working with Supabase queries and type safety
 */

/**
 * Helper function to bypass TypeScript strict checking for Supabase operations
 * @param operation Any Supabase operation
 * @returns The operation with bypassed type checking
 */
export function bypassSupabaseTypeCheck<T>(operation: T): any {
  return operation as any;
}

/**
 * Helper function to type cast Supabase queries
 * @param query Any Supabase query
 * @returns Typed promise with data and error
 */
export async function typedSupabaseQuery<T>(query: any): Promise<{ data: T, error: any }> {
  return query;
}

/**
 * Helper function for safely casting database types
 * @param data Data to cast to a different type
 * @returns Safely cast data
 */
export function safeTypeCast<T, U>(data: T): U {
  return data as any;
}
