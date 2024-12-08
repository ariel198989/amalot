import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// וידוא שה-URL תקין
const formattedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;

try {
  new URL(formattedUrl);
} catch (error) {
  console.error('כתובת Supabase לא תקינה:', formattedUrl);
  throw new Error('Invalid VITE_SUPABASE_URL format');
}

// יצירת מופע יחיד של קליינט Supabase עם הגדרות משופרות
export const supabase = createClient(formattedUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        const item = localStorage.getItem(key);
        console.log('Supabase קורא מהאחסון:', key, item ? 'נמצא' : 'לא נמצא');
        return item;
      },
      setItem: (key, value) => {
        console.log('Supabase כותב לאחסון:', key);
        localStorage.setItem(key, value);
      },
      removeItem: (key) => {
        console.log('Supabase מוחק מהאחסון:', key);
        localStorage.removeItem(key);
      }
    }
  }
});

// בדיקת חיבור ראשונית
const initializeSupabase = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    console.log('בדיקת סשן ראשונית:', session?.user?.id);
    if (session?.user) {
      console.log('נמצא משתמש מחובר:', session.user.id);
      localStorage.setItem('supabase.auth.token', JSON.stringify(session));
    } else {
      console.log('לא נמצא משתמש מחובר');
    }
  } catch (error) {
    console.error('שגיאה בבדיקת הסשן הראשונית:', error);
  }
};

initializeSupabase();

// הוספת האזנה לשינויים במצב ההתחברות
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('שינוי במצב ההתחברות:', event, 'משתמש:', session?.user?.id);
  
  try {
    if (session?.user) {
      console.log('משתמש התחבר/התעדכן:', session.user.id);
      localStorage.setItem('supabase.auth.token', JSON.stringify(session));
    } else {
      console.log('משתמש התנתק');
      localStorage.removeItem('supabase.auth.token');
    }
  } catch (error) {
    console.error('שגיאה בטיפול בשינוי מצב ההתחברות:', error);
  }
});