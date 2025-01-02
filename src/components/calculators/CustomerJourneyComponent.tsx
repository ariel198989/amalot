import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Brain,
  Menu,
  User,
  CreditCard,
  Calendar
} from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { reportService } from '@/services/reportService';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { 
  CustomerJourney, 
  PensionProduct,
  InsuranceProduct,
  InvestmentProduct,
  PolicyProduct,
  CommissionDetails,
  CustomerJourneyClient,
  PensionCommission,
  InsuranceCommission,
  InvestmentCommission,
  PolicyCommission
} from './CustomerJourneyTypes';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const productTypes = [
  { type: 'pension' as const, title: 'פנסיה' },
  { type: 'insurance' as const, title: 'סיכונים' },
  { type: 'savings_and_study' as const, title: 'פיננסים' },
  { type: 'service' as const, title: 'גולה- שירות' },
  { type: 'finance' as const, title: 'גולה- פיננסים' }
] as const;

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
      const details: { [key: string]: any } = {};
      
      fields.forEach(field => {
        const value = formData.get(field.name);
        if (value) {
          if (field.type === 'number') {
            details[field.name] = parseFloat(value.toString()) || 0;
          } else {
            details[field.name] = value.toString();
          }
        }
      });

      const data: FormValues = {
        type,
        company: details.company || '',
        details: {
          name: '',
          pensionType: details.pensionType || '',
          pensionContribution: details.pensionContribution || '',
          salary: details.salary || 0,
          totalAccumulated: details.totalAccumulated || 0,
          insuranceType: details.insuranceType || details.transactionType || '',
          insurancePremium: details.insurancePremium || 0,
          productType: details.productType || details.serviceType || details.financeType || '',
          investmentAmount: details.investmentAmount || details.serviceFee || details.financeAmount || 0,
          clientInfo: null
        }
      };
      
      onSubmit(data);
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

interface FormValues {
  type: string;
  company: string;
  details: {
    name: string;
    pensionType: string;
    pensionContribution: string;
    salary: number;
    totalAccumulated: number;
    insuranceType: string;
    transactionType?: string;
    insurancePremium: number;
    productType: string;
    investmentAmount: number;
    clientInfo: any;
  };
}

interface ClientInfo {
  fullName: string;
  idNumber: string;
  meetingDate: string;
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

export const CustomerJourneyComponent = () => {
  const [clients, setClients] = useState<CustomerJourneyClient[]>([]);
  const [clientName, setClientName] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProducts>({
    pension: false,
    insurance: false,
    savings_and_study: false,
    service: false,
    finance: false
  });
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
        case 'finance': return 'פיננסי';
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
    const subscription = supabase.channel('agent_commission_rates_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_commission_rates' }, () => loadCompanyRates())
      .subscribe();
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
      
      if (!prev[productType] || Object.values(newState).some(Boolean)) {
        return newState;
      }
      
