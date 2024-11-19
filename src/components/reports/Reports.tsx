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
import { Select } from "@/components/ui/select";

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
    container: "bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden",
    header: "bg-gradient-to-r p-6",
    headerPension: "from-blue-50 to-white border-b",
    headerInsurance: "from-purple-50 to-white border-b",
    headerInvestment: "from-green-50 to-white border-b",
    headerPolicy: "from-indigo-50 to-white border-b",
    table: "w-full border-collapse",
    th: "bg-gray-50 text-right p-4 border-b border-gray-200 font-medium text-gray-600 text-sm",
    td: "p-4 border-b border-gray-200 text-gray-800",
    tr: "hover:bg-gray-50 transition-colors duration-150",
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
                  { name: 'פוליסות יסכון', sales: policySales, color: '#0284c7' }
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

  const handleDelete = async (type: string, id: string) => {
    try {
      let tableName = '';
      switch (type) {
        case 'pension':
          tableName = 'pension_sales';
          setPensionSales(prev => prev.filter(sale => sale.id !== id));
          break;
        case 'insurance':
          tableName = 'insurance_sales';
          setInsuranceSales(prev => prev.filter(sale => sale.id !== id));
          break;
        case 'investment':
          tableName = 'investment_sales';
          setInvestmentSales(prev => prev.filter(sale => sale.id !== id));
          break;
        case 'policy':
          tableName = 'policy_sales';
          setPolicySales(prev => prev.filter(sale => sale.id !== id));
          break;
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('הדוח נמחק בהצלחה');

    } catch (error: any) {
      console.error('Error deleting report:', error);
      toast.error('אירעה שגיאה במחיקת הדוח');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">דוחות מכירות</h1>
            <p className="mt-2 text-blue-100">סקירה מקיפה של כל המכירות והעמלות שלך</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={generateMonthlySummaryPDF}
              className="bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              הורד דוח מסכם (PDF)
            </Button>
            <Button 
              onClick={downloadMonthlyExcel}
              className="bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              הורד דוח מסכם (Excel)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100">סה"כ מכירות</p>
                <h3 className="text-2xl font-bold mt-1">
                  {(pensionSales.length + insuranceSales.length + 
                    investmentSales.length + policySales.length).toLocaleString()}
                </h3>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-blue-100" />
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100">סה"כ עמלות</p>
                <h3 className="text-2xl font-bold mt-1">
                  ₪{(
                    pensionSales.reduce((sum, sale) => sum + sale.total_commission, 0) +
                    insuranceSales.reduce((sum, sale) => sum + sale.total_commission, 0) +
                    investmentSales.reduce((sum, sale) => sum + sale.total_commission, 0) +
                    policySales.reduce((sum, sale) => sum + sale.total_commission, 0)
                  ).toLocaleString()}
                </h3>
              </div>
              <div className="bg-green-500/20 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className={tableClasses.container}>
        <CardHeader className={`${tableClasses.header} ${tableClasses.headerPension}`}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                דוח מכירות פנסיה
              </CardTitle>
              <CardDescription className="mt-2">
                <span className="font-medium">סך מכירות: </span>
                <span className="text-blue-600">{pensionSales.length}</span>
                <span className="mx-2">|</span>
                <span className="font-medium">סך עמלות: </span>
                <span className="text-green-600">
                  ₪{pensionSales.reduce((sum, sale) => sum + sale.total_commission, 0).toLocaleString()}
                </span>
              </CardDescription>
            </div>
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
                  <th className={tableClasses.th}>פעולות</th>
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
                    <td className={tableClasses.td}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete('pension', sale.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
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
                  <td className={tableClasses.td}></td>
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
                <span className="text-green-600">
                  ₪{insuranceSales.reduce((sum, sale) => sum + sale.total_commission, 0).toLocaleString()}
                </span>
              </CardDescription>
            </div>
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
                  <th className={tableClasses.th}>פרמיה</th>
                  <th className={tableClasses.th}>עמלה</th>
                  <th className={tableClasses.th}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {insuranceSales.map((sale, index) => (
                  <tr key={index} className={tableClasses.tr}>
                    <td className={tableClasses.td}>{sale.date}</td>
                    <td className={tableClasses.td}>{sale.client_name}</td>
                    <td className={tableClasses.td}>{sale.company}</td>
                    <td className={tableClasses.td}>{sale.insurance_type}</td>
                    <td className={tableClasses.td}>{sale.premium?.toLocaleString()} ₪</td>
                    <td className={tableClasses.td}>{sale.total_commission?.toLocaleString()} ₪</td>
                    <td className={tableClasses.td}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete('insurance', sale.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
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
                <LineChart className="h-5 w-5" />
                דוח מכירות השקעות
              </CardTitle>
              <CardDescription className="mt-2">
                <span className="font-medium">סך מכירות: </span>
                <span className="text-green-600">{investmentSales.length}</span>
                <span className="mx-2">|</span>
                <span className="font-medium">סך עמלות: </span>
                <span className="text-green-600">
                  ₪{investmentSales.reduce((sum, sale) => sum + sale.total_commission, 0).toLocaleString()}
                </span>
              </CardDescription>
            </div>
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
                  <th className={tableClasses.th}>סוג השקעה</th>
                  <th className={tableClasses.th}>סכום השקעה</th>
                  <th className={tableClasses.th}>עמלה</th>
                  <th className={tableClasses.th}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {investmentSales.map((sale, index) => (
                  <tr key={index} className={tableClasses.tr}>
                    <td className={tableClasses.td}>{sale.date}</td>
                    <td className={tableClasses.td}>{sale.client_name}</td>
                    <td className={tableClasses.td}>{sale.company}</td>
                    <td className={tableClasses.td}>{sale.investment_type}</td>
                    <td className={tableClasses.td}>{sale.investment_amount?.toLocaleString()} ₪</td>
                    <td className={tableClasses.td}>{sale.total_commission?.toLocaleString()} ₪</td>
                    <td className={tableClasses.td}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete('investment', sale.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
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
                דוח מכירות פוליסות
              </CardTitle>
              <CardDescription className="mt-2">
                <span className="font-medium">סך מכירות: </span>
                <span className="text-indigo-600">{policySales.length}</span>
                <span className="mx-2">|</span>
                <span className="font-medium">סך עמלות: </span>
                <span className="text-green-600">
                  ₪{policySales.reduce((sum, sale) => sum + sale.total_commission, 0).toLocaleString()}
                </span>
              </CardDescription>
            </div>
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
                  <th className={tableClasses.th}>סוג הפוליסות</th>
                  <th className={tableClasses.th}>סכום הפוליסות</th>
                  <th className={tableClasses.th}>עמלה</th>
                  <th className={tableClasses.th}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {policySales.map((sale, index) => (
                  <tr key={index} className={tableClasses.tr}>
                    <td className={tableClasses.td}>{sale.date}</td>
                    <td className={tableClasses.td}>{sale.client_name}</td>
                    <td className={tableClasses.td}>{sale.company}</td>
                    <td className={tableClasses.td}>{sale.policy_type}</td>
                    <td className={tableClasses.td}>{sale.policy_amount?.toLocaleString()} ₪</td>
                    <td className={tableClasses.td}>{sale.total_commission?.toLocaleString()} ₪</td>
                    <td className={tableClasses.td}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete('policy', sale.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
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