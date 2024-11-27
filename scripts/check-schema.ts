import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qdlkmgoloyyuvvndhzrs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbGttZ29sb3l5dXZ2bmRoenJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MDY2NzUsImV4cCI6MjA0ODE4MjY3NX0.jUXkR58dqtvDND95FuECu4NQoarrIKgscU7RHf6VuoU';

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    try {
        // Check if tables exist
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

        if (tablesError) {
            console.error('Error checking tables:', tablesError);
        } else {
            console.log('Tables in schema:', tables);
        }

        // Check clients table structure
        const { data: clientColumns, error: clientColumnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_schema', 'public')
            .eq('table_name', 'clients');

        if (clientColumnsError) {
            console.error('Error checking client columns:', clientColumnsError);
        } else {
            console.log('Client table structure:', clientColumns);
        }

        // Check sales table structure
        const { data: salesColumns, error: salesColumnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_schema', 'public')
            .eq('table_name', 'sales');

        if (salesColumnsError) {
            console.error('Error checking sales columns:', salesColumnsError);
        } else {
            console.log('Sales table structure:', salesColumns);
        }

        // בדיקת מבנה טבלת המכירות
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Sales table columns:', data ? Object.keys(data[0]) : []);
            console.log('Sample data:', data);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkSchema();
