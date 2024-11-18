import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InvestmentCalculator from './InvestmentCalculator';
import InsuranceCalculator from './InsuranceCalculator';
import SavingsCalculator from './SavingsCalculator';
import PolicyCalculator from './PolicyCalculator';

const CalculatorSelector: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">מחשבוני עמלות</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="investment" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 gap-4">
              <TabsTrigger value="investment" className="text-lg">
                גמל והשתלמות
              </TabsTrigger>
              <TabsTrigger value="insurance" className="text-lg">
                ביטוח
              </TabsTrigger>
              <TabsTrigger value="savings" className="text-lg">
                חיסכון
              </TabsTrigger>
              <TabsTrigger value="policy" className="text-lg">
                פוליסת חיסכון
              </TabsTrigger>
            </TabsList>
            <TabsContent value="investment">
              <InvestmentCalculator />
            </TabsContent>
            <TabsContent value="insurance">
              <InsuranceCalculator />
            </TabsContent>
            <TabsContent value="savings">
              <SavingsCalculator />
            </TabsContent>
            <TabsContent value="policy">
              <PolicyCalculator />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculatorSelector;