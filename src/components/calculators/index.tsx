import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, Briefcase, Shield, PiggyBank, FileText } from 'lucide-react';
import InvestmentCalculator from './InvestmentCalculator';
import InsuranceCalculator from './InsuranceCalculator';
import SavingsCalculator from './SavingsCalculator';
import PolicyCalculator from './PolicyCalculator';

const calculatorTabs = [
  {
    value: "investment",
    title: "גמל והשתלמות",
    icon: Briefcase,
    description: "חישוב עמלות קופות גמל וקרנות השתלמות"
  },
  {
    value: "insurance",
    title: "ביטוח",
    icon: Shield,
    description: "חישוב עמלות מוצרי ביטוח"
  },
  {
    value: "savings",
    title: "חיסכון",
    icon: PiggyBank,
    description: "חישוב עמלות תוכניות חיסכון"
  },
  {
    value: "policy",
    title: "פוליסת חיסכון",
    icon: FileText,
    description: "חישוב עמלות פוליסות חיסכון"
  }
];

const CalculatorSelector: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("investment");

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">מחשבוני עמלות</CardTitle>
              <CardDescription>בחר את סוג המחשבון המתאים לחישוב העמלות</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 gap-4 p-1 bg-gray-50 rounded-lg">
              {calculatorTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <tab.icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium whitespace-nowrap">{tab.title}</div>
                    <div className="text-xs text-gray-500 hidden md:block">
                      {tab.description}
                    </div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <TabsContent value="investment" className="mt-0">
                <InvestmentCalculator />
              </TabsContent>
              <TabsContent value="insurance" className="mt-0">
                <InsuranceCalculator />
              </TabsContent>
              <TabsContent value="savings" className="mt-0">
                <SavingsCalculator />
              </TabsContent>
              <TabsContent value="policy" className="mt-0">
                <PolicyCalculator />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculatorSelector;