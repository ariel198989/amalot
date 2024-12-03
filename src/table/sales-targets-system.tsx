import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface ProductTarget {
  target: string;
  achieved: string;
}

interface Product {
  monthlyTarget: string;
  unitValue: string;
  targets: ProductTarget[];
}

interface Products {
  insurance: Product;
  pension: Product;
  finance: Product;
  providentFund: Product;
}

interface YearlyTargets {
  workingDays: string;
  meetingsPerDay: string;
  totalMeetings: string;
  closureRate: string;
  activityAverages: ActivityAverages;
  recruitmentSources: RecruitmentSources;
  products: Products;
}

interface MonthlyData {
  workDays: number;
  potentialMeetings: number;
  percentage: number;
  execution: number;
}

export interface SalesTargetsSystemProps {
  agent_id: string;
  year: number;
}

const SalesTargetsSystem: React.FC<SalesTargetsSystemProps> = ({ agent_id, year }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const monthNames = [
    'ינואר 24׳', 'פברואר 24׳', 'מרץ 24׳', 'אפריל 24׳', 'מאי 24׳', 'יוני 24׳',
    'יולי 24׳', 'אוגוסט 24׳', 'ספטמבר 24׳', 'אוקטובר 24׳', 'נובמבר 24׳', 'דצמבר 24׳'
  ];

  const [yearlyTargets, setYearlyTargets] = useState<YearlyTargets>({
    workingDays: '',
    meetingsPerDay: '2',
    totalMeetings: '',
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
    },
    products: {
      insurance: {
        monthlyTarget: '',
        unitValue: '',
        targets: Array(12).fill({ target: '', achieved: '' })
      },
      pension: {
        monthlyTarget: '',
        unitValue: '',
        targets: Array(12).fill({ target: '', achieved: '' })
      },
      finance: {
        monthlyTarget: '',
        unitValue: '',
        targets: Array(12).fill({ target: '', achieved: '' })
      },
      providentFund: {
        monthlyTarget: '',
        unitValue: '',
        targets: Array(12).fill({ target: '', achieved: '' })
      }
    }
  });

  const [monthlyData, setMonthlyData] = useState<{ [key: string]: MonthlyData }>({
    'ינואר 24׳': { workDays: 22, potentialMeetings: 44, percentage: 9.6, execution: 0 },
    'פברואר 24׳': { workDays: 21, potentialMeetings: 42, percentage: 9.2, execution: 0 },
    'מרץ 24׳': { workDays: 18, potentialMeetings: 36, percentage: 7.9, execution: 0 },
    'אפריל 24׳': { workDays: 16, potentialMeetings: 32, percentage: 7.0, execution: 0 },
    'מאי 24׳': { workDays: 18, potentialMeetings: 36, percentage: 7.9, execution: 0 },
    'יוני 24׳': { workDays: 18, potentialMeetings: 36, percentage: 7.9, execution: 0 },
    'יולי 24׳': { workDays: 22, potentialMeetings: 44, percentage: 9.6, execution: 0 },
    'אוגוסט 24׳': { workDays: 19, potentialMeetings: 38, percentage: 8.3, execution: 0 },
    'ספטמבר 24׳': { workDays: 22, potentialMeetings: 44, percentage: 9.6, execution: 0 },
    'אוקטובר 24׳': { workDays: 13, potentialMeetings: 26, percentage: 5.7, execution: 0 },
    'נובמבר 24׳': { workDays: 20, potentialMeetings: 40, percentage: 8.8, execution: 0 },
    'דצמבר 24׳': { workDays: 19, potentialMeetings: 38, percentage: 8.3, execution: 0 }
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!agent_id || !year) return;

      setIsLoading(true);
      try {
        const productTypes = ['insurance', 'pension', 'finance', 'providentFund'];
        
        // בדיקה אם יש נתונים קיימים
        const { data: existingData, error: fetchError } = await supabase
          .from('annual_sales_targets')
          .select('*')
          .eq('agent_id', agent_id)
          .eq('year', year)
          .order('month', { ascending: true });

        if (fetchError) throw fetchError;

        if (!existingData || existingData.length === 0) {
          // יצירת רשומות לכל חודש וכל סוג מוצר
          const records = [];
          for (let month = 1; month <= 12; month++) {
            for (const productType of productTypes) {
              records.push({
                agent_id,
                year,
                month,
                product_type: productType,
                working_days: 0,
                meetings_per_day: 2,
                total_meetings: 0,
                closure_rate: 43,
                activity_averages: {
                  insurance: '150',
                  premium: '1500',
                  pensionTransfer: '150000',
                  financeTransfer: '200000',
                  mortgage: '300'
                },
                recruitment_sources: {
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
              });
            }
          }

          const { error: insertError } = await supabase
            .from('annual_sales_targets')
            .insert(records);

          if (insertError) throw insertError;
          
          setYearlyTargets(prev => ({
            ...prev,
            workingDays: '0',
            meetingsPerDay: '2',
            totalMeetings: '0',
            closureRate: '43'
          }));
        } else {
          // שימוש בנתוני החודש הראשון עבור הגדרות כלליות
          const firstMonth = existingData[0];
          setYearlyTargets(prev => ({
            ...prev,
            workingDays: firstMonth.working_days?.toString() || prev.workingDays,
            meetingsPerDay: firstMonth.meetings_per_day?.toString() || prev.meetingsPerDay,
            totalMeetings: firstMonth.total_meetings?.toString() || prev.totalMeetings,
            closureRate: firstMonth.closure_rate?.toString() || prev.closureRate,
            activityAverages: firstMonth.activity_averages || prev.activityAverages,
            recruitmentSources: firstMonth.recruitment_sources || prev.recruitmentSources,
            products: firstMonth.products || prev.products
          }));
        }
      } catch (error) {
        console.error('שגיאה בטעינת נתונים:', error);
        toast.error('שגיאה בטעינת הנתונים');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [agent_id, year]);

  const handleBasicInputChange = (field: keyof YearlyTargets, value: string) => {
    setYearlyTargets(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleActivityChange = (field: keyof ActivityAverages, value: string) => {
    setYearlyTargets(prev => ({
      ...prev,
      activityAverages: {
        ...prev.activityAverages,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleRecruitmentChange = (field: keyof RecruitmentSources, value: string) => {
    setYearlyTargets(prev => ({
      ...prev,
      recruitmentSources: {
        ...prev.recruitmentSources,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleProductInputChange = (
    productType: keyof Products,
    monthIndex: number,
    field: keyof ProductTarget,
    value: string
  ) => {
    setYearlyTargets(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [productType]: {
          ...prev.products[productType],
          targets: prev.products[productType].targets.map((target, idx) =>
            idx === monthIndex ? { ...target, [field]: value } : target
          )
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('annual_sales_targets')
        .upsert({
          agent_id,
          year,
          working_days: yearlyTargets.workingDays,
          meetings_per_day: yearlyTargets.meetingsPerDay,
          total_meetings: yearlyTargets.totalMeetings,
          closure_rate: yearlyTargets.closureRate,
          activity_averages: yearlyTargets.activityAverages,
          recruitment_sources: yearlyTargets.recruitmentSources,
          products: yearlyTargets.products
        }, {
          onConflict: 'agent_id,year'
        });

      if (error) throw error;

      toast.success("היעדים נשמרו בהצלחה");
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving targets:', error);
      toast.error("שגיאה בשמירת הנתונים");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthlyDataChange = (month: string, field: keyof MonthlyData, value: number) => {
    setMonthlyData(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Three columns section */}
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
                      value={yearlyTargets.workingDays}
                      onChange={(e) => handleBasicInputChange('workingDays', e.target.value)}
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
                      value={yearlyTargets.meetingsPerDay}
                      onChange={(e) => handleBasicInputChange('meetingsPerDay', e.target.value)}
                      className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="10"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-700 font-medium">אחוז סגירה</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyTargets.closureRate}
                      onChange={(e) => handleBasicInputChange('closureRate', e.target.value)}
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
                      value={yearlyTargets.activityAverages.insurance}
                      onChange={(e) => handleActivityChange('insurance', e.target.value)}
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
                      value={yearlyTargets.activityAverages.premium}
                      onChange={(e) => handleActivityChange('premium', e.target.value)}
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
                      value={yearlyTargets.activityAverages.pensionTransfer}
                      onChange={(e) => handleActivityChange('pensionTransfer', e.target.value)}
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
                      value={yearlyTargets.activityAverages.financeTransfer}
                      onChange={(e) => handleActivityChange('financeTransfer', e.target.value)}
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
                      value={yearlyTargets.activityAverages.mortgage}
                      onChange={(e) => handleActivityChange('mortgage', e.target.value)}
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
                      value={yearlyTargets.recruitmentSources.phonePlanning}
                      onChange={(e) => handleRecruitmentChange('phonePlanning', e.target.value)}
                      className="w-20 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
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
                      value={yearlyTargets.recruitmentSources.familyEconomics}
                      onChange={(e) => handleRecruitmentChange('familyEconomics', e.target.value)}
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
                      value={yearlyTargets.recruitmentSources.exhibition}
                      onChange={(e) => handleRecruitmentChange('exhibition', e.target.value)}
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
                      value={yearlyTargets.recruitmentSources.digitalMarketing}
                      onChange={(e) => handleRecruitmentChange('digitalMarketing', e.target.value)}
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
                      value={yearlyTargets.recruitmentSources.realEstate}
                      onChange={(e) => handleRecruitmentChange('realEstate', e.target.value)}
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
                      value={yearlyTargets.recruitmentSources.otherRecruitment}
                      onChange={(e) => handleRecruitmentChange('otherRecruitment', e.target.value)}
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
                      value={yearlyTargets.recruitmentSources.mortgage}
                      onChange={(e) => handleRecruitmentChange('mortgage', e.target.value)}
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
                      value={yearlyTargets.recruitmentSources.renewals}
                      onChange={(e) => handleRecruitmentChange('renewals', e.target.value)}
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
                      value={yearlyTargets.recruitmentSources.loans}
                      onChange={(e) => handleRecruitmentChange('loans', e.target.value)}
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
                      value={yearlyTargets.recruitmentSources.others}
                      onChange={(e) => handleRecruitmentChange('others', e.target.value)}
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

      {/* Monthly Table with blue headers */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 text-right font-medium min-w-[180px]">
                  נתונים
                </th>
                {Object.keys(monthlyData).map(month => (
                  <th 
                    key={month}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 text-right font-medium min-w-[100px]"
                  >
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* ... existing monthly table rows ... */}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Results Table */}
      <Card className="shadow-md">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 text-center font-medium rounded-t-lg">
          תוצאות חודשיות
        </div>
        <div className="p-4">
          <Tabs defaultValue="insurance" className="w-full">
            <TabsList className="grid grid-cols-4 gap-2 bg-slate-100 p-1 rounded-lg mb-4">
              {Object.entries({
                insurance: 'ביטוחים',
                pension: 'ניוד פנסיה',
                finance: 'ניוד פיננסים',
                providentFund: 'משכנתא'
              }).map(([key, label]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.keys(yearlyTargets.products).map((productType) => (
              <TabsContent key={productType} value={productType}>
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="py-2 px-3 text-right font-medium text-slate-700">חודש</th>
                      <th className="py-2 px-3 text-right font-medium text-slate-700">יעד</th>
                      <th className="py-2 px-3 text-right font-medium text-slate-700">ביצוע</th>
                      <th className="py-2 px-3 text-right font-medium text-slate-700">אחוז עמידה</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthNames.map((month, index) => (
                      <tr key={month} className="hover:bg-slate-50">
                        <td className="py-2 px-3">{month}</td>
                        <td className="py-2 px-3">
                          <Input
                            type="number"
                            value={yearlyTargets.products[productType as keyof Products].targets[index].target}
                            onChange={(e) => handleProductInputChange(productType as keyof Products, index, 'target', e.target.value)}
                            className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <Input
                            type="number"
                            value={yearlyTargets.products[productType as keyof Products].targets[index].achieved}
                            onChange={(e) => handleProductInputChange(productType as keyof Products, index, 'achieved', e.target.value)}
                            className="w-24 h-8 text-left text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {calculatePercentage(
                            yearlyTargets.products[productType as keyof Products].targets[index].achieved,
                            yearlyTargets.products[productType as keyof Products].targets[index].target
                          )}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-medium">
                    <tr>
                      <td className="py-2 px-3">סה"כ</td>
                      <td className="py-2 px-3">
                        {calculateTotal(yearlyTargets.products[productType as keyof Products].targets, 'target')}
                      </td>
                      <td className="py-2 px-3">
                        {calculateTotal(yearlyTargets.products[productType as keyof Products].targets, 'achieved')}
                      </td>
                      <td className="py-2 px-3">
                        {calculatePercentage(
                          calculateTotal(yearlyTargets.products[productType as keyof Products].targets, 'achieved'),
                          calculateTotal(yearlyTargets.products[productType as keyof Products].targets, 'target')
                        )}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button
          onClick={handleSave}
          disabled={isLoading || !hasChanges}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 text-sm px-6 py-2 rounded-md shadow-sm hover:shadow transition-all duration-200"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> שומר...
            </span>
          ) : (
            'שמור שינויים'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SalesTargetsSystem;

// Helper functions
const calculatePercentage = (achieved: string | number = '0', target: string | number = '0') => {
  const achievedNum = Number(achieved);
  const targetNum = Number(target);
  if (targetNum === 0) return 0;
  return Math.round((achievedNum / targetNum) * 100);
};

const calculateTotal = (targets: any[], field: string) => {
  return targets.reduce((sum, target) => sum + Number(target?.[field] || 0), 0);
};
