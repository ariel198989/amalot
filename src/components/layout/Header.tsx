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
    <div className="flex h-screen bg-secondary-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-secondary-200 z-50">
        <div className="container mx-auto flex items-center justify-between h-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-secondary-100 transition-all duration-200"
          >
            <Menu className="h-6 w-6 text-secondary-600" />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              מערכת עמלות
            </span>
            <Calculator className="h-6 w-6 text-primary-600" />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-secondary-100 transition-all duration-200 relative"
            >
              <Bell className="h-5 w-5 text-secondary-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary-500 rounded-full"></span>
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-16">
        <main className="flex-1 overflow-auto bg-secondary-50 p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Header; 