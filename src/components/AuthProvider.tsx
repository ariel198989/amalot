import React, { useEffect } from 'react';
import { AuthContext, useAuthProvider } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();

  useEffect(() => {
    console.log('AuthProvider: בודק סשן התחלתי');
    
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          console.log('AuthProvider: נמצא משתמש מחובר:', session.user.id);
          localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        } else {
          console.log('AuthProvider: לא נמצא משתמש מחובר');
        }
      } catch (error) {
        console.error('שגיאה בבדיקת הסשן:', error);
      }
    };

    initSession();
  }, []);

  if (auth.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <div className="mr-3 text-indigo-600">טוען...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
} 