import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkPlanTableProps {
  agent_id: string;
  year: number;
}

interface MonthlyTarget {
  month: string;
  workDays: string;
  potentialMeetings: string;
  actualMeetings: string;
  closureRate: string;
  activityAverages: ActivityAverages;
  recruitmentSources: RecruitmentSources;
}

interface WorkPlanData {
  year: string;
  monthlyTargets: MonthlyTarget[];
  lastModified: string;
}

interface ActivityAverages {
  insurance: string;
  premium: string;
  pensionTransfer: string;
  financeTransfer: string;
  mortgage: string;
}

interface RecruitmentSources {
  phonePlanning: string;
  familyEconomics: string;
  exhibition: string;
  digitalMarketing: string;
  realEstate: string;
  otherRecruitment: string;
  mortgage: string;
  renewals: string;
  loans: string;
  others: string;
}

const STORAGE_KEY_PREFIX = 'workPlanData_';

const WorkPlanTable: React.FC<WorkPlanTableProps> = ({ year }) => {
  const [yearlyWorkPlan, setYearlyWorkPlan] = useState<WorkPlanData | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout>();
  const tableRef = useRef<HTMLDivElement>(null);
  const [meetingsPerDay, setMeetingsPerDay] = useState<number>(2);
  const [closureRate, setClosureRate] = useState<number>(43);
  const selectedYear = year.toString();

  useEffect(() => {
    const currentYearData = loadYearData(selectedYear);
    if (currentYearData) {
      setYearlyWorkPlan(currentYearData);
    } else {
      createNewYearPlan(selectedYear);
    }
  }, [selectedYear]);

  const loadYearData = (year: string): WorkPlanData | null => {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${year}`);
    return data ? JSON.parse(data) : null;
  };

  const createNewYearPlan = (year: string) => {
    const monthNames = Array.from({ length: 12 }, (_, i) => {
      return `${['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'][i]} ${year.slice(-2)}׳`;
    });

    const newPlan: WorkPlanData = {
      year,
      monthlyTargets: monthNames.map(month => ({
        month,
        workDays: '',
        potentialMeetings: '',
        actualMeetings: '',
        closureRate: '43',
        activityAverages: {
          insurance: '150',
          premium: '1500',
          pensionTransfer: '150000',
          financeTransfer: '200000',
          mortgage: '300'
        },
        recruitmentSources: {
          phonePlanning: '35',
          familyEconomics: '27',
          exhibition: '10',
          digitalMarketing: '5',
          realEstate: '7',
          otherRecruitment: '15',
          mortgage: '10',
          renewals: '20',
          loans: '20',
          others: '20'
        }
      })),
      lastModified: new Date().toISOString()
    };

    setYearlyWorkPlan(newPlan);
    saveYearData(newPlan);
  };

  const saveYearData = (data: WorkPlanData) => {
    try {
      data.lastModified = new Date().toISOString();
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${data.year}`, JSON.stringify(data));
      showSaveNotification();
    } catch (error) {
      console.error('Failed to save data:', error);
      alert('שגיאה בשמירת הנתונים');
    }
  };

  const debouncedSave = (data: WorkPlanData) => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
      saveYearData(data);
    }, 1000);
  };

  const showSaveNotification = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleActivityChange = (monthIndex: number, field: keyof ActivityAverages, value: string) => {
    if (!yearlyWorkPlan) return;

    const newMonthlyTargets = [...yearlyWorkPlan.monthlyTargets];
    newMonthlyTargets[monthIndex] = {
      ...newMonthlyTargets[monthIndex],
      activityAverages: {
        ...newMonthlyTargets[monthIndex].activityAverages,
        [field]: value
      }
    };

    const updatedWorkPlan = {
      ...yearlyWorkPlan,
      monthlyTargets: newMonthlyTargets,
      lastModified: new Date().toISOString()
    };

    setYearlyWorkPlan(updatedWorkPlan);
    debouncedSave(updatedWorkPlan);
  };

  const handleRecruitmentChange = (monthIndex: number, field: keyof RecruitmentSources, value: string) => {
    if (!yearlyWorkPlan?.monthlyTargets?.[monthIndex]) return;

    const newMonthlyTargets = [...yearlyWorkPlan.monthlyTargets];
    newMonthlyTargets[monthIndex] = {
      ...newMonthlyTargets[monthIndex],
      recruitmentSources: {
        ...newMonthlyTargets[monthIndex].recruitmentSources,
        [field]: value
      }
    };

    const updatedWorkPlan = {
      ...yearlyWorkPlan,
      monthlyTargets: newMonthlyTargets,
      lastModified: new Date().toISOString()
    };

    setYearlyWorkPlan(updatedWorkPlan);
    debouncedSave(updatedWorkPlan);
  };

  const scrollLeft = () => {
    if (tableRef.current) {
      tableRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tableRef.current) {
      tableRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleMeetingsPerDayChange = (value: string) => {
    const newValue = Number(value);
    setMeetingsPerDay(newValue);
    
    if (!yearlyWorkPlan?.monthlyTargets) return;

    const newMonthlyTargets = yearlyWorkPlan.monthlyTargets.map(target => ({
      ...target,
      potentialMeetings: String(Number(target.workDays || 0) * newValue)
    }));

    const updatedWorkPlan = {
      ...yearlyWorkPlan,
      monthlyTargets: newMonthlyTargets,
      lastModified: new Date().toISOString()
    };

    setYearlyWorkPlan(updatedWorkPlan);
    debouncedSave(updatedWorkPlan);
  };

  const handleClosureRateChange = (value: string) => {
    const newValue = Number(value);
    setClosureRate(newValue);
    
    if (!yearlyWorkPlan?.monthlyTargets) return;

    const newMonthlyTargets = yearlyWorkPlan.monthlyTargets.map(target => ({
      ...target,
      closureRate: String(newValue)
    }));

    const updatedWorkPlan = {
      ...yearlyWorkPlan,
      monthlyTargets: newMonthlyTargets,
      lastModified: new Date().toISOString()
    };

    setYearlyWorkPlan(updatedWorkPlan);
    debouncedSave(updatedWorkPlan);
  };

  const monthlyTargets = yearlyWorkPlan?.monthlyTargets || [];
  const monthlyTargetsLength = monthlyTargets.length;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden relative">
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-r-lg shadow-md z-10 hover:bg-white"
          aria-label="גלול שמאלה"
        >
          <ChevronLeft className="h-6 w-6 text-blue-600" />
        </button>
        
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-l-lg shadow-md z-10 hover:bg-white"
          aria-label="גלול ימינה"
        >
          <ChevronRight className="h-6 w-6 text-blue-600" />
        </button>

        <div 
          ref={tableRef} 
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100"
          style={{ scrollBehavior: 'smooth' }}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 text-right font-medium w-48">
                  חודש
                </th>
                {yearlyWorkPlan?.monthlyTargets?.map(month => (
                  <th key={month.month} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 text-center font-medium min-w-[120px]">
                    {month.month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* יותרת משנה - נתוני פגישות */}
              <tr>
                <td colSpan={yearlyWorkPlan?.monthlyTargets?.length ? yearlyWorkPlan.monthlyTargets.length + 1 : 1} 
                    className="bg-gradient-to-r from-gray-100 to-gray-50 p-3 font-semibold text-gray-800 border-y border-gray-200">
                  נתוני פגישות
                </td>
              </tr>

              {/* ימי עבודה בחודש */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700 bg-white">ימי עבודה בחודש</td>
                {yearlyWorkPlan?.monthlyTargets?.map((month, idx) => (
                  <td key={idx} className="p-4 text-center bg-white">
                    {month.workDays || '0'}
                  </td>
                ))}
              </tr>

              {/* פוטנציאל פגישות ביום */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700 bg-white">פוטנציאל פגישות ביום</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="p-4 text-center bg-white">
                    {Number(month.workDays || 0) * meetingsPerDay}
                  </td>
                ))}
              </tr>

              {/* אחוז חודשי */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700 bg-white">אחוז חודשי</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => {
                  // חישוב פגישות חודשיות
                  const monthlyMeetings = Number(month.workDays || 0) * meetingsPerDay;
                  
                  // חישוב סך פגישות שנתי
                  const yearlyTotalMeetings = yearlyWorkPlan.monthlyTargets.reduce((sum, m) => 
                    sum + (Number(m.workDays || 0) * meetingsPerDay), 0
                  );
                  
                  // חישוב האחוז
                  const percentage = yearlyTotalMeetings > 0 
                    ? ((monthlyMeetings / yearlyTotalMeetings) * 100).toFixed(1)
                    : '0';

                  return (
                    <td key={idx} className="p-4 text-center bg-white">
                      {percentage}%
                    </td>
                  );
                })}
              </tr>

              {/* בותרת משנה - סיכום ביצועים */}
              <tr>
                <td colSpan={yearlyWorkPlan?.monthlyTargets?.length + 1 || 1} 
                    className="bg-gradient-to-r from-gray-100 to-gray-50 p-3 font-semibold text-gray-800 border-y border-gray-200">
                  סיכום ביצועים
                </td>
              </tr>

              {/* ביצוע פגישות */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700 bg-white">ביצוע פגישות</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="p-4 text-center bg-white">
                    {month.actualMeetings || '0'}
                  </td>
                ))}
              </tr>

              {/* אחוז ביצוע */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700 bg-white">אחוז ביצוע</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="p-4 text-center bg-white">
                    {((Number(month.actualMeetings || 0) / (Number(month.workDays || 0) * meetingsPerDay)) * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>

              {/* שיכום שנתי */}
              <tr>
                <td colSpan={yearlyWorkPlan?.monthlyTargets?.length + 1 || 1} 
                    className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 font-bold text-gray-800 border-t-2 border-blue-200">
                  סה"כ פגישות שנתי: {yearlyWorkPlan?.monthlyTargets.reduce((sum, month) => 
                    sum + (Number(month.workDays || 0) * meetingsPerDay), 0
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {showSaved && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md">
          הנתונים נשמרו בהצלחה
        </div>
      )}

      {/* Three columns section - מועתק מ-sales-targets-system */}
      <div className="grid grid-cols-3 gap-4">
        {/* טבלה 1 - נתונים בסיסיים */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border border-slate-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 text-center font-medium rounded-t-lg">
            נתונים בסיסיים
          </div>
          <div className="p-4 bg-white rounded-b-lg">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">פגישות ליום</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={meetingsPerDay}
                      onChange={(e) => handleMeetingsPerDayChange(e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="10"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">אחוז סגירה</td>
                  <td className="py-2 flex items-center">
                    <Input
                      type="number"
                      value={closureRate}
                      onChange={(e) => handleClosureRateChange(e.target.value)}
                      className="w-16 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                    <span className="mr-2 text-slate-600">%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* טבלה 2 - ממוצע פעילות לפגישה */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border border-slate-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 text-center font-medium rounded-t-lg">
            ממוצע פעילות לפגישה
          </div>
          <div className="p-4 bg-white rounded-b-lg">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">סיכונים</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.activityAverages?.insurance || '150'}
                      onChange={(e) => handleActivityChange(0, 'insurance', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">פנסיוני</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.activityAverages?.premium || '1500'}
                      onChange={(e) => handleActivityChange(0, 'premium', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">ניוד פנסיה</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.activityAverages?.pensionTransfer || '150000'}
                      onChange={(e) => handleActivityChange(0, 'pensionTransfer', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">ניוד פיננסים</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.activityAverages?.financeTransfer || '200000'}
                      onChange={(e) => handleActivityChange(0, 'financeTransfer', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">הפקדה שוטפת</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.activityAverages?.mortgage || '300'}
                      onChange={(e) => handleActivityChange(0, 'mortgage', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* טבלה 3 - ממוצע לפגישה מוצרי גולה */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border border-slate-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 text-center font-medium rounded-t-lg">
            ממוצע לפגישה מוצרי גולה
          </div>
          <div className="p-4 bg-white rounded-b-lg">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">תכנון פיננסי</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.recruitmentSources?.phonePlanning || '35'}
                      onChange={(e) => handleRecruitmentChange(0, 'phonePlanning', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">כלכלת המשפחה</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.recruitmentSources?.familyEconomics || '27'}
                      onChange={(e) => handleRecruitmentChange(0, 'familyEconomics', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">תעסוקה</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.recruitmentSources?.exhibition || '10'}
                      onChange={(e) => handleRecruitmentChange(0, 'exhibition', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">ייעוץ עסקי רגוני</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.recruitmentSources?.digitalMarketing || '5'}
                      onChange={(e) => handleRecruitmentChange(0, 'digitalMarketing', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">פרישה</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.recruitmentSources?.realEstate || '7'}
                      onChange={(e) => handleRecruitmentChange(0, 'realEstate', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">גיוס ארגונים</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.recruitmentSources?.otherRecruitment || '15'}
                      onChange={(e) => handleRecruitmentChange(0, 'otherRecruitment', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">משכנתא</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.recruitmentSources?.mortgage || '10'}
                      onChange={(e) => handleRecruitmentChange(0, 'mortgage', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">מנוי חודשי</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.recruitmentSources?.renewals || '20'}
                      onChange={(e) => handleRecruitmentChange(0, 'renewals', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">הלוואות</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.recruitmentSources?.loans || '20'}
                      onChange={(e) => handleRecruitmentChange(0, 'loans', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">נדל"ן</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.recruitmentSources?.others || '20'}
                      onChange={(e) => handleRecruitmentChange(0, 'others', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="shadow-md">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 text-center font-medium rounded-t-lg">
          תוצאות חודשיות
        </div>
        <div className="p-4">
          <Tabs defaultValue="insurance" className="w-full">
            <TabsList>
              <TabsTrigger value="insurance">בי��וח</TabsTrigger>
              <TabsTrigger value="pension">פנסיה</TabsTrigger>
            </TabsList>
            <TabsContent value="insurance">
              {/* Insurance content */}
            </TabsContent>
            <TabsContent value="pension">
              {/* Pension content */}
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default WorkPlanTable;
