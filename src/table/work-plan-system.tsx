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
    if (!yearlyWorkPlan?.monthlyTargets?.[monthIndex]) return;

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

        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <label htmlFor="meetingsPerDay" className="block text-sm font-medium text-gray-700 mb-1">
                פגישות ליום
              </label>
              <Input
                id="meetingsPerDay"
                type="number"
                value={meetingsPerDay}
                onChange={(e) => handleMeetingsPerDayChange(e.target.value)}
                className="w-24"
              />
            </div>
            <div>
              <label htmlFor="closureRate" className="block text-sm font-medium text-gray-700 mb-1">
                אחוז סגירה
              </label>
              <Input
                id="closureRate"
                type="number"
                value={closureRate}
                onChange={(e) => handleClosureRateChange(e.target.value)}
                className="w-24"
              />
            </div>
          </div>

          <div
            ref={tableRef}
            className="overflow-x-auto"
            style={{ maxWidth: '100%', scrollbarWidth: 'thin' }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50">
                    חודש
                  </th>
                  {monthlyTargets?.map((target, index) => (
                    <th key={index} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {target.month}
                    </th>
                  ))}
                </tr>
              </thead>
              {/* Rest of the table content */}
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkPlanTable;
