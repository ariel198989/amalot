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
import { reportService } from '@/services/reportService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

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

interface CustomerJourney {
  id?: string;
  user_id: string;
  client_id?: string;
  journey_date: string;
  date: string;
  client_name: string;
  client_phone?: string;
  selected_products: string[];
  selected_companies: Record<string, string[]>;
  commission_details: CommissionDetails;
  total_commission: number;
  created_at: string;
  updated_at: string;
}

interface FormData {
  clientName: string;
  clientPhone?: string;
  pensionSalary?: number;
  pensionAccumulation?: number;
  pensionProvision?: number;
  insurancePremium?: number;
  insuranceType?: string;
  investmentAmount?: number;
  policyAmount?: number;
  policyPeriod?: number;
}

const formatDate = (date: Date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

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

  const [journeys, setJourneys] = React.useState<CustomerJourney[]>([]);
  const { register, handleSubmit: handleFormSubmit, watch, setValue } = useForm<FormData>();

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

  // פונקציה לקבלת הנוסחאות של הסוכן
  const getAgentRates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('משתמש לא מחובר');

    const { data: rates, error } = await supabase
      .from('agent_commission_rates')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return rates;
  };

  // עדכון פונקציות החישוב
  const calculatePensionCommissions = async (data: any, company: string) => {
    try {
      const rates = await getAgentRates();
      if (!rates) throw new Error('לא נמצאו נתוני עמלות');

      const salary = Number(data.pensionSalary);
      const accumulation = Number(data.pensionAccumulation);
      const provision = Number(data.pensionProvision) / 100;

      // עמלת היקף - אחוז מההפקדה השנתית
      const scopeCommission = salary * 12 * provision * rates.pension_scope_rate;

      // עמלת צבירה - סכום למיליון
      const accumulationCommission = accumulation * (rates.pension_accumulation_rate / 1000000);

      return {
        scopeCommission,
        accumulationCommission,
        totalCommission: scopeCommission + accumulationCommission
      };
    } catch (error) {
      console.error('Error:', error);
      return { scopeCommission: 0, accumulationCommission: 0, totalCommission: 0 };
    }
  };

  const calculateInsuranceCommissions = async (data: any, company: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      // קבלת העמלות העדכניות מהדאטהבייס
      const { data: ratesData, error } = await supabase
        .from('agent_commission_rates')
        .select('insurance_companies')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // בדיקה שהחברה קיימת ופעילה
      const companyRates = ratesData?.insurance_companies?.[company];
      if (!companyRates?.active) {
        console.log(`Company ${company} is not active`);
        return {
          oneTimeCommission: 0,
          monthlyCommission: 0,
          totalCommission: 0
        };
      }

      const monthlyPremium = Number(data.insurancePremium) || 0;
      const insuranceType = data.insuranceType || 'risk';
      
      // חישוב עמלות לפי הנתונים מהדאטהבייס
      const oneTimeCommission = monthlyPremium * 12 * companyRates.products[insuranceType].one_time_rate;
      const monthlyCommission = monthlyPremium * companyRates.products[insuranceType].monthly_rate;
      const totalCommission = oneTimeCommission + (monthlyCommission * 12);

      return {
        oneTimeCommission,
        monthlyCommission,
        totalCommission
      };
    } catch (error) {
      console.error('Error calculating insurance commissions:', error);
      return { oneTimeCommission: 0, monthlyCommission: 0, totalCommission: 0 };
    }
  };

  const calculateInvestmentCommissions = async (data: any, company: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      const { data: ratesData, error } = await supabase
        .from('agent_commission_rates')
        .select('savings_and_study_companies')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const companyRates = ratesData?.savings_and_study_companies?.[company];
      if (!companyRates?.active) {
        console.log(`Company ${company} is not active in savings_and_study_companies`);
        return {
          scopeCommission: 0,
          monthlyCommission: 0,
          annualCommission: 0,
          totalCommission: 0
        };
      }

      const amount = Number(data.investmentAmount) || 0;

      // חישוב עמלת היקף - לפי ₪ למיליון
      const scopeCommission = (amount / 1000000) * companyRates.scope_rate_per_million;

      // חישוב עמלת נפרעים חודשית - לפי ₪ למיליון לחודש
      const monthlyCommission = (amount / 1000000) * companyRates.monthly_rate;

      // חישוב עמלת נפרעים שנתית
      const annualCommission = monthlyCommission * 12;

      // סה"כ עמלות בשנה הראשונה
      const totalCommission = scopeCommission + annualCommission;

      // לוג לבדיקה
      console.log(`Investment calculation for ${company}:`, {
        amount,
        rates: {
          scope_rate_per_million: companyRates.scope_rate_per_million,
          monthly_rate: companyRates.monthly_rate
        },
        results: {
          scopeCommission,
          monthlyCommission,
          annualCommission,
          totalCommission
        }
      });

      return {
        scopeCommission,
        monthlyCommission,
        annualCommission,
        totalCommission,
        details: {
          amount,
          scopeRatePerMillion: companyRates.scope_rate_per_million,
          monthlyRatePerMillion: companyRates.monthly_rate,
          calculationDetails: {
            scopeCalculation: `${(amount / 1000000).toFixed(2)} מיליון × ${companyRates.scope_rate_per_million.toLocaleString()} ₪ = ${scopeCommission.toLocaleString()} ₪`,
            monthlyCalculation: `${(amount / 1000000).toFixed(2)} מיליון × ${companyRates.monthly_rate.toLocaleString()} ₪ = ${monthlyCommission.toLocaleString()} ₪ לחודש`
          }
        }
      };
    } catch (error) {
      console.error('Error calculating investment commissions:', error);
      throw error;
    }
  };

  const calculatePolicyCommissions = async (data: any, company: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      // קבלת העמלות העדכניות מהדאטהבייס
      const { data: ratesData, error } = await supabase
        .from('agent_commission_rates')
        .select('policy_companies')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // בדיקה שהחברה קיימת ופעילה
      const companyRates = ratesData?.policy_companies?.[company];
      if (!companyRates?.active) {
        console.log(`Company ${company} is not active`);
        return {
          scopeCommission: 0,
          monthlyCommission: 0,
          annualCommission: 0,
          totalCommission: 0
        };
      }

      const amount = Number(data.policyAmount) || 0;
      
      // חישוב עמלת היקף לפי הנתונים מהדאטהבייס
      const scopeCommission = (amount / 1000000) * companyRates.scope_rate_per_million;
      
      // חישוב עמלה חודשית לפי הנתונים מהדאטהבייס
      const monthlyCommission = amount * (companyRates.monthly_rate / 12);
      
      // חישוב עמלה שנתית
      const annualCommission = monthlyCommission * 12;
      
      // סה"כ עמלות בשנה הראשונה
      const totalCommission = scopeCommission + annualCommission;

      console.log('Policy calculation:', {
        amount,
        rates: {
          scope_rate_per_million: companyRates.scope_rate_per_million,
          monthly_rate: companyRates.monthly_rate
        },
        results: {
          scopeCommission,
          monthlyCommission,
          annualCommission,
          totalCommission
        }
      });

      return {
        scopeCommission,
        monthlyCommission,
        annualCommission,
        totalCommission,
        details: {
          amount,
          scopeRatePerMillion: companyRates.scope_rate_per_million,
          monthlyRate: companyRates.monthly_rate,
          calculationDetails: {
            scopeCalculation: `${(amount / 1000000).toFixed(2)} מיליון × ${companyRates.scope_rate_per_million.toLocaleString()} ₪ = ${scopeCommission.toLocaleString()} ₪`,
            monthlyCalculation: `${amount.toLocaleString()} × ${(companyRates.monthly_rate * 100).toFixed(3)}% = ${monthlyCommission.toLocaleString()} ₪ לחודש`
          }
        }
      };
    } catch (error) {
      console.error('Error calculating policy commissions:', error);
      throw error;
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
      
      // חישוב סכומים
      const totalOneTimeCommissions = 
        (data.pensionDetails?.reduce((sum, detail) => sum + detail.scopeCommission, 0) || 0) +
        (data.insuranceDetails?.reduce((sum, detail) => sum + detail.oneTimeCommission, 0) || 0);

      const totalRecurringCommissions = 
        (data.pensionDetails?.reduce((sum, detail) => sum + detail.accumulationCommission, 0) || 0) +
        (data.insuranceDetails?.reduce((sum, detail) => sum + (detail.monthlyCommission * 12), 0) || 0) +
        (data.investmentDetails?.reduce((sum, detail) => sum + detail.commission, 0) || 0) +
        (data.policyDetails?.reduce((sum, detail) => sum + detail.commission, 0) || 0);

      element.innerHTML = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e3a8a; font-size: 28px; margin: 0;">דוח מסע לקוח</h1>
            <p style="color: #64748b; margin: 10px 0;">תאריך: ${data.date}</p>
            <p style="color: #64748b; margin: 10px 0;">שם לקוח: ${data.clientName}</p>
          </div>

          <div style="background: #1e40af; color: white; padding: 20px; border-radius: 10px; margin-top: 30px;">
            <h2 style="margin: 0 0 15px 0; font-size: 20px;">סיכום עמלות</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
              <div>
                <p style="color: #93c5fd; margin: 0 0 5px 0;">סה"כ עמלות חד פעמיות</p>
                <p style="font-size: 1.2em; font-weight: bold; margin: 0;">${totalOneTimeCommissions.toLocaleString()} ₪</p>
              </div>
              <div>
                <p style="color: #93c5fd; margin: 0 0 5px 0;">סה"כ עמלות שוטפות (שנתי)</p>
                <p style="font-size: 1.2em; font-weight: bold; margin: 0;">${totalRecurringCommissions.toLocaleString()} ₪</p>
              </div>
            </div>
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

  // גדרת פונקציית loadSalesData
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

      // טעינת תוני ביטוח
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

  const [commissionDetails, setCommissionDetails] = React.useState<CommissionDetails>({
    pension: { companies: {}, total: 0 },
    insurance: { companies: {}, total: 0 },
    investment: { companies: {}, total: 0 },
    policy: { companies: {}, total: 0 }
  });

  // הוספת טיפוסים מדויקים
  interface MeetingData {
    client_id: string | null;
    user_id: string;
    date: string;
    summary: string;
    next_steps: string;
    status: 'completed' | 'pending' | 'cancelled';
    created_at: string;
    commission_details: CommissionDetails;
    selected_products: string[];
    selected_companies: Record<string, string[]>;
  }

  // הוספת ממשק לנתוני מכירת פנסיה
  interface PensionSale {
    id?: string;
    created_at: string;
    user_id: string;
    date: string;
    client_name: string;
    client_phone?: string;
    company: string;
    salary: number;
    accumulation: number;
    provision: number;
    scope_commission: number;
    accumulation_commission: number;
    total_commission: number;
    journey_id?: string;
  }

  // עדכון הפונקציה שמשתמשת בטיפוס החדש
  const savePensionSale = async (
    data: FormData, 
    company: string, 
    result: any, 
    journeyId: string,
    userId: string  // הוספת פרמטר של userId
  ) => {
    const pensionData: PensionSale = {
      created_at: new Date().toISOString(),
      user_id: userId,  // שימוש ב-userId במקום user.id
      date: new Date().toISOString(),
      client_name: data.clientName,
      client_phone: data.clientPhone,
      company: company,
      salary: Number(data.pensionSalary),
      accumulation: Number(data.pensionAccumulation),
      provision: Number(data.pensionProvision),
      scope_commission: result.scopeCommission,
      accumulation_commission: result.accumulationCommission,
      total_commission: result.totalCommission,
      journey_id: journeyId
    };

    const { error: pensionError } = await supabase
      .from('pension_sales')
      .insert([pensionData]);

    if (pensionError) throw pensionError;
  };

  // עדכון הקריאה לפונקציה ב-onSubmit
  const onSubmit = async (data: FormData) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('משתמש לא מחובר');

      // בדיקת תקינות שם הלקוח
      if (!data.clientName?.trim()) {
        toast.error('נא להזין שם לקוח');
        return;
      }

      // חישוב העמלות
      const newCommissionDetails: CommissionDetails = {
        pension: { companies: {}, total: 0 },
        insurance: { companies: {}, total: 0 },
        investment: { companies: {}, total: 0 },
        policy: { companies: {}, total: 0 }
      };

      let totalCommissions = 0;

      // חישוב עמלות פנסיה
      if (selectedProducts.pension && selectedCompanies.pension.length > 0) {
        for (const company of selectedCompanies.pension) {
          const result = await calculatePensionCommissions(data, company);
          totalCommissions += result.totalCommission;
          newCommissionDetails.pension.companies[company] = result;
          newCommissionDetails.pension.total += result.totalCommission;
        }
      }

      // חישוב עמלות ביטוח
      if (selectedProducts.insurance && selectedCompanies.insurance.length > 0) {
        for (const company of selectedCompanies.insurance) {
          const result = await calculateInsuranceCommissions(data, company);
          totalCommissions += result.totalCommission;
          newCommissionDetails.insurance.companies[company] = result;
          newCommissionDetails.insurance.total += result.totalCommission;
        }
      }

      // חישב עמלות השקעות
      if (selectedProducts.investment && selectedCompanies.investment.length > 0) {
        for (const company of selectedCompanies.investment) {
          const result = await calculateInvestmentCommissions(data, company);
          totalCommissions += result.totalCommission;
          newCommissionDetails.investment.companies[company] = result;
          newCommissionDetails.investment.total += result.totalCommission;
        }
      }

      // חישוב עמלות פוליסות
      if (selectedProducts.policy && selectedCompanies.policy.length > 0) {
        for (const company of selectedCompanies.policy) {
          const result = await calculatePolicyCommissions(data, company);
          totalCommissions += result.totalCommission;
          newCommissionDetails.policy.companies[company] = result;
          newCommissionDetails.policy.total += result.totalCommission;
        }
      }

      // עדכון ה-state של פרי העמלות
      setCommissionDetails(newCommissionDetails);

      // פיצול שם הלקוח
      const nameParts = data.clientName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // בדיקה אם הלקוח קיים
      const { data: existingClient, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('first_name', firstName)
        .eq('last_name', lastName)
        .maybeSingle();

      if (clientError) {
        console.error('Error checking client:', clientError);
      }

      let clientId: string | null = null;

      if (!existingClient) {
        // יציר לקוח חדש
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert([{
            user_id: user.id,
            first_name: firstName,
            last_name: lastName,
            phone: data.clientPhone,
            status: 'active',
            created_at: new Date().toISOString(),
            last_contact: new Date().toISOString()
          }])
          .select('id')
          .single();

        if (createError) throw createError;
        if (!newClient) throw new Error('שגיאה ביצירת לקוח חדש');
        
        clientId = newClient.id;
      } else {
        clientId = existingClient.id;
      }

      // יצירת מסע לקוח חדש
      const journeyData = {
        user_id: user.id,
        client_id: clientId,
        journey_date: new Date().toLocaleDateString('he-IL'),
        date: new Date().toISOString(),
        client_name: data.clientName,
        client_phone: data.clientPhone,
        selected_products: Object.entries(selectedProducts)
          .filter(([_, value]) => value)
          .map(([key]) => key),
        selected_companies: selectedCompanies,
        commission_details: newCommissionDetails,
        total_commission: Object.values(newCommissionDetails)
          .reduce((sum, detail) => sum + detail.total, 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newJourney, error: journeyError } = await supabase
        .from('customer_journeys')
        .insert([journeyData])
        .select('id')
        .single();

      if (journeyError) throw journeyError;
      if (!newJourney) throw new Error('שגיאה ביצירת מסע לקוח');

      const journeyId = newJourney.id;

      // שמירת נתוני פנסיה
      if (selectedProducts.pension && selectedCompanies.pension.length > 0) {
        for (const company of selectedCompanies.pension) {
          const result = await calculatePensionCommissions(data, company);
          await savePensionSale(data, company, result, journeyId, user.id);  // העברת user.id
        }
      }

      // שמירת נתוני ביטוח
      if (selectedProducts.insurance && selectedCompanies.insurance.length > 0) {
        for (const company of selectedCompanies.insurance) {
          const result = await calculateInsuranceCommissions(data, company);
          const insuranceData = {
            user_id: user.id,
            client_id: clientId,
            journey_id: journeyId,  // הוספ קישור למסע
            client_name: data.clientName,
            client_phone: data.clientPhone,
            company: company,
            date: new Date().toISOString(),
            insurance_type: data.insuranceType,
            monthly_premium: Number(data.insurancePremium),
            one_time_commission: result.oneTimeCommission,
            monthly_commission: result.monthlyCommission,
            total_commission: result.totalCommission,
            created_at: new Date().toISOString()
          };

          const { error: insuranceError } = await supabase
            .from('insurance_sales')
            .insert([insuranceData]);

          if (insuranceError) throw insuranceError;
        }
      }

      // שמירת נתוני השקעות
      if (selectedProducts.investment && selectedCompanies.investment.length > 0) {
        for (const company of selectedCompanies.investment) {
          const result = await calculateInvestmentCommissions(data, company);
          const investmentData = {
            user_id: user.id,
            client_id: clientId,
            client_name: data.clientName,
            client_phone: data.clientPhone,
            company: company,
            date: new Date().toISOString(),
            amount: Number(data.investmentAmount),
            scope_commission: result.scopeCommission,
            monthly_commission: result.monthlyCommission,
            annual_commission: result.annualCommission,
            total_commission: result.totalCommission,
            created_at: new Date().toISOString()
          };

          const { error: investmentError } = await supabase
            .from('investment_sales')
            .insert([investmentData]);

          if (investmentError) throw investmentError;
        }
      }

      // שמירת נתוני פוליסות
      if (selectedProducts.policy && selectedCompanies.policy.length > 0) {
        for (const company of selectedCompanies.policy) {
          const result = await calculatePolicyCommissions(data, company);
          const policyData = {
            user_id: user.id,
            client_id: clientId,
            client_name: data.clientName,
            client_phone: data.clientPhone,
            company: company,
            date: new Date().toISOString(),
            amount: Number(data.policyAmount),
            period: Number(data.policyPeriod),
            scope_commission: result.scopeCommission,
            monthly_commission: result.monthlyCommission,
            annual_commission: result.annualCommission,
            total_commission: result.totalCommission,
            created_at: new Date().toISOString()
          };

          const { error: policyError } = await supabase
            .from('policy_sales')
            .insert([policyData]);

          if (policyError) throw policyError;
        }
      }

      // יצירת סיכום פגישה
      const summaryData = reportService.generateMeetingSummary({
        client_name: data.clientName,
        selected_products: Object.entries(selectedProducts)
          .filter(([_, value]) => value)
          .map(([key]) => key),
        selected_companies: selectedCompanies,
        commission_details: newCommissionDetails,
        formData: data
      });

      // פתיחת הדיאלוג עם הסיכום
      setMeetingSummary({
        isOpen: true,
        summary: summaryData.summary,
        next_steps: summaryData.next_steps,
        pdfContent: summaryData.pdfContent
      });

      toast.success('החישוב וסיכום הפגישה נוצרו ונשמרו בהצלחה בכל הטבלאות');

    } catch (error) {
      console.error('Error:', error);
      toast.error('אירעה שגיאה בשמירת הנתונים');
    }
  };

  const handleDownloadPDF = () => {
    if (!meetingSummary.pdfContent) {
      toast.error('אין נתונים לורדה');
      return;
    }

    const element = document.createElement('div');
    element.innerHTML = meetingSummary.pdfContent;

    const opt = {
      margin: 10,
      filename: `סיכום_פגישה_${watch('clientName')}_${new Date().toLocaleDateString('he-IL')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        dir: 'rtl'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    html2pdf().from(element).set(opt).save();
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
        'מצרים שנבחרו': currentJourney.selectedProducts.join(', '),
        'עמלות פנסיה': currentJourney.commission_details.pension.total,
        'עלות ביטוח': currentJourney.commission_details.insurance.total,
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
      
      saveAs(data, `דח_מסע_לקוח_${currentJourney.clientName}_${currentJourney.journey_date}.xlsx`);
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
    let message = `דוח סע לקוח:\n\n`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // פורמט התאריך בכיוון ההפוך (DD-MM-YYYY)
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      const formattedDateTime = today.toISOString();

      // בדיקה אם הלקוח כבר קיים
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .eq('first_name', formData.firstName)
        .eq('last_name', formData.lastName)
        .single();

      // אם הלקוח לא קיים, נוסיף אותו
      if (!existingClient) {
        const clientData = {
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          status: 'active',
          created_at: formattedDateTime,
          last_contact: formattedDate
        };

        const { error: clientError } = await supabase
          .from('clients')
          .insert([clientData]);

        if (clientError) throw clientError;
      }

      // הוספת המכירה לטבלה המתאימה
      const saleData = {
        user_id: user.id,
        client_name: `${formData.firstName} ${formData.lastName}`,
        client_phone: formData.phone,
        company: formData.company,
        date: formattedDate,
        created_at: formattedDateTime,
        // ... שאר השדת
      };

      const { data, error } = await supabase
        .from('pension_sales')
        .insert([saleData])
        .select()
        .single();

      if (error) throw error;

      toast.success('הנתונים נשמרו בהצלחה');

    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('אירעה שגיאה בשמירת הנתונים');
    }
  };

  const [meetingSummary, setMeetingSummary] = React.useState<{
    isOpen: boolean;
    summary: string;
    next_steps: string;
    pdfContent?: string;
  }>({
    isOpen: false,
    summary: '',
    next_steps: '',
    pdfContent: ''
  });

  const handleCreateMeetingSummary = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      // יצירת סיכום פגישה
      const summaryData = reportService.generateMeetingSummary({
        client_name: watch('clientName'),
        selected_products: Object.entries(selectedProducts)
          .filter(([_, value]) => value)
          .map(([key]) => key),
        selected_companies: selectedCompanies,
        commission_details: commissionDetails
      });

      // שמירת הפגישה במערכת
      const meetingData = {
        client_id: null,
        user_id: user.id,
        date: new Date().toISOString(),
        summary: summaryData.summary,
        next_steps: summaryData.next_steps,
        status: 'completed',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('meetings')
        .insert([meetingData]);

      if (error) throw error;

      // פתיחת הדיאלוג עם הסיכום
      setMeetingSummary({
        isOpen: true,
        summary: summaryData.summary,
        next_steps: summaryData.next_steps
      });

      toast.success('סיכום הפגישה נוצר ונשמר בהצלחה');
      
    } catch (error) {
      console.error('Error creating meeting summary:', error);
      toast.error('שגיאה ביצירת סיכום הפגישה');
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* כותרת ראשית */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">מסלקו</h1>
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
                  placeholder="נס שם לקוח"
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
                        <SelectValue placeholder="בחר חוז הפרשה" />
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
                    <Input {...register('insurancePremium')} type="number" placeholder="הכנס פריה חודשית" />
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
                    <label className="text-sm font-medium">תופת חיסכון (בשנים)</label>
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
            onClick={handleCreateMeetingSummary}
          >
            <FileText className="h-5 w-5 ml-2" />
            צור סיכום פגישה
          </Button>
        </div>
      )}

      <Dialog 
        open={meetingSummary.isOpen} 
        onOpenChange={(open) => setMeetingSummary(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          aria-describedby="meeting-summary-description"
        >
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <DialogTitle>סיכום פגישה</DialogTitle>
            <DialogDescription id="meeting-summary-description">
              פירוט הפעולות והעמלות מהפגישה
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">סיכום</h3>
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {meetingSummary.summary}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">משימות להמשך</h3>
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {meetingSummary.next_steps}
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white pt-4 border-t flex justify-end space-x-4 space-x-reverse">
              <Button onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 ml-2" />
                הורד PDF
              </Button>
              <Button
                onClick={() => {
                  const text = `${meetingSummary.summary}\n\nמשימות להמשך:\n${meetingSummary.next_steps}`;
                  const encodedText = encodeURIComponent(text);
                  window.open(`https://wa.me/?text=${encodedText}`, '_blank');
                }}
              >
                <Share2 className="h-4 w-4 ml-2" />
                שתף בווצאפ
              </Button>
              <Button
                onClick={() => setMeetingSummary(prev => ({ ...prev, isOpen: false }))}
                variant="outline"
              >
                סגור
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerJourney; 