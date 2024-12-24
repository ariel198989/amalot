import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useSalesTargets } from '@/contexts/SalesTargetsContext';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from '@/lib/supabase';
import { toast } from "react-hot-toast";

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

export const SalesProgressChart: React.FC = () => {
  const { closingRate, monthlyMeetings } = useSalesTargets();
  const [categories, setCategories] = useState<CategoryData[]>(CATEGORIES);
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
      try {
        const { data, error } = await supabase
          .from('sales_targets')
          .select('*')
          .eq('year', currentYear);

        if (error) {
          console.error('Error fetching performances:', error);
          return;
        }

        const updatedCategories = CATEGORIES.map(category => {
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
      } catch (error) {
        console.error('Error in fetchPerformances:', error);
        toast.error('שגיאה בטעינת נתונים');
      }
    };

    fetchPerformances();
  }, [closingRate, monthlyMeetings, currentYear]);

  const resetYearlyData = async () => {
    if (window.confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים השנתיים?')) {
      try {
        const { error } = await supabase
          .from('sales_targets')
          .update({ performance: 0 })
          .eq('year', currentYear);

        if (error) throw error;
        
        // Fetch fresh data after reset
        const { data: freshData, error: fetchError } = await supabase
          .from('sales_targets')
          .select('*')
          .eq('year', currentYear);

        if (fetchError) throw fetchError;

        // Update the categories with fresh data
        const updatedCategories = CATEGORIES.map(category => {
          const targets = getUpdatedTargets(category.baseAmount, category.percentage);
          const yearlyTarget = targets.reduce((sum, target) => sum + target, 0);
          
          const performances = Array(12).fill(0);
          const categoryPerformances = freshData?.filter(p => p.category === category.id) || [];
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
        toast.success("נתונים אופסו בהצלחה");
      } catch (error) {
        console.error('Error resetting data:', error);
        toast.error("שגיאה באיפוס הנתונים");
      }
    }
  };

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
      >
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3"
        >
          <span className="bg-blue-500/10 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
          מגמת ביצועים חודשית
        </motion.h3>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-inner"
        >
          <ResponsiveContainer width="100%" height={400}>
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
                'אחוז השלמה': totalTarget > 0 ? (totalPerformance / totalTarget) * 100 : 0,
                'יעד': 100
              };
            })}>
              <defs>
                <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748B"
                tick={{ fill: '#1E293B', fontSize: 14 }}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis 
                stroke="#64748B"
                domain={[0, 120]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: '#1E293B', fontSize: 14 }}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <Tooltip 
                formatter={(value: number) => `${value.toFixed(1)}%`}
                labelStyle={{ color: '#1E293B', fontWeight: 'bold' }}
                contentStyle={{ 
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="יעד"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTarget)"
                dot={false}
              />
              <Area 
                type="monotone" 
                dataKey="אחוז השלמה" 
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCompletion)"
                dot={{
                  fill: '#3B82F6',
                  stroke: 'white',
                  strokeWidth: 2,
                  r: 4
                }}
                activeDot={{
                  fill: '#3B82F6',
                  stroke: 'white',
                  strokeWidth: 2,
                  r: 6,
                  className: "animate-pulse"
                }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-slate-600">ביצוע בפועל</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-slate-600">יעד חודשי</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-center mt-8"
      >
        <Button
          variant="destructive"
          onClick={resetYearlyData}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
        >
          איפוס נתונים שנתיים
        </Button>
      </motion.div>
    </div>
  );
}; 