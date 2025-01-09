import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  ChevronLeft,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { path: '/calculators', label: 'בדיקת כדאיות', icon: <Calculator className="w-5 h-5" /> },
    { path: '/reports', label: 'דוחות', icon: <FileText className="w-5 h-5" /> },
    { path: '/agreements', label: 'הסכמי סוכן', icon: <Handshake className="w-5 h-5" /> },
    { path: '/work-plan', label: 'תוכנית עבודה', icon: <Calendar className="w-5 h-5" /> },
  ];

  const topBarItems = [
    { path: '/promotions', label: 'מבצעים', icon: <Gift className="w-5 h-5" /> },
    { path: '/policy-duration', label: 'זמן פוליסה', icon: <Clock className="w-5 h-5" /> },
    { path: '/birthdays', label: 'ימי הולדת', icon: <Gift className="w-5 h-5" /> },
    { path: '/settings', label: 'הגדרות', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Top Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-l from-primary-900/5 via-white to-primary-900/5 shadow-lg fixed top-0 left-0 right-0 z-10 backdrop-blur-md border-b border-primary-100"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
            >
              {/* Desktop Menu Toggle */}
              <motion.button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden md:flex p-2 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 focus:outline-none shadow-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSidebarOpen ? 'close' : 'open'}
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 focus:outline-none shadow-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isMobileMenuOpen ? 'close' : 'open'}
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              <motion.div 
                className="flex-shrink-0 flex items-center mr-4"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-primary-600 to-primary-400 text-white font-bold text-xl px-3 py-1 rounded-lg shadow-md">
                    A
                  </div>
                  <span className="text-lg font-semibold bg-gradient-to-r from-primary-600 to-primary-400 text-transparent bg-clip-text">
                    Amalot
                  </span>
                </div>
              </motion.div>
            </motion.div>
            <div className="hidden md:flex items-center gap-3">
              {topBarItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                      location.pathname === item.path
                        ? "bg-primary-50 text-primary-600 shadow-sm border border-primary-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-primary-600"
                    )}
                  >
                    <motion.div
                      whileHover={{ rotate: 15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {item.icon}
                    </motion.div>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="h-6 w-px bg-gray-200 mx-2" />
              <motion.button
                onClick={handleLogout}
                className="relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 rounded-full hover:bg-primary-50 border border-transparent hover:border-primary-200 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-5 h-5" />
                התנתק
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-16 left-0 right-0 bg-white shadow-lg z-30 border-b border-primary-100"
          >
            <div className="p-4 space-y-2">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                      location.pathname === item.path
                        ? "bg-primary-100/50 text-primary-700 shadow-sm border border-primary-200"
                        : "text-gray-600 hover:bg-primary-50 hover:text-primary-600"
                    )}
                  >
                    <div className={cn(
                      "p-1 rounded-lg",
                      location.pathname === item.path
                        ? "bg-primary-200/50"
                        : "bg-transparent"
                    )}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}
              {topBarItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (menuItems.length + index) * 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                      location.pathname === item.path
                        ? "bg-primary-100/50 text-primary-700 shadow-sm border border-primary-200"
                        : "text-gray-600 hover:bg-primary-50 hover:text-primary-600"
                    )}
                  >
                    <div className={cn(
                      "p-1 rounded-lg",
                      location.pathname === item.path
                        ? "bg-primary-200/50"
                        : "bg-transparent"
                    )}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (menuItems.length + topBarItems.length) * 0.1 }}
              >
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all duration-300"
                >
                  <div className="p-1 rounded-lg">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span>התנתק</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div 
        className={cn(
          "fixed top-16 right-0 h-full bg-gradient-to-b from-white to-primary-50/30 shadow-lg z-20 overflow-hidden",
          "backdrop-blur-md border-l border-primary-100",
          "hidden md:block"
        )}
        initial={{ width: isSidebarOpen ? 256 : 0 }}
        animate={{ width: isSidebarOpen ? 256 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div 
          className="flex flex-col h-full py-4"
          initial={{ x: 50 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 mx-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300",
                  location.pathname === item.path
                    ? "bg-primary-100/50 text-primary-700 shadow-sm border border-primary-200"
                    : "text-gray-600 hover:bg-primary-50 hover:text-primary-600 hover:border hover:border-primary-100"
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={cn(
                    "p-1 rounded-lg",
                    location.pathname === item.path
                      ? "bg-primary-200/50"
                      : "bg-transparent"
                  )}
                >
                  {item.icon}
                </motion.div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={cn(
                    "transition-all duration-300 flex-1",
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  )}
                >
                  {item.label}
                </motion.span>
                {location.pathname === item.path && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ChevronLeft className="w-4 h-4 text-primary-600" />
                  </motion.div>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="pt-16 transition-all duration-300 md:mr-0"
        animate={{ marginRight: isSidebarOpen ? 256 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <main className="p-6">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
};

export default Header; 