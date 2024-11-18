import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qdlkmgoloyyuvvndhzrs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbGttZ29sb3l5dXZ2bmRoenJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5MzY3NjcsImV4cCI6MjA0NzUxMjc2N30.FbXH9iu7cWZKtfvBP_6RJTjvxdngUUJHL8Q3SwnpqoM';

export const supabase = createClient(supabaseUrl, supabaseKey); 