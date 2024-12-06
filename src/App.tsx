import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import CalculatorSelector from './components/calculators';
import LoginForm from './components/auth/LoginForm';
import CustomerJourneyComponent from './components/calculators/CustomerJourneyComponent';
import { Toaster } from 'react-hot-toast';
import Reports from './components/reports/Reports';
import AgentAgreements from "./components/settings/AgentAgreements/AgentAgreementsComponent";
import Settings from './components/settings/Settings';
import ClientsTable from './components/clients/ClientsTable';
import AnnualWorkPlan from './pages/AnnualWorkPlan';
import BirthdaysPage from './pages/birthdays';
import PromotionsPage from './pages/promotions';
import { UserProvider } from './contexts/UserContext';
import { SalesTargetsProvider } from '@/contexts/SalesTargetsContext';
import { WorkPlanProvider } from '@/contexts/WorkPlanContext';

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
    <WorkPlanProvider>
      <UserProvider>
        <SalesTargetsProvider>
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
                    <Route path="/journey" element={<CustomerJourneyComponent />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/work-plan" element={<AnnualWorkPlan />} />
                    <Route path="/birthdays" element={<BirthdaysPage />} />
                    <Route path="/promotions" element={<PromotionsPage />} />
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
        </SalesTargetsProvider>
      </UserProvider>
    </WorkPlanProvider>
  );
};

export default App;