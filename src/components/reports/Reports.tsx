import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2 } from 'lucide-react';

const Reports: React.FC = () => {
  const [pensionSales, setPensionSales] = React.useState<any[]>([]);
  const [insuranceSales, setInsuranceSales] = React.useState<any[]>([]);
  const [investmentSales, setInvestmentSales] = React.useState<any[]>([]);
  const [policySales, setPolicySales] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadSalesData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return;

        // טעינת כל הנתונים
        const { data: pensionData } = await supabase
          .from('pension_sales')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        
        const { data: insuranceData } = await supabase
          .from('insurance_sales')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        
        const { data: investmentData } = await supabase
          .from('investment_sales')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        
        const { data: policyData } = await supabase
          .from('policy_sales')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        setPensionSales(pensionData || []);
        setInsuranceSales(insuranceData || []);
        setInvestmentSales(investmentData || []);
        setPolicySales(policyData || []);

      } catch (error: any) {
        console.error('Error loading data:', error);
        toast.error('אירעה שגיאה בטעינת הנתונים');
      }
    };

    loadSalesData();
  }, []);

  const tableClasses = {
    table: "w-full border-collapse",
    th: "bg-gray-100 text-right p-3 border border-gray-200 font-medium text-gray-600",
    td: "p-3 border border-gray-200 text-gray-800",
    tr: "hover:bg-gray-50 transition-colors"
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">דוחות מכירות</h1>
        <div className="flex gap-4">
          <Button variant="outline" size="sm">
            <Download className="ml-2 h-4 w-4" />
            ייצא לאקסל
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="ml-2 h-4 w-4" />
            שתף
          </Button>
        </div>
      </div>

      <Tabs defaultValue="policy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-4 bg-gray-100 p-2 rounded-lg">
          <TabsTrigger 
            value="policy" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            פוליסות חיסכון
          </TabsTrigger>
          <TabsTrigger 
            value="investment"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            גמל והשתלמות
          </TabsTrigger>
          <TabsTrigger 
            value="pension"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            פנסיה
          </TabsTrigger>
          <TabsTrigger 
            value="insurance"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            ביטוח
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policy">
          <Card>
            <CardHeader>
              <CardTitle>דוח מכירות פוליסות חיסכון</CardTitle>
              <CardDescription>
                סך מכירות: {policySales.length} | 
                סך עמלות: ₪{policySales.reduce((sum, sale) => sum + sale.total_commission, 0).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className={tableClasses.table}>
                  <thead>
                    <tr>
                      <th className={tableClasses.th}>תאריך</th>
                      <th className={tableClasses.th}>שם לקוח</th>
                      <th className={tableClasses.th}>חברה</th>
                      <th className={tableClasses.th}>סכום הפקדה</th>
                      <th className={tableClasses.th}>עמלת היקף</th>
                      <th className={tableClasses.th}>סה"כ עמלה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policySales.map((sale, index) => (
                      <tr key={index} className={tableClasses.tr}>
                        <td className={tableClasses.td}>{sale.date}</td>
                        <td className={tableClasses.td}>{sale.client_name}</td>
                        <td className={tableClasses.td}>{sale.company}</td>
                        <td className={tableClasses.td}>{sale.amount?.toLocaleString()} ₪</td>
                        <td className={tableClasses.td}>{sale.scope_commission?.toLocaleString()} ₪</td>
                        <td className={tableClasses.td}>{sale.total_commission?.toLocaleString()} ₪</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* טאב השקעות */}
        <TabsContent value="investment">
          <Card>
            <CardHeader>
              <CardTitle>דוח מכירות גמל והשתלמות</CardTitle>
              <CardDescription>
                סך מכירות: {investmentSales.length} | 
                סך עמלות: ₪{investmentSales.reduce((sum, sale) => sum + sale.total_commission, 0).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className={tableClasses.table}>
                  <thead>
                    <tr>
                      <th className={tableClasses.th}>תאריך</th>
                      <th className={tableClasses.th}>שם לקוח</th>
                      <th className={tableClasses.th}>חברה</th>
                      <th className={tableClasses.th}>סכום ניוד</th>
                      <th className={tableClasses.th}>עמלת היקף</th>
                      <th className={tableClasses.th}>סה"כ עמלה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investmentSales.map((sale, index) => (
                      <tr key={index} className={tableClasses.tr}>
                        <td className={tableClasses.td}>{sale.date}</td>
                        <td className={tableClasses.td}>{sale.client_name}</td>
                        <td className={tableClasses.td}>{sale.company}</td>
                        <td className={tableClasses.td}>{sale.amount?.toLocaleString()} ₪</td>
                        <td className={tableClasses.td}>{sale.scope_commission?.toLocaleString()} ₪</td>
                        <td className={tableClasses.td}>{sale.total_commission?.toLocaleString()} ₪</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* המשך הטאבים... */}
        <TabsContent value="pension">
          <Card>
            <CardHeader>
              <CardTitle>דוח מכירות פנסיה</CardTitle>
              <CardDescription>
                סך מכירות: {pensionSales.length} | 
                סך עמלות: ₪{pensionSales.reduce((sum, sale) => sum + sale.total_commission, 0).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className={tableClasses.table}>
                  <thead>
                    <tr>
                      <th className={tableClasses.th}>תאריך</th>
                      <th className={tableClasses.th}>שם לקוח</th>
                      <th className={tableClasses.th}>חברה</th>
                      <th className={tableClasses.th}>שכר</th>
                      <th className={tableClasses.th}>צבירה</th>
                      <th className={tableClasses.th}>הפרשה</th>
                      <th className={tableClasses.th}>עמלת היקף</th>
                      <th className={tableClasses.th}>עמלת צבירה</th>
                      <th className={tableClasses.th}>סה"כ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pensionSales.map((sale, index) => (
                      <tr key={index} className={tableClasses.tr}>
                        <td className={tableClasses.td}>{sale.date}</td>
                        <td className={tableClasses.td}>{sale.client_name}</td>
                        <td className={tableClasses.td}>{sale.company}</td>
                        <td className={tableClasses.td}>{sale.salary?.toLocaleString()} ₪</td>
                        <td className={tableClasses.td}>{sale.accumulation?.toLocaleString()} ₪</td>
                        <td className={tableClasses.td}>{sale.provision}%</td>
                        <td className={tableClasses.td}>{sale.scope_commission?.toLocaleString()} ₪</td>
                        <td className={tableClasses.td}>{sale.accumulation_commission?.toLocaleString()} ₪</td>
                        <td className={tableClasses.td}>{sale.total_commission?.toLocaleString()} ₪</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance">
          <Card>
            <CardHeader>
              <CardTitle>דוח מכירות ביטוח</CardTitle>
              <CardDescription>
                סך מכירות: {insuranceSales.length} | 
                סך עמלות: ₪{insuranceSales.reduce((sum, sale) => sum + sale.total_commission, 0).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className={tableClasses.table}>
                  <thead>
                    <tr>
                      <th className={tableClasses.th}>תאריך</th>
                      <th className={tableClasses.th}>שם לקוח</th>
                      <th className={tableClasses.th}>חברה</th>
                      <th className={tableClasses.th}>סוג ביטוח</th>
                      <th className={tableClasses.th}>פרמיה חודשית</th>
                      <th className={tableClasses.th}>עמלה חד פעמית</th>
                      <th className={tableClasses.th}>עמלה חודשית</th>
                      <th className={tableClasses.th}>סה"כ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insuranceSales.map((sale, index) => (
                      <tr key={index} className={tableClasses.tr}>
                        <td className={tableClasses.td}>{sale.date}</td>
                        <td className={tableClasses.td}>{sale.client_name}</td>
                        <td className={tableClasses.td}>{sale.company}</td>
                        <td className={tableClasses.td}>{sale.insurance_type}</td>
                        <td className={tableClasses.td}>{sale.monthly_premium?.toLocaleString()} ₪</td>
                        <td className={tableClasses.td}>{sale.one_time_commission?.toLocaleString()} ₪</td>
                        <td className={tableClasses.td}>{sale.monthly_commission?.toLocaleString()} ₪</td>
                        <td className={tableClasses.td}>{sale.total_commission?.toLocaleString()} ₪</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports; 