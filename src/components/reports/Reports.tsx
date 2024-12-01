import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Share2, 
  Filter, 
  Calendar,
  Building2,
  Shield,
  PiggyBank,
  Wallet,
  Search,
  ArrowUpRight
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

const Reports: React.FC = () => {
  const [pensionSales, setPensionSales] = React.useState<PensionProduct[]>([]);
  const [insuranceSales, setInsuranceSales] = React.useState<InsuranceProduct[]>([]);
  const [investmentSales, setInvestmentSales] = React.useState<InvestmentProduct[]>([]);
  const [policySales, setPolicySales] = React.useState<PolicyProduct[]>([]);
  const [selectedPeriod, setSelectedPeriod] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
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
              <th className="p-3 text-right font-medium">סה"כ עמלה</th>
              <th className="p-3 text-right font-medium">עמלת היקף</th>
              <th className="p-3 text-right font-medium">עמלה חודשית</th>
              <th className="p-3 text-right font-medium">הפרשה</th>
              <th className="p-3 text-right font-medium">צבירה</th>
              <th className="p-3 text-right font-medium">שכר</th>
              <th className="p-3 text-right font-medium">חברה</th>
              <th className="p-3 text-right font-medium">שם לקוח</th>
              <th className="p-3 text-right font-medium">תאריך</th>
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
                  <td className="p-3 font-medium">{formatCurrency(sale.total_commission)}</td>
                  <td className="p-3">{formatCurrency(sale.scope_commission)}</td>
                  <td className="p-3">{formatCurrency(sale.monthly_commission)}</td>
                  <td className="p-3">{formatPercentage(sale.provision)}</td>
                  <td className="p-3">{formatCurrency(sale.accumulation)}</td>
                  <td className="p-3">{formatCurrency(sale.salary)}</td>
                  <td className="p-3">{sale.company}</td>
                  <td className="p-3">{sale.client_name}</td>
                  <td className="p-3">{formatDate(sale.date)}</td>
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
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center p-8 text-muted-foreground">
                  לא נמצאו תוצאות
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{formatCurrency(sale.total_commission)}</td>
                  <td className="p-3">{formatCurrency(sale.scope_commission)}</td>
                  <td className="p-3">{formatCurrency(sale.nifraim)}</td>
                  <td className="p-3">{formatCurrency(sale.premium)}</td>
                  <td className="p-3">{sale.insurance_type}</td>
                  <td className="p-3">{sale.payment_method}</td>
                  <td className="p-3">{sale.company}</td>
                  <td className="p-3">{sale.client_name}</td>
                  <td className="p-3">{formatDate(sale.date)}</td>
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
              <th className="p-3 text-right font-medium">סה"כ עמלה</th>
              <th className="p-3 text-right font-medium">עמלת היקף</th>
              <th className="p-3 text-right font-medium">סכום השקעה</th>
              <th className="p-3 text-right font-medium">תקופת השקעה</th>
              <th className="p-3 text-right font-medium">סוג השקעה</th>
              <th className="p-3 text-right font-medium">חברה</th>
              <th className="p-3 text-right font-medium">שם לקוח</th>
              <th className="p-3 text-right font-medium">תאריך</th>
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
                  <td className="p-3 font-medium">{formatCurrency(sale.total_commission)}</td>
                  <td className="p-3">{formatCurrency(sale.scope_commission)}</td>
                  <td className="p-3">{formatCurrency(sale.investment_amount)}</td>
                  <td className="p-3">{sale.investment_period} חודשים</td>
                  <td className="p-3">{sale.investment_type}</td>
                  <td className="p-3">{sale.company}</td>
                  <td className="p-3">{sale.client_name}</td>
                  <td className="p-3">{formatDate(sale.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPolicyTable = (sales: PolicyProduct[]) => {
    const filteredSales = sales.filter(sale => 
      sale.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="overflow-x-auto rounded-md">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-right font-medium">סה"כ עמלה</th>
              <th className="p-3 text-right font-medium">עמלת היקף</th>
              <th className="p-3 text-right font-medium">סכום פוליסה</th>
              <th className="p-3 text-right font-medium">תקופת פוליסה</th>
              <th className="p-3 text-right font-medium">סוג פוליסה</th>
              <th className="p-3 text-right font-medium">חברה</th>
              <th className="p-3 text-right font-medium">שם לקוח</th>
              <th className="p-3 text-right font-medium">תאריך</th>
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
                  <td className="p-3 font-medium">{formatCurrency(sale.total_commission)}</td>
                  <td className="p-3">{formatCurrency(sale.scope_commission)}</td>
                  <td className="p-3">{formatCurrency(sale.policy_amount)}</td>
                  <td className="p-3">{sale.policy_period} חודשים</td>
                  <td className="p-3">{sale.policy_type}</td>
                  <td className="p-3">{sale.company}</td>
                  <td className="p-3">{sale.client_name}</td>
                  <td className="p-3">{formatDate(sale.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 text-right" dir="rtl">
      {/* כותרת ופקדי סינון */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">דוחות מכירות</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש לפי שם לקוח או חברה"
              className="pr-3 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full md:w-[160px]">
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
          <Button variant="outline" onClick={loadSalesData} disabled={isLoading} className="gap-2">
            <ArrowUpRight className="h-4 w-4 ml-1" />
            {isLoading ? 'טוען...' : 'רענן'}
          </Button>
        </div>
      </div>

      {/* כרטיסי סיכום */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 opacity-80" />
              <CardTitle className="text-lg font-semibold">מכירות פנסיה</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pensionSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0))}</div>
            <div className="text-sm opacity-80 mt-1">{pensionSales.length} מכירות</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 opacity-80" />
              <CardTitle className="text-lg font-semibold">מכירות ביטוח</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(insuranceSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0))}</div>
            <div className="text-sm opacity-80 mt-1">{insuranceSales.length} מכירות</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 opacity-80" />
              <CardTitle className="text-lg font-semibold">מכירות השקעות</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(investmentSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0))}</div>
            <div className="text-sm opacity-80 mt-1">{investmentSales.length} מכירות</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 opacity-80" />
              <CardTitle className="text-lg font-semibold">מכירות פוליסות</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(policySales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0))}</div>
            <div className="text-sm opacity-80 mt-1">{policySales.length} מכירות</div>
          </CardContent>
        </Card>
      </div>

      {/* טאבים לטבלאות */}
      <Tabs defaultValue="pension" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="pension" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            פנסיה
          </TabsTrigger>
          <TabsTrigger value="insurance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            ביטוח
          </TabsTrigger>
          <TabsTrigger value="investment" className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            השקעות
          </TabsTrigger>
          <TabsTrigger value="policy" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            פוליסות
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pension">
          <Card>
            <CardHeader>
              <CardTitle>מכ��רות פנסיה</CardTitle>
              <CardDescription>כל מכירות הפנסיה שלך במקום אחד</CardDescription>
            </CardHeader>
            <CardContent>
              {renderPensionTable(pensionSales)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance">
          <Card>
            <CardHeader>
              <CardTitle>מכירות ביטוח</CardTitle>
              <CardDescription>כל מכירות הביטוח שלך במקום אחד</CardDescription>
            </CardHeader>
            <CardContent>
              {renderInsuranceTable(insuranceSales)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investment">
          <Card>
            <CardHeader>
              <CardTitle>מכירות השקעות</CardTitle>
              <CardDescription>כל מכירות ההשקעות שלך במקום אחד</CardDescription>
            </CardHeader>
            <CardContent>
              {renderInvestmentTable(investmentSales)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy">
          <Card>
            <CardHeader>
              <CardTitle>מכירות פוליסות</CardTitle>
              <CardDescription>כל מכירות הפוליסות שלך במקום אחד</CardDescription>
            </CardHeader>
            <CardContent>
              {renderPolicyTable(policySales)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;