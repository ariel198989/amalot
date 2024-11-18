import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import CalculatorSelector from './components/calculators';
import LoginForm from './components/auth/LoginForm';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <Router>
      <div className="h-screen" dir="rtl">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/" replace /> : 
                <LoginForm onLogin={handleLogin} />
            } 
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Header onLogout={handleLogout}>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="calculators" element={<CalculatorSelector />} />
                  </Routes>
                </Header>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;