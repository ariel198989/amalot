'use client'

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { ArrowUpIcon, TrendingUp, Users, DollarSign, Clock, Target, Activity, ArrowDownIcon } from 'lucide-react';
import { reportService } from '@/services/reportService';
import { toast } from 'react-hot-toast';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

interface DashboardStats {
  total: {
    commission: number;
    count: number;
    pension: { count: number; commission: number };
    insurance: { count: number; commission: number };
    investment: { count: number; commission: number };
    policy: { count: number; commission: number };
  };
  currentMonth: {
    pension?: { count: number };
    insurance?: { count: number };
    investment?: { count: number };
    policy?: { count: number };
    count?: number;
  };
  previousMonth: {
    pension?: { count: number };
    insurance?: { count: number };
    investment?: { count: number };
    policy?: { count: number };
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

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
        const dashboardStats = await reportService.fetchDashboardStats();
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

  const tileContent = ({ date: tileDate }: { date: Date }) => {
    const dateStr = tileDate.toISOString().split('T')[0];
    const eventCount = events[dateStr];
    
    return eventCount ? (
      <div className="flex items-center justify-center">
        <span className="text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5">
          {eventCount}
        </span>
      </div>
    ) : null;
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
      icon: DollarSign,
      color: 'bg-green-500',
      description: 'הכנסות מכל המוצרים'
    },
    {
      title: 'סה"כ מכירות',
      value: stats.total.count || 0,
      icon: Users,
      color: 'bg-blue-500',
      description: 'סך כל המכירות'
    },
    {
      title: 'עמלה ממוצעת',
      value: formatCurrency(stats.total.count ? stats.total.commission / stats.total.count : 0),
      icon: Activity,
      color: 'bg-orange-500',
      description: 'עמלה ממוצעת למכירה'
    },
    {
      title: 'מכירות החודש',
      value: stats.currentMonth?.count || 0,
      icon: Target,
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
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-white" dir="rtl">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-t-4 hover:scale-102" style={{ borderTopColor: kpi.color.replace('bg-', '#').replace('green-500', '#10B981').replace('blue-500', '#3B82F6').replace('orange-500', '#F97316').replace('purple-500', '#8B5CF6') }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
                <CardDescription>{kpi.description}</CardDescription>
              </div>
              <div className={`p-2 rounded-lg ${kpi.color} bg-opacity-20 transition-all duration-300 hover:bg-opacity-30`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color.replace('bg-', 'text-')}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r" 
                style={{ 
                  backgroundImage: `linear-gradient(to right, ${kpi.color.replace('bg-', '#').replace('green-500', '#10B981').replace('blue-500', '#3B82F6').replace('orange-500', '#F97316').replace('purple-500', '#8B5CF6')}, ${kpi.color.replace('bg-', '#').replace('green-500', '#059669').replace('blue-500', '#2563EB').replace('orange-500', '#EA580C').replace('purple-500', '#7C3AED')})` 
                }}>
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Calendar Card */}
        <Card className="col-span-1 hover:shadow-lg transition-all duration-300 border border-gray-200">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">לוח שנה</CardTitle>
            <CardDescription>מכירות לפי תאריך</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                modifiers={{ hasEvent: (date) => events[date.toISOString().split('T')[0]] > 0 }}
                modifiersClassNames={{
                  hasEvent: 'bg-blue-50 font-semibold hover:bg-blue-100 transition-colors duration-200'
                }}
                className="p-3"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center text-sm font-semibold text-gray-900",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 rounded-full",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                  day: "h-9 w-9 p-0 font-normal hover:bg-gray-100 rounded-full transition-colors duration-200",
                  day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white rounded-full transition-colors duration-200",
                  day_today: "bg-gray-100 font-semibold text-gray-900",
                  day_outside: "text-gray-400 opacity-50",
                  day_disabled: "text-gray-400 opacity-50",
                  day_range_middle: "aria-selected:bg-blue-50 aria-selected:text-gray-900",
                  day_hidden: "invisible"
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>הכנסות לפי מוצרים</CardTitle>
            <CardDescription>התפלגות הכנסות לפי סוגי מוצרים</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={[
                {
                  name: 'פנסיה',
                  הכנסות: stats.total.pension.commission || 0
                },
                {
                  name: 'ביטוח',
                  הכנסות: stats.total.insurance.commission || 0
                },
                {
                  name: 'השקעות',
                  הכנסות: stats.total.investment.commission || 0
                },
                {
                  name: 'פוליסות',
                  הכנסות: stats.total.policy.commission || 0
                }
              ]}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="הכנסות" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Distribution Pie Chart */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              התפלגות מכירות
            </CardTitle>
            <CardDescription>התפלגות מכירות לפי סוגי מוצרים</CardDescription>
          </CardHeader>
          <CardContent>
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
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity duration-300"
                      />
                    ))}
                  </Pie>
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    formatter={(value, entry: any) => (
                      <span className="text-sm font-medium text-gray-700">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trends Card */}
        <Card>
          <CardHeader>
            <CardTitle>מגמות חודשיות</CardTitle>
            <CardDescription>השוואה לחודש קודם</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{trend.title}</div>
                    <div className="text-sm text-gray-500">
                      {trend.current} מכירות (חודש נוכחי)
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(trend.change)}
                    <span className={`text-sm font-medium ${trend.change > 0 ? 'text-green-500' : trend.change < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      {Math.abs(trend.change).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}