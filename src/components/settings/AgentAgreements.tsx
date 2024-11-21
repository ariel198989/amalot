import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { Checkbox } from "@/components/ui/checkbox";

interface CompanyRates {
  scope_rate: number;
  monthly_rate: number;
  scope_rate_per_million?: number;
  active: boolean;
}

interface AgentRates {
  id?: string;
  user_id?: string;
  // פנסיה - עמלות לפי חברה
  pension_companies: {
    [company: string]: CompanyRates;  // מגדל, הראל, כלל וכו'
  };
  // השקעות - עמלות לפי חברה
  investment_companies: {
    [company: string]: CompanyRates;  // הראל, מגדל, ילין לפידות וכו'
  };
  // פוליסת חיסכון - עמלות לפי חברה
  policy_companies: {
    [company: string]: CompanyRates;  // הראל, מגדל, כלל וכו'
  };
  // ביטוח - עמלות לפי חברה וסוג ביטוח
  insurance_companies: {
    [company: string]: {
      active: boolean;
      products: {
        risk: { one_time_rate: number; monthly_rate: number; };
        mortgage_risk: { one_time_rate: number; monthly_rate: number; };
        health: { one_time_rate: number; monthly_rate: number; };
        critical_illness: { one_time_rate: number; monthly_rate: number; };
        service_letter: { one_time_rate: number; monthly_rate: number; };
        disability: { one_time_rate: number; monthly_rate: number; };
      };
    };
  };
  created_at?: string;
  updated_at?: string;
}

const defaultCompanyRates: CompanyRates = {
  scope_rate: 0.07,  // 7%
  monthly_rate: 0.0025,  // 0.25%
  scope_rate_per_million: 7000,  // 7,000 ₪ למיליון
  active: true
};

const defaultInsuranceRates = {
  active: true,
  products: {
    risk: { one_time_rate: 0.4, monthly_rate: 0.15 },
    mortgage_risk: { one_time_rate: 0.35, monthly_rate: 0.12 },
    health: { one_time_rate: 0.45, monthly_rate: 0.2 },
    critical_illness: { one_time_rate: 0.4, monthly_rate: 0.18 },
    service_letter: { one_time_rate: 0.3, monthly_rate: 0.1 },
    disability: { one_time_rate: 0.4, monthly_rate: 0.15 }
  }
};

const COMPANIES = {
  pension: ['מגדל', 'הראל', 'כלל', 'הפניקס', 'מנורה', 'מור'],
  investment: ['הראל', 'מגדל', 'כלל', 'הפניקס', 'מור', 'יין לפידות', 'אלשולר שחם', 'פסגות', 'מיטב דש'],
  policy: ['הראל', 'מגדל', 'כלל', 'הפניקס', 'מנורה', 'איילון'],
  insurance: ['איילון', 'הראל', 'מגדל', 'מנורה', 'כלל', 'הפניקס', 'הכשרה']
};

