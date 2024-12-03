import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

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
  rate: string;
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
        targets: monthNames.map(() => ({
          target: '',
          achieved: '',
          rate: ''
        }))
      },
      pension: {
        monthlyTarget: '',
        unitValue: '',
        targets: monthNames.map(() => ({
          target: '',
          achieved: '',
          rate: ''
        }))
      },
      finance: {
        monthlyTarget: '',
        unitValue: '',
        targets: monthNames.map(() => ({
          target: '',
          achieved: '',
          rate: ''
        }))
      },
      providentFund: {
        monthlyTarget: '',
        unitValue: '',
        targets: monthNames.map(() => ({
          target: '',
          achieved: '',
          rate: ''
        }))
      }
    }
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

  const handleProductInputChange = (product: keyof Products, field: keyof Product, value: string) => {
    setYearlyTargets(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [product]: {
          ...prev.products[product],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleTargetInputChange = (product: keyof Products, monthIndex: number, field: keyof ProductTarget, value: string) => {
    setYearlyTargets(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [product]: {
          ...prev.products[product],
          targets: prev.products[product].targets.map((target, idx) =>
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {/* מטרות יסוד */}
        <Card>
          <div className="bg-[#1e3a8a] text-white p-2 text-center font-bold rounded-t-lg">
            מטרות יסוד
          </div>
          <div className="p-4">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2">פגישות ליום</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyTargets.meetingsPerDay}
                      onChange={(e) => handleBasicInputChange('meetingsPerDay', e.target.value)}
                      className="w-24 text-left"
                      min="0"
                      max="10"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-2">אחוז סגירה</td>
                  <td className="py-2">
                    <Input
                      type="number"
                      value={yearlyTargets.closureRate}
                      onChange={(e) => handleBasicInputChange('closureRate', e.target.value)}
                      className="w-24 text-left"
                      min="0"
                      max="100"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* ממוצע פעילות לפגישה */}
        <Card>
          <div className="bg-[#1e3a8a] text-white p-2 text-center font-bold rounded-t-lg">
            ממוצע פעילות לפגישה
          </div>
          <div className="p-4">
            <table className="w-full">
              <tbody>
                {Object.entries({
                  'סיכונים': 'insurance',
                  'פרמיוני': 'premium',
                  'ניוד פנסיה': 'pensionTransfer',
                  'פיננסים ניוד': 'financeTransfer',
                  'משכנתא': 'mortgage'
                }).map(([label, key]) => (
                  <tr key={key}>
                    <td className="py-2">{label}</td>
                    <td className="py-2">
                      <Input
                        type="number"
                        value={yearlyTargets.activityAverages[key]}
                        onChange={(e) => handleActivityChange(key, e.target.value)}
                        className="w-32 text-left"
                        min="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ממוצע מקורות גיוס */}
        <Card>
          <div className="bg-[#1e3a8a] text-white p-2 text-center font-bold rounded-t-lg">
            ממוצע מקורות גיוס
          </div>
          <div className="p-4">
            <table className="w-full">
              <tbody>
                {Object.entries({
                  'תכנון טלפוני': 'phonePlanning',
                  'כלכלת המשפחה': 'familyEconomics',
                  'תערוכה': 'exhibition',
                  'שיווק דיגיטלי': 'digitalMarketing',
                  'נדל״ן': 'realEstate',
                  'גיוס אחרים': 'otherRecruitment',
                  'משכנתא': 'mortgage',
                  'חידושים': 'renewals',
                  'הלוואות': 'loans',
                  'אחרים': 'others'
                }).map(([label, key]) => (
                  <tr key={key}>
                    <td className="py-2">{label}</td>
                    <td className="py-2">
                      <Input
                        type="number"
                        value={yearlyTargets.recruitmentSources[key]}
                        onChange={(e) => handleRecruitmentChange(key, e.target.value)}
                        className="w-24 text-left"
                        min="0"
                        max="100"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(yearlyTargets.products).map(([key, product]) => {
          const colors = {
            insurance: { bg: 'bg-blue-50', text: 'text-blue-900', value: 'text-blue-700', sub: 'text-blue-600' },
            pension: { bg: 'bg-emerald-50', text: 'text-emerald-900', value: 'text-emerald-700', sub: 'text-emerald-600' },
            finance: { bg: 'bg-purple-50', text: 'text-purple-900', value: 'text-purple-700', sub: 'text-purple-600' },
            providentFund: { bg: 'bg-amber-50', text: 'text-amber-900', value: 'text-amber-700', sub: 'text-amber-600' }
          };
          const color = colors[key];
          const titles = {
            insurance: 'ביטוחים',
            pension: 'ניוד פנסיה',
            finance: 'ניוד פיננסים',
            providentFund: 'גמל והשתלמות'
          };

          return (
            <div key={key} className={`${color.bg} rounded-lg p-4`}>
              <h3 className={`text-sm font-semibold mb-2 ${color.text}`}>{titles[key]}</h3>
              <div className="space-y-2">
                <Input
                  type="number"
                  value={product.monthlyTarget}
                  onChange={(e) => handleProductInputChange(key, 'monthlyTarget', e.target.value)}
                  className="w-full text-right"
                  min="0"
                  placeholder="יעד חודשי"
                />
                <Input
                  type="number"
                  value={product.unitValue}
                  onChange={(e) => handleProductInputChange(key, 'unitValue', e.target.value)}
                  className="w-full text-right"
                  min="0"
                  placeholder="ערך יחידה"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-200 p-2 text-right">חודש</th>
              <th className="border border-slate-200 p-2 text-right">ביטוחים</th>
              <th className="border border-slate-200 p-2 text-right">ניוד פנסיה</th>
              <th className="border border-slate-200 p-2 text-right">ניוד פיננסים</th>
              <th className="border border-slate-200 p-2 text-right">גמל והשתלמות</th>
              <th className="border border-slate-200 p-2 text-right">סה״כ</th>
            </tr>
          </thead>
          <tbody>
            {monthNames.map((month, monthIndex) => (
              <tr key={monthIndex} className="hover:bg-slate-50">
                <td className="border border-slate-200 p-2">{month}</td>
                {Object.entries(yearlyTargets.products).map(([productKey, product]) => (
                  <td key={productKey} className="border border-slate-200 p-2">
                    <Input
                      type="number"
                      value={product.targets[monthIndex].target}
                      onChange={(e) => handleTargetInputChange(productKey, monthIndex, 'target', e.target.value)}
                      className="w-full text-right"
                      min="0"
                    />
                  </td>
                ))}
                <td className="border border-slate-200 p-2 font-bold">
                  ₪{Object.values(yearlyTargets.products).reduce((acc, product) => 
                    acc + (Number(product.targets[monthIndex].target) || 0), 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasChanges && (
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-slate-800 hover:bg-slate-700"
          >
            {isLoading ? "שומר..." : "שמור שינויים"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SalesTargetsSystem;
