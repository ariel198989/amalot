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
  LogOut,
  FileText
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
    title: 'לקוחות', 
    path: '/clients', 
    icon: Users,
    description: 'ניהול ומעקב אחר לקוחות'
  },
  { 
    title: 'מסע לקוח', 
    path: '/journey', 
    icon: User,
    description: 'ניהול פגישות ומכירות ללקוח'
  },
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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login', { replace: true });
  };

  const isActivePath = (path: string) => location.pathname === path;

  const sidebarClasses = `
    fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-20
    ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
    lg:translate-x-0 lg:static lg:w-72
  `;

  const linkClasses = (path: string) => `
    flex items-center px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors
    ${isActivePath(path) ? 'bg-blue-50 text-blue-600' : ''}
  `;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-blue-600" />
              <span className="mr-3 text-xl font-bold text-gray-900">
                מערכת ניהול עמלות
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={linkClasses(item.path)}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 ml-3" />
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 mt-4 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border-t border-gray-100"
          >
            <LogOut className="h-5 w-5 ml-3" />
            <div>
              <div className="font-medium">התנתק</div>
              <div className="text-xs text-gray-500">יציאה מהמערכת</div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 h-16">
          <div className="flex items-center justify-between px-6 h-full">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-10"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Header; 