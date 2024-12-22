import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  PiggyBank,
  Users,
  LineChart,
  Settings,
  X,
  BarChart4,
  HandCoins,
  CircleDollarSign,
  CalendarDays,
  LogOut
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { 
    id: 'dashboard',
    title: 'דשבורד', 
    path: '/', 
    icon: LayoutDashboard,
    description: 'סקירה כללית של הנתונים'
  },
  { 
    id: 'work-plan',
    title: 'תכנית עבודה שנתית', 
    path: '/work-plan', 
    icon: CalendarDays,
    description: 'ניהול תכנית עבודה ויעדים שנתיים'
  },
  { 
    id: 'calculators',
    title: 'מחשבוני עמלות', 
    path: '/calculators', 
    icon: CircleDollarSign,
    description: 'חישוב עמלות לפי סוגי מוצרים'
  },
  { 
    id: 'reports',
    title: 'דוחות', 
    path: '/reports', 
    icon: BarChart4,
    description: 'דוחות מכירות ועמלות'
  },
  { 
    id: 'agreements',
    title: 'הסכמי סוכן', 
    path: '/agreements', 
    icon: HandCoins,
    description: 'ניהול הסכמי עמלות מול חברות'
  },
  { 
    id: 'clients',
    title: 'לקוחות', 
    path: '/clients', 
    icon: Users,
    description: 'ניהול לקוחות ופעולות'
  },
  { 
    id: 'journey',
    title: 'מסע לקוח', 
    path: '/journey', 
    icon: LineChart,
    description: 'ניהול פגישות ומכירות ללקוח'
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isActivePath = (path: string) => location.pathname === path;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div 
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div 
            key="sidebar"
            className={cn(
              "fixed top-0 right-0 h-full w-80",
              "bg-white border-l border-secondary-200",
              "z-50"
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          >
            {/* Close Button */}
            <motion.div 
              className="absolute left-2 top-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-secondary-100 transition-all duration-200"
              >
                <X className="h-6 w-6 text-secondary-600" />
              </Button>
            </motion.div>

            {/* Sidebar Content */}
            <div className="flex flex-col h-full p-6 overscroll-none">
              {/* Logo */}
              <motion.div 
                className="flex items-center gap-3 mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div 
                  className="p-2 bg-primary-100 rounded-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PiggyBank className="h-7 w-7 text-primary-600" />
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    מערכת עמלות
                  </motion.h1>
                  <motion.p 
                    className="text-sm text-secondary-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    ניהול ומעקב עמלות
                  </motion.p>
                </div>
              </motion.div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1.5">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className={cn(
                        "group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                        isActivePath(item.path)
                          ? "bg-primary-50 text-primary-600 shadow-sm ring-1 ring-primary-100"
                          : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                      )}
                      onClick={onClose}
                    >
                      <motion.div 
                        className={cn(
                          "p-2 rounded-lg transition-colors duration-200",
                          isActivePath(item.path)
                            ? "bg-primary-100 text-primary-600"
                            : "bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200"
                        )}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <item.icon className="h-5 w-5" />
                      </motion.div>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-secondary-500">{item.description}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom Navigation */}
              <motion.div 
                className="border-t border-secondary-100 pt-4 mt-4 space-y-1.5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  to="/settings"
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActivePath('/settings')
                      ? "bg-primary-50 text-primary-600 shadow-sm ring-1 ring-primary-100"
                      : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                  )}
                  onClick={onClose}
                >
                  <motion.div 
                    className={cn(
                      "p-2 rounded-lg transition-colors duration-200",
                      isActivePath('/settings')
                        ? "bg-primary-100 text-primary-600"
                        : "bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200"
                    )}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Settings className="h-5 w-5" />
                  </motion.div>
                  <div>
                    <div className="font-medium">הגדרות</div>
                    <div className="text-xs text-secondary-500">הגדרות מערכת</div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;