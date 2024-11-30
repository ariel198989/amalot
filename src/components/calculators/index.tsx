import React, { useState } from 'react';
import { Calculator, TrendingUp, PiggyBank, Briefcase, Shield } from 'lucide-react';
import PensionCalculator from './PensionCalculator';
import InvestmentCalculator from './InvestmentCalculator';
import SavingsCalculator from './SavingsCalculator';
import InsuranceCalculator from './InsuranceCalculator';

const CalculatorSelector: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);

  const calculators = [
    { 
      id: 'pension', 
      title: 'פנסיה', 
      icon: TrendingUp,
      description: 'חישוב עמלות מוצרי פנסיה',
      component: PensionCalculator 
    },
    { 
      id: 'investment', 
      title: 'גמל והשתלמות', 
      icon: Briefcase,
      description: 'חישוב עמלות קופות גמל וקרנות השתלמות',
      component: InvestmentCalculator 
    },
    { 
      id: 'savings', 
      title: 'חיסכון', 
      icon: PiggyBank,
      description: 'חישוב עמלות תוכניות חיסכון',
      component: SavingsCalculator 
    },
    { 
      id: 'insurance', 
      title: 'ביטוח', 
      icon: Shield,
      description: 'חישוב עמלות מוצרי ביטוח',
      component: InsuranceCalculator 
    }
  ];

  if (activeCalculator) {
    const calculator = calculators.find(calc => calc.id === activeCalculator);
    if (calculator) {
      const CalculatorComponent = calculator.component;
      return (
        <div className="space-y-4">
          <button
            onClick={() => setActiveCalculator(null)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← חזרה למחשבונים
          </button>
          <CalculatorComponent />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-gray-900">מחשבוני עמלות</h2>
        <p className="mt-2 text-sm text-gray-500">
          בחר את סוג המחשבון הרצוי לחישוב העמלות
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {calculators.map((calc) => {
          const Icon = calc.icon;
          return (
            <button
              key={calc.id}
              onClick={() => setActiveCalculator(calc.id)}
              className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-100 hover:bg-blue-50"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{calc.title}</h3>
              <p className="text-sm text-gray-500 text-center">{calc.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalculatorSelector;