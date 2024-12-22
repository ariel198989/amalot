import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/all components/shadcn/button";
import { Input } from "@/components/ui/all components/shadcn/input";
import { Label } from "@/components/ui/all components/shadcn/label";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0]
          }
        }
      });

      if (error) {
        if (error.message.includes('already been registered')) {
          toast.error('משתמש עם אימייל זה כבר קיים במערכת');
        } else {
          throw error;
        }
        return;
      }

      if (data?.user) {
        // 2. Wait for the user to be fully created in auth
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: email.split('@')[0]
            }
          ])
          .select()
          .single();

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          toast.error('אירעה שגיאה ביצירת הפרופיל');
          return;
        }

        // 4. Wait for the user profile to be fully created
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 5. Create default sales settings
        const { error: settingsError } = await supabase
          .from('sales_settings')
          .insert([
            {
              user_id: data.user.id,
              pension_target: 0,
              insurance_target: 0,
              investment_target: 0,
              policy_target: 0,
              closing_rate: 0,
              monthly_meetings: 0
            }
          ])
          .select()
          .single();

        if (settingsError) {
          console.error('Error creating sales settings:', settingsError);
          toast.error('נוצר חשבון אך הייתה שגיאה ביצירת הגדרות המכירות');
          return;
        }

        toast.success('נרשמת בהצלחה! אנא אשר את האימייל שלך');
        navigate('/auth/verify');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'אירעה שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="email">אימייל</Label>
        <Input
          id="email"
          type="email"
          placeholder="הכנס את האימייל שלך"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">סיסמה</Label>
        <Input
          id="password"
          type="password"
          placeholder="הכנס סיסמה (לפחות 6 תווים)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </div>
      <Button 
        type="submit" 
        className="w-full"
        disabled={loading}
      >
        {loading ? 'מתבצעת הרשמה...' : 'הרשמה'}
      </Button>
    </form>
  );
};

export default RegisterForm;
