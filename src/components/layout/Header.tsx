import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Building2,
  Calculator,
  FileText,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Calendar,
  Gift,
  Handshake,
  Route as RouteIcon,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('התנתקת בהצלחה');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('שגיאה בהתנתקות');
    }
  };

  const menuItems = [
    { path: '/', label: 'דשבורד', icon: <Building2 className="w-5 h-5" /> },
    { path: '/journey', label: 'מסע לקוח', icon: <RouteIcon className="w-5 h-5" /> },
    { path: '/clients', label: 'לקוחות', icon: <Users className="w-5 h-5" /> },
    { path: '/calculators', label: 'מחשבונים', icon: <Calculator className="w-5 h-5" /> },
    { path: '/reports', label: 'דוחות', icon: <FileText className="w-5 h-5" /> },
    { path: '/agreements', label: 'הסכמי סוכן', icon: <Handshake className="w-5 h-5" /> },
    { path: '/work-plan', label: 'תוכנית עבודה', icon: <Calendar className="w-5 h-5" /> },
    { path: '/birthdays', label: 'ימי הולדת', icon: <Gift className="w-5 h-5" /> },
    { path: '/promotions', label: 'מבצעים', icon: <Gift className="w-5 h-5" /> },
    { path: '/settings', label: 'הגדרות', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <div className="bg-white shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex-shrink-0 flex items-center mr-4">
                <img
                  className="h-8 w-auto"
                  src="/logo.png"
                  alt="Logo"
                />
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-5 h-5" />
                התנתק
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed top-16 right-0 h-full bg-white shadow-lg transition-all duration-300 z-20",
        isSidebarOpen ? "w-64" : "w-0"
      )}>
        <div className="flex flex-col h-full py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {item.icon}
              <span className={cn(
                "transition-all duration-300",
                isSidebarOpen ? "opacity-100" : "opacity-0"
              )}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "pt-16 transition-all duration-300",
        isSidebarOpen ? "mr-64" : "mr-0"
      )}>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Header; 