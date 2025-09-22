import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Re-export the canonical client to ensure a single Supabase instance
// This avoids the "Multiple GoTrueClient instances" warning
export { supabase } from '../integration/supabase/client';
