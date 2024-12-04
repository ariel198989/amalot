import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSalesTargets } from '@/contexts/SalesTargetsContext';
import html2pdf from 'html2pdf.js';

interface TableData {
  id: string;
  title: string;
  bgColor: string;
  targets: number[];
  yearlyTotal: number;
}

interface TabData {
  id: string;
  title: string;
  color: string;
  tables: TableData[];
}

const SalesTargetsSystem: React.FC = () => {
  const { 
    closingRate, 
    monthlyMeetings, 
    isDirty,
    saveChanges 
  } = useSalesTargets();
  const [openTable, setOpenTable] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'investments' | 'services'>('investments');
  const [tablesData, setTablesData] = useState<TabData[]>([]);

  // פונקציה לחישוב יעד חודשי
  const calculateMonthlyTarget = (baseAmount: number, percentage: number = 100) => {
    return (baseAmount * (closingRate / 100) * monthlyMeetings * (percentage / 100));
  };

  // חישוב היעדים החודשיים לפי הנוסחה
  const getUpdatedTargets = (baseAmount: number, percentage: number = 100) => {
    const monthlyDistribution = [1, 1.05, 0.7, 1.15, 1, 1.15, 0.95, 0.95, 0.85, 0.95, 1.1, 1.15];
    const baseTarget = calculateMonthlyTarget(baseAmount, percentage);
    return monthlyDistribution.map(factor => Math.round(baseTarget * factor));
  };

  // עדכון הטבלאות כשיש שינוי בפרמטרים
  useEffect(() => {
    const updatedTabs: TabData[] = [
      {
        id: 'investments',
        title: 'השקעות ופיננסים',
        color: 'bg-blue-50',
        tables: [
          {
            id: "risks",
            title: "סיכונים",
            bgColor: "bg-blue-50",
            targets: getUpdatedTargets(150),
            yearlyTotal: calculateMonthlyTarget(150) * 12
          },
          { 
            id: "pension", 
            title: "פנסיוני", 
            bgColor: "bg-blue-50",
            targets: getUpdatedTargets(1500),
            yearlyTotal: calculateMonthlyTarget(1500) * 12
          },
          { 
            id: "pension-transfer", 
            title: "ניוד פנסיה", 
            bgColor: "bg-blue-50",
            targets: [5700000, 6000000, 3900000, 6600000, 5700000, 6600000, 5400000, 5400000, 4800000, 5400000, 6300000, 6600000],
            yearlyTotal: 68400000
          },
          { 
            id: "finance-transfer", 
            title: "פיננסים ניוד", 
            bgColor: "bg-blue-50",
            targets: [7600000, 8000000, 5200000, 8800000, 7600000, 8800000, 7200000, 7200000, 6400000, 7200000, 8400000, 8800000],
            yearlyTotal: 91200000
          },
          { 
            id: "regular-deposit", 
            title: "הפקדה שוטפת", 
            bgColor: "bg-blue-50",
            targets: [19000, 20000, 13000, 22000, 19000, 22000, 18000, 18000, 16000, 18000, 21000, 22000],
            yearlyTotal: 228000
          }
        ]
      },
      {
        id: 'services',
        title: 'שירותים',
        color: 'bg-orange-50',
        tables: [
          {
            id: "financial-planning",
            title: "תכנון פיננסי",
            bgColor: "bg-orange-50",
            targets: getUpdatedTargets(500, 35),
            yearlyTotal: calculateMonthlyTarget(500, 35) * 12
          },
          { 
            id: "family-economics", 
            title: "כלכלת המשפחה", 
            bgColor: "bg-orange-50",
            targets: [9.5, 10.0, 6.5, 11.0, 9.5, 11.0, 9.0, 9.0, 8.0, 9.0, 10.5, 11.0],
            yearlyTotal: 114.0
          },
          { 
            id: "employment", 
            title: "תעסוקה", 
            bgColor: "bg-orange-50",
            targets: [3.8, 4.0, 2.6, 4.4, 3.8, 4.4, 3.6, 3.6, 3.2, 3.6, 4.2, 4.4],
            yearlyTotal: 45.6
          },
          { 
            id: "organizational-consulting", 
            title: "ייעוץ עסקי ארגוני", 
            bgColor: "bg-orange-50",
            targets: [1.9, 2.0, 1.3, 2.2, 1.9, 2.2, 1.8, 1.8, 1.6, 1.8, 2.1, 2.2],
            yearlyTotal: 22.8
          },
          { 
            id: "retirement", 
            title: "פרישה", 
            bgColor: "bg-orange-50",
            targets: [2.66, 2.8, 1.82, 3.08, 2.66, 3.08, 2.52, 2.52, 2.24, 2.52, 2.94, 3.08],
            yearlyTotal: 31.9
          },
          { 
            id: "organizational-recruitment", 
            title: "גיוס ארגונים", 
            bgColor: "bg-orange-50",
            targets: [5.7, 6.0, 3.9, 6.6, 5.7, 6.6, 5.4, 5.4, 4.8, 5.4, 6.3, 6.6],
            yearlyTotal: 68.4
          },
          { 
            id: "loans", 
            title: "הלוואות", 
            bgColor: "bg-orange-50",
            targets: [7.6, 8.0, 5.2, 8.8, 7.6, 8.8, 7.2, 7.2, 6.4, 7.2, 8.4, 8.8],
            yearlyTotal: 91.2
          },
          { 
            id: "real-estate", 
            title: "נדל\"ן", 
            bgColor: "bg-orange-50",
            targets: [7.6, 8.0, 5.2, 8.8, 7.6, 8.8, 7.2, 7.2, 6.4, 7.2, 8.4, 8.8],
            yearlyTotal: 91.2
          },
          { 
            id: "mortgage", 
            title: "משכנתא", 
            bgColor: "bg-orange-50",
            targets: [3.8, 4.0, 2.6, 4.4, 3.8, 4.4, 3.6, 3.6, 3.2, 3.6, 4.2, 4.4],
            yearlyTotal: 45.6
          }
        ]
      }
    ];

    setTablesData(updatedTabs);
  }, [closingRate, monthlyMeetings]); // תלות בערכים שמשתנים

  const months = ['ינואר 24׳', 'פברואר 24׳', 'מרץ 24׳', 'אפריל 24׳', 'מאי 24׳', 'יוני 24׳',
                 'יולי 24׳', 'אוגוסט 24׳', 'ספטמבר 24׳', 'אוקטובר 24׳', 'נובמבר 24׳', 'דצמבר 24׳'];

  const renderTable = (table: TableData) => (
    <table className="w-full border-collapse min-w-max">
      <thead>
        <tr>
          <th className="text-right px-4 py-2 bg-blue-900 text-white">יעד</th>
          {months.map(month => (
            <th key={month} className="text-center px-4 py-2 bg-blue-900 text-white border-r border-blue-800">
              {month}
            </th>
          ))}
          <th className="text-center px-4 py-2 bg-blue-800 text-white border-r">סיכום שנתי</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-gray-200">
          <td className="text-right px-4 py-2">יעד</td>
          {table.targets.map((amount, i) => (
            <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
              {typeof amount === 'number' && amount > 1000 ? `₪ ${amount.toLocaleString()}` : amount.toFixed(1)}
            </td>
          ))}
          <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">
            {table.yearlyTotal > 1000 ? `₪ ${table.yearlyTotal.toLocaleString()}` : table.yearlyTotal.toFixed(1)}
          </td>
        </tr>
        <tr className="border-b border-gray-200">
          <td className="text-right px-4 py-2">ביצוע</td>
          {Array(12).fill(0).map((_, i) => (
            <td key={i} className="text-center px-4 py-2 border-r border-gray-200">0.0</td>
          ))}
          <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0</td>
        </tr>
        <tr>
          <td className="text-right px-4 py-2">אחוז ביצוע</td>
          {Array(12).fill(0).map((_, i) => (
            <td key={i} className="text-center px-4 py-2 border-r border-gray-200">0.0%</td>
          ))}
          <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0%</td>
        </tr>
      </tbody>
    </table>
  );

  const generateCommissionReport = () => {
    try {
      // יצירת אלמנט HTML זמני לדוח
      const element = document.createElement('div');
      element.innerHTML = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #1e3a8a; text-align: center; margin-bottom: 20px;">דוח עמלות שנתי</h1>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 5px 0;">תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}</p>
            <p style="margin: 5px 0;">אחוז סגירה: ${closingRate}%</p>
            <p style="margin: 5px 0;">פגישות בחודש: ${monthlyMeetings}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #1e3a8a; color: white;">
                <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">קטגוריה</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">יעד שנתי</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">אחוז עמלה</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">עמלה שנתית</th>
              </tr>
            </thead>
            <tbody>
              ${tablesData
                .find(t => t.id === activeTab)
                ?.tables.map(table => {
                  const yearlyTarget = table.yearlyTotal;
                  const commission = calculateCommission(table.id, yearlyTarget);
                  const commissionAmount = (yearlyTarget * commission) / 100;
                  return `
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${table.title}</td>
                      <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">₪${yearlyTarget.toLocaleString()}</td>
                      <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${commission}%</td>
                      <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">₪${commissionAmount.toLocaleString()}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
          </table>

          <div style="text-align: left; margin-top: 20px; padding-top: 10px; border-top: 2px solid #e5e7eb;">
            <h3 style="color: #1e3a8a;">
              סה"כ עמלות שנתי: ₪${tablesData
                .find(t => t.id === activeTab)
                ?.tables.reduce((sum, table) => {
                  const commission = calculateCommission(table.id, table.yearlyTotal);
                  return sum + (table.yearlyTotal * commission) / 100;
                }, 0).toLocaleString()}
            </h3>
          </div>
        </div>
      `;

      // הגדרות ל-PDF
      const opt = {
        margin: 10,
        filename: `דוח_עמלות_שנתי_${new Date().getFullYear()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      // יצירת ה-PDF
      html2pdf().from(element).set(opt).save();

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('אירעה שגיאה בהפקת הדוח. אנא נסה שוב.');
    }
  };

  // פונקציה לחישוב אחוז העמלה לפי קטגוריה
  const calculateCommission = (categoryId: string, amount: number): number => {
    const commissionRates: { [key: string]: number } = {
      'risks': 30,
      'pension': 25,
      'pension-transfer': 20,
      'finance-transfer': 15,
      'financial-planning': 40,
      // ... הוסף עוד קטגוריות לפי הצורך
    };
    return commissionRates[categoryId] || 20; // ברירת מחדל 20%
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-100 rounded">
        <div>
          <p>אחוז סגירה נוכחי: {closingRate}%</p>
          <p>פגישות בחודש: {monthlyMeetings}</p>
        </div>
        <div className="flex items-center gap-4">
          {isDirty && (
            <span className="text-orange-500">* יש שינויים שלא נשמרו</span>
          )}
          <button
            onClick={saveChanges}
            className={`px-4 py-2 rounded ${
              isDirty 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-600'
            } transition-colors`}
            disabled={!isDirty}
          >
            שמור נתונים
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex space-x-4 rtl:space-x-reverse border-b">
        {['investments', 'services'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'investments' | 'services')}
            className={`px-6 py-3 text-lg font-medium transition-all duration-200 border-b-2 ${
              activeTab === tab 
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'investments' ? 'השקעות ופיננסים' : 'שירותים'}
          </button>
        ))}
      </div>

      {/* Tables */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {tablesData.find(t => t.id === activeTab)?.tables.map((table) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenTable(openTable === table.id ? null : table.id)}
                className="w-full px-4 py-3 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <h2 className="text-xl font-bold text-blue-900">{table.title}</h2>
                <motion.svg
                  animate={{ rotate: openTable === table.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {openTable === table.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`${table.bgColor}`}
                  >
                    <div className="overflow-x-auto p-4">
                      {renderTable(table)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* כפתור הפקת דוח */}
      <div className="flex justify-end">
        <button
          onClick={generateCommissionReport}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          הפק דוח עמלות שנתי
        </button>
      </div>
    </div>
  );
};

export default SalesTargetsSystem;
