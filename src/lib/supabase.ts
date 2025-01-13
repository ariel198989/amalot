import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Use process.env for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}

// Validate URL format
try {
    new URL(supabaseUrl);
} catch (error) {
    throw new Error('Invalid VITE_SUPABASE_URL format');
}

// Create a single instance of the Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// קליינט נפרד עם service role key לפעולות אדמין
export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Helper function to get the current user or return dummy user
export const getCurrentUser = async () => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return { data: { user } };
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

// Helper function to handle email verification
export const handleEmailVerification = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        // אם אין session, ננסה לאמת את המייל מה-URL
        if (!session) {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
                const { data, error: setSessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
                
                if (setSessionError) throw setSessionError;
                return { session: data.session };
            }
        }

        return { session };
    } catch (error) {
        console.error('Error in email verification:', error);
        throw error;
    }
};