import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkPlanTable from '../table/work-plan-system';
import SalesTargetsSystem from '../table/sales-targets-system';
import SalesTrackingTable from '../table/sales-targets-system-v3';
import { useUser } from '../contexts/UserContext';
import { SalesTargetsProvider } from '@/contexts/SalesTargetsContext';
import SalesTargetsTab from '../components/dashboard/sales-targets-tab';

const AnnualWorkPlan = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('work-plan');
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">יש להתחבר למערכת</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">תכנית עבודה שנתית - {selectedYear}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" dir="rtl">
        <TabsList className="grid grid-cols-3 gap-4 bg-transparent h-auto p-0">
          <TabsTrigger
            value="work-plan"
            className={`data-[state=active]:bg-slate-800 data-[state=active]:text-white px-6 py-3 rounded-lg text-lg font-medium transition-all
              ${activeTab === 'work-plan' ? '' : 'bg-white hover:bg-slate-50'}`}
          >
            תכנית עבודה
          </TabsTrigger>
          <TabsTrigger
            value="sales-targets"
            className={`data-[state=active]:bg-slate-800 data-[state=active]:text-white px-6 py-3 rounded-lg text-lg font-medium transition-all
              ${activeTab === 'sales-targets' ? '' : 'bg-white hover:bg-slate-50'}`}
          >
            יעדי מכירות
          </TabsTrigger>
          <TabsTrigger
            value="sales-tracking"
            className={`data-[state=active]:bg-slate-800 data-[state=active]:text-white px-6 py-3 rounded-lg text-lg font-medium transition-all
              ${activeTab === 'sales-tracking' ? '' : 'bg-white hover:bg-slate-50'}`}
          >
            מעקב מכירות
          </TabsTrigger>
        </TabsList>

        <TabsContent value="work-plan" className="mt-6">
          <Card className="bg-white shadow-lg">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-xl text-slate-800">תכנית עבודה חודשית</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <WorkPlanTable agent_id={user.id} year={selectedYear} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales-targets" className="mt-6">
          <SalesTargetsProvider>
            <Card className="bg-white shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-xl text-slate-800">יעדי מכירות שנתיים</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <SalesTargetsTab />
                <SalesTargetsSystem />
              </CardContent>
            </Card>
          </SalesTargetsProvider>
        </TabsContent>

        <TabsContent value="sales-tracking" className="mt-6">
          <Card className="bg-white shadow-lg">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-xl text-slate-800">מעקב ביצועי מכירות</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <SalesTrackingTable agent_id={user.id} year={selectedYear} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnnualWorkPlan; 