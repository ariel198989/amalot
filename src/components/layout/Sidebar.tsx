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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-72 
          bg-white shadow-xl 
          transform transition-transform duration-150 ease-out
          z-50
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Close Button */}
        <div className="absolute left-2 top-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-600" />
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Calculator className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">מערכת עמלות</h1>
              <p className="text-sm text-gray-500">ניהול ומעקב עמלות</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActivePath(item.path)
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={onClose}
              >
                <div className={`
                  p-2 rounded-lg transition-colors duration-200
                  ${isActivePath(item.path)
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }
                `}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Link>
            ))}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            {bottomNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActivePath(item.path)
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={onClose}
              >
                <div className={`
                  p-2 rounded-lg transition-colors duration-200
                  ${isActivePath(item.path)
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }
                `}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Link>
            ))}

            <button
              onClick={onLogout}
              className="w-full group flex items-center gap-3 px-4 py-3 mt-2 rounded-lg transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-red-600"
            >
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-red-100 transition-colors">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">התנתק</div>
                <div className="text-xs text-gray-500">יציאה מהמערכת</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;