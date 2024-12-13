import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Validate URL format
try {
    new URL(supabaseUrl);
} catch (error) {
    throw new Error('Invalid VITE_SUPABASE_URL format');
}

// Create and export the typed client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    global: {
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Prefer': 'return=representation'
        }
    }
});