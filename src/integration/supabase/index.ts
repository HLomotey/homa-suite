// Export supabase client and auth helpers (browser-safe)
export { supabase, getSession, getCurrentUser, signOut } from './client';

// Note: Admin client export removed to prevent Multiple GoTrueClient instances warning
// Import admin-client directly where needed in server-side code only
// export { supabaseAdmin } from './admin-client';
