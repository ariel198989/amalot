import React from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Calculator, 
  PiggyBank, 
  Shield, 
  Briefcase, 
  FileText,
  TrendingUp,
  DollarSign,
  Target
} from 'lucide-react';
import InvestmentCalculator from './InvestmentCalculator';
import InsuranceCalculator from './InsuranceCalculator';
import PensionCalculator from './PensionCalculator';
import PolicyCalculator from './PolicyCalculator';

const calculatorTabs = [
  {
    value: "pension",
    title: "פנסיה",
    icon: PiggyBank,
    description: "חישוב עמלות פנסיה",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    hoverColor: "hover:bg-blue-50"
  },
  {
    value: "insurance",
    title: "ביטוח",
    icon: Shield,
    description: "חישוב עמלות מוצרי ביטוח",
    color: "text-green-600",
    bgColor: "bg-green-100",
    hoverColor: "hover:bg-green-50"
  },
  {
    value: "investment",
    title: "גמל והשתלמות",
    icon: Briefcase,
    description: "חישוב עמלות קופות גמל וקרנות השתלמות",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    hoverColor: "hover:bg-purple-50"
  },
  {
    value: "policy",
    title: "פוליסת חיסכון",
    icon: FileText,
    description: "חישוב עמלות פוליסות חיסכון",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    hoverColor: "hover:bg-orange-50"
  }
];

const CalculatorSelector: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("pension");

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">מחשבוני עמלות</CardTitle>
              <CardDescription className="text-gray-600">חישוב מהיר ומדויק של עמלות לפי סוגי מוצרים</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {calculatorTabs.map((tab) => (
              <div
                key={tab.value}
                className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  ${activeTab === tab.value 
                    ? `${tab.bgColor} border-${tab.color.split('-')[1]}-200` 
                    : 'border-gray-200 hover:border-gray-300 ' + tab.hoverColor
                  }
                `}
                onClick={() => setActiveTab(tab.value)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${tab.bgColor}`}>
                    <tab.icon className={`h-6 w-6 ${tab.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tab.title}</h3>
                    <p className="text-sm text-gray-500">{tab.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="pension" className="mt-0">
                <PensionCalculator />
              </TabsContent>
              <TabsContent value="insurance" className="mt-0">
                <InsuranceCalculator />
              </TabsContent>
              <TabsContent value="investment" className="mt-0">
                <InvestmentCalculator />
              </TabsContent>
              <TabsContent value="policy" className="mt-0">
                <PolicyCalculator />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* כרטיסי מידע */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">חישוב מדויק</CardTitle>
                <CardDescription>חישוב עמלות מדויק לפי תנאי החברות</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">תחזית הכנסות</CardTitle>
                <CardDescription>צפי הכנסות חודשי ושנתי מעמלות</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">השוואת מסלולים</CardTitle>
                <CardDescription>השוואה בין מסלולי עמלות שונים</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default CalculatorSelector;