import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Calculator, LayoutDashboard, Settings, Users } from 'lucide-react';
import CalculatorSelector from './components/calculators';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100" dir="rtl">
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
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 pt-1 border-b-2 border-blue-500 text-sm font-medium text-gray-900"
                  >
                    <LayoutDashboard className="h-5 w-5 ml-2" />
                    דשבורד
                  </Link>
                  <Link
                    to="/calculators"
                    className="inline-flex items-center px-4 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    <Calculator className="h-5 w-5 ml-2" />
                    מחשבוני עמלות
                  </Link>
                  <Link
                    to="/clients"
                    className="inline-flex items-center px-4 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    <Users className="h-5 w-5 ml-2" />
                    לקוחות
                  </Link>
                  <Link
                    to="/settings"
                    className="inline-flex items-center px-4 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    <Settings className="h-5 w-5 ml-2" />
                    הגדרות
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<div>דשבורד</div>} />
            <Route path="/calculators" element={<CalculatorSelector />} />
            <Route path="/clients" element={<div>לקוחות</div>} />
            <Route path="/settings" element={<div>הגדרות</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;