import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResultsTable from './ResultsTable';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import html2pdf from 'html2pdf.js';
import { utils as XLSXUtils, write as XLSXWrite } from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  User, 
  Building2, 
  Calculator, 
  PlusCircle, 
  MinusCircle,
  FileText,
  Download,
  Share2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

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

  // פונקציה לחישוב עמלות פנסיה
  const calculatePensionCommissions = async (data: any, company: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      // ערכי ברירת מחדל לפי חברה
      const defaultRates: { [key: string]: { scopeRate: number; accumulationRate: number } } = {
        'כלל': { scopeRate: 0.09, accumulationRate: 3000 },
        'הראל': { scopeRate: 0.06, accumulationRate: 0 },
        'מגדל': { scopeRate: 0.07, accumulationRate: 2500 },
        'הפניקס': { scopeRate: 0.06, accumulationRate: 0 },
        'מנורה': { scopeRate: 0.03, accumulationRate: 2500 },
        'מור': { scopeRate: 0.06, accumulationRate: 1760 }
      };

      // נסה לקבל הסכם מותאם אישית
      try {
        const { data: agreementData, error } = await supabase
          .from('agent_agreements')
          .select('agreement_details')
          .eq('user_id', user.id)
          .eq('company', encodeURIComponent(company))
          .eq('product_type', 'pension')
          .maybeSingle(); // במקום single()

        if (!error && agreementData?.agreement_details?.pension) {
          const rates = agreementData.agreement_details.pension;
          const salary = Number(data.pensionSalary);
          const accumulation = Number(data.pensionAccumulation);
          const provision = Number(data.pensionProvision) / 100;

          const scopeCommission = salary * 12 * rates.scopeRate * provision;
          const accumulationCommission = (accumulation / 1000000) * rates.accumulationRate;
          const totalCommission = scopeCommission + accumulationCommission;

          return {
            scopeCommission,
            accumulationCommission,
            totalCommission
          };
        }
      } catch (error) {
        console.error('Error fetching custom agreement:', error);
      }

      // אם אין הסכם מותאם אישית, השתמש בערכי ברירת מחדל
      const rates = defaultRates[company];
      const salary = Number(data.pensionSalary);
      const accumulation = Number(data.pensionAccumulation);
      const provision = Number(data.pensionProvision) / 100;

      const scopeCommission = salary * 12 * rates.scopeRate * provision;
      const accumulationCommission = (accumulation / 1000000) * rates.accumulationRate;
      const totalCommission = scopeCommission + accumulationCommission;

      return {
        scopeCommission,
        accumulationCommission,
        totalCommission
      };

    } catch (error) {
      console.error('Error calculating pension commissions:', error);
      throw error;
    }
  };

  // פונקציה לחישוב עמלות ביטוח
  const calculateInsuranceCommissions = async (data: any, company: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      const { data: agreementData, error } = await supabase
        .from('agent_agreements')
        .select('agreement_details')
        .eq('user_id', user.id)
        .eq('company', company)
        .eq('product_type', 'insurance')
        .single();

      if (error) {
        console.error('Error fetching agreement:', error);
        // ערכי ברירת מחדל אם אין הסכם
        return {
          oneTimeCommission: Number(data.insurancePremium) * 12 * 0.65,
          monthlyCommission: Number(data.insurancePremium) * 0.2,
          totalCommission: (Number(data.insurancePremium) * 12 * 0.65) + (Number(data.insurancePremium) * 0.2 * 12)
        };
      }

      const agreement = agreementData?.agreement_details?.insurance || {
        oneTimeRate: 65,
        monthlyRate: {
          risk: 20,
          mortgage_risk: 17,
          health: 20,
          critical_illness: 20,
          service_letter: 20,
          disability: 12
        }
      };

      const monthlyPremium = Number(data.insurancePremium) || 0;
      const insuranceType = data.insuranceType || 'risk';

      const oneTimeCommission = monthlyPremium * 12 * (agreement.oneTimeRate / 100);
      const monthlyCommission = monthlyPremium * (agreement.monthlyRate[insuranceType] / 100);
      const totalCommission = oneTimeCommission + (monthlyCommission * 12);

      return {
        oneTimeCommission,
        monthlyCommission,
        totalCommission
      };
    } catch (error) {
      console.error('Error calculating insurance commissions:', error);
      return {
        oneTimeCommission: 0,
        monthlyCommission: 0,
        totalCommission: 0
      };
    }
  };

  // פונקציה לחישוב עמלות השקעות
  const calculateInvestmentCommissions = async (data: any, company: string) => {
    try {
      const { data: agreementData, error } = await supabase
        .from('agent_agreements')
        .select('agreement_details')
        .eq('company', company)
        .eq('product_type', 'investment')
        .single();

      if (error) throw error;

      const agreement = agreementData?.agreement_details?.investment || {
        scopeRate: 0.006 // ברירת מחדל - 0.6%
      };

      const amount = Number(data.investmentAmount);
      const scopeCommission = amount * agreement.scopeRate;

      return {
        scopeCommission,
        totalCommission: scopeCommission
      };
    } catch (error) {
      console.error('Error calculating investment commissions:', error);
      return {
        scopeCommission: 0,
        totalCommission: 0
      };
    }
  };

  // פונקציה לחישוב עמלות פוליסות חיסכון
  const calculatePolicyCommissions = async (data: any, company: string) => {
    try {
      const { data: agreementData, error } = await supabase
        .from('agent_agreements')
        .select('agreement_details')
        .eq('company', company)
        .eq('product_type', 'policy')
        .single();

      if (error) throw error;

      const agreement = agreementData?.agreement_details?.policy || {
        shortTermRate: 0.006,
        longTermRate: 0.007
      };

      const amount = Number(data.policyAmount);
      const period = Number(data.policyPeriod);
      
      const scopeCommission = amount * (period >= 15 ? agreement.longTermRate : agreement.shortTermRate);

      return {
        scopeCommission,
        totalCommission: scopeCommission
      };
    } catch (error) {
      console.error('Error calculating policy commissions:', error);
      return {
        scopeCommission: 0,
        totalCommission: 0
      };
    }
  };

  const generatePDF = (data: {
    date: string;
    clientName: string;
    pensionDetails: Array<{
      company: string;
      scopeCommission: number;
      accumulationCommission: number;
      totalCommission: number;
    }>;
    insuranceDetails: Array<{
      company: string;
      oneTimeCommission: number;
      monthlyCommission: number;
      totalCommission: number;
    }>;
    investmentDetails: Array<{
      company: string;
      amount: number;
      commission: number;
    }>;
    policyDetails: Array<{
      company: string;
      amount: number;
      commission: number;
    }>;
  }) => {
    try {
      const element = document.createElement('div');
      element.innerHTML = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="text-align: center; margin: 0; font-size: 28px;">דוח מסע לקוח</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e3a8a; margin-bottom: 15px;">פרטי לקוח</h2>
            <p>תאריך: ${data.date}</p>
            <p>שם לקוח: ${data.clientName}</p>
          </div>

          ${data.pensionDetails.length > 0 ? `
            <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #bae6fd;">
              <h2 style="color: #0369a1; margin-bottom: 15px;">פנסיה</h2>
              ${data.pensionDetails.map(detail => `
                <div style="margin-bottom: 15px; padding-right: 20px;">
                  <h3 style="color: #0284c7;">${detail.company}</h3>
                  <p>עמלת היקף: ${detail.scopeCommission.toLocaleString()} ₪</p>
                  <p>עמלת צבירה: ${detail.accumulationCommission.toLocaleString()} ₪</p>
                  <p>סה"כ: ${detail.totalCommission.toLocaleString()} ₪</p>
                </div>
              `).join('')}
              <p style="font-weight: bold; margin-top: 15px;">סה"כ עמלות פנסיה: ${
                data.pensionDetails.reduce((sum, detail) => sum + detail.totalCommission, 0).toLocaleString()
              } ₪</p>
            </div>
          ` : ''}

          ${data.insuranceDetails.length > 0 ? `
            <div style="background: #fdf2f8; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #fbcfe8;">
              <h2 style="color: #9d174d; margin-bottom: 15px;">ביטוח</h2>
              ${data.insuranceDetails.map(detail => `
                <div style="margin-bottom: 15px; padding-right: 20px;">
                  <h3 style="color: #be185d;">${detail.company}</h3>
                  <p>עמלה חד פעמית: ${detail.oneTimeCommission.toLocaleString()} ₪</p>
                  <p>עמלה חודשית: ${detail.monthlyCommission.toLocaleString()} ₪</p>
                  <p>סה"כ: ${detail.totalCommission.toLocaleString()} ₪</p>
                </div>
              `).join('')}
              <p style="font-weight: bold; margin-top: 15px;">סה"כ עמלות ביטוח: ${
                data.insuranceDetails.reduce((sum, detail) => sum + detail.totalCommission, 0).toLocaleString()
              } ₪</p>
            </div>
          ` : ''}

          ${data.investmentDetails.length > 0 ? `
            <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #bbf7d0;">
              <h2 style="color: #166534; margin-bottom: 15px;">השקעות</h2>
              ${data.investmentDetails.map(detail => `
                <div style="margin-bottom: 15px; padding-right: 20px;">
                  <h3 style="color: #15803d;">${detail.company}</h3>
                  <p>סכום: ${detail.amount.toLocaleString()} ₪</p>
                  <p>עמלה: ${detail.commission.toLocaleString()} ₪</p>
                </div>
              `).join('')}
              <p style="font-weight: bold; margin-top: 15px;">סה"כ עמלות השקעות: ${
                data.investmentDetails.reduce((sum, detail) => sum + detail.commission, 0).toLocaleString()
              } ₪</p>
            </div>
          ` : ''}

          ${data.policyDetails.length > 0 ? `
            <div style="background: #eff6ff; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #bfdbfe;">
              <h2 style="color: #1e40af; margin-bottom: 15px;">פוליסות חיסכון</h2>
              ${data.policyDetails.map(detail => `
                <div style="margin-bottom: 15px; padding-right: 20px;">
                  <h3 style="color: #1e3a8a;">${detail.company}</h3>
                  <p>סכום: ${detail.amount.toLocaleString()} ₪</p>
                  <p>עמלה: ${detail.commission.toLocaleString()} ₪</p>
                </div>
              `).join('')}
              <p style="font-weight: bold; margin-top: 15px;">סה"כ עמלות פוליסות: ${
                data.policyDetails.reduce((sum, detail) => sum + detail.commission, 0).toLocaleString()
              } ₪</p>
            </div>
          ` : ''}

          <div style="background: #047857; color: white; padding: 20px; border-radius: 10px; margin-top: 30px;">
            <h2 style="margin: 0 0 15px 0;">סיכום עמלות</h2>
            <p style="font-size: 1.2em; font-weight: bold;">סה"כ עמלות: ${(
              data.pensionDetails.reduce((sum, detail) => sum + detail.totalCommission, 0) +
              data.insuranceDetails.reduce((sum, detail) => sum + detail.totalCommission, 0) +
              data.investmentDetails.reduce((sum, detail) => sum + detail.commission, 0) +
              data.policyDetails.reduce((sum, detail) => sum + detail.commission, 0)
            ).toLocaleString()} ₪</p>
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `דוח_מסע_לקוח_${data.clientName}_${data.date}.pdf`,
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

  const [pensionSales, setPensionSales] = React.useState<Array<{
    date: string;
    clientName: string;
    company: string;
    salary: number;
    accumulation: number;
    provision: number;
    scopeCommission: number;
    accumulationCommission: number;
    totalCommission: number;
  }>>([]);

  const [insuranceSales, setInsuranceSales] = React.useState<Array<{
    date: string;
    clientName: string;
    company: string;
    insuranceType: string;
    monthlyPremium: number;
    oneTimeCommission: number;
    monthlyCommission: number;
    totalCommission: number;
  }>>([]);

  const [investmentSales, setInvestmentSales] = React.useState<Array<{
    date: string;
    clientName: string;
    company: string;
    amount: number;
    scopeCommission: number;
    totalCommission: number;
  }>>([]);

  const [policySales, setPolicySales] = React.useState<Array<{
    date: string;
    clientName: string;
    company: string;
    amount: number;
    scopeCommission: number;
    totalCommission: number;
  }>>([]);

  // הגדרת פונקציית loadSalesData
  const loadSalesData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return;

      // טעינת נתוני פנסיה
      const { data: pensionData } = await supabase
        .from('pension_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (pensionData) setPensionSales(pensionData);

      // טעינת נתוני ביטוח
      const { data: insuranceData } = await supabase
        .from('insurance_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (insuranceData) setInsuranceSales(insuranceData);

      // טעינת נתוני השקעות
      const { data: investmentData } = await supabase
        .from('investment_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (investmentData) setInvestmentSales(investmentData);

      // טעינת נתוני פוליסות
      const { data: policyData } = await supabase
        .from('policy_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (policyData) setPolicySales(policyData);

    } catch (error: any) {
      console.error('Error loading sales data:', error);
      toast.error('אירעה שגיאה בטעינת הנתונים');
    }
  };

  // שימוש בפונקציה ב-useEffect
  React.useEffect(() => {
    loadSalesData();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('משתמש לא מחובר');

      let totalCommissions = 0;

      // חישוב עמלות פנסיה
      if (selectedProducts.pension && selectedCompanies.pension.length > 0) {
        for (const company of selectedCompanies.pension) {
          const result = await calculatePensionCommissions(data, company);
          
          const pensionData = {
            date: new Date().toLocaleDateString('he-IL'),
            client_name: data.clientName,
            company,
            salary: Number(data.pensionSalary),
            accumulation: Number(data.pensionAccumulation),
            provision: Number(data.pensionProvision),
            scope_commission: result.scopeCommission,
            accumulation_commission: result.accumulationCommission,
            total_commission: result.totalCommission,
            user_id: user.id
          };

          try {
            const { error: insertError } = await supabase
              .from('pension_sales')
              .insert([pensionData]);

            if (insertError) throw insertError;
            totalCommissions += result.totalCommission;
          } catch (error) {
            console.error('Error saving pension sale:', error);
            throw error;
          }
        }
      }

      // שמירת נתוני ביטוח
      if (selectedProducts.insurance && selectedCompanies.insurance.length > 0) {
        for (const company of selectedCompanies.insurance) {
          const result = calculateInsuranceCommissions(data, company);
          const insuranceData = {
            date: new Date().toLocaleDateString('he-IL'),
            client_name: data.clientName,
            company,
            insurance_type: data.insuranceType,
            monthly_premium: Number(data.insurancePremium),
            one_time_commission: result.oneTimeCommission,
            monthly_commission: result.monthlyCommission,
            total_commission: result.totalCommission,
            user_id: user.id
          };

          const { error: insertError } = await supabase
            .from('insurance_sales')
            .insert([insuranceData]);

          if (insertError) throw insertError;
          totalCommissions += result.totalCommission;
        }
      }

      // שמירת נתוני השקעות
      if (selectedProducts.investment && selectedCompanies.investment.length > 0) {
        for (const company of selectedCompanies.investment) {
          const amount = Number(data.investmentAmount);
          const scopeCommission = (amount / 1000000) * 6000;
          const investmentData = {
            date: new Date().toLocaleDateString('he-IL'),
            client_name: data.clientName,
            company,
            amount,
            scope_commission: scopeCommission,
            total_commission: scopeCommission,
            user_id: user.id
          };

          const { error: insertError } = await supabase
            .from('investment_sales')
            .insert([investmentData]);

          if (insertError) throw insertError;
          totalCommissions += scopeCommission;
        }
      }

      // שמירת נתוני פוליסות חיסכון
      if (selectedProducts.policy && selectedCompanies.policy.length > 0) {
        for (const company of selectedCompanies.policy) {
          const amount = Number(data.policyAmount) || 0;
          const period = Number(data.policyPeriod) || 0;
          
          // חישוב עמלת היקף לפי חבר
          let scopeCommissionRate = 0;
          switch (company) {
            case 'כלל':
              scopeCommissionRate = period >= 15 ? 0.007 : 0.006;
              break;
            case 'מגדל':
              scopeCommissionRate = period >= 15 ? 0.0075 : 0.0065;
              break;
            case 'הראל':
              scopeCommissionRate = period >= 15 ? 0.007 : 0.006;
              break;
            case 'הפניקס':
              scopeCommissionRate = period >= 15 ? 0.0072 : 0.0062;
              break;
            case 'מנורה':
              scopeCommissionRate = period >= 15 ? 0.007 : 0.006;
              break;
            default:
              scopeCommissionRate = 0.006;
          }

          const scopeCommission = amount * scopeCommissionRate;
          const totalCommission = scopeCommission;

          const policyData = {
            date: new Date().toLocaleDateString('he-IL'),
            client_name: data.clientName,
            company,
            amount,
            period,
            scope_commission: scopeCommission,
            total_commission: totalCommission,
            user_id: user.id
          };

          const { error: insertError } = await supabase
            .from('policy_sales')
            .insert([policyData]);

          if (insertError) throw insertError;
          totalCommissions += totalCommission;
        }
      }

      // רענון הנתונים בטבלאות
      await loadSalesData();

      toast.success(`העמלות חושבו ונשמרו בהצלחה! סה"כ: ₪${totalCommissions.toLocaleString()}`);

      // הכנת נתונים ל-PDF
      const reportData = {
        date: new Date().toLocaleDateString('he-IL'),
        clientName: data.clientName,
        pensionDetails: selectedProducts.pension ? selectedCompanies.pension.map(company => ({
          company,
          ...calculatePensionCommissions(data, company)
        })) : [],
        insuranceDetails: selectedProducts.insurance ? selectedCompanies.insurance.map(company => ({
          company,
          ...calculateInsuranceCommissions(data, company)
        })) : [],
        investmentDetails: selectedProducts.investment ? selectedCompanies.investment.map(company => ({
          company,
          amount: Number(data.investmentAmount),
          commission: (Number(data.investmentAmount) / 1000000) * 6000
        })) : [],
        policyDetails: selectedProducts.policy ? selectedCompanies.policy.map(company => ({
          company,
          amount: Number(data.policyAmount),
          commission: (Number(data.policyAmount) / 1000000) * 7000
        })) : []
      };

      // הצגת כפתור להורדת PDF
      toast((t) => (
        <div>
          <div>העמלות חושבו ונשמרו בהצלחה!</div>
          <div>סה"כ: ₪{totalCommissions.toLocaleString()}</div>
          <Button
            className="mt-2"
            onClick={() => {
              generatePDF(reportData);
              toast.dismiss(t.id);
            }}
          >
            הורד PDF
          </Button>
        </div>
      ), { duration: 5000 });

    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'אירעה שגיאה בחישוב העמלות');
    }
  };

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
    if (!currentJourney) {
      toast.error('אין נתונים להורדה');
      return;
    }

    try {
      const worksheet = XLSXUtils.json_to_sheet([{
        תאריך: currentJourney.journey_date,
        'שם לקוח': currentJourney.clientName,
        טלפון: currentJourney.clientPhone || '',
        'מוצרים שנבחרו': currentJourney.selectedProducts.join(', '),
        'עמלות פנסיה': currentJourney.commission_details.pension.total,
        'עמלות ביטוח': currentJourney.commission_details.insurance.total,
        'עמלות השקעות': currentJourney.commission_details.investment.total,
        'עמלות פוליסה': currentJourney.commission_details.policy.total,
        'סה"כ עמלות': currentJourney.total_commission
      }]);

      const workbook = XLSXUtils.book_new();
      XLSXUtils.book_append_sheet(workbook, worksheet, "מסע לקוח");
      
      // הגדרת כיוון RTL
      worksheet['!dir'] = 'rtl';

      const excelBuffer = XLSXWrite(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(data, `דוח_מסע_לקוח_${currentJourney.clientName}_${currentJourney.journey_date}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('אירעה שגיאה ביצירת הקובץ');
    }
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
    <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* כותרת ראשית */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">מסע לקוח</h1>
        <p className="text-gray-600">ניהול פגישת לקוח וחישוב עמלות</p>
      </div>

      {/* פרטי לקוח */}
      <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-l from-blue-50 to-blue-100 border-b border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-blue-900">פרטי לקוח</CardTitle>
              <CardDescription className="text-blue-600">הזן את פרטי הלקוח</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group relative bg-white p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 transition-all duration-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם הלקוח
                <span className="text-red-500 mr-1">*</span>
              </label>
              <div className="relative">
                <Input 
                  {...register('clientName')} 
                  placeholder="הכנס שם לקוח"
                  className="pr-10 border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
                <User className="h-5 w-5 text-gray-400 absolute top-2.5 right-3 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
            <div className="group relative bg-white p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 transition-all duration-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                טלפון
              </label>
              <div className="relative">
                <Input 
                  {...register('clientPhone')} 
                  placeholder="הכנס מספר טלפון"
                  className="pr-10 border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
                <Building2 className="h-5 w-5 text-gray-400 absolute top-2.5 right-3 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* בחירת מוצרים */}
      <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-l from-blue-50 to-blue-100 border-b border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-blue-900">בחירת מוצרים</CardTitle>
              <CardDescription className="text-blue-600">בחר את המוצרים הרלוונטיים</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`
                  relative overflow-hidden rounded-xl border-2 transition-all duration-300
                  ${selectedProducts[product.id as keyof ProductSelection]
                    ? 'border-blue-400 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-200 hover:shadow-md'
                  }
                `}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3">
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
                      className="h-5 w-5 border-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.label}</h3>
                      <p className="text-sm text-gray-500">{product.description}</p>
                    </div>
                    {selectedProducts[product.id as keyof ProductSelection] ? (
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    ) : (
                      <PlusCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  {selectedProducts[product.id as keyof ProductSelection] && (
                    <div className="mt-4 pl-8">
                      <p className="text-sm font-medium text-gray-700 mb-2">בחר חברות:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {product.companies.map((company) => (
                          <label
                            key={company}
                            className={`
                              flex items-center gap-2 p-2 rounded-lg border transition-all duration-200
                              ${selectedCompanies[product.id as keyof CompanySelection].includes(company)
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-200'
                              }
                            `}
                          >
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
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{company}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* טפסי המוצרים */}
      {Object.entries(selectedProducts).some(([_, value]) => value) && (
        <div className="space-y-6">
          {selectedProducts.pension && (
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader className="bg-gradient-to-l from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle>פרטי פנסיה</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">שכר חודשי</label>
                    <Input {...register('pensionSalary')} type="number" placeholder="הכנס שכר חודשי" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">סכום צבירה</label>
                    <Input {...register('pensionAccumulation')} type="number" placeholder="הכנס סכום צבירה" />
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
                </div>
              </CardContent>
            </Card>
          )}

          {selectedProducts.insurance && (
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader className="bg-gradient-to-l from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle>פרטי ביטוח</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Input {...register('insurancePremium')} type="number" placeholder="הכנס פרמיה חודשית" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedProducts.investment && (
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader className="bg-gradient-to-l from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle>פרטי השקעות</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">סכום השקעה</label>
                  <Input {...register('investmentAmount')} type="number" placeholder="הכנס סכום השקעה" />
                </div>
              </CardContent>
            </Card>
          )}

          {selectedProducts.policy && (
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader className="bg-gradient-to-l from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle>פרטי פוליסת חיסכון</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">סכום הפקדה</label>
                    <Input {...register('policyAmount')} type="number" placeholder="הכנס סכום הפקדה" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">תקופת חיסכון (בשנים)</label>
                    <Input {...register('policyPeriod')} type="number" placeholder="הכנס תקופת חיסכון" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* כפתורי פעולה */}
      {Object.entries(selectedProducts).some(([_, value]) => value) && (
        <div className="flex gap-4">
          <Button 
            onClick={handleFormSubmit(onSubmit)}
            className="flex-1 h-12 text-lg bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Calculator className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform" />
            חשב עמלות
          </Button>
          <Button 
            variant="outline"
            className="flex-1 h-12 text-lg border-2 hover:bg-blue-50 transition-all duration-300"
            onClick={() => {
              // יצירת אובייקט הנתונים לדוח
              const reportData = {
                date: new Date().toLocaleDateString('he-IL'),
                clientName: watch('clientName'),
                // ... rest of the report data ...
              };
              generatePDF(reportData);
            }}
          >
            <FileText className="h-5 w-5 ml-2" />
            צור דוח מסכם
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomerJourney; 