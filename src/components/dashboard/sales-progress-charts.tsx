import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { useSalesTargets } from '@/contexts/SalesTargetsContext';
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface Performance {
  category: string;
  month: number;
  year: number;
  performance: number;
}

interface CategoryData {
  id: string;
  title: string;
  targets: number[];
  performances: number[];
  yearlyTarget: number;
  baseAmount: number;
  percentage: number;
}

const CATEGORIES: CategoryData[] = [
  {
    id: 'risks',
    title: 'סיכונים',
    targets: [],
    performances: [],
    yearlyTarget: 0,
    baseAmount: 500,
    percentage: 100
  },
  {
    id: 'pension',
    title: 'פנסיה',
    targets: [],
    performances: [],
    yearlyTarget: 0,
    baseAmount: 400,
    percentage: 100
  },
  {
    id: 'pension-transfer',
    title: 'ניוד פנסיה',
    targets: [],
    performances: [],
    yearlyTarget: 0,
    baseAmount: 450,
    percentage: 100
  },
  {
    id: 'provident-fund',
    title: 'גמל והשתלמות',
    targets: [],
    performances: [],
    yearlyTarget: 0,
    baseAmount: 350,
    percentage: 100
  },
  {
    id: 'finance-transfer',
    title: 'ניוד פיננסי',
    targets: [],
    performances: [],
    yearlyTarget: 0,
    baseAmount: 300,
    percentage: 100
  },
  {
    id: 'regular-deposit',
    title: 'הפקדה שוטפת',
    targets: [],
    performances: [],
    yearlyTarget: 0,
    baseAmount: 350,
    percentage: 100
  },
  {
    id: 'financial-planning',
    title: 'תכנון פיננסי',
    targets: [],
    performances: [],
    yearlyTarget: 0,
    baseAmount: 200,
    percentage: 35
  },
  {
    id: 'family-economics',
    title: 'כלכלת המשפחה',
    targets: [],
    performances: [],
    yearlyTarget: 0,
    baseAmount: 150,
    percentage: 40
  },
  {
    id: 'employment',
    title: 'תעסוקה',
    targets: [],
    performances: [],
    yearlyTarget: 0,
    baseAmount: 100,
    percentage: 35
  },
  {
    id: 'business-consulting',
    title: 'ייעוץ עסקי',
    targets: [],
    performances: [],
    yearlyTarget: 0,
    baseAmount: 120,
    percentage: 35
  },
  {
    id: 'retirement',
    title: 'פרישה',
    targets: [],
    performances: [],
    yearlyTarget: 0,
    baseAmount: 180,
    percentage: 35
  },
  {
    id: 'organizational-recruitment',
    title: 'גיוס ארגונים',
    targets: [],
    performances: [],
    yearlyTarget: 0,
    baseAmount: 250,
    percentage: 35
  },
  {
    id: 'loans',
    title: 'הלוואות',
    targets: [],
    performances: [],
    yearlyTarget: 0,
    baseAmount: 200,
    percentage: 35
  }
];

