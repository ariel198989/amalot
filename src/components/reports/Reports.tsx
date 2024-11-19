import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2, Filter, Calendar, Search, Shield, PiggyBank, TrendingUp, DollarSign, CreditCard, BarChart2, Wallet, LineChart, PieChart, Percent } from 'lucide-react';
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
      const currentDate = new Date().toLocaleDateString('he-IL');
      const element = document.createElement('div');
      element.innerHTML = `
        <div dir="rtl" style="
          font-family: Arial, sans-serif;
          padding: 20px;
          font-size: 12px; /* הקטנת גודל הפונט */
          max-width: 800px;
          margin: 0 auto;
        ">
          <!-- כותרת מעוצבת -->
          <div style="
            text-align: center;
            background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%);
            padding: 40px 20px;
            border-radius: 15px;
            margin-bottom: 40px;
            box-shadow: 0 10px 25px rgba(37, 99, 235, 0.2);
            position: relative;
            overflow: hidden;
          ">
            <!-- אייקונים פיננסיים ברקע -->
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              opacity: 0.1;
              display: flex;
              flex-wrap: wrap;
              justify-content: space-around;
              padding: 20px;
            ">
              <div style="font-size: 24px;">₪</div>
              <div style="font-size: 24px;">$</div>
              <div style="font-size: 24px;">€</div>
              <div style="font-size: 24px;">📈</div>
              <div style="font-size: 24px;">📊</div>
              <div style="font-size: 24px;">💹</div>
              <div style="font-size: 24px;">📉</div>
              <div style="font-size: 24px;">🏦</div>
            </div>

            <!-- תוכן הכותרת -->
            <div style="position: relative;">
              <h1 style="
                color: white;
                font-size: 42px;
                margin: 0;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                letter-spacing: 2px;
                font-weight: bold;
              ">דוח מסכם חודשי</h1>
              <p style="
                color: rgba(255, 255, 255, 0.9);
                font-size: 20px;
                margin: 15px 0 0 0;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
              ">${currentDate}</p>
              
              <!-- קו מפריד דקורטיבי -->
              <div style="
                width: 100px;
                height: 4px;
                background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
                margin: 20px auto;
                border-radius: 2px;
              "></div>
            </div>
          </div>

          <!-- תוכן הדוח -->
          <div style="
            background: white;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            padding: 30px;
          ">
            <!-- כותרת משנית -->
            <div style="
              display: flex;
              align-items: center;
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 2px solid #e2e8f0;
            ">
              <div style="
                width: 40px;
                height: 40px;
                background: #2563eb;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 15px;
              ">
                <span style="color: white; font-size: 20px;">📊</span>
              </div>
              <div>
                <h2 style="
                  color: #1e40af;
                  margin: 0;
                  font-size: 24px;
                  font-weight: bold;
                ">סיכום מכירות ועמלות</h2>
                <p style="
                  color: #64748b;
                  margin: 5px 0 0 0;
                  font-size: 14px;
                ">פירוט מלא לפי סוגי מוצרים וחברות</p>
              </div>
            </div>

            <!-- טבלת נתונים -->
            <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 30px;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 15px; text-align: right; border-bottom: 2px solid #e2e8f0;">מוצר</th>
                  <th style="padding: 15px; text-align: right; border-bottom: 2px solid #e2e8f0;">מספר מכירות</th>
                  <th style="padding: 15px; text-align: right; border-bottom: 2px solid #e2e8f0;">סה"כ עמלות</th>
                  <th style="padding: 15px; text-align: right; border-bottom: 2px solid #e2e8f0;">אחוז מסה"כ</th>
                </tr>
              </thead>
              <tbody>
                ${[
                  { name: 'פנסיה', sales: pensionSales, color: '#0369a1' },
                  { name: 'ביטוח', sales: insuranceSales, color: '#9333ea' },
                  { name: 'גמל והשתלמות', sales: investmentSales, color: '#059669' },
                  { name: 'פוליסות חיסכון', sales: policySales, color: '#0284c7' }
                ].map(product => {
                  const total = product.sales.reduce((sum, sale) => sum + sale.total_commission, 0);
                  const grandTotal = pensionSales.reduce((sum, sale) => sum + sale.total_commission, 0) +
                                   insuranceSales.reduce((sum, sale) => sum + sale.total_commission, 0) +
                                   investmentSales.reduce((sum, sale) => sum + sale.total_commission, 0) +
                                   policySales.reduce((sum, sale) => sum + sale.total_commission, 0);
                  const percentage = (total / grandTotal * 100).toFixed(1);
                  
                  return `
                    <tr>
                      <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">
                        <div style="display: flex; align-items: center;">
                          <div style="width: 12px; height: 12px; border-radius: 50%; background: ${product.color}; margin-left: 8px;"></div>
                          ${product.name}
                        </div>
                      </td>
                      <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">${product.sales.length}</td>
                      <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">₪${total.toLocaleString()}</td>
                      <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">
                        <div style="
                          width: 200px;
                          height: 24px;
                          background: #f1f5f9;
                          border-radius: 12px;
                          overflow: hidden;
                          position: relative;
                        ">
                          <div style="
                            width: ${percentage}%;
                            height: 100%;
                            background: ${product.color};
                            opacity: 0.2;
                          "></div>
                          <div style="
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            font-weight: bold;
                            white-space: nowrap;
                          ">${percentage}%</div>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <!-- סיכום -->
            <div style="
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              margin-top: 30px;
            ">
              <h2 style="margin: 0 0 15px 0; font-size: 24px;">סיכום כללי</h2>
              <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
              ">
                <div>
                  <p style="margin: 0; font-size: 18px;">סך כל המכירות: ${
                    pensionSales.length + insuranceSales.length + 
                    investmentSales.length + policySales.length
                  }</p>
                  <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold;">
                    סה"כ עמלות: ₪${(
                      pensionSales.reduce((sum, sale) => sum + sale.total_commission, 0) +
                      insuranceSales.reduce((sum, sale) => sum + sale.total_commission, 0) +
                      investmentSales.reduce((sum, sale) => sum + sale.total_commission, 0) +
                      policySales.reduce((sum, sale) => sum + sale.total_commission, 0)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- חתימה -->
          <div style="text-align: center; margin-top: 40px; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">הופק באמצעות מערכת ניהול העמלות</p>
            <p style="margin: 5px 0 0 0;">${new Date().toLocaleDateString('he-IL')}</p>
          </div>
        </div>
      `;

      const opt = {
        margin: [5, 5, 5, 5], // הקטנת שוליים
        filename: `דוח_מסכם_חודשי_${currentDate}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true,
          hotfixes: ["px_scaling"]
        },
        pagebreak: { mode: 'avoid-all' } // מניעת שבירת עמודים אוטומטית
      };

      html2pdf()
        .from(element)
        .set(opt)
        .save();

      toast.success('הדוח נוצר בהצלחה!');
    } catch (error) {
      console.error('Error generating monthly summary PDF:', error);
      toast.error('אירעה שגיאה ביצירת הדוח');
    }
  };

  const downloadMonthlyExcel = () => {
    try {
      const summaryData = [
        {
          'סוג מוצר': 'פנסיה',
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
      XLSXUtils.book_append_sheet(workbook, worksheet, "סיכום חודי");
      
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
                דוח מכירות פנסי
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
                דוח מכירות גמל והשתלמת
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