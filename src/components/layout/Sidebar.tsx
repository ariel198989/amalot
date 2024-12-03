import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calculator,
  FileText,
  ClipboardList,
  Users,
  User,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const navItems = [
  { 
    title: 'דשבורד', 
    path: '/', 
    icon: LayoutDashboard,
    description: 'סקירה כללית של הנתונים'
  },
  { 
    title: 'מחשבוני עמלות', 
    path: '/calculators', 
    icon: Calculator,
    description: 'חישוב עמלות לפי סוגי מוצרים'
  },
  { 
    title: 'דוחות', 
    path: '/reports', 
    icon: FileText,
    description: 'דוחות מכירות ועמלות'
  },
  { 
    title: 'הסכמי סוכן', 
    path: '/agreements', 
    icon: ClipboardList,
    description: 'ניהול הסכמי עמלות מול חברות'
  },
  { 
    title: 'לקוחות', 
    path: '/clients', 
    icon: Users,
    description: 'ניהול לקוחות ופעולות'
  },
  { 
    title: 'מסע לקוח', 
    path: '/journey', 
    icon: User,
    description: 'ניהול פגישות ומכירות ללקוח'
  }
];

const bottomNavItems = [
  { 
    title: 'הגדרות', 
    path: '/settings', 
    icon: Settings,
    description: 'הגדרות מערכת'
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout }) => {
  const location = useLocation();
  const isActivePath = (path: string) => location.pathname === path;

  return (
    <>
      {/* Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-80",
          "bg-white border-l border-secondary-200",
          "transform transition-transform duration-300 ease-in-out",
          "will-change-transform z-50",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Close Button */}
        <div className="absolute left-2 top-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-secondary-100 transition-all duration-200"
          >
            <X className="h-6 w-6 text-secondary-600" />
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full p-6 overscroll-none">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary-100 rounded-xl">
              <Calculator className="h-7 w-7 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                מערכת עמלות
              </h1>
              <p className="text-sm text-secondary-500">ניהול ומעקב עמלות</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActivePath(item.path)
                    ? "bg-primary-50 text-primary-600 shadow-sm ring-1 ring-primary-100"
                    : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                )}
                onClick={onClose}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors duration-200",
                  isActivePath(item.path)
                    ? "bg-primary-100 text-primary-600"
                    : "bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-secondary-500">{item.description}</div>
                </div>
              </Link>
            ))}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-secondary-100 pt-4 mt-4 space-y-1.5">
            {bottomNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActivePath(item.path)
                    ? "bg-primary-50 text-primary-600 shadow-sm ring-1 ring-primary-100"
                    : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                )}
                onClick={onClose}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors duration-200",
                  isActivePath(item.path)
                    ? "bg-primary-100 text-primary-600"
                    : "bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-secondary-500">{item.description}</div>
                </div>
              </Link>
            ))}

            <button
              onClick={onLogout}
              className="w-full group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-secondary-600 hover:bg-red-50 hover:text-red-600"
            >
              <div className="p-2 rounded-lg bg-secondary-100 text-secondary-600 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">התנתק</div>
                <div className="text-xs text-secondary-500">יציאה מהמערכת</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;