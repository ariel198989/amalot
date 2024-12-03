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

interface WorkPlanTableProps {
  agent_id: string;
  year: number;
}

interface MonthlyTarget {
  month: string;
  workDays: string;
  potentialMeetings: string;
  actualMeetings: string;
}

interface WorkPlanData {
  year: string;
  monthlyTargets: MonthlyTarget[];
  lastModified: string;
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
        actualMeetings: ''
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

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 text-right font-medium">
                  שנתי
                </th>
                {yearlyWorkPlan?.monthlyTargets.map(month => (
                  <th 
                    key={month.month} 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 text-right font-medium min-w-[120px]"
                  >
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

      {showSaved && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md">
          הנתונים נשמרו בהצלחה
        </div>
      )}
    </div>
  );
};

export default WorkPlanTable;
