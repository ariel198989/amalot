import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2, Filter, Calendar, Search, Shield, PiggyBank, TrendingUp, DollarSign, CreditCard, BarChart2, Wallet, LineChart, PieChart, Percent, Trash2, ArrowUpRight, Users, SlidersHorizontal } from 'lucide-react';
import { Input } from "@/components/ui/input";
import html2pdf from 'html2pdf.js';
import { utils as XLSXUtils, write as XLSXWrite } from 'xlsx';
import { saveAs } from 'file-saver';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports: React.FC = () => {
  const [pensionSales, setPensionSales] = React.useState<any[]>([]);
  const [insuranceSales, setInsuranceSales] = React.useState<any[]>([]);
  const [investmentSales, setInvestmentSales] = React.useState<any[]>([]);
  const [policySales, setPolicySales] = React.useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadSalesData();
  }, [selectedPeriod]);

  const loadSalesData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const query = supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedPeriod !== 'all') {
        const today = new Date();
        let startDate = new Date();
        
        switch(selectedPeriod) {
          case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(today.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(today.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(today.getFullYear() - 1);
            break;
        }
        
        query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setPensionSales(data?.filter(sale => sale.sale_type === 'pension') || []);
      setInsuranceSales(data?.filter(sale => sale.sale_type === 'insurance') || []);
      setInvestmentSales(data?.filter(sale => sale.sale_type === 'investment') || []);
      setPolicySales(data?.filter(sale => sale.sale_type === 'policy') || []);

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

  const calculateMonthlyGrowth = () => {
    const allSales = [...pensionSales, ...insuranceSales, ...investmentSales, ...policySales];
    const thisMonth = new Date().getMonth();
    const thisMonthSales = allSales.filter(sale => new Date(sale.created_at).getMonth() === thisMonth);
    const lastMonthSales = allSales.filter(sale => new Date(sale.created_at).getMonth() === thisMonth - 1);
    
    const thisMonthTotal = thisMonthSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0);
    const lastMonthTotal = lastMonthSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0);
    
    if (lastMonthTotal === 0) return 100;
    return ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
  };

  return (
    <div className="p-6 space-y-6 rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">דשבורד מכירות</h1>
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
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
          <Button variant="outline" onClick={() => loadSalesData()} disabled={isLoading}>
            <LineChart className="h-4 w-4 ml-2" />
            {isLoading ? 'טוען...' : 'רענן נתונים'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium opacity-90">סה"כ הכנסות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{calculateTotalRevenue().toLocaleString()}</div>
            <div className="flex items-center mt-2 text-sm opacity-80">
              <ArrowUpRight className="h-4 w-4 ml-1" />
              <span>{calculateMonthlyGrowth().toFixed(1)}% מהחודש הקודם</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium opacity-90">מכירות פנסיה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pensionSales.length}</div>
            <div className="text-sm opacity-80 mt-2">
              ₪{pensionSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0).toLocaleString()} בעמלות
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium opacity-90">מכירות ביטוח</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insuranceSales.length}</div>
            <div className="text-sm opacity-80 mt-2">
              ₪{insuranceSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0).toLocaleString()} בעמלות
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium opacity-90">מכירות השקעות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investmentSales.length}</div>
            <div className="text-sm opacity-80 mt-2">
              ₪{investmentSales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0).toLocaleString()} בעמלות
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>פעילות אחרונה</CardTitle>
            <CardDescription>מכירות אחרונות מכל הקטגוריות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">טוען נתונים...</div>
              ) : [...pensionSales, ...insuranceSales, ...investmentSales, ...policySales]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 10)
                .map((sale, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      {sale.sale_type === 'pension' && <PiggyBank className="h-5 w-5 text-green-500" />}
                      {sale.sale_type === 'insurance' && <Shield className="h-5 w-5 text-purple-500" />}
                      {sale.sale_type === 'investment' && <TrendingUp className="h-5 w-5 text-orange-500" />}
                      {sale.sale_type === 'policy' && <FileText className="h-5 w-5 text-blue-500" />}
                      <div>
                        <div className="font-medium">{sale.company}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(sale.created_at).toLocaleDateString('he-IL')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₪{sale.total_commission?.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">עמלה</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ביצועים לפי חברה</CardTitle>
            <CardDescription>התפלגות מכירות לפי חברות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">טוען נתונים...</div>
              ) : Object.entries(
                [...pensionSales, ...insuranceSales, ...investmentSales, ...policySales].reduce((acc, sale) => {
                  if (!acc[sale.company]) {
                    acc[sale.company] = { count: 0, commission: 0 };
                  }
                  acc[sale.company].count++;
                  acc[sale.company].commission += sale.total_commission || 0;
                  return acc;
                }, {} as Record<string, { count: number; commission: number }>)
              )
                .sort((a, b) => b[1].commission - a[1].commission)
                .slice(0, 10)
                .map(([company, data], index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <div className="font-medium">{company}</div>
                      <div className="text-sm text-gray-500">{data.count} מכירות</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₪{data.commission.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">סה"כ עמלות</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;