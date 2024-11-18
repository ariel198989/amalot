import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import CalculatorSelector from './components/calculators';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calculators" element={<CalculatorSelector />} />
            {/* נוסיף routes נוספים בהמשך */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;