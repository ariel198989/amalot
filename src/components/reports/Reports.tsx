import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2, Filter, Calendar, Search, Shield, PiggyBank } from 'lucide-react';
import { Input } from "@/components/ui/input";
import html2pdf from 'html2pdf.js';
import { utils as XLSXUtils, write as XLSXWrite } from 'xlsx';
import { saveAs } from 'file-saver';

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

  const generateMonthlySummaryPDF = () => {
    try {
      const element = document.createElement('div');
      const currentDate = new Date().toLocaleDateString('he-IL');
      const totalPensionCommission = pensionSales.reduce((sum, sale) => sum + sale.total_commission, 0);
      const totalInsuranceCommission = insuranceSales.reduce((sum, sale) => sum + sale.total_commission, 0);
      const totalInvestmentCommission = investmentSales.reduce((sum, sale) => sum + sale.total_commission, 0);
      const totalPolicyCommission = policySales.reduce((sum, sale) => sum + sale.total_commission, 0);

      element.innerHTML = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="text-align: center; margin: 0; font-size: 28px;">דוח מסכם חודשי</h1>
            <p style="text-align: center; margin-top: 10px;">${currentDate}</p>
          </div>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #0369a1; border-bottom: 2px solid #38bdf8; padding-bottom: 10px;">סיכום מכירות פנסיה</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr style="background: #e0f2fe;">
                <th style="padding: 12px; text-align: right; border: 1px solid #bae6fd;">חברה</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #bae6fd;">מספר מכירות</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #bae6fd;">סה"כ עמלות</th>
              </tr>
              ${Object.entries(
                pensionSales.reduce((acc, sale) => {
                  acc[sale.company] = acc[sale.company] || { count: 0, total: 0 };
                  acc[sale.company].count++;
                  acc[sale.company].total += sale.total_commission;
                  return acc;
                }, {} as Record<string, { count: number; total: number }>)
              ).map(([company, data]) => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #bae6fd;">${company}</td>
                  <td style="padding: 12px; border: 1px solid #bae6fd;">${data.count}</td>
                  <td style="padding: 12px; border: 1px solid #bae6fd;">₪${data.total.toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr style="background: #e0f2fe; font-weight: bold;">
                <td style="padding: 12px; border: 1px solid #bae6fd;">סה"כ</td>
                <td style="padding: 12px; border: 1px solid #bae6fd;">${pensionSales.length}</td>
                <td style="padding: 12px; border: 1px solid #bae6fd;">₪${totalPensionCommission.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <!-- Similar sections for insurance, investments, and policies -->

          <div style="background: #047857; color: white; padding: 20px; border-radius: 10px; margin-top: 30px;">
            <h2 style="margin: 0 0 15px 0; border-bottom: 2px solid white; padding-bottom: 10px;">סיכום כללי</h2>
            <table style="width: 100%; color: white;">
              <tr>
                <td style="padding: 8px;">סה"כ עמלות פנסיה:</td>
                <td style="padding: 8px; text-align: left;">₪${totalPensionCommission.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">סה"כ עמלות ביטוח:</td>
                <td style="padding: 8px; text-align: left;">₪${totalInsuranceCommission.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">סה"כ עמלות השקעות:</td>
                <td style="padding: 8px; text-align: left;">₪${totalInvestmentCommission.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">סה"כ עמלות פוליסות:</td>
                <td style="padding: 8px; text-align: left;">₪${totalPolicyCommission.toLocaleString()}</td>
              </tr>
              <tr style="font-size: 1.2em; font-weight: bold;">
                <td style="padding: 8px;">סה"כ עמלות:</td>
                <td style="padding: 8px; text-align: left;">₪${(
                  totalPensionCommission +
                  totalInsuranceCommission +
                  totalInvestmentCommission +
                  totalPolicyCommission
                ).toLocaleString()}</td>
              </tr>
            </table>
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `דוח_מסכם_חודשי_${currentDate}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(element).set(opt).save();
    } catch (error) {
      console.error('Error generating monthly summary PDF:', error);
      toast.error('אירעה שגיאה ביצירת הדוח');
    }
  };

  const downloadMonthlyExcel = () => {
    try {
      const summaryData = [
        {
          'סוג מו��ר': 'פנסיה',
          'מספר מכירות': pensionSales.length,
          'סה"כ עמלות': pensionSales.reduce((sum, sale) => sum + sale.total_commission, 0)
        },
        {
          'סוג מוצר': 'ביטוח',
          'מספר מכירות': insuranceSales.length,
          'סה"כ עמלות': insuranceSales.reduce((sum, sale) => sum + sale.total_commission, 0)
        },
        {
          'סוג מוצר': 'השקעות',
          'מספר מכירות': investmentSales.length,
          'סה"כ עמלות': investmentSales.reduce((sum, sale) => sum + sale.total_commission, 0)
        },
        {
          'סוג מוצר': 'פוליסות חיסכון',
          'מספר מכירות': policySales.length,
          'סה"כ עמלות': policySales.reduce((sum, sale) => sum + sale.total_commission, 0)
        }
      ];

      const worksheet = XLSXUtils.json_to_sheet(summaryData);
      const workbook = XLSXUtils.book_new();
      XLSXUtils.book_append_sheet(workbook, worksheet, "סיכום חודשי");
      
      const excelBuffer = XLSXWrite(workbook, { bookType: 'xlsx', type: 'array' });
      const currentDate = new Date().toLocaleDateString('he-IL');
      saveAs(
        new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 
        `דוח_מסכם_חודשי_${currentDate}.xlsx`
      );

      toast.success('הדוח הורד בהצלחה!');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('אירעה שגיאה בהורדת הדוח');
    }
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
                דוח מכירות גמל והשתלמ��ת
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

      <div className="flex gap-4 justify-end">
        <Button 
          onClick={generateMonthlySummaryPDF}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <FileText className="h-4 w-4" />
          הורד דוח מסכם חודשי (PDF)
        </Button>
        <Button 
          onClick={downloadMonthlyExcel}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Download className="h-4 w-4" />
          הורד דוח מסכם חודשי (Excel)
        </Button>
      </div>
    </div>
  );
};

export default Reports; 