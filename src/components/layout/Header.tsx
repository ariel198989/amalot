import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  LayoutDashboard, 
  Users, 
  Settings, 
  Bell, 
  User,
  Menu,
  X,
  LogOut,
  FileText,
  ClipboardList
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface HeaderProps {
  children: React.ReactNode;
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

const Header: React.FC<HeaderProps> = ({ children, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login', { replace: true });
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-50 lg:hidden">
        <div className="flex items-center justify-between px-4 h-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">מערכת עמלות</span>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed top-16 right-0 h-[calc(100vh-4rem)] w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40
        lg:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-2 px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActivePath(item.path) 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className={`
                    p-2 rounded-lg transition-colors duration-200
                    ${isActivePath(item.path) 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
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
          </div>
          
          <div className="border-t border-gray-100 py-4 px-3">
            {bottomNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActivePath(item.path) 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className={`
                  p-2 rounded-lg transition-colors duration-200
                  ${isActivePath(item.path) 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
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
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
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

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 bg-white shadow-lg">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Calculator className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">מערכת עמלות</h1>
              <p className="text-sm text-gray-500">ניהול ומעקב עמלות</p>
            </div>
          </div>

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
              onClick={handleLogout}
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-16 lg:pt-0">
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Header; 