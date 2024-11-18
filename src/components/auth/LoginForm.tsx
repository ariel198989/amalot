import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Mail, UserPlus, LogIn, ArrowLeft } from 'lucide-react';

interface LoginFormProps {
  onLogin: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = (data: LoginFormData) => {
    console.log(data);
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4" dir="rtl">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-blue-900">
              {isLogin ? 'ברוכים הבאים' : 'הרשמה למערכת'}
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              {isLogin ? 'התחבר כדי להמשיך' : 'צור חשבון חדש'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  שם מלא
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    {...register('fullName', {
                      required: isLogin ? false : 'שדה חובה'
                    })}
                    className="pr-10"
                    placeholder="ישראל ישראלי"
                  />
                  <UserPlus className="h-5 w-5 text-gray-400 absolute top-2.5 right-3" />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                דואר אלקטרוני
              </label>
              <div className="relative">
                <Input
                  type="email"
                  {...register('email', {
                    required: 'שדה חובה',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'כתובת אימייל לא תקינה'
                    }
                  })}
                  className="pr-10"
                  placeholder="your@email.com"
                  dir="ltr"
                />
                <Mail className="h-5 w-5 text-gray-400 absolute top-2.5 right-3" />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                סיסמה
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'שדה חובה',
                    minLength: {
                      value: 6,
                      message: 'סיסמה חייבת להכיל לפחות 6 תווים'
                    }
                  })}
                  className="pr-10"
                  placeholder="הזן סיסמה"
                  dir="ltr"
                />
                <Lock className="h-5 w-5 text-gray-400 absolute top-2.5 right-3" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1.5 left-1.5 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  אימות סיסמה
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: isLogin ? false : 'שדה חובה',
                      validate: (val: string | undefined) => {
                        if (!isLogin && val !== watch('password')) {
                          return 'הסיסמאות אינן תואמות';
                        }
                      }
                    })}
                    className="pr-10"
                    placeholder="הזן סיסמה שוב"
                    dir="ltr"
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute top-2.5 right-3" />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700"
            >
              {isLogin ? 'התחברות' : 'הרשמה'}
            </Button>

            <div className="text-center space-y-3">
              <Button
                type="button"
                variant="link"
                className="text-sm text-blue-600 hover:text-blue-700"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? (
                  <span className="flex items-center gap-2">
                    עדיין אין לך חשבון? הירשם עכשיו
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    יש לך כבר חשבון? התחבר
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                )}
              </Button>

              {isLogin && (
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  שכחת סיסמה?
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm; 