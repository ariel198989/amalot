import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { calculateCommissions, getCompanyRates } from '@/services/AgentAgreementService';
import { productTypes, ProductType, Product } from '@/config/products';

interface CommissionResult {
  scope_commission: number;
  monthly_commission: number;
  total_commission: number;
}

interface CommissionResults {
  [company: string]: CommissionResult;
}

const CalculatorPage: React.FC = () => {
  const [companyRates, setCompanyRates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState<CommissionResults>({});
  const [formData, setFormData] = useState({
    pension: {
      salary: '',
      accumulation: ''
    },
    insurance: {
      premium: '',
      product: ''
    },
    investment: {
      amount: '',
      product: ''
    }
  });

  const loadCompanyRates = async () => {
    try {
      const rates: Record<string, any> = {};
      const pensionCompanies = ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה', 'מיטב', 'אלטשולר שחם', 'מור'];
      const insuranceCompanies = ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה'];
      const financialCompanies = ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'מיטב', 'אלטשולר שחם', 'מור'];
      const categories = ['pension', 'insurance', 'savings_and_study'];
      
      for (const category of categories) {
        rates[category] = {};
        const companies = category === 'pension' ? pensionCompanies : 
                         category === 'insurance' ? insuranceCompanies :
                         category === 'savings_and_study' ? financialCompanies :
                         pensionCompanies;
        
        for (const company of companies) {
          const companyRate = await getCompanyRates(category, company);
          if (companyRate) {
            rates[category][company] = companyRate;
          }
        }
      }
      
      console.log('Loaded company rates:', rates);
      setCompanyRates(rates);
    } catch (error) {
      console.error('Error loading company rates:', error);
      toast.error('שגיאה בטעינת נתוני החברות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyRates();
    const subscription = supabase.channel('agent_commission_rates_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_commission_rates' }, () => loadCompanyRates())
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, []);

  const handleInputChange = (category: 'pension' | 'insurance' | 'investment', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleCalculate = async (product: ProductType) => {
    try {
      setCalculating(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('לא נמצא משתמש מחובר');
        return;
      }

      // Check if we have rates for this company and type
      const category = product.id === 'investment' ? 'savings_and_study' : product.id;
      const calculatedResults: CommissionResults = {};

      for (const company of product.companies) {
        const companyRate = companyRates[category]?.[company];
        if (!companyRate) {
          console.log('No rates found for:', { category, company });
          continue;
        }

        let amount = 0;
        let totalAccumulated = 0;
        let insuranceType = '';

        switch (product.id) {
          case 'pension':
            if (!formData.pension.salary || !formData.pension.accumulation) {
              toast.error('נא למלא את כל השדות');
              return;
            }
            amount = Number(formData.pension.salary);
            totalAccumulated = Number(formData.pension.accumulation);
            break;

          case 'insurance':
            if (!formData.insurance.premium || !formData.insurance.product) {
              toast.error('נא למלא את כל השדות');
              return;
            }
            amount = Number(formData.insurance.premium);
            insuranceType = formData.insurance.product;
            break;

          case 'investment':
            if (!formData.investment.amount || !formData.investment.product) {
              toast.error('נא למלא את כל השדות');
              return;
            }
            amount = Number(formData.investment.amount);
            insuranceType = formData.investment.product;
            break;
        }

        const rates = await calculateCommissions(
          user.id,
          category,
          company,
          amount,
          insuranceType,
          totalAccumulated
        );

        if (rates) {
          calculatedResults[company] = rates;
        }
      }

      setResults(calculatedResults);
    } catch (error) {
      console.error('Error calculating commissions:', error);
      toast.error('שגיאה בחישוב העמלות');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">טוען...</div>;
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-secondary-50 to-white" dir="rtl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-secondary-900">מחשבון עמלות</h1>
        <p className="text-secondary-500">בדוק את כדאיות המכירה בכל החברות</p>
      </div>

      <Tabs defaultValue="pension" className="w-full">
        <TabsList className="inline-flex h-auto w-full justify-end gap-4 rounded-none border-b bg-transparent p-0">
          {productTypes.map((product: ProductType) => (
            <TabsTrigger
              key={product.id}
              value={product.id}
              className="inline-flex items-center justify-center rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium text-secondary-500 shadow-none transition-all duration-200 hover:text-secondary-900 data-[state=active]:border-primary data-[state=active]:text-primary-600 data-[state=active]:shadow-none"
            >
              <product.icon className={cn("w-4 h-4 ml-2", product.color)} />
              {product.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6 space-y-8">
          {productTypes.map((product: ProductType) => (
            <TabsContent key={product.id} value={product.id}>
              <div className="grid gap-8">
                {/* טופס */}
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50 border-t-4" style={{ borderTopColor: product.color.replace('text-', 'rgb(var(--') }}>
                  <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-primary-100/50">
                    <CardTitle className="text-lg font-semibold text-primary-600 text-right">הזן פרטי {product.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-6">
                      {product.products ? (
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-right text-secondary-700">סוג מוצר</label>
                          <select 
                            className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-right" 
                            dir="rtl"
                            value={formData[product.id === 'insurance' ? 'insurance' : 'investment'].product}
                            onChange={(e) => handleInputChange(product.id === 'insurance' ? 'insurance' : 'investment', 'product', e.target.value)}
                          >
                            <option value="">בחר סוג מוצר</option>
                            {product.products.map((p: Product) => (
                              <option key={p.value} value={p.value} className="text-right">{p.label}</option>
                            ))}
                          </select>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-6">
                        {product.id === 'pension' && (
                          <>
                            <div className="grid gap-2 col-span-2">
                              <label className="text-sm font-medium text-right text-secondary-700">שכר ברוטו</label>
                              <input 
                                type="number" 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-right" 
                                dir="rtl"
                                value={formData.pension.salary}
                                onChange={(e) => handleInputChange('pension', 'salary', e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2 col-span-2">
                              <label className="text-sm font-medium text-right text-secondary-700">צבירה קיימת</label>
                              <input 
                                type="number" 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-right" 
                                dir="rtl"
                                value={formData.pension.accumulation}
                                onChange={(e) => handleInputChange('pension', 'accumulation', e.target.value)}
                              />
                            </div>
                          </>
                        )}
                        {product.id === 'insurance' && (
                          <div className="grid gap-2 col-span-2">
                            <label className="text-sm font-medium text-right text-secondary-700">פרמיה חודשית</label>
                            <input 
                              type="number" 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-right" 
                              dir="rtl"
                              value={formData.insurance.premium}
                              onChange={(e) => handleInputChange('insurance', 'premium', e.target.value)}
                            />
                          </div>
                        )}
                        {product.id === 'investment' && (
                          <div className="grid gap-2 col-span-2">
                            <label className="text-sm font-medium text-right text-secondary-700">סכום השקעה</label>
                            <input 
                              type="number" 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-right" 
                              dir="rtl"
                              value={formData.investment.amount}
                              onChange={(e) => handleInputChange('investment', 'amount', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* כפתור חישוב */}
                <button 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full"
                  onClick={() => handleCalculate(product)}
                  disabled={calculating}
                >
                  {calculating ? 'מחשב...' : 'בדוק כדאיות מכירה בכל החברות'}
                </button>

                {/* טבלת פירוט */}
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50 border-none">
                  <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-primary-100/50">
                    <CardTitle className="text-lg font-semibold text-primary-600 text-right">תוצאות בדיקת כדאיות</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60">
                          <tr>
                            {product.id === 'pension' ? (
                              <>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">סה"כ חד פעמי</th>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">עמלת היקף על הצבירה</th>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">עמלת היקף על הפקדה</th>
                              </>
                            ) : (
                              <>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">סה"כ שנתי</th>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">עמלת נפרעים שנתית</th>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">עמלת נפרעים חודשית</th>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">עמלת היקף</th>
                              </>
                            )}
                            <th className="h-12 px-4 text-right font-medium text-secondary-700">חברה</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.companies.map((company: string, index: number) => {
                            const result = results[company] || { scope_commission: 0, monthly_commission: 0, total_commission: 0 };
                            return (
                              <tr key={company} className={cn("border-b transition-colors hover:bg-muted/50", index % 2 === 0 ? "bg-muted/20" : "bg-background")}>
                                {product.id === 'pension' ? (
                                  <>
                                    <td className="p-4 font-medium text-primary-600 text-right">₪{result.total_commission.toLocaleString()}</td>
                                    <td className="p-4 text-secondary-700 text-right">₪{(result.monthly_commission || 0).toLocaleString()}</td>
                                    <td className="p-4 text-secondary-700 text-right">₪{result.scope_commission.toLocaleString()}</td>
                                  </>
                                ) : (
                                  <>
                                    <td className="p-4 font-medium text-primary-600 text-right">₪{result.total_commission.toLocaleString()}</td>
                                    <td className="p-4 text-secondary-700 text-right">₪{(result.monthly_commission * 12 || 0).toLocaleString()}</td>
                                    <td className="p-4 text-secondary-700 text-right">₪{(result.monthly_commission || 0).toLocaleString()}</td>
                                    <td className="p-4 text-secondary-700 text-right">₪{result.scope_commission.toLocaleString()}</td>
                                  </>
                                )}
                                <td className="p-4 font-medium text-secondary-900 text-right">{company}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default CalculatorPage;