import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Save, FileDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const WorkPlanTable: React.FC<WorkPlanTableProps> = ({ agent_id, year }) => {
  const [selectedYear, setSelectedYear] = useState<string>(year.toString());
  const [yearlyWorkPlan, setYearlyWorkPlan] = useState<WorkPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout>();

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

  const handleInputChange = (monthIndex: number, field: string, value: string) => {
    if (!yearlyWorkPlan) return;

    const newMonthlyTargets = [...yearlyWorkPlan.monthlyTargets];
    newMonthlyTargets[monthIndex] = {
      ...newMonthlyTargets[monthIndex],
      [field]: value
    };

    const updatedWorkPlan = {
      ...yearlyWorkPlan,
      monthlyTargets: newMonthlyTargets,
      lastModified: new Date().toISOString()
    };

    setYearlyWorkPlan(updatedWorkPlan);
    debouncedSave(updatedWorkPlan);
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

  const calculatePercentage = (achieved: string | number = '0', target: string | number = '0') => {
    const achievedNum = Number(achieved);
    const targetNum = Number(target);
    if (targetNum === 0) return 0;
    return Math.round((achievedNum / targetNum) * 100);
  };

  const calculateTotal = (targets: any[], field: string) => {
    return targets.reduce((sum, target) => sum + Number(target?.[field] || 0), 0);
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
    if (!yearlyWorkPlan) return;

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

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 text-right font-medium">
                  שנתי
                </th>
                {yearlyWorkPlan?.monthlyTargets.map(month => (
                  <th key={month.month} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 text-right font-medium min-w-[120px]">
                    {month.month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* ימי עבודה */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700">ימי עבודה בחודש</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="p-4">
                    <Input
                      type="number"
                      value={month.workDays}
                      onChange={(e) => handleInputChange(idx, 'workDays', e.target.value)}
                      className="w-full text-right bg-transparent border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="31"
                    />
                  </td>
                ))}
              </tr>

              {/* פגישות */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700">פוטנציאל פגישות ביום</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="p-4">
                    <Input
                      type="number"
                      value={month.potentialMeetings}
                      onChange={(e) => handleInputChange(idx, 'potentialMeetings', e.target.value)}
                      className="w-full text-right bg-transparent border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </td>
                ))}
              </tr>

              {/* ביצוע */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700">ביצוע</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="p-4">
                    <Input
                      type="number"
                      value={month.actualMeetings}
                      onChange={(e) => handleInputChange(idx, 'actualMeetings', e.target.value)}
                      className="w-full text-right bg-transparent border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </td>
                ))}
              </tr>

              {/* אחוז ביצוע */}
              <tr className="bg-gray-50">
                <td className="p-4 font-medium text-gray-700">אחוז ביצוע</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => {
                  const target = Number(month.workDays || 0) * Number(month.potentialMeetings || 0);
                  const actual = Number(month.actualMeetings || 0);
                  const percentage = target ? ((actual / target) * 100).toFixed(1) : '0';
                  return (
                    <td key={idx} className="p-4 text-right font-medium">
                      <span className={`
                        ${Number(percentage) >= 100 ? 'text-green-600' : ''}
                        ${Number(percentage) >= 80 && Number(percentage) < 100 ? 'text-yellow-600' : ''}
                        ${Number(percentage) < 80 ? 'text-red-600' : ''}
                      `}>
                        {percentage}%
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 text-right font-medium">
                  חודש
                </th>
                {yearlyWorkPlan?.monthlyTargets.map(month => (
                  <th key={month.month} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 text-right font-medium min-w-[120px]">
                    {month.month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* ימי עבודה בחודש */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700">ימי עבודה בחודש</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="p-4 text-center">
                    {month.workDays || '0'}
                  </td>
                ))}
              </tr>

              {/* פוטנציאל פגישות ביום */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700">פוטנציאל פגישות ביום</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="p-4 text-center">
                    {Number(month.workDays || 0) * 2}
                  </td>
                ))}
              </tr>

              {/* אחוז חודשי */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700">אחוז חודשי</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="p-4 text-center">
                    {((Number(month.workDays || 0) * 2 / (yearlyWorkPlan.monthlyTargets.reduce((sum, m) => 
                      sum + Number(m.workDays || 0) * 2, 0))) * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>

              {/* ביצוע פגישות */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700">ביצוע פגישות</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="p-4 text-center">
                    {month.actualMeetings || '0'}
                  </td>
                ))}
              </tr>

              {/* אחוז ביצוע */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700">אחוז ביצוע</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="p-4 text-center">
                    {((Number(month.actualMeetings || 0) / (Number(month.workDays || 0) * 2)) * 100).toFixed(1)}%
                  </td>
                ))}
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
                  <td className="py-2.5 text-slate-700 font-medium">ימי עבודה</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.workDays || ''}
                      onChange={(e) => handleInputChange(0, 'workDays', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">פגישות ליום</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.potentialMeetings || ''}
                      onChange={(e) => handleInputChange(0, 'potentialMeetings', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">אחוז סגירה</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyWorkPlan?.monthlyTargets[0]?.closureRate || '43'}
                      onChange={(e) => handleInputChange(0, 'closureRate', e.target.value)}
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
                  <td className="py-2.5 text-slate-700 font-medium">ייעוץ עסקי ארגוני</td>
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
            {/* ... תוכן הטאבים כמו ב-sales-targets-system ... */}
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default WorkPlanTable;
