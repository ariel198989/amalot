'use client'

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ArrowUpIcon, TrendingUp, Users, DollarSign, Clock, Target, Activity, ArrowDownIcon } from 'lucide-react';
import { reportService } from '@/services/reportService';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

export default function ModernAnalyticsDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<{ [key: string]: number }>({});
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const eventCount = events[dateStr];
      
      return eventCount ? (
        <div className="event-dot">
          <span className="text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5">
            {eventCount}
          </span>
        </div>
      ) : null;
    }
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

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

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
    <div className="p-6 space-y-6" dir="rtl">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
                <CardDescription>{kpi.description}</CardDescription>
              </div>
              <div className={`p-2 rounded-lg ${kpi.color} bg-opacity-10`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color.replace('bg-', 'text-')}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Calendar Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>לוח שנה</CardTitle>
            <CardDescription>מכירות לפי תאריך</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              locale="he-IL"
              tileContent={tileContent}
              className="react-calendar"
            />
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
        <Card>
          <CardHeader>
            <CardTitle>התפלגות מכירות</CardTitle>
            <CardDescription>התפלגות מכירות לפי סוגי מוצרים</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toString()} />
                  <Legend />
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