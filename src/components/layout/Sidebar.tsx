import React, { useState } from 'react';
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
  CalendarDays
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id?: string;
  title?: string;
  path?: string;
  icon?: React.ComponentType;
  description?: string;
  name?: string;
  href?: string;
}

const navItems: NavItem[] = [
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
  },
  {
    name: 'הגדרות',
    icon: Settings,
    href: '/settings'
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const pathname = location.pathname;

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
            {/* Navigation */}
            <nav className="flex-1 space-y-1.5">
              {navItems.map((route) => {
                const path = route.path || route.href || '/';
                const isActive = pathname === path;
                const displayName = route.title || route.name || '';
                
                return (
                  <Link
                    key={route.id || path}
                    to={path}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                      isActive ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50" : ""
                    )}
                    onClick={onClose}
                  >
                    {route.icon && <route.icon className="h-4 w-4" />}
                    <span>{displayName}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;