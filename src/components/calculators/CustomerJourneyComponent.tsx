import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ResultsTable from './ResultsTable';
import { calculateCommissions, getCompanyRates } from '@/services/AgentAgreementService';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { 
  Building2, 
  Shield,
  Wallet,
  HeartHandshake,
  Coins,
  Download,
  Save,
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { CustomerJourney, PensionProduct as ImportedPensionProduct, InsuranceProduct as ImportedInsuranceProduct, InvestmentProduct as ImportedInvestmentProduct, PolicyProduct as ImportedPolicyProduct, CommissionDetails, CustomerJourneyClient } from './CustomerJourneyTypes';

const productTypes = [
  { type: 'pension' as const, title: 'פנסיה' },
  { type: 'insurance' as const, title: 'סיכונים' },
  { type: 'savings_and_study' as const, title: 'פיננסים' },
  { type: 'service' as const, title: 'גולה- שירות' },
  { type: 'finance' as const, title: 'גולה- פיננסים' }
] as const;

function isPensionProduct(details: any): details is ImportedPensionProduct {
  return details && 'salary' in details && 'accumulation' in details && 'provision' in details;
}

function isInsuranceProduct(details: any): details is ImportedInsuranceProduct {
  return details && 'premium' in details && 'insurance_type' in details;
}

function isInvestmentProduct(details: any): details is ImportedInvestmentProduct {
  return details && 'investment_amount' in details && 'investment_type' in details;
}

function isPolicyProduct(details: any): details is ImportedPolicyProduct {
  return details && 'policy_amount' in details && 'policy_type' in details;
}

interface ClientInfo {
  fullName: string;
}

const ProductIcon = ({ type, className }: { type: string; className?: string }) => {
  const iconClass = cn("w-6 h-6", className);
  switch (type) {
    case 'pension':
      return <Building2 className={cn(iconClass, "text-blue-500")} />;
    case 'insurance':
      return <Shield className={cn(iconClass, "text-green-500")} />;
    case 'savings_and_study':
      return <Coins className={cn(iconClass, "text-purple-500")} />;
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

const insuranceTypeLabels: { [key: string]: string } = {
  personal_accident: 'תאונות אישיות',
  mortgage: 'משכנתא',
  health: 'בריאות',
  // Add other insurance type labels as needed
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Field {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  className?: string;
  options?: Array<{ value: string; label: string }>;
  popoverClassName?: string;
  optionClassName?: string;
}

interface CalculatorFormProps {
  onSubmit: (data: any) => void;
  fields: Field[];
  type: ProductType;
  className?: string;
}

const CalculatorFormComponent: React.FC<CalculatorFormProps> = ({ onSubmit, fields, type, className }) => {
  return (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data: { [key: string]: string } = {};
      fields.forEach(field => {
        const value = formData.get(field.name);
        if (value) {
          data[field.name] = value.toString();
        }
      });
      onSubmit({ ...data, type });
    }} className={className}>
      <div className="flex flex-row gap-4 items-start">
        {fields.map((field, index) => (
          <div key={index} className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <Select name={field.name} required={field.required}>
                <SelectTrigger className={cn(
                  "w-full rounded-md border border-gray-300 bg-white",
                  "text-gray-900 shadow-sm focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee]",
                  field.className
                )}>
                  <SelectValue placeholder={`בחר ${field.label}`} />
                </SelectTrigger>
                <SelectContent className={field.popoverClassName}>
                  {field.options?.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={field.optionClassName}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={field.type}
                name={field.name}
                className={field.className}
                required={field.required}
              />
            )}
          </div>
        ))}
        <Button 
          type="submit" 
          className="mt-6 bg-gradient-to-r from-[#4361ee] to-[#3651d4] text-white"
        >
          שמור
        </Button>
      </div>
    </form>
  );
};

type ProductType = 'pension' | 'insurance' | 'savings_and_study' | 'service' | 'finance';

type SelectedProducts = Record<ProductType, boolean>;

const CustomerJourneyComponent: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<CustomerJourneyClient[]>([]);
  const [clientName, setClientName] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProducts>({
    pension: false,
    insurance: false,
    savings_and_study: false,
    service: false,
    finance: false
  });
  const { updatePerformance } = useSalesTargets();
  const [step, setStep] = useState<'info' | 'journey'>('info');

  const [_clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [companyRates, setCompanyRates] = useState<Record<string, any>>({});

  const totalSummary = {
    scopeCommission: clients.reduce((sum, client) => sum + client.scopeCommission, 0),
    monthlyCommission: clients.reduce((sum, client) => sum + client.monthlyCommission, 0),
    totalCommission: clients.reduce((sum, client) => sum + client.totalCommission, 0)
  };

  const handleDownload = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים להורדה');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "ריך,שם הלקוח,חברה,סוג מוצר,עמלת היקף,עמלת נפרעים,סה\"כ\n";
    
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
    setSelectedProducts({
      pension: false,
      insurance: false,
      savings_and_study: false,
      service: false,
      finance: false
    });
  };

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם לקוח' },
    { key: 'company', label: 'יצרן' },
    { key: 'type', label: 'סוג עסקה', format: (type: string) => {
      switch (type) {
        case 'pension': return 'פנסיה';
        case 'insurance': return 'סיכונים';
        case 'savings_and_study': return 'פיננסים';
        case 'service': return 'שירות';
        case 'finance': return 'פיננסים';
        default: return type || '-';
      }
    }},
    { 
      key: 'details', 
      label: 'סוג מוצר', 
      format: (_: any, row?: CustomerJourneyClient) => {
        if (!row) return '-';
        
        if (row.type === 'insurance' && row.insuranceType) {
          return insuranceTypeLabels[row.insuranceType as keyof typeof insuranceTypeLabels] || row.insuranceType;
        }
        if (row.type === 'pension' && row.pensionType) {
          return row.pensionType === 'comprehensive' ? 'מקיפה' : 'משלימה';
        }
        if (row.type === 'savings_and_study' && row.productType) {
          switch (row.productType) {
            case 'managers': return 'ביטוח מנהלים';
            case 'gemel': return 'גמל';
            case 'hishtalmut': return 'השתלמות';
            case 'investment_gemel': return 'גמל להשקעה';
            case 'savings_policy': return 'פוליסת חסכון';
            default: return row.productType;
          }
        }
        return '-';
      }
    },
    { key: 'scopeCommission', label: 'עמלת היקף', format: (value: number) => value ? `₪${value.toLocaleString()}` : '₪0'},
    { key: 'monthlyCommission', label: 'עמלה נפרעים', format: (value: number) => value ? `₪${value.toLocaleString()}` : '₪0'},
    { key: 'totalCommission', label: 'סה"כ', format: (value: number) => value ? `₪${value.toLocaleString()}` : '₪0'},
    { key: 'actions', label: 'פעולות' }
  ];

  useEffect(() => {
    loadCompanyRates();
    const subscription = supabase.channel('agent_commission_rates_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'agent_commission_rates' }, () => loadCompanyRates()).subscribe();
    return () => { subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (step === 'journey' && !Object.values(selectedProducts).some(Boolean)) {
      toast.error('חובה לבחור לפחות מוצר אחד');
    }
  }, [selectedProducts, step]);

  const handleProductSelect = useCallback((productType: ProductType) => {
    setSelectedProducts(prev => {
      const newState = {
        ...prev,
        [productType]: !prev[productType]
      };
      
      if (!Object.values(newState).some(Boolean)) {
        toast.error('חוב לבחור לפחות מוצר אחד');
        return prev;
      }
      
      return newState;
    });
  }, []);

  const loadCompanyRates = async () => {
    try {
      const rates: Record<string, any> = {};
      const pensionCompanies = ['מגדל', 'מנורה', 'כלל', 'הראל', 'הפניקס', 'מיטב', 'אלטשולר שחם', 'מור'];
      const insuranceCompanies = ['מגדל', 'מנורה', 'כלל', 'הראל', 'הפניקס', 'הכשרה'];
      const financialCompanies = ['מגדל', 'מנורה', 'כלל', 'הראל', 'הפניקס', 'מיטב', 'אלטשולר שחם', 'מור', 'אנליסט'];
      const categories = ['pension', 'insurance', 'savings_and_study'];
      
      for (const category of categories) {
        rates[category] = {};
        const companies = category === 'pension' ? pensionCompanies : 
                         category === 'insurance' ? insuranceCompanies :
                         category === 'savings_and_study' ? financialCompanies :
                         pensionCompanies; // default to pension companies for other types
        
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
    }
  };

  const getProductFields = (type: 'pension' | 'insurance' | 'savings_and_study' | 'policy' | 'service' | 'finance') => {
    const getPensionCompanies = () => [
      { value: 'מגדל', label: 'מגדל' },
      { value: 'מנורה', label: 'מנורה' },
      { value: 'כלל', label: 'כלל' },
      { value: 'הראל', label: 'הראל' },
      { value: 'הפניקס', label: 'הפניקס' },
      { value: 'מיטב', label: 'מיטב' },
      { value: 'אלטשולר שחם', label: 'אלטשולר שחם' },
      { value: 'מור', label: 'מור' }
    ];

    const getInsuranceCompanies = () => [
      { value: 'מגדל', label: 'מגדל' },
      { value: 'מנורה', label: 'מנורה' },
      { value: 'כלל', label: 'כלל' },
      { value: 'הראל', label: 'הראל' },
      { value: 'הפניקס', label: 'הפניקס' },
      { value: 'הכשרה', label: 'הכשרה' }
    ];

    const getFinancialCompanies = () => [
      { value: 'מגדל', label: 'מגדל' },
      { value: 'מנורה', label: 'מנורה' },
      { value: 'כלל', label: 'כלל' },
      { value: 'הראל', label: 'הראל' },
      { value: 'הפניקס', label: 'הפניקס' },
      { value: 'מיטב', label: 'מיטב' },
      { value: 'אלטשולר שחם', label: 'אלטשולר שחם' },
      { value: 'מור', label: 'מור' },
      { value: 'אנליסט', label: 'אנליסט' }
    ];

    const baseFields = [
      { 
        name: 'company',
        label: 'חברה',
        type: 'select',
        required: true,
        className: 'bg-white !important text-right pr-4',
        containerClassName: 'relative z-[999] bg-white select-container',
        popoverClassName: 'z-[999] bg-white text-right',
        listboxClassName: 'bg-white text-right',
        optionClassName: 'bg-white hover:bg-gray-100 text-right',
        options: type === 'pension' ? getPensionCompanies() : 
                type === 'insurance' ? getInsuranceCompanies() :
                type === 'savings_and_study' ? getFinancialCompanies() :
                getPensionCompanies() // default to pension companies for other types
      }
    ];

    switch (type) {
      case 'pension':
        return [
          ...baseFields,
          { 
            name: 'salary',
            label: 'שכר',
            type: 'number',
            required: true,
            className: 'bg-white text-right'
          },
          { 
            name: 'totalAccumulated',
            label: 'צבירה',
            type: 'number',
            required: false,
            className: 'bg-white text-right'
          },
          { 
            name: 'pensionContribution',
            label: 'אחוז הפרשה',
            type: 'select',
            required: true,
            className: 'bg-white !important text-right pr-4',
            containerClassName: 'relative z-[998] bg-white select-container',
            popoverClassName: 'z-[998] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: '18.5', label: '18.5%' },
              { value: '19.5', label: '19.5%' },
              { value: '20.83', label: '20.83%' },
              { value: '21.83', label: '21.83%' },
              { value: '22.83', label: '22.83%' }
            ],
            defaultValue: '20.83'
          },
          { 
            name: 'pensionType',
            label: 'סוג פנסיה',
            type: 'select',
            required: true,
            className: 'bg-white !important text-right pr-4',
            containerClassName: 'relative z-[997] bg-white select-container',
            popoverClassName: 'z-[997] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: 'comprehensive', label: 'מקיפה' },
              { value: 'supplementary', label: 'משלימה' }
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
              { value: 'service', label: 'כתבי שרות' },
              { value: 'disability', label: 'אכל' }
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
          ...baseFields,
          { 
            name: 'productType',
            label: 'סוג מוצר',
            type: 'select',
            required: true,
            className: 'bg-white !important text-right pr-4',
            containerClassName: 'relative z-[997] bg-white select-container',
            popoverClassName: 'z-[997] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: 'hishtalmut', label: 'קרן השתלמות' },
              { value: 'investment_gemel', label: 'קופת גמל להשקעה' },
              { value: 'gemel', label: 'קופת גמל' },
              { value: 'managers', label: 'ביטוח מנהלים' },
              { value: 'savings_policy', label: 'פוליסת חסכון' }
            ]
          },
          { 
            name: 'investmentAmount', 
            label: 'סכום השקעה', 
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
              { value: 'financial_planning', label: 'כנון פננסי' },
              { value: 'family_economics', label: 'כלכלת המפחה' },
              { value: 'career', label: 'קריירה' },
              { value: 'business_consulting', label: 'ייעוץ עסקי' },
              { value: 'retirement', label: 'פרישה' },
              { value: 'organizations', label: 'ארגונים' },
              { value: 'academia', label: 'אקדמיה' },
              { value: 'monthly_subscription', label: 'מי חודשי' }
            ]
          },
          { 
            name: 'serviceFee',
            label: 'מיר',
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
              { value: 'loans', label: 'הלואות' },
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

  const handleSubmit = async (formData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('משתמש לא מחובר');
        return;
      }

      const rates = companyRates[formData.type]?.[formData.company];
      if (!rates?.active) {
        toast.error('החברה לא פעילה או לא נמצאו נתונים');
        return;
      }

      let amount = 0;
      if (formData.type === 'pension') {
        amount = Number(formData.salary) || 0;
      } else if (formData.type === 'insurance') {
        amount = Number(formData.insurancePremium) || 0;
      } else if (formData.type === 'savings_and_study') {
        amount = Number(formData.investmentAmount) || 0;
      }

      console.log('Submitting form data:', { ...formData, amount });

      const result = await calculateCommissions(
        user.id,
        formData.type,
        formData.company,
        amount,
        formData.type === 'insurance' ? formData.transactionType : 
        formData.type === 'pension' ? formData.pensionContribution : 
        formData.type === 'savings_and_study' ? formData.productType : undefined,
        formData.totalAccumulated ? Number(formData.totalAccumulated) : undefined
      );

      console.log('Calculation result:', result);

      if (result) {
        const newClient: CustomerJourneyClient = {
          type: formData.type,
          date: new Date().toISOString(),
          name: clientName,
          company: formData.company,
          scopeCommission: result.scope_commission || 0,
          monthlyCommission: result.monthly_commission || 0,
          totalCommission: result.total_commission || 0
        };

        if (formData.type === 'pension') {
          newClient.pensionType = formData.pensionType;
          newClient.pensionContribution = formData.pensionContribution;
        } else if (formData.type === 'insurance') {
          newClient.insuranceType = formData.transactionType;
        } else if (formData.type === 'savings_and_study') {
          newClient.productType = formData.productType;
        }

        setClients([...clients, newClient]);
        toast.success('הנתונים נשמרו בהצלחה');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('שגיאה בשמירת הנתונים');
    }
  };

  const calculateCommissionDetails = (clients: CustomerJourneyClient[]): CommissionDetails => {
    const details: CommissionDetails = {
      pension: { companies: {}, total: 0 },
      insurance: { companies: {}, total: 0 },
      investment: { companies: {}, total: 0 },
      policy: { companies: {}, total: 0 }
    };

    for (const client of clients) {
      const type = client.type === 'savings_and_study' ? 'investment' : client.type;
      if (!client.company || !['pension', 'insurance', 'investment', 'policy'].includes(type)) continue;
      
      switch (type) {
        case 'pension':
          if (!details.pension.companies[client.company]) {
            details.pension.companies[client.company] = {
              scopeCommission: 0,
              monthlyCommission: 0,
              totalCommission: 0
            };
          }
          details.pension.companies[client.company].scopeCommission += client.scopeCommission;
          details.pension.companies[client.company].monthlyCommission += client.monthlyCommission;
          details.pension.companies[client.company].totalCommission += client.totalCommission;
          details.pension.total += client.totalCommission;
          break;

        case 'insurance':
          if (!details.insurance.companies[client.company]) {
            details.insurance.companies[client.company] = {
              nifraim: 0,
              scopeCommission: 0,
              monthlyCommission: 0,
              totalCommission: 0
            };
          }
          details.insurance.companies[client.company].scopeCommission += client.scopeCommission;
          details.insurance.companies[client.company].monthlyCommission += client.monthlyCommission;
          details.insurance.companies[client.company].nifraim += client.monthlyCommission;
          details.insurance.companies[client.company].totalCommission += client.totalCommission;
          details.insurance.total += client.totalCommission;
          break;

        case 'investment':
          if (!details.investment.companies[client.company]) {
            details.investment.companies[client.company] = {
              scope_commission: 0,
              nifraim: 0,
              total_commission: 0
            };
          }
          details.investment.companies[client.company].scope_commission += client.scopeCommission;
          details.investment.companies[client.company].nifraim += client.monthlyCommission;
          details.investment.companies[client.company].total_commission += client.totalCommission;
          details.investment.total += client.totalCommission;
          break;

        case 'policy':
          if (!details.policy.companies[client.company]) {
            details.policy.companies[client.company] = {
              scopeCommission: 0,
              totalCommission: 0
            };
          }
          details.policy.companies[client.company].scopeCommission += client.scopeCommission;
          details.policy.companies[client.company].totalCommission += client.totalCommission;
          details.policy.total += client.totalCommission;
          break;
      }
    }

    return details;
  };

  const calculateTotalCommission = () => {
    return clients.reduce((total, client) => total + client.totalCommission, 0);
  };

  const mapClientToJourneyProduct = (client: CustomerJourneyClient) => {
    if (!client.company || !client.details) return null;

    const baseDetails = {
      user_id: '',  // Will be filled by the service
      client_name: clientName,
      company: client.company,
      date: new Date().toISOString(),
      total_commission: client.totalCommission,
      scope_commission: client.scopeCommission,
      monthly_commission: client.monthlyCommission
    };

    switch (client.type) {
      case 'pension':
        if (isPensionProduct(client.details)) {
          const mappedDetails: ImportedPensionProduct = {
            ...baseDetails,
            pensionSalary: client.details.pensionSalary || 0,
            pensionAccumulation: client.details.pensionAccumulation || 0,
            pensionContribution: client.details.pensionContribution || 0,
            activityType: client.details.activityType || 'new_policy'
          };
          return {
            type: 'pension' as const,
            company: client.company,
            details: mappedDetails
          };
        }
        break;

      case 'insurance':
        if (isInsuranceProduct(client.details)) {
          const mappedDetails: ImportedInsuranceProduct = {
            ...baseDetails,
            premium: client.details.premium || 0,
            insurance_type: client.insuranceType || 'general',
            payment_method: 'monthly',
            nifraim: client.monthlyCommission
          };
          return {
            type: 'insurance' as const,
            company: client.company,
            details: mappedDetails
          };
        }
        break;

      case 'savings_and_study':
        if (isInvestmentProduct(client.details)) {
          const mappedDetails: ImportedInvestmentProduct = {
            ...baseDetails,
            investment_amount: client.details.investment_amount || 0,
            investment_period: 12,
            investment_type: client.details.investment_type || 'general',
            nifraim: 0
          };
          return {
            type: 'investment' as const,
            company: client.company,
            details: mappedDetails
          };
        }
        break;

      case 'policy':
        if (isPolicyProduct(client.details)) {
          const mappedDetails: ImportedPolicyProduct = {
            ...baseDetails,
            policy_amount: client.details.policy_amount || 0,
            policy_period: 12,
            policy_type: 'savings'
          };
          return {
            type: 'policy' as const,
            company: client.company,
            details: mappedDetails
          };
        }
        break;
    }

    return null;
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא נמצא משתמש מחובר');

      const currentDate = new Date();
      const date = {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      };

      for (const client of clients) {
        if (!client.details) continue;

        let amount = 0;
        let category = '';
        
        switch (client.type) {
          case 'pension':
            if (isPensionProduct(client.details)) {
              amount = client.details.pensionAccumulation || 0;
              category = client.details.activityType === 'transfer' ? 'pension-transfer' : 'pension-new';
            }
            break;
          case 'insurance':
            if (isInsuranceProduct(client.details)) {
              amount = client.details.premium || 0;
              category = 'insurance-premium';
            }
            break;
          case 'savings_and_study':
            if (isInvestmentProduct(client.details)) {
              amount = client.details.investment_amount || 0;
              category = 'investment';
            }
            break;
          case 'policy':
            if (isPolicyProduct(client.details)) {
              amount = client.details.policy_amount || 0;
              category = 'policy';
            }
            break;
        }
        
        if (amount > 0) {
          console.log('Updating performance:', { category, amount, date });
          await updatePerformance(category, amount, date);
        }
      }

      const mappedProducts = clients
        .map(mapClientToJourneyProduct)
        .filter((product): product is NonNullable<typeof product> => product !== null)
        .map(product => ({
          ...product,
          details: {
            ...product.details,
            user_id: user.id
          }
        }));

      const commissionDetails = calculateCommissionDetails(clients);

      const journey: CustomerJourney = {
        id: crypto.randomUUID(),
        user_id: user.id,
        journey_date: new Date().toISOString(),
        date: new Date().toISOString(),
        client_name: clientName,
        selected_products: mappedProducts,
        total_commission: calculateTotalCommission(),
        commissionDetails,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6"
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {step === 'info' && (
        <ClientInfoForm onNext={handleClientInfoSubmit} />
      )}

      {step === 'journey' && (
        <motion.div variants={staggerContainer}>
          <motion.div 
            className="flex items-center gap-3 mb-8"
            variants={fadeIn}
          >
            <div className="p-4 rounded-full bg-gradient-to-br from-[#4361ee] to-[#3651d4]">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4361ee] to-[#3651d4] text-transparent bg-clip-text">
                סע לקוח חכם
              </h1>
              <p className="text-gray-500 mt-1">נהל את המוצרים והעמלות שלך בצורה חכמה ויעילה</p>
            </div>
          </motion.div>

          <motion.div 
            className="space-y-8"
            variants={fadeIn}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-l from-[#4361ee] to-[#3651d4] text-white rounded-t-xl">
                <h2 className="text-xl font-semibold">בחירת מוצרים</h2>
                <p className="text-sm opacity-90">בחר את המוצרים הרלוונטיים</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-3 gap-4">
                  {productTypes.map(({ type, title }) => (
                    <motion.div
                      key={type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={cn(
                          "p-4 rounded-xl cursor-pointer transition-all",
                          "border-2 hover:shadow-lg",
                          "flex items-center gap-3",
                          selectedProducts[type] 
                            ? "border-[#4361ee] bg-blue-50" 
                            : "border-gray-200 hover:border-[#4361ee]/50"
                        )}
                        onClick={() => handleProductSelect(type)}
                      >
                        <div className="p-2 rounded-full bg-gradient-to-br from-[#4361ee] to-[#3651d4]">
                          <ProductIcon type={type} className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-medium">{title}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* הצגת טפי הנתונים למוצרים שנבחרו */}
            <div className="space-y-6">
              {productTypes.map(({ type, title }) => (
                selectedProducts[type] && (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full"
                  >
                    <Card className="border rounded-lg shadow-lg hover:shadow-xl transition-all">
                      <CardHeader className="border-b bg-gradient-to-l from-gray-50 to-white">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-gradient-to-br from-[#4361ee] to-[#3651d4]">
                            <ProductIcon type={type} className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-medium text-lg">{title}</h3>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <CalculatorFormComponent
                          onSubmit={(data) => handleSubmit({ ...data, type })}
                          fields={getProductFields(type)}
                          type={type}
                          className="w-full"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              ))}
            </div>

            {/* הצגת תוצאות החישוב */}
            {clients.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader className="border-b bg-gradient-to-l from-[#4361ee] to-[#3651d4] text-white rounded-t-xl">
                    <h3 className="text-xl font-semibold">יכום עמלות</h3>
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

                    {/* סיכונים */}
                    {clients.some(client => client.type === 'insurance') && (
                      <div>
                        <h4 className="font-medium mb-4 flex items-center gap-2 text-gray-900">
                          <Shield className="w-5 h-5 text-green-500" />
                          סיכונים
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                            <p className="text-sm text-gray-600 mb-1">{getCommissionLabel('insurance', 'scope')}</p>
                            <p className="text-xl font-bold text-gray-900">₪{clients
                              .filter(client => client.type === 'insurance')
                              .reduce((sum, client) => sum + client.scopeCommission, 0)
                              .toLocaleString()}</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                            <p className="text-sm text-gray-600 mb-1">{getCommissionLabel('insurance', 'monthly')}</p>
                            <p className="text-xl font-bold text-gray-900">₪{clients
                              .filter(client => client.type === 'insurance')
                              .reduce((sum, client) => sum + client.monthlyCommission, 0)
                              .toLocaleString()}</p>
                          </div>
                          <div className="p-4 bg-[#4361ee] rounded-xl text-white">
                            <p className="text-sm opacity-90 mb-1">סה"כ</p>
                            <p className="text-xl font-bold">₪{clients
                              .filter(client => client.type === 'insurance')
                              .reduce((sum, client) => sum + client.totalCommission, 0)
                              .toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* פיננסים */}
                    {clients.some(client => client.type === 'savings_and_study') && (
                      <div>
                        <h4 className="font-medium mb-4 flex items-center gap-2 text-gray-900">
                          <Coins className="w-5 h-5 text-purple-500" />
                          פיננסים
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <p className="text-sm text-gray-600 mb-1">{getCommissionLabel('savings_and_study', 'scope')}</p>
                            <p className="text-xl font-bold text-gray-900">₪{clients
                              .filter(client => client.type === 'savings_and_study')
                              .reduce((sum, client) => sum + client.scopeCommission, 0)
                              .toLocaleString()}</p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <p className="text-sm text-gray-600 mb-1">{getCommissionLabel('savings_and_study', 'monthly')}</p>
                            <p className="text-xl font-bold text-gray-900">₪{clients
                              .filter(client => client.type === 'savings_and_study')
                              .reduce((sum, client) => sum + client.monthlyCommission, 0)
                              .toLocaleString()}</p>
                          </div>
                          <div className="p-4 bg-[#4361ee] rounded-xl text-white">
                            <p className="text-sm opacity-90 mb-1">סה"כ</p>
                            <p className="text-xl font-bold">₪{clients
                              .filter(client => client.type === 'savings_and_study')
                              .reduce((sum, client) => sum + client.totalCommission, 0)
                              .toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* סה"כ כללי */}
                    <div className="mt-8 pt-6 border-t">
                      <h4 className="font-medium mb-4">סה"כ כללי</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-[#4361ee] bg-opacity-5 rounded-xl">
                          <p className="text-sm text-gray-600">סה"כ עמלות היקף</p>
                          <p className="text-xl font-bold">₪{totalSummary.scopeCommission.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-[#4361ee] bg-opacity-5 rounded-xl">
                          <p className="text-sm text-gray-600">סה"כ עמלות חודשיות</p>
                          <p className="text-xl font-bold">₪{totalSummary.monthlyCommission.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-[#4361ee] bg-opacity-5 rounded-xl">
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
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            className="mt-8 flex justify-end gap-4"
            variants={fadeIn}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-medium flex items-center gap-2"
              onClick={handleDownload}
            >
              <Download className="w-5 h-5" />
              הורד דוח
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#4361ee] to-[#3651d4] text-white font-medium flex items-center gap-2"
              onClick={handleSave}
            >
              <Save className="w-5 h-5" />
              שלח לדוחות
            </motion.button>
          </motion.div>

          <div className="dir-rtl" />

        </motion.div>
      )}
    </motion.div>
  );
};

export default CustomerJourneyComponent;
