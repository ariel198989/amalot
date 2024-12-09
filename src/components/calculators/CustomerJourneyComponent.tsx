import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { calculateCommissions, getCompanyRates } from '@/services/AgentAgreementService';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { 
  Building2, 
  Shield,
  Wallet,
  PiggyBank,
  User,
  Brain
} from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { reportService } from '@/services/reportService';
import { useNavigate } from 'react-router-dom';
import { useSalesTargets } from '@/contexts/SalesTargetsContext';
import ClientInfoForm from '../client-info/ClientInfoForm';

interface PensionProduct {
  salary: number;
  accumulation: number;
  provision: number;
  scope_commission: number;
  monthly_commission: number;
  total_commission: number;
}

interface InsuranceProduct {
  premium: number;
  insurance_type: string;
  payment_method: string;
  nifraim: number;
  scope_commission: number;
  monthly_commission: number;
  total_commission: number;
}

interface InvestmentProduct {
  investment_amount: number;
  investment_period: number;
  investment_type: string;
  scope_commission: number;
  total_commission: number;
}

interface PolicyProduct {
  policy_amount: number;
  policy_period: number;
  policy_type: string;
  scope_commission: number;
  total_commission: number;
}

interface CustomerJourney {
  id: string;
  user_id: string;
  journey_date: string;
  date: string;
  client_name: string;
  selected_products: Array<{
    type: 'pension' | 'insurance' | 'policy' | 'investment';
    company: string;
    details: PensionProduct | InsuranceProduct | InvestmentProduct | PolicyProduct;
  }>;
  selected_companies: {
    pension: string[];
    insurance: string[];
    investment: string[];
    policy: string[];
  };
  commission_details: {
    [key: string]: {
      companies: {
        [company: string]: {
          scopeCommission: number;
          accumulationCommission: number;
          oneTimeCommission: number;
          totalCommission: number;
          monthlyCommission?: number;
        };
      };
      total: number;
    };
  };
  total_commission: number;
  created_at: string;
  updated_at: string;
}

interface ClientInfo {
  fullName: string;
  idNumber: string;
  birthDate: string;
  email: string;
  address: {
    street: string;
    city: string;
  };
  employment: {
    type: 'employed' | 'self-employed';
    employer?: {
      name: string;
      position: string;
      workplaceAddress: string;
      employmentStartDate: string;
    };
    business?: {
      name: string;
      type: string;
      address: string;
      startDate: string;
    };
  };
}

interface CustomerJourneyClient {
  id: string;
  date: string;
  name: string;
  company: string;
  type: 'pension' | 'insurance' | 'savings_and_study' | 'policy';
  pensionType?: string;
  insuranceType?: string;
  details: {
    pensionSalary?: number;
    pensionAccumulation?: number;
    pensionContribution?: number;
    insurancePremium?: number;
    investmentAmount?: number;
    policyAmount?: number;
  };
  scopeCommission: number;
  monthlyCommission: number;
  totalCommission: number;
  clientInfo?: ClientInfo;
}

interface CategorySummary {
  scopeCommission: number;
  monthlyCommission: number;
  totalCommission: number;
  count: number;
}

interface ProductCardProps {
  title: string;
  icon: React.ElementType;
  selected: boolean;
  onClick: () => void;
}

const ProductIcon = ({ type, className }: { type: string; className?: string }) => {
  const iconClass = cn("w-6 h-6", className);
  switch (type) {
    case 'pension':
      return <Building2 className={cn(iconClass, "text-blue-500")} />;
    case 'insurance':
      return <Shield className={cn(iconClass, "text-green-500")} />;
    case 'savings_and_study':
      return <PiggyBank className={cn(iconClass, "text-purple-500")} />;
    case 'policy':
      return <Wallet className={cn(iconClass, "text-orange-500")} />;
    default:
      return null;
  }
};

const ProductCard: React.FC<ProductCardProps> = ({ title, icon: Icon, selected, onClick }) => {
  const getColorScheme = () => {
    switch (title) {
      case 'פנסיה':
        return { border: 'blue', bg: 'blue' };
      case 'סיכונים':
        return { border: 'green', bg: 'green' };
      case 'פיננסים':
        return { border: 'purple', bg: 'purple' };
      case 'פוליסת חסכון':
        return { border: 'orange', bg: 'orange' };
      default:
        return { border: 'gray', bg: 'gray' };
    }
  };

  const colors = getColorScheme();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "p-6 border-2 rounded-xl cursor-pointer transition-all",
        selected 
          ? `border-${colors.border}-500 bg-${colors.bg}-50 shadow-md` 
          : `hover:border-${colors.border}-200`
      )}
      onClick={onClick}
    >
      <Icon className={`w-12 h-12 text-${colors.border}-500 mx-auto mb-3`} />
      <p className="text-center font-medium text-lg">{title}</p>
    </motion.div>
  );
};

