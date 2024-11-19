import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2, Filter, Calendar, Search, Shield, PiggyBank } from 'lucide-react';
import { Input } from "@/components/ui/input";

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
    container: "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
    header: "bg-gradient-to-r p-6",
    headerPension: "from-blue-50 to-white border-b",
    headerInsurance: "from-purple-50 to-white border-b",
    headerInvestment: "from-green-50 to-white border-b",
    headerPolicy: "from-indigo-50 to-white border-b",
    table: "w-full border-collapse",
    th: "bg-gray-50 text-right p-4 border-b border-gray-200 font-medium text-gray-600 text-sm",
    td: "p-4 border-b border-gray-200 text-gray-800",
    tr: "hover:bg-gray-50 transition-colors",
    summary: "bg-gray-50 font-medium"
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">דוחות מכירות</h1>
        <p className="text-gray-500 mt-1">סקירה מקיפה של כל המכירות והעמלות שלך</p>
      </div>

      <Card className={tableClasses.container}>
        <CardHeader className={`${tableClasses.header} ${tableClasses.headerPension}`}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                דוח מכירות פנסיה
              </CardTitle>
              <CardDescription className="mt-2">
                <span className="font-medium">סך מכירות: </span>
                <span className="text-blue-600">{pensionSales.length}</span>
                <span className="mx-2">|</span>
                <span className="font-medium">סך עמלות: </span>
                <span className="text-green-600">₪{pensionSales.reduce((sum, sale) => sum + sale.total_commission, 0).toLocaleString()}</span>
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              ייצא לאקסל
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
                <tr className={tableClasses.summary}>
                  <td colSpan={6} className={tableClasses.td}>סה"כ</td>
                  <td className={tableClasses.td}>
                    ₪{pensionSales.reduce((sum, sale) => sum + sale.scope_commission, 0).toLocaleString()}
                  </td>
                  <td className={tableClasses.td}>
                    ₪{pensionSales.reduce((sum, sale) => sum + sale.accumulation_commission, 0).toLocaleString()}
                  </td>
                  <td className={tableClasses.td}>
                    ₪{pensionSales.reduce((sum, sale) => sum + sale.total_commission, 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className={tableClasses.container}>
        <CardHeader className={`${tableClasses.header} ${tableClasses.headerInsurance}`}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                דוח מכירות ביטוח
              </CardTitle>
              <CardDescription className="mt-2">
                <span className="font-medium">סך מכירות: </span>
                <span className="text-purple-600">{insuranceSales.length}</span>
                <span className="mx-2">|</span>
                <span className="font-medium">סך עמלות: </span>
                <span className="text-green-600">₪{insuranceSales.reduce((sum, sale) => sum + sale.total_commission, 0).toLocaleString()}</span>
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              ייצא לאקסל
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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

      <Card className={tableClasses.container}>
        <CardHeader className={`${tableClasses.header} ${tableClasses.headerInvestment}`}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-green-900 flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                דוח מכירות גמל והשתלמות
              </CardTitle>
              <CardDescription className="mt-2">
                <span className="font-medium">סך מכירות: </span>
                <span className="text-green-600">{investmentSales.length}</span>
                <span className="mx-2">|</span>
                <span className="font-medium">סך עמלות: </span>
                <span className="text-green-600">₪{investmentSales.reduce((sum, sale) => sum + sale.total_commission, 0).toLocaleString()}</span>
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              ייצא לאקסל
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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

      <Card className={tableClasses.container}>
        <CardHeader className={`${tableClasses.header} ${tableClasses.headerPolicy}`}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-indigo-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                דוח מכירות פוליסות חיסכון
              </CardTitle>
              <CardDescription className="mt-2">
                <span className="font-medium">סך מכירות: </span>
                <span className="text-indigo-600">{policySales.length}</span>
                <span className="mx-2">|</span>
                <span className="font-medium">סך עמלות: </span>
                <span className="text-green-600">₪{policySales.reduce((sum, sale) => sum + sale.total_commission, 0).toLocaleString()}</span>
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              ייצא לאקסל
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
    </div>
  );
};

export default Reports; 