// Export supabase client and auth helpers (browser-safe)
export { supabase, getSession, getCurrentUser, signOut } from './client';

// Export admin client separately to avoid initializing it when importing the browser client
export { supabaseAdmin } from './admin-client';
