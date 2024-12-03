import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Upload, RotateCcw, Plus, FileDown, FileUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkPlanData {
  year: string;
  monthlyTargets: Array<{
    month: string;
    workDays: string;
    potentialMeetings: string;
    actualMeetings: string;
    closureRate: string;
    monthlyTarget: string;
    monthlyActual: string;
    yearlyTarget: string;
    yearlyActual: string;
  }>;
  createdAt: string;
  lastModified: string;
}

interface BaseAssumption {
  meetings: { daily: number; closureRate: number };
  salesTarget: { 
    meetings: number;
    monthly: number;
    yearlyNeto: number;
    yearlyBruto: number;
    commission: number;
  };
  leadSource: {
    phoneCalls: number;
    recommendations: number;
    exhibitions: number;
    digitalMarketing: number;
    realEstate: number;
    otherAgents: number;
    branches: number;
    renewals: number;
    campaigns: number;
    others: number;
  };
}

const STORAGE_KEY_PREFIX = 'workPlanData_';

export interface WorkPlanTableProps {
  agent_id: string;
  year: number;
}

const WorkPlanTable: React.FC<WorkPlanTableProps> = ({ agent_id, year }) => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [yearlyWorkPlan, setYearlyWorkPlan] = useState<WorkPlanData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [baseAssumptions, setBaseAssumptions] = useState<BaseAssumption>({
    meetings: {
      daily: 2,
      closureRate: 43
    },
    salesTarget: {
      meetings: 150,
      monthly: 1500,
      yearlyNeto: 150000,
      yearlyBruto: 200000,
      commission: 300
    },
    leadSource: {
      phoneCalls: 35,
      recommendations: 27,
      exhibitions: 10,
      digitalMarketing: 5,
      realEstate: 7,
      otherAgents: 15,
      branches: 10,
      renewals: 20,
      campaigns: 20,
      others: 20
    }
  });

  // Load available years on mount
  useEffect(() => {
    const years = getAllSavedYears();
    setAvailableYears(years);
    
    // Load current year's data if exists, or create new
    const currentYearData = loadYearData(selectedYear);
    if (currentYearData) {
      setYearlyWorkPlan(currentYearData);
    } else {
      createNewYearPlan(selectedYear);
    }
  }, []);

  const getAllSavedYears = (): string[] => {
    const years: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        years.push(key.replace(STORAGE_KEY_PREFIX, ''));
      }
    }
    return years.sort();
  };

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
        closureRate: '',
        monthlyTarget: '',
        monthlyActual: '',
        yearlyTarget: '',
        yearlyActual: ''
      })),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setYearlyWorkPlan(newPlan);
    saveYearData(newPlan);
    
    if (!availableYears.includes(year)) {
      setAvailableYears([...availableYears, year].sort());
    }
  };

  const saveYearData = (data: WorkPlanData) => {
    try {
      data.lastModified = new Date().toISOString();
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${data.year}`, JSON.stringify(data));
      
      // Optional: Show a small toast/notification that data was saved
      showSaveNotification();
    } catch (error) {
      console.error('Failed to save data:', error);
      alert('שגיאה בשמירת הנתונים');
    }
  };

  // Add auto-save debounce
  const debouncedSave = (data: WorkPlanData) => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    
    saveTimeout.current = setTimeout(() => {
      saveYearData(data);
    }, 1000); // Save after 1 second of no changes
  };

  const handleYearChange = async (year: string) => {
    setIsLoading(true);
    setSelectedYear(year);
    
    // Add small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const yearData = loadYearData(year);
    if (yearData) {
      setYearlyWorkPlan(yearData);
    }
    
    setIsLoading(false);
  };

  const handleCreateNewYear = () => {
    const newYear = (parseInt(selectedYear) + 1).toString();
    createNewYearPlan(newYear);
    setSelectedYear(newYear);
  };

  const handleExportData = () => {
    if (!yearlyWorkPlan) return;
    
    const dataStr = JSON.stringify(yearlyWorkPlan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-plan-${yearlyWorkPlan.year}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    debouncedSave(updatedWorkPlan); // Use debounced save instead of direct save
  };

  // Add a ref for the save timeout
  const saveTimeout = React.useRef<NodeJS.Timeout>();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  // Optional: Add a small notification component
  const [showSaved, setShowSaved] = useState(false);
  
  const showSaveNotification = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const renderBaseAssumptionsTables = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Table 1: מטרות יסוד */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-navy-700 text-white p-2 rounded-t-lg font-bold text-center">
            מטרות יסוד
          </div>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="border p-2">פגישות ליום</td>
                <td className="border p-2 text-left">{baseAssumptions.meetings.daily}</td>
              </tr>
              <tr>
                <td className="border p-2">אחוז סגירה</td>
                <td className="border p-2 text-left">{baseAssumptions.meetings.closureRate}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table 2: ממוצע פעילות לפגישה */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-navy-700 text-white p-2 rounded-t-lg font-bold text-center">
            ממוצע פעילות לפגישה
          </div>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="border p-2">סיכומים</td>
                <td className="border p-2 text-left">₪ {baseAssumptions.salesTarget.meetings}</td>
              </tr>
              <tr>
                <td className="border p-2">פרמיוני</td>
                <td className="border p-2 text-left">₪ {baseAssumptions.salesTarget.monthly}</td>
              </tr>
              <tr>
                <td className="border p-2">ניוד פנסיה</td>
                <td className="border p-2 text-left">₪ {baseAssumptions.salesTarget.yearlyNeto}</td>
              </tr>
              <tr>
                <td className="border p-2">פיננסים ניוד</td>
                <td className="border p-2 text-left">₪ {baseAssumptions.salesTarget.yearlyBruto}</td>
              </tr>
              <tr>
                <td className="border p-2">משכנתא</td>
                <td className="border p-2 text-left">₪ {baseAssumptions.salesTarget.commission}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table 3: ממוצע מקורות גיוס */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-navy-700 text-white p-2 rounded-t-lg font-bold text-center">
            ממוצע מקורות גיוס
          </div>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="border p-2">תכנון טלפוני</td>
                <td className="border p-2 text-left">{baseAssumptions.leadSource.phoneCalls}%</td>
              </tr>
              <tr>
                <td className="border p-2">כלכלת המשפחה</td>
                <td className="border p-2 text-left">{baseAssumptions.leadSource.recommendations}%</td>
              </tr>
              <tr>
                <td className="border p-2">תערוכה</td>
                <td className="border p-2 text-left">{baseAssumptions.leadSource.exhibitions}%</td>
              </tr>
              <tr>
                <td className="border p-2">שיווק דיגיטלי</td>
                <td className="border p-2 text-left">{baseAssumptions.leadSource.digitalMarketing}%</td>
              </tr>
              <tr>
                <td className="border p-2">נדל"ן</td>
                <td className="border p-2 text-left">{baseAssumptions.leadSource.realEstate}%</td>
              </tr>
              <tr>
                <td className="border p-2">גיוס אחרים</td>
                <td className="border p-2 text-left">{baseAssumptions.leadSource.otherAgents}%</td>
              </tr>
              <tr>
                <td className="border p-2">משכנתא</td>
                <td className="border p-2 text-left">{baseAssumptions.leadSource.branches}%</td>
              </tr>
              <tr>
                <td className="border p-2">חידושי</td>
                <td className="border p-2 text-left">{baseAssumptions.leadSource.renewals}%</td>
              </tr>
              <tr>
                <td className="border p-2">הלוואות</td>
                <td className="border p-2 text-left">{baseAssumptions.leadSource.campaigns}%</td>
              </tr>
              <tr>
                <td className="border p-2">אחרים</td>
                <td className="border p-2 text-left">{baseAssumptions.leadSource.others}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderBaseAssumptionsTables()}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select 
            value={selectedYear} 
            onValueChange={handleYearChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="בחר שנה" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleCreateNewYear} 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4" />
            שנה חדשה
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleExportData} 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <FileDown className="w-4 h-4" />
            ייצוא
          </Button>
          <Button 
            onClick={() => saveYearData(yearlyWorkPlan!)} 
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <Save className="w-4 h-4" />
            שמור
          </Button>
        </div>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-2 text-right">שנתי</th>
                {yearlyWorkPlan?.monthlyTargets.map(month => (
                  <th key={month.month} className="border p-2 text-right">{month.month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Work Days Row */}
              <tr>
                <td className="border p-2 font-bold">ימי עבודה בחודש</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="border p-2">
                    <Input
                      type="number"
                      value={month.workDays}
                      onChange={(e) => handleInputChange(idx, 'workDays', e.target.value)}
                      className="w-full text-right"
                      min="0"
                      max="31"
                    />
                  </td>
                ))}
              </tr>

              {/* Potential Meetings Row */}
              <tr>
                <td className="border p-2 font-bold">פוטנציאל פגישות ביום</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="border p-2">
                    <Input
                      type="number"
                      value={month.potentialMeetings}
                      onChange={(e) => handleInputChange(idx, 'potentialMeetings', e.target.value)}
                      className="w-full text-right"
                    />
                  </td>
                ))}
              </tr>

              {/* Monthly Sections */}
              <tr className="bg-blue-50">
                <td colSpan={13} className="border p-2 font-bold">סיכומים</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold">יעד</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="border p-2">
                    {Number(month.workDays || 0) * Number(month.potentialMeetings || 0)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border p-2 font-bold">ביצוע</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => (
                  <td key={idx} className="border p-2">
                    <Input
                      type="number"
                      value={month.actualMeetings}
                      onChange={(e) => handleInputChange(idx, 'actualMeetings', e.target.value)}
                      className="w-full text-right"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border p-2 font-bold">אחוז ביצוע</td>
                {yearlyWorkPlan?.monthlyTargets.map((month, idx) => {
                  const target = Number(month.workDays || 0) * Number(month.potentialMeetings || 0);
                  const actual = Number(month.actualMeetings || 0);
                  const percentage = target ? ((actual / target) * 100).toFixed(1) : '0';
                  return (
                    <td key={idx} className="border p-2">{percentage}%</td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {showSaved && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md">
          הנתונים נשמרו בהצלחה
        </div>
      )}
    </div>
  );
};

export default WorkPlanTable;
