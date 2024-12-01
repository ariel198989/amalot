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

interface Sale {
  id: string;
  created_at: string;
  client_name: string;
  client_phone: string;
  company: string;
  date: string;
  total_commission: number;
  scope_commission: number;
  monthly_commission?: number;
  journey_id: string;
  // פנסיה
  pensionsalary?: number;
  pensionaccumulation?: number;
  pensioncontribution?: number;
  // ביטוח
  insurancepremium?: number;
  // השקעות
  investmentamount?: number;
  // פוליסות
  policyamount?: number;
}

const Reports: React.FC = () => {
  const [pensionSales, setPensionSales] = React.useState<Sale[]>([]);
  const [insuranceSales, setInsuranceSales] = React.useState<Sale[]>([]);
  const [investmentSales, setInvestmentSales] = React.useState<Sale[]>([]);
  const [policySales, setPolicySales] = React.useState<Sale[]>([]);
  const [selectedPeriod, setSelectedPeriod] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    loadSalesData();
  }, [selectedPeriod]);

  const loadSalesData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load pension sales
      const { data: pensionData } = await supabase
        .from('pension_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load insurance sales
      const { data: insuranceData } = await supabase
        .from('insurance_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load investment sales
      const { data: investmentData } = await supabase
        .from('investment_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load policy sales
      const { data: policyData } = await supabase
        .from('policy_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setPensionSales(pensionData || []);
      setInsuranceSales(insuranceData || []);
      setInvestmentSales(investmentData || []);
      setPolicySales(policyData || []);

    } catch (error) {
      console.error('Error loading sales data:', error);
      toast.error('שגיאה בטעינת נתוני המכירות');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalRevenue = () => {
    const allSales = [...pensionSales, ...insuranceSales, ...investmentSales, ...policySales];
    return allSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: he });
    } catch {
      return date;
    }
  };

  const renderSalesTable = (sales: Sale[], type: string) => {
    const filteredSales = sales.filter(sale => 
      sale.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="overflow-x-auto rounded-md">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {type === 'pension' && (
                <>
                  <th className="p-3 text-right font-medium">סה"כ עמלה</th>
                  <th className="p-3 text-right font-medium">עמלת היקף</th>
                  <th className="p-3 text-right font-medium">עמלה חודשית</th>
                  <th className="p-3 text-right font-medium">הפרשה</th>
                  <th className="p-3 text-right font-medium">צבירה</th>
                  <th className="p-3 text-right font-medium">שכר</th>
                </>
              )}
              {type === 'insurance' && (
                <>
                  <th className="p-3 text-right font-medium">פה"כ עמלה</th>
                  <th className="p-3 text-right font-medium">עמלת היקף</th>
                  <th className="p-3 text-right font-medium">עמלה חודשית</th>
                  <th className="p-3 text-right font-medium">פרמיה</th>
                </>
              )}
              {type === 'investment' && (
                <>
                  <th className="p-3 text-right font-medium">סה"כ עמלה</th>
                  <th className="p-3 text-right font-medium">עמלת היקף</th>
                  <th className="p-3 text-right font-medium">סכום</th>
                </>
              )}
              {type === 'policy' && (
                <>
                  <th className="p-3 text-right font-medium">סה"כ עמלה</th>
                  <th className="p-3 text-right font-medium">עמלת היקף</th>
                  <th className="p-3 text-right font-medium">סכום</th>
                </>
              )}
              <th className="p-3 text-right font-medium">חברה</th>
              <th className="p-3 text-right font-medium">שם לקוח</th>
              <th className="p-3 text-right font-medium">תאריך</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={type === 'pension' ? 9 : type === 'insurance' ? 7 : 6} className="text-center p-8 text-muted-foreground">
                  לא נמצאו תוצאות
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-muted/30 transition-colors">
                  {type === 'pension' && (
                    <>
                      <td className="p-3 font-medium">{formatCurrency(sale.total_commission || 0)}</td>
                      <td className="p-3">{formatCurrency(sale.scope_commission || 0)}</td>
                      <td className="p-3">{formatCurrency(sale.monthly_commission || 0)}</td>
                      <td className="p-3">{sale.pensioncontribution}%</td>
                      <td className="p-3">{formatCurrency(sale.pensionaccumulation || 0)}</td>
                      <td className="p-3">{formatCurrency(sale.pensionsalary || 0)}</td>
                    </>
                  )}
                  {type === 'insurance' && (
                    <>
                      <td className="p-3 font-medium">{formatCurrency(sale.total_commission || 0)}</td>
                      <td className="p-3">{formatCurrency(sale.scope_commission || 0)}</td>
                      <td className="p-3">{formatCurrency(sale.monthly_commission || 0)}</td>
                      <td className="p-3">{formatCurrency(sale.insurancepremium || 0)}</td>
                    </>
                  )}
                  {type === 'investment' && (
                    <>
                      <td className="p-3 font-medium">{formatCurrency(sale.total_commission || 0)}</td>
                      <td className="p-3">{formatCurrency(sale.scope_commission || 0)}</td>
                      <td className="p-3">{formatCurrency(sale.investmentamount || 0)}</td>
                    </>
                  )}
                  {type === 'policy' && (
                    <>
                      <td className="p-3 font-medium">{formatCurrency(sale.total_commission || 0)}</td>
                      <td className="p-3">{formatCurrency(sale.scope_commission || 0)}</td>
                      <td className="p-3">{formatCurrency(sale.policyamount || 0)}</td>
                    </>
                  )}
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
              <CardTitle>מכירות פנסיה</CardTitle>
              <CardDescription>כל מכירות הפנסיה שלך במקום אחד</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderSalesTable(pensionSales, 'pension')}
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
              {renderSalesTable(insuranceSales, 'insurance')}
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
              {renderSalesTable(investmentSales, 'investment')}
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
              {renderSalesTable(policySales, 'policy')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;