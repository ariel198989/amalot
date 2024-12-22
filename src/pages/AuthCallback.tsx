import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // נסה לקבל את הטוקנים מה-URL
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        // אם יש טוקנים, נגדיר אותם
        if (accessToken && refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) throw sessionError;

          if (data.session) {
            if (type === 'signup') {
              toast.success('החשבון אומת בהצלחה');
            } else {
              toast.success('התחברת בהצלחה');
            }
            navigate('/');
            return;
          }
        }

        // אם אין טוקנים, נבדוק אם יש session קיים
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
          navigate('/');
        } else {
          navigate('/auth');
        }
      } catch (error: any) {
        console.error('Error in email confirmation:', error);
        setError(error.message || 'אירעה שגיאה באימות החשבון');
        toast.error(error.message || 'אירעה שגיאה באימות החשבון');
        navigate('/auth');
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-red-600">שגיאה באימות</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">מאמת את החשבון שלך...</h2>
        <p className="text-gray-600">אנא המתן</p>
      </div>
    </div>
  );
};

export default AuthCallback;
