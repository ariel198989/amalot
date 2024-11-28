import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qdlkmgoloyyuvvndhzrs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbGttZ29sb3l5dXZ2bmRoenJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MDY2NzUsImV4cCI6MjA0ODE4MjY3NX0.jUXkR58dqtvDND95FuECu4NQoarrIKgscU7RHf6VuoU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    try {
        // בדיקת מבנה טבלת הלקוחות
        const { data: clientColumns, error: clientColumnsError } = await supabase
            .from('clients')
            .select('*')
            .limit(1);

        if (clientColumnsError) {
            console.error('Error checking client columns:', clientColumnsError);
        } else {
            console.log('Client table structure:', Object.keys(clientColumns[0] || {}));
        }

        // בדיקת מבנה טבלת המכירות
        const { data: salesColumns, error: salesColumnsError } = await supabase
            .from('sales')
            .select('*')
            .limit(1);

        if (salesColumnsError) {
            console.error('Error checking sales columns:', salesColumnsError);
        } else {
            console.log('Sales table structure:', Object.keys(salesColumns[0] || {}));
        }

    } catch (error) {
        console.error('Error checking schema:', error);
    }
}

checkSchema();
