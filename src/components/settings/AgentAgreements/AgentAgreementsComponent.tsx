import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { 
  Wallet, 
  PiggyBank, 
  Building2, 
  Shield,
  Settings2,
  CheckCircle2,
  XCircle,
  Save,
  RefreshCw
} from 'lucide-react';

import { 
  AgentRates, 
  CompanyRates, 
  DEFAULT_COMPANY_RATES 
} from './AgentAgreementsTypes';

import { 
  getInsuranceProductName, 
  fetchAgentRates, 
  updateAgentRates,
  getInsuranceProductTypes 
} from './AgentAgreementsHelpers';

const TabColors = {
  pension: {
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    hover: 'hover:bg-blue-100',
    icon: 'text-blue-600'
  },
  savings: {
    text: 'text-purple-700',
    bg: 'bg-purple-50',
    hover: 'hover:bg-purple-100',
    icon: 'text-purple-600'
  },
  policy: {
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    hover: 'hover:bg-emerald-100',
    icon: 'text-emerald-600'
  },
  insurance: {
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    hover: 'hover:bg-rose-100',
    icon: 'text-rose-600'
  }
};

const AgentAgreements: React.FC = () => {
  const [agentRates, setAgentRates] = useState<AgentRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pension');

  useEffect(() => {
    loadAgentRates();
  }, []);

  const loadAgentRates = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('משתמש לא מחובר');
        return;
      }

      const rates = await fetchAgentRates(user.id);
      if (rates) {
        setAgentRates(rates);
      }
    } catch (error) {
      console.error('Error loading agent rates:', error);
      toast.error('שגיאה בטעינת נתוני עמלות');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateChange = (
    category: keyof Pick<AgentRates, 'pension_companies' | 'savings_and_study_companies' | 'policy_companies' | 'insurance_companies'>, 
    company: string, 
    field: keyof CompanyRates, 
    value: number | boolean
  ) => {
    if (!agentRates) return;

    const updatedRates = {
      ...agentRates,
      [category]: {
        ...agentRates[category],
        [company]: {
          ...agentRates[category][company],
          [field]: value
        }
      }
    };

    setAgentRates(updatedRates as AgentRates);
  };

  const saveRates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !agentRates) {
        toast.error('משתמש לא מחובר');
        return;
      }

      const updatedRates = await updateAgentRates(user.id, agentRates);
      if (updatedRates) {
        setAgentRates(updatedRates);
      }
    } catch (error) {
      console.error('Error saving rates:', error);
      toast.error('שגיאה בשמירת נתוני עמלות');
    }
  };

  const renderCompanyRatesSection = (
    category: keyof Pick<AgentRates, 'pension_companies' | 'savings_and_study_companies' | 'policy_companies'>, 
    companies: string[]
  ) => {
    if (!agentRates) return null;

    return (
      <div className="grid grid-cols-3 gap-6">
        {companies.map((company, index) => {
          const companyRates = agentRates[category][company] || DEFAULT_COMPANY_RATES;
          
          return (
            <motion.div
              key={company}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="w-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-l from-blue-50 to-purple-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    {companyRates.active ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    {company}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Checkbox 
                      checked={companyRates.active}
                      onCheckedChange={(checked) => handleRateChange(category, company, 'active', !!checked)}
                      className="border-2"
                    />
                    <span className="font-medium">חברה פעילה</span>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        {category === 'pension_companies' ? 'עמלת היקף על הפקדה (%)' : 'עמלת היקף (%)'}
                      </label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={companyRates.scope_rate * 100} 
                        onChange={(e) => handleRateChange(
                          category, 
                          company, 
                          'scope_rate', 
                          Number(e.target.value) / 100
                        )}
                        className="border-2 focus:ring-2 focus:ring-blue-100 text-left"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        {category === 'pension_companies' ? 'עמלת היקף על הצבירה (%)' : 'נפרעים (%)'}
                      </label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={companyRates.monthly_rate * 100} 
                        onChange={(e) => handleRateChange(
                          category, 
                          company, 
                          'monthly_rate', 
                          Number(e.target.value) / 100
                        )}
                        className="border-2 focus:ring-2 focus:ring-blue-100 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderInsuranceRatesSection = () => {
    if (!agentRates) return null;

    const insuranceCompanies = Object.keys(agentRates.insurance_companies || {});
    const productTypes = getInsuranceProductTypes();

    return (
      <div className="grid grid-cols-3 gap-4">
        {insuranceCompanies.map(company => {
          const companyRates = agentRates.insurance_companies[company];
          
          return (
            <Card key={company}>
              <CardHeader>
                <CardTitle>{company}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    checked={companyRates.active}
                    onCheckedChange={(checked) => {
                      const updatedRates = {
                        ...agentRates,
                        insurance_companies: {
                          ...agentRates.insurance_companies,
                          [company]: {
                            ...companyRates,
                            active: !!checked
                          }
                        }
                      };
                      setAgentRates(updatedRates);
                    }}
                  />
                  <span>חברה פעילה</span>
                </div>
                {productTypes.map(product => (
                  <div key={product.key} className="space-y-2 mt-2">
                    <h4>{product.hebrewName}</h4>
                    <div>
                      <label className="text-sm font-medium text-gray-700">עמלת היקף על הפקדה (%)</label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={(companyRates.products[product.key].one_time_rate || 0) * 100} 
                        onChange={(e) => {
                          const updatedRates = {
                            ...agentRates,
                            insurance_companies: {
                              ...agentRates.insurance_companies,
                              [company]: {
                                ...companyRates,
                                products: {
                                  ...companyRates.products,
                                  [product.key]: {
                                    ...companyRates.products[product.key],
                                    one_time_rate: Number(e.target.value) / 100
                                  }
                                }
                              }
                            }
                          };
                          setAgentRates(updatedRates);
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">עמלת היקף על הצבירה (%)</label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={(companyRates.products[product.key].monthly_rate || 0) * 100} 
                        onChange={(e) => {
                          const updatedRates = {
                            ...agentRates,
                            insurance_companies: {
                              ...agentRates.insurance_companies,
                              [company]: {
                                ...companyRates,
                                products: {
                                  ...companyRates.products,
                                  [product.key]: {
                                    ...companyRates.products[product.key],
                                    monthly_rate: Number(e.target.value) / 100
                                  }
                                }
                              }
                            }
                          };
                          setAgentRates(updatedRates);
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return <div>טוען נתונים...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
              הסכמי סוכן
            </h1>
            <p className="text-gray-500 mt-2">
              נהל את העמלות והתנאים שלך מול חברות הביטוח השונות
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex items-center gap-2 bg-gradient-to-l from-blue-600 to-purple-600 hover:opacity-90 transition-opacity text-white"
              onClick={saveRates}
            >
              <Save className="w-4 h-4 ml-1" />
              שמור שינויים
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
              onClick={loadAgentRates}
            >
              <RefreshCw className="w-4 h-4 ml-1" />
              רענן
            </Button>
          </div>
        </div>

        <div className="mb-8 flex justify-between items-center">
          <div className="flex gap-8">
            <div className={`flex flex-col items-center p-3 rounded-md ${TabColors.pension.bg}`}>
              <Wallet className={`w-6 h-6 mb-1 ${TabColors.pension.icon}`} />
              <span className={`text-lg font-semibold ${TabColors.pension.text}`}>פנסיה</span>
            </div>
            <div className={`flex flex-col items-center p-3 rounded-md ${TabColors.savings.bg}`}>
              <PiggyBank className={`w-6 h-6 mb-1 ${TabColors.savings.icon}`} />
              <span className={`text-lg font-semibold ${TabColors.savings.text}`}>חיסכון וקרנות השתלמות</span>
            </div>
            <div className={`flex flex-col items-center p-3 rounded-md ${TabColors.policy.bg}`}>
              <Building2 className={`w-6 h-6 mb-1 ${TabColors.policy.icon}`} />
              <span className={`text-lg font-semibold ${TabColors.policy.text}`}>פוליסות</span>
            </div>
            <div className={`flex flex-col items-center p-3 rounded-md ${TabColors.insurance.bg}`}>
              <Shield className={`w-6 h-6 mb-1 ${TabColors.insurance.icon}`} />
              <span className={`text-lg font-semibold ${TabColors.insurance.text}`}>ביטוח</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-gray-100 p-2 rounded-lg mb-6">
            <TabsTrigger
              value="pension"
              className="flex items-center gap-2 flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              פנסיה
            </TabsTrigger>
            <TabsTrigger
              value="savings"
              className="flex items-center gap-2 flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              חיסכון וקרנות השתלמות
            </TabsTrigger>
            <TabsTrigger
              value="policy"
              className="flex items-center gap-2 flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              פוליסות
            </TabsTrigger>
            <TabsTrigger
              value="insurance"
              className="flex items-center gap-2 flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              ביטוח
            </TabsTrigger>
          </TabsList>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="pension" className="mt-0">
              {renderCompanyRatesSection('pension_companies', ['מגדל', 'מנורה', 'כלל', 'הראל', 'הפניקס'])}
            </TabsContent>
            <TabsContent value="savings" className="mt-0">
              {renderCompanyRatesSection('savings_and_study_companies', ['מגדל', 'מנורה', 'כלל', 'הראל', 'הפניקס'])}
            </TabsContent>
            <TabsContent value="policy" className="mt-0">
              {renderCompanyRatesSection('policy_companies', ['מגדל', 'מנורה', 'כלל', 'הראל', 'הפניקס'])}
            </TabsContent>
            <TabsContent value="insurance" className="mt-0">
              {renderInsuranceRatesSection()}
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AgentAgreements;
