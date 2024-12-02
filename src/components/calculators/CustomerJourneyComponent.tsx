import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CalculatorForm from './CalculatorForm';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { 
  Calculator,
  User,
  Check,
<<<<<<< HEAD
  X,
  CreditCard,
  FileText,
  Download
=======
  CreditCard,
  Building2,
  Shield,
  PiggyBank,
  Wallet
>>>>>>> ccc4860a90dcfca3c6cd1b30a04ed802e605921f
} from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
<<<<<<< HEAD
import { reportService } from '@/services/reportService';
import { useNavigate } from 'react-router-dom';
=======
import { calculateCommissions, getCompanyRates } from '@/services/AgentAgreementService';

const ProductIcon = ({ type, className }: { type: string; className?: string }) => {
  const iconClass = cn("transition-all duration-300", className);
  const iconColors = {
    pension: "text-blue-600 group-hover:text-blue-700",
    insurance: "text-emerald-600 group-hover:text-emerald-700",
    savings_and_study: "text-purple-600 group-hover:text-purple-700",
    policy: "text-orange-600 group-hover:text-orange-700"
  };

  switch (type) {
    case 'pension':
      return <Building2 className={cn(iconClass, iconColors.pension)} />;
    case 'insurance':
      return <Shield className={cn(iconClass, iconColors.insurance)} />;
    case 'savings_and_study':
      return <PiggyBank className={cn(iconClass, iconColors.savings_and_study)} />;
    case 'policy':
      return <Wallet className={cn(iconClass, iconColors.policy)} />;
    default:
      return null;
  }
};
>>>>>>> ccc4860a90dcfca3c6cd1b30a04ed802e605921f

interface CustomerJourneyClient {
  id: string;
  date: string;
  name: string;
  company: string;
  type: 'pension' | 'insurance' | 'savings_and_study' | 'policy';
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
}

interface CategorySummary {
  scopeCommission: number;
  monthlyCommission: number;
  totalCommission: number;
  count: number;
}

<<<<<<< HEAD
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

// Add type mapping
const typeToReportKey = {
  'pension': 'pension',
  'insurance': 'insurance',
  'savings_and_study': 'investment',
  'policy': 'policy'
} as const;

=======
>>>>>>> ccc4860a90dcfca3c6cd1b30a04ed802e605921f
const CustomerJourneyComponent: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<CustomerJourneyClient[]>([]);
  const [companyRates, setCompanyRates] = useState<{ [company: string]: any }>({});
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
  const [showProductForms, setShowProductForms] = useState<{
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

  useEffect(() => {
    loadCompanyRates();
  }, []);

  const loadCompanyRates = async () => {
    const companies = ['מגדל', 'מנורה', 'כלל', 'הראל', 'הפניקס'];
    const productTypes = ['pension', 'insurance', 'savings_and_study', 'policy'];
    const rates: { [key: string]: any } = {};
    
    for (const type of productTypes) {
      rates[type] = {};
      for (const company of companies) {
        const companyRate = await getCompanyRates(type, company);
        if (companyRate) {
          rates[type][company] = companyRate;
        }
      }
    }
    
    setCompanyRates(rates);
  };

  const getProductFields = (type: 'pension' | 'insurance' | 'savings_and_study' | 'policy') => {
    const baseFields = [
      { 
        name: 'company', 
        label: 'חברה', 
        type: 'select', 
        required: true,
        className: 'bg-white text-sm',
        containerClassName: 'relative z-[60]',
        popoverClassName: 'z-[60]',
        options: [
          { value: 'מגדל', label: 'מגדל' },
          { value: 'מנורה', label: 'מנורה' },
          { value: 'כלל', label: 'כלל' },
          { value: 'הראל', label: 'הראל' },
          { value: 'הפניקס', label: 'הפניקס' }
        ]
      }
    ];

    switch (type) {
      case 'pension':
        return [
          ...baseFields,
          { 
            name: 'pensionSalary', 
            label: 'שכר', 
            type: 'number', 
            required: true,
            className: 'bg-white'
          },
          { 
            name: 'pensionAccumulation', 
            label: 'צבירה', 
            type: 'number', 
            required: true,
            className: 'bg-white'
          },
          { 
            name: 'pensionContribution', 
            label: 'אחוז הפרשה', 
            type: 'select', 
            required: true,
            className: 'bg-white',
            containerClassName: 'relative z-[50]',
            popoverClassName: 'z-[50]',
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
<<<<<<< HEAD
      let commissions;
      let nifraim = 0;
      let scope_commission = 0;
      
      switch (type) {
        case 'pension':
          const salary = Number(data.pensionSalary);
          const accumulation = Number(data.pensionAccumulation);
          const contributionRate = Number(data.pensionContribution);
          const annualContribution = salary * 12 * contributionRate;
          
          commissions = await calculateCommissions(type, data.company, annualContribution, accumulation);
          break;

        case 'insurance': {
          const premium = Number(data.insurancePremium);
          const annualPremium = premium * 12;
          
          // Get rates from agent agreements
          const rates = await getCompanyRates(type, data.company);
          if (!rates) {
            toast.error('לא נמצאו נתוני עמלות לחברה זו');
            return;
          }

          // Calculate scope commission (65% of annual premium)
          scope_commission = annualPremium * 0.65;
          
          // Calculate nifraim (25% of monthly premium)
          nifraim = premium * 0.25;
          
          commissions = {
            scope_commission,
            monthly_commission: nifraim
          };
          break;
        }

        case 'savings_and_study': {
          const amount = Number(data.investmentAmount);
          const millionsInAmount = amount / 1000000;

          // Get rates from agent agreements
          const rates = await getCompanyRates(type, data.company);
          if (!rates) {
            toast.error('לא נמצאו נתוני עמלות לחברה זו');
            return;
          }

          // Calculate scope commission (e.g., 6000 per million)
          scope_commission = millionsInAmount * (rates.scope_rate_per_million || 0);
          
          // Calculate monthly nifraim (e.g., 250 per million)
          nifraim = millionsInAmount * (rates.nifraim_rate_per_million || 0);
          
          commissions = {
            scope_commission,
            monthly_commission: nifraim
          };

          console.log('Investment calculations:', {
            amount,
            millionsInAmount,
            scope_commission,
            nifraim,
            total: scope_commission + (nifraim * 12)
          });
          break;
        }

        case 'policy':
          const amount = Number(data.investmentAmount);
          commissions = await calculateCommissions(type, data.company, amount);
          break;
      }

      if (!commissions) {
        toast.error('אין הסכם פעיל עבור חברה זו');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('משתמש לא מחובר');
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
            total_commission: commissions.scope_commission + commissions.monthly_commission
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
            insurance_type: data.insuranceType || 'general',
            payment_method: data.paymentMethod || 'monthly',
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
=======
      const rates = await getCompanyRates(type, data.company);
      if (!rates || !rates.active) {
        toast.error('אין הסכם פעיל עבור חברה זו');
        return;
      }

      let scopeCommission = 0;
      let monthlyCommission = 0;
      let totalCommission = 0;

      switch (type) {
        case 'pension':
          const salary = Number(data.pensionSalary);
          const accumulation = Number(data.pensionAccumulation);
          const contributionRate = Number(data.pensionContribution);
          
          console.log('Debug values:', {
            salary,
            contributionRate,
            accumulation,
            data
          });
          
          const pensionCommissions = await calculateCommissions('pension', data.company, salary, accumulation, contributionRate);
          if (!pensionCommissions) {
            toast.error('אין הסכם פעיל עבור חברה זו');
            return;
          }
          
          scopeCommission = pensionCommissions.scope_commission;
          monthlyCommission = pensionCommissions.monthly_commission;
          totalCommission = scopeCommission + monthlyCommission;
          break;

        case 'insurance':
          const premium = Number(data.insurancePremium);
          const insuranceCommissions = await calculateCommissions('insurance', data.company, premium);
          if (!insuranceCommissions) {
            toast.error('אין הסכם פעיל עבור חברה זו');
            return;
          }
          
          scopeCommission = insuranceCommissions.scope_commission;
          monthlyCommission = insuranceCommissions.monthly_commission;
          totalCommission = scopeCommission + monthlyCommission;
          break;

        case 'savings_and_study':
        case 'policy':
          const amount = Number(data.investmentAmount || data.policyAmount);
          const investmentCommissions = await calculateCommissions(type, data.company, amount);
          if (!investmentCommissions) {
            toast.error('אין הסכם פעיל עבור חברה זו');
            return;
          }
          
          scopeCommission = investmentCommissions.scope_commission;
          monthlyCommission = investmentCommissions.monthly_commission;
          totalCommission = scopeCommission + monthlyCommission;
          break;
      }

      const newClient: CustomerJourneyClient = {
        id: Math.random().toString(36).substr(2, 9),
>>>>>>> ccc4860a90dcfca3c6cd1b30a04ed802e605921f
        date: new Date().toLocaleDateString('he-IL'),
        name: clientName,
        company: data.company,
        type: type,
        details: {
          pensionSalary: data.pensionSalary,
          pensionAccumulation: data.pensionAccumulation,
          pensionContribution: data.pensionContribution,
          insurancePremium: data.insurancePremium,
          investmentAmount: data.investmentAmount,
          policyAmount: data.investmentAmount
        },
<<<<<<< HEAD
        scopeCommission: commissions.scope_commission,
        monthlyCommission: commissions.monthly_commission,
        totalCommission: commissions.scope_commission + commissions.monthly_commission
      };

      setClients([...clients, newClient]);
      toast.success('הנתונים נשמרו בהצלחה');

    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('שגיאה בשמירת הנתונים');
=======
        scopeCommission,
        monthlyCommission,
        totalCommission
      };

      setClients([...clients, newClient]);
      setSelectedProducts(prev => ({ ...prev, [type]: true }));
      setShowProductForms(prev => ({ ...prev, [type]: false }));
      
      toast.success('המוצר נוסף בהצלחה למסע הלקוח', {
        icon: '🎉',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error calculating commissions:', error);
      toast.error('אירעה שגיאה בחישוב העמלות');
>>>>>>> ccc4860a90dcfca3c6cd1b30a04ed802e605921f
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
    { key: 'company', label: 'חברה' },
    { key: 'type', label: 'סוג מוצר', format: (value: string) => {
      switch (value) {
        case 'pension': return 'פנסיה';
        case 'insurance': return 'ביטוח';
        case 'savings_and_study': return 'גמל והשתלמות';
        case 'policy': return 'פוליסת חיסכון';
        default: return value;
      }
    }},
    { key: 'scopeCommission', label: 'עמלת היקף', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'monthlyCommission', label: 'עמלת היקף על הצירה', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'totalCommission', label: 'סה"כ', format: (value: number) => `₪${value.toLocaleString()}` }
  ];

  const handleDownload = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים להורדה');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "תאריך,שם הלקוח,חברה,סוג מוצר,עמלת היקף,עמלת נפרעים,סה\"כ\n";
    
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
    link.setAttribute("download", "מסע_לקוח.csv");
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

  const startNewJourney = () => {
    if (clientName.trim()) {
      setIsStarting(false);
    } else {
      toast.error('נא להזין שם לקוח');
    }
  };

  const totalSummary = {
    scopeCommission: clients.reduce((sum, client) => sum + client.scopeCommission, 0),
    monthlyCommission: clients.reduce((sum, client) => sum + client.monthlyCommission, 0),
    totalCommission: clients.reduce((sum, client) => sum + client.totalCommission, 0)
  };

  const handleSendToReports = async () => {
    if (clients.length === 0) {
      toast.error('אין נתונים לשליחה לדוחות');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('משתמש לא מחובר');
        return;
      }

      // Create commission details structure
      const commissionDetails = {
        pension: {
          companies: {},
          total: 0
        },
        insurance: {
          companies: {},
          total: 0
        },
        investment: {
          companies: {},
          total: 0
        },
        policy: {
          companies: {},
          total: 0
        }
      };

      // Group clients by product type and company
      clients.forEach(client => {
        const type = typeToReportKey[client.type];
        const company = client.company;
        
        if (!commissionDetails[type].companies[company]) {
          commissionDetails[type].companies[company] = {
            scopeCommission: 0,
            accumulationCommission: 0,
            oneTimeCommission: 0,
            monthlyCommission: 0,
            totalCommission: 0
          };
        }

        commissionDetails[type].companies[company].scopeCommission += client.scopeCommission;
        commissionDetails[type].companies[company].totalCommission += client.totalCommission;
        
        if (type === 'pension') {
          commissionDetails[type].companies[company].accumulationCommission += client.monthlyCommission;
        } else if (type === 'insurance') {
          commissionDetails[type].companies[company].oneTimeCommission += client.scopeCommission;
          commissionDetails[type].companies[company].monthlyCommission += client.monthlyCommission;
        }

        commissionDetails[type].total += client.totalCommission;
      });

      // Create journey object
      const journey: CustomerJourney = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: user.id,
        journey_date: new Date().toISOString(),
        date: new Date().toLocaleDateString('he-IL'),
        client_name: clientName,
        selected_products: Object.entries(selectedProducts)
          .filter(([_, value]) => value)
          .map(([key]) => key),
        selected_companies: {
          pension: clients.filter(c => c.type === 'pension').map(c => c.company),
          insurance: clients.filter(c => c.type === 'insurance').map(c => c.company),
          investment: clients.filter(c => c.type === 'savings_and_study').map(c => c.company),
          policy: clients.filter(c => c.type === 'policy').map(c => c.company)
        },
        commission_details: commissionDetails,
        total_commission: totalSummary.totalCommission,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await reportService.saveCustomerJourney(journey);
      toast.success('הנתונים נשלחו בהצלחה לדוחות');
      navigate('/reports');
    } catch (error) {
      console.error('Error sending to reports:', error);
      toast.error('שגיאה בשליחת הנתונים לדוחות');
    }
  };

  return (
    <div dir="rtl" className="p-4 max-w-6xl mx-auto">
      {isStarting ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[80vh] space-y-6"
        >
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-heading">
              מסע לקוח חדש
            </h1>
            <p className="text-muted-foreground text-base">
              בואו נתחיל בבחירת המוצרים המתאימים ללקוח
            </p>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="w-80 shadow-lg border border-primary/20 hover:border-primary/40 transition-all duration-300">
              <CardHeader className="space-y-2 pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  פרטי לקוח
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Input
                    placeholder="שם הלקוח"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="text-right pr-8 text-sm bg-white/50 border focus:border-primary/50 transition-all duration-300"
                  />
                  <User className="w-4 h-4 text-muted-foreground absolute right-2.5 top-2.5" />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-all duration-300 text-sm py-2"
                  onClick={startNewJourney}
                >
                  התחל מסע
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <Card className="border border-primary/20 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-heading">{clientName}</CardTitle>
                    <CardDescription className="text-sm">מסע לקוח - בחירת מוצרים</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-2 py-1 bg-white/50">
                    <CreditCard className="w-3 h-3 mr-1 text-primary" />
                    {clients.length} מוצרים
                  </Badge>
                  <Button variant="outline" onClick={handleDownload} 
                    className="text-xs px-2 py-1 h-7 hover:bg-primary/10 transition-all duration-300">
                    הורד דוח
                  </Button>
                  <Button variant="outline" onClick={handleClear}
                    className="text-xs px-2 py-1 h-7 hover:bg-red-500/10 transition-all duration-300">
                    התחל מסע חדש
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { type: 'pension' as const, title: 'פנסיה' },
                    { type: 'insurance' as const, title: 'ביטוח' },
                    { type: 'savings_and_study' as const, title: 'גמל והשתלמות' },
                    { type: 'policy' as const, title: 'פוליסת חיסכון' }
                  ].map(({ type, title }, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={type}
                    >
                      <Card className={cn(
                        "border transition-all duration-300 shadow-sm hover:shadow-md relative group",
                        selectedProducts[type] 
                          ? "border-primary/40 bg-primary/5" 
                          : "border-gray-200 hover:border-primary/30"
                      )}>
                        <CardHeader className="py-2 px-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`product-${type}`}
                                  checked={showProductForms[type]}
                                  onChange={(e) => {
                                    if (selectedProducts[type]) {
                                      toast.error('מוצר זה כבר נבחר');
                                      return;
                                    }
                                    setShowProductForms(prev => ({
                                      ...prev,
                                      [type]: e.target.checked
                                    }));
                                  }}
                                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                  disabled={selectedProducts[type]}
                                />
                                <label htmlFor={`product-${type}`} className="sr-only">
                                  {title}
                                </label>
                              </div>
                              <CardTitle className="text-sm flex items-center gap-1.5">
                                <div className="p-1.5 rounded-full bg-white shadow-sm group-hover:shadow transition-all duration-300">
                                  <ProductIcon type={type} className="w-4 h-4" />
                                </div>
                                {title}
                              </CardTitle>
                            </div>
                            {selectedProducts[type] && (
                              <Badge className="bg-primary/90 hover:bg-primary transition-all duration-300 text-xs px-1.5 py-0.5">
                                <Check className="w-3 h-3 mr-0.5" />
                                נבחר
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <AnimatePresence>
                          {showProductForms[type] && !selectedProducts[type] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <CardContent className="p-3">
                                <CalculatorForm
                                  onSubmit={(data) => handleSubmit(type, data)}
                                  fields={getProductFields(type)}
                                  title=""
                                />
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {clients.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <Card className="border border-primary/30 shadow-md hover:shadow-lg transition-all duration-300">
                      <CardHeader className="py-2 px-3 border-b bg-gradient-to-r from-primary/5 to-blue-500/5">
                        <CardTitle className="text-sm flex items-center gap-1.5">
                          <Calculator className="w-4 h-4 text-primary" />
                          סיכום עמלות
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="grid grid-cols-4 gap-3">
                          {(['pension', 'insurance', 'savings_and_study', 'policy'] as const).map((type, index) => {
                            const summary = calculateCategorySummary(type);
                            if (summary.count === 0) return null;
                            return (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                key={type}
                              >
                                <Card className="border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300">
                                  <CardHeader className="py-2 px-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                                    <CardTitle className="text-xs flex items-center gap-1.5">
                                      <ProductIcon type={type} className="w-3 h-3" />
                                      {type === 'pension' && 'פנסיה'}
                                      {type === 'insurance' && 'ביטח'}
                                      {type === 'savings_and_study' && 'גמל והשתלמות'}
                                      {type === 'policy' && 'פוליסת חיסכון'}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="text-xs p-2">
                                    <div className="space-y-1.5">
                                      {type === 'pension' ? (
                                        <>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">עמלת היקף מהפקדה:</span>
                                            <span className="font-medium">₪{summary.scopeCommission.toLocaleString()}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">עמלת היקף מצבירה:</span>
                                            <span className="font-medium">₪{summary.monthlyCommission.toLocaleString()}</span>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">עמלת הקף:</span>
                                            <span className="font-medium">₪{summary.scopeCommission.toLocaleString()}</span>
                                          </div>
                                          {type === 'insurance' && (
                                            <div className="flex justify-between items-center">
                                              <span className="text-muted-foreground">עמלת נפרעם:</span>
                                              <span className="font-medium">₪{summary.monthlyCommission.toLocaleString()}</span>
                                            </div>
                                          )}
                                        </>
                                      )}
                                      <div className="flex justify-between items-center pt-1.5 border-t">
                                        <span className="font-medium">סה"כ:</span>
                                        <span className="font-bold text-primary">₪{summary.totalCommission.toLocaleString()}</span>
                                      </div>
                                    </div>
<<<<<<< HEAD
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">עמלת היקף על הצבירה:</span>
                                      <span>₪{summary.monthlyCommission.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-medium pt-2 border-t">
                                      <span>סה"כ:</span>
                                      <span className="text-primary">₪{summary.totalCommission.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
=======
                                  </CardContent>
                                </Card>
                              </motion.div>
>>>>>>> ccc4860a90dcfca3c6cd1b30a04ed802e605921f
                            );
                          })}
                        </div>

<<<<<<< HEAD
                        <div className="mt-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg shadow-inner">
                          <div className="grid grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                              <div className="text-muted-foreground text-sm mb-2">סה"כ עמלות היקף</div>
                              <div className="text-xl font-bold">₪{totalSummary.scopeCommission.toLocaleString()}</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                              <div className="text-muted-foreground text-sm mb-2">סה"כ עמלות היקף על הצבירה</div>
                              <div className="text-xl font-bold">₪{totalSummary.monthlyCommission.toLocaleString()}</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                              <div className="text-muted-foreground text-sm mb-2">סה"כ עמלות</div>
                              <div className="text-xl font-bold text-primary">₪{totalSummary.totalCommission.toLocaleString()}</div>
                            </div>
=======
                        <div className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-lg shadow-inner">
                          <div className="grid grid-cols-3 gap-4">
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="text-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <div className="text-muted-foreground text-xs mb-1">סה"כ עמלות היקף</div>
                              <div className="text-base font-bold font-heading">₪{totalSummary.scopeCommission.toLocaleString()}</div>
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="text-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <div className="text-muted-foreground text-xs mb-1">סה"כ עמלות נפרעים</div>
                              <div className="text-base font-bold font-heading">₪{totalSummary.monthlyCommission.toLocaleString()}</div>
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="text-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <div className="text-muted-foreground text-xs mb-1">סה"כ עמלות</div>
                              <div className="text-base font-bold text-primary font-heading">₪{totalSummary.totalCommission.toLocaleString()}</div>
                            </motion.div>
>>>>>>> ccc4860a90dcfca3c6cd1b30a04ed802e605921f
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {clients.length > 0 && (
        <div className="flex justify-end gap-4 mt-6">
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            הורד דוח
          </Button>
          <Button onClick={handleSendToReports} className="gap-2 bg-primary">
            <FileText className="w-4 h-4" />
            שלח לדוחות
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomerJourneyComponent;
