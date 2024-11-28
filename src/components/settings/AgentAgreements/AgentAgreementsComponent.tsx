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
      <div className="grid grid-cols-3 gap-4">
        {companies.map(company => {
          const companyRates = agentRates[category][company] || DEFAULT_COMPANY_RATES;
          
          return (
            <Card key={company}>
              <CardHeader>
                <CardTitle>{company}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    checked={companyRates.active}
                    onCheckedChange={(checked) => handleRateChange(category, company, 'active', !!checked)}
                  />
                  <span>חברה פעילה</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label>עמלת היקף (%)</label>
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
                    />
                  </div>
                  <div>
                    <label>עמלה חודשית (%)</label>
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
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      <label>עמלה חד פעמית (%)</label>
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
                      />
                    </div>
                    <div>
                      <label>עמלה חודשית (%)</label>
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
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>הגדרות עמלות סוכן</CardTitle>
          <CardDescription>
            נהל את שיעורי העמלות עבור החברות השונות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pension">
                <PiggyBank className="h-4 w-4 ml-2" />
                פנסיה
              </TabsTrigger>
              <TabsTrigger value="savings">
                <Wallet className="h-4 w-4 ml-2" />
                גמל והשתלמות
              </TabsTrigger>
              <TabsTrigger value="policy">
                <Building2 className="h-4 w-4 ml-2" />
                פוליסות
              </TabsTrigger>
              <TabsTrigger value="insurance">
                <Shield className="h-4 w-4 ml-2" />
                ביטוח
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="pension">
                {renderCompanyRatesSection('pension_companies', [
                  'מגדל', 'הראל', 'כלל', 'הפניקס', 'מנורה', 'מור'
                ])}
              </TabsContent>

              <TabsContent value="savings">
                {renderCompanyRatesSection('savings_and_study_companies', [
                  'אלטשולר שחם', 'מיטב דש', 'הראל', 'פסגות', 'מגדל', 'כלל'
                ])}
              </TabsContent>

              <TabsContent value="policy">
                {renderCompanyRatesSection('policy_companies', [
                  'הראל', 'מגדל', 'כלל', 'הפניקס'
                ])}
              </TabsContent>

              <TabsContent value="insurance">
                {renderInsuranceRatesSection()}
              </TabsContent>
            </div>
          </Tabs>

          <div className="mt-4 flex justify-end">
            <Button onClick={saveRates}>
              <Save className="h-4 w-4 ml-2" />
              שמור שינויים
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentAgreements;