      toast.error('חובה לבחור לפחות מוצר אחד');
      return prev;
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
              { value: 'insurance_umbrella', label: 'מטריה בטוחת' },
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
            containerClassName: 'relative z-[998] bg-white select-container',
            popoverClassName: 'z-[998] bg-white text-right',
            listboxClassName: 'bg-white text-right',
            optionClassName: 'bg-white hover:bg-gray-100 text-right',
            options: [
              { value: 'gemel', label: 'גמל' },
              { value: 'investment_gemel', label: 'גמל להשקעה' },
              { value: 'hishtalmut', label: 'השתלמות' },
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
              { value: 'academia', label: 'אקדמה' },
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

  const calculateRates = async (values: FormValues) => {
    const { type, company, details } = values;
    let amount = 0;
    let annualContribution = 0;
    let insuranceType = '';
    let totalAccumulated = 0;

    // Check if we have rates for this company and type
    const category = type === 'finance' ? 'savings_and_study' : type;
    const companyRate = companyRates[category]?.[company];
    
    if (!companyRate) {
      console.error('No rates found for:', { category, company });
      toast.error('לא נמצאו נתוני עמלות לחברה זו');
      return;
    }

    switch (type) {
      case 'pension':
        amount = details.salary || 0;
        annualContribution = (details.salary * parseFloat(details.pensionContribution || '0') / 100) * 12;
        totalAccumulated = details.totalAccumulated || 0;
        break;
        
      case 'insurance':
        amount = details.insurancePremium || 0;
        annualContribution = amount * 12;
        insuranceType = details.transactionType || details.insuranceType || '';
        break;
        
      case 'savings_and_study':
      case 'finance':
        amount = details.investmentAmount || 0;
        annualContribution = amount;
        insuranceType = details.productType || '';
        break;
    }

    console.log('Calculated values:', { amount, annualContribution, insuranceType, totalAccumulated });
    console.log('Using company rates:', companyRate);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const rates = await calculateCommissions(
      user.id,
      category,
      company,
      amount,
      insuranceType,
      totalAccumulated
    );
    console.log('Calculated rates:', rates);
    
    if (rates.total_commission === 0) {
      toast.error('לא נמצאו נתוני עמלות מתאימים');
      return;
    }

    const newClient: CustomerJourneyClient = {
      type: type as CustomerJourneyClient['type'],
      date: new Date().toISOString(),
      name: clientName,
      company,
      scopeCommission: rates.scope_commission || 0,
      monthlyCommission: rates.monthly_commission || 0,
      totalCommission: rates.total_commission || 0,
      salary: amount,
      totalAccumulated,
      insuranceType,
      insurancePremium: amount,
      productType: insuranceType,
      investmentAmount: amount,
      pensionType: details.pensionType,
      pensionContribution: details.pensionContribution,
      clientInfo: details.clientInfo
    };

    setClients(prev => [...prev, newClient]);
    toast.success('נוסף בהצלחה');
  };

  const handleSave = async () => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id || '';
      const currentDate = new Date().toISOString();

      const journeyData: CustomerJourney = {
        user_id: userId,
        journey_date: currentDate,
        date: currentDate,
        client_name: clientName,
        client_phone: clients[0]?.clientInfo?.phone || '',
        selected_products: clients.map(client => {
          const type = mapClientTypeToJourneyType(client.type);
          const baseProduct = {
            id: undefined,
            user_id: userId,
            client_name: clientName,
            company: client.company,
            date: currentDate,
            total_commission: client.totalCommission,
            scope_commission: client.scopeCommission,
            monthly_commission: client.monthlyCommission
          };

          let details: PensionProduct | InsuranceProduct | InvestmentProduct | PolicyProduct;
          
          switch (type) {
            case 'pension':
              console.log('Creating pension product with:', {
                salary: client.salary,
                totalAccumulated: client.totalAccumulated,
                pensionContribution: client.pensionContribution,
                rawClient: client
              });
              
              const pensionsalary = Number(client.salary);
              const pensionaccumulation = Number(client.totalAccumulated);
              const pensioncontribution = client.pensionContribution ? Number(client.pensionContribution) : 0;
              
              if (isNaN(pensionsalary) || isNaN(pensionaccumulation) || isNaN(pensioncontribution)) {
                console.error('Invalid pension values:', {
                  salary: client.salary,
                  totalAccumulated: client.totalAccumulated,
                  pensionContribution: client.pensionContribution
                });
                throw new Error('ערכי פנסיה לא תקינים');
              }
              
              details = {
                ...baseProduct,
                type: 'pension',
                pensionsalary,
                pensionaccumulation,
                pensioncontribution,
                activityType: 'new_policy'
              } as PensionProduct;
              
              console.log('Created pension details:', details);
              break;
            
            case 'insurance':
              details = {
                ...baseProduct,
                premium: client.insurancePremium || 0,
                insurance_type: client.insuranceType || '',
                payment_method: 'monthly',
                nifraim: 0,
                salary: client.salary,
                transfer_amount: client.totalAccumulated,
                contribution_percentage: client.pensionContribution ? parseFloat(client.pensionContribution) : undefined
              } as InsuranceProduct;
              break;
            
            case 'investment':
              console.log('Creating investment product - Raw input:', {
                investmentAmount: client.investmentAmount,
                productType: client.productType,
                scopeCommission: client.scopeCommission,
                monthlyCommission: client.monthlyCommission,
                rawClient: client
              });
              
              const investment_amount = Number(client.investmentAmount) || 0;
              const scope_commission = Number(client.scopeCommission) || 0;
              const monthly_commission = Number(client.monthlyCommission) || 0;
              
              console.log('Investment values after conversion:', {
                investment_amount,
                scope_commission,
                monthly_commission,
                calculated_nifraim: monthly_commission * 12
              });
              
              if (isNaN(investment_amount) || isNaN(scope_commission) || isNaN(monthly_commission)) {
                console.error('Invalid investment values:', {
                  investmentAmount: client.investmentAmount,
                  scopeCommission: client.scopeCommission,
                  monthlyCommission: client.monthlyCommission
                });
                throw new Error('ערכי השקעה לא תקינים');
              }
              
              details = {
                ...baseProduct,
                investment_amount,
                investment_type: client.productType || '',
                scope_commission,
                monthly_commission,
                nifraim: monthly_commission * 12,
                total_commission: scope_commission + (monthly_commission * 12)
              } as InvestmentProduct;
              
              console.log('Final investment product details:', details);
              break;
            
            case 'policy':
              details = {
                ...baseProduct,
                policy_amount: client.investmentAmount || 0,
                policy_period: 12,
                policy_type: client.productType || '',
                scope_commission: client.scopeCommission
              } as PolicyProduct;
              break;
            
            default:
              throw new Error(`Invalid product type: ${type}`);
          }

          return {
            type,
            company: client.company,
            details
          };
        }),
        total_commission: totalSummary.totalCommission,
        commissionDetails: calculateCommissionDetails(clients)
      };

      await reportService.saveCustomerJourney(journeyData);
      toast.success('הנתונים נשמרו בהצלחה');
    } catch (error) {
      console.error('Error saving customer journey:', error);
      toast.error('שגיאה בשמירת מסע הלקוח');
    }
  };

  type JourneyProductType = 'pension' | 'insurance' | 'investment' | 'policy';

  const mapClientTypeToJourneyType = (type: CustomerJourneyClient['type']): JourneyProductType => {
    switch (type) {
      case 'savings_and_study':
      case 'finance':
        return 'investment';
      case 'service':
        return 'policy';
      case 'pension':
      case 'insurance':
      case 'policy':
        return type;
      default:
        throw new Error(`Invalid client type: ${type}`);
    }
  };

  const calculateCommissionDetails = (clients: CustomerJourneyClient[]): CommissionDetails => {
    const details: CommissionDetails = {
      pension: { companies: {}, total: 0 },
      insurance: { companies: {}, total: 0 },
      investment: { companies: {}, total: 0 },
      policy: { companies: {}, total: 0 }
    };

    clients.forEach(client => {
      const type = mapClientTypeToJourneyType(client.type);
      
      if (!details[type].companies[client.company]) {
        if (type === 'insurance') {
          const commission: InsuranceCommission = {
            nifraim: 0,
            scopeCommission: client.scopeCommission,
            monthlyCommission: client.monthlyCommission,
            totalCommission: client.totalCommission
          };
          details[type].companies[client.company] = commission;
        } else if (type === 'investment') {
          const commission: InvestmentCommission = {
            scope_commission: client.scopeCommission,
            nifraim: 0,
            total_commission: client.totalCommission
          };
          details[type].companies[client.company] = commission;
        } else {
          const commission: PensionCommission | PolicyCommission = {
            scopeCommission: client.scopeCommission,
            monthlyCommission: type === 'pension' ? client.monthlyCommission : undefined,
            totalCommission: client.totalCommission
          };
          details[type].companies[client.company] = commission;
        }
      } else {
        const companyDetails = details[type].companies[client.company];
        if (type === 'investment') {
          (companyDetails as InvestmentCommission).scope_commission += client.scopeCommission;
          (companyDetails as InvestmentCommission).total_commission += client.totalCommission;
        } else {
          (companyDetails as PensionCommission | InsuranceCommission | PolicyCommission).scopeCommission += client.scopeCommission;
          if ('monthlyCommission' in companyDetails) {
            (companyDetails as PensionCommission | InsuranceCommission).monthlyCommission += client.monthlyCommission;
          }
          (companyDetails as PensionCommission | InsuranceCommission | PolicyCommission).totalCommission += client.totalCommission;
        }
      }
      details[type].total += client.totalCommission;
    });

    return details;
  };

  const getCommissionLabel = (type: string, commissionType: 'scope' | 'monthly') => {
    if (type === 'pension') {
      return commissionType === 'scope' ? 'עמלת היקף על השכר' : 'עמלת היקף על בירה';
    }
    return commissionType === 'scope' ? 'עמלת היקף' : 'עמלת נפרעים';
  };

  const handleClientInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const clientInfo: ClientInfo = {
      fullName: formData.get('fullName')?.toString() || '',
      idNumber: formData.get('idNumber')?.toString() || '',
      meetingDate: formData.get('meetingDate')?.toString() || ''
    };
    setClientInfo(clientInfo);
    setClientName(clientInfo.fullName);
    setStep('journey');
  };

  return (
    <motion.div 
      className="container max-w-4xl mx-auto py-12"
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleClientInfoSubmit}>
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-8 pt-8 px-8 text-center bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">מסע לקוח חכם</CardTitle>
                <p className="text-white/80 text-sm">הזן את פרטי הלקוח להתחלת המסע</p>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    שם מלא
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className="block w-full rounded-xl border-gray-200 bg-white/50 shadow-sm 
                             focus:border-blue-500 focus:ring-blue-500 transition-all duration-200
                             hover:bg-white/80 text-right px-4 py-3"
                    required
                    placeholder="הכנס שם מלא"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-500" />
                    תעודת זהות
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    className="block w-full rounded-xl border-gray-200 bg-white/50 shadow-sm 
                             focus:border-blue-500 focus:ring-blue-500 transition-all duration-200
                             hover:bg-white/80 text-right px-4 py-3"
                    required
                    placeholder="הכנס מספר תעודת זהות"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    תאריך פגישה
                  </label>
                  <input
                    type="date"
                    name="meetingDate"
                    className="block w-full rounded-xl border-gray-200 bg-white/50 shadow-sm 
                             focus:border-blue-500 focus:ring-blue-500 transition-all duration-200
                             hover:bg-white/80 text-right px-4 py-3"
                    required
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white
                           rounded-xl py-3 font-medium text-lg shadow-lg
                           hover:shadow-xl transition-all duration-200
                           hover:scale-[1.02] active:scale-[0.98]"
                >
                  המשך למסע
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CustomerJourneyComponent;
