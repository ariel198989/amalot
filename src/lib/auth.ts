import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: מאתחל מצב התחברות');
    
    // בדיקת סשן מהלוקל סטורג'
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        if (parsedSession?.user) {
          console.log('AuthProvider: משתמש נמצא בלוקל סטורג\':', parsedSession.user.id);
          setSession(parsedSession);
          setUser(parsedSession.user);
        }
      } catch (error) {
        console.error('שגיאה בקריאת הסשן מהלוקל סטורג\':', error);
        localStorage.removeItem('supabase.auth.token');
      }
    }

    // בדיקת סשן פעיל מול השרת
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          console.log('AuthProvider: משתמש מחובר:', session.user.id);
          setSession(session);
          setUser(session.user);
          localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        } else {
          console.log('AuthProvider: אין משתמש מחובר');
          setSession(null);
          setUser(null);
          localStorage.removeItem('supabase.auth.token');
        }
      } catch (error) {
        console.error('שגיאה בקבלת הסשן:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // האזנה לשינויים במצב ההתחברות
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthProvider: שינוי במצב ההתחברות:', event, session?.user?.id);
      
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      } else {
        setSession(null);
        setUser(null);
        localStorage.removeItem('supabase.auth.token');
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        toast.success('התחברת בהצלחה!');
      }
    } catch (error: any) {
      console.error('שגיאה בהתחברות:', error);
      toast.error(error.message || 'שגיאה בהתחברות');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      localStorage.removeItem('supabase.auth.token');
      toast.success('התנתקת בהצלחה!');
    } catch (error: any) {
      console.error('שגיאה בהתנתקות:', error);
      toast.error(error.message || 'שגיאה בהתנתקות');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut
  };
} 