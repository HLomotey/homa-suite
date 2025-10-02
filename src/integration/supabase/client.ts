import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database';

// Initialize Supabase client with environment variables
// Make sure to add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anonymous Key is missing. Please check your environment variables.');
} else {
  console.log('✅ Supabase config loaded:', { 
    hasUrl: !!supabaseUrl, 
    hasAnonKey: !!supabaseAnonKey,
    urlPreview: supabaseUrl?.substring(0, 30) + '...'
  });
}

// Create Supabase client with unique storage key (removed custom fetch for debugging)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'supabase-main-auth-token' // Unique storage key for main client
  }
});

// Import admin client from dedicated admin-client file to avoid duplicate creation
// Do NOT import or re-export the admin client here to avoid initializing multiple Supabase clients in the browser bundle.

// Helper function to get user session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return data.session;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return data.user;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    return false;
  }
  return true;
};
