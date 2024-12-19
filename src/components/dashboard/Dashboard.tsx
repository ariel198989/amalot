'use client'

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { 
  ArrowUpIcon, 
  BadgeDollarSign,
  CircleDollarSign,
  ArrowDownIcon,
  BarChart4,
  HandCoins
} from 'lucide-react';
import { reportService, DashboardStats } from '@/services/reportService';
import { toast } from 'react-hot-toast';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

export default function ModernAnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const rawStats = await reportService.fetchDashboardStats();
        
        // Create a type-safe object with all required properties
        const dashboardStats: DashboardStats = {
          total: {
            commission: rawStats.total.commission,
            count: rawStats.total.count,
            pension: rawStats.total.pension,
            insurance: rawStats.total.insurance,
            investment: rawStats.total.investment,
            policy: rawStats.total.policy
          },
          currentMonth: rawStats.currentMonth || {
            pension: { count: 0 },
            insurance: { count: 0 },
            investment: { count: 0 },
            policy: { count: 0 },
            count: 0
          },
          previousMonth: rawStats.previousMonth || {
            pension: { count: 0 },
            insurance: { count: 0 },
            investment: { count: 0 },
            policy: { count: 0 }
          }
        };
        
        setStats(dashboardStats);

        // Get all sales from the service
        const { pensionSales, insuranceSales, investmentSales, policySales } = await reportService.fetchAllSales();
        
        // Combine all sales
        const allSales = [
          ...pensionSales,
          ...insuranceSales,
          ...investmentSales,
          ...policySales
        ];

        // Group by date
        const dateEvents = allSales.reduce((acc: { [key: string]: number }, sale: any) => {
          if (sale?.created_at) {
            const date = new Date(sale.created_at).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
          }
          return acc;
        }, {});
        
        setEvents(dateEvents);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('שגיאה בטעינת נתוני הדשבורד');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDateChange = (value: Date | undefined) => {
    setDate(value);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading || !stats) {
    return <div>טוען...</div>;
  }

  const kpiData = [
    {
      title: 'סה"כ הכנסות',
      value: formatCurrency(stats.total.commission || 0),
      icon: BadgeDollarSign,
      color: 'bg-green-500',
      description: 'הכנסות מכל המוצרים'
    },
    {
      title: 'סה"כ מכירות',
      value: stats.total.count || 0,
      icon: HandCoins,
      color: 'bg-blue-500',
      description: 'סך כל המכירות'
    },
    {
      title: 'עמלה ממוצעת',
      value: formatCurrency(stats.total.count ? stats.total.commission / stats.total.count : 0),
      icon: CircleDollarSign,
      color: 'bg-orange-500',
      description: 'עמלה ממוצעת למכירה'
    },
    {
      title: 'מכירות החודש',
      value: stats.currentMonth?.count || 0,
      icon: BarChart4,
      color: 'bg-purple-500',
      description: 'מכירות בחודש הנוכחי'
    }
  ];

  const pieData = [
    { name: 'פנסיה', value: stats.total.pension.count || 0 },
    { name: 'ביטוח', value: stats.total.insurance.count || 0 },
    { name: 'השקעות', value: stats.total.investment.count || 0 },
    { name: 'פוליסות', value: stats.total.policy.count || 0 }
  ];

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpIcon className="w-4 h-4 text-green-500" />;
    if (value < 0) return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
    return null;
  };

  const trends = [
    {
      title: 'פנסיה',
      current: stats.currentMonth?.pension?.count || 0,
      previous: stats.previousMonth?.pension?.count || 0,
      change: ((stats.currentMonth?.pension?.count || 0) - (stats.previousMonth?.pension?.count || 0)) / (stats.previousMonth?.pension?.count || 1) * 100
    },
    {
      title: 'ביטוח',
      current: stats.currentMonth?.insurance?.count || 0,
      previous: stats.previousMonth?.insurance?.count || 0,
      change: ((stats.currentMonth?.insurance?.count || 0) - (stats.previousMonth?.insurance?.count || 0)) / (stats.previousMonth?.insurance?.count || 1) * 100
    },
    {
      title: 'השקעות',
      current: stats.currentMonth?.investment?.count || 0,
      previous: stats.previousMonth?.investment?.count || 0,
      change: ((stats.currentMonth?.investment?.count || 0) - (stats.previousMonth?.investment?.count || 0)) / (stats.previousMonth?.investment?.count || 1) * 100
    },
    {
      title: 'פוליסות',
      current: stats.currentMonth?.policy?.count || 0,
      previous: stats.previousMonth?.policy?.count || 0,
      change: ((stats.currentMonth?.policy?.count || 0) - (stats.previousMonth?.policy?.count || 0)) / (stats.previousMonth?.policy?.count || 1) * 100
    }
  ];

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-secondary-50 to-white" dir="rtl">
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card 
              className={cn(
                "overflow-hidden transition-all duration-300",
                "hover:shadow-lg hover:shadow-primary-100/50",
                "border-t-4 hover:-translate-y-1"
              )} 
              style={{ 
                borderTopColor: kpi.color
                  .replace('bg-', '#')
                  .replace('green-500', '#0ea5e9')
                  .replace('blue-500', '#0ea5e9')
                  .replace('orange-500', '#0ea5e9')
                  .replace('purple-500', '#0ea5e9') 
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <motion.div 
                  className="space-y-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <CardTitle className="text-sm font-medium text-secondary-600">{kpi.title}</CardTitle>
                  <CardDescription className="text-secondary-500">{kpi.description}</CardDescription>
                </motion.div>
                <motion.div 
                  className={cn(
                    "p-2 rounded-lg transition-all duration-300",
                    "bg-primary-100 text-primary-600"
                  )}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <kpi.icon className="h-5 w-5" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="text-2xl font-bold text-primary-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1 + index * 0.1 
                  }}
                >
                  {kpi.value}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Calendar Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="col-span-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50">
            <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-primary-100/50">
              <CardTitle className="text-lg font-semibold text-primary-600">לוח שנה</CardTitle>
              <CardDescription className="text-secondary-500">מכירות לפי תאריך</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="rounded-lg border border-secondary-200 overflow-hidden">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  modifiers={{ hasEvent: (date) => events[date.toISOString().split('T')[0]] > 0 }}
                  modifiersClassNames={{
                    hasEvent: 'bg-primary-50 font-semibold hover:bg-primary-100 transition-colors duration-200'
                  }}
                  className="p-3"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center text-secondary-600 font-semibold",
                    caption_label: "text-sm",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                      "hover:bg-primary-50 rounded-lg text-primary-600"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-secondary-500 rounded-md w-8 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: cn(
                      "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-primary-50",
                      "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                    ),
                    day: cn(
                      "h-8 w-8 p-0 font-normal aria-selected:opacity-100 transition-colors",
                      "hover:bg-primary-100 hover:text-primary-600 rounded-lg"
                    ),
                    day_range_end: "day-range-end",
                    day_selected: "bg-primary-600 text-white hover:bg-primary-600 hover:text-white focus:bg-primary-600 focus:text-white",
                    day_today: "bg-secondary-100 text-secondary-900",
                    day_outside: "text-secondary-400 opacity-50",
                    day_disabled: "text-secondary-400 opacity-50",
                    day_range_middle: "aria-selected:bg-primary-50 aria-selected:text-primary-600",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trends Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="col-span-1 lg:col-span-2"
        >
          <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50">
            <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-primary-100/50">
              <CardTitle className="text-lg font-semibold text-primary-600">מגמות מכירה</CardTitle>
              <CardDescription className="text-secondary-500">השוואה בין החודש הנוכחי לקודם</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {trends.map((trend, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary-50 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-secondary-900">{trend.title}</div>
                      <div className="text-sm text-secondary-500">
                        {trend.current} מכירות החודש
                      </div>
                    </div>
                    <motion.div 
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.1 }}
                    >
                      {getTrendIcon(trend.change)}
                      <span className={cn(
                        "text-sm font-medium",
                        trend.change > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {Math.abs(trend.change).toFixed(1)}%
                      </span>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Distribution Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="col-span-1 lg:col-span-3"
        >
          <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50">
            <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-primary-100/50">
              <CardTitle className="text-lg font-semibold text-primary-600">התפלגות מכירות</CardTitle>
              <CardDescription className="text-secondary-500">התפלגות המכירות לפי סוג מוצר</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={CustomPieLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(${200 + index * 30}, 84%, ${60 - index * 10}%)`}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}