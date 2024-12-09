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
  Brain,
  HeartHandshake,
  Coins,
  Check,
  Download,
  Save
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

interface PensionDetails {
  pensionSalary: number;
  pensionAccumulation: number;
  pensionContribution: number;
  activityType: 'transfer' | 'new_policy' | 'agent_appointment';
}

interface CustomerJourneyClient {
  id: string;
  date: string;
  name: string;
  company: string;
  type: 'pension' | 'insurance' | 'savings_and_study' | 'policy' | 'service' | 'finance';
  pensionType?: 'comprehensive' | 'supplementary';
  insuranceType?: string;
  productType?: 'managers' | 'gemel' | 'hishtalmut' | 'investment_gemel' | 'savings_policy';
  transactionType?: 'proposal' | 'agent_appointment';
  details: PensionDetails | any;  // We'll properly type this later
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
    case 'service':
      return <HeartHandshake className={cn(iconClass, "text-pink-500")} />;
    case 'finance':
      return <Coins className={cn(iconClass, "text-indigo-500")} />;
    default:
      return null;
  }
};

const ProductCard: React.FC<ProductCardProps> = ({ title, icon: Icon, selected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg",
        "flex flex-col items-center gap-3",
        selected ? "border-[#4361ee] bg-blue-50" : "border-gray-200 hover:border-[#4361ee]/50"
      )}
    >
      <div className={cn(
        "p-3 rounded-full",
        selected ? "bg-[#4361ee] text-white" : "bg-gray-100 text-gray-600"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="font-medium text-lg">{title}</span>
      {selected && (
        <div className="absolute top-2 right-2">
          <Check className="w-5 h-5 text-[#4361ee]" />
        </div>
      )}
    </div>
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

const insuranceTypeLabels = {
  personal_accident: 'תאונות אישיות',
  mortgage: 'משכנתא',
  health: 'בריאות',
  critical_illness: 'מחלות קשות',
  insurance_umbrella: 'מטריה ביטוחית',
  risk: 'ריסק',
  service: 'כתבי שירות',
  disability: 'אכע'
};

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
    service: boolean;
    finance: boolean;
  }>({
    pension: false,
    insurance: false,
    savings_and_study: false,
    policy: false,
    service: false,
    finance: false
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

  const handleProductSelect = useCallback((
    productType: 'pension' | 'insurance' | 'savings_and_study' | 'policy' | 'service' | 'finance'
  ) => {
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
    const companies = ['מגדל', 'מנורה', 'כלל', 'הראל', 'הפניקס'];
    const rates: { [company: string]: any } = {};
    
    for (const company of companies) {
      const companyRate = await getCompanyRates('pension', company);
      if (companyRate) {
        rates[company] = companyRate;
      }
    }
    
    setCompanyRates(rates);
  };

  const getProductFields = (type: 'pension' | 'insurance' | 'savings_and_study' | 'policy' | 'service' | 'finance') => {
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
            label: 'סוג פנסי',
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
              { value: 'אלטשולר שחם', label: 'אלטשולר ��חם' }
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
            label: 'צה', 
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
          },
          { 
            name: 'activityType',
            label: 'סוג פעילות',
            type: 'select',
            required: true,
            className: 'bg-white !important text-right pr-4',
            containerClassName: 'relative z-[996] bg-white select-container',
            popoverClassName: 'z-[996] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: 'transfer', label: 'ניוד' },
              { value: 'new_policy', label: 'פוליסה חדשה' },
              { value: 'agent_appointment', label: 'מינוי סוכן' }
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
              { value: 'insurance_umbrella', label: 'מטריה בטוחית' },
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
        return [
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
            name: 'transactionType',
            label: 'סוג עסקה',
            type: 'select',
            required: true,
            className: 'bg-white !important text-right pr-4',
            containerClassName: 'relative z-[998] bg-white select-container',
            popoverClassName: 'z-[998] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: 'proposal', label: 'הצעה' },
              { value: 'agent_appointment', label: 'מינוי סוכן' }
            ]
          },
          { 
            name: 'productType',
            label: 'בחירת מוצר',
            type: 'select',
            required: true,
            className: 'bg-white !important text-right pr-4',
            containerClassName: 'relative z-[997] bg-white select-container',
            popoverClassName: 'z-[997] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: 'managers', label: 'מנהלים' },
              { value: 'gemel', label: 'גמל' },
              { value: 'hishtalmut', label: 'השתלמות' },
              { value: 'investment_gemel', label: 'גמל להשקעה' },
              { value: 'savings_policy', label: 'פוליסת חסכון' }
            ]
          },
          { 
            name: 'investmentAmount', 
            label: 'סכום', 
            type: 'number', 
            required: true,
            className: 'bg-white text-right'
          }
        ];
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
      case 'service':
        return [
          { 
            name: 'serviceType',
            label: 'בחירת מוצר',
            type: 'select',
            required: true,
            className: 'bg-white !important text-right pr-4',
            containerClassName: 'relative z-[998] bg-white select-container',
            popoverClassName: 'z-[998] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: 'financial_planning', label: 'כנון פיננסי' },
              { value: 'family_economics', label: 'כלכלת המשפחה' },
              { value: 'career', label: 'קריירה' },
              { value: 'business_consulting', label: 'ייעוץ עסקי' },
              { value: 'retirement', label: 'פרישה' },
              { value: 'organizations', label: 'ארגונים' },
              { value: 'academia', label: 'אקדמיה' },
              { value: 'monthly_subscription', label: 'מנוי חודשי' }
            ]
          },
          { 
            name: 'serviceFee',
            label: 'מחיר',
            type: 'number',
            required: true,
            className: 'bg-white text-right'
          }
        ];
      case 'finance':
        return [
          { 
            name: 'financeType',
            label: 'בחירת מוצר',
            type: 'select',
            required: true,
            className: 'bg-white !important text-right pr-4',
            containerClassName: 'relative z-[998] bg-white select-container',
            popoverClassName: 'z-[998] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: 'loans', label: 'הלוואות' },
              { value: 'investments', label: 'השקעות' }
            ]
          },
          { 
            name: 'financeAmount',
            label: 'מחיר',
            type: 'number',
            required: true,
            className: 'bg-white text-right'
          }
        ];
      default:
        return baseFields;
    }
  };

  const handleSubmit = async (type: string, data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      let amount, insuranceTypeOrContribution, accumulation;
      
      if (type === 'pension') {
        amount = Number(data.pensionSalary);
        insuranceTypeOrContribution = String(data.pensionContribution);
        accumulation = Number(data.pensionAccumulation);
      } else if (type === 'insurance') {
        amount = Number(data.insurancePremium);
        insuranceTypeOrContribution = data.transactionType;
      } else {
        amount = Number(data.investmentAmount);
      }

      const result = await calculateCommissions(
        user.id,
        type,
        data.company,
        amount,
        insuranceTypeOrContribution,
        accumulation
      );

      if (result) {
        const newClient: CustomerJourneyClient = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          name: clientName,
          company: data.company || 'גולה',
          type,
          scopeCommission: result.scope_commission || 0,
          monthlyCommission: result.monthly_commission || 0,
          totalCommission: (result.scope_commission || 0) + (result.monthly_commission || 0),
          details: {} as any
        };

        switch (type) {
          case 'pension':
            newClient.pensionType = data.pensionType;
            newClient.details = {
              pensionSalary: Number(data.pensionSalary),
              pensionAccumulation: Number(data.pensionAccumulation),
              pensionContribution: Number(data.pensionContribution),
              activityType: data.activityType
            } as PensionDetails;
            break;
          case 'insurance':
            newClient.insuranceType = data.transactionType;
            newClient.details = {
              insurancePremium: Number(data.insurancePremium),
              insuranceType: data.transactionType
            };
            break;
          case 'savings_and_study':
            newClient.productType = data.productType;
            newClient.details = {
              investmentAmount: Number(data.investmentAmount),
              productType: data.productType,
              transactionType: data.transactionType
            };
            break;
          case 'policy':
            newClient.details = {
              policyAmount: Number(data.investmentAmount)
            };
            break;
          case 'service':
            newClient.details = {
              serviceFee: Number(data.serviceFee)
            };
            break;
          case 'finance':
            newClient.details = {
              financeAmount: Number(data.financeAmount)
            };
            break;
        }

        setClients([...clients, newClient]);
        toast.success('הנתונים נשמרו בהצלחה');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Error calculating commissions');
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

  const tableColumns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם לקוח' },
    { key: 'company', label: 'יצרן' },
    { key: 'type', label: 'סוג מסקה', format: (value: string) => {
      switch (value) {
        case 'pension': return 'פנסיה';
        case 'insurance': return 'סיכונים';
        case 'savings_and_study': return 'פיננסים';
        case 'policy': return 'פוליסה';
        case 'service': return 'שירות';
        default: return value || '-';
      }
    }},
    { 
      key: 'details', 
      label: 'סוג מוצר', 
      format: (value: any, row?: CustomerJourneyClient) => {
        if (!row) return '-';
        
        if (row.type === 'insurance' && row.details?.insuranceType) {
          return insuranceTypeLabels[row.details.insuranceType as keyof typeof insuranceTypeLabels] || row.details.insuranceType;
        }
        if (row.type === 'pension' && row.pensionType) {
          return row.pensionType === 'comprehensive' ? 'מקיפה' : 'משלימה';
        }
        if (row.type === 'savings_and_study' && row.productType) {
          switch (row.productType) {
            case 'managers':
              return 'ביטוח מנהלים';
            case 'gemel':
              return 'גמל';
            case 'hishtalmut':
              return 'השתלמות';
            case 'investment_gemel':
              return 'גמל להשקעה';
            case 'savings_policy':
              return 'פוליסת חיסכון';
            default:
              return row.productType;
          }
        }
        return '-';
      }
    },
    { key: 'scopeCommission', label: 'עמלת היקף', format: (value: number) => value ? `₪${value.toLocaleString()}` : '₪0'},
    { key: 'monthlyCommission', label: 'עמלה חודשית', format: (value: number) => value ? `₪${value.toLocaleString()}` : '₪0'},
    { key: 'totalCommission', label: 'סה"כ', format: (value: number) => value ? `₪${value.toLocaleString()}` : '₪0'},
    { key: 'actions', label: 'פעולות' }
  ];

  const columns = tableColumns;

  const handleDownload = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים להרדה');
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
      policy: false,
      service: false,
      finance: false
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

  const mapClientToJourneyProduct = (client: CustomerJourneyClient) => {
    let mappedType: 'pension' | 'insurance' | 'investment' | 'policy';
    let mappedDetails: PensionProduct | InsuranceProduct | InvestmentProduct | PolicyProduct;

    const baseDetails = {
      user_id: '',  // Will be filled by the service
      client_name: clientName,
      company: client.company,
      date: new Date().toISOString(),
      total_commission: client.totalCommission
    };

    switch (client.type) {
      case 'pension':
        mappedType = 'pension';
        mappedDetails = {
          ...baseDetails,
          pensionSalary: client.details.pensionSalary || 0,
          pensionAccumulation: client.details.pensionAccumulation || 0,
          pensionContribution: client.details.pensionContribution || 0,
          activityType: (client.details.activityType as 'transfer' | 'new_policy' | 'agent_appointment') || 'new_policy'
        } as PensionProduct;
        break;

      case 'insurance':
        mappedType = 'insurance';
        mappedDetails = {
          ...baseDetails,
          premium: client.details.insurancePremium || 0,
          insurance_type: client.insuranceType || 'general',
          payment_method: 'monthly',
          nifraim: client.monthlyCommission,
          scope_commission: client.scopeCommission,
          monthly_commission: client.monthlyCommission
        } as InsuranceProduct;
        break;

      case 'savings_and_study':
        mappedType = 'investment';
        mappedDetails = {
          ...baseDetails,
          investment_amount: client.details.investmentAmount || 0,
          investment_period: 12,
          investment_type: client.details.productType || 'general',
          scope_commission: client.scopeCommission,
          nifraim: client.monthlyCommission
        } as InvestmentProduct;
        break;

      case 'policy':
        mappedType = 'policy';
        mappedDetails = {
          ...baseDetails,
          policy_amount: client.details.policyAmount || 0,
          policy_period: 12,
          policy_type: 'savings',
          scope_commission: client.scopeCommission
        } as PolicyProduct;
        break;

      default:
        return null;
    }

    return {
      type: mappedType,
      company: client.company,
      details: mappedDetails
    };
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא נמצא משתמש מחובר');

      // עדכון ביצועים לפי סוג המוצר
      const currentDate = new Date();
      const date = {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      };

      // קודם נעדכן את היעדים
      for (const client of clients) {
        let amount = 0;
        let category = '';
        
        switch (client.type) {
          case 'pension':
            amount = client.details.pensionAccumulation || 0;
            category = client.details.activityType === 'transfer' ? 'pension-transfer' : 'pension-new';
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
          console.log('Updating performance:', { category, amount, date });
          await updatePerformance(category, amount, date);
        }
      }

      // אחר כך נשמור את המסע לקוח
      const mappedProducts = clients
        .map(mapClientToJourneyProduct)
        .filter((product): product is NonNullable<typeof product> => product !== null);

      const journey: CustomerJourney = {
        id: crypto.randomUUID(),
        user_id: user.id,
        journey_date: new Date().toISOString(),
        date: new Date().toISOString(),
        client_name: clientName,
        selected_products: mappedProducts,
        total_commission: calculateTotalCommission()
      };

      console.log('Saving journey:', journey);
      await reportService.saveCustomerJourney(journey);

      toast.success('הנתונים נשלחו בהצלחה לדוחות');
      navigate('/reports');
    } catch (error) {
      console.error('שגיאה בשמירת מסע לקוח:', error);
      toast.error('שגיאה בשמירת הנתונים');
    }
  };

  const getCommissionLabel = (type: string, commissionType: 'scope' | 'monthly') => {
    if (type === 'pension') {
      return commissionType === 'scope' ? 'עמלת היקף על השכר' : 'עמלת היקף על בירה';
    }
    return commissionType === 'scope' ? 'עמלת היקף' : 'עמלת נפרעים';
  };

  const handleClientInfoSubmit = (clientInfo: ClientInfo) => {
    setClientInfo(clientInfo);
    setClientName(clientInfo.fullName);
    setStep('journey');
  };

  const getProductTypeLabel = (value: string) => {
    switch (value) {
      case 'pension': return 'פנסיה';
      case 'insurance': return 'סיכונים';
      case 'savings_and_study': return 'פיננסים';
      case 'policy': return 'פוליסת חסכון';
      default: return value;
    }
  };

  const productTypes = [
    { type: 'pension', title: 'פנסיה' },
    { type: 'insurance', title: 'סיכונים' },
    { type: 'savings_and_study', title: 'פיננסים' },
    { type: 'policy', title: 'פוליסת חסכון' },
    { type: 'service', title: 'גולה- שירות' },
    { type: 'finance', title: 'גולה- פיננסים' }
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pension': return 'פנסיה';
      case 'insurance': return 'סיכונים';
      case 'savings_and_study': return 'פיננסים';
      case 'policy': return 'פוליסת חסכון';
      case 'service': return 'גולה- שירות';
      case 'finance': return 'גולה- פיננסים';
      default: return type;
    }
  };

  const generateReport = (clients: CustomerJourneyClient[]) => {
    let message = 'דוח מסע לקוח\n\n';
    
    clients.forEach((client, index) => {
      message += `${index + 1}. ${client.name} (${client.company}):\n`;
      message += `   תאריך: ${new Date(client.date).toLocaleDateString('he-IL')}\n`;
      
      switch (client.type) {
        case 'pension':
          message += `   סוג מוצר: פנסיה ${client.pensionType === 'comprehensive' ? 'מקיפה' : 'משלימה'}\n`;
          message += `   שכר: ${Number(client.details.pensionSalary).toLocaleString()}₪\n`;
          message += `   צבירה: ${Number(client.details.pensionAccumulation).toLocaleString()}₪\n`;
          break;
        case 'insurance':
          message += `   סוג מוצר: ${insuranceTypeLabels[client.details.insuranceType as keyof typeof insuranceTypeLabels]}\n`;
          message += `   פרמיה חודשית: ${Number(client.details.insurancePremium).toLocaleString()}₪\n`;
          break;
        // ... rest of the cases ...
      }
      
      message += `   עמלת היקף: ${client.scopeCommission.toLocaleString()}₪\n`;
      message += `   עמלה חודשית: ${client.monthlyCommission.toLocaleString()}₪\n\n`;
    });

    return message;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {step === 'info' && (
        <ClientInfoForm onNext={handleClientInfoSubmit} />
      )}

      {step === 'journey' && (
        <>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-4 rounded-full bg-blue-100">
              <Brain className="w-12 h-12 text-[#4361ee]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">מסע לקוח חכם</h1>
              <p className="text-gray-500 mt-1">הל את המוצרים והעמלות שלך בצרה חכמה ויעילה</p>
            </div>
          </div>

          <div className="flex gap-8">
            <Card className="flex-1 border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-l from-[#4361ee] to-[#3651d4] text-white rounded-t-xl">
                <h2 className="text-xl font-semibold">בחירת מוצרים והזנת נתונם</h2>
                <p className="text-sm opacity-90">בחר את המוצרים הרלוויים והזן את הנתונים</p>
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
                      title="פיננסים"
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
                    <ProductCard
                      title="גולה- ש��רות"
                      icon={HeartHandshake}
                      selected={selectedProducts.service}
                      onClick={() => handleProductSelect('service')}
                    />
                    <ProductCard
                      title="גולה- פיננסים"
                      icon={Coins}
                      selected={selectedProducts.finance}
                      onClick={() => handleProductSelect('finance')}
                    />
                  </div>

                  {/* הצגת טפסי הזנ נתונים למוצרים שנבחרו */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      {productTypes.map(({ type, title }) => (
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
                      <Card className="border-0 shadow-lg">
                        <CardHeader className="border-b bg-gradient-to-l from-[#4361ee] to-[#3651d4] text-white rounded-t-xl">
                          <h3 className="text-xl font-semibold">סיכום עמלות</h3>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                          {/* פנסיה */}
                          {clients.some(client => client.type === 'pension') && (
                            <div>
                              <h4 className="font-medium mb-4 flex items-center gap-2 text-gray-900">
                                <Building2 className="w-5 h-5 text-blue-500" />
                                פנסיה
                              </h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                  <p className="text-sm text-gray-600 mb-1">{getCommissionLabel('pension', 'scope')}</p>
                                  <p className="text-xl font-bold text-gray-900">₪{clients
                                    .filter(client => client.type === 'pension')
                                    .reduce((sum, client) => sum + client.scopeCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                  <p className="text-sm text-gray-600 mb-1">{getCommissionLabel('pension', 'monthly')}</p>
                                  <p className="text-xl font-bold text-gray-900">₪{clients
                                    .filter(client => client.type === 'pension')
                                    .reduce((sum, client) => sum + client.monthlyCommission, 0)
                                    .toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-[#4361ee] rounded-xl text-white">
                                  <p className="text-sm opacity-90 mb-1">סה"כ</p>
                                  <p className="text-xl font-bold">₪{clients
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
                                סיכונים
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

                          {/* חיננסים */}
                          {clients.some(client => client.type === 'savings_and_study') && (
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <PiggyBank className="w-4 h-4 text-purple-500" />
                                פיננסים
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

                          {/* סה"כ ללי */}
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

                      <Card className="border-0 shadow-lg">
                        <CardHeader className="border-b bg-gradient-to-l from-[#4361ee] to-[#3651d4] text-white rounded-t-xl">
                          <h3 className="text-xl font-semibold">פירוט מוצרים</h3>
                        </CardHeader>
                        <CardContent className="p-6">
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
                          variant="outline"
                          className="bg-white hover:bg-gray-50 border-2 border-gray-200"
                        >
                          <Download className="w-4 h-4 ml-2" />
                          הורד דוח
                        </Button>
                        <Button 
                          onClick={handleSave}
                          className="bg-gradient-to-l from-[#4361ee] to-[#3651d4] hover:opacity-90 text-white"
                        >
                          <Save className="w-4 h-4 ml-2" />
                          שלח לדוחות
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="w-96 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="mt-1 p-2 rounded-full bg-green-100">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">חישוב עמלות אוטומטי</h3>
                    <p className="text-gray-500 text-sm">המערכת מחשבת באופן אוטומטי את העמלות המוצעות לך לפי סוגי המוצרים השונים</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="mt-1 p-2 rounded-full bg-blue-100">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">ניהול מוצרים מתקדם</h3>
                    <p className="text-gray-500 text-sm">ניהול וטיפול במגוון מוצרים: פנסיה, ביטוחים, חיסכון ופוליסות</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="mt-1 p-2 rounded-full bg-purple-100">
                    <PiggyBank className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">דוחות מפורטים</h3>
                    <p className="text-gray-500 text-sm">הפקת דוחות מפורטים וייצוא נתונים למערכת הדוחות</p>
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
