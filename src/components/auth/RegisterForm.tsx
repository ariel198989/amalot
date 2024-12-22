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
