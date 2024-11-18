import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import CalculatorSelector from './components/calculators';

const App: React.FC = () => {
  return (
    <Router>
      <div className="h-screen" dir="rtl">
        <Header>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calculators" element={<CalculatorSelector />} />
            {/* נוסיף routes נוספים בהמשך */}
          </Routes>
        </Header>
      </div>
    </Router>
  );
};

export default App;