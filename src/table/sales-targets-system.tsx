import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSalesTargets } from '@/contexts/SalesTargetsContext';
import { supabase } from '@/lib/supabase';
import html2pdf from 'html2pdf.js';

interface TableData {
  id: string;
  title: string;
  bgColor: string;
  targets: number[];
  performances?: number[];
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
    saveChanges,
    performances,
    updatePerformances,
    workingDays
  } = useSalesTargets();
  const [activeTab, setActiveTab] = useState<'investments' | 'services'>('investments');
  const [tablesData, setTablesData] = useState<TabData[]>([]);

  // פונקציה לחישוב יעד חודשי
  const calculateMonthlyTarget = (baseAmount: number, monthIndex: number, percentage: number = 100) => {
    // מחשב את היעד החודשי לפי:
    // 1. סכום בסיס (סכום ממוצע לפגישה)
    // 2. כמות פגישות חומית
    // 3. מספר ימי עבודה בחודש
    // 4. אחוז סגירה
    // 5. אחוז מהיעד הכללי
    const dailyMeetings = monthlyMeetings / 22; // ממוצע ימי עבודה בחודש
    const monthlyMeetingsAdjusted = dailyMeetings * (workingDays[monthIndex] || 22);
    return baseAmount * monthlyMeetingsAdjusted * (closingRate / 100) * (percentage / 100);
  };

  // חישוב היעדים החודשיים לפי הנוסחה
  const getUpdatedTargets = (baseAmount: number, percentage: number = 100) => {
    return Array(12).fill(0).map((_, index) => 
      Math.round(calculateMonthlyTarget(baseAmount, index, percentage))
    );
  };

  // עונקציה לטעינת הביצועים מהדאטאבייס
  const loadPerformances = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: performanceData, error } = await supabase
        .from('sales_targets')
        .select('*')
        .match({
          user_id: user.id,
          year: new Date().getFullYear()
        });

      if (error) throw error;

      // ארגון הנתונים לפי קטגוריות
      const organizedPerformances: Record<string, number[]> = {};
      
      performanceData?.forEach(record => {
        if (!organizedPerformances[record.category]) {
          organizedPerformances[record.category] = Array(12).fill(0);
        }
        organizedPerformances[record.category][record.month - 1] = record.performance || 0;
      });

      updatePerformances(organizedPerformances);
    } catch (error) {
      console.error('Error loading performances:', error);
    }
  };

  // טעינת הביצועים בעת טעינת הקומפוננטה ובכל 5 שניות
  useEffect(() => {
    loadPerformances();
    const interval = setInterval(loadPerformances, 5000);
    return () => clearInterval(interval);
  }, []);

  // עדכון הטבלאות כשיש שינוי בפרמטרים
  useEffect(() => {
    console.log('Updating tables with performances:', performances);
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
            targets: getUpdatedTargets(50000),
            performances: performances['risks'] || Array(12).fill(0)
          },
          { 
            id: "pension", 
            title: "פנסיוני", 
            bgColor: "bg-blue-50",
            targets: getUpdatedTargets(150000),
            performances: performances['pension'] || Array(12).fill(0)
          },
          { 
            id: "pension-transfer", 
            title: "ניוד פנסיה", 
            bgColor: "bg-blue-50",
            targets: getUpdatedTargets(150000),
            performances: performances['pension-transfer'] || Array(12).fill(0)
          },
          { 
            id: "finance-transfer", 
            title: "פיננסים ניוד", 
            bgColor: "bg-blue-50",
            targets: getUpdatedTargets(200000),
            performances: performances['finance-transfer'] || Array(12).fill(0)
          },
          { 
            id: "regular-deposit", 
            title: "הפקדה שוטפת", 
            bgColor: "bg-blue-50",
            targets: getUpdatedTargets(20000),
            performances: performances['regular-deposit'] || Array(12).fill(0)
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
            targets: getUpdatedTargets(5000, 35),
            performances: performances['financial-planning'] || Array(12).fill(0)
          },
          { 
            id: "family-economics", 
            title: "כלכלת המשפחה", 
            bgColor: "bg-orange-50",
            targets: getUpdatedTargets(1000),
            performances: performances['family-economics'] || Array(12).fill(0)
          },
          { 
            id: "employment", 
            title: "תעסוקה", 
            bgColor: "bg-orange-50",
            targets: getUpdatedTargets(2000),
            performances: performances['employment'] || Array(12).fill(0)
          },
          { 
            id: "organizational-consulting", 
            title: "ייעוץ עסקי ארגוני", 
            bgColor: "bg-orange-50",
            targets: getUpdatedTargets(3000),
            performances: performances['organizational-consulting'] || Array(12).fill(0)
          },
          { 
            id: "retirement", 
            title: "פרישה", 
            bgColor: "bg-orange-50",
            targets: getUpdatedTargets(4000),
            performances: performances['retirement'] || Array(12).fill(0)
          },
          { 
            id: "organizational-recruitment", 
            title: "גיוס ארגונים", 
            bgColor: "bg-orange-50",
            targets: getUpdatedTargets(5000),
            performances: performances['organizational-recruitment'] || Array(12).fill(0)
          },
          { 
            id: "loans", 
            title: "הלוואות", 
            bgColor: "bg-orange-50",
            targets: getUpdatedTargets(3000),
            performances: performances['loans'] || Array(12).fill(0)
          },
          { 
            id: "real-estate", 
            title: "נדל\"ן", 
            bgColor: "bg-orange-50",
            targets: getUpdatedTargets(8000),
            performances: performances['real-estate'] || Array(12).fill(0)
          },
          { 
            id: "mortgage", 
            title: "משכנתא", 
            bgColor: "bg-orange-50",
            targets: getUpdatedTargets(4000),
            performances: performances['mortgage'] || Array(12).fill(0)
          }
        ]
      }
    ];

    console.log('Setting updated tables data with performances');
    setTablesData(updatedTabs);
  }, [closingRate, monthlyMeetings, performances]); // לות בביצועים

  const months = ['ינואר 24׳', 'פברואר 24׳', 'מרץ 24׳', 'אפריל 24׳', 'מאי 24׳', 'יוני 24׳',
                 'יולי 24׳', 'אוגוסט 24׳', 'ספטמבר 24׳', 'אוקטובר 24׳', 'נובמבר 24׳', 'דצמבר 24׳'];

  // פונקציה לחישוב אחוז העמלה לפי קטגוריה
  const calculateCommission = (categoryId: string): number => {
    const commissionRates: { [key: string]: number } = {
      'risks': 30,
      'pension': 25,
      'pension-transfer': 20,
      'finance-transfer': 15,
      'financial-planning': 40,
    };
    return commissionRates[categoryId] || 20; // ברירת מחדל 20%
  };

  const generateCommissionReport = () => {
    try {
      const element = document.createElement('div');
      element.innerHTML = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #1e3a8a; text-align: center; margin-bottom: 20px;">דוח עמלות חודשי</h1>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 5px 0;">תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}</p>
            <p style="margin: 5px 0;">אחוז סגירה: ${closingRate}%</p>
            <p style="margin: 5px 0;">פגישות בחודש: ${monthlyMeetings}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #1e3a8a; color: white;">
                <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">קטגוריה</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">יעד חודשי ממוצע</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">אחוז עמלה</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">עמלה חודשית ממוצעת</th>
              </tr>
            </thead>
            <tbody>
              ${tablesData
                .find(t => t.id === activeTab)
                ?.tables.map(table => {
                  const monthlyAverage = table.targets.reduce((a, b) => a + b, 0) / 12;
                  const commission = calculateCommission(table.id);
                  const commissionAmount = (monthlyAverage * commission) / 100;
                  return `
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${table.title}</td>
                      <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">₪${monthlyAverage.toLocaleString()}</td>
                      <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${commission}%</td>
                      <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">₪${commissionAmount.toLocaleString()}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
          </table>

          <div style="text-align: left; margin-top: 20px; padding-top: 10px; border-top: 2px solid #e5e7eb;">
            <h3 style="color: #1e3a8a;">
              סה"כ עמלות חודשי ממוצע: ₪${tablesData
                .find(t => t.id === activeTab)
                ?.tables.reduce((sum, table) => {
                  const monthlyAverage = table.targets.reduce((a, b) => a + b, 0) / 12;
                  const commission = calculateCommission(table.id);
                  return sum + (monthlyAverage * commission) / 100;
                }, 0).toLocaleString()}
            </h3>
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `דוח_עמלות_חודשי_${new Date().getFullYear()}.pdf`,
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

      html2pdf().from(element).set(opt).save();

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('אירעה שגיאה בהפקת הדוח. אנא נסה שוב.');
    }
  };

  const resetYearlyData = async () => {
    try {
      if (!confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים השנתיים? פעולה זו אינה הפיכה.')) {
        return;
      }

      const resetPerformances = Object.keys(performances).reduce((acc, key) => {
        acc[key] = Array(12).fill(0);
        return acc;
      }, {} as Record<string, number[]>);

      updatePerformances(resetPerformances);

      const { error } = await supabase
        .from('sales_performances')
        .update({ performances: resetPerformances })
        .eq('year', new Date().getFullYear());

      if (error) throw error;

      alert('הנתונים אופסו בהצלחה');
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('אירעה שגיאה באיפוס הנתונים. אנא נסה שוב.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Recent Sales Panel */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">מכירות אחרונות</h3>
          <div className="text-sm text-gray-500">מתעדכן בזמן אמת</div>
        </div>
        <div className="space-y-3">
          {Object.entries(performances).map(([category, values]) => {
            // Ensure values is an array and has elements before using reduce
            const lastNonZeroIndex = Array.isArray(values) ? values.reduce((lastIndex, value, index) => 
              value > 0 ? index : lastIndex, -1) : -1;
            
            if (lastNonZeroIndex === -1) return null;
            
            const categoryTitle = tablesData
              .flatMap(tab => tab.tables)
              .find(table => table.id === category)?.title || category;

            return (
              <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <div className="font-medium">{categoryTitle}</div>
                    <div className="text-sm text-gray-500">{months[lastNonZeroIndex]}</div>
                  </div>
                </div>
                <div className="font-bold text-blue-600">
                  {values[lastNonZeroIndex] >= 1000000 
                    ? `₪${(values[lastNonZeroIndex]/1000000).toFixed(1)} מיליון`
                    : values[lastNonZeroIndex] >= 1000 
                      ? `₪${(values[lastNonZeroIndex]/1000).toFixed(0)},000` 
                      : `₪${values[lastNonZeroIndex].toFixed(1)}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 p-4 bg-gray-100 rounded">
        <div>
          <p>אחוז סגירה נוכחי: {closingRate}%</p>
          <p>פגישות חודש: {monthlyMeetings}</p>
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

      {/* Monthly Targets Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {tablesData.find(t => t.id === activeTab)?.tables.map((table) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 100 }}
              className={`bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg overflow-hidden border border-slate-200/50 backdrop-blur-sm`}
            >
              {/* Header */}
              <motion.div 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className={`px-6 py-4 ${
                  activeTab === 'investments' 
                    ? 'bg-gradient-to-r from-blue-500/10 via-blue-400/5 to-blue-500/10' 
                    : 'bg-gradient-to-r from-orange-500/10 via-orange-400/5 to-orange-500/10'
                }`}
              >
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                  {table.title}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">יעד שנתי:</span>
                  <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                    ₪{table.targets.reduce((a, b) => a + b, 0).toLocaleString()}
                  </span>
                </div>
              </motion.div>

              {/* Content */}
              <div className="p-4">
                <div className="space-y-2">
                  {months.map((month, i) => (
                    <motion.div
                      key={month}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                      } hover:bg-gradient-to-r hover:from-slate-100 hover:to-white border border-transparent hover:border-slate-200 hover:shadow-sm`}
                    >
                      {/* Month */}
                      <motion.div 
                        className="w-24"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
                          {month.split(' ')[0]}
                        </div>
                      </motion.div>
                      
                      {/* Target */}
                      <motion.div 
                        className="flex-1 text-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                          {table.targets[i] >= 1000000 
                            ? `₪${(table.targets[i]/1000000).toFixed(1)} מיליון`
                            : table.targets[i] >= 1000 
                              ? `₪${(table.targets[i]/1000).toFixed(0)},000` 
                              : `₪${table.targets[i].toFixed(1)}`}
                        </div>
                      </motion.div>

                      {/* Performance */}
                      <div className="w-36">
                        {table.performances && table.performances[i] !== undefined && (
                          <PerformanceIndicator
                            target={table.targets[i]}
                            performance={table.performances[i]}
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Performance Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl shadow-xl"
      >
        {/* ... existing chart code ... */}
      </motion.div>

      {/* כפתורים */}
      <div className="flex justify-end gap-4">
        <button
          onClick={generateCommissionReport}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          הפק דוח עמלות חודשי
        </button>
        <button
          onClick={resetYearlyData}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
        >
          איפוס נתונים שנתיים
        </button>
      </div>
    </div>
  );
};

// Performance Indicator Component
const PerformanceIndicator: React.FC<{ target: number; performance: number }> = ({ target = 0, performance = 0 }) => {
  const percentage = target ? (performance / target) * 100 : 0;
  
  const getGradient = (percentage: number) => {
    if (percentage >= 100) return 'from-green-500/20 via-green-400/10 to-green-500/20';
    if (percentage >= 80) return 'from-yellow-500/20 via-yellow-400/10 to-yellow-500/20';
    return 'from-red-500/20 via-red-400/10 to-red-500/20';
  };

  const getTextGradient = (percentage: number) => {
    if (percentage >= 100) return 'from-green-700 to-green-900';
    if (percentage >= 80) return 'from-yellow-700 to-yellow-900';
    return 'from-red-700 to-red-900';
  };

  const formattedPerformance = performance >= 1000000 
    ? `₪${(performance/1000000).toFixed(1)} מיליון`
    : performance >= 1000 
      ? `₪${(performance/1000).toFixed(0)},000` 
      : `₪${performance.toFixed(1)}`;

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className={`text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r ${getGradient(percentage)} flex items-center justify-between gap-2 border border-slate-200/50 shadow-sm`}
    >
      <span className={`bg-clip-text text-transparent bg-gradient-to-r ${getTextGradient(percentage)}`}>
        {formattedPerformance}
      </span>
      <span className={`bg-clip-text text-transparent bg-gradient-to-r ${getTextGradient(percentage)}`}>
        {percentage.toFixed(0)}%
      </span>
    </motion.div>
  );
};

export default SalesTargetsSystem;
