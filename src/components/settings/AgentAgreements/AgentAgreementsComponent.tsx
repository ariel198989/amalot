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

const insuranceCompanies = ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה'];

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

const INSURANCE_PRODUCTS = [
  { value: 'personal_accident', label: 'תאונות אישיות' },
  { value: 'mortgage', label: 'משכנתה' },
  { value: 'health', label: 'בריאות' },
  { value: 'critical_illness', label: 'מחלות קשות' },
  { value: 'insurance_umbrella', label: 'מטריה ביטוחית' },
  { value: 'risk', label: 'ריסק' },
  { value: 'service', label: 'כתבי שירות' },
  { value: 'disability', label: 'אכע' }
] as const;

type InsuranceProductType = typeof INSURANCE_PRODUCTS[number]['value'];

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

    // Initialize the category if it doesn't exist
    if (!agentRates[category]) {
      agentRates[category] = {};
    }

    // Add new companies for pension and savings
    if (category === 'pension_companies' || category === 'savings_and_study_companies') {
      const newCompanies = ['מור', 'אלטשולר שחם', 'מיטב'];
      const allCompanies = [...companies, ...newCompanies];
      companies = [...new Set(allCompanies)];
    }

    // Add analyst only for savings
    if (category === 'savings_and_study_companies') {
      companies = [...companies, 'אנליסט'];
    }

    // Add Hachshara to policy companies
    if (category === 'policy_companies') {
      companies = [...companies, 'הכשרה'];
    }

    // Initialize each company if it doesn't exist
    companies.forEach(company => {
      if (!agentRates[category][company]) {
        if (category === 'pension_companies') {
          agentRates[category][company] = {
            active: false,
            scope_rate: 0,
            scope_rate_per_million: 0
          };
        } else {
          agentRates[category][company] = {
            active: false,
            scope_rate_per_million: 0,
            monthly_rate_per_million: 0
          };
        }
      }
    });

    const getFieldLabels = (category: string) => {
      if (category === 'pension_companies') {
        return {
          scope: 'עמלת היקף על השכר (%)',
          monthly: 'עמלת היקף על צבירה (₪ למיליון)'
        };
      }
      return {
        scope: 'עמלת היקף למיליון (₪)',
        monthly: 'נפרעים (%)'
      };
    };

    const labels = getFieldLabels(category);

    return (
      <div className="grid grid-cols-3 gap-6" dir="rtl">
        {companies.map((company, index) => {
          const companyRates = agentRates[category][company] || {
            active: false,
            scope_rate_per_million: 0,
            monthly_rate_per_million: 0
          };
          
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
                      <label className="block text-sm font-medium mb-2 text-gray-700 text-right">
                        {labels.scope}
                      </label>
                      <Input 
                        type="number" 
                        step={category === 'pension_companies' ? '0.01' : '100'} 
                        value={category === 'pension_companies' ? 
                          (companyRates.scope_rate || 0) * 100 : 
                          companyRates.scope_rate_per_million} 
                        onChange={(e) => handleRateChange(
                          category, 
                          company, 
                          category === 'pension_companies' ? 'scope_rate' : 'scope_rate_per_million', 
                          category === 'pension_companies' ? Number(e.target.value) / 100 : Number(e.target.value)
                        )}
                        className="border-2 focus:ring-2 focus:ring-blue-100 text-right"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 text-right">
                        {labels.monthly}
                      </label>
                      <Input 
                        type="number" 
                        step={category === 'pension_companies' ? '100' : '0.001'}
                        value={category === 'pension_companies' ? 
                          companyRates.scope_rate_per_million : 
                          (companyRates.monthly_rate || 0) * 100} 
                        onChange={(e) => handleRateChange(
                          category, 
                          company, 
                          category === 'pension_companies' ? 'scope_rate_per_million' : 'monthly_rate', 
                          category === 'pension_companies' ? Number(e.target.value) : Number(e.target.value) / 100
                        )}
                        className="border-2 focus:ring-2 focus:ring-blue-100 text-right"
                        dir="rtl"
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

    const productTypes = getInsuranceProductTypes();
    const defaultProductStructure = productTypes.reduce((acc, product) => {
      acc[product.key] = {
        one_time_rate: 0,
        monthly_rate: 0
      };
      return acc;
    }, {} as { [key: string]: { one_time_rate: number; monthly_rate: number } });

    // Initialize insurance companies if they don't exist
    if (!agentRates.insurance_companies) {
      agentRates.insurance_companies = {};
    }

    insuranceCompanies.forEach((company: string) => {
      if (!agentRates.insurance_companies[company]) {
        agentRates.insurance_companies[company] = {
          active: false,
          products: defaultProductStructure
        };
      }
    });

    return (
      <div className="grid grid-cols-3 gap-6" dir="rtl">
        {insuranceCompanies.map((company: string, index: number) => {
          const companyRates = agentRates.insurance_companies[company] || {
            active: false,
            products: defaultProductStructure
          };
          
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
                      className="border-2"
                    />
                    <span className="font-medium">חברה פעילה</span>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">מוצרי ביטוח</h3>
                    {INSURANCE_PRODUCTS.map(({ value, label }) => (
                      <div key={value} className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{label}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              עמלת היקף (%)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={companyRates?.products?.[value]?.one_time_rate || 0}
                              onChange={(e) => {
                                const updatedRates = {
                                  ...agentRates,
                                  insurance_companies: {
                                    ...agentRates.insurance_companies,
                                    [company]: {
                                      ...companyRates,
                                      products: {
                                        ...companyRates?.products,
                                        [value]: {
                                          ...companyRates?.products?.[value],
                                          one_time_rate: Number(e.target.value)
                                        }
                                      }
                                    }
                                  }
                                };
                                setAgentRates(updatedRates);
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              נפרעים (%)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={companyRates?.products?.[value]?.monthly_rate || 0}
                              onChange={(e) => {
                                const updatedRates = {
                                  ...agentRates,
                                  insurance_companies: {
                                    ...agentRates.insurance_companies,
                                    [company]: {
                                      ...companyRates,
                                      products: {
                                        ...companyRates?.products,
                                        [value]: {
                                          ...companyRates?.products?.[value],
                                          monthly_rate: Number(e.target.value)
                                        }
                                      }
                                    }
                                  }
                                };
                                setAgentRates(updatedRates);
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const handleInsuranceRateChange = (
    company: string,
    productType: InsuranceProductType,
    field: 'one_time_rate' | 'monthly_rate',
    value: string
  ) => {
    setRates(prev => ({
      ...prev,
      insurance_companies: {
        ...prev.insurance_companies,
        [company]: {
          ...prev.insurance_companies[company],
          products: {
            ...prev.insurance_companies[company]?.products,
            [productType]: {
              ...prev.insurance_companies[company]?.products[productType],
              [field]: Number(value)
            }
          }
        }
      }
    }));
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
              נהל את העמלות והנאים שלך מול חברות הביטוח השונת
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
            <button
              onClick={() => setActiveTab('pension')}
              className={`flex flex-col items-center p-3 rounded-md transition-all hover:scale-105 cursor-pointer ${TabColors.pension.bg} ${activeTab === 'pension' ? 'ring-2 ring-blue-400 shadow-lg' : ''}`}
            >
              <Wallet className={`w-6 h-6 mb-1 ${TabColors.pension.icon}`} />
              <span className={`text-lg font-semibold ${TabColors.pension.text}`}>פנסיה</span>
            </button>
            <button
              onClick={() => setActiveTab('savings')}
              className={`flex flex-col items-center p-3 rounded-md transition-all hover:scale-105 cursor-pointer ${TabColors.savings.bg} ${activeTab === 'savings' ? 'ring-2 ring-purple-400 shadow-lg' : ''}`}
            >
              <PiggyBank className={`w-6 h-6 mb-1 ${TabColors.savings.icon}`} />
              <span className={`text-lg font-semibold ${TabColors.savings.text}`}>פיננסים</span>
            </button>
            <button
              onClick={() => setActiveTab('policy')}
              className={`flex flex-col items-center p-3 rounded-md transition-all hover:scale-105 cursor-pointer ${TabColors.policy.bg} ${activeTab === 'policy' ? 'ring-2 ring-emerald-400 shadow-lg' : ''}`}
            >
              <Building2 className={`w-6 h-6 mb-1 ${TabColors.policy.icon}`} />
              <span className={`text-lg font-semibold ${TabColors.policy.text}`}>פוליסת חסכון</span>
            </button>
            <button
              onClick={() => setActiveTab('insurance')}
              className={`flex flex-col items-center p-3 rounded-md transition-all hover:scale-105 cursor-pointer ${TabColors.insurance.bg} ${activeTab === 'insurance' ? 'ring-2 ring-rose-400 shadow-lg' : ''}`}
            >
              <Shield className={`w-6 h-6 mb-1 ${TabColors.insurance.icon}`} />
              <span className={`text-lg font-semibold ${TabColors.insurance.text}`}>סיכונים</span>
            </button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="pension">פנסיה</TabsTrigger>
            <TabsTrigger value="savings">פיננסים</TabsTrigger>
            <TabsTrigger value="policy">פוליסת חסכון</TabsTrigger>
            <TabsTrigger value="insurance">סיכונים</TabsTrigger>
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
