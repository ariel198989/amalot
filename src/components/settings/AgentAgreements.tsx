import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface AgreementDetails {
  pension?: {
    scopeRate: number;
    accumulationRate: number;
  };
  insurance?: {
    oneTimeRate: number;
    monthlyRate: number;
    riskRate: number;
    mortgageRate: number;
    healthRate: number;
    disabilityRate: number;
  };
  investment?: {
    scopeRate: number;
  };
  policy?: {
    shortTermRate: number;
    longTermRate: number;
  };
}

const AgentAgreements: React.FC = () => {
  const [agreements, setAgreements] = React.useState<Record<string, Record<string, AgreementDetails>>>({});
  const [selectedCompany, setSelectedCompany] = React.useState<string>('');
  const [selectedProduct, setSelectedProduct] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);

  const companies = {
    pension: ['כלל', 'הראל', 'מגדל', 'הפניקס', 'מנורה', 'מור'],
    insurance: ['כלל', 'הראל', 'מגדל', 'הפניקס', 'מנורה', 'איילון'],
    investment: ['כלל', 'הראל', 'מגדל', 'הפניקס', 'מנורה', 'אלטשולר'],
    policy: ['כלל', 'הראל', 'מגדל', 'הפניקס', 'מנורה']
  };

  // טעינת הסכמים קיימים
  React.useEffect(() => {
    const loadAgreements = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return;

        const { data, error } = await supabase
          .from('agent_agreements')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const agreementsMap: Record<string, Record<string, AgreementDetails>> = {};
        data?.forEach(agreement => {
          if (!agreementsMap[agreement.company]) {
            agreementsMap[agreement.company] = {};
          }
          agreementsMap[agreement.company][agreement.product_type] = agreement.agreement_details;
        });

        setAgreements(agreementsMap);
      } catch (error) {
        console.error('Error loading agreements:', error);
        toast.error('אירעה שגיאה בטעינת ההסכמים');
      } finally {
        setLoading(false);
      }
    };

    loadAgreements();
  }, []);

  const handleSaveAgreement = async (company: string, productType: string, details: AgreementDetails) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('משתמש לא מחובר');

      const { error } = await supabase
        .from('agent_agreements')
        .upsert({
          user_id: user.id,
          company,
          product_type: productType,
          agreement_details: details,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,company,product_type'
        });

      if (error) throw error;

      setAgreements(prev => ({
        ...prev,
        [company]: {
          ...prev[company],
          [productType]: details
        }
      }));

      toast.success('ההסכם נשמר בהצלחה');
    } catch (error) {
      console.error('Error saving agreement:', error);
      toast.error('אירעה שגיאה בשמירת ההסכם');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>הסכמי סוכן</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">בחר חברה</label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר חברה" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(companies).flat().filter((v, i, a) => a.indexOf(v) === i).map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">בחר מוצר</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר מוצר" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pension">פנסיה</SelectItem>
                  <SelectItem value="insurance">ביטוח</SelectItem>
                  <SelectItem value="investment">השקעות</SelectItem>
                  <SelectItem value="policy">פוליסות חיסכון</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCompany && selectedProduct && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">הגדרת עמלות - {selectedCompany}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedProduct === 'pension' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">אחוז עמלת היקף</label>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={agreements[selectedCompany]?.pension?.scopeRate || ''}
                        onChange={(e) => handleSaveAgreement(selectedCompany, 'pension', {
                          pension: {
                            scopeRate: Number(e.target.value),
                            accumulationRate: agreements[selectedCompany]?.pension?.accumulationRate || 0
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">סכום עמלת צבירה (לכל מיליון ₪)</label>
                      <Input 
                        type="number"
                        value={agreements[selectedCompany]?.pension?.accumulationRate || ''}
                        onChange={(e) => handleSaveAgreement(selectedCompany, 'pension', {
                          pension: {
                            scopeRate: agreements[selectedCompany]?.pension?.scopeRate || 0,
                            accumulationRate: Number(e.target.value)
                          }
                        })}
                      />
                    </div>
                  </>
                )}

                {/* הוספת שדות דומים עבור שאר המוצרים */}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentAgreements; 