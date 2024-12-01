import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { calculateCommissions, getCompanyRates } from '@/services/AgentAgreementService';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { 
  Wallet, 
  PiggyBank, 
  Building2, 
  Shield,
  Plus,
  Calculator,
  User,
  Check,
  X,
  CreditCard,
  FileText,
  Download
} from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { reportService } from '@/services/reportService';
import { useNavigate } from 'react-router-dom';

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
        className: 'bg-white',
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
          
          // Set commissions object
          commissions = {
            scope_commission,
            monthly_commission: nifraim
          };

          console.log('Insurance calculations:', {
            premium,
            annualPremium,
            scope_commission,
            nifraim,
            total: scope_commission + (nifraim * 12)
          });

          break;
        }

        case 'savings_and_study':
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
            provision: Number(data.pensionContribution) * 100, // Convert to percentage
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
            nifraim, // Monthly nifraim amount (25% of monthly premium)
            scope_commission: commissions.scope_commission, // 65% of annual premium
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
            scope_commission: commissions.scope_commission,
            total_commission: commissions.scope_commission
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
        details: {
          pensionSalary: data.pensionSalary,
          pensionAccumulation: data.pensionAccumulation,
          pensionContribution: data.pensionContribution,
          insurancePremium: data.insurancePremium,
          investmentAmount: data.investmentAmount,
          policyAmount: data.investmentAmount
        },
        scopeCommission: commissions.scope_commission,
        monthlyCommission: commissions.monthly_commission,
        totalCommission: commissions.scope_commission + commissions.monthly_commission
      };

      setClients([...clients, newClient]);
      toast.success('הנתונים נשמרו בהצלחה');

    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('שגיאה בשמירת הנתונים');
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
    <div dir="rtl" className="p-6 max-w-7xl mx-auto">
      {isStarting ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[80vh] space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
              מסע לקוח חדש
            </h1>
            <p className="text-muted-foreground text-lg">
              בואו נתחיל בבחירת המוצרים המתאימים ללקוח
            </p>
          </div>
          <Card className="w-96 shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                פרטי לקוח
              </CardTitle>
              <CardDescription>הזן את שם הלקוח להתחלת המסע</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="שם הלקוח"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="text-right pr-10 bg-white"
                />
                <User className="w-5 h-5 text-muted-foreground absolute right-3 top-2.5" />
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={startNewJourney}
              >
                התחל מסע
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{clientName}</CardTitle>
                    <CardDescription>מסע לקוח - בחירת מוצרים</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm px-4 py-1.5">
                    <CreditCard className="w-4 h-4 mr-1" />
                    {clients.length} מוצרים נבחרו
                  </Badge>
                  <Button onClick={handleDownload} variant="outline" className="gap-2">
                    הורד דוח
                  </Button>
                  <Button onClick={handleClear} variant="outline" className="gap-2">
                    התחל מסע חדש
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { type: 'pension' as const, title: 'פנסיה' },
                    { type: 'insurance' as const, title: 'ביטוח' },
                    { type: 'savings_and_study' as const, title: 'גמל והשתלמות' },
                    { type: 'policy' as const, title: 'פוליסת חיסכון' }
                  ].map(({ type, title }) => (
                    <Card key={type} className={cn(
                      "border-2 transition-all duration-200 shadow-md hover:shadow-lg relative",
                      selectedProducts[type] 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-muted"
                    )}>
                      <CardHeader className="pb-2 border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-white/80">
                              <ProductIcon type={type} />
                            </div>
                            {title}
                          </CardTitle>
                          {selectedProducts[type] && (
                            <Badge className="bg-primary">
                              <Check className="w-4 h-4 mr-1" />
                              נבחר
                            </Badge>
                          )}
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
                  ))}
                </div>

                {clients.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Card className="border-2 border-primary shadow-lg">
                      <CardHeader className="border-b bg-primary/5">
                        <CardTitle className="flex items-center gap-2">
                          <Calculator className="w-6 h-6 text-primary" />
                          סיכום עמלות
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-4 gap-4">
                          {(['pension', 'insurance', 'savings_and_study', 'policy'] as const).map(type => {
                            const summary = calculateCategorySummary(type);
                            if (summary.count === 0) return null;
                            return (
                              <Card key={type} className="border border-primary/20 shadow-sm">
                                <CardHeader className="pb-2 bg-muted/30">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <ProductIcon type={type} className="w-4 h-4" />
                                    {type === 'pension' && 'פנסיה'}
                                    {type === 'insurance' && 'ביטוח'}
                                    {type === 'savings_and_study' && 'גמל והשתלמות'}
                                    {type === 'policy' && 'פוליסת חיסכון'}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm p-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">עמלת היקף:</span>
                                      <span>₪{summary.scopeCommission.toLocaleString()}</span>
                                    </div>
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
                            );
                          })}
                        </div>

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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {clients.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Card className="shadow-lg">
                      <CardHeader className="border-b">
                        <CardTitle>פירוט מוצרים</CardTitle>
                      </CardHeader>
                      <CardContent>
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