const AgentAgreements = () => {
  // יצירת מצב התחלתי מלא
  const initialRates: AgentRates = {
    pension_companies: Object.fromEntries(
      COMPANIES.pension.map(company => [company, { ...defaultCompanyRates }])
    ),
    investment_companies: Object.fromEntries(
      COMPANIES.investment.map(company => [company, { 
        ...defaultCompanyRates,
        scope_rate_per_million: 6000,  // ברירת מחדל להשקעות
        monthly_rate: 250  // ברירת מחדל להשקעות
      }])
    ),
    policy_companies: Object.fromEntries(
      COMPANIES.policy.map(company => [company, { 
        ...defaultCompanyRates,
        scope_rate_per_million: 7000,  // ברירת מחדל לפוליסות
        monthly_rate: 0.003  // 0.3% שנתי
      }])
    ),
    insurance_companies: Object.fromEntries(
      COMPANIES.insurance.map(company => [company, { ...defaultInsuranceRates }])
    )
  };

  const [rates, setRates] = React.useState<AgentRates>(initialRates);
  const [isLoading, setIsLoading] = React.useState(true);

  // טעינת הנתונים
  const loadRates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      const { data, error } = await supabase
        .from('agent_commission_rates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await saveRates(initialRates);
          setRates(initialRates);
        } else {
          throw error;
        }
      } else {
        // מיזוג עם ערכי ברירת המחדל
        const mergedRates = {
          pension_companies: Object.fromEntries(
            COMPANIES.pension.map(company => [
              company,
              {
                ...defaultCompanyRates,
                ...(data.pension_companies?.[company] || {})
              }
            ])
          ),
          investment_companies: Object.fromEntries(
            COMPANIES.investment.map(company => [
              company,
              {
                ...defaultCompanyRates,
                scope_rate_per_million: 6000,
                monthly_rate: 250,
                ...(data.investment_companies?.[company] || {})
              }
            ])
          ),
          policy_companies: Object.fromEntries(
            COMPANIES.policy.map(company => [
              company,
              {
                ...defaultCompanyRates,
                scope_rate_per_million: 7000,
                monthly_rate: 0.003,
                ...(data.policy_companies?.[company] || {})
              }
            ])
          ),
          insurance_companies: Object.fromEntries(
            COMPANIES.insurance.map(company => [
              company,
              {
                ...defaultInsuranceRates,
                ...(data.insurance_companies?.[company] || {})
              }
            ])
          )
        };
        setRates(mergedRates);
      }
    } catch (error) {
      console.error('Error loading rates:', error);
      toast.error('שגיאה בטעינת הנתונים');
      setRates(initialRates);
    } finally {
      setIsLoading(false);
    }
  };

  // שמירת הנתונים
  const saveRates = async (newRates: AgentRates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      // המרת הנתונים לפורמט המתאים לדאטהבייס
      const dbRates = {
        user_id: user.id,
        pension_companies: newRates.pension_companies,
        investment_companies: newRates.investment_companies,
        policy_companies: newRates.policy_companies,
        insurance_companies: newRates.insurance_companies,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('agent_commission_rates')
        .upsert(dbRates, {
          onConflict: 'user_id',  // במקרה של התנגשות, עדכן לפי user_id
          ignoreDuplicates: false  // אנחנו רוצים לעדכן את הרשומה הקיימת
        });

      if (error) throw error;
      toast.success('הנתונים נשמרו בהצלחה');
      loadRates();
    } catch (error) {
      console.error('Error saving rates:', error);
      toast.error('שגיאה בשמירת הנתונים');
    }
  };

  React.useEffect(() => {
    loadRates();
  }, []);

  if (isLoading) return <div>טוען...</div>;

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>הסכמי סוכן</CardTitle>
          <CardDescription>עדכון עמלות לפי חברה ומוצר</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pension" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pension">פנסיה</TabsTrigger>
              <TabsTrigger value="investment">השקעות</TabsTrigger>
              <TabsTrigger value="policy">פוליסת חיסכון</TabsTrigger>
              <TabsTrigger value="insurance">ביטוח</TabsTrigger>
            </TabsList>

            <TabsContent value="pension">
              <Card>
                <CardHeader>
                  <CardTitle>עמלות פנסיה לפי חברה</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {COMPANIES.pension.map(company => (
                      <div key={company} className="border p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{company}</h3>
                          <Checkbox
                            checked={rates.pension_companies[company].active}
                            onCheckedChange={(checked) => {
                              setRates(prev => ({
                                ...prev,
                                pension_companies: {
                                  ...prev.pension_companies,
                                  [company]: {
                                    ...prev.pension_companies[company],
                                    active: checked === true
                                  }
                                }
                              }));
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              עמלת היקף (%)
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={rates.pension_companies[company].scope_rate * 100}
                              onChange={(e) => {
                                setRates(prev => ({
                                  ...prev,
                                  pension_companies: {
                                    ...prev.pension_companies,
                                    [company]: {
                                      ...prev.pension_companies[company],
                                      scope_rate: Number(e.target.value) / 100
                                    }
                                  }
                                }));
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              עמלת נפרעים (%)
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={rates.pension_companies[company].monthly_rate * 100}
                              onChange={(e) => {
                                setRates(prev => ({
                                  ...prev,
                                  pension_companies: {
                                    ...prev.pension_companies,
                                    [company]: {
                                      ...prev.pension_companies[company],
                                      monthly_rate: Number(e.target.value) / 100
                                    }
                                  }
                                }));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investment">
              <Card>
                <CardHeader>
                  <CardTitle>עמלות השקעות לפי חברה</CardTitle>
                  <CardDescription>גמל והשתלמות</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {COMPANIES.investment.map(company => (
                      <div key={company} className="border p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{company}</h3>
                          <Checkbox
                            checked={rates.investment_companies[company].active}
                            onCheckedChange={(checked) => {
                              setRates(prev => ({
                                ...prev,
                                investment_companies: {
                                  ...prev.investment_companies,
                                  [company]: {
                                    ...prev.investment_companies[company],
                                    active: checked === true
                                  }
                                }
                              }));
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              עמלת היקף (₪ למיליון)
                            </label>
                            <Input
                              type="number"
                              value={rates.investment_companies[company].scope_rate_per_million}
                              onChange={(e) => {
                                setRates(prev => ({
                                  ...prev,
                                  investment_companies: {
                                    ...prev.investment_companies,
                                    [company]: {
                                      ...prev.investment_companies[company],
                                      scope_rate_per_million: Number(e.target.value)
                                    }
                                  }
                                }));
                              }}
                            />
                            <p className="text-sm text-gray-500">לדוגמה: 6,000 = 6,000 ₪ למיליון</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              עמלת נפרעים (₪ למיליון לחודש)
                            </label>
                            <Input
                              type="number"
                              value={rates.investment_companies[company].monthly_rate}
                              onChange={(e) => {
                                setRates(prev => ({
                                  ...prev,
                                  investment_companies: {
                                    ...prev.investment_companies,
                                    [company]: {
                                      ...prev.investment_companies[company],
                                      monthly_rate: Number(e.target.value)
                                    }
                                  }
                                }));
                              }}
                            />
                            <p className="text-sm text-gray-500">לדוגמה: 250 = 250 ₪ למיליון לחודש</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="policy">
              <Card>
                <CardHeader>
                  <CardTitle>עמלות פוליסת חיסכון לפי חברה</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {COMPANIES.policy.map(company => (
                      <div key={company} className="border p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{company}</h3>
                          <Checkbox
                            checked={rates.policy_companies[company].active}
                            onCheckedChange={(checked) => {
                              setRates(prev => ({
                                ...prev,
                                policy_companies: {
                                  ...prev.policy_companies,
                                  [company]: {
                                    ...prev.policy_companies[company],
                                    active: checked === true
                                  }
                                }
                              }));
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              עמלת היקף (₪ למיליון)
                            </label>
                            <Input
                              type="number"
                              value={rates.policy_companies[company].scope_rate_per_million}
                              onChange={(e) => {
                                setRates(prev => ({
                                  ...prev,
                                  policy_companies: {
                                    ...prev.policy_companies,
                                    [company]: {
                                      ...prev.policy_companies[company],
                                      scope_rate_per_million: Number(e.target.value)
                                    }
                                  }
                                }));
                              }}
                            />
                            <p className="text-sm text-gray-500">לדוגמה: 7,000 = 7,000 ₪ למיליון</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              עמלת נפרעים (% שנתי)
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={rates.policy_companies[company].monthly_rate * 100}
                              onChange={(e) => {
                                setRates(prev => ({
                                  ...prev,
                                  policy_companies: {
                                    ...prev.policy_companies,
                                    [company]: {
                                      ...prev.policy_companies[company],
                                      monthly_rate: Number(e.target.value) / 100
                                    }
                                  }
                                }));
                              }}
                            />
                            <p className="text-sm text-gray-500">לדוגמה: 0.3 = 0.3% שנתי</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insurance">
              <Card>
                <CardHeader>
                  <CardTitle>עמלות ביטוח לפי חברה</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {COMPANIES.insurance.map(company => (
                      <div key={company} className="border p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{company}</h3>
                          <Checkbox
                            checked={rates.insurance_companies[company].active}
                            onCheckedChange={(checked) => {
                              setRates(prev => ({
                                ...prev,
                                insurance_companies: {
                                  ...prev.insurance_companies,
                                  [company]: {
                                    ...prev.insurance_companies[company],
                                    active: checked === true
                                  }
                                }
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-6">
                          {Object.entries(rates.insurance_companies[company].products).map(([productType, rates]) => (
                            <div key={productType} className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-4">{getInsuranceProductName(productType)}</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    עמלת היקף (% מפרמיה שנתית)
                                  </label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={rates.one_time_rate * 100}
                                    onChange={(e) => {
                                      setRates(prev => ({
                                        ...prev,
                                        insurance_companies: {
                                          ...prev.insurance_companies,
                                          [company]: {
                                            ...prev.insurance_companies[company],
                                            products: {
                                              ...prev.insurance_companies[company].products,
                                              [productType]: {
                                                ...prev.insurance_companies[company].products[productType],
                                                one_time_rate: Number(e.target.value) / 100
                                              }
                                            }
                                          }
                                        }
                                      }));
                                    }}
                                  />
                                  <p className="text-sm text-gray-500">לדוגמה: 40 = 40%</p>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    עמלת נפרעים (% מפרמיה חודשית)
                                  </label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={rates.monthly_rate * 100}
                                    onChange={(e) => {
                                      setRates(prev => ({
                                        ...prev,
                                        insurance_companies: {
                                          ...prev.insurance_companies,
                                          [company]: {
                                            ...prev.insurance_companies[company],
                                            products: {
                                              ...prev.insurance_companies[company].products,
                                              [productType]: {
                                                ...prev.insurance_companies[company].products[productType],
                                                monthly_rate: Number(e.target.value) / 100
                                              }
                                            }
                                          }
                                        }
                                      }));
                                    }}
                                  />
                                  <p className="text-sm text-gray-500">לדוגמה: 15 = 15%</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <hr className="my-6 border-t border-gray-200" />

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              עודכן לאחרונה: {new Date(rates.updated_at || '').toLocaleDateString('he-IL')}
            </div>
            <Button onClick={() => saveRates(rates)} className="min-w-[200px]">
              שמור שינויים
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// פונקציית עזר להמרת שמות מוצרי ביטוח
const getInsuranceProductName = (productType: string): string => {
  const names: Record<string, string> = {
    risk: 'ביטוח חיים',
    mortgage_risk: 'ביטוח משכנתא',
    health: 'ביטוח בריאות',
    critical_illness: 'מחלות קשות',
    service_letter: 'כתבי שירות',
    disability: 'אובדן כושר עבודה'
  };
  return names[productType] || productType;
};

export default AgentAgreements; 