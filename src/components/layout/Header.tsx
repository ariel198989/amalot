import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calculator, LayoutDashboard, Users, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const linkClasses = (path: string) => `
    inline-flex items-center px-4 pt-1 border-b-2 text-sm font-medium
    ${isActivePath(path) 
      ? 'border-blue-500 text-gray-900' 
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
  `;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Calculator className="h-8 w-8 text-blue-600" />
              <span className="mr-2 text-xl font-bold text-gray-900">
                מערכת ניהול עמלות
              </span>
            </div>
            <div className="hidden sm:mr-6 sm:flex sm:space-x-8">
              <Link to="/" className={linkClasses('/')}>
                <LayoutDashboard className="h-5 w-5 ml-2" />
                דשבורד
              </Link>
              <Link to="/calculators" className={linkClasses('/calculators')}>
                <Calculator className="h-5 w-5 ml-2" />
                מחשבוני עמלות
              </Link>
              <Link to="/clients" className={linkClasses('/clients')}>
                <Users className="h-5 w-5 ml-2" />
                לקוחות
              </Link>
              <Link to="/settings" className={linkClasses('/settings')}>
                <Settings className="h-5 w-5 ml-2" />
                הגדרות
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header; 