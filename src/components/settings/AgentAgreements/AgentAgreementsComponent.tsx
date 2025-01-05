import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { AgentRates, DEFAULT_COMPANY_RATES } from './AgentAgreementsTypes';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Save, Loader2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

const pensionCompanies = ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה', 'מיטב דש', 'אלטשולר שחם', 'אנליסט', 'מור'] as const;
const savingsCompanies = ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה', 'מיטב דש', 'אלטשולר שחם', 'אנליסט', 'מור', 'ילין לפידות', 'פסגות'] as const;
const insuranceCompanies = ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה'] as const;

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

const DEFAULT_PENSION_RATES = {
  active: false,
  scope_rate: 0,
  scope_rate_per_million: 0
};

const AgentAgreementsComponent: React.FC = () => {
  const [agentRates, setAgentRates] = useState<AgentRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [savedCompany, setSavedCompany] = useState<string>('');
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAgentRates = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('משתמש לא מחובר');
          return;
        }

        const { data: existingRates, error: fetchError } = await supabase
          .from('agent_commission_rates')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          // Record doesn't exist, create new one with default rates for מגדל
          const defaultRates = {
            user_id: user.id,
            pension_companies: {
              'מגדל': {
                active: true,
                scope_rate: 0.08, // 8%
                scope_rate_per_million: 11000 // 11,000 ₪ למיליון
              }
            },
            savings_and_study_companies: {},
            policy_companies: {},
            insurance_companies: {}
          };

          const { data: newRates, error: insertError } = await supabase
            .from('agent_commission_rates')
            .upsert(defaultRates)
            .select()
            .single();

          if (insertError) {
            console.error('Error creating agent rates:', insertError);
            return;
          }

          setAgentRates(newRates);
        } else if (fetchError) {
          console.error('Error fetching agent rates:', fetchError);
          return;
        } else {
          setAgentRates(existingRates);
        }
      } catch (error) {
        console.error('Error fetching agent rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentRates();
  }, []);

  const handleRateChange = async (
    category: keyof Pick<AgentRates, 'pension_companies' | 'savings_and_study_companies' | 'policy_companies'>,
    company: string,
    field: string,
    value: any
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

    setAgentRates(updatedRates);

    try {
      const { error } = await supabase
        .from('agent_commission_rates')
        .update(updatedRates)
        .eq('user_id', agentRates.user_id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating rates:', error);
      toast.error('שגיאה בעדכון הנתונים');
    }
  };

  const handleSaveCompany = async (company: string) => {
    if (!agentRates) return;

    setSavingCompany(company);
    
    try {
      const { error } = await supabase
        .from('agent_commission_rates')
        .update(agentRates)
        .eq('user_id', agentRates.user_id);

      if (error) {
        throw error;
      }

      setSavedCompany(company);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error saving company rates:', error);
      toast.error('שגיאה בשמירת ההסכם');
    } finally {
      setSavingCompany(null);
    }
  };

  const handleProductRateChange = async (
    category: keyof Pick<AgentRates, 'insurance_companies' | 'savings_and_study_companies'>,
    company: string,
    productType: string,
    field: 'one_time_rate' | 'monthly_rate' | 'scope_commission',
    value: number
  ) => {
    if (!agentRates) return;

    const updatedRates = {
      ...agentRates,
      [category]: {
        ...agentRates[category],
        [company]: {
          ...agentRates[category][company],
          products: {
            ...agentRates[category][company]?.products,
            [productType]: {
              ...agentRates[category][company]?.products?.[productType],
              [field]: value
            }
          }
        }
      }
    };

    setAgentRates(updatedRates);

    try {
      const { error } = await supabase
        .from('agent_commission_rates')
        .update(updatedRates)
        .eq('user_id', agentRates.user_id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating rates:', error);
      toast.error('שגיאה בעדכון הנתונים');
    }
  };

  const handleCheckboxChange = async (
    checked: boolean,
    category: keyof Pick<AgentRates, 'pension_companies' | 'savings_and_study_companies' | 'policy_companies' | 'insurance_companies'>,
    company: string
  ) => {
    if (!agentRates) return;

    const updatedRates = {
      ...agentRates,
      [category]: {
        ...agentRates[category],
        [company]: {
          ...agentRates[category][company],
          active: checked
        }
      }
    };

    setAgentRates(updatedRates);
    
    try {
      const { error } = await supabase
        .from('agent_commission_rates')
        .update(updatedRates)
        .eq('user_id', agentRates.user_id);

      if (error) throw error;

      toast.success(`חברת ${company} ${checked ? 'הופעלה' : 'בוטלה'} בהצלחה`);
    } catch (error) {
      console.error('Error updating company status:', error);
      toast.error('שגיאה בעדכון סטטוס החברה');
    }
  };

  const onCheckboxChange = (
    checked: boolean | 'indeterminate',
    category: keyof Pick<AgentRates, 'pension_companies' | 'savings_and_study_companies' | 'policy_companies' | 'insurance_companies'>,
    company: string
  ) => {
    handleCheckboxChange(checked === true, category, company);
  };

  const handleDeleteSalesData = async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('משתמש לא מחובר');
        return;
      }

      // מריאה לפונקציית המחיקה בצד השרת
      const { error } = await supabase.rpc('delete_user_sales_data');

      if (error) {
        console.error('Error deleting sales data:', error);
        throw error;
      }

      // רענון הדף כדי לראות את השינויים
      window.location.href = '/reports';

      toast.success('כל נתוני המכירות ומחקו בהצלחה');
      setShowDeleteConfirmDialog(false);
    } catch (error) {
      console.error('Error deleting sales data:', error);
      toast.error('שגיאה במחיקת נתוני המכירות');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div>טוען...</div>;
  }

  if (!agentRates) {
    return <div>שגיאה בטעינת נתונים</div>;
  }

  return (
    <div className="space-y-8 p-6 text-right">
      <div className="flex justify-between items-center">
        <Button
          variant="destructive"
          className="flex items-center gap-2"
          onClick={() => setShowDeleteConfirmDialog(true)}
        >
          <Trash2 className="w-4 h-4" />
          מחיקת נתוני מכירה
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">הסכמי סוכן</h1>
      </div>
      
      <Tabs defaultValue="pension" className="w-full" dir="rtl">
        <TabsList className="w-full justify-start border-b">
          <TabsTrigger value="pension">פנסיה</TabsTrigger>
          <TabsTrigger value="insurance">סיכונים</TabsTrigger>
          <TabsTrigger value="savings">פיננסים</TabsTrigger>
          <TabsTrigger value="policy">מוצרי גולה</TabsTrigger>
        </TabsList>

        <TabsContent value="pension" className="mt-6">
          <section>
            <h2 className="text-2xl font-semibold mb-6">חברות פנסיה</h2>
            <div className="grid grid-cols-3 gap-6">
              {pensionCompanies.map((company, index) => {
                const rates = agentRates.pension_companies[company] || DEFAULT_PENSION_RATES;
                
                return (
                  <motion.div
                    key={company}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      <CardHeader className={`border-b ${rates.active ? 'bg-gradient-to-l from-green-50 to-blue-50' : 'bg-gradient-to-l from-gray-50 to-gray-100'}`}>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {rates.active ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            {company}
                          </div>
                          <div className="flex items-center gap-2">
                            <Label>חברה פעילה</Label>
                            <Checkbox
                              checked={rates.active}
                              onCheckedChange={(checked: boolean | 'indeterminate') => onCheckboxChange(checked, 'pension_companies', company)}
                            />
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`scope-rate-${company}`}>אחוז עמלת היקף (%)</Label>
                            <Input
                              id={`scope-rate-${company}`}
                              type="number"
                              value={rates.scope_rate}
                              onChange={(e) => 
                                handleRateChange('pension_companies', company, 'scope_rate', Number(e.target.value))
                              }
                              step="0.01"
                              min="0"
                              max="100"
                              placeholder="לדוגמה: 0.25"
                              className="text-right"
                              dir="rtl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`scope-rate-million-${company}`}>אחוז עמלת היקף למיליון (%)</Label>
                            <Input
                              id={`scope-rate-million-${company}`}
                              type="number"
                              value={rates.scope_rate_per_million}
                              onChange={(e) => 
                                handleRateChange('pension_companies', company, 'scope_rate_per_million', Number(e.target.value))
                              }
                              step="0.01"
                              min="0"
                              max="100"
                              placeholder="לדוגמה: 0.25"
                              className="text-right"
                              dir="rtl"
                            />
                          </div>
                          <button
                            onClick={() => handleSaveCompany(company)}
                            disabled={savingCompany === company}
                            className={`w-full mt-4 px-4 py-2 text-white font-medium rounded-lg transition-all
                              flex items-center justify-center gap-2
                              ${savingCompany === company
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                          >
                            {savingCompany === company ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                שומר...
                              </>
                            ) : (
                              <>
                                שמור הסכם
                                <Save className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="insurance" className="mt-6">
          <section>
            <h2 className="text-2xl font-semibold mb-6">חברות ביטוח</h2>
            <div className="grid grid-cols-3 gap-6">
              {insuranceCompanies.map((company, index) => {
                const rates = agentRates.insurance_companies[company] || DEFAULT_COMPANY_RATES;
                
                return (
                  <motion.div
                    key={company}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      <CardHeader className={`border-b ${rates.active ? 'bg-gradient-to-l from-green-50 to-blue-50' : 'bg-gradient-to-l from-gray-50 to-gray-100'}`}>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {rates.active ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            {company}
                          </div>
                          <div className="flex items-center gap-2">
                            <Label>חברה פעילה</Label>
                            <Checkbox
                              checked={rates.active}
                              onCheckedChange={(checked: boolean | 'indeterminate') => onCheckboxChange(checked, 'insurance_companies', company)}
                            />
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {INSURANCE_PRODUCTS.map((product) => (
                            <div key={product.value} className="space-y-4">
                              <h3 className="font-medium">{product.label}</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>עמלת היקף (%)</Label>
                                  <Input
                                    type="number"
                                    value={rates.products?.[product.value]?.one_time_rate || 0}
                                    onChange={(e) => 
                                      handleProductRateChange('insurance_companies', company, product.value, 'one_time_rate', Number(e.target.value))
                                    }
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="לדוגמה: 0.25"
                                    className="text-right"
                                    dir="rtl"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>עמלת נפרעים (%)</Label>
                                  <Input
                                    type="number"
                                    value={rates.products?.[product.value]?.monthly_rate || 0}
                                    onChange={(e) => 
                                      handleProductRateChange('insurance_companies', company, product.value, 'monthly_rate', Number(e.target.value))
                                    }
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="לדוגמה: 0.25"
                                    className="text-right"
                                    dir="rtl"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 flex justify-start">
                          <button
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                            onClick={() => handleSaveCompany(company)}
                          >
                            שמור הסכם
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="savings" className="mt-6">
          <section>
            <h2 className="text-2xl font-semibold mb-6">חברות פיננסים</h2>
            <div className="grid grid-cols-3 gap-6">
              {savingsCompanies.map((company, index) => {
                const rates = agentRates.savings_and_study_companies[company] || DEFAULT_COMPANY_RATES;
                
                return (
                  <motion.div
                    key={company}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      <CardHeader className={`border-b ${rates.active ? 'bg-gradient-to-l from-green-50 to-blue-50' : 'bg-gradient-to-l from-gray-50 to-gray-100'}`}>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {rates.active ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            {company}
                          </div>
                          <div className="flex items-center gap-2">
                            <Label>חברה פעילה</Label>
                            <Checkbox
                              checked={rates.active}
                              onCheckedChange={(checked: boolean | 'indeterminate') => onCheckboxChange(checked, 'savings_and_study_companies', company)}
                            />
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {['gemel', 'investment_gemel', 'hishtalmut', 'savings_policy'].map((product) => (
                            <div key={product} className="space-y-4">
                              <h3 className="font-medium">
                                {product === 'gemel' ? 'גמל' :
                                 product === 'investment_gemel' ? 'גמל להשקעה' :
                                 product === 'hishtalmut' ? 'השתלמות' :
                                 'חסכון'}
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>עמלת היקף (%)</Label>
                                  <Input
                                    type="number"
                                    value={rates.products?.[product]?.scope_commission || 0}
                                    onChange={(e) => 
                                      handleProductRateChange('savings_and_study_companies', company, product, 'scope_commission', Number(e.target.value))
                                    }
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="לדוגמה: 0.25"
                                    className="text-right"
                                    dir="rtl"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>עמלת נפרעים (%)</Label>
                                  <Input
                                    type="number"
                                    value={rates.products?.[product]?.monthly_rate || 0}
                                    onChange={(e) => 
                                      handleProductRateChange('savings_and_study_companies', company, product, 'monthly_rate', Number(e.target.value))
                                    }
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="לדוגמה: 0.25"
                                    className="text-right"
                                    dir="rtl"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 flex justify-start">
                          <button
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                            onClick={() => handleSaveCompany(company)}
                          >
                            שמור הסכם
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </TabsContent>

        {/* Similar updates for insurance, savings, and policy tabs */}
        
      </Tabs>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <span>ההסכם נשמר בהצלחה!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-lg mb-2">
              הנתונים עבור {savedCompany} עודכנו בהצלחה
            </p>
            <p className="text-sm text-gray-500">
              כל השינויים נשמרו במערכת
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">מחיקת נתוני מכירה</DialogTitle>
            <DialogDescription className="text-right">
              האם אתה בטוח שברצונך למחוק את כל נתוני המכירה? פעולה זו תמחק את כל המכירות מכל הקטגוריות. לא ניתן לשחזר נתונים אלו לאחר המחיקה.
              <br />
              <br />
              <strong>שים לב:</strong> הסכמי העמלות ויעדי המכירה יישארו ללא שינוי.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row-reverse justify-start gap-2">
            <Button
              variant="destructive"
              onClick={handleDeleteSalesData}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  מוחק...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 ml-2" />
                  מחק הכל
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmDialog(false)}
              disabled={isDeleting}
            >
              ביטול
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentAgreementsComponent;
