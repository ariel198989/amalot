import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  BadgeDollarSign,
  Bell,
  Menu,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

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
      <motion.div 
        className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-secondary-200 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <div className="container mx-auto flex items-center justify-between h-full">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hover:bg-secondary-100 transition-all duration-200"
            >
              <Menu className="h-6 w-6 text-secondary-600" />
            </Button>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.span 
              className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              מערכת עמלות
            </motion.span>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <BadgeDollarSign className="h-6 w-6 text-primary-600" />
            </motion.div>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-secondary-100 transition-all duration-200 relative"
              >
                <Bell className="h-5 w-5 text-secondary-600" />
                <motion.span 
                  className="absolute top-1 right-1 h-2 w-2 bg-primary-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                />
              </Button>
            </motion.div>
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