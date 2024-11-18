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
import html2pdf from 'html2pdf.js';
import { utils as XLSXUtils, write as XLSXWrite } from 'xlsx';

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

interface CommissionDetails {
  pension: {
    companies: {
      [company: string]: {
        scopeCommission: number;
        accumulationCommission: number;
        totalCommission: number;
      }
    };
    total: number;
  };
  insurance: {
    companies: {
      [company: string]: {
        oneTimeCommission: number;
        monthlyCommission: number;
        totalCommission: number;
      }
    };
    total: number;
  };
  investment: {
    companies: {
      [company: string]: {
        scopeCommission: number;
        totalCommission: number;
      }
    };
    total: number;
  };
  policy: {
    companies: {
      [company: string]: {
        scopeCommission: number;
        totalCommission: number;
      }
    };
    total: number;
  };
}

interface Journey {
  id?: string;
  date: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  selectedProducts: string[];
  selectedCompanies: CompanySelection;
  commissionDetails: CommissionDetails;
  totalCommission: number;
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

  // פונקציות חישוב מכל המחבונים
  const calculatePensionCommissions = (data: any, company: string) => {
    const salary = Number(data.pensionSalary);
    const accumulation = Number(data.pensionAccumulation);
    const provision = Number(data.pensionProvision) / 100;

    const rates = {
      'כלל': { scope: 0.09, accumulation: 3000 },
      'הראל': { scope: 0.06, accumulation: 0 },
      'מגדל': { scope: 0.07, accumulation: 2500 },
      'הפניק': { scope: 0.06, accumulation: 0 },
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

  const generatePDF = (journey: any) => {
    try {
      const element = document.createElement('div');
      element.innerHTML = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #1a365d; text-align: center; margin-bottom: 30px;">דוח מסע לקוח</h1>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #2c5282;">פרטי לקוח</h2>
            <p>תאריך: ${journey.journey_date}</p>
            <p>שם לקוח: ${journey.client_name}</p>
            <p>טלפון: ${journey.client_phone || ''}</p>
          </div>

          ${journey.commission_details?.pension?.total > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: #2c5282;">פנסיה</h2>
              ${Object.entries(journey.commission_details.pension.companies)
                .map(([company, details]: [string, any]) => `
                  <div style="margin-left: 20px;">
                    <h3>${company}</h3>
                    <p>עמלת היקף: ${details.scopeCommission.toLocaleString()} ₪</p>
                    <p>עמלת צבירה: ${details.accumulationCommission.toLocaleString()} ₪</p>
                    <p>סה"כ לחברה: ${details.totalCommission.toLocaleString()} ₪</p>
                  </div>
                `).join('')}
              <p><strong>סה"כ עמלות פנסיה: ${journey.commission_details.pension.total.toLocaleString()} ₪</strong></p>
            </div>
          ` : ''}

          ${journey.commission_details?.insurance?.total > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: #2c5282;">ביטוח</h2>
              ${Object.entries(journey.commission_details.insurance.companies)
                .map(([company, details]: [string, any]) => `
                  <div style="margin-left: 20px;">
                    <h3>${company}</h3>
                    <p>עמלה חד פעמית: ${details.oneTimeCommission.toLocaleString()} ₪</p>
                    <p>עמלה חודשית: ${details.monthlyCommission.toLocaleString()} ₪</p>
                    <p>סה"כ לחברה: ${details.totalCommission.toLocaleString()} ₪</p>
                  </div>
                `).join('')}
              <p><strong>סה"כ עמלות ביטוח: ${journey.commission_details.insurance.total.toLocaleString()} ₪</strong></p>
            </div>
          ` : ''}

          ${journey.commission_details?.investment?.total > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: #2c5282;">השקעות</h2>
              ${Object.entries(journey.commission_details.investment.companies)
                .map(([company, details]: [string, any]) => `
                  <div style="margin-left: 20px;">
                    <h3>${company}</h3>
                    <p>עמלת היקף: ${details.scopeCommission.toLocaleString()} ₪</p>
                    <p>סה"כ לחברה: ${details.totalCommission.toLocaleString()} ₪</p>
                  </div>
                `).join('')}
              <p><strong>סה"כ עמלות השקעות: ${journey.commission_details.investment.total.toLocaleString()} ₪</strong></p>
            </div>
          ` : ''}

          ${journey.commission_details?.policy?.total > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: #2c5282;">פוליסת חיסכון</h2>
              ${Object.entries(journey.commission_details.policy.companies)
                .map(([company, details]: [string, any]) => `
                  <div style="margin-left: 20px;">
                    <h3>${company}</h3>
                    <p>עמלת היקף: ${details.scopeCommission.toLocaleString()} ₪</p>
                    <p>סה"כ לחברה: ${details.totalCommission.toLocaleString()} ₪</p>
                  </div>
                `).join('')}
              <p><strong>סה"כ עמלות פוליסת חיסכון: ${journey.commission_details.policy.total.toLocaleString()} ₪</strong></p>
            </div>
          ` : ''}

          <div style="margin-top: 30px; border-top: 2px solid #2c5282; padding-top: 20px;">
            <h2 style="color: #2c5282;">סיכום עמלות</h2>
            <p style="font-size: 1.2em;"><strong>סה"כ עמלות: ${journey.total_commission.toLocaleString()} ₪</strong></p>
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `דוח_מסע_לקוח_${journey.client_name}_${journey.journey_date}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(element).set(opt).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('אירעה שגיאה ביצירת הדוח');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('משתמש לא מחובר');

      const commission_details = {
        pension: {
          companies: {} as Record<string, {
            scopeCommission: number;
            accumulationCommission: number;
            totalCommission: number;
          }>,
          total: 0
        },
        insurance: {
          companies: {} as Record<string, {
            oneTimeCommission: number;
            monthlyCommission: number;
            totalCommission: number;
          }>,
          total: 0
        },
        investment: {
          companies: {} as Record<string, {
            scopeCommission: number;
            totalCommission: number;
          }>,
          total: 0
        },
        policy: {
          companies: {} as Record<string, {
            scopeCommission: number;
            totalCommission: number;
          }>,
          total: 0
        }
      };

      // חישוב עמלות פנסיה לכל חברה
      if (selectedProducts.pension) {
        selectedCompanies.pension.forEach(company => {
          const result = calculatePensionCommissions(data, company);
          commission_details.pension.companies[company] = {
            scopeCommission: result.scopeCommission,
            accumulationCommission: result.accumulationCommission,
            totalCommission: result.totalCommission
          };
          commission_details.pension.total += result.totalCommission;
        });
      }

      // חישוב עמלות ביטוח לכל חברה
      if (selectedProducts.insurance) {
        selectedCompanies.insurance.forEach(company => {
          const result = calculateInsuranceCommissions(data, company);
          commission_details.insurance.companies[company] = {
            oneTimeCommission: result.oneTimeCommission,
            monthlyCommission: result.monthlyCommission,
            totalCommission: result.totalCommission
          };
          commission_details.insurance.total += result.totalCommission;
        });
      }

      // חישוב עמלות השקעות לכל חברה
      if (selectedProducts.investment) {
        selectedCompanies.investment.forEach(company => {
          const amount = Number(data.investmentAmount);
          const scopeCommission = (amount / 1000000) * 6000;
          commission_details.investment.companies[company] = {
            scopeCommission,
            totalCommission: scopeCommission
          };
          commission_details.investment.total += scopeCommission;
        });
      }

      // חישוב עמלות פוליסת חיסכון לכל חברה
      if (selectedProducts.policy) {
        selectedCompanies.policy.forEach(company => {
          const amount = Number(data.policyAmount);
          const scopeCommission = (amount / 1000000) * 7000;
          commission_details.policy.companies[company] = {
            scopeCommission,
            totalCommission: scopeCommission
          };
          commission_details.policy.total += scopeCommission;
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
        commission_details,
        total_commission: Object.values(commission_details).reduce((sum, product) => sum + product.total, 0),
        user_id: user.id
      };

      const { data: savedJourney, error } = await supabase
        .from('customer_journeys')
        .insert([journey])
        .select()
        .single();

      if (error) throw error;

      setJourneys([...journeys, savedJourney]);
      toast.success('מסע הלקוח נשמר בהצלחה!');
      generatePDF(savedJourney);

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

  const handleDownloadPDF = (journey: any) => {
    try {
      const element = document.createElement('div');
      element.innerHTML = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #1a365d; text-align: center; margin-bottom: 30px;">דוח מסע לקוח</h1>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #2c5282;">פרטי לקוח</h2>
            <p>תאריך: ${journey.journey_date}</p>
            <p>שם לקוח: ${journey.client_name}</p>
            <p>טלפון: ${journey.client_phone || ''}</p>
          </div>

          ${journey.commission_details?.pension?.total > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: #2c5282;">פנסיה</h2>
              ${Object.entries(journey.commission_details.pension.companies)
                .map(([company, details]: [string, any]) => `
                  <div style="margin-left: 20px;">
                    <h3>${company}</h3>
                    <p>עמלת היקף: ${details.scopeCommission.toLocaleString()} ₪</p>
                    <p>עמלת צבירה: ${details.accumulationCommission.toLocaleString()} ₪</p>
                    <p>סה"כ לחברה: ${details.totalCommission.toLocaleString()} ₪</p>
                  </div>
                `).join('')}
              <p><strong>סה"כ עמלות פנסיה: ${journey.commission_details.pension.total.toLocaleString()} ₪</strong></p>
            </div>
          ` : ''}

          ${journey.commission_details?.insurance?.total > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: #2c5282;">ביטוח</h2>
              ${Object.entries(journey.commission_details.insurance.companies)
                .map(([company, details]: [string, any]) => `
                  <div style="margin-left: 20px;">
                    <h3>${company}</h3>
                    <p>עמלה חד פעמית: ${details.oneTimeCommission.toLocaleString()} ₪</p>
                    <p>עמלה חודשית: ${details.monthlyCommission.toLocaleString()} ₪</p>
                    <p>סה"כ לחברה: ${details.totalCommission.toLocaleString()} ₪</p>
                  </div>
                `).join('')}
              <p><strong>סה"כ עמלות ביטוח: ${journey.commission_details.insurance.total.toLocaleString()} ₪</strong></p>
            </div>
          ` : ''}

          ${journey.commission_details?.investment?.total > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: #2c5282;">השקעות</h2>
              ${Object.entries(journey.commission_details.investment.companies)
                .map(([company, details]: [string, any]) => `
                  <div style="margin-left: 20px;">
                    <h3>${company}</h3>
                    <p>עמלת היקף: ${details.scopeCommission.toLocaleString()} ₪</p>
                    <p>סה"כ לחברה: ${details.totalCommission.toLocaleString()} ₪</p>
                  </div>
                `).join('')}
              <p><strong>סה"כ עמלות השקעות: ${journey.commission_details.investment.total.toLocaleString()} ₪</strong></p>
            </div>
          ` : ''}

          ${journey.commission_details?.policy?.total > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: #2c5282;">פוליסת חיסכון</h2>
              ${Object.entries(journey.commission_details.policy.companies)
                .map(([company, details]: [string, any]) => `
                  <div style="margin-left: 20px;">
                    <h3>${company}</h3>
                    <p>עמלת היקף: ${details.scopeCommission.toLocaleString()} ₪</p>
                    <p>סה"כ לחברה: ${details.totalCommission.toLocaleString()} ₪</p>
                  </div>
                `).join('')}
              <p><strong>סה"כ עמלות פוליסת חיסכון: ${journey.commission_details.policy.total.toLocaleString()} ₪</strong></p>
            </div>
          ` : ''}

          <div style="margin-top: 30px; border-top: 2px solid #2c5282; padding-top: 20px;">
            <h2 style="color: #2c5282;">סיכום עמלות</h2>
            <p style="font-size: 1.2em;"><strong>סה"כ עמלות: ${journey.total_commission.toLocaleString()} ₪</strong></p>
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `דוח_מסע_לקוח_${journey.client_name}_${journey.journey_date}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(element).set(opt).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('אירעה שגיאה ביצירת הדוח');
    }
  };

  const handleDownloadExcel = () => {
    if (journeys.length === 0) {
      toast.error('אין נתונים להורדה');
      return;
    }

    const worksheet = XLSXUtils.json_to_sheet(
      journeys.map(journey => ({
        תאריך: journey.journey_date,
        'שם לקוח': journey.client_name,
        טלפון: journey.client_phone || '',
        'מוצרים שנבחרו': journey.selected_products.join(', '),
        'עמלות פנסיה': journey.commission_details.pension.total,
        'עמלות ביטוח': journey.commission_details.insurance.total,
        'עמלות השקעות': journey.commission_details.investment.total,
        'עמלות פוליסה': journey.commission_details.policy.total,
        'סה"כ עמלות': journey.total_commission
      }))
    );

    const workbook = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(workbook, worksheet, "מסעות לקוח");
    
    // הגדרת כיוון RTL
    worksheet['!dir'] = 'rtl';

    const excelBuffer = XLSXWrite(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = 'דוח_מסעות_לקוח.xlsx';
    link.click();
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
    
    if (lastJourney.commission_details.pension.total > 0) {
      message += `עמלות פנסיה: ${lastJourney.commission_details.pension.total.toLocaleString()} ₪\n`;
    }
    if (lastJourney.commission_details.insurance.total > 0) {
      message += `עמלות ביטוח: ${lastJourney.commission_details.insurance.total.toLocaleString()} ₪\n`;
    }
    if (lastJourney.commission_details.investment.total > 0) {
      message += `עמלות השקעות: ${lastJourney.commission_details.investment.total.toLocaleString()} ₪\n`;
    }
    if (lastJourney.commission_details.policy.total > 0) {
      message += `עמלות פוליסה: ${lastJourney.commission_details.policy.total.toLocaleString()} ₪\n`;
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
          { key: 'commission_details.pension.total', label: 'עמלות פנסיה', format: (value: number) => value ? `₪${value.toLocaleString()}` : '-' },
          { key: 'commission_details.insurance.total', label: 'עמלות ביטוח', format: (value: number) => value ? `₪${value.toLocaleString()}` : '-' },
          { key: 'commission_details.investment.total', label: 'עמלות השקעות', format: (value: number) => value ? `₪${value.toLocaleString()}` : '-' },
          { key: 'commission_details.policy.total', label: 'עמלות פוליסה', format: (value: number) => value ? `₪${value.toLocaleString()}` : '-' },
          { key: 'total_commission', label: 'סה"כ עמלות', format: (value: number) => `₪${value.toLocaleString()}` }
        ]}
        onDownload={handleDownloadExcel}
        onShare={() => {
          const lastJourney = journeys[journeys.length - 1];
          if (lastJourney) {
            handleDownloadPDF(lastJourney);
          } else {
            toast.error('אין נתונים ליצירת דוח');
          }
        }}
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
                handleDownloadPDF(lastJourney);
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