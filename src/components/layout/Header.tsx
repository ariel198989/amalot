import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calculator,
  Bell,
  Menu,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import Sidebar from './Sidebar';

interface HeaderProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ children, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-50">
        <div className="flex items-center justify-between px-4 h-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">מערכת עמלות</span>
            <Calculator className="h-6 w-6 text-blue-600" />
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-16">
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Header; 