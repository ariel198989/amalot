import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import CalculatorSelector from './components/calculators';
import CustomerJourneyComponent from './components/calculators/CustomerJourneyComponent';
import { Toaster } from 'react-hot-toast';
import Reports from './components/reports/Reports';
import AgentAgreements from "./components/settings/AgentAgreements/AgentAgreementsComponent";
import Settings from './components/settings/Settings';
import ClientsTable from './components/clients/ClientsTable';
import AnnualWorkPlan from './pages/AnnualWorkPlan';
import BirthdaysPage from './pages/birthdays';
import PromotionsPage from './pages/promotions';
import PolicyDurationPage from './pages/PolicyDurationPage';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import { UserProvider } from './contexts/UserContext';
import { SalesTargetsProvider } from '@/contexts/SalesTargetsContext';
import { WorkPlanProvider } from '@/contexts/WorkPlanContext';
import { supabase } from './lib/supabase';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session) {
        navigate('/auth');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Header />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="calculators" element={<CalculatorSelector />} />
        <Route path="reports" element={<Reports />} />
        <Route path="clients" element={<ClientsTable />} />
        <Route path="agreements" element={<AgentAgreements />} />
        <Route path="journey" element={<CustomerJourneyComponent />} />
        <Route path="settings" element={<Settings />} />
        <Route path="work-plan" element={<AnnualWorkPlan />} />
        <Route path="birthdays" element={<BirthdaysPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="policy-duration" element={<PolicyDurationPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <WorkPlanProvider>
      <UserProvider>
        <SalesTargetsProvider>
          <div className="h-screen" dir="rtl">
            <Toaster position="top-center" />
            <AppRoutes />
          </div>
        </SalesTargetsProvider>
      </UserProvider>
    </WorkPlanProvider>
  );
};

export default App;