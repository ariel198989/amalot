import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResultsTable from './ResultsTable';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface ProductSelection {
  pension: boolean;
  insurance: boolean;
  investment: boolean;
  policy: boolean;
}

interface CompanySelection {
  pension: string[];
  insurance: string[];
  investment: string[];
  policy: string[];
}

interface Journey {
  id?: string;
  date: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  selectedProducts: string[];
  selectedCompanies: CompanySelection;
  commissions: {
    pension: number;
    insurance: number;
    investment: number;
    policy: number;
  };
  totalCommission: number;
  details: {
    pension?: {
      salary: number;
      accumulation: number;
      provision: number;
    };
    insurance?: {
      type: string;
      premium: number;
    };
    investment?: {
      amount: number;
    };
    policy?: {
      amount: number;
    };
  };
  created_at?: string;
  user_id?: string;
}

const CustomerJourney: React.FC = () => {
  const [selectedProducts, setSelectedProducts] = React.useState<ProductSelection>({
    pension: false,
    insurance: false,
    investment: false,
    policy: false
  });

  const [selectedCompanies, setSelectedCompanies] = React.useState<CompanySelection>({
    pension: [],
    insurance: [],
    investment: [],
    policy: []
  });

  const [journeys, setJourneys] = React.useState<Journey[]>([]);
  const { register, handleSubmit: handleFormSubmit, setValue, watch } = useForm();

  const products = [
    { id: 'pension', label: 'פנסיה', description: 'חישוב עמלות פנסיה',
      companies: ['מגדל', 'הראל', 'כלל', 'הפניקס', 'מנורה', 'מור'] },
    { id: 'insurance', label: 'ביטוח', description: 'חישוב עמלות ביטוח',
      companies: ['איילון', 'הראל', 'מגדל', 'מנורה', 'כלל', 'הפניקס', 'הכשרה'] },
    { id: 'investment', label: 'גמל והשתלמות', description: 'חישוב עמלות גמל והשתלמות',
      companies: ['הראל', 'מגדל', 'כלל', 'הפניקס', 'מור', 'ילין לפידות'] },
    { id: 'policy', label: 'פוליסת חיסכון', description: 'חישוב עמלות פוליסת חיסכון',
      companies: ['הראל', 'מגדל', 'כלל', 'הפניקס', 'מנורה', 'איילון'] }
  ];

  // פונקציות חישוב מכל המחשבונים
  const calculatePensionCommissions = (data: any, company: string) => {
    const salary = Number(data.pensionSalary);
    const accumulation = Number(data.pensionAccumulation);
    const provision = Number(data.pensionProvision) / 100;

    const rates = {
      'כלל': { scope: 0.09, accumulation: 3000 },
      'הראל': { scope: 0.06, accumulation: 0 },
      'מגדל': { scope: 0.07, accumulation: 2500 },
      'הפניקס': { scope: 0.06, accumulation: 0 },
      'מנורה': { scope: 0.03, accumulation: 2500 },
      'מור': { scope: 0.06, accumulation: 1760 }
    };

    const companyRates = rates[company];
    const scopeCommission = salary * 12 * companyRates.scope * provision;
    const accumulationCommission = (accumulation / 1000000) * companyRates.accumulation;

    return {
      scopeCommission,
      accumulationCommission,
      totalCommission: scopeCommission + accumulationCommission
    };
  };

  const calculateInsuranceCommissions = (data: any, company: string) => {
    const monthlyPremium = Number(data.insurancePremium);
    const insuranceType = data.insuranceType;

    let oneTimeRate = (company === 'איילון' || company === 'מגדל') ? 67 : 65;
    let monthlyRate = 0;

    if (company === 'איילון') {
      switch (insuranceType) {
        case 'risk':
        case 'health':
        case 'critical_illness':
        case 'service_letter':
          monthlyRate = 20;
          break;
        case 'mortgage_risk':
          monthlyRate = 14;
          break;
        case 'disability':
          monthlyRate = 12;
          break;
      }
    } else {
      switch (insuranceType) {
        case 'risk':
        case 'health':
        case 'critical_illness':
        case 'service_letter':
          monthlyRate = 20;
          break;
        case 'mortgage_risk':
          monthlyRate = 17;
          break;
        case 'disability':
          monthlyRate = 12;
          break;
      }
    }

    const oneTimeCommission = monthlyPremium * 12 * (oneTimeRate / 100);
    const monthlyCommission = monthlyPremium * (monthlyRate / 100);

    return {
      oneTimeCommission,
      monthlyCommission,
      totalCommission: oneTimeCommission + (monthlyCommission * 12)
    };
  };

  const onSubmit = async (data: any) => {
    try {
      let totalCommissions = {
        pension: 0,
        insurance: 0,
        investment: 0,
        policy: 0
      };

      // חישוב עמלות פנסיה
      if (selectedProducts.pension) {
        selectedCompanies.pension.forEach(company => {
          const result = calculatePensionCommissions(data, company);
          totalCommissions.pension += result.totalCommission;
        });
      }

      // חישוב עמלות ביטוח
      if (selectedProducts.insurance) {
        selectedCompanies.insurance.forEach(company => {
          const result = calculateInsuranceCommissions(data, company);
          totalCommissions.insurance += result.totalCommission;
        });
      }

      // חישוב עמלות השקעות
      if (selectedProducts.investment) {
        selectedCompanies.investment.forEach(company => {
          const amount = Number(data.investmentAmount);
          const scopeCommission = (amount / 1000000) * 6000;
          totalCommissions.investment += scopeCommission;
        });
      }

      // חישוב עמלות פוליסת חיסכון
      if (selectedProducts.policy) {
        selectedCompanies.policy.forEach(company => {
          const amount = Number(data.policyAmount);
          const scopeCommission = (amount / 1000000) * 7000;
          totalCommissions.policy += scopeCommission;
        });
      }

      const journey = {
        journey_date: new Date().toLocaleDateString('he-IL'),
        client_name: data.clientName,
        client_phone: data.clientPhone,
        selected_products: Object.entries(selectedProducts)
          .filter(([_, selected]) => selected)
          .map(([product]) => product),
        selected_companies: selectedCompanies,
        commissions: totalCommissions,
        total_commission: Object.values(totalCommissions).reduce((a, b) => a + b, 0),
        details: {
          pension: selectedProducts.pension ? {
            salary: Number(data.pensionSalary),
            accumulation: Number(data.pensionAccumulation),
            provision: Number(data.pensionProvision)
          } : null,
          insurance: selectedProducts.insurance ? {
            type: data.insuranceType,
            premium: Number(data.insurancePremium)
          } : null,
          investment: selectedProducts.investment ? {
            amount: Number(data.investmentAmount)
          } : null,
          policy: selectedProducts.policy ? {
            amount: Number(data.policyAmount)
          } : null
        },
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      // מירה בסופאבייס
      const { data: savedJourney, error } = await supabase
        .from('customer_journeys')
        .insert([journey])
        .select()
        .single();

      if (error) throw error;

      setJourneys([...journeys, savedJourney]);
      toast.success('מסע הלקוח נשמר בהצלחה!');

    } catch (error: any) {
      console.error('Error saving journey:', error);
      toast.error(error.message || 'אירעה שגיאה בשמירת מסע הלקוח');
    }
  };

  // טעינת נתונים בעת טעינת הקומפוננטה
  React.useEffect(() => {
    const loadJourneys = async () => {
      try {
        const { data, error } = await supabase
          .from('customer_journeys')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setJourneys(data);

      } catch (error: any) {
        console.error('Error loading journeys:', error);
        toast.error('אירעה שגיאה בטעינת הנתונים');
      }
    };

    loadJourneys();
  }, []);

  const generateReport = (journey: any) => {
    let totalCommissions = {
      pension: 0,
      insurance: 0,
      investment: 0,
      policy: 0
    };

    let message = `דוח מסכם - מסע לקוח\n`;
    message += `תאריך: ${new Date().toLocaleDateString('he-IL')}\n`;
    message += `שם לקוח: ${journey.clientName}\n`;
    message += `טלפון: ${journey.clientPhone}\n\n`;

    if (selectedProducts.pension) {
      message += `פנסיה:\n`;
      message += `חברות: ${selectedCompanies.pension.join(', ')}\n`;
      message += `שכר חודשי: ${journey.details.pension.salary.toLocaleString()} ₪\n`;
      message += `סכום צבירה: ${journey.details.pension.accumulation.toLocaleString()} ₪\n`;
      message += `אחוז הפרשה: ${journey.details.pension.provision}%\n`;
      message += `סה"כ עמלות פנסיה: ${journey.commissions.pension.toLocaleString()} ₪\n\n`;
      totalCommissions.pension = journey.commissions.pension;
    }

    if (selectedProducts.insurance) {
      message += `ביטוח:\n`;
      message += `חברות: ${selectedCompanies.insurance.join(', ')}\n`;
      message += `סוג ביטוח: ${journey.details.insurance.type}\n`;
      message += `פרמיה חודשית: ${journey.details.insurance.premium.toLocaleString()} ₪\n`;
      message += `סה"כ עמלות ביטוח: ${journey.commissions.insurance.toLocaleString()} ₪\n\n`;
      totalCommissions.insurance = journey.commissions.insurance;
    }

    if (selectedProducts.investment) {
      message += `גמל והשתלמות:\n`;
      message += `חברות: ${selectedCompanies.investment.join(', ')}\n`;
      message += `סכום ניוד: ${journey.details.investment.amount.toLocaleString()} ₪\n`;
      message += `סה"כ עמלות השקעות: ${journey.commissions.investment.toLocaleString()} ₪\n\n`;
      totalCommissions.investment = journey.commissions.investment;
    }

    if (selectedProducts.policy) {
      message += `פוליסת חיסכון:\n`;
      message += `חברות: ${selectedCompanies.policy.join(', ')}\n`;
      message += `סכום הפקדה: ${journey.details.policy.amount.toLocaleString()} ₪\n`;
      message += `סה"כ עמלות פוליסה: ${journey.commissions.policy.toLocaleString()} ₪\n\n`;
      totalCommissions.policy = journey.commissions.policy;
    }

    const grandTotal = Object.values(totalCommissions).reduce((a, b) => a + b, 0);
    message += `סיכום עמלות:\n`;
    message += `סה"כ עמלות פנסיה: ${totalCommissions.pension.toLocaleString()} ₪\n`;
    message += `סה"כ עמלות ביטוח: ${totalCommissions.insurance.toLocaleString()} ₪\n`;
    message += `סה"כ עמלות השקעות: ${totalCommissions.investment.toLocaleString()} ₪\n`;
    message += `סה"כ עמלות פליסה: ${totalCommissions.policy.toLocaleString()} ₪\n`;
    message += `\nסה"כ עמלות כללי: ${grandTotal.toLocaleString()} ₪`;

    // שיתוף בוואטסאפ
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');

    // הורדה כקובץ טקסט
    const blob = new Blob([message], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `דוח_מסע_לקוח_${journey.clientName}_${new Date().toLocaleDateString('he-IL')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    if (journeys.length === 0) {
      toast.error('אין נתונים להורדה');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "תאריך,שם הלקוח,מוצרים,עמלות פנסיה,עמלות ביטוח,עמלות השקעות,עמלות פוליסה,סה\"כ עמלות\n";
    
    journeys.forEach((journey) => {
      const row = [
        journey.journey_date,
        journey.client_name,
        journey.selected_products.join('; '),
        journey.commissions.pension,
        journey.commissions.insurance,
        journey.commissions.investment,
        journey.commissions.policy,
        journey.total_commission
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "דוח_מסע_לקוח.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (journeys.length === 0) {
      toast.error('אין נתונים לשליחה');
      return;
    }
    
    const lastJourney = journeys[journeys.length - 1];
    let message = `דוח מסע לקוח:\n\n`;
    message += `תאריך: ${lastJourney.journey_date}\n`;
    message += `שם לקוח: ${lastJourney.client_name}\n`;
    message += `מוצרים שנבחרו: ${lastJourney.selected_products.join(', ')}\n\n`;
    
    if (lastJourney.commissions.pension > 0) {
      message += `עמלות פנסיה: ${lastJourney.commissions.pension.toLocaleString()} ₪\n`;
    }
    if (lastJourney.commissions.insurance > 0) {
      message += `עמלות ביטוח: ${lastJourney.commissions.insurance.toLocaleString()} ₪\n`;
    }
    if (lastJourney.commissions.investment > 0) {
      message += `עמלות השקעות: ${lastJourney.commissions.investment.toLocaleString()} ₪\n`;
    }
    if (lastJourney.commissions.policy > 0) {
      message += `עמלות פוליסה: ${lastJourney.commissions.policy.toLocaleString()} ₪\n`;
    }
    
    message += `\nסה"כ עמלות: ${lastJourney.total_commission.toLocaleString()} ₪`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-8">
      {/* פרטי לקוח */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">פרטי לקוח</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">שם הלקוח</label>
              <Input {...register('clientName')} placeholder="הכנס שם לקוח" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">טלפון</label>
              <Input {...register('clientPhone')} placeholder="הכנס מספר טלפון" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* בחירת מוצרים וחברות */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">בחר מוצרים וחברות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {products.map((product) => (
              <div key={product.id} className="space-y-4">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Checkbox
                    checked={selectedProducts[product.id as keyof ProductSelection]}
                    onCheckedChange={(checked) => {
                      setSelectedProducts(prev => ({
                        ...prev,
                        [product.id]: checked === true
                      }));
                      if (!checked) {
                        setSelectedCompanies(prev => ({
                          ...prev,
                          [product.id]: []
                        }));
                      }
                    }}
                  />
                  <div>
                    <h3 className="font-medium">{product.label}</h3>
                    <p className="text-sm text-gray-500">{product.description}</p>
                  </div>
                </div>

                {selectedProducts[product.id as keyof ProductSelection] && (
                  <div className="ml-8">
                    <label className="text-sm font-medium">בחר חברות</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {product.companies.map((company) => (
                        <label key={company} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            checked={selectedCompanies[product.id as keyof CompanySelection].includes(company)}
                            onCheckedChange={(checked) => {
                              setSelectedCompanies(prev => ({
                                ...prev,
                                [product.id]: checked
                                  ? [...prev[product.id as keyof CompanySelection], company]
                                  : prev[product.id as keyof CompanySelection].filter(c => c !== company)
                              }));
                            }}
                          />
                          <span>{company}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* טפסים דינמיים */}
      {selectedProducts.pension && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">פרטי פנסיה</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">שכר חודשי</label>
              <Input {...register('pensionSalary')} type="number" placeholder="הכנס שכר" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">סכום צבירה</label>
              <Input {...register('pensionAccumulation')} type="number" placeholder="הכנס סכום" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">אחוז הפרשה</label>
              <Select onValueChange={(value) => setValue('pensionProvision', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר אחוז הפרשה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18.5">18.5% (6+6.5+6)</SelectItem>
                  <SelectItem value="19.5">19.5% (7+6.5+6)</SelectItem>
                  <SelectItem value="20.5">20.5% (7+7.5+6)</SelectItem>
                  <SelectItem value="20.83">20.83% (6+6.5+8.33)</SelectItem>
                  <SelectItem value="21.83">21.83% (7+6.5+8.33)</SelectItem>
                  <SelectItem value="22.83">22.83% (7+7.5+8.33)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedProducts.insurance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">פרטי ביטוח</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">סוג ביטוח</label>
              <Select onValueChange={(value) => setValue('insuranceType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג ביטוח" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk">ריסק</SelectItem>
                  <SelectItem value="mortgage_risk">ריסק למשכנתא</SelectItem>
                  <SelectItem value="health">בריאות</SelectItem>
                  <SelectItem value="critical_illness">מחלות קשות</SelectItem>
                  <SelectItem value="service_letter">כתבי שירות</SelectItem>
                  <SelectItem value="disability">אובדן כושר עבודה</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">פרמיה חודשית</label>
              <Input {...register('insurancePremium')} type="number" placeholder="הכנס סכום" />
            </div>
          </CardContent>
        </Card>
      )}

      {selectedProducts.investment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">פרטי גמל והשתלמות</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">סכום הניוד</label>
              <Input {...register('investmentAmount')} type="number" placeholder="הכנס סכום" />
            </div>
          </CardContent>
        </Card>
      )}

      {selectedProducts.policy && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">פרטי פוליסת חיסכון</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">סכום הפקדה</label>
              <Input {...register('policyAmount')} type="number" placeholder="הכנס סכום" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">קופת הפקדה (בשנים)</label>
              <Input {...register('policyPeriod')} type="number" placeholder="הכנס תקופה" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* טבלת תוצאות */}
      <ResultsTable
        data={journeys}
        columns={[
          { key: 'journey_date', label: 'תאריך' },
          { key: 'client_name', label: 'שם הלקוח' },
          { key: 'selected_products', label: 'מוצרים שנבחרו', format: (value: string[]) => value.join(', ') },
          { key: 'commissions.pension', label: 'עמלות פנסיה', format: (value: number) => value ? `₪${value.toLocaleString()}` : '-' },
          { key: 'commissions.insurance', label: 'עמלות ביטוח', format: (value: number) => value ? `₪${value.toLocaleString()}` : '-' },
          { key: 'commissions.investment', label: 'עמלות השקעות', format: (value: number) => value ? `₪${value.toLocaleString()}` : '-' },
          { key: 'commissions.policy', label: 'עמלות פוליסה', format: (value: number) => value ? `₪${value.toLocaleString()}` : '-' },
          { key: 'total_commission', label: 'סה"כ עמלות', format: (value: number) => `₪${value.toLocaleString()}` }
        ]}
        onDownload={handleDownload}
        onShare={handleShare}
        onClear={() => setJourneys([])}
      />

      {Object.entries(selectedProducts).some(([_, value]) => value) && (
        <div className="flex gap-4">
          <Button 
            type="submit" 
            className="flex-1 h-12 text-lg bg-blue-600 hover:bg-blue-700"
          >
            חשב עמלות
          </Button>
          <Button 
            type="button"
            variant="outline"
            className="flex-1 h-12 text-lg"
            onClick={() => {
              const lastJourney = journeys[journeys.length - 1];
              if (lastJourney) {
                generateReport(lastJourney);
              } else {
                toast.error('אין נתונים ליצירת דוח');
              }
            }}
          >
            צור דוח מסכם
          </Button>
        </div>
      )}
    </form>
  );
};

export default CustomerJourney; 