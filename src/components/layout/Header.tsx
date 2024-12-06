import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  BadgeDollarSign,
  Bell,
  Menu,
  Gift,
  Clock,
  Search,
  X,
  Percent
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface HeaderProps {
  children: React.ReactNode;
  onLogout: () => void;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  birthday?: string;
}

interface Promotion {
  id: string;
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const Header: React.FC<HeaderProps> = ({ children, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<number>(0);
  const [activePromotions, setActivePromotions] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    checkUpcomingBirthdays();
    checkActivePromotions();
  }, []);

  const checkUpcomingBirthdays = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // מביא את כל הלקוחות עם תאריכי לידה
      const { data: clients, error } = await supabase
        .from('clients')
        .select('birthday')
        .eq('user_id', user.id);

      if (error) throw error;

      // בודק כמה ימי הולדת יש בשבוע הקרוב
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const birthdays = clients.filter(client => {
        if (!client.birthday) return false;
        const birthDate = new Date(client.birthday);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
      });

      setUpcomingBirthdays(birthdays.length);
    } catch (error) {
      console.error('Error checking birthdays:', error);
    }
  };

  const checkActivePromotions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString();
      
      const { data: promotions, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', today);

      if (error) throw error;

      setActivePromotions(promotions?.length || 0);
    } catch (error) {
      console.error('Error checking promotions:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: clients, error } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);

        if (error) throw error;

        // אם יש תוצאה אחת, ננווט ישירות לפרטי הלקוח
        if (clients.length === 1) {
          navigate(`/clients/${clients[0].id}`);
        } else {
          // אחרת ננווט לדף הלקוחות עם פרמטר החיפוש
          navigate(`/clients?search=${encodeURIComponent(searchQuery.trim())}`);
        }
        
        setIsSearchOpen(false);
        setSearchQuery('');
      } catch (error) {
        console.error('Error searching clients:', error);
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-4 py-2">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(true)}
              className="hover:bg-secondary-100 transition-all duration-200"
            >
              <Menu className="h-5 w-5 text-secondary-600" />
            </Button>
          </motion.div>
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="hover:bg-secondary-100 transition-all duration-200 relative p-2 rounded-full"
              >
                <Search className="h-5 w-5 text-secondary-600" />
              </Button>
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 300 }}
                    exit={{ opacity: 0, width: 0 }}
                    className="absolute left-0 top-0 h-full flex items-center"
                    onSubmit={handleSearch}
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="חפש לקוח..."
                      className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-secondary-200 rounded-full focus:outline-none focus:border-primary-500"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSearchOpen(false)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 hover:bg-secondary-100 p-1 rounded-full"
                    >
                      <X className="h-4 w-4 text-secondary-600" />
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
            <Link
              to="/promotions"
              className="hover:bg-secondary-100 transition-all duration-200 relative p-2 rounded-full"
            >
              <Percent className="h-5 w-5 text-secondary-600" />
              {activePromotions > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center text-xs text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {activePromotions}
                </motion.span>
              )}
            </Link>
            <Link
              to="/birthdays"
              className="hover:bg-secondary-100 transition-all duration-200 relative p-2 rounded-full"
            >
              <Gift className="h-5 w-5 text-secondary-600" />
              {upcomingBirthdays > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 h-5 w-5 bg-primary-500 rounded-full flex items-center justify-center text-xs text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {upcomingBirthdays}
                </motion.span>
              )}
            </Link>
            <Link
              to="/reminders"
              className="hover:bg-secondary-100 transition-all duration-200 relative p-2 rounded-full"
            >
              <Bell className="h-5 w-5 text-secondary-600" />
              <motion.span 
                className="absolute top-1 right-1 h-2 w-2 bg-primary-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              />
            </Link>
            <Link
              to="/schedule"
              className="hover:bg-secondary-100 transition-all duration-200 relative p-2 rounded-full"
            >
              <Clock className="h-5 w-5 text-secondary-600" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} onLogout={onLogout} />

      {/* Main Content */}
      <motion.div 
        className="flex-1 flex flex-col pt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <main className="flex-1 overflow-auto bg-secondary-50 p-6">
          <motion.div 
            className="container mx-auto"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
};

export default Header; 