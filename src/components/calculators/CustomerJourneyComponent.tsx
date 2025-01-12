import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResultsTable from './ResultsTable';
import { calculateCommissions, getCompanyRates } from '@/services/AgentAgreementService';
import { toast } from 'react-hot-toast';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { 
  Building2, 
  Shield,
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
  CustomerJourneyClient,
  JourneyProduct,
  CustomerJourney,
  ProductType
} from './CustomerJourneyTypes';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from '@/contexts/UserContext';

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
  fields: Field[];
  type: ProductType;
  className?: string;
  clientName: string;
  setClients: React.Dispatch<React.SetStateAction<CustomerJourneyClient[]>>;
}

const CalculatorFormComponent: React.FC<CalculatorFormProps> = ({ fields, type, className, clientName, setClients }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const getFieldOptions = (field: Field) => {
    if (typeof field.options === 'function') {
      return field.options(formData);
    }
    return field.options || [];
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const details: { [key: string]: any } = formData;

    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('משתמש לא מחובר');
        return;
      }

      // קביעת הסכום לחישוב העמלות בהתאם לסוג המוצר
      let amount = 0;
      if (type === 'insurance') {
        amount = details.insurancePremium * 12; // הכפלה ב-12 לקבלת פרמיה שנתית
      } else {
        amount = details.salary || details.insurancePremium || details.investmentAmount || 0;
      }

      const rates = await calculateCommissions(
        user.id,
        type,
        details.company,
        amount,
        details.transactionType || details.insuranceType || details.productType || '',
        details.totalAccumulated || 0
      );

      const newClient: CustomerJourneyClient = {
        type: type,
        date: new Date().toISOString(),
        name: clientName,
        company: details.company || '',
        agent_number: details.agent_number || '',
        insuranceType: details.insuranceType || details.transactionType || '',
        productType: details.productType || details.serviceType || details.financeType || '',
        pensionType: details.pensionType,
        pensionContribution: details.pensionContribution,
        salary: details.salary,
        totalAccumulated: details.totalAccumulated,
        insurancePremium: details.insurancePremium,
        investmentAmount: details.investmentAmount,
        scope_commission: rates.scope_commission || 0,
        monthly_commission: rates.monthly_commission || 0,
        total_commission: rates.total_commission || 0,
        clientInfo: null
      };

      setClients(prev => [...prev, newClient]);
      toast.success('נוסף בהצלחה');
      setFormData({}); // נקה את הטופס
    } catch (error) {
      console.error('Error calculating rates:', error);
      toast.error('שגיאה בחישוב העמלות');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium text-right block">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'select' ? (
              <Select
                value={formData[field.name] || ''}
                onValueChange={(value) => {
                  const newFormData = { ...formData, [field.name]: value };
                  setFormData(newFormData);
                }}
              >
                <SelectTrigger className={field.className}>
                  <SelectValue placeholder={`בחר ${field.label}`} />
                </SelectTrigger>
                <SelectContent className={field.popoverClassName}>
                  {getFieldOptions(field).map((option: { value: string; label: string }) => (
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
                className={field.className}
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
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

type SelectedProducts = Record<ProductType, boolean>;

interface ClientInfo {
  name: string;
  phone: string;
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
    case 'service':
      return <HeartHandshake className={cn(iconClass, "text-pink-500")} />;
    case 'finance':
      return <Coins className={cn(iconClass, "text-indigo-500")} />;
    default:
      return null;
  }
};

export const CustomerJourneyComponent = () => {
  const { user } = useUser();
  const [agentNumbers, setAgentNumbers] = useState<{ [company: string]: { number: string; name: string; }[] }>({});
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

  const handleDownload = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים להורדה');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "תאריך,שם הלקוח,חברה,סוג מוצר\n";
    
    clients.forEach((client) => {
      const row = [
        client.date,
        client.name,
        client.company,
        client.type
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

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם לקוח' },
    { key: 'company', label: 'יצרן' },
    { key: 'agent_number', label: 'מספר סוכן' },
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
    }
  ];

  useEffect(() => {
    loadCompanyRates();
    const subscription = supabase.channel('agent_commission_rates_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_commission_rates' }, () => loadCompanyRates())
      .subscribe();
    return () => { subscription.unsubscribe(); };
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
    } catch (error) {
      console.error('Error loading company rates:', error);
      toast.error('שגיאה בטעינת נתוני החברות');
    }
  };

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
      },
      {
        name: 'agent_number',
        label: 'מספר סוכן',
        type: 'select',
        required: true,
        className: 'bg-white !important text-right pr-4',
        containerClassName: 'relative z-[998] bg-white select-container',
        popoverClassName: 'z-[998] bg-white text-right',
        listboxClassName: 'bg-white text-right',
        optionClassName: 'bg-white hover:bg-gray-100 text-right',
        options: (formData: any) => {
          const company = formData?.company;
          if (!company || !agentNumbers[company]) return [];
          return agentNumbers[company]
            .filter(entry => entry.number && entry.number.trim() !== '') // סינון ערכים ריקים
            .map(entry => ({
              value: entry.number.trim(),
              label: entry.name ? `${entry.number.trim()} - ${entry.name}` : entry.number.trim()
            }));
        }
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

  const handleSave = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('משתמש לא מחובר');
        return;
      }

      const userId = user.id;
      const currentDate = new Date().toISOString();

      const journey: CustomerJourney = {
        user_id: userId,
        date: currentDate,
        selected_products: clients.map(client => {
          const type = mapClientTypeToJourneyType(client.type);
          const baseProduct = {
            id: undefined,
            user_id: userId,
            client_name: client.name,
            company: client.company,
            date: currentDate,
            total_commission: client.total_commission,
            scope_commission: client.scope_commission,
            monthly_commission: client.monthly_commission,
            agent_number: client.agent_number
          };

          let details;
          switch (type) {
            case 'pension':
              details = {
                ...baseProduct,
                type: 'pension',
                pensionsalary: client.salary || 0,
                pensionaccumulation: client.totalAccumulated || 0,
                pensioncontribution: client.pensionContribution ? parseFloat(client.pensionContribution) : 0,
                activityType: 'new_policy',
                agent_number: client.agent_number
              };
              break;
            case 'insurance':
              details = {
                ...baseProduct,
                type: 'insurance',
                premium: client.insurancePremium || 0,
                annual_premium: (client.insurancePremium || 0) * 12,
                insurance_type: client.insuranceType || '',
                payment_method: 'monthly',
                nifraim: client.monthly_commission * 12,
                agent_number: client.agent_number
              };
              break;
            case 'investment':
              details = {
                ...baseProduct,
                investment_amount: client.investmentAmount || 0,
                investment_type: client.productType || '',
                nifraim: client.monthly_commission * 12,
                agent_number: client.agent_number
              };
              break;
            case 'policy':
              details = {
                ...baseProduct,
                policy_amount: client.investmentAmount || 0,
                policy_period: 12,
                policy_type: client.productType || '',
                agent_number: client.agent_number
              };
              break;
            default:
              throw new Error(`Invalid product type: ${type}`);
          }

          return {
            type,
            company: client.company,
            details
          } as JourneyProduct;
        }),
        client_info: null
      };

      await reportService.saveCustomerJourney(journey);
      toast.success('הנתונים נשמרו בהצלחה');
    } catch (error) {
      console.error('Error saving customer journey:', error);
      toast.error('שגיאה בשמירת מסע הלקוח');
    }
  };

  const mapClientTypeToJourneyType = (type: CustomerJourneyClient['type']): JourneyProduct['type'] => {
    switch (type) {
      case 'savings_and_study':
      case 'finance':
        return 'investment';
      case 'service':
        return 'policy';
      case 'pension':
      case 'insurance':
        return type;
      default:
        throw new Error(`Invalid client type: ${type}`);
    }
  };

  const handleClientInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const clientInfo: ClientInfo = {
      name: formData.get('fullName')?.toString() || '',
      phone: formData.get('idNumber')?.toString() || '',
    };
    setClientInfo(clientInfo);
    setClientName(clientInfo.name);
    setStep('journey');
  };

  useEffect(() => {
    const fetchAgentNumbers = async () => {
      if (!user) return;

      try {
        const { data: existingData, error: fetchError } = await supabase
          .from('agent_settings')
          .select('agent_numbers')
          .eq('user_id', user.id)
          .single();

        console.log('Agent numbers data:', existingData);

        if (fetchError && fetchError.code === 'PGRST116') {
          // אם אין נתונים, ניצור נתונים ברירת מחדל
          const defaultAgentNumbers = [
            {
              company: 'מגדל',
              numbers: [{ number: '12345', name: 'סוכן מגדל' }]
            },
            {
              company: 'מנורה',
              numbers: [{ number: '67890', name: 'סוכן מנורה' }]
            },
            {
              company: 'כלל',
              numbers: [{ number: '11111', name: 'סוכן כלל' }]
            },
            {
              company: 'הראל',
              numbers: [{ number: '22222', name: 'סוכן הראל' }]
            },
            {
              company: 'הפניקס',
              numbers: [{ number: '33333', name: 'סוכן הפניקס' }]
            }
          ];

          const { error: insertError } = await supabase
            .from('agent_settings')
            .insert([
              {
                user_id: user.id,
                agent_numbers: defaultAgentNumbers
              }
            ]);

          if (insertError) throw insertError;

          // עדכון המצב עם הנתונים החדשים
          const numbersMap = defaultAgentNumbers.reduce((acc: any, curr: any) => {
            acc[curr.company] = curr.numbers;
            return acc;
          }, {});
          setAgentNumbers(numbersMap);
        } else if (existingData?.agent_numbers) {
          // אם יש נתונים קיימים, נשתמש בהם
          const numbersMap = existingData.agent_numbers.reduce((acc: any, curr: any) => {
            acc[curr.company] = curr.numbers;
            return acc;
          }, {});
          setAgentNumbers(numbersMap);
        }
      } catch (error) {
        console.error('Error fetching agent numbers:', error);
        toast.error('שגיאה בטעינת מספרי סוכן');
      }
    };

    fetchAgentNumbers();
  }, [user]);

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

      {step === 'journey' && (
        <motion.div variants={staggerContainer}>
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4"
            variants={fadeIn}
          >
            <h1 className="text-2xl font-semibold">מסע לקוח</h1>
            <p className="text-muted-foreground">נהל את המוצרים והעמלות שלך בצורה חכמה ויעילה</p>
          </motion.div>

          <motion.div 
            className="space-y-8 mt-6"
            variants={fadeIn}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-end gap-2">
                  <CardTitle className="text-xl">בחירת מוצרים</CardTitle>
                  <Brain className="h-5 w-5" />
                </div>
                <p className="text-muted-foreground text-right">בחר את המוצרים הרלוונטיים</p>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop View */}
                <div className="hidden md:grid grid-cols-3 gap-4">
                  {productTypes.map(({ type, title }) => (
                    <motion.div
                      key={type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={cn(
                          "p-4 rounded-xl cursor-pointer transition-all",
                          "border hover:shadow-md",
                          "flex items-center gap-3",
                          selectedProducts[type] 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => handleProductSelect(type)}
                      >
                        <ProductIcon type={type} className="w-5 h-5" />
                        <span className="font-medium">{title}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full flex items-center justify-between">
                        <span>בחר מוצרים</span>
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px]">
                      <SheetHeader>
                        <SheetTitle>בחירת מוצרים</SheetTitle>
                      </SheetHeader>
                      <div className="flex flex-col gap-3 mt-4">
                        {productTypes.map(({ type, title }) => (
                          <div
                            key={type}
                            className={cn(
                              "p-4 rounded-xl cursor-pointer transition-all",
                              "border",
                              "flex items-center gap-3",
                              selectedProducts[type] 
                                ? "border-primary bg-primary/5" 
                                : "border-border"
                            )}
                            onClick={() => handleProductSelect(type)}
                          >
                            <ProductIcon type={type} className="w-5 h-5" />
                            <span className="font-medium">{title}</span>
                            {selectedProducts[type] && (
                              <div className="mr-auto">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Selected Products Pills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {Object.entries(selectedProducts)
                      .filter(([_, isSelected]) => isSelected)
                      .map(([type]) => (
                        <div
                          key={type}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          <ProductIcon type={type} className="w-4 h-4" />
                          <span>{productTypes.find(pt => pt.type === type)?.title}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* הצגת טפסי הנתונים למוצרים שנבחרו */}
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
                    <Card className="border-0 shadow-none">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-end gap-2">
                          <CardTitle className="text-xl">{title}</CardTitle>
                          <ProductIcon type={type} className="h-5 w-5" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <CalculatorFormComponent
                          fields={getProductFields(type)}
                          type={type}
                          className="w-full"
                          clientName={clientName}
                          setClients={setClients}
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
                <Card className="border-0 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">סירוט מוצרים</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ResultsTable
                      data={clients}
                      columns={columns}
                      onDownload={handleDownload}
                      onShare={() => {}}
                      onClear={() => setClients([])}
                      customerName={clients[0]?.name || ''}
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
            <Button
              variant="outline"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              הורד דוח
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              שלח לדוחות
            </Button>
          </motion.div>

          <div className="dir-rtl" />

        </motion.div>
      )}
    </motion.div>
  );
};

export default CustomerJourneyComponent;