// Add type mapping
const typeToReportKey = {
  'pension': 'pension',
  'insurance': 'insurance',
  'savings_and_study': 'investment',
  'policy': 'policy'
} as const;

interface CompanyRates {
  scope_rate?: number;
  scope_rate_per_million: number;
  monthly_rate?: number;
  nifraim_rate_per_million?: number;
  active: boolean;
}

const CustomerJourneyComponent: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<CustomerJourneyClient[]>([]);
  const [companyRates, setCompanyRates] = useState<{ [key: string]: { [company: string]: CompanyRates } }>({});
  const [clientName, setClientName] = useState<string>('');
  const [isStarting, setIsStarting] = useState<boolean>(true);
  const [selectedProducts, setSelectedProducts] = useState<{
    pension: boolean;
    insurance: boolean;
    savings_and_study: boolean;
    policy: boolean;
  }>({
    pension: false,
    insurance: false,
    savings_and_study: false,
    policy: false
  });
  const { updatePerformance } = useSalesTargets();
  const [step, setStep] = useState<'info' | 'journey'>('info');
  const [clientInfo, setClientInfo] = useState<ClientInfo>();

  useEffect(() => {
    loadCompanyRates();
  }, []);

  // טיפול בהודעות שגיאה בנפרד מstate updates
  useEffect(() => {
    // בודק רק אם אנחנו בשלב של בחירת מוצרים
    if (step === 'products' && !Object.values(selectedProducts).some(Boolean)) {
      toast.error('חובה לבחור לפחות מוצר אחד');
    }
  }, [selectedProducts, step]);

  const handleProductSelect = useCallback((productType: 'pension' | 'insurance' | 'savings_and_study' | 'policy') => {
    setSelectedProducts(prev => {
      const newState = {
        ...prev,
        [productType]: !prev[productType]
      };
      
      if (!Object.values(newState).some(Boolean)) {
        toast.error('חובה לבחור לפחות מוצר אחד');
        return prev;
      }
      
      return newState;
    });
  }, []);

  const loadCompanyRates = async () => {
    const companies = ['מגדל', 'מנורה', 'כלל', 'הראל', 'הפניקס', 'מור', 'מיטב', 'אלטשולר שחם'];
    const productTypes = ['pension', 'insurance', 'savings_and_study', 'policy'] as const;
    const rates: { [key: string]: any } = {};
    
    for (const type of productTypes) {
      rates[type] = {};
      for (const company of companies) {
        const companyRates = await getCompanyRates(type, company, 
          type === 'insurance' ? { insuranceType: 'risk' } : undefined
        );
        if (companyRates?.active) {
          rates[type][company] = companyRates;
        }
      }
    }
    
    setCompanyRates(rates);
  };

  const getProductFields = (type: 'pension' | 'insurance' | 'savings_and_study' | 'policy') => {
    const baseFields = [
      { 
        name: 'company',
        label: 'יצרן',
        type: 'select',
        required: true,
        className: 'bg-white !important text-right pr-4',
        containerClassName: 'relative z-[999] bg-white select-container',
        popoverClassName: 'z-[999] bg-white text-right',
        listboxClassName: 'bg-white text-right',
        optionClassName: 'bg-white hover:bg-gray-100 text-right',
        options: [
          { value: 'מגדל', label: 'מגדל' },
          { value: 'מנורה', label: 'מנורה' },
          { value: 'כלל', label: 'כלל' },
          { value: 'הראל', label: 'הראל' },
          { value: 'הפניקס', label: 'הפניקס' },
          { value: 'מור', label: 'מור' },
          { value: 'מיטב', label: 'מיטב' },
          { value: 'אלטשולר שחם', label: 'אלטשולר שחם' }
        ]
      }
    ];

    switch (type) {
      case 'pension':
        return [
          { 
            name: 'transactionType',
            label: 'סוג עסקה',
            type: 'select',
            required: true,
            className: 'bg-white !important text-right pr-4',
            containerClassName: 'relative z-[997] bg-white select-container',
            popoverClassName: 'z-[997] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: 'proposal', label: 'הצעה' },
              { value: 'agent_appointment', label: 'מינוי סוכן' }
            ]
          },
          { 
            name: 'pensionType',
            label: 'סוג פנסיה',
            type: 'select',
            required: true,
            className: 'bg-white !important text-right pr-4',
            containerClassName: 'relative z-[998] bg-white select-container',
            popoverClassName: 'z-[998] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: 'comprehensive', label: 'מקיפה' },
              { value: 'supplementary', label: 'משלימה' }
            ]
          },
          { 
            name: 'company',
            label: 'יצרן',
            type: 'select',
            required: true,
            className: 'bg-white !important text-right pr-4',
            containerClassName: 'relative z-[999] bg-white select-container',
            popoverClassName: 'z-[999] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: 'מגדל', label: 'מגדל' },
              { value: 'מנורה', label: 'מנורה' },
              { value: 'כלל', label: 'כלל' },
              { value: 'הראל', label: 'הראל' },
              { value: 'הפניקס', label: 'הפניקס' },
              { value: 'מור', label: 'מור' },
              { value: 'מיטב', label: 'מיטב' },
              { value: 'אלטשולר שחם', label: 'אלטשולר שחם' }
            ]
          },
          { 
            name: 'pensionSalary', 
            label: 'שכר', 
            type: 'number', 
            required: true,
            className: 'bg-white text-right'
          },
          { 
            name: 'pensionAccumulation', 
            label: 'צבירה', 
            type: 'number', 
            required: true,
            className: 'bg-white text-right'
          },
          { 
            name: 'pensionContribution', 
            label: 'אחוז הפרשה', 
            type: 'select', 
            required: true,
            className: 'bg-white !important text-right pr-4',
            containerClassName: 'relative z-[996] bg-white select-container',
            popoverClassName: 'z-[996] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: '0.2283', label: '22.83%' },
              { value: '0.2183', label: '21.83%' },
              { value: '0.2083', label: '20.83%' },
              { value: '0.1950', label: '19.50%' },
              { value: '0.1850', label: '18.50%' }
            ]
          }
        ];
      case 'insurance':
        return [
          ...baseFields,
          { 
            name: 'transactionType',
            label: 'סוג עסקה',
            type: 'select',
            required: true,
            className: 'bg-white !important text-right pr-4',
            containerClassName: 'relative z-[60] bg-white',
            popoverClassName: 'z-[60] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: 'personal_accident', label: 'תאונות אישיות' },
              { value: 'mortgage', label: 'משכנתא' },
              { value: 'health', label: 'בריאות' },
              { value: 'critical_illness', label: 'מחלות קשות' },
              { value: 'insurance_umbrella', label: 'מטריה ב��טוחית' },
              { value: 'risk', label: 'ריסק' },
              { value: 'service', label: 'כתבי שירות' },
              { value: 'disability', label: 'אכע' }
            ]
          },
          { 
            name: 'insurancePremium', 
            label: 'פרמיה חודשית', 
            type: 'number', 
            required: true,
            className: 'bg-white'
          }
        ];
      case 'savings_and_study':
      case 'policy':
        return [
          ...baseFields,
          { 
            name: 'investmentAmount', 
            label: 'סכום', 
            type: 'number', 
            required: true,
            className: 'bg-white'
          }
        ];
    }
  };

  const handleSubmit = async (type: 'pension' | 'insurance' | 'savings_and_study' | 'policy', data: any) => {
    try {
      let commissions;
      let nifraim = 0;
      let scope_commission = 0;
      const currentMonth = new Date().getMonth() + 1;
      
      const rates = companyRates[type]?.[data.company];
      if (!rates) {
        toast.error('לא נמצאו נתוני עמלות לחברה זו');
        return;
      }

      switch (type) {
        case 'pension':
          const salary = Number(data.pensionSalary);
          const accumulation = Number(data.pensionAccumulation);
          const contributionRate = Number(data.pensionContribution);
          
          commissions = await calculateCommissions(type, data.company, salary, accumulation, contributionRate);
          console.log('Pension commission calculation:', {
            salary,
            accumulation,
            contributionRate,
            commissions
          });

          // עדכון הביצועים עבור ניוד פנסיה
          await updatePerformance('pension-transfer', accumulation, currentMonth);
          break;

        case 'insurance': {
          const premium = Number(data.insurancePremium);
          console.log('Calculating insurance commissions:', {
            company: data.company,
            premium,
            insuranceType: data.transactionType
          });
          
          commissions = await calculateCommissions(
            'insurance',
            data.company,
            premium,
            undefined,
            undefined,
            undefined,
            data.transactionType as any
          );
          
          if (!commissions) {
            console.error('No commission agreement found for:', {
              company: data.company,
              insuranceType: data.transactionType
            });
            toast.error('אין הסכם פעיל עבור חברה זו');
            return;
          }
          
          // Calculate scope commission (65% of annual premium)
          scope_commission = premium * 0.65;
          
          // Calculate nifraim (25% of monthly premium)
          nifraim = premium * 0.25;
          
          commissions = {
            scope_commission,
            monthly_commission: nifraim
          };

          // עדכון הביצועים עבור ניכונים
          await updatePerformance('risks', premium, currentMonth);
          break;
        }

        case 'savings_and_study': {
          const amount = Number(data.investmentAmount);
          
          // Calculate scope commission (e.g., 6000 per million)
          scope_commission = amount / 1000000 * (rates.scope_rate_per_million || 0);
          
          // Calculate monthly nifraim (e.g., 250 per million)
          nifraim = amount / 1000000 * (rates.nifraim_rate_per_million || 0);
          
          commissions = {
            scope_commission,
            monthly_commission: nifraim
          };

          console.log('Investment calculations:', {
            amount,
            millionsInAmount: amount / 1000000,
            scope_commission,
            nifraim,
            total: scope_commission + (nifraim * 12)
          });

          // עדכון ה��יצועים עבור ניוד ייננסים
          await updatePerformance('finance-transfer', amount, currentMonth);
          break;
        }

        case 'policy': {
          const amount = Number(data.investmentAmount);
          
          commissions = await calculateCommissions(type, data.company, amount);

          // עדכון הביצועים עבור הפקדה שוופת
          await updatePerformance('regular-deposit', amount, currentMonth);
          break;
        }
      }

      if (!commissions) {
        toast.error('אין הסכם פעיל עבור חברה זו');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('משמש לא מחובר');
        return;
      }

      const journeyId = crypto.randomUUID();
      const date = new Date().toISOString();

      // Save to appropriate table based on type
      switch (type) {
        case 'pension': {
          const { error } = await supabase.from('pension_sales').insert({
            user_id: user.id,
            journey_id: journeyId,
            client_name: clientName,
            client_phone: data.clientPhone || '',
            company: data.company,
            date,
            salary: Number(data.pensionSalary),
            accumulation: Number(data.pensionAccumulation),
            provision: Number(data.pensionContribution) * 100,
            scope_commission: commissions.scope_commission,
            monthly_commission: commissions.monthly_commission,
            total_commission: commissions.scope_commission + commissions.monthly_commission,
            transaction_type: data.transactionType,
            pension_type: data.pensionType
          });

          if (error) throw error;
          break;
        }

        case 'insurance': {
          const { error } = await supabase.from('insurance_sales').insert({
            user_id: user.id,
            journey_id: journeyId,
            client_name: clientName,
            client_phone: data.clientPhone || '',
            company: data.company,
            date,
            premium: Number(data.insurancePremium),
            insurance_type: data.transactionType,
            payment_method: 'monthly',
            nifraim,
            scope_commission: commissions.scope_commission,
            total_commission: commissions.scope_commission + (nifraim * 12)
          });

          if (error) throw error;
          break;
        }

        case 'savings_and_study': {
          const { error } = await supabase.from('investment_sales').insert({
            user_id: user.id,
            journey_id: journeyId,
            client_name: clientName,
            client_phone: data.clientPhone || '',
            company: data.company,
            date,
            investment_amount: Number(data.investmentAmount),
            investment_period: data.investmentPeriod || 12,
            investment_type: data.investmentType || 'general',
            nifraim, // Monthly nifraim amount
            scope_commission: commissions.scope_commission, // One-time scope commission
            total_commission: commissions.scope_commission + (nifraim * 12)
          });

          if (error) throw error;
          break;
        }

        case 'policy': {
          const { error } = await supabase.from('policy_sales').insert({
            user_id: user.id,
            journey_id: journeyId,
            client_name: clientName,
            client_phone: data.clientPhone || '',
            company: data.company,
            date,
            policy_amount: Number(data.investmentAmount),
            policy_period: data.policyPeriod || 12,
            policy_type: data.policyType || 'general',
            scope_commission: commissions.scope_commission,
            total_commission: commissions.scope_commission
          });

          if (error) throw error;
          break;
        }
      }

      // Update local state
      const newClient: CustomerJourneyClient = {
        id: journeyId,
        date: new Date().toLocaleDateString('he-IL'),
        name: clientName,
        company: data.company,
        type: type,
        pensionType: type === 'pension' ? data.pensionType : undefined,
        insuranceType: type === 'insurance' ? data.transactionType : undefined,
        details: {
          pensionSalary: data.pensionSalary,
          pensionAccumulation: data.pensionAccumulation,
          pensionContribution: data.pensionContribution,
          insurancePremium: data.insurancePremium,
          investmentAmount: data.investmentAmount,
          policyAmount: data.investmentAmount
        },
        scopeCommission: commissions.scope_commission,
        monthlyCommission: commissions.monthly_commission || nifraim,
        totalCommission: commissions.scope_commission + (commissions.monthly_commission || nifraim * 12)
      };

      setClients([...clients, newClient]);
      toast.success('הנתונים שמרו בהצלחה');

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('אירעה שגיאה בשמירת הנתונים');
    }
  };

  const calculateCategorySummary = (type: 'pension' | 'insurance' | 'savings_and_study' | 'policy'): CategorySummary => {
    const categoryClients = clients.filter(client => client.type === type);
    return {
      scopeCommission: categoryClients.reduce((sum, client) => sum + client.scopeCommission, 0),
      monthlyCommission: categoryClients.reduce((sum, client) => sum + client.monthlyCommission, 0),
      totalCommission: categoryClients.reduce((sum, client) => sum + client.totalCommission, 0),
      count: categoryClients.length
    };
  };

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'company', label: 'יצרן' },
    { key: 'type', label: 'סוג מוצר', format: (value: string) => {
      switch (value) {
        case 'pension': return 'פנסיה';
        case 'insurance': return 'סיכונים';
        case 'savings_and_study': return 'גמל והשתלמות';
        case 'policy': return 'פוליסת חסכון';
        default: return value;
      }
    }},
    { key: 'pensionType', label: 'סוג פנסיה', format: (value: string) => {
      if (!value) return '-';
      switch (value) {
        case 'comprehensive': return 'מקיפה';
        case 'supplementary': return 'משלימה';
        default: return value;
      }
    }},
    { key: 'scopeCommission', label: 'עמלת היקף', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'monthlyCommission', label: 'עמלת הקף על הצירה', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'totalCommission', label: 'סה"כ', format: (value: number) => `₪${value.toLocaleString()}` }
  ];

  const handleDownload = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים להורדה');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "תאריך,שם הלקוח,חברה,סוג מוצר,עמלת היקף,עמלת נפרעים,ה\"כ\n";
    
    clients.forEach((client) => {
      const row = [
        client.date,
        client.name,
        client.company,
        client.type,
        client.scopeCommission,
        client.monthlyCommission,
        client.totalCommission
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "דוח_לקוח.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setClients([]);
    setClientName('');
    setIsStarting(true);
    setSelectedProducts({
      pension: false,
      insurance: false,
      savings_and_study: false,
      policy: false
    });
  };

  const startNewJourney = useCallback(() => {
    if (!clientName.trim()) {
      toast.error('נא להזין שם לקוח');
      return;
    }

    if (!Object.values(selectedProducts).some(Boolean)) {
      toast.error('נא לבחור לפחות מוצר אחד');
      return;
    }

    setIsStarting(false);
  }, [clientName, selectedProducts]);

  const totalSummary = {
    scopeCommission: clients.reduce((sum, client) => sum + client.scopeCommission, 0),
    monthlyCommission: clients.reduce((sum, client) => sum + client.monthlyCommission, 0),
    totalCommission: clients.reduce((sum, client) => sum + client.totalCommission, 0)
  };

  const calculateCommissionDetails = () => {
    const details: Record<string, { companies: Record<string, any>, total: number }> = {
      pension: { companies: {}, total: 0 },
      insurance: { companies: {}, total: 0 },
      investment: { companies: {}, total: 0 },
      policy: { companies: {}, total: 0 }
    };

    for (const client of clients) {
      const type = client.type === 'savings_and_study' ? 'investment' : client.type;
      const company = client.company;
      
      if (!details[type].companies[company]) {
        details[type].companies[company] = {
          scopeCommission: 0,
          accumulationCommission: 0,
          oneTimeCommission: 0,
          totalCommission: 0,
          monthlyCommission: 0
        };
      }

      details[type].companies[company].scopeCommission += client.scopeCommission;
      details[type].companies[company].totalCommission += client.totalCommission;
      
      if (type === 'pension') {
        details[type].companies[company].accumulationCommission += client.monthlyCommission;
      } else if (type === 'insurance') {
        details[type].companies[company].oneTimeCommission += client.scopeCommission;
        details[type].companies[company].monthlyCommission += client.monthlyCommission;
      }

      details[type].total += client.totalCommission;
    }

    return details;
  };

  const calculateTotalCommission = () => {
    return clients.reduce((total, client) => total + client.totalCommission, 0);
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא נמצא משתמש מחובר');

      const journey: CustomerJourney = {
        id: crypto.randomUUID(),
        user_id: user.id,
        journey_date: new Date().toISOString(),
        date: new Date().toISOString(),
        client_name: clientName,
        selected_products: clients.map(client => {
          const type = client.type === 'savings_and_study' ? 'investment' : client.type;
          let details: any = {
            scope_commission: client.scopeCommission,
            monthly_commission: client.monthlyCommission,
            total_commission: client.totalCommission
          };

          switch (type) {
            case 'pension':
              details = {
                ...details,
                salary: client.details.pensionSalary,
                accumulation: client.details.pensionAccumulation,
                provision: client.details.pensionContribution
              };
              break;
            case 'insurance':
              details = {
                ...details,
                premium: client.details.insurancePremium,
                insurance_type: 'general',
                payment_method: 'monthly',
                nifraim: client.monthlyCommission
              };
              break;
            case 'investment':
              details = {
                ...details,
                investment_amount: client.details.investmentAmount,
                investment_period: 12,
                investment_type: 'savings'
              };
              break;
            case 'policy':
              details = {
                ...details,
                policy_amount: client.details.policyAmount,
                policy_period: 12,
                policy_type: 'savings'
              };
              break;
          }

          return {
            type,
            company: client.company,
            details
          };
        }),
        selected_companies: {
          pension: clients.filter(c => c.type === 'pension').map(c => c.company),
          insurance: clients.filter(c => c.type === 'insurance').map(c => c.company),
          investment: clients.filter(c => c.type === 'savings_and_study').map(c => c.company),
          policy: clients.filter(c => c.type === 'policy').map(c => c.company)
        },
        commission_details: calculateCommissionDetails(),
        total_commission: calculateTotalCommission(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await reportService.saveCustomerJourney(journey);
      
      // עדכון ביצועים לפי סוג המוצר
      for (const client of clients) {
        let amount = 0;
        let category = '';
        
        switch (client.type) {
          case 'pension':
            amount = client.details.pensionAccumulation || 0;
            category = 'pension-transfer';
            break;
          case 'insurance':
            amount = client.details.insurancePremium || 0;
            category = 'insurance-premium';
            break;
          case 'savings_and_study':
            amount = client.details.investmentAmount || 0;
            category = 'investment';
            break;
          case 'policy':
            amount = client.details.policyAmount || 0;
            category = 'policy';
            break;
        }
        
        if (amount > 0) {
          const currentDate = new Date();
          await updatePerformance(category, amount, {
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear()
          });
        }
      }

      toast.success('הנתונים נשלחו בהצלחה לדוחות');
      navigate('/reports');
    } catch (error) {
      console.error('שגיאה בשמירת מסע לקוח:', error);
      toast.error('שגיאה בשמירת הנתונים');
    }
  };

  const getCommissionLabel = (type: string, commissionType: 'scope' | 'monthly') => {
    if (type === 'pension') {
      return commissionType === 'scope' ? 'עמלת היקף על השכר' : 'עמלת הקף על צבירה';
    }
    return commissionType === 'scope' ? 'עמלת היקף' : 'עמלת נפרעים';
  };

  const handleClientInfoSubmit = (clientInfo: ClientInfo) => {
    setClientInfo(clientInfo);
    setClientName(clientInfo.fullName);
    setStep('journey');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {step === 'info' && (
        <ClientInfoForm onNext={handleClientInfoSubmit} />
      )}

      {step === 'journey' && (
        <>
          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-16 h-16 text-[#4361ee]" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">מסע לקוח חכם</h1>
              <p className="text-gray-500 mt-2">נהל את המוצרים והעמלות שלך בצורה חכמה ויעילה</p>
            </div>
          </div>

          <div className="flex gap-12">
            <Card className="flex-1 shadow-lg">
              <CardHeader className="bg-[#4361ee] text-white rounded-t-lg">
                <h2 className="text-2xl font-semibold text-center">בחירת מוצרים והזנת נתונים</h2>
                <p className="text-center text-sm opacity-90">בחר את המוצרים הרלוונטיים והזן את הנתונים</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <ProductCard
                      title="פנסיה"
                      icon={Building2}
                      selected={selectedProducts.pension}
                      onClick={() => handleProductSelect('pension')}
                    />
                    <ProductCard
                      title="סיכונים"
                      icon={Shield}
                      selected={selectedProducts.insurance}
                      onClick={() => handleProductSelect('insurance')}
                    />
                    <ProductCard
                      title="פמל והשתלמות"
                      icon={PiggyBank}
                      selected={selectedProducts.savings_and_study}
                      onClick={() => handleProductSelect('savings_and_study')}
                    />
                    <ProductCard
                      title="פוליסת חסכון"
                      icon={Wallet}
                      selected={selectedProducts.policy}
                      onClick={() => handleProductSelect('policy')}
                    />
                  </div>

                  {/* הצגת טפסי הזנ נתונים למוצרים שנבחרו */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { type: 'pension' as const, title: 'פנסיה' },
                        { type: 'insurance' as const, title: 'סיכונים' },
                        { type: 'savings_and_study' as const, title: 'גמל והשתלמות' },
                        { type: 'policy' as const, title: 'פוליסת חסכון' }
                      ].map(({ type, title }) => (
                        selectedProducts[type] && (
                          <Card key={type} className="border rounded-lg shadow-sm">
                            <CardHeader className="border-b bg-gray-50">
                              <div className="flex items-center gap-2">
                                <ProductIcon type={type} />
                                <h3 className="font-medium">{title}</h3>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4">
                              <CalculatorForm
                                onSubmit={(data) => handleSubmit(type, data)}
                                fields={getProductFields(type)}
                                title=""
                              />
                            </CardContent>
                          </Card>
                        )
                      ))}
                    </div>
                  </div>

                  {/* הצג סיכומים נתונים נוספים */}
                  {clients.length > 0 && (
                    <div className="space-y-6">
                      <Card className="border rounded-lg shadow-md">
                        <CardHeader className="border-b bg-gray-50">
                          <h3 className="font-medium">סיכום עמלות</h3>
                        </CardHeader>
                        <CardContent className="p-4 space-y-6">
                          {/* פנסיה */}
                          {clients.some(client => client.type === 'pension') && (
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-500" />
                                פנסיה
                              </h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">{getCommissionLabel('pension', 'scope')}</p>
                                  <p className="text-xl font-bold">₪{clients
                                    .filter(client => client.type === 'pension')
                                    .reduce((sum, client) => sum + client.scopeCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">{getCommissionLabel('pension', 'monthly')}</p>
                                  <p className="text-xl font-bold">₪{clients
                                    .filter(client => client.type === 'pension')
                                    .reduce((sum, client) => sum + client.monthlyCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">סה"כ</p>
                                  <p className="text-xl font-bold text-[#4361ee]">₪{clients
                                    .filter(client => client.type === 'pension')
                                    .reduce((sum, client) => sum + client.totalCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ביכונים */}
                          {clients.some(client => client.type === 'insurance') && (
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-500" />
                                ביכונים
                              </h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">{getCommissionLabel('insurance', 'scope')}</p>
                                  <p className="text-xl font-bold">₪{clients
                                    .filter(client => client.type === 'insurance')
                                    .reduce((sum, client) => sum + client.scopeCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">{getCommissionLabel('insurance', 'monthly')}</p>
                                  <p className="text-xl font-bold">₪{clients
                                    .filter(client => client.type === 'insurance')
                                    .reduce((sum, client) => sum + client.monthlyCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">סה"כ</p>
                                  <p className="text-xl font-bold text-[#4361ee]">₪{clients
                                    .filter(client => client.type === 'insurance')
                                    .reduce((sum, client) => sum + client.totalCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* חסכון ולימודים */}
                          {clients.some(client => client.type === 'savings_and_study') && (
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <PiggyBank className="w-4 h-4 text-purple-500" />
                                חסכון ולימודים
                              </h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">{getCommissionLabel('savings_and_study', 'scope')}</p>
                                  <p className="text-xl font-bold">₪{clients
                                    .filter(client => client.type === 'savings_and_study')
                                    .reduce((sum, client) => sum + client.scopeCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">{getCommissionLabel('savings_and_study', 'monthly')}</p>
                                  <p className="text-xl font-bold">₪{clients
                                    .filter(client => client.type === 'savings_and_study')
                                    .reduce((sum, client) => sum + client.monthlyCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">סה"כ</p>
                                  <p className="text-xl font-bold text-[#4361ee]">₪{clients
                                    .filter(client => client.type === 'savings_and_study')
                                    .reduce((sum, client) => sum + client.totalCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* פוליסה */}
                          {clients.some(client => client.type === 'policy') && (
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-orange-500" />
                                פוליסת חסכון
                              </h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">{getCommissionLabel('policy', 'scope')}</p>
                                  <p className="text-xl font-bold">₪{clients
                                    .filter(client => client.type === 'policy')
                                    .reduce((sum, client) => sum + client.scopeCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">{getCommissionLabel('policy', 'monthly')}</p>
                                  <p className="text-xl font-bold">₪{clients
                                    .filter(client => client.type === 'policy')
                                    .reduce((sum, client) => sum + client.monthlyCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">סה"כ</p>
                                  <p className="text-xl font-bold text-[#4361ee]">₪{clients
                                    .filter(client => client.type === 'policy')
                                    .reduce((sum, client) => sum + client.totalCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* סיכום ללי */}
                          <div className="mt-8 pt-6 border-t">
                            <h4 className="font-medium mb-3">סה"כ כללי</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-4 bg-[#4361ee] bg-opacity-5 rounded-lg">
                                <p className="text-sm text-gray-600">סה"כ עמלות היקף</p>
                                <p className="text-xl font-bold">₪{totalSummary.scopeCommission.toLocaleString()}</p>
                              </div>
                              <div className="p-4 bg-[#4361ee] bg-opacity-5 rounded-lg">
                                <p className="text-sm text-gray-600">סה"כ עמלות חודשיות</p>
                                <p className="text-xl font-bold">₪{totalSummary.monthlyCommission.toLocaleString()}</p>
                              </div>
                              <div className="p-4 bg-[#4361ee] bg-opacity-5 rounded-lg">
                                <p className="text-sm text-gray-600">סה"כ</p>
                                <p className="text-xl font-bold text-[#4361ee]">₪{totalSummary.totalCommission.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border rounded-lg shadow-md">
                        <CardHeader className="border-b bg-gray-50">
                          <h3 className="font-medium">פירוט מוצרים</h3>
                        </CardHeader>
                        <CardContent className="p-4">
                          <ResultsTable
                            data={clients}
                            columns={columns}
                            onDownload={handleDownload}
                            onClear={handleClear}
                            onShare={() => {}}
                          />
                        </CardContent>
                      </Card>

                      <div className="flex justify-end gap-4">
                        <Button 
                          onClick={handleDownload}
                          className="bg-white text-gray-700 border hover:bg-gray-50"
                        >
                          הורד דוח
                        </Button>
                        <Button 
                          onClick={handleSave}
                          className="bg-[#4361ee] hover:bg-[#3651d4] text-white"
                        >
                          שלח לדוחות
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="w-96 space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md">
                  <div className="mt-1 p-2 rounded-full bg-green-100">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">חישוב עמלות אוטומטי</h3>
                    <p className="text-gray-600">המערכת מחשבת אופן אוטומטי את העמלות המוצעות לך לפי סוגי המוצרים השונים</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md">
                  <div className="mt-1 p-2 rounded-full bg-blue-100">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">ניהול מוצרים מקדם</h3>
                    <p className="text-gray-600">ניהול קל ונוח של מגוון מוצרים: פנסיה, ביכונים, חסכון ופוליסת חסכון</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md">
                  <div className="mt-1 p-2 rounded-full bg-purple-100">
                    <PiggyBank className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">דוחות מפורטים</h3>
                    <p className="text-gray-600">הפקת דוחות מפורטים וייצוא נתונים למערכת הדוחות</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerJourneyComponent;
