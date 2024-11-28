import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import CalculatorSelector from './components/calculators';
import LoginForm from './components/auth/LoginForm';
import CustomerJourneyCalculator from './components/calculators/CustomerJourneyComponent';
import { Toaster } from 'react-hot-toast';
import Reports from './components/reports/Reports';
import AgentAgreements from "./components/settings/AgentAgreements/AgentAgreementsComponent";
import Settings from './components/settings/Settings';
import ClientsTable from './components/clients/ClientsTable';

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
        <Toaster position="top-center" />
        {isAuthenticated ? (
          <Header onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calculators" element={<CalculatorSelector />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/clients" element={<ClientsTable />} />
              <Route path="/agreements" element={<AgentAgreements />} />
              <Route path="/journey" element={<CustomerJourneyCalculator />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Header>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;