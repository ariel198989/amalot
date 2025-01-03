import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Building2,
  Shield,
  PiggyBank,
  Search,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { 
  PensionProduct, 
  InsuranceProduct, 
  InvestmentProduct, 
  PolicyProduct 
} from '../calculators/CustomerJourneyTypes';
import { Dialog, DialogContent } from "@/components/ui/dialog";

const MonthlyReport: React.FC<{ data: any }> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-container" dir="rtl">
      <div className="no-print mb-4">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="w-4 h-4" />
          הדפס דוח
        </Button>
      </div>

      <div className="print-content">
        <div className="print-header">
          <h1>דוח מכירות חודש</h1>
          <p>{new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <h3>סה"כ מכירות</h3>
            <div className="value">{data.total.count}</div>
          </div>
          <div className="summary-card">
            <h3>סה"כ עמלות</h3>
            <div className="value">{formatCurrency(data.total.commission)}</div>
          </div>
          <div className="summary-card">
            <h3>עמלה ממוצעת</h3>
            <div className="value">
              {formatCurrency(data.total.count ? data.total.commission / data.total.count : 0)}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card">
            <h2>מכירות פנסיה</h2>
            <div className="description">סה"כ: {formatCurrency(data.total.pension.commission)}</div>
            <table>
              <thead>
                <tr>
                  <th className="p-3 text-right font-medium">סה"כ עמלה</th>
                  <th className="p-3 text-right font-medium">עמלת היקף</th>
                  <th className="p-3 text-right font-medium">עמלת היקף על הצבירה</th>
                  <th className="p-3 text-right font-medium">הפרשה</th>
                  <th className="p-3 text-right font-medium">סכום ניוד</th>
                  <th className="p-3 text-right font-medium">שכר</th>
                  <th className="p-3 text-right font-medium">חברה</th>
                  <th className="p-3 text-right font-medium">שם לקוח</th>
                  <th className="p-3 text-right font-medium">תאריך</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.byCompany?.pension || {}).map(([company, stats]: [string, any]) => (
                  <tr key={company}>
                    <td>{company}</td>
                    <td>{stats.count}</td>
                    <td className="amount">{formatCurrency(stats.commission)}</td>
                    <td className="amount">{formatCurrency(stats.count ? stats.commission / stats.count : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2>מכירות ביטוח</h2>
            <div className="description">סה"כ: {formatCurrency(data.total.insurance.commission)}</div>
            <table>
              <thead>
                <tr>
                  <th className="p-3 text-right font-medium">סה"כ עמלה</th>
                  <th className="p-3 text-right font-medium">עמלת היקף</th>
                  <th className="p-3 text-right font-medium">נפרעים</th>
                  <th className="p-3 text-right font-medium">פרמיה</th>
                  <th className="p-3 text-right font-medium">סוג ביטוח</th>
                  <th className="p-3 text-right font-medium">אופן תשלום</th>
                  <th className="p-3 text-right font-medium">חברה</th>
                  <th className="p-3 text-right font-medium">שם לקוח</th>
                  <th className="p-3 text-right font-medium">תאריך</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.byCompany?.insurance || {}).map(([company, stats]: [string, any]) => (
                  <tr key={company}>
                    <td>{company}</td>
                    <td>{stats.count}</td>
                    <td className="amount">{formatCurrency(stats.commission)}</td>
                    <td className="amount">{formatCurrency(stats.nifraim || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2>מכירות פיננסים</h2>
            <div className="description">סה"כ: {formatCurrency(data.total.investment.commission)}</div>
            <table>
              <thead>
                <tr>
                  <th className="p-3 text-right font-medium">סה"כ עמלה</th>
                  <th className="p-3 text-right font-medium">עמלת היקף</th>
                  <th className="p-3 text-right font-medium">נפרעים</th>
                  <th className="p-3 text-right font-medium">סכום השקעה</th>
                  <th className="p-3 text-right font-medium">סוג השקעה</th>
                  <th className="p-3 text-right font-medium">חברה</th>
                  <th className="p-3 text-right font-medium">שם לקוח</th>
                  <th className="p-3 text-right font-medium">תאריך</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.byCompany?.investment || {}).map(([company, stats]: [string, any]) => (
                  <tr key={company}>
                    <td>{company}</td>
                    <td>{stats.count}</td>
                    <td className="amount">{formatCurrency(stats.total_amount || 0)}</td>
                    <td className="amount">{formatCurrency(stats.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reports: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPeriod, setSelectedPeriod] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = React.useState(false);
  const [pensionSales, setPensionSales] = React.useState<PensionProduct[]>([]);
  const [insuranceSales, setInsuranceSales] = React.useState<InsuranceProduct[]>([]);
  const [investmentSales, setInvestmentSales] = React.useState<InvestmentProduct[]>([]);
  const [policySales, setPolicySales] = React.useState<PolicyProduct[]>([]);
  const loadingRef = React.useRef(false);

  const loadSalesData = React.useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        toast.error('משתמש לא מחובר');
        return;
      }

      console.log('Loading data for user:', user.id);

      // Build date filter based on selected period
      let dateFilter = {};
      const now = new Date();
      if (selectedPeriod !== 'all') {
        let startDate = new Date();
        switch (selectedPeriod) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        dateFilter = {
          gte: startDate.toISOString(),
          lte: now.toISOString()
        };
      }

      // Load all data in parallel with date filter
      const [
        { data: pensionData, error: pensionError },
        { data: insuranceData, error: insuranceError },
        { data: investmentData, error: investmentError },
        { data: policyData, error: policyError }
      ] = await Promise.all([
        supabase
          .from('pension_sales')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .match(selectedPeriod !== 'all' ? { date: dateFilter } : {}),
        supabase
          .from('insurance_sales')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .match(selectedPeriod !== 'all' ? { date: dateFilter } : {}),
        supabase
          .from('investment_sales')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .match(selectedPeriod !== 'all' ? { date: dateFilter } : {}),
        supabase
          .from('policy_sales')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .match(selectedPeriod !== 'all' ? { date: dateFilter } : {})
      ]);

      // Handle errors if any
      if (pensionError) console.error('Error loading pension sales:', pensionError);
      if (insuranceError) console.error('Error loading insurance sales:', insuranceError);
      if (investmentError) console.error('Error loading investment sales:', investmentError);
      if (policyError) console.error('Error loading policy sales:', policyError);

      // Log loaded data
      console.log('Loaded data:', {
        pension: pensionData || [],
        insurance: insuranceData || [],
        investment: investmentData || [],
        policy: policyData || []
      });

      // Update state only if component is still mounted
      setPensionSales(pensionData || []);
      setInsuranceSales(insuranceData || []);
      setInvestmentSales(investmentData || []);
      setPolicySales(policyData || []);

    } catch (error) {
      console.error('Error loading sales data:', error);
      toast.error('שגיאה בטעינת נתוני המכירות');
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [selectedPeriod]); // Only depend on selectedPeriod

  // Load data on mount and when period changes
  React.useEffect(() => {
    loadSalesData();
  }, [loadSalesData]);

  const calculateTotalRevenue = () => {
    const allSales = [...pensionSales, ...insuranceSales, ...investmentSales, ...policySales];
    return allSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0);
  };

  const formatCurrency = (amount: number | undefined | null) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num: number | undefined | null) => {
    return new Intl.NumberFormat('he-IL', {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  const formatPercentage = (value: number | undefined | null) => {
    return value ? `${formatNumber(value)}%` : '0%';
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: he });
    } catch {
      return date;
    }
  };

  const renderPensionTable = (sales: PensionProduct[]) => {
    const filteredSales = sales.filter(sale => 
      sale.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="overflow-x-auto rounded-md">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">סה"כ עמלה</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלת היקף</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלת היקף על הצבירה</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[100px]">הפרשה</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">סכום ניוד</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">שכר</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">חברה</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">שם לקוח</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">תאריך</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center p-8 text-muted-foreground">
                  לא נמצאו תוצאות
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-right font-medium w-[150px]">{formatCurrency(sale.total_commission)}</td>
                  <td className="p-3 text-right w-[150px]">{formatCurrency(sale.scope_commission)}</td>
                  <td className="p-3 text-right w-[150px]">{formatCurrency(sale.monthly_commission)}</td>
                  <td className="p-3 text-right w-[100px]">{formatPercentage(sale.pensioncontribution)}</td>
                  <td className="p-3 text-right w-[150px]">{formatCurrency(sale.pensionaccumulation)}</td>
                  <td className="p-3 text-right w-[150px]">{formatCurrency(sale.pensionsalary)}</td>
                  <td className="p-3 text-right w-[120px]">{sale.company}</td>
                  <td className="p-3 text-right w-[150px]">{sale.client_name}</td>
                  <td className="p-3 text-right w-[120px]">{formatDate(sale.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderInsuranceTable = (sales: InsuranceProduct[]) => {
    const filteredSales = sales.filter(sale => 
      sale.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="overflow-x-auto rounded-md">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">סה"כ עמלה</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלת היקף</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלת נפרעים שנתית</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">פרמיה</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">סוג ביטוח</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">אופן תשלום</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">חברה</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">שם לקוח</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">תאריך</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center p-8 text-muted-foreground">
                  לא נמצאו תוצאות
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-right font-medium w-[150px]">{formatCurrency(sale.total_commission)}</td>
                  <td className="p-3 text-right w-[150px]">{formatCurrency(sale.scope_commission)}</td>
                  <td className="p-3 text-right w-[150px]">{formatCurrency(sale.monthly_commission * 12)}</td>
                  <td className="p-3 text-right w-[150px]">{formatCurrency(sale.premium)}</td>
                  <td className="p-3 text-right w-[120px]">{sale.insurance_type}</td>
                  <td className="p-3 text-right w-[120px]">{sale.payment_method}</td>
                  <td className="p-3 text-right w-[120px]">{sale.company}</td>
                  <td className="p-3 text-right w-[150px]">{sale.client_name}</td>
                  <td className="p-3 text-right w-[120px]">{formatDate(sale.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderInvestmentTable = (sales: InvestmentProduct[]) => {
    const filteredSales = sales.filter(sale => 
      sale.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="overflow-x-auto rounded-md">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">סה"כ עמלה</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלת היקף</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">נפרעים</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">סכום השקעה</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">סוג השקעה</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">חברה</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">שם לקוח</th>
              <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">תאריך</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-8 text-muted-foreground">
                  לא נמצאו תוצאות
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-right font-medium w-[150px]">{formatCurrency(sale.total_commission)}</td>
                  <td className="p-3 text-right w-[150px]">{formatCurrency(sale.scope_commission)}</td>
                  <td className="p-3 text-right w-[150px]">{formatCurrency((sale.monthly_commission || 0) * 12)}</td>
                  <td className="p-3 text-right w-[150px]">{formatCurrency(sale.investment_amount)}</td>
                  <td className="p-3 text-right w-[120px]">{sale.investment_type}</td>
                  <td className="p-3 text-right w-[120px]">{sale.company}</td>
                  <td className="p-3 text-right w-[150px]">{sale.client_name}</td>
                  <td className="p-3 text-right w-[120px]">{formatDate(sale.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className="container space-y-6" dir="rtl">
        {/* כותרת וקדי סינון */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
          <h1 className="text-2xl font-semibold">דוחות מכירות</h1>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי שם לקוח או חברה"
                className="pr-3 pl-10 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full md:w-[140px] h-9">
                <SelectValue placeholder="בחר תקופה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הזמנים</SelectItem>
                <SelectItem value="week">שבוע אחרון</SelectItem>
                <SelectItem value="month">חודש אחרון</SelectItem>
                <SelectItem value="quarter">רבעון אחרון</SelectItem>
                <SelectItem value="year">שנה אחרונה</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadSalesData} disabled={isLoading} className="h-9 px-3">
              <ArrowUpRight className="h-4 w-4 ml-1" />
              {isLoading ? 'טוען...' : 'רענן'}
            </Button>
          </div>
        </div>

        {/* כרטיסי סיכום */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white">
            <CardHeader className="pb-2 space-y-0">
              <div className="flex items-center justify-end gap-2">
                <CardTitle className="text-base font-medium">מכירות פנסיה</CardTitle>
                <Building2 className="h-4 w-4 opacity-90" />
              </div>
            </CardHeader>
            <CardContent className="text-right">
              <div className="text-2xl font-semibold">{formatCurrency(pensionSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0))}</div>
              <div className="text-sm opacity-90">{pensionSales.length} מכירות</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/90 to-purple-600/90 text-white">
            <CardHeader className="pb-2 space-y-0">
              <div className="flex items-center justify-end gap-2">
                <CardTitle className="text-base font-medium">מכירות ביטוח</CardTitle>
                <Shield className="h-4 w-4 opacity-90" />
              </div>
            </CardHeader>
            <CardContent className="text-right">
              <div className="text-2xl font-semibold">{formatCurrency(insuranceSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0))}</div>
              <div className="text-sm opacity-90">{insuranceSales.length} מכירות</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/90 to-green-600/90 text-white">
            <CardHeader className="pb-2 space-y-0">
              <div className="flex items-center justify-end gap-2">
                <CardTitle className="text-base font-medium">מכירות פיננסים</CardTitle>
                <PiggyBank className="h-4 w-4 opacity-90" />
              </div>
            </CardHeader>
            <CardContent className="text-right">
              <div className="text-2xl font-semibold">{formatCurrency(investmentSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0))}</div>
              <div className="text-sm opacity-90">{investmentSales.length} מכירות</div>
            </CardContent>
          </Card>
        </div>

        {/* טאבים לטבלאות */}
        <Tabs defaultValue="pension" className="space-y-4">
          <TabsList className="w-full justify-end bg-muted/40 p-1">
            <TabsTrigger value="investment" className="flex items-center gap-2 data-[state=active]:bg-background">
              פיננסים
              <PiggyBank className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="insurance" className="flex items-center gap-2 data-[state=active]:bg-background">
              ביטוח
              <Shield className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="pension" className="flex items-center gap-2 data-[state=active]:bg-background">
              פנסיה
              <Building2 className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pension">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-end gap-2">
                  <CardTitle className="text-xl">מכירות פנסיה</CardTitle>
                  <Building2 className="h-5 w-5" />
                </div>
                <CardDescription className="text-right">כל מכירות הפנסיה שלך במקום אחד</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {renderPensionTable(pensionSales)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insurance">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">מכירות ביטוח</CardTitle>
                <CardDescription>כל מכירות הביטוח שלך במקום אחד</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {renderInsuranceTable(insuranceSales)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investment">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">מכירות פיננסים</CardTitle>
                <CardDescription>כל מכירות הפיננסים שלך במקום אחד</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {renderInvestmentTable(investmentSales)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Monthly Report Button */}
        <div className="mt-6">
          <Button 
            onClick={() => setShowMonthlyReport(true)}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            הצג דוח חודשי
          </Button>
        </div>
      </div>

      {showMonthlyReport && (
        <Dialog open={showMonthlyReport} onOpenChange={setShowMonthlyReport}>
          <DialogContent className="max-w-4xl">
            <MonthlyReport
              data={{
                total: {
                  count: pensionSales.length + insuranceSales.length + investmentSales.length,
                  commission: calculateTotalRevenue(),
                  pension: {
                    count: pensionSales.length,
                    commission: pensionSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0)
                  },
                  insurance: {
                    count: insuranceSales.length,
                    commission: insuranceSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0)
                  },
                  investment: {
                    count: investmentSales.length,
                    commission: investmentSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0)
                  }
                },
                byCompany: {
                  pension: groupByCompany(pensionSales),
                  insurance: groupByCompany(insuranceSales),
                  investment: groupByCompany(investmentSales)
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

// Helper function to group sales by company
const groupByCompany = (sales: any[]) => {
  return sales.reduce((acc: { [key: string]: any }, sale: any) => {
    if (!acc[sale.company]) {
      acc[sale.company] = {
        count: 0,
        commission: 0,
        nifraim: 0,
        total_amount: 0
      };
    }
    acc[sale.company].count++;
    acc[sale.company].commission += sale.total_commission || 0;
    acc[sale.company].nifraim += (sale.monthly_commission || 0) * 12;
    acc[sale.company].total_amount += sale.investment_amount || sale.premium || 0;
    return acc;
  }, {});
};

export default Reports;