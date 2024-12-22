import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/all components/shadcn/button";
import { Input } from "@/components/ui/all components/shadcn/input";
import { Label } from "@/components/ui/all components/shadcn/label";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast.success('התחברת בהצלחה');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'אירעה שגיאה בהתחברות');
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
          placeholder="הכנס סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button 
        type="submit" 
        className="w-full"
        disabled={loading}
      >
        {loading ? 'מתבצעת התחברות...' : 'התחברות'}
      </Button>
    </form>
  );
};

export default LoginForm;