const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return '0 ₪';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M ₪`;
  }
  return `₪${num.toLocaleString()}`;
};

const getStatusColor = (percentage: number): string => {
  if (percentage >= 100) return 'bg-green-500';
  if (percentage >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const SalesProgressChart: React.FC = () => {
  const { closingRate, monthlyMeetings } = useSalesTargets();
  const [categories, setCategories] = useState<CategoryData[]>(CATEGORIES);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // פונקציה לחישוב יעד חודשי
  const calculateMonthlyTarget = (baseAmount: number, percentage: number = 100) => {
    return (baseAmount * (closingRate / 100) * monthlyMeetings * (percentage / 100));
  };

  // חישוב היעדי החודשיים לפי הנוסחה
  const getUpdatedTargets = (baseAmount: number, percentage: number = 100) => {
    const monthlyDistribution = [1, 1.05, 0.7, 1.15, 1, 1.15, 0.95, 0.95, 0.85, 0.95, 1.1, 1.15];
    const baseTarget = calculateMonthlyTarget(baseAmount, percentage);
    return monthlyDistribution.map(factor => Math.round(baseTarget * factor));
  };

  useEffect(() => {
    const fetchPerformances = async () => {
      const { data, error } = await supabase
        .from('sales_targets')
        .select('*')
        .eq('year', currentYear);

      if (error) {
        console.error('Error fetching performances:', error);
        return;
      }

      const updatedCategories = categories.map(category => {
        // חישוב היעדים לקטגוריה
        const targets = getUpdatedTargets(category.baseAmount, category.percentage);
        const yearlyTarget = targets.reduce((sum, target) => sum + target, 0);
        
        // עדכון הביצועים מהדאטאבייס
        const performances = Array(12).fill(0);
        const categoryPerformances = data?.filter(p => p.category === category.id) || [];
        categoryPerformances.forEach(p => {
          if (p.month >= 1 && p.month <= 12) {
            performances[p.month - 1] = p.performance;
          }
        });

        return {
          ...category,
          targets,
          performances,
          yearlyTarget
        };
      });

      setCategories(updatedCategories);
    };

    fetchPerformances();
  }, [closingRate, monthlyMeetings]);

  const resetYearlyData = async () => {
    if (window.confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים השנתיים?')) {
      try {
        const { error } = await supabase
          .from('sales_targets')
          .update({ performance: 0 })
          .eq('year', new Date().getFullYear());

        if (error) throw error;
        
        // רענון הנתונים בממשק
        fetchPerformances();
        toast.success("נתונים אופסו בהצלחה");
      } catch (error) {
        console.error('Error resetting data:', error);
        toast.error("שגיאה באיפוס הנתונים");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category, index) => {
          const totalPerformance = category.performances.reduce((sum, p) => sum + p, 0);
          const progress = (totalPerformance / category.yearlyTarget) * 100;
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">{category.title}</h3>
              <div className="relative mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-3xl font-bold text-slate-900">{progress.toFixed(1)}%</span>
                  <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(progress)}`}>
                    {progress >= 100 ? 'הושג' : 'בתהליך'}
                  </span>
                </div>
                <Progress value={progress} className="h-3 rounded-full" />
              </div>
              <div className="text-sm text-slate-600">
                <div className="flex justify-between mb-1">
                  <span>יעד שנתי</span>
                  <span>{formatNumber(category.yearlyTarget)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ביצוע</span>
                  <span>{formatNumber(totalPerformance)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>פער</span>
                  <span className={totalPerformance >= category.yearlyTarget ? 'text-green-600' : 'text-red-600'}>
                    {formatNumber(Math.abs(category.yearlyTarget - totalPerformance))}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4">מגמת ביצועים חודשית</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={Array.from({ length: 12 }, (_, i) => {
            const monthData = categories.map(cat => ({
              category: cat.title,
              target: cat.targets[i] || 0,
              performance: cat.performances[i] || 0
            }));

            const totalTarget = monthData.reduce((sum, data) => sum + data.target, 0);
            const totalPerformance = monthData.reduce((sum, data) => sum + data.performance, 0);

            return {
              name: ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'][i],
              'אחוז השלמה': totalTarget > 0 ? (totalPerformance / totalTarget) * 100 : 0
            };
          })}>
            <defs>
              <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E293B" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#1E293B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" stroke="#64748B" />
            <YAxis stroke="#64748B" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip 
              formatter={(value: number) => `${value.toFixed(1)}%`}
              labelStyle={{ color: '#1E293B' }}
              contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="אחוז השלמה" 
              stroke="#1E293B" 
              fillOpacity={1}
              fill="url(#colorCompletion)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="flex justify-center mt-8">
        <Button
          variant="destructive"
          onClick={resetYearlyData}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md"
        >
          איפוס נתונים שנתיים
        </Button>
      </div>
    </div>
  );
}; 